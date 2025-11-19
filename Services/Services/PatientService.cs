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
            if (patient == null) return null;

            return new PatientProfileDTO
            {
                UserId = patient.UserId,
                // Mapping từ bảng User
                FullName = patient.User.FullName,
                Email = patient.User.Email,
                PhoneNumber = patient.User.PhoneNumber,
                AvatarUrl = patient.User.AvatarUrl,

                // Mapping từ bảng Patient
                Address = patient.Address ?? "",
                Gender = patient.Gender ?? "",
                DateOfBirth = patient.DateOfBirth, // DateOnly map trực tiếp
                BloodType = patient.BloodType ?? "",
                Weight = patient.Weight,
                Height = patient.Height,
                BMI = patient.Bmi,
                EmergencyPhoneNumber = patient.EmergencyPhoneNumber ?? "",

                // Xử lý Allergies: String -> List
                Allergies = !string.IsNullOrEmpty(patient.Allergies)
                            ? patient.Allergies.Split(',').Select(x => x.Trim()).ToList()
                            : new List<string>()
            };
        }

        public async Task<bool> UpdatePatientProfileAsync(UpdatePatientProfileDTO dto)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(dto.UserId);
            if (patient == null) return false;

            // 1. Cập nhật thông tin bảng User
            patient.User.FullName = dto.FullName;
            patient.User.PhoneNumber = dto.PhoneNumber;
            // patient.User.Address = dto.Address; // Lưu ý: Bạn đang để Address ở bảng Patient hay User?
            // Dựa theo Entity Patient bạn gửi, Address nằm ở bảng Patient.

            // 2. Cập nhật thông tin bảng Patient
            patient.Address = dto.Address;
            patient.Gender = dto.Gender;
            patient.DateOfBirth = dto.DateOfBirth; // DateOnly nhận trực tiếp
            patient.EmergencyPhoneNumber = dto.EmergencyContact; // Map từ DTO EmergencyContact
            patient.UpdatedAt = DateTime.UtcNow;

            // 3. Gọi Repository lưu
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
        public async Task<bool> UpdateHealthInfoAsync(UpdateHealthInfoDTO dto)
        {
            var patient = await _patientRepository.GetPatientByUserIdAsync(dto.UserId);
            if (patient == null) return false;

            patient.BloodType = dto.BloodType;
            patient.Weight = dto.Weight;
            patient.Height = dto.Height;

            // Tính toán BMI nếu có đủ Weight và Height
            if (patient.Weight.HasValue && patient.Height.HasValue && patient.Height.Value > 0)
            {
                decimal heightInMeters = (decimal)patient.Height.Value / 100; // cm to m
                patient.Bmi = patient.Weight.Value / (heightInMeters * heightInMeters);
            }
            else
            {
                patient.Bmi = null; // Hoặc giá trị mặc định nếu không đủ dữ liệu
            }

            // Xử lý Allergies
            if (dto.Allergies != null && dto.Allergies.Any())
            {
                patient.Allergies = string.Join(",", dto.Allergies);
            }
            else
            {
                patient.Allergies = null; // Lưu null nếu không có allergies
            }

            patient.UpdatedAt = DateTime.UtcNow; // Cập nhật thời gian sửa đổi

            await _patientRepository.UpdatePatientAsync(patient);
            return true;
        }
    }
}
