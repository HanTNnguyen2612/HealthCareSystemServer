using BusinessObjects.DataTransferObjects.PaymentDTOs;
using BusinessObjects.DataTransferObjects.PaymentDTOs.Shared;
using HealthCareSystemClient.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Text.Json;

namespace HealthCareSystemClient.Controllers
{
    [Route("Payment")]
    public class PaymentController : Controller
    {
        private const decimal BookingFee = 10000m;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IHttpClientFactory httpClientFactory, ILogger<PaymentController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        [Route("")]
        [Route("Index")]
        public async Task<IActionResult> Index(int? appointmentId)
        {
            ViewData["ActiveMenu"] = "Payment";
            
            if (appointmentId.HasValue)
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var response = await client.GetAsync($"api/Payment/appointment/{appointmentId.Value}");
                
                if (response.IsSuccessStatusCode)
                {
                    var payments = await response.Content.ReadFromJsonAsync<List<PaymentResponse>>();
                    ViewBag.Payments = payments ?? new List<PaymentResponse>();
                    ViewBag.AppointmentId = appointmentId.Value;
                }
            }
            
            return View();
        }

        [HttpGet("Success")]
        public IActionResult Success(string? orderCode)
        {
            ViewData["ActiveMenu"] = "Payment";
            ViewBag.OrderCode = orderCode;
            ViewBag.Message = "Payment successful! Your appointment has been confirmed.";
            return View();
        }

        [HttpGet("Cancel")]
        public IActionResult Cancel(string? orderCode)
        {
            ViewData["ActiveMenu"] = "Payment";
            ViewBag.OrderCode = orderCode;
            ViewBag.Message = "Payment was cancelled. You can try again later.";
            return View();
        }

        [HttpGet("Return")]
        public async Task<IActionResult> Return(
            string? code,
            string? status,
            string? orderCode,
            string? id,
            bool? cancel)
        {
            try
            {
                if (!string.IsNullOrEmpty(id))
                {
                    var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                    await client.GetAsync($"api/Payment/verify/{id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to verify payment link {PaymentLinkId}", id);
            }

            var isSuccess = string.Equals(code, "00", StringComparison.OrdinalIgnoreCase)
                || string.Equals(status, "PAID", StringComparison.OrdinalIgnoreCase)
                || cancel == false;

            if (isSuccess)
            {
                return RedirectToAction("Success", new { orderCode });
            }

            return RedirectToAction("Cancel", new { orderCode });
        }

        [HttpPost]
        [Route("Create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(int appointmentId, decimal amount, string description)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            try
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var paymentRequest = new
                {
                    PatientUserId = currentUserId.Value,
                    AppointmentId = appointmentId,
                    Amount = amount,
                    Description = description
                };

                var response = await client.PostAsJsonAsync($"api/Appointment/{appointmentId}/payment", paymentRequest);
                
                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync();
                    _logger.LogError(
                        "Create payment failed. StatusCode: {StatusCode}, Reason: {ReasonPhrase}, Body: {Body}",
                        response.StatusCode,
                        response.ReasonPhrase,
                        errorBody);

                    TempData["Error"] = "Failed to create payment. Please try again.";
                    return RedirectToAction("Appointments", "User");
                }

                var payment = await response.Content.ReadFromJsonAsync<PaymentResponse>();
                
                if (payment != null && !string.IsNullOrEmpty(payment.PaymentLink))
                {
                    return Redirect(payment.PaymentLink);
                }

                TempData["Error"] = "Payment link not available.";
                return RedirectToAction("Appointments", "User");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                TempData["Error"] = "An error occurred while creating payment.";
                return RedirectToAction("Appointments", "User");
            }
        }

        [HttpPost("CreatePrepayment")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePrepayment()
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var draftJson = HttpContext.Session.GetString("BookingDraft");
            if (string.IsNullOrEmpty(draftJson))
            {
                TempData["Error"] = "Please fill in your booking information before paying.";
                return RedirectToAction("Appointments", "User");
            }

            BookingDraftRequest? draft;
            try
            {
                draft = JsonSerializer.Deserialize<BookingDraftRequest>(draftJson);
            }
            catch
            {
                draft = null;
            }

            if (draft == null)
            {
                TempData["Error"] = "Booking information is invalid. Please try again.";
                return RedirectToAction("Appointments", "User");
            }

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var paymentRequest = new PaymentRequest
            {
                PatientUserId = currentUserId.Value,
                AppointmentId = 0,
                Amount = BookingFee,
                Description = "Appointment booking prepayment",
                BookingDraft = new BookingDraftDto
                {
                    SpecialtyId = draft.SpecialtyId,
                    DoctorUserId = draft.DoctorUserId,
                    AppointmentDate = draft.AppointmentDate,
                    AppointmentTime = draft.AppointmentTime,
                    Notes = draft.Notes,
                    AppointmentType = draft.AppointmentType
                }
            };

            var response = await client.PostAsJsonAsync("api/Payment", paymentRequest);
            if (!response.IsSuccessStatusCode)
            {
                TempData["Error"] = "Failed to start payment. Please try again.";
                return RedirectToAction("Appointments", "User");
            }

            var payment = await response.Content.ReadFromJsonAsync<PaymentResponse>();
            if (payment == null || string.IsNullOrEmpty(payment.PaymentLink))
            {
                TempData["Error"] = "Payment link not available.";
                return RedirectToAction("Appointments", "User");
            }

            return Redirect(payment.PaymentLink);
        }

        [HttpGet("BookingReturn")]
        public async Task<IActionResult> BookingReturn(
            string? code,
            string? status,
            string? orderCode,
            string? id,
            bool? cancel)
        {
            try
            {
                if (!string.IsNullOrEmpty(id))
                {
                    var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                    await client.GetAsync($"api/Payment/verify/{id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to verify prepayment link {PaymentLinkId}", id);
            }

            var isSuccess = string.Equals(code, "00", StringComparison.OrdinalIgnoreCase)
                || string.Equals(status, "PAID", StringComparison.OrdinalIgnoreCase)
                || cancel == false;

            if (!isSuccess)
            {
                TempData["Error"] = "Payment was cancelled or failed. Please try again.";
                return RedirectToAction("Appointments", "User");
            }

            HttpContext.Session.Remove("BookingDraft");
            TempData["Success"] = "Payment successful! Your appointment has been booked.";
            return RedirectToAction("Appointments", "User");
        }

        [HttpGet("CancelBooking")]
        public IActionResult CancelBooking(string? orderCode)
        {
            TempData["Error"] = "Payment was cancelled. Please try again.";
            return RedirectToAction("Appointments", "User");
        }

    }
}

