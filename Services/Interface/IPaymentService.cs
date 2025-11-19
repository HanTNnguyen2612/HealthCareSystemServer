using BusinessObjects.DataTransferObjects.PaymentDTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IPaymentService
    {
        Task<PaymentResponse> CreatePaymentAsync(PaymentRequest request);
        Task<PaymentResponse?> GetByIdAsync(int paymentId);
        Task<PaymentResponse?> GetByTransactionIdAsync(string transactionId);
        Task<List<PaymentResponse>> GetByPatientIdAsync(int patientId);
        Task<List<PaymentResponse>> GetByAppointmentIdAsync(int appointmentId);
        Task<bool> ProcessPaymentCallbackAsync(PaymentCallbackRequest callback);
        Task<PaymentResponse?> VerifyPaymentAsync(string paymentLinkId);
    }
}

