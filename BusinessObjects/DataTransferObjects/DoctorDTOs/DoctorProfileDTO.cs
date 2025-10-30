using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.DoctorDTOs
{
    public class DoctorProfileDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public string? SpecialtyName { get; set; }
        public decimal? Rating { get; set; }
        public string? Description { get; set; }
    }
}
