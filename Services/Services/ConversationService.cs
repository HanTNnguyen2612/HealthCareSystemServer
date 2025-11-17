using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;

namespace Services.Services
{
    public class ConversationService : IConversationService
    {
        private readonly IConversationRepository _repository;

        public ConversationService(IConversationRepository repository)
        {
            _repository = repository;
        }

        public async Task<Conversation?> GetByParticipantsAsync(int patientUserId, int doctorUserId)
        {
            return await _repository.GetByParticipantsAsync(patientUserId, doctorUserId);
        }

        public async Task<Conversation> CreateOrGetAsync(int patientUserId, int doctorUserId)
        {
            var existing = await _repository.GetByParticipantsAsync(patientUserId, doctorUserId);
            if (existing != null) return existing;
            return await _repository.CreateAsync(patientUserId, doctorUserId);
        }

        public async Task<Conversation?> GetByIdAsync(int conversationId)
        {
            return await _repository.GetByIdAsync(conversationId);
        }

        public bool IsParticipant(Conversation conversation, int userId)
        {
            return conversation.PatientUserId == userId || conversation.DoctorUserId == userId;
        }

        public async Task<List<Conversation>> GetByUserIdAsync(int userId)
        {
            return await _repository.GetByUserIdAsync(userId);
        }
    }
}

