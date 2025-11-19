using System;
using BusinessObjects.DataTransferObjects.PaymentDTOs.Shared;

namespace BusinessObjects.DataTransferObjects.PaymentDTOs
{
    public class PaymentRequest
    {
        public int PatientUserId { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public BookingDraftDto? BookingDraft { get; set; }
    }
}

