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
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        public async Task UpdateDoctorAsync(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }
    }
}
