using System;

namespace BusinessObjects.DataTransferObjects.PatientDTOs
{
    public class CreatePatientDTO
    {
        public int UserId { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public int? Weight { get; set; }
        public int? Height { get; set; }
        public decimal? BMI { get; set; }
        public string? Address { get; set; }
        public string? EmergencyPhoneNumber { get; set; }
    }
}

