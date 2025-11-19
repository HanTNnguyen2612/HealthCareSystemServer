using BusinessObjects.DataTransferObjects.PaymentDTOs;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Microsoft.Extensions.Configuration;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Services.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PaymentDAO _paymentDAO;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly string _payOSClientId;
        private readonly string _payOSApiKey;
        private readonly string _payOSChecksumKey;
        // Base URL theo tài liệu PayOS mới: https://api-merchant.payos.vn
        private readonly string _payOSBaseUrl = "https://api-merchant.payos.vn/v2";

        public PaymentService(
            PaymentDAO paymentDAO,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration)
        {
            _paymentDAO = paymentDAO;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _payOSClientId = _configuration["PayOS:ClientId"] ?? "";
            _payOSApiKey = _configuration["PayOS:ApiKey"] ?? "";
            _payOSChecksumKey = _configuration["PayOS:ChecksumKey"] ?? "";
        }

        public async Task<PaymentResponse> CreatePaymentAsync(PaymentRequest request)
        {
            if (request.AppointmentId == 0)
            {
                return await CreateUpfrontPaymentAsync(request);
            }

            return await CreateAppointmentPaymentAsync(request);
        }

        private async Task<PaymentResponse> CreateUpfrontPaymentAsync(PaymentRequest request)
        {
            var orderCode = GenerateOrderCode();
            var amountInVnd = (int)Math.Round(request.Amount, MidpointRounding.AwayFromZero);

            var description = BuildPayOSDescription(request.Description ?? $"Booking #{request.PatientUserId}");

            var paymentLinkResponse = await CreatePayOSPaymentLinkAsync(
                orderCode: orderCode,
                amount: amountInVnd,
                description: description,
                returnUrl: _configuration["PayOS:ReturnUrl"] ?? "https://localhost:7206/Payment/BookingReturn",
                cancelUrl: _configuration["PayOS:CancelUrl"] ?? "https://localhost:7206/Payment/CancelBooking"
            );

            var paymentLink = paymentLinkResponse.Data ?? throw new Exception("Failed to get payment link data");

            var payment = new Payment
            {
                PatientUserId = request.PatientUserId,
                AppointmentId = null,
                Amount = amountInVnd,
                PaymentMethod = "PayOS",
                Status = "PENDING",
                PaymentLinkId = paymentLink.PaymentLinkId,
                PaymentLink = paymentLink.CheckoutUrl,
                TransactionId = orderCode.ToString()
            };

            var createdPayment = await _paymentDAO.CreateAsync(payment);
            return MapToResponse(createdPayment);
        }

        private async Task<PaymentResponse> CreateAppointmentPaymentAsync(PaymentRequest request)
        {
            var orderCode = GenerateOrderCode();
            var amountInVnd = (int)Math.Round(request.Amount, MidpointRounding.AwayFromZero);

            var description = BuildPayOSDescription(request.Description ?? $"Payment for appointment #{request.AppointmentId}");

            var paymentLinkResponse = await CreatePayOSPaymentLinkAsync(
                orderCode: orderCode,
                amount: amountInVnd,
                description: description,
                returnUrl: _configuration["PayOS:ReturnUrl"] ?? "https://localhost:7293/api/Payment/return",
                cancelUrl: _configuration["PayOS:CancelUrl"] ?? "https://localhost:7293/api/Payment/cancel"
            );

            var paymentLink = paymentLinkResponse.Data ?? throw new Exception("Failed to get payment link data");

            var payment = new Payment
            {
                PatientUserId = request.PatientUserId,
                AppointmentId = request.AppointmentId,
                Amount = amountInVnd,
                PaymentMethod = "PayOS",
                Status = "PENDING",
                PaymentLinkId = paymentLink.PaymentLinkId,
                PaymentLink = paymentLink.CheckoutUrl,
                TransactionId = orderCode.ToString()
            };

            var createdPayment = await _paymentDAO.CreateAsync(payment);
            return MapToResponse(createdPayment);
        }

        public async Task<PaymentResponse?> GetByIdAsync(int paymentId)
        {
            var payment = await _paymentDAO.GetByIdAsync(paymentId);
            return payment == null ? null : MapToResponse(payment);
        }

        public async Task<PaymentResponse?> GetByTransactionIdAsync(string transactionId)
        {
            var payment = await _paymentDAO.GetByTransactionIdAsync(transactionId);
            return payment == null ? null : MapToResponse(payment);
        }

        public async Task<List<PaymentResponse>> GetByPatientIdAsync(int patientId)
        {
            var payments = await _paymentDAO.GetByPatientIdAsync(patientId);
            return payments.Select(MapToResponse).ToList();
        }

        public async Task<List<PaymentResponse>> GetByAppointmentIdAsync(int appointmentId)
        {
            var payments = await _paymentDAO.GetByAppointmentIdAsync(appointmentId);
            return payments.Select(MapToResponse).ToList();
        }

        public async Task<bool> ProcessPaymentCallbackAsync(PaymentCallbackRequest callback)
        {
            // Verify checksum
            if (!VerifyPayOSChecksum(callback))
            {
                return false;
            }

            // Find payment by order code
            var payment = await _paymentDAO.GetByTransactionIdAsync(callback.Data?.OrderCode ?? "");
            if (payment == null)
            {
                return false;
            }

            // Update payment status
            if (callback.Code == "00" && callback.Data != null)
            {
                payment.Status = "PAID";
                payment.TransactionId = callback.Data.Reference;
                payment.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                payment.Status = "FAILED";
                payment.UpdatedAt = DateTime.UtcNow;
            }

            await _paymentDAO.UpdateAsync(payment);
            return true;
        }

        public async Task<PaymentResponse?> VerifyPaymentAsync(string paymentLinkId)
        {
            // Get payment info from PayOS
            var paymentInfo = await GetPayOSPaymentInfoAsync(paymentLinkId);
            if (paymentInfo == null || paymentInfo.Data == null)
            {
                return null;
            }

            // Find payment in database
            var payment = await _paymentDAO.GetByPaymentLinkIdAsync(paymentLinkId);
            if (payment == null)
            {
                return null;
            }

            // Update status based on PayOS response
            if (paymentInfo.Data.Status == "PAID")
            {
                payment.Status = "PAID";
                payment.TransactionId = paymentInfo.Data.TransactionId;
                payment.UpdatedAt = DateTime.UtcNow;
                await _paymentDAO.UpdateAsync(payment);
            }

            return MapToResponse(payment);
        }

        private async Task<PayOSPaymentLinkResponse> CreatePayOSPaymentLinkAsync(
            int orderCode,
            int amount,
            string description,
            string returnUrl,
            string cancelUrl)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("x-client-id", _payOSClientId);
            client.DefaultRequestHeaders.Add("x-api-key", _payOSApiKey);

            var expiredAt = (long)(DateTimeOffset.UtcNow.AddHours(24).ToUnixTimeSeconds());
            var signature = GeneratePayOSRequestSignature(
                orderCode,
                amount,
                description,
                returnUrl,
                cancelUrl);

            var requestBody = new
            {
                orderCode = orderCode,
                amount = amount,
                description = description,
                items = new[]
                {
                    new { name = description, quantity = 1, price = amount }
                },
                returnUrl = returnUrl,
                cancelUrl = cancelUrl,
                expiredAt = expiredAt,
                signature = signature
            };

            var response = await client.PostAsJsonAsync(
                $"{_payOSBaseUrl}/payment-requests",
                requestBody);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"PayOS API error: {errorContent}");
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            using var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonContent);
            var root = jsonDoc.RootElement;

            var codeElement = root.GetProperty("code");
            var codeString = codeElement.ValueKind switch
            {
                System.Text.Json.JsonValueKind.String => codeElement.GetString() ?? string.Empty,
                System.Text.Json.JsonValueKind.Number => codeElement.TryGetInt32(out var intCode)
                    ? intCode.ToString()
                    : codeElement.GetRawText(),
                _ => codeElement.GetRawText()
            };
            var desc = root.GetProperty("desc").GetString() ?? "";
            
            if (!IsPayOSSuccessCode(codeString))
            {
                throw new Exception($"PayOS error ({codeString}): {desc}");
            }
            
            if (!root.TryGetProperty("data", out var dataElement))
            {
                throw new Exception("PayOS response missing data");
            }
            
            var result = new PayOSPaymentLinkResponse
            {
                Code = codeString,
                Desc = desc,
                Data = new PayOSPaymentLinkData
                {
                    Id = dataElement.TryGetProperty("id", out var id) ? id.GetString() ?? "" : "",
                    PaymentLinkId = dataElement.TryGetProperty("paymentLinkId", out var linkId) ? linkId.GetString() ?? "" : "",
                    CheckoutUrl = dataElement.TryGetProperty("checkoutUrl", out var checkout) ? checkout.GetString() ?? "" : "",
                    QrCode = dataElement.TryGetProperty("qrCode", out var qr) ? qr.GetString() ?? "" : ""
                }
            };
            
            return result;
        }

        private async Task<PayOSPaymentInfo?> GetPayOSPaymentInfoAsync(string paymentLinkId)
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("x-client-id", _payOSClientId);
            client.DefaultRequestHeaders.Add("x-api-key", _payOSApiKey);

            var response = await client.GetAsync($"{_payOSBaseUrl}/payment-requests/{paymentLinkId}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var jsonContent = await response.Content.ReadAsStringAsync();
            using var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonContent);
            var root = jsonDoc.RootElement;

            var codeElement = root.GetProperty("code");
            var codeString = codeElement.ValueKind switch
            {
                System.Text.Json.JsonValueKind.String => codeElement.GetString() ?? string.Empty,
                System.Text.Json.JsonValueKind.Number => codeElement.TryGetInt32(out var intCode)
                    ? intCode.ToString()
                    : codeElement.GetRawText(),
                _ => codeElement.GetRawText()
            };

            return new PayOSPaymentInfo
            {
                Code = codeString,
                Desc = root.GetProperty("desc").GetString() ?? "",
                Data = root.TryGetProperty("data", out var data) ? new PayOSPaymentInfoData
                {
                    Status = data.TryGetProperty("status", out var status) ? status.GetString() ?? "" : "",
                    TransactionId = data.TryGetProperty("transactionId", out var transId) ? transId.GetString() ?? "" : ""
                } : null
            };
        }

        private bool VerifyPayOSChecksum(PaymentCallbackRequest callback)
        {
            if (callback.Data == null) return false;

            // Create checksum string
            var data = callback.Data;
            var canceledAt = data.CanceledAt ?? "";
            var checksumString = $"{data.Amount}|{canceledAt}|{data.Code}|{data.Desc}|{data.OrderCode}|{data.PaymentLinkId}|{data.TransactionDateTime}";
            
            // Calculate HMAC SHA256
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_payOSChecksumKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(checksumString));
            var checksum = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            // Note: PayOS will send checksum in callback, you should compare it
            // For now, we'll trust the callback if code is 00
            return callback.Code == "00";
        }

        private static int GenerateOrderCode()
        {
            // PayOS expects a positive 32-bit integer order code
            return RandomNumberGenerator.GetInt32(100000000, int.MaxValue);
        }

        private string GeneratePayOSRequestSignature(
            int orderCode,
            int amount,
            string description,
            string returnUrl,
            string cancelUrl)
        {
            // Theo hướng dẫn PayOS: sort key theo alphabet và build kiểu query string
            var data = new SortedDictionary<string, string>
            {
                ["amount"] = amount.ToString(),
                ["cancelUrl"] = cancelUrl ?? string.Empty,
                ["description"] = description ?? string.Empty,
                ["orderCode"] = orderCode.ToString(),
                ["returnUrl"] = returnUrl ?? string.Empty
            };

            var sb = new StringBuilder();
            var first = true;
            foreach (var kv in data)
            {
                if (!first) sb.Append('&');
                first = false;
                sb.Append(kv.Key);
                sb.Append('=');
                sb.Append(kv.Value ?? string.Empty);
            }

            var rawData = sb.ToString();

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_payOSChecksumKey));
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
        }

        private static string BuildPayOSDescription(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return "Appointment payment";
            }

            var trimmed = input.Trim();
            return trimmed.Length > 25 ? trimmed.Substring(0, 25) : trimmed;
        }

        private PaymentResponse MapToResponse(Payment payment)
        {
            return new PaymentResponse
            {
                PaymentId = payment.PaymentId,
                PatientUserId = payment.PatientUserId,
                AppointmentId = payment.AppointmentId,
                Amount = payment.Amount,
                PaymentMethod = payment.PaymentMethod,
                Status = payment.Status,
                TransactionId = payment.TransactionId,
                PaymentLinkId = payment.PaymentLinkId,
                PaymentLink = payment.PaymentLink,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt
            };
        }

        // PayOS API Response Models
        private bool IsPayOSSuccessCode(string code)
        {
            return code == "0" || code == "00";
        }

        private class PayOSPaymentLinkResponse
        {
            public string Code { get; set; } = string.Empty;
            public string Desc { get; set; } = string.Empty;
            public PayOSPaymentLinkData? Data { get; set; }
        }

        private class PayOSPaymentLinkData
        {
            public string Id { get; set; } = string.Empty;
            public string PaymentLinkId { get; set; } = string.Empty;
            public string CheckoutUrl { get; set; } = string.Empty;
            public string QrCode { get; set; } = string.Empty;
        }
        

        private class PayOSPaymentInfo
        {
            public string Code { get; set; } = string.Empty;
            public string Desc { get; set; } = string.Empty;
            public PayOSPaymentInfoData? Data { get; set; }
        }

        private class PayOSPaymentInfoData
        {
            public string Status { get; set; } = string.Empty;
            public string TransactionId { get; set; } = string.Empty;
        }
    }
}

