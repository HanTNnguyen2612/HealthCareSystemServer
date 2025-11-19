using System;

namespace BusinessObjects.DataTransferObjects.PaymentDTOs
{
    public class PaymentResponse
    {
        public int PaymentId { get; set; }
        public int PatientUserId { get; set; }
        public int? AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string? PaymentMethod { get; set; }
        public string? Status { get; set; }
        public string? TransactionId { get; set; }
        public string? PaymentLinkId { get; set; }
        public string? PaymentLink { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

