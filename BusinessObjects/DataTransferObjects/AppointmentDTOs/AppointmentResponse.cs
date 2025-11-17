using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class AppointmentResponse
    {
        public int AppointmentId { get; set; }
        public int patientid { get; set; } = 0;
        public string PatientName { get; set; }

        public int doctorid { get; set; } = 0;

        public string DoctorName { get; set; }

        public DateTime AppointmentDateTime { get; set; }


        public string? Status { get; set; }

        public DateTime? CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public string? Notes { get; set; }
    }
}
