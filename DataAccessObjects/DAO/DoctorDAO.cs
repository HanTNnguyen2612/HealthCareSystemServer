using BusinessObjects.DataTransferObjects.PatientDTOs;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class DoctorDAO
    {

        public static async Task<Doctor?> GetDoctorByUserIdAsync(int userId)
        {
            var _context = new HealthCareSystemContext();
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .FirstOrDefaultAsync(d => d.UserId == userId);
        }

        public static async Task UpdateDoctorAsync(Doctor doctor)
        {
            var _context = new HealthCareSystemContext();
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }

        public static async Task<List<Doctor>> GetBySpecialtyAsync(int specialtyId)
        {
            var _context = new HealthCareSystemContext();
            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .Where(d => d.SpecialtyId == specialtyId)
                .ToListAsync();
        }

        public static async Task<IEnumerable<Doctor>> GetAll()
        {
            var _context = new HealthCareSystemContext();

            return await _context.Doctors
                .Include(d => d.User)
                .Include(d => d.Specialty)
                .ToListAsync();
        }

        public static async Task<IEnumerable<PatientProfileDTO>> GetPatientsByDoctorId(int doctorUserId)
        {
            // Đảm bảo kiểu trả về đã được đổi thành DTO
            using (var context = new HealthCareSystemContext())
            {
                try
                {
                    // 1. Lấy danh sách PatientUserId
                    var patientIds = await context.Appointments
                        .Where(a => a.DoctorUserId == doctorUserId)
                        .Select(a => a.PatientUserId)
                        .Distinct()
                        .ToListAsync();

                    if (!patientIds.Any())
                    {
                        // Trả về danh sách DTO rỗng
                        return new List<PatientProfileDTO>();
                    }

                    // 2. Tải Patients và sử dụng Projection sang DTO
                    // Chúng ta không cần .Include(p => p.User) nữa vì phép chiếu (Select) sẽ tự động 
                    // tạo JOIN cần thiết trong SQL.
                    var patientsDto = await context.Patients
                        .Where(p => patientIds.Contains(p.UserId))
                        .Select(p => new PatientProfileDTO
                        {
                            // Thông tin từ User (p.User)
                            UserId = p.UserId, // Giả định UserId nằm trên Patient/User
                            FullName = p.User.FullName,
                            Email = p.User.Email,
                            PhoneNumber = p.User.PhoneNumber,
                            Gender = p.Gender,
                            Address = p.Address,
                            AvatarUrl = p.User.AvatarUrl,

                            // Thông tin từ Patient (p)
                            BloodType = p.BloodType,
                            BMI = p.Bmi,
                            EmergencyPhoneNumber = p.EmergencyPhoneNumber
                        })
                        .ToListAsync(); // Thực thi truy vấn bất đồng bộ và trả về List<PatientProfileDTO>

                    return patientsDto;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error retrieving patients for doctor {doctorUserId}: {ex.Message}");
                    // Trả về danh sách DTO rỗng nếu có lỗi
                    return new List<PatientProfileDTO>();
                }
            }
        }
    }
}
