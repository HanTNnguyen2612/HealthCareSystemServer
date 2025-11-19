using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.DoctorDTOs
{
    public class DoctorProfileDTO
    {
        // --- User Info (Từ bảng User) ---
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Gender { get; set; } = null!;
        public DateOnly DateOfBirth { get; set; }
        public string? AvatarUrl { get; set; }

        // --- Doctor Info (Từ bảng Doctor) ---
        public int? SpecialtyId { get; set; } // ID để bind vào dropdown (nếu cần)
        public string SpecialtyName { get; set; } = "General"; // Tên để hiển thị

        // Trong DB là string, nhưng DTO trả về List để Frontend hiển thị dạng Tags
        public List<string> Qualifications { get; set; } = new List<string>();

        public string? Experience { get; set; } // DB là string (ví dụ: "5 years" hoặc "Senior")
        public string? Bio { get; set; }
        public decimal? Rating { get; set; }
    }
}
