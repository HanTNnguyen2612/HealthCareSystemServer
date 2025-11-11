using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Services.Interface;
using HealthcareSystemAPI.Hubs;

namespace HealthcareSystemAPI.Controllers
{
    [ApiController]
    [Route("api/conversations/{conversationId:int}/messages")]
    [Authorize]
    public class MessagesController : ControllerBase
    {
        private readonly IConversationService _conversationService;
        private readonly IMessageService _messageService;
        private readonly IHubContext<ChatHub> _hub;

        public MessagesController(
            IConversationService conversationService,
            IMessageService messageService,
            IHubContext<ChatHub> hub)
        {
            _conversationService = conversationService;
            _messageService = messageService;
            _hub = hub;
        }

        // GET: api/conversations/{conversationId}/messages?skip=0&take=50
        [HttpGet]
        public async Task<IActionResult> GetHistory([FromRoute] int conversationId, [FromQuery] int skip = 0, [FromQuery] int take = 50)
        {
            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);
            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            var messages = await _messageService.GetByConversationPagedAsync(conversationId, skip, take);
            var result = messages.Select(m => new
            {
                messageId = m.MessageId,
                conversationId = m.ConversationId,
                senderId = m.SenderId,
                content = m.Content,
                messageType = m.MessageType,
                sentAt = m.SentAt,
                updatedAt = m.UpdatedAt,
                isRead = m.IsRead
            });
            return Ok(result);
        }

        public class SendMessageRequest
        {
            public string Content { get; set; } = string.Empty;
            public string? MessageType { get; set; } = "text";
        }

        // POST: api/conversations/{conversationId}/messages
        // body: { "content": "...", "messageType": "text" }
        [HttpPost]
        public async Task<IActionResult> Send([FromRoute] int conversationId, [FromBody] SendMessageRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content)) return BadRequest("Content is required.");

            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            var msg = new Message
            {
                ConversationId = conversationId,
                SenderId = userId,
                MessageType = string.IsNullOrWhiteSpace(request.MessageType) ? "text" : request.MessageType,
                Content = request.Content,
                SentAt = System.DateTime.UtcNow,
                IsRead = false
            };

            await _messageService.CreateAsync(msg);

            var payload = new
            {
                messageId = msg.MessageId,
                conversationId = msg.ConversationId,
                senderId = msg.SenderId,
                content = msg.Content,
                messageType = msg.MessageType,
                sentAt = msg.SentAt,
                isRead = msg.IsRead
            };

            var group = $"conversation-{conversationId}";
            await _hub.Clients.Group(group).SendAsync("ReceiveMessage", payload);

            return Ok(payload);
        }

        // POST: api/conversations/{conversationId}/messages/mark-read
        [HttpPost("mark-read")]
        public async Task<IActionResult> MarkRead([FromRoute] int conversationId)
        {
            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) return NotFound();

            var userIdClaim = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            var userId = int.Parse(userIdClaim);

            if (!_conversationService.IsParticipant(convo, userId)) return Forbid();

            var unread = await _messageService.GetUnreadForConversationAsync(conversationId, userId);
            if (unread.Any())
            {
                await _messageService.MarkAsReadAsync(unread);
            }

            var group = $"conversation-{conversationId}";
            await _hub.Clients.Group(group).SendAsync("ReadReceipt", new
            {
                conversationId,
                readerId = userId,
                readAt = System.DateTime.UtcNow
            });

            return NoContent();
        }
    }
}

