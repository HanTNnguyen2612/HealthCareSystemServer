using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class AppoimentUpdateRequest
    {
        public int PatientUserId { get; set; }
        public int DoctorUserId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? Notes { get; set; }
    }
}
