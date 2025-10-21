using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class MedicalRecord
{
    public int RecordId { get; set; }

    public int PatientUserId { get; set; }

    public int DoctorUserId { get; set; }

    public int? AppointmentId { get; set; }

    public string? Diagnosis { get; set; }

    public string? Treatment { get; set; }

    public string? TestResults { get; set; }

    public string? MedicalImages { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Appointment? Appointment { get; set; }

    public virtual User DoctorUser { get; set; } = null!;

    public virtual User PatientUser { get; set; } = null!;

    public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
}
