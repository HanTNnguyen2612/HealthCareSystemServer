using BusinessObjects.DataTransferObjects.DoctorDTOs;
using BusinessObjects.DataTransferObjects.SpecialtyDTOs;
using DataAccessObjects.DAO;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;
using Services.Service;

namespace HealthcareSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ISpecialtyService _specialtyService;

        public DoctorController(IDoctorService doctorService, ISpecialtyService specialtyService)
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
        // GET: api/doctor/5
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetDoctorProfile(int userId)
        {
            var profile = await _doctorService.GetDoctorProfileAsync(userId);
            if (profile == null)
                return NotFound("Doctor not found.");
            return Ok(profile);
        }

        // PUT: api/doctor
        [HttpPut]
        public async Task<IActionResult> UpdateDoctorProfile([FromBody] DoctorProfileDTO doctorDto)
        {
            if (doctorDto == null)
                return BadRequest("Invalid data.");

            var success = await _doctorService.UpdateDoctorProfileAsync(doctorDto);
            if (!success)
                return NotFound("Doctor not found.");

            return Ok("Doctor profile updated successfully.");
        }
    }
}
