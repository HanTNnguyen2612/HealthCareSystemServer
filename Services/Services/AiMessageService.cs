using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class AiMessageService : IAiMessageService
    {
        private readonly IAiMessageRepository _repository;
        public AiMessageService(IAiMessageRepository repository)
        {
            _repository = repository;
        }
        public Task CreateMessage(Aimessage msg) => _repository.CreateMessage(msg);
        public Task<List<Aimessage>> GetMessagesByUserId(int userId) => _repository.GetMessagesByUserId(userId);
        public Task SaveMessage(Aimessage[] msg) => _repository.SaveMessage(msg);
        public Task DeleteMessageByConversationId(int conversationId) => _repository.DeleteMessageByConversationId(conversationId);
    }
}
