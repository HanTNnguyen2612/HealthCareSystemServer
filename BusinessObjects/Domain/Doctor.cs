using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class Doctor
{
    public int UserId { get; set; }

    public int? SpecialtyId { get; set; }

    public string? Qualifications { get; set; }

    public string? Experience { get; set; }

    public string? Bio { get; set; }

    public decimal? Rating { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();

    public virtual Specialty? Specialty { get; set; }

    public virtual ICollection<TimeOff> TimeOffs { get; set; } = new List<TimeOff>();

    public virtual User User { get; set; } = null!;

    public virtual ICollection<WorkingHour> WorkingHours { get; set; } = new List<WorkingHour>();
}
