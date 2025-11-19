using System;

namespace HealthCareSystemClient.Models
{
    public class BookingDraftRequest
    {
        public int SpecialtyId { get; set; }
        public int DoctorUserId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public TimeSpan AppointmentTime { get; set; }
        public string? Notes { get; set; }
        public string? AppointmentType { get; set; }
    }
}

