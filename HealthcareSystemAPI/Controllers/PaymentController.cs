using BusinessObjects.DataTransferObjects.PaymentDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;
using System.Security.Claims;

namespace HealthcareSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(IPaymentService paymentService, ILogger<PaymentController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var payment = await _paymentService.CreatePaymentAsync(request);
                return Ok(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, new { message = "Error creating payment", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPayment(int id)
        {
            var payment = await _paymentService.GetByIdAsync(id);
            if (payment == null)
                return NotFound(new { message = "Payment not found" });

            return Ok(payment);
        }

        [HttpGet("patient/{patientId}")]
        public async Task<IActionResult> GetPaymentsByPatient(int patientId)
        {
            var payments = await _paymentService.GetByPatientIdAsync(patientId);
            return Ok(payments);
        }

        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetPaymentsByAppointment(int appointmentId)
        {
            var payments = await _paymentService.GetByAppointmentIdAsync(appointmentId);
            return Ok(payments);
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> PaymentWebhook([FromBody] PaymentCallbackRequest callback)
        {
            try
            {
                var success = await _paymentService.ProcessPaymentCallbackAsync(callback);
                if (success)
                {
                    return Ok(new { message = "Webhook processed successfully" });
                }
                return BadRequest(new { message = "Webhook verification failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment webhook");
                return StatusCode(500, new { message = "Error processing webhook", error = ex.Message });
            }
        }

        [HttpGet("verify/{paymentLinkId}")]
        public async Task<IActionResult> VerifyPayment(string paymentLinkId)
        {
            var payment = await _paymentService.VerifyPaymentAsync(paymentLinkId);
            if (payment == null)
                return NotFound(new { message = "Payment not found" });

            return Ok(payment);
        }

        [HttpGet("return")]
        public IActionResult PaymentReturn([FromQuery] string? orderCode)
        {
            // Redirect to client success page
            return Redirect($"https://localhost:7206/Payment/Success?orderCode={orderCode}");
        }

        [HttpGet("cancel")]
        public IActionResult PaymentCancel([FromQuery] string? orderCode)
        {
            // Redirect to client cancel page
            return Redirect($"https://localhost:7206/Payment/Cancel?orderCode={orderCode}");
        }
    }
}

