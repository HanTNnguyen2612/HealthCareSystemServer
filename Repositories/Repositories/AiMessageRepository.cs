using BusinessObjects.Domain;
using DataAccessObjects;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repositories
{
    public class AiMessageRepository : IAiMessageRepository
    {
        public async Task CreateMessage(Aimessage msg)
        {
            try
            {
                await AiConversationDAO.CreateMessage(msg);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task<List<Aimessage>> GetMessagesByUserId(int userId)
        {
            try
            {
                return await AiConversationDAO.GetMessagesByUserId(userId);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task SaveMessage(Aimessage[] msg)
        {
            try
            {
                AiConversationDAO.SaveMessage(msg);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public async Task DeleteMessageByConversationId(int conversationId)
        {
            try
            {
                AiConversationDAO.DeleteMessageByConversationId(conversationId);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}
