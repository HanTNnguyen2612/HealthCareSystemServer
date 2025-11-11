using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Repositories.Interface;

namespace Repositories.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly MessageDAO _messageDAO;
        public MessageRepository(MessageDAO messageDAO)
        {
            _messageDAO = messageDAO;
        }
        public async Task<Message> CreateAsync(Message message)
        {
            return await _messageDAO.CreateAsync(message);
        }

        public async Task<List<Message>> GetUnreadForConversationAsync(int conversationId, int excludingSenderId)
        {
            return await _messageDAO.GetUnreadForConversationAsync(conversationId, excludingSenderId);
        }

        public async Task MarkAsReadAsync(IEnumerable<Message> messages)
        {
            await _messageDAO.MarkAsReadAsync(messages);
        }

        public async Task<List<Message>> GetByConversationPagedAsync(int conversationId, int skip, int take)
        {
            return await _messageDAO.GetByConversationPagedAsync(conversationId, skip, take);
        }
    }
}

