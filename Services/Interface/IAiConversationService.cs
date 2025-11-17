using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IAiConversationService
    {
        Task<Aiconversation> GetConversationByUserId(int userId);
        Task CreateConversation(Aiconversation conversation);
        Task UpdateConversation(Aiconversation conversation);
    }
}
