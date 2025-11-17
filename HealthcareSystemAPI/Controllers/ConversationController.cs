using System.Collections.Generic;
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
        private readonly IMessageService _messageService;

        public ConversationController(IConversationService conversationService, IMessageService messageService)
        {
            _conversationService = conversationService;
            _messageService = messageService;
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

        // GET: api/conversation/my-conversations
        [HttpGet("my-conversations")]
        public async Task<IActionResult> GetMyConversations()
        {
            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            var conversations = await _conversationService.GetByUserIdAsync(userId);

            var result = conversations.Select(c =>
            {
                var otherUser = userId == c.PatientUserId ? c.DoctorUser : c.PatientUser;
                var lastMessage = c.Messages.OrderByDescending(m => m.SentAt).FirstOrDefault();
                var unreadCount = c.Messages.Count(m => m.SenderId != userId && (m.IsRead == null || m.IsRead == false));

                return new
                {
                    conversationId = c.ConversationId,
                    otherUserId = otherUser.UserId,
                    otherUserName = otherUser.FullName,
                    otherUserAvatar = otherUser.AvatarUrl ?? "/placeholder.svg?height=48&width=48",
                    isDoctor = userId == c.PatientUserId,
                    specialty = c.DoctorUser.Doctor?.Specialty?.Name,
                    lastMessage = lastMessage != null ? new
                    {
                        content = lastMessage.Content,
                        sentAt = lastMessage.SentAt,
                        senderId = lastMessage.SenderId,
                        messageType = lastMessage.MessageType
                    } : null,
                    unreadCount = unreadCount,
                    updatedAt = c.UpdatedAt ?? c.CreatedAt
                };
            }).ToList();

            return Ok(result);
        }
    }
}

