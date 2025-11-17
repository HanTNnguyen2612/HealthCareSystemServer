using BusinessObjects.DataTransferObjects.AI;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Services.Interface;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http.Json;
using HealthCareSystemAPI.Mapper;
using System.Net; // Cần thiết cho HttpStatusCode

namespace HealthCareSystem.Controllers
{
    [Route("api/chatbox")]
    [ApiController]
    public class AIChatBoxController : ControllerBase
    {
        private readonly IAiConversationService _aiConversationService;
        private readonly IAiMessageService _aiMessageService;
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly OpenAIOptions _option;

        public AIChatBoxController(IAiConversationService aiConversationService, IAiMessageService aiMessageService, IOptions<OpenAIOptions> option, IHttpClientFactory httpClientFactory, IDoctorService doctorService, ISpecialtyService specialtyService)
        {
            _aiConversationService = aiConversationService;
            _aiMessageService = aiMessageService;
            _option = option.Value;
            _httpClientFactory = httpClientFactory;
            _doctorService = doctorService;
            _specialtyService = specialtyService;
        }

        // --- DTOs cho API Gemini (Payload và Response Chat Thường) ---

        public record Part(
            [property: JsonPropertyName("text")] string Text
        );

        public record Content(
            [property: JsonPropertyName("role")] string Role, // "user" hoặc "model"
            [property: JsonPropertyName("parts")] List<Part> Parts
        );

        public record SystemInstruction(
            [property: JsonPropertyName("parts")] List<Part> Parts
        );

        public record GeminiRequest(
            [property: JsonPropertyName("systemInstruction")] SystemInstruction SystemInstruction,
            [property: JsonPropertyName("contents")] List<Content> Contents,
            [property: JsonPropertyName("generationConfig")] GenerationConfig? GenerationConfig = null
        );

        public record CandidateContent(
            [property: JsonPropertyName("parts")] List<Part> Parts,
            [property: JsonPropertyName("role")] string Role
        );

        public record Candidate(
            [property: JsonPropertyName("content")] CandidateContent Content
        );

        public record GeminiResponse(
            [property: JsonPropertyName("candidates")] List<Candidate> Candidates
        );

        // --- DTOs cho Structured Output (Dịch thuật chuyên khoa) ---

        // Định nghĩa Schema JSON mong muốn
        public record Property(
            [property: JsonPropertyName("type")] string Type,
            [property: JsonPropertyName("description")] string Description
        );

        public record ResponseSchema(
            [property: JsonPropertyName("type")] string Type,
            [property: JsonPropertyName("properties")] Dictionary<string, Property> Properties
        );

        public record GenerationConfig(
            [property: JsonPropertyName("responseMimeType")] string ResponseMimeType,
            [property: JsonPropertyName("responseSchema")] ResponseSchema ResponseSchema
        );

        // Cấu trúc DTO để Deserialize kết quả dịch thuật
        public record SpecialtyDetectionResponse(
            [property: JsonPropertyName("englishSpecialty")] string EnglishSpecialty
        );

        // --- Kết thúc DTOs ---

        /// <summary>
        /// Thực hiện hành động HTTP với cơ chế Thử lại Lùi lũy thừa (Exponential Backoff) cho các lỗi tạm thời (503, 429).
        /// </summary>
        private async Task<HttpResponseMessage?> ExecuteWithRetry(Func<Task<HttpResponseMessage>> action)
        {
            const int MaxRetries = 3;
            int delay = 1000; // Bắt đầu chờ 1 giây

            for (int attempt = 0; attempt < MaxRetries; attempt++)
            {
                try
                {
                    var response = await action();

                    if (response.IsSuccessStatusCode)
                    {
                        return response;
                    }

                    // Xử lý các lỗi tạm thời (503 Service Unavailable, 429 Too Many Requests)
                    if (response.StatusCode == HttpStatusCode.ServiceUnavailable ||
                        (int)response.StatusCode == 429)
                    {
                        if (attempt < MaxRetries - 1)
                        {
                            // Nếu còn lần thử, chờ theo cơ chế backoff và tiếp tục vòng lặp
                            await Task.Delay(delay);
                            delay *= 2; // Nhân đôi thời gian chờ (1s, 2s, 4s)
                            continue;
                        }
                    }

                    // Nếu là lỗi vĩnh viễn (ví dụ: 400 Bad Request) hoặc là lần thử cuối cùng, trả về response lỗi.
                    return response;
                }
                catch (HttpRequestException ex)
                {
                    // Xử lý lỗi kết nối mạng
                    if (attempt < MaxRetries - 1)
                    {
                        // Không log retries ra console theo yêu cầu
                        await Task.Delay(delay);
                        delay *= 2;
                        continue;
                    }

                    // Lần thử cuối cùng thất bại, re-throw để được bắt ở cấp trên
                    throw;
                }
            }

            // Fallback (chỉ để đảm bảo tất cả các đường đi đều có return)
            return null;
        }


        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] AiChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required!");

            if (request.UserId == 0)
                return Unauthorized("User is not logged in.");

