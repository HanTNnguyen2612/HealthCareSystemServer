using System;
using System.Collections.Generic;

namespace BusinessObjects.Domain;

public partial class User
{
    public int UserId { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Role { get; set; }

    public string FullName { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public bool? IsActive { get; set; }

    public virtual Aiconversation? Aiconversation { get; set; }

    public virtual ICollection<Conversation> ConversationDoctorUsers { get; set; } = new List<Conversation>();

    public virtual ICollection<Conversation> ConversationPatientUsers { get; set; } = new List<Conversation>();

    public virtual Doctor? Doctor { get; set; }

    public virtual ICollection<MedicalRecord> MedicalRecordDoctorUsers { get; set; } = new List<MedicalRecord>();

    public virtual ICollection<MedicalRecord> MedicalRecordPatientUsers { get; set; } = new List<MedicalRecord>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual Patient? Patient { get; set; }

    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    public virtual ICollection<Prescription> PrescriptionDoctorUsers { get; set; } = new List<Prescription>();

    public virtual ICollection<Prescription> PrescriptionPatientUsers { get; set; } = new List<Prescription>();

    public virtual ICollection<Review> ReviewDoctorUsers { get; set; } = new List<Review>();

    public virtual ICollection<Review> ReviewPatientUsers { get; set; } = new List<Review>();
}
