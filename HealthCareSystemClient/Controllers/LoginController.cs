using Azure.Core;
using BusinessObjects.DataTransferObjects.AuthDTOs;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Http.Json;

namespace HealthCareSystemClient.Controllers
{
    public class LoginController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LoginController> _logger;

        public LoginController(IHttpClientFactory httpClientFactory, ILogger<LoginController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index(string? returnUrl = null)
        {
            if (!string.IsNullOrWhiteSpace(HttpContext.Session.GetString("AccessToken")))
            {
                return RedirectToAction("Index", "Home");
            }

            ViewData["ReturnUrl"] = returnUrl;
            return View(new LoginRequest());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(LoginRequest request, string? returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;

            if (!ModelState.IsValid)
            {
                return View(request);
            }

            try
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var response = await client.PostAsJsonAsync("api/Auth/login", request);

                if (response.IsSuccessStatusCode)
                {
                    var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();

                    if (loginResponse == null)
                    {
                        ModelState.AddModelError(string.Empty, "Không thể xử lý phản hồi đăng nhập.");
                        return View(request);
                    }

                    HttpContext.Session.SetInt32("UserId", loginResponse.UserId);
                    HttpContext.Session.SetString("Email", loginResponse.Email);
                    HttpContext.Session.SetString("Role", loginResponse.Role ?? string.Empty);
                    HttpContext.Session.SetString("FullName", loginResponse.FullName ?? loginResponse.Email);
                    HttpContext.Session.SetString("AccessToken", loginResponse.Token);
                    HttpContext.Session.SetString("TokenExpiry", loginResponse.ExpiresAt.ToString("O"));
                    HttpContext.Session.SetString("AvatarUrl", loginResponse.AvatarUrl ?? "/images/default-user.png");

                    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    {
                        return Redirect(returnUrl);
                    }

                    var role = loginResponse.Role?.Trim();
                    return role?.ToLowerInvariant() switch
                    {
                        "admin" => RedirectToAction("Index", "Admin"),
                        "doctor" => RedirectToAction("Index", "Doctor"),
                        "patient" => RedirectToAction("Index", "User"),
                        _ => RedirectToAction("Index", "Home")
                    };
                }

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    ModelState.AddModelError(string.Empty, "Email hoặc mật khẩu không chính xác.");
                }
                else
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogWarning("Login failed with status code {StatusCode}. Response body: {Body}", response.StatusCode, errorBody);
                    ModelState.AddModelError(string.Empty, "Đăng nhập thất bại. Vui lòng thử lại sau.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while calling login API.");
                ModelState.AddModelError(string.Empty, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
            }

            return View(request);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> GoogleLogin(string googleToken)
        {
            var model = new LoginRequest();
            if (string.IsNullOrEmpty(googleToken))
            {
                ModelState.AddModelError("", "Không nhận được Google Token.");
                return RedirectToAction(nameof(Index));
            }

            try
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");

                var response = await client.PostAsJsonAsync("api/Auth/google", new
                {
                    idToken = googleToken
                });

                if (response.IsSuccessStatusCode)
                {
                    var loginResponse = await response.Content.ReadFromJsonAsync<LoginResponse>();

                    if (loginResponse == null)
                    {
                        return RedirectToAction(nameof(Index));
                    }

                    // Lưu session giống login bằng password
                    HttpContext.Session.SetInt32("UserId", loginResponse.UserId);
                    HttpContext.Session.SetString("Email", loginResponse.Email);
                    HttpContext.Session.SetString("Role", loginResponse.Role ?? "");
                    HttpContext.Session.SetString("FullName", loginResponse.FullName ?? loginResponse.Email);
                    HttpContext.Session.SetString("AccessToken", loginResponse.Token);
                    HttpContext.Session.SetString("TokenExpiry", loginResponse.ExpiresAt.ToString("O"));

                    var role = loginResponse.Role?.Trim().ToLower();

                    return role switch
                    {
                        "admin" => RedirectToAction("Index", "Admin"),
                        "doctor" => RedirectToAction("Index", "Doctor"),
                        "patient" => RedirectToAction("Index", "User"),
                        _ => RedirectToAction("Index", "Home")
                    };
                }
                else
                {
                    ModelState.AddModelError(string.Empty, "Email không tồn tại trong hệ thống.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi Google Login");
                ModelState.AddModelError(string.Empty, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại.");
            }
            return View("Index", model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction(nameof(Index));
        }
    }
}
