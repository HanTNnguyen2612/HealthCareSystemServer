using BusinessObjects;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects
{
    public class AiConversationDAO
    {
        public static async Task CreateConversation(Aiconversation conversation)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                await _context.Aiconversations.AddAsync(conversation);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public static async Task<Aiconversation> GetConversationByUserId(int userId)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                return await _context.Aiconversations.FirstOrDefaultAsync(c => c.UserId == userId);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public static async Task UpdateConversation(Aiconversation conversation)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                _context.Entry<Aiconversation>(conversation).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public static async Task CreateMessage(Aimessage msg)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                _context.Aimessages.Add(msg);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public static async Task<List<Aimessage>> GetMessagesByUserId(int userId)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                return await _context.Aimessages.Where(m => m.UserId == userId).OrderBy(m => m.SentAt).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public static async Task SaveMessage(Aimessage[] msg)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                _context.Aimessages.AddRange(msg);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        public static async Task DeleteMessageByConversationId(int conversationId)
        {
            try
            {
                var _context = new HealthCareSystemContext();
                var deleteMessages = await _context.Aimessages.Where(m => m.UserId == conversationId).ToListAsync();
                _context.Aimessages.RemoveRange(deleteMessages);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}