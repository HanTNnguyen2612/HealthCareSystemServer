using System.Threading.Tasks;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Repositories.Interface;

namespace Repositories.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        private readonly ConversationDAO _conversationDAO;

        public ConversationRepository(ConversationDAO conversationDAO)
        {
            _conversationDAO = conversationDAO;
        }
        
        public async Task<Conversation?> GetByParticipantsAsync(int patientUserId, int doctorUserId)
        {
            return await _conversationDAO.GetByParticipantsAsync(patientUserId, doctorUserId);
        }

        public async Task<Conversation> CreateAsync(int patientUserId, int doctorUserId)
        {
            return await _conversationDAO.CreateAsync(patientUserId, doctorUserId);
        }

        public async Task<Conversation?> GetByIdAsync(int conversationId)
        {
            return await _conversationDAO.GetByIdAsync(conversationId);
        }
    }
}

