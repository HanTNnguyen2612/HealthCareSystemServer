using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class MedicalHistory
{
    public int HistoryId { get; set; }

    public int PatientUserId { get; set; }

    public string ConditionName { get; set; } = null!;

    public virtual Patient PatientUser { get; set; } = null!;
}
