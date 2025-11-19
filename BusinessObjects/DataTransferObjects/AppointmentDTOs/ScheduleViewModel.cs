using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class ScheduleViewModel
    {
        public int DoctorId { get; set; }
        public DateTime CurrentWeek { get; set; }
        public string CurrentWeekDisplay { get; set; } = string.Empty;
        public List<WeeklyScheduleDay> WeeklySchedule { get; set; } = new List<WeeklyScheduleDay>();
        public List<TimeOffItem> TimeOffList { get; set; } = new List<TimeOffItem>();
    }

    public class WeeklyScheduleDay
    {
        public string DayName { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public bool IsToday { get; set; }
        public List<ScheduleAppointment> Appointments { get; set; } = new List<ScheduleAppointment>();
        public List<TimeSlot> AvailableSlots { get; set; } = new List<TimeSlot>();
    }

    public class ScheduleAppointment
    {
        public int AppointmentId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public string PatientEmail { get; set; } = string.Empty;
        public string PatientPhone { get; set; } = string.Empty;
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string StatusColor { get; set; } = string.Empty;
        public string TimeDisplay { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }

    public class TimeSlot
    {
        public int TimeSlotId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string SlotType { get; set; } = string.Empty; // regular, emergency, consultation, follow-up
        public string Notes { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public string TimeDisplay { get; set; } = string.Empty;
        public string DayName { get; set; } = string.Empty;
    }

    public class TimeOffItem
    {
        public int TimeOffId { get; set; }
        public string Type { get; set; } = string.Empty; // vacation, sick, conference, personal, holiday
        public string Title { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsAllDay { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string DateRangeDisplay { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }
}
