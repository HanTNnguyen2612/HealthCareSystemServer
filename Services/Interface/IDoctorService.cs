using BusinessObjects.DataTransferObjects.DoctorDTOs;
using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IDoctorService
    {
        Task<DoctorProfileDTO?> GetDoctorProfileAsync(int userId);
        Task<bool> UpdateDoctorProfileAsync(DoctorProfileDTO doctorDto);
        Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId);
    }
}
