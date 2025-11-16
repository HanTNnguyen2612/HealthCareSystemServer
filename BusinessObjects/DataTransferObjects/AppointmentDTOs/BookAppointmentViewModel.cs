using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AppointmentDTOs
{
    public class BookAppointmentViewModel
    {
        [Required(ErrorMessage = "Vui lòng chọn chuyên khoa")]
        [Display(Name = "Chuyên khoa")]
        public int SpecialtyId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn bác sĩ")]
        [Display(Name = "Bác sĩ")]
        public int DoctorUserId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn ngày khám")]
        [Display(Name = "Ngày khám")]
        [DataType(DataType.Date)]
        public DateTime AppointmentDate { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn giờ khám")]
        [Display(Name = "Giờ khám")]
        public TimeSpan AppointmentTime { get; set; }

        [Display(Name = "Lý do khám")]
        [StringLength(500, ErrorMessage = "Lý do khám không được vượt quá 500 ký tự")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn loại hình khám")]
        [Display(Name = "Loại hình khám")]
        public string AppointmentType { get; set; }


        // Properties for displaying data
        public List<SpecialtyViewModel> Specialties { get; set; } = new List<SpecialtyViewModel>();
        public List<DoctorViewModel> Doctors { get; set; } = new List<DoctorViewModel>();
        public List<TimeSlotViewModel> AvailableTimeSlots { get; set; } = new List<TimeSlotViewModel>();
    }

    public class SpecialtyViewModel
    {
        public int SpecialtyId { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }

    public class DoctorViewModel
    {
        public int UserId { get; set; }
        public string FullName { get; set; }
        public int? SpecialtyId { get; set; }
        public string? SpecialtyName { get; set; }
        public string? Qualifications { get; set; }
        public string? Experience { get; set; }
        public decimal? Rating { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class TimeSlotViewModel
    {
        public TimeSpan Time { get; set; }
        public bool IsAvailable { get; set; }
        public string DisplayTime { get; set; }
    }

    public class AppointmentViewModel
    {
        public int AppointmentId { get; set; }
        public DateTime AppointmentDateTime { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public string DoctorName { get; set; }
        public string SpecialtyName { get; set; }
        public string PatientName { get; set; }

        public string DoctorAvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
    }


    public class IsTimeSlotBook3Request
    {
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public  int excludeAppointmentId { get; set; }
    }
    public class IsTimeSlotBook2Request
    {
        public int DoctorId { get; set; }
        public DateTime AppointmentDate { get; set; }
    }
}
