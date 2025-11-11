using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;

namespace HealthcareSystemAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConversationController : ControllerBase
    {
        private readonly IConversationService _conversationService;

        public ConversationController(IConversationService conversationService)
        {
            _conversationService = conversationService;
        }

        // GET: api/conversation/by-participants?patientUserId=1&doctorUserId=2
        [HttpGet("by-participants")]
        public async Task<IActionResult> GetByParticipants([FromQuery] int patientUserId, [FromQuery] int doctorUserId)
        {
            var convo = await _conversationService.GetByParticipantsAsync(patientUserId, doctorUserId);

            if (convo == null) return NotFound();
            return Ok(new { conversationId = convo.ConversationId });
        }

        // POST: api/conversation/create-or-get
        // body: { "patientUserId": 1, "doctorUserId": 2 }
        public class CreateOrGetConversationRequest
        {
            public int PatientUserId { get; set; }
            public int DoctorUserId { get; set; }
        }

        [HttpPost("create-or-get")]
        public async Task<IActionResult> CreateOrGet([FromBody] CreateOrGetConversationRequest request)
        {
            var convo = await _conversationService.CreateOrGetAsync(request.PatientUserId, request.DoctorUserId);
            var created = convo.CreatedAt.HasValue && (System.DateTime.UtcNow - convo.CreatedAt.Value).TotalSeconds < 2;
            return Ok(new { conversationId = convo.ConversationId, created });
        }
    }
}