            // 1. Lấy hoặc tạo cuộc trò chuyện
            var conversation = await _aiConversationService.GetConversationByUserId(request.UserId);
            if (conversation == null)
            {
                conversation = new Aiconversation
                {
                    UserId = request.UserId,
                    StartedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true
                };
                await _aiConversationService.CreateConversation(conversation);
            }

            // 2. Lấy 10 tin nhắn gần nhất để tạo bối cảnh (context)
            var messages = await _aiMessageService.GetMessagesByUserId(request.UserId);
            var lastMessages = messages.OrderBy(m => m.SentAt).TakeLast(10).ToList();

            // 3. Chuẩn bị và gọi API Gemini cho phản hồi CHAT TEXT (Gọi lần 1)
            var historyContents = new List<Content>();

            foreach (var msg in lastMessages)
            {
                var role = string.Equals(msg.Sender, "User", StringComparison.OrdinalIgnoreCase) ? "user" : "model";
                historyContents.Add(new Content(role, new List<Part> { new Part(msg.Content) }));
            }

            historyContents.Add(new Content("user", new List<Part> { new Part(request.Message) }));

            var systemInstruction = new SystemInstruction(
                new List<Part> { new Part("You are a health AI assistant. Respond briefly to health, medical, wellness, or fitness-related queries. Do not provide medical advice, only general information.") }
            );

            var payload = new GeminiRequest(systemInstruction, historyContents);

            string aiReply;
            DateTime aiSentAt = DateTime.Now;

            try
            {
                var client = _httpClientFactory.CreateClient();
                var url = $"{_option.Endpoint}?key={_option.ApiKey}";

                var resp = await ExecuteWithRetry(() => client.PostAsJsonAsync(url, payload));

                if (resp == null || !resp.IsSuccessStatusCode)
                {
                    // Xử lý khi tất cả các lần thử đều thất bại hoặc gặp lỗi vĩnh viễn (ví dụ: 400, 500)
                    var statusCode = resp?.StatusCode.ToString() ?? "Unknown";
                    var errorContent = resp != null ? await resp.Content.ReadAsStringAsync() : "No response body.";
                    Console.WriteLine($"Error calling Gemini API for chat (Final failure): Status {statusCode}, Content: {errorContent}");
                    throw new Exception($"Gemini API call failed with status: {statusCode}");
                }

                var geminiResponse = await resp.Content.ReadFromJsonAsync<GeminiResponse>();

                aiReply = geminiResponse?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text
                                ?? "Xin lỗi, tôi không thể tạo phản hồi. Vui lòng thử lại sau.";

                aiSentAt = DateTime.Now;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Gemini API for chat: {ex.Message}");
                aiReply = "Xin lỗi, tôi không thể kết nối đến dịch vụ AI hoặc dịch vụ quá tải. Vui lòng thử lại sau.";
                aiSentAt = DateTime.Now;
            }

            // 4. Lưu tin nhắn vào cơ sở dữ liệu (trước khi xử lý tìm bác sĩ)
            var userSentAt = aiSentAt.Subtract(TimeSpan.FromMilliseconds(200));
            await SaveConversationMessages(request.UserId, conversation, request.Message, aiReply, userSentAt, aiSentAt);


            // 5. Logic ĐỀ XUẤT BÁC SĨ (Cần dịch thuật)
            // Lấy tên chuyên khoa bằng tiếng Việt (dựa trên từ khóa đa ngôn ngữ)
            var specialtyVietnamese = SpecialtyMapper.GetSpecialty(request.Message);
            List<object>? recommendedDoctors = null;

            if (!string.IsNullOrWhiteSpace(specialtyVietnamese))
            {
                // Gọi AI lần 2 để DỊCH THUẬT CÓ CẤU TRÚC, đảm bảo có tên DB tiếng Anh
                var specialtyEnglish = await TranslateSpecialtyToEnglish(specialtyVietnamese);

                if (!string.IsNullOrWhiteSpace(specialtyEnglish))
                {
                    // Sử dụng tên tiếng Anh để tìm kiếm SpecialtyId trong DB
                    var getSpecialty = await _specialtyService.GetSpecialtyByName(specialtyEnglish);
                    if (getSpecialty != null)
                    {
                        var docs = await _doctorService.GetBySpecialtyAsync(getSpecialty.SpecialtyId);
                        recommendedDoctors = docs.Select(d => new
                        {
                            UserId = d.UserId,
                            SpecialtyId = d.Specialty?.SpecialtyId,
                            FullName = d.User.FullName,
                            Avatar = d.User.AvatarUrl,
                            // CẬP NHẬT: Trả về tên tiếng Việt đã được Mapper xác định
                            // để hiển thị cho người dùng, hỗ trợ đa ngôn ngữ/ngôn ngữ địa phương.
                            Specialty = specialtyVietnamese,
                            Experience = d.Experience
                        }).Cast<object>().ToList();
                    }
                }
            }

