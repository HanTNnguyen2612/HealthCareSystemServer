using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Patient
{
    public int UserId { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public string? Gender { get; set; }

    public string? BloodType { get; set; }

    public string? Allergies { get; set; }

    public int? Weight { get; set; }

    public int? Height { get; set; }

    public decimal? Bmi { get; set; }

    public string? Address { get; set; }

    public string? EmergencyPhoneNumber { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual ICollection<MedicalHistory> MedicalHistories { get; set; } = new List<MedicalHistory>();

    public virtual User User { get; set; } = null!;
}
