using BusinessObjects;
using BusinessObjects.Domain;

namespace HealthCareSystem.Models
{
    public class PatientsViewModel
    {
        public List<PatientInfo> AllPatients { get; set; } = new List<PatientInfo>();
        public List<PatientInfo> FilteredPatients { get; set; } = new List<PatientInfo>();
        public string CurrentFilter { get; set; } = "all";
        public int TotalPatients { get; set; }
        public int ActivePatients { get; set; }
        public int CriticalPatients { get; set; }
        public int FollowUpPatients { get; set; }
        public int NewPatients { get; set; }
    }

    public class PatientInfo
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Gender { get; set; }
        public DateOnly? DateOfBirth { get; set; }
        public int? Age { get; set; }
        public string? BloodType { get; set; }
        public string? Allergies { get; set; }
        public int? Weight { get; set; }
        public int? Height { get; set; }
        public decimal? Bmi { get; set; }
        public string? Address { get; set; }
        public string? EmergencyPhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime? LastAppointment { get; set; }
        public DateTime? NextAppointment { get; set; }
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public string PatientStatus { get; set; } = "Active"; // Active, Critical, Follow-up, New
        public string StatusColor { get; set; } = "success";
        public DateTime? CreatedAt { get; set; }
        public string CreatedAtDisplay { get; set; } = string.Empty;
        public List<RecentAppointment> RecentAppointments { get; set; } = new List<RecentAppointment>();
    }

    public class RecentAppointment
    {
        public int AppointmentId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string DateDisplay { get; set; } = string.Empty;
        public string TimeDisplay { get; set; } = string.Empty;
    }

    public class PatientDetailsViewModel
    {
        public PatientInfo Patient { get; set; } = new PatientInfo();
        public List<AppointmentHistory> AppointmentHistory { get; set; } = new List<AppointmentHistory>();
        public List<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public PatientStatistics Statistics { get; set; } = new PatientStatistics();
    }

    public class AppointmentHistory
    {
        public int AppointmentId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string DoctorNotes { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
    }

    public class PatientStatistics
    {
        public int TotalAppointments { get; set; }
        public int CompletedAppointments { get; set; }
        public int CancelledAppointments { get; set; }
        public DateTime? FirstAppointment { get; set; }
        public DateTime? LastAppointment { get; set; }
        public string PatientSince { get; set; } = string.Empty;
    }
}