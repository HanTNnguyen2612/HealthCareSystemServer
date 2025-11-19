using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class SpecialtyDAO
    {
        public static async Task<List<Specialty>> GetAllSpecialtiesAsync()
        {
            var _context = new HealthCareSystemContext();
            return await _context.Specialties.ToListAsync();
        }
        public static async Task<Specialty> GetSpecialtyByName(string name)
        {
            try
            {
                var _context = new HealthCareSystemContext();

                return await _context.Specialties.FirstOrDefaultAsync(s => s.Name.Equals(name));
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving specialty by name: {name}", ex);
            }
        }
    }
}
