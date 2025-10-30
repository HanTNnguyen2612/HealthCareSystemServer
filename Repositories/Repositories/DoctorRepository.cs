using BusinessObjects.Domain;
using DataAccessObjects.DAO;
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

        public Task<Doctor?> GetDoctorByUserIdAsync(int userId)
            => _doctorDAO.GetDoctorByUserIdAsync(userId);

        public Task UpdateDoctorAsync(Doctor doctor)
            => _doctorDAO.UpdateDoctorAsync(doctor);
    }
}

