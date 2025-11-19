using BusinessObjects.DataTransferObjects.DoctorDTOs;
using BusinessObjects.DataTransferObjects.SpecialtyDTOs;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;
using Services.Service;
using System.Security.Claims;

namespace HealthcareSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;

        public DoctorController(IDoctorService doctorService, ISpecialtyService specialtyService )
        {
            _doctorService = doctorService;
            _specialtyService = specialtyService;
        }
        [HttpGet("all")]
        public async Task<IActionResult> GetAllDoctors()
        {
            try
            {
                var doctors = await _doctorService.GetAllDoctors();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                Console.WriteLine($"Error fetching all doctors: {ex.Message}");
                return StatusCode(500, "Internal server error while fetching doctors.");
            }
        }

        // Endpoint 2: Lấy tất cả chuyên khoa cho mục đích lọc
        [HttpGet("specialties")]
        public async Task<IActionResult> GetAllSpecialties()
        {
            try
            {
                var specialties = await _specialtyService.GetAllSpecialtiesAsync();

                // Ánh xạ sang DTO cơ bản chỉ có ID và Name để giảm thiểu dữ liệu gửi về
                var specialtyDtos = specialties.Select(s => new SpecialtyDto
                {
                    SpecialtyId = s.SpecialtyId,
                    Name = s.Name
                }).ToList();

                return Ok(specialtyDtos);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                Console.WriteLine($"Error fetching specialties: {ex.Message}");
                return StatusCode(500, "Internal server error while fetching specialties.");
            }
        }
        // GET: api/doctor/{userId}
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            try
            {
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (currentUserId != null && int.Parse(currentUserId) != userId)
        {
                    // return Forbid();
                }

            var profile = await _doctorService.GetDoctorProfileAsync(userId);
                if (profile == null) return NotFound("Doctor profile not found.");

            return Ok(profile);
        }
            catch (Exception ex)
            {
                Console.WriteLine(ex + "Error getting doctor profile {UserId}" + userId);
                return StatusCode(500, "Internal Server Error");
            }
        }

        // PUT: api/doctor/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateDoctorProfileDTO dto)
        {
            if (dto == null) return BadRequest("Invalid data.");

            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId) || int.Parse(currentUserId) != dto.UserId)
            {
                return Unauthorized("You can only update your own profile.");
            }

            try
            {
                // Lưu ý: Dù UI không hiện Address/Gender/DOB, nhưng Service có thể vẫn cần data.
                // Frontend sẽ gửi kèm data cũ của các trường này để không bị mất (logic trong JS).
                var success = await _doctorService.UpdateDoctorProfileAsync(dto);
                if (!success) return NotFound("Doctor record not found.");

                return Ok(new { message = "Doctor profile updated successfully" });
            }
            catch (Exception ex)
        {
                Console.WriteLine(ex + "Error updating doctor profile {UserId}" + dto.UserId);
                return StatusCode(500, "Internal Server Error");
            }
        }

        [HttpGet("get-patient/{doctorUserId}")]
        public async Task<IActionResult> GetPatientsByDoctorId(int doctorUserId)
        {
            var patientList = await _doctorService.GetPatientsByDoctorId(doctorUserId);
            if (patientList == null)
                return NotFound("Doctor not found.");
            return Ok(patientList);
        }
    }
}
