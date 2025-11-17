using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class RejectRequest
    {
        public int AppointmentId { get; set; }
        public int DoctorUserId { get; set; }
        public string? Notes { get; set; }
    }
}
