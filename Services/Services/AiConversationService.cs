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
    public class AiConversationService : IAiConversationService
    {
        private readonly IAiConversationRepository _repository;
        public AiConversationService(IAiConversationRepository repository)
        {
            _repository = repository;
        }
        public Task CreateConversation(Aiconversation conversation) => _repository.CreateConversation(conversation);
        public Task<Aiconversation> GetConversationByUserId(int userId) => _repository.GetConversationByUserId(userId);
        public Task UpdateConversation(Aiconversation conversation) => _repository.UpdateConversation(conversation);
    }
}
