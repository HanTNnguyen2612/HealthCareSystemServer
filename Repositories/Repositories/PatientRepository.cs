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
    public class PatientRepository : IPatientRepository
    {
        private readonly PatientDAO _patientDAO;

        public PatientRepository(PatientDAO patientDAO)
        {
            _patientDAO = patientDAO;
        }

        public Task<Patient?> GetPatientByUserIdAsync(int userId)
            => _patientDAO.GetPatientByUserIdAsync(userId);

        public Task UpdatePatientAsync(Patient patient)
            => _patientDAO.UpdatePatientAsync(patient);
    }
}
