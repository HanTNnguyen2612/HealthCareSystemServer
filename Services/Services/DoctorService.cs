using BusinessObjects.DataTransferObjects.DoctorDTOs;
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
    public class DoctorService : IDoctorService
    {
        private readonly IDoctorRepository _doctorRepository;

        public DoctorService(IDoctorRepository doctorRepository)
        {
            _doctorRepository = doctorRepository;
        }

        public async Task<DoctorProfileDTO?> GetDoctorProfileAsync(int userId)
        {
            // Đảm bảo Repository có Include(d => d.User) và Include(d => d.Specialty)
            var doctor = await _doctorRepository.GetDoctorByUserIdAsync(userId);
            if (doctor == null) return null;

            return new DoctorProfileDTO
            {
                UserId = doctor.UserId,
                // User Info
                FullName = doctor.User.FullName,
                Email = doctor.User.Email,
                PhoneNumber = doctor.User.PhoneNumber,
                AvatarUrl = doctor.User.AvatarUrl,

                // Doctor Info
                SpecialtyId = doctor.SpecialtyId,
                SpecialtyName = doctor.Specialty?.Name ?? "General", // Lấy tên từ bảng Specialty
                Experience = doctor.Experience ?? "", // DB là string
                Bio = doctor.Bio ?? "",
                Rating = doctor.Rating,

                // Logic tách chuỗi: "Bằng A,Bằng B" -> List ["Bằng A", "Bằng B"]
                Qualifications = !string.IsNullOrEmpty(doctor.Qualifications)
                                 ? doctor.Qualifications.Split(',').Select(x => x.Trim()).ToList()
                                 : new List<string>()
            };
        }

        public async Task<bool> UpdateDoctorProfileAsync(UpdateDoctorProfileDTO dto)
        {
            var doctor = await _doctorRepository.GetDoctorByUserIdAsync(dto.UserId);
            if (doctor == null) return false;

            // 1. Update User Info
            doctor.User.FullName = dto.FullName;
            doctor.User.PhoneNumber = dto.PhoneNumber;

            // 2. Update Doctor Info
            // Nếu Frontend gửi SpecialtyId, ta update ID
            if (dto.SpecialtyId.HasValue && dto.SpecialtyId > 0)
            {
                doctor.SpecialtyId = dto.SpecialtyId;
            }

            doctor.Experience = dto.Experience;
            doctor.Bio = dto.Bio;

            // 3. Update Qualifications (Gộp List -> String để lưu DB)
            if (dto.Qualifications != null && dto.Qualifications.Any())
            {
                doctor.Qualifications = string.Join(",", dto.Qualifications);
            }
            else
            {
                doctor.Qualifications = "";
            }

            doctor.UpdatedAt = DateTime.UtcNow;

            await _doctorRepository.UpdateDoctorAsync(doctor);
            return true;
        }

        public async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId) =>
            await _doctorRepository.GetBySpecialtyAsync(specialtyId);

        public async Task<IEnumerable<DoctorProfileDTO>> GetAllDoctors() 
        {
            var doctors = await _doctorRepository.GetAll();

            var profileList = doctors.Select(doctor =>
            {
                if (doctor.User == null) return null;

                return new DoctorProfileDTO
                {
                    UserId = doctor.UserId,
                    FullName = doctor.User.FullName ?? string.Empty,
                    Email = doctor.User.Email ?? string.Empty,
                    PhoneNumber = doctor.User.PhoneNumber ?? string.Empty,
                    AvatarUrl = doctor.User.AvatarUrl,
                    SpecialtyName = doctor.Specialty?.Name,
                    Rating = doctor.Rating,
                    Bio = doctor.Bio 
                };
            })
            .Where(dto => dto != null)
            .ToList();

            return profileList;
        }

        public async Task<IEnumerable<PatientProfileDTO>> GetPatientsByDoctorId(int doctorUserId) => await _doctorRepository.GetPatientsByDoctorId(doctorUserId);
    }
}

