using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Services.Interface;
using HealthcareSystemAPI.Hubs;

namespace HealthcareSystemAPI.Controllers
{
    [ApiController]
    [Route("api/conversations/{conversationId:int}/messages")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IConversationService _conversationService;
        private readonly IMessageService _messageService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IHubContext<ChatHub> _hub;

        public MessagesController(
            IConversationService conversationService,
            IMessageService messageService,
            ICloudinaryService cloudinaryService,
            IHubContext<ChatHub> hub)
        {
            _conversationService = conversationService;
            _messageService = messageService;
            _cloudinaryService = cloudinaryService;
            _hub = hub;
        }

        // GET: api/conversations/{conversationId}/messages?skip=0&take=50
        [HttpGet]
        public async Task<IActionResult> GetHistory([FromRoute] int conversationId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            // Log để kiểm tra xem code mới có chạy không
            Console.WriteLine($"---> API GetHistory called for Conversation {conversationId}");

            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();

            // Lấy dữ liệu thô từ Service/DAO
            var messages = await _messageService.GetByConversationPagedAsync(conversationId, skip, take);

            // CHUYỂN ĐỔI SANG DTO (Data Transfer Object)
            // Bước này cắt đứt mọi quan hệ vòng tròn
            var result = new List<object>();

            foreach (var m in messages)
            {
                result.Add(new
                {
                    messageId = m.MessageId,
                    conversationId = m.ConversationId,
                    senderId = m.SenderId,
                    content = m.Content,
                    messageType = m.MessageType ?? "text", // Xử lý null an toàn
                    sentAt = m.SentAt,
                    isRead = m.IsRead
                });
            }

            return Ok(result);
        }

        public class SendMessageRequest
        {
            public string Content { get; set; } = string.Empty;
            public string? MessageType { get; set; } = "text";
        }

        // POST: api/conversations/{conversationId}/messages
        // body: { "content": "...", "messageType": "text" }
        [HttpPost]
        public async Task<IActionResult> Send([FromRoute] int conversationId, [FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Content is required.");

            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            var msg = new Message
            {
                ConversationId = conversationId,
                SenderId = userId,
                MessageType = string.IsNullOrWhiteSpace(request.MessageType) ? "text" : request.MessageType,
                Content = request.Content,
                SentAt = System.DateTime.UtcNow,
                IsRead = false
            };

            await _messageService.CreateAsync(msg);

            var payload = new
            {
                messageId = msg.MessageId,
                conversationId = msg.ConversationId,
                senderId = msg.SenderId,
                content = msg.Content,
                messageType = msg.MessageType,
                sentAt = msg.SentAt,
                isRead = msg.IsRead
            };

            var group = $"conversation-{conversationId}";
            await _hub.Clients.Group(group).SendAsync("ReceiveMessage", payload);

            return Ok(payload);
        }

        // POST: api/conversations/{conversationId}/messages/upload-image
        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadImage([FromRoute] int conversationId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Only image files (jpg, jpeg, png, gif, webp) are allowed.");

            // Validate file size (max 10MB)
            if (file.Length > 10 * 1024 * 1024)
                return BadRequest("File size exceeds 10MB limit.");

            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            try
            {
                // Upload to Cloudinary
                using var stream = file.OpenReadStream();
                var imageUrl = await _cloudinaryService.UploadImageAsync(stream, file.FileName);

                // Create message with image URL
                var msg = new Message
                {
                    ConversationId = conversationId,
                    SenderId = userId,
                    MessageType = "image",
                    Content = imageUrl,
                    SentAt = System.DateTime.UtcNow,
                    IsRead = false
                };

                await _messageService.CreateAsync(msg);

                var payload = new
                {
                    messageId = msg.MessageId,
                    conversationId = msg.ConversationId,
                    senderId = msg.SenderId,
                    content = msg.Content,
                    messageType = msg.MessageType,
                    sentAt = msg.SentAt,
                    isRead = msg.IsRead
                };

                var group = $"conversation-{conversationId}";
                await _hub.Clients.Group(group).SendAsync("ReceiveMessage", payload);

                return Ok(payload);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
            }
        }

        // POST: api/conversations/{conversationId}/messages/mark-read
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkRead([FromRoute] int conversationId)
        {
            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            var unread = await _messageService.GetUnreadForConversationAsync(conversationId, userId);
            if (unread.Any())
            {
                await _messageService.MarkAsReadAsync(unread);
            }

            var group = $"conversation-{conversationId}";
            await _hub.Clients.Group(group).SendAsync("ReadReceipt", new
            {
                conversationId,
                readerId = userId,
                readAt = System.DateTime.UtcNow
            });

            return NoContent();
        }
    }
}

