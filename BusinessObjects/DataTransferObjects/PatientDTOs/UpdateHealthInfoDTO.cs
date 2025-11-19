using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.PatientDTOs
{
    public class UpdateHealthInfoDTO
    {
        public int UserId { get; set; }
        public string? BloodType { get; set; }
        public int? Weight { get; set; } // Đơn vị: kg
        public int? Height { get; set; } // Đơn vị: cm
        public List<string> Allergies { get; set; } = new List<string>();
    }
}
