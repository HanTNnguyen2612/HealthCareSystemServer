using BusinessObjects.DataTransferObjects.PatientDTOs;
using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class PatientService : IPatientService
    {
        private readonly IPatientRepository _patientRepository;

        public PatientService(IPatientRepository patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<PatientProfileDTO?> GetPatientProfileAsync(int userId)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(userId);
            if (patient == null || patient.User == null) return null;

            return new PatientProfileDTO
            {
                UserId = patient.UserId,
                FullName = patient.User.FullName ?? string.Empty,
                Email = patient.User.Email ?? string.Empty,
                PhoneNumber = patient.User.PhoneNumber ?? string.Empty,
                Gender = patient.Gender ?? string.Empty,
                Address = patient.Address ?? string.Empty,
                BloodType = patient.BloodType ?? string.Empty,
                BMI = patient.Bmi,
                EmergencyPhoneNumber = patient.EmergencyPhoneNumber ?? string.Empty,
                AvatarUrl = patient.User.AvatarUrl
            };
        }

        public async Task<bool> UpdatePatientProfileAsync(PatientProfileDTO patientDto)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(patientDto.UserId);
            if (patient == null || patient.User == null) return false;

            // Cập nhật dữ liệu User
            patient.User.FullName = patientDto.FullName;
            patient.User.PhoneNumber = patientDto.PhoneNumber;
            patient.User.AvatarUrl = patientDto.AvatarUrl;

            // Cập nhật dữ liệu Patient
            patient.Gender = patientDto.Gender;
            patient.Address = patientDto.Address;
            patient.BloodType = patientDto.BloodType;
            patient.Bmi = patientDto.BMI;
            patient.EmergencyPhoneNumber = patientDto.EmergencyPhoneNumber;

            await _patientRepository.UpdatePatientAsync(patient);
            return true;
        }

        public async Task<bool> CreatePatientProfileAsync(CreatePatientDTO patientDto)
        {
            try
            {
                // Kiểm tra xem patient đã tồn tại chưa
                var existingPatient = await _patientRepository.GetPatientByUserIdAsync(patientDto.UserId);
                if (existingPatient != null)
                {
                    return false; // Patient đã tồn tại
                }

                // Tạo patient mới (UserId đã được validate từ register)
                var newPatient = new Patient
                {
                    UserId = patientDto.UserId,
                    DateOfBirth = patientDto.DateOfBirth,
                    Gender = patientDto.Gender,
                    BloodType = patientDto.BloodType,
                    Allergies = patientDto.Allergies,
                    Weight = patientDto.Weight,
                    Height = patientDto.Height,
                    Bmi = patientDto.BMI,
                    Address = patientDto.Address,
                    EmergencyPhoneNumber = patientDto.EmergencyPhoneNumber,
                    CreatedAt = DateTime.UtcNow
                };

                var createdPatient = await _patientRepository.CreatePatientAsync(newPatient);
                return createdPatient != null;
            }
            catch (Exception)
            {
                // Re-throw to be handled by controller
                throw;
            }
        }
    }
}
