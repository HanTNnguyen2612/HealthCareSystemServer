using BusinessObjects;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Microsoft.EntityFrameworkCore;
using Repositories.Interface;

namespace Repositories.Repositories
{
    public class SpecialtyRepository : ISpecialtyRepository
    {
        public async Task<List<Specialty>> GetAllSpecialtiesAsync()
        {
            return await SpecialtyDAO.GetAllSpecialtiesAsync();
        }
        public async Task<Specialty> GetSpecialtyByName(string name)
        {
            try
            {
                return await SpecialtyDAO.GetSpecialtyByName(name);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving specialty by name: {name}", ex);
            }
        }
    }
}
