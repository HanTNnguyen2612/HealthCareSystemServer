using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Aimessage
{
    public int AimessageId { get; set; }

    public int UserId { get; set; }

    public string Sender { get; set; } = null!;

    public string? MessageType { get; set; }

    public string Content { get; set; } = null!;

    public DateTime? SentAt { get; set; }

    public bool? IsRead { get; set; }

    public virtual Aiconversation User { get; set; } = null!;
}
