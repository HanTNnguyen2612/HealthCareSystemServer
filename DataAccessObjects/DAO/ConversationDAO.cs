using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;

namespace DataAccessObjects.DAO
{
    public class ConversationDAO
    {
        private readonly HealthCareSystemContext _context;

        public ConversationDAO(HealthCareSystemContext context)
        {
            _context = context;
        }

        public async Task<Conversation?> GetByParticipantsAsync(int patientUserId, int doctorUserId)
        {
            return await _context.Conversations
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.PatientUserId == patientUserId && c.DoctorUserId == doctorUserId);
        }

        public async Task<Conversation> CreateAsync(int patientUserId, int doctorUserId)
        {
            var convo = new Conversation
            {
                PatientUserId = patientUserId,
                DoctorUserId = doctorUserId,
                CreatedAt = System.DateTime.UtcNow
            };
            _context.Conversations.Add(convo);
            await _context.SaveChangesAsync();
            return convo;
        }

        public async Task<Conversation?> GetByIdAsync(int conversationId)
        {
            return await _context.Conversations.FirstOrDefaultAsync(c => c.ConversationId == conversationId);
        }

        public async Task<List<Conversation>> GetByUserIdAsync(int userId)
        {
            return await _context.Conversations
                .AsNoTracking()
                .Where(c => c.PatientUserId == userId || c.DoctorUserId == userId)
                .Include(c => c.PatientUser)
                .Include(c => c.DoctorUser)
                .Include(c => c.DoctorUser.Doctor)
                    .ThenInclude(d => d.Specialty)
                .Include(c => c.Messages)
                .OrderByDescending(c => c.UpdatedAt ?? c.CreatedAt)
                .ToListAsync();
        }
    }
}

