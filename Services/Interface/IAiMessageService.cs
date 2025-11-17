using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IAiMessageService
    {
        Task CreateMessage(Aimessage msg);
        Task<List<Aimessage>> GetMessagesByUserId(int userId);
        Task SaveMessage(Aimessage[] msg);
        Task DeleteMessageByConversationId(int conversationId);
    }
}
