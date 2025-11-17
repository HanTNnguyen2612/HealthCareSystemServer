using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class AppointmentResponseDetails
    {
        public int PatientUserId { get; set; }

        public int DoctorUserId { get; set; }

        public string? Status { get; set; }

        public DateTime AppointmentDateTime { get; set; }

        public int AppointmentId { get; set; }

        public string? Notes { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? PatientAvatarUrl { get; set; }

        public string PatientName { get; set; } = null!;
        public string DoctorName { get; set; } = null!;

        public string PatientEmail { get; set; } = null!;

        public string? PatientPhoneNumber { get; set; }

        public DateOnly? PatientDateOfBirth { get; set; }

        public string? PatientGender { get; set; }

        public string? PatientAddress { get; set; }
        public string? PatientEmergencyPhoneNumber { get; set; }

        public string? PatientBloodType { get; set; }

        public string? PatientAllergies { get; set; }

        public int? PatientWeight { get; set; }

        public int? PatientHeight { get; set; }

        public decimal? PatientBmi { get; set; }
     
    }
}
