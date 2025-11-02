using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;

namespace HealthcareSystemAPI.Controllers
{
    
    [Route("api/[controller]")]
    [Controller]
    public class AppointmentController : Controller
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _appointmentService.GetAll();
            return Ok(appointments);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(appointment);
        }


        [HttpGet("details")]
        public async Task<IActionResult> GetByDetails([FromQuery] int doctorId, [FromQuery] int patientId)
        {
            var appointment = await _appointmentService.GetByDetailsAsync(doctorId, patientId);
            if (appointment == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(appointment);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AppointmentAddRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var created = await _appointmentService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.AppointmentId }, created);
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] AppoimentUpdateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            
            var updated = await _appointmentService.UpdateAsync(request , id);
            if (updated == null)
                return NotFound(new { message = "Appointment not found" });

            return Ok(updated);
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _appointmentService.DeleteAsync(id);
            if (!success)
                return NotFound(new { message = "Appointment not found or already deleted" });

            return NoContent();
        }
    }
}
