using BusinessObjects.DataTransferObjects.PatientDTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IPatientService
    {
        Task<PatientProfileDTO?> GetPatientProfileAsync(int userId);
        Task<bool> UpdatePatientProfileAsync(UpdatePatientProfileDTO updatePatientDto);
        Task<bool> CreatePatientProfileAsync(CreatePatientDTO patientDto);
        Task<bool> UpdateHealthInfoAsync(UpdateHealthInfoDTO dto);
    }
}
