using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;

namespace DataAccessObjects.DAO
{
    public class MessageDAO
    {
        private readonly HealthCareSystemContext _context;

        public MessageDAO(HealthCareSystemContext context)
        {
            _context = context;
        }

        public async Task<Message> CreateAsync(Message message)
        {
            _context.Messages.Add(message);
            
            // Update conversation's UpdatedAt
            var conversation = await _context.Conversations.FindAsync(message.ConversationId);
            if (conversation != null)
            {
                conversation.UpdatedAt = System.DateTime.UtcNow;
            }
            
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<List<Message>> GetUnreadForConversationAsync(int conversationId, int excludingSenderId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId && m.SenderId != excludingSenderId && (m.IsRead == null || m.IsRead == false))
                .ToListAsync();
        }

        public async Task MarkAsReadAsync(IEnumerable<Message> messages)
        {
            var now = System.DateTime.UtcNow;
            foreach (var m in messages)
            {
                m.IsRead = true;
                m.UpdatedAt = now;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<Message>> GetByConversationPagedAsync(int conversationId, int skip, int take)
        {
            if (take <= 0) take = 50;
            if (take > 200) take = 200;
            if (skip < 0) skip = 0;

            return await _context.Messages
                .Where(m => m.ConversationId == conversationId)
                .OrderBy(m => m.SentAt)
                .Skip(skip)
                .Take(take)
                .AsNoTracking()
                .ToListAsync();
        }
    }
}

