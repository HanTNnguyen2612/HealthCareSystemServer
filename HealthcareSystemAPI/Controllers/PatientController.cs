using BusinessObjects.DataTransferObjects.PatientDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;

namespace HealthcareSystemAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _patientService;

        public PatientController(IPatientService patientService)
        {
            _patientService = patientService;
        }

        // GET: api/patient/5
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetPatientProfile(int userId)
        {
            var profile = await _patientService.GetPatientProfileAsync(userId);
            if (profile == null)
                return NotFound("Patient not found.");
            return Ok(profile);
        }

        // PUT: api/patient
        [HttpPut]
        public async Task<IActionResult> UpdatePatientProfile([FromBody] PatientProfileDTO patientDto)
        {
            if (patientDto == null)
                return BadRequest("Invalid data.");

            var success = await _patientService.UpdatePatientProfileAsync(patientDto);
            if (!success)
                return NotFound("Patient not found.");

            return Ok("Patient profile updated successfully.");
        }
    }
}
