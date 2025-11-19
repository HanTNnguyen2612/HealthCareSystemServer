using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.PatientDTOs
{
    public class UpdatePatientProfileDTO
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Gender { get; set; }
        public DateOnly DateOfBirth { get; set; }
        public string EmergencyContact { get; set; }

        // Nhận về dạng List để xử lý
        public List<string> Allergies { get; set; } = new();
    }
}
