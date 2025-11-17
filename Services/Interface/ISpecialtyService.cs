using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface ISpecialtyService
    {
        Task<List<Specialty>> GetAllSpecialtiesAsync();
        Task<Specialty> GetSpecialtyByName(string name);
    }
}
