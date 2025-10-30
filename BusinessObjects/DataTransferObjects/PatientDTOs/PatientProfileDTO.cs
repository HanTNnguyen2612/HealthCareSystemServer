using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.PatientDTOs
{
    public class PatientProfileDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string BloodType { get; set; } = null!;
        public decimal? BMI { get; set; }
        public string EmergencyPhoneNumber { get; set; } = null!;
        public string? AvatarUrl { get; set; }
    }
}
