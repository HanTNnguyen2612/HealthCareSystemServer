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
        private readonly HealthCareSystemContext _context;

        public DoctorDAO(HealthCareSystemContext context)
        {
            _context = context;
        }
        public async Task<Doctor?> GetDoctorByUserIdAsync(int userId)
        {
            // Quan trọng: Phải .Include(u => u.User) để lấy tên, email...
            return await _context.Doctors
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        public async Task UpdateDoctorAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            // Báo hiệu rằng User cũng bị thay đổi (vì sửa tên, sđt...)
            _context.Entry(doctor.User).State = EntityState.Modified;
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

        public static async Task<IEnumerable<Doctor>> GetAll()
        {
            var _context = new HealthCareSystemContext();

            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .ToListAsync();
        }
    }
}
