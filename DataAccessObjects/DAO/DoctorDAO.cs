using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class DoctorDAO
    {

        public static async Task<Doctor?> GetDoctorByUserIdAsync(int userId)
        {
            var _context = new HealthCareSystemContext();
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        public static async Task UpdateDoctorAsync(Doctor doctor)
        {
            var _context = new HealthCareSystemContext();
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }

        public static async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId)
        {
            var _context = new HealthCareSystemContext();
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .Where(d => d.SpecialtyId == specialtyId)
                .ToListAsync();
        }
    }
}
