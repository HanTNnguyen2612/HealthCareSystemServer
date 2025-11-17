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
        private readonly ILogger<PatientController> _logger;

        public PatientController(IPatientService patientService, ILogger<PatientController> logger)
        {
            _patientService = patientService;
            _logger = logger;
        }

        // GET: api/patient/5
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetPatientProfile(int userId)
        {
            try
            {
                var profile = await _patientService.GetPatientProfileAsync(userId);
                if (profile == null)
                    return NotFound("Patient not found.");
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting patient profile for userId {UserId}", userId);
                return StatusCode(500, "An error occurred while retrieving patient profile.");
            }
        }

        // POST: api/patient
        [HttpPost]
        public async Task<IActionResult> CreatePatientProfile([FromBody] CreatePatientDTO patientDto)
        {
            if (patientDto == null)
                return BadRequest("Invalid data.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var success = await _patientService.CreatePatientProfileAsync(patientDto);
                if (!success)
                {
                    _logger.LogWarning("Failed to create patient profile for userId {UserId}. Patient may already exist.", patientDto.UserId);
                    return BadRequest("Patient profile already exists or creation failed.");
                }

                _logger.LogInformation("Patient profile created successfully for userId {UserId}", patientDto.UserId);
                return Ok("Patient profile created successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating patient profile for userId {UserId}", patientDto?.UserId);
                return StatusCode(500, "An error occurred while creating patient profile.");
            }
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
