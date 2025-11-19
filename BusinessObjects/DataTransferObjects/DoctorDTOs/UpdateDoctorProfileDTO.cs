using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.DoctorDTOs
{
    public class UpdateDoctorProfileDTO
    {
        public int UserId { get; set; }

        // Personal
        public string FullName { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public DateOnly DateOfBirth { get; set; }

        // Professional
        public int? SpecialtyId { get; set; } // Cập nhật theo ID chuyên khoa
        public string? Experience { get; set; } // String
        public string? Bio { get; set; }

        // Nhận List từ Frontend, Service sẽ gộp thành chuỗi để lưu DB
        public List<string> Qualifications { get; set; } = new List<string>();
    }
}
