using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObjects.Domain;

namespace Services.Interface
{
    public interface IConversationService
    {
        Task<Conversation?> GetByParticipantsAsync(int patientUserId, int doctorUserId);
        Task<Conversation> CreateOrGetAsync(int patientUserId, int doctorUserId);
        Task<Conversation?> GetByIdAsync(int conversationId);
        bool IsParticipant(Conversation conversation, int userId);
        Task<List<Conversation>> GetByUserIdAsync(int userId);
    }
}

