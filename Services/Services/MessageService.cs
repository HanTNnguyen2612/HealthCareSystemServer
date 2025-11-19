using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;

namespace Services.Services
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _repository;

        public MessageService(IMessageRepository repository)
        {
            _repository = repository;
        }

        public async Task<Message> CreateAsync(Message message)
        {
            return await _repository.CreateAsync(message);
        }

        public async Task<List<Message>> GetUnreadForConversationAsync(int conversationId, int excludingSenderId)
        {
            return await _repository.GetUnreadForConversationAsync(conversationId, excludingSenderId);
        }

        public async Task MarkAsReadAsync(IEnumerable<Message> messages)
        {
            await _repository.MarkAsReadAsync(messages);
        }

        public async Task<List<Message>> GetByConversationPagedAsync(int conversationId, int skip, int take)
        {
            return await _repository.GetByConversationPagedAsync(conversationId, skip, take);
        }
    }
}

