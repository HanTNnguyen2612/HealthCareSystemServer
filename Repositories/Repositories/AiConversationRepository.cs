using BusinessObjects.Domain;
using Repositories.Interface;
using DataAccessObjects;

namespace Repositories.Repositories
{
    public class AiConversationRepository : IAiConversationRepository
    {
        public async Task CreateConversation(Aiconversation conversation)
        {
            try
            {
                await AiConversationDAO.CreateConversation(conversation);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task<Aiconversation> GetConversationByUserId(int userId)
        {
            try
            {
                return await AiConversationDAO.GetConversationByUserId(userId);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task UpdateConversation(Aiconversation conversation)
        {
            try
            {
                await AiConversationDAO.UpdateConversation(conversation);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
