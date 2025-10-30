using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class PatientDAO
    {
        private readonly HealthCareSystemContext _context;

        public PatientDAO(HealthCareSystemContext context)
        {
            _context = context;
        }

        public async Task<Patient?> GetPatientByUserIdAsync(int userId)
        {
            return await _context.Patients
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }

        public async Task UpdatePatientAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }
    }
}
