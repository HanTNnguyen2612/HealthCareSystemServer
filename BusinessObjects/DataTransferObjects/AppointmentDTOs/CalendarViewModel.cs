using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class CalendarViewModel
    {
        public DateTime CurrentMonth { get; set; }
        public List<CalendarDay> CalendarDays { get; set; } = new List<CalendarDay>();
        public List<AppointmentCalendarItem> TodayAppointments { get; set; } = new List<AppointmentCalendarItem>();
        public List<AppointmentCalendarItem> UpcomingAppointments { get; set; } = new List<AppointmentCalendarItem>();
        public int DoctorId { get; set; }
        public string ViewMode { get; set; } = "month"; 
    }
    public class CalendarDay
    {
        public DateTime Date { get; set; }
        public bool IsCurrentMonth { get; set; }
        public bool IsToday { get; set; }
        public List<AppointmentCalendarItem> Appointments { get; set; } = new List<AppointmentCalendarItem>();
        public int AppointmentCount { get; set; }
    }

    public class AppointmentCalendarItem
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string StatusColor { get; set; } = string.Empty;
        public string TimeDisplay { get; set; } = string.Empty;
        public string DateDisplay { get; set; } = string.Empty;
    }
}
