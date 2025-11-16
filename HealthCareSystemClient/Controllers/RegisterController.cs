using System.Linq;
using System.Net;
using System.Net.Http.Json;
using BusinessObjects.DataTransferObjects.AuthDTOs;
using BusinessObjects.DataTransferObjects.PatientDTOs;
using HealthCareSystemClient.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HealthCareSystemClient.Controllers
{
    public class RegisterController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<RegisterController> _logger;

        public RegisterController(IHttpClientFactory httpClientFactory, ILogger<RegisterController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            // Redirect if already logged in
            if (!string.IsNullOrWhiteSpace(HttpContext.Session.GetString("AccessToken")))
            {
                return RedirectToAction("Index", "Home");
            }
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterFormModel model)
        {
            if (!ModelState.IsValid)
            {
                // Return to view with errors
                return View("Index", model);
            }

            try
            {
                // Prepare RegisterRequest
                var registerRequest = new RegisterRequest
                {
                    Email = model.Email,
                    Password = model.Password,
                    FullName = $"{model.FirstName} {model.LastName}".Trim(),
                    PhoneNumber = model.Phone,
                    Role = "Patient" // Default role
                };

                // Process allergies from form
                var conditions = Request.Form["conditions[]"].ToList();
                var allergiesDetails = Request.Form["allergiesDetails"].ToString();
                var allergiesList = new List<string>();
                
                if (conditions.Contains("allergies"))
                {
                    allergiesList.Add("allergies");
                }
                
                if (!string.IsNullOrWhiteSpace(allergiesDetails))
                {
                    allergiesList.Add(allergiesDetails);
                }
                
                var combinedAllergies = allergiesList.Any() ? string.Join(", ", allergiesList) : null;

                // Process weight and height with unit conversion
                int? weightKg = null;
                int? heightCm = null;
                decimal? bmi = null;

                if (!string.IsNullOrWhiteSpace(Request.Form["weight"].ToString()) && 
                    decimal.TryParse(Request.Form["weight"].ToString(), out var weightValue))
                {
                    var weightUnit = Request.Form["weightUnit"].ToString();
                    if (weightUnit == "lbs")
                    {
                        weightKg = (int)Math.Round(weightValue * 0.453592m);
                    }
                    else
                    {
                        weightKg = (int)Math.Round(weightValue);
                    }
                }

                if (!string.IsNullOrWhiteSpace(Request.Form["height"].ToString()) && 
                    decimal.TryParse(Request.Form["height"].ToString(), out var heightValue))
                {
                    var heightUnit = Request.Form["heightUnit"].ToString();
                    if (heightUnit == "ft")
                    {
                        heightCm = (int)Math.Round(heightValue * 30.48m);
                    }
                    else
                    {
                        heightCm = (int)Math.Round(heightValue);
                    }
                }

                if (!string.IsNullOrWhiteSpace(Request.Form["bmi"].ToString()) && 
                    decimal.TryParse(Request.Form["bmi"].ToString(), out var bmiValue))
                {
                    bmi = bmiValue;
                }

                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var response = await client.PostAsJsonAsync("api/Auth/register", registerRequest);

                if (response.IsSuccessStatusCode)
                {
                    var registerResponse = await response.Content.ReadFromJsonAsync<RegisterResponse>();

                    if (registerResponse == null)
                    {
                        ModelState.AddModelError("", "Không thể xử lý phản hồi đăng ký.");
                        return View("Index", model);
                    }

                    // Create patient profile if health information is provided
                    if (registerResponse.UserId > 0)
                    {
                        DateOnly? dateOfBirth = null;
                        if (model.DateOfBirth.HasValue)
                        {
                            dateOfBirth = DateOnly.FromDateTime(model.DateOfBirth.Value);
                        }

                        // Capitalize gender (Male/Female instead of male/female)
                        string? genderCapitalized = null;
                        if (!string.IsNullOrWhiteSpace(model.Gender))
                        {
                            genderCapitalized = System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(model.Gender.ToLower());
                        }

                        var patientDto = new CreatePatientDTO
                        {
                            UserId = registerResponse.UserId,
                            DateOfBirth = dateOfBirth,
                            Gender = genderCapitalized,
                            BloodType = model.BloodType,
                            Allergies = combinedAllergies ?? model.Allergies,
                            Weight = weightKg ?? model.Weight,
                            Height = heightCm ?? model.Height,
                            BMI = bmi ?? model.BMI,
                            EmergencyPhoneNumber = model.EmergencyContact
                        };

                        try
                        {
                            var patientResponse = await client.PostAsJsonAsync("api/Patient", patientDto);
                            if (!patientResponse.IsSuccessStatusCode)
                            {
                                _logger.LogWarning("Failed to create patient profile for user {UserId}", registerResponse.UserId);
                                // Continue even if patient creation fails
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error creating patient profile for user {UserId}", registerResponse.UserId);
                            // Continue even if patient creation fails
                        }
                    }

                    // Show success message on register page
                    TempData["SuccessMessage"] = "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.";
                    return View("Index");
                }

                if (response.StatusCode == HttpStatusCode.BadRequest)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Registration failed with status code {StatusCode}. Response body: {Body}", response.StatusCode, errorBody);
                    
                    // Try to parse error message
                    try
                    {
                        var errorObj = await response.Content.ReadFromJsonAsync<dynamic>();
                        var errorMessage = errorObj?.message?.ToString() ?? "Email đã tồn tại hoặc đăng ký thất bại.";
                        ModelState.AddModelError("", errorMessage);
                    }
                    catch
                    {
                        ModelState.AddModelError("", "Email đã tồn tại hoặc đăng ký thất bại.");
                    }
                    return View("Index", model);
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Registration failed with status code {StatusCode}. Response body: {Body}", response.StatusCode, errorContent);
                ModelState.AddModelError("", "Đăng ký thất bại. Vui lòng thử lại sau.");
                return View("Index", model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while calling register API.");
                ModelState.AddModelError("", "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
                return View("Index", model);
            }
        }
        [HttpPost("CreatePatient")]
        public async Task<IActionResult> CreatePatient([FromBody] CreatePatientDTO patientDto)
        {
            if (patientDto == null)
            {
                return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            }

            try
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var response = await client.PostAsJsonAsync("api/Patient", patientDto);

                if (response.IsSuccessStatusCode)
                {
                    return Ok(new { success = true, message = "Thông tin bệnh nhân đã được lưu thành công." });
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Create patient failed with status code {StatusCode}. Response body: {Body}", response.StatusCode, errorContent);
                
                return StatusCode((int)response.StatusCode, new { message = "Không thể lưu thông tin bệnh nhân. Vui lòng thử lại sau." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while calling create patient API.");
                return StatusCode(500, new { message = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại." });
            }
        }
    }
}
