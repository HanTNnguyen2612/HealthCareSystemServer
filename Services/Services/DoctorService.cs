using BusinessObjects.DataTransferObjects.DoctorDTOs;
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
            var doctor = await _doctorRepository.GetDoctorByUserIdAsync(userId);
            if (doctor == null || doctor.User == null) return null;

            return new DoctorProfileDTO
            {
                UserId = doctor.UserId,
                FullName = doctor.User.FullName ?? string.Empty,
                Email = doctor.User.Email ?? string.Empty,
                PhoneNumber = doctor.User.PhoneNumber ?? string.Empty,
                AvatarUrl = doctor.User.AvatarUrl,
                SpecialtyName = doctor.Specialty?.Name,
                Rating = doctor.Rating
            };
        }

        public async Task<bool> UpdateDoctorProfileAsync(DoctorProfileDTO doctorDto)
        {
            var doctor = await _doctorRepository.GetDoctorByUserIdAsync(doctorDto.UserId);
            if (doctor == null || doctor.User == null) return false;

            // Cập nhật dữ liệu User
            doctor.User.FullName = doctorDto.FullName;
            doctor.User.PhoneNumber = doctorDto.PhoneNumber;
            doctor.User.AvatarUrl = doctorDto.AvatarUrl;

            // Cập nhật dữ liệu Doctor
            doctor.Rating = doctorDto.Rating;

            await _doctorRepository.UpdateDoctorAsync(doctor);
            return true;
        }

        public async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId) =>
            await _doctorRepository.GetBySpecialtyAsync(specialtyId);
    }
}
