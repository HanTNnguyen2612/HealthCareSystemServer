using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Aiconversation
{
    public int UserId { get; set; }

    public DateTime? StartedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual ICollection<Aimessage> Aimessages { get; set; } = new List<Aimessage>();

    public virtual User User { get; set; } = null!;
}
