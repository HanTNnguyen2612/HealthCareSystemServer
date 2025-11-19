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
        private readonly DoctorDAO _doctorDAO;

        public DoctorRepository(DoctorDAO doctorDAO)
        {
            _doctorDAO = doctorDAO;
        }
        public async Task<Doctor?> GetDoctorByUserIdAsync(int userId)
        {
            return await _doctorDAO.GetDoctorByUserIdAsync(userId);
        }

        public async Task UpdateDoctorAsync(Doctor doctor)
        {
            await _doctorDAO.UpdateDoctorAsync(doctor);
        }
        public async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId)
            => await DoctorDAO.GetBySpecialtyAsync(specialtyId);

        public async Task<IEnumerable<Doctor>> GetAll() => await DoctorDAO.GetAll();

        public  async Task<IEnumerable<PatientProfileDTO>> GetPatientsByDoctorId(int doctorUserId) => await DoctorDAO.GetPatientsByDoctorId(doctorUserId);
    }
}

