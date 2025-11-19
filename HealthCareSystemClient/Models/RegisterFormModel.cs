using System;
using System.ComponentModel.DataAnnotations;

namespace HealthCareSystemClient.Models
{
    public class RegisterFormModel
    {
        [Required(ErrorMessage = "First name is required")]
        public string FirstName { get; set; } = null!;

        [Required(ErrorMessage = "Last name is required")]
        public string LastName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Phone number is required")]
        [Phone(ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Date of birth is required")]
        public DateTime? DateOfBirth { get; set; }

        [Required(ErrorMessage = "Gender is required")]
        public string? Gender { get; set; }

        // Health information (optional)
        public string? BloodType { get; set; }
        public string? EmergencyContact { get; set; }
        public int? Weight { get; set; }
        public int? Height { get; set; }
        public decimal? BMI { get; set; }
        public string? Allergies { get; set; }
        public string? Medications { get; set; }
    }
}

