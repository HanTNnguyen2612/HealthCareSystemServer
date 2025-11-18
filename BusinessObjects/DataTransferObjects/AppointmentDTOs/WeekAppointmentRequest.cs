using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class WeekAppointmentRequest
    {
        public int DoctorId { get; set; }
        public DateTime WeekStart { get; set; }
    }
}
