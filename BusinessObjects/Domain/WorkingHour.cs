using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class WorkingHour
{
    public int WorkingHoursId { get; set; }

    public int DoctorUserId { get; set; }

    public string DayOfWeek { get; set; } = null!;

    public bool? IsWorking { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Doctor DoctorUser { get; set; } = null!;
}
