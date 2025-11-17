using BusinessObjects.DataTransferObjects.DoctorDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;

namespace HealthcareSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
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
