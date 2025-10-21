using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Prescription
{
    public int PrescriptionId { get; set; }

    public int RecordId { get; set; }

    public int PatientUserId { get; set; }

    public int DoctorUserId { get; set; }

    public string? Medication { get; set; }

    public string? Instructions { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User DoctorUser { get; set; } = null!;

    public virtual User PatientUser { get; set; } = null!;

    public virtual MedicalRecord Record { get; set; } = null!;
}
