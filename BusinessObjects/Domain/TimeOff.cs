using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class TimeOff
{
    public int TimeOffId { get; set; }

    public int DoctorUserId { get; set; }

    public string Type { get; set; } = null!;

    public string Title { get; set; } = null!;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public bool? IsAllDay { get; set; }

    public string? Reason { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Doctor DoctorUser { get; set; } = null!;
}
