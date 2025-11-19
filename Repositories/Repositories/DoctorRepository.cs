using BusinessObjects.DataTransferObjects.PatientDTOs;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Microsoft.EntityFrameworkCore;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repositories
{
    public class DoctorRepository : IDoctorRepository
    {
        public async Task<Doctor?> GetDoctorByUserIdAsync(int userId)
            => await DoctorDAO.GetDoctorByUserIdAsync(userId);

        public async Task UpdateDoctorAsync(Doctor doctor)
            => await DoctorDAO.UpdateDoctorAsync(doctor);
        public async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId)
            => await DoctorDAO.GetBySpecialtyAsync(specialtyId);

        public async Task<IEnumerable<Doctor>> GetAll() => await DoctorDAO.GetAll();

        public  async Task<IEnumerable<PatientProfileDTO>> GetPatientsByDoctorId(int doctorUserId) => await DoctorDAO.GetPatientsByDoctorId(doctorUserId);
    }
}

