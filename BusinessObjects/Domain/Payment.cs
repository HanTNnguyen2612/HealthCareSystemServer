using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class Payment
{
    public int PaymentId { get; set; }

    public int PatientUserId { get; set; }

    public int? AppointmentId { get; set; }

    public decimal Amount { get; set; }

    public string? PaymentMethod { get; set; }

    public string? Status { get; set; }

    public string? TransactionId { get; set; }

    public string? PaymentLinkId { get; set; }

    public string? PaymentLink { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? BookingDraftJson { get; set; }

    public virtual User PatientUser { get; set; } = null!;
}
