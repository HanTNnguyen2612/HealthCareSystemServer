using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Service
{
    public class SpecialtyService : ISpecialtyService
    {
        private readonly ISpecialtyRepository _specialtyRepository;
        public SpecialtyService(ISpecialtyRepository specialtyRepository)
        {
            _specialtyRepository = specialtyRepository;
        }
        public async Task<List<Specialty>> GetAllSpecialtiesAsync() => 
            await _specialtyRepository.GetAllSpecialtiesAsync();
        public async Task<Specialty> GetSpecialtyByName(string name) => 
            await _specialtyRepository.GetSpecialtyByName(name);
    }
}
