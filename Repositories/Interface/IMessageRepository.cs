using System.Collections.Generic;
using System.Threading.Tasks;
using BusinessObjects.Domain;

namespace Repositories.Interface
{
    public interface IMessageRepository
    {
        Task<Message> CreateAsync(Message message);
        Task<List<Message>> GetUnreadForConversationAsync(int conversationId, int excludingSenderId);
        Task MarkAsReadAsync(IEnumerable<Message> messages);
        Task<List<Message>> GetByConversationPagedAsync(int conversationId, int skip, int take);
    }
}