            return Ok(new
            {
                aiReply,
                recommendedDoctors
            });
        }

        // Hàm mới để gọi Gemini API và yêu cầu phản hồi JSON có cấu trúc (Translation)
        private async Task<string?> TranslateSpecialtyToEnglish(string specialtyVietnamese)
        {
            // PROMPT ĐƯỢC CẬP NHẬT: Loại bỏ giả định về tiếng Việt, cho phép AI tự động phát hiện ngôn ngữ.
            var translationPrompt = $"Translate the following medical specialty name to its single corresponding English name, detecting the source language automatically. If the input name is not a valid medical specialty, return 'null'. Name to translate: {specialtyVietnamese}";

            // Định nghĩa Schema JSON mong muốn
            var responseSchema = new ResponseSchema(
                Type: "OBJECT",
                Properties: new Dictionary<string, Property>
                {
                    { "englishSpecialty", new Property("STRING", "The English name of the medical specialty (e.g., 'Dermatology', 'Cardiology', or 'null').") }
                }
            );

            var generationConfig = new GenerationConfig(
                ResponseMimeType: "application/json",
                ResponseSchema: responseSchema
            );

            var payload = new GeminiRequest(
                SystemInstruction: new SystemInstruction(new List<Part> { new Part("You are a professional medical translator that only provides structured output.") }),
                Contents: new List<Content> { new Content("user", new List<Part> { new Part(translationPrompt) }) },
                GenerationConfig: generationConfig
            );

            try
            {
                var client = _httpClientFactory.CreateClient();
                var url = $"{_option.Endpoint}?key={_option.ApiKey}";

                var resp = await ExecuteWithRetry(() => client.PostAsJsonAsync(url, payload));

                if (resp == null || !resp.IsSuccessStatusCode)
                {
                    // Xử lý khi tất cả các lần thử đều thất bại hoặc gặp lỗi vĩnh viễn
                    var statusCode = resp?.StatusCode.ToString() ?? "Unknown";
                    var errorContent = resp != null ? await resp.Content.ReadAsStringAsync() : "No response body.";
                    Console.WriteLine($"Error calling Gemini API for translation (Final failure): Status {statusCode}, Content: {errorContent}");
                    return null; // Trả về null nếu dịch thuật thất bại
                }

                // Đọc phản hồi JSON có cấu trúc
                var responseContent = await resp.Content.ReadAsStringAsync();

                // Cần parse thủ công vì Gemini trả về JSON dưới dạng string trong thuộc tính 'text'
                var jsonDocument = JsonDocument.Parse(responseContent);
                var jsonText = jsonDocument.RootElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString();

                if (!string.IsNullOrWhiteSpace(jsonText))
                {
                    var detectionResponse = JsonSerializer.Deserialize<SpecialtyDetectionResponse>(jsonText, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (detectionResponse?.EnglishSpecialty?.ToLower() == "null" || string.IsNullOrWhiteSpace(detectionResponse?.EnglishSpecialty))
                    {
                        return null;
                    }
                    return detectionResponse.EnglishSpecialty;
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error calling Gemini API for translation: {ex.Message}");
                // Trả về null nếu có lỗi, ngăn chặn việc tìm kiếm DB
                return null;
            }
        }

        // Hàm hỗ trợ để đóng gói việc lưu tin nhắn và cập nhật cuộc trò chuyện
        private async Task SaveConversationMessages(int userId, Aiconversation conversation, string userMessage, string aiMessage, DateTime userSentAt, DateTime aiSentAt)
        {
            // Lưu tin nhắn của người dùng và AI
            await _aiMessageService.SaveMessage(new[]
            {
                new Aimessage
                {
                    UserId = userId,
                    Sender = "User",
                    Content = userMessage,
                    SentAt = userSentAt,
                    IsRead = true
                },
                new Aimessage
                {
                    UserId = userId,
                    Sender = "AI",
                    Content = aiMessage,
                    SentAt = aiSentAt,
                    IsRead = false
                }
            });

            // Cập nhật thời gian của cuộc trò chuyện
            conversation.UpdatedAt = aiSentAt;
            await _aiConversationService.UpdateConversation(conversation);
        }

        [HttpGet("messages/{userId}")]
        public async Task<IActionResult> GetMessages(int userId)
        {
            var messages = await _aiMessageService.GetMessagesByUserId(userId);
            if (messages == null || !messages.Any())
            {
                return Ok(new List<Aimessage>());
            }

            return Ok(messages);
        }

        [HttpDelete("messages/delete/{userId}")]
        public async Task<IActionResult> DeleteHistory(int userId)
        {
            if (userId != 0)
            {
                await _aiMessageService.DeleteMessageByConversationId(userId);
                var conversation = await _aiConversationService.GetConversationByUserId(userId);
                if (conversation != null)
                {
                    // Tùy thuộc vào việc bạn có hàm này hay không, hãy giữ lại hoặc bình luận
                    // await _aiConversationService.DeleteConversation(conversation.ConversationId); 
                }

                return Ok();
            }
            return BadRequest("Invalid User ID.");
        }
    }
}