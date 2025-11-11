using System.Threading.Tasks;
using BusinessObjects.Domain;

namespace Repositories.Interface
{
    public interface IConversationRepository
    {
        Task<Conversation?> GetByParticipantsAsync(int patientUserId, int doctorUserId);
        Task<Conversation> CreateAsync(int patientUserId, int doctorUserId);
        Task<Conversation?> GetByIdAsync(int conversationId);
    }
}

