using System;
using System.Collections.Generic;

namespace BusinessObjects;

public partial class Conversation
{
    public int ConversationId { get; set; }

    public int PatientUserId { get; set; }

    public int DoctorUserId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User DoctorUser { get; set; } = null!;

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual User PatientUser { get; set; } = null!;
}
