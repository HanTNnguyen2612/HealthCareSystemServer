using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class DoctorSpecialtyResponse
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = null!;

        public string? AvatarUrl { get; set; }

        public string SpecialtyName { get; set; } = null!;
        public int? SpecialtyId { get; set; }

        public string? Qualifications { get; set; }

        public string? Experience { get; set; }

        public decimal? Rating { get; set; }
    }
}
