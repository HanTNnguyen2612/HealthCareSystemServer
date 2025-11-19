namespace HealthCareSystemClient.Models
{
    public class UserAIChatViewModel
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = "Guest";
        public string AvatarUrl { get; set; } = "/images/default-avatar.png";
    }

    public class DoctorViewPatientViewModel
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = "Guest";
        public string AvatarUrl { get; set; } = "/images/default-avatar.png";
    }
}
