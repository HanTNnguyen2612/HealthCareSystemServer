using System;
using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Services.Interface;

namespace HealthcareSystemAPI.Hubs
{
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class ChatHub : Hub
    {
        private readonly IConversationService _conversationService;
        private readonly IMessageService _messageService;

        public ChatHub(IConversationService conversationService, IMessageService messageService)
        {
            _conversationService = conversationService;
            _messageService = messageService;
        }

        private int GetUserId()
        {
            var sub = Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(sub)) throw new HubException("Unauthorized");
            return int.Parse(sub);
        }

        private static string ConversationGroup(int conversationId) => $"conversation-{conversationId}";

        public async Task JoinConversation(int conversationId)
        {
            var userId = GetUserId();
            var convo = await _conversationService.GetByIdAsync(conversationId);

            if (convo == null) throw new HubException("Conversation not found");
            if (!_conversationService.IsParticipant(convo, userId))
                throw new HubException("Forbidden: not a participant");

            await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        public async Task LeaveConversation(int conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        public async Task<object> SendMessage(int conversationId, string content, string? messageType = "text")
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new HubException("Content is required");

            var userId = GetUserId();

            var convo = await _conversationService.GetByIdAsync(conversationId);

            if (convo == null) throw new HubException("Conversation not found");
            if (!_conversationService.IsParticipant(convo, userId))
                throw new HubException("Forbidden: not a participant");

            var msg = new Message
            {
                ConversationId = conversationId,
                SenderId = userId,
                MessageType = messageType,
                Content = content,
                SentAt = DateTime.UtcNow,
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

            await Clients.Group(ConversationGroup(conversationId)).SendAsync("ReceiveMessage", payload);
            return payload;
        }

        public async Task MarkAsRead(int conversationId)
        {
            var userId = GetUserId();
            var convo = await _conversationService.GetByIdAsync(conversationId);
            if (convo == null) throw new HubException("Conversation not found");
            if (!_conversationService.IsParticipant(convo, userId))
                throw new HubException("Forbidden: not a participant");

            var unread = await _messageService.GetUnreadForConversationAsync(conversationId, userId);

            if (unread.Count > 0)
            {
                await _messageService.MarkAsReadAsync(unread);
            }

            await Clients.Group(ConversationGroup(conversationId)).SendAsync("ReadReceipt", new
            {
                conversationId,
                readerId = userId, 
                readAt = DateTime.UtcNow
            });
        }

        public async Task Typing(int conversationId)
        {
            var userId = GetUserId();
            await Clients.GroupExcept(ConversationGroup(conversationId), Context.ConnectionId)
                .SendAsync("Typing", new { conversationId, userId, at = DateTime.UtcNow });
        }
    }
}

