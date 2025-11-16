using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class AppointmentDAO
    {
        private readonly HealthCareSystemContext _context;

        public AppointmentDAO(HealthCareSystemContext context)
        {
            _context = context;
        }

        public async Task<List<Appointment>> GetAll()
        {
            return await _context.Appointments
                .Include(p => p.DoctorUser)
                .Include(d => d.PatientUser)
                .ToListAsync();
        }
        public async Task<Appointment?> GetByIdAsync(int appointmentId)
        {
            return await _context.Appointments
                .Include(p => p.DoctorUser)
                .Include(d => d.PatientUser)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

        }

        public async Task<List<Appointment>> GetByDoctorId(int doctorId)
        {
            return await _context.Appointments
                .Include(p => p.DoctorUser)
                .Include(d => d.PatientUser)
                .Where(a => a.DoctorUserId == doctorId)
                .ToListAsync();
        }

        public async Task<List<Appointment>> GetByUserId(int patientId)
        {
            return await _context.Appointments
                .Include(p => p.DoctorUser)
                .Include(d => d.PatientUser)
                .Where(a => a.PatientUserId == patientId)
                .ToListAsync();
        }


        public async Task<Appointment?> GetByDetailsAsync(int doctorId, int patientId)
        {
            return await _context.Appointments
                .Include(p => p.DoctorUser)
                .Include(d => d.PatientUser)
                .FirstOrDefaultAsync(a => a.DoctorUserId == doctorId && a.PatientUserId == patientId);
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();
            return appointment;
        }
        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            var existingAppointment = await _context.Appointments.FindAsync(appointment.AppointmentId);
            if (existingAppointment == null) return null;

            _context.Entry(existingAppointment).CurrentValues.SetValues(appointment);
            await _context.SaveChangesAsync();
            return existingAppointment;
        }

        public async Task<bool> DeleteAsync(int appointmentId)
        {
            var appointment = await _context.Appointments.FindAsync(appointmentId);
            if (appointment == null) return false;
            appointment.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<List<Specialty?>> GetAllSpecialtiesAsync()
        {
            var result = await _context.Specialties.ToListAsync();
            if (result == null) return null;
            return result;
        }




        public async Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime)
        {
            return await _context.Appointments.AnyAsync(a =>
                a.DoctorUserId == doctorId &&
                a.AppointmentDateTime == dateTime &&
                a.Status != "Cancelled");
        }

        public async Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime, int excludeAppointmentId)
        {
            return await _context.Appointments.AnyAsync(a =>
                a.DoctorUserId == doctorId &&
                a.AppointmentDateTime == dateTime &&
                a.Status != "Cancelled" &&
                a.AppointmentId != excludeAppointmentId);
        }


        public async Task<List<DoctorSpecialtyResponse>> GetAllUsersAsync(int specialtyid)
        {
            var users = await _context.Users
                .Include(u => u.Doctor)
                .Where(u => u.Doctor.SpecialtyId != null && u.Doctor.SpecialtyId == specialtyid)
                .Select(Specialty => new DoctorSpecialtyResponse
                {
                    UserId = Specialty.UserId,
                    FullName = Specialty.FullName,
                    AvatarUrl = Specialty.AvatarUrl,
                    SpecialtyId = Specialty.Doctor.SpecialtyId,
                    SpecialtyName = Specialty.Doctor.Specialty!.Name,
                    Qualifications = Specialty.Doctor.Qualifications,
                    Experience = Specialty.Doctor.Experience,
                    Rating = Specialty.Doctor.Rating
                }).ToListAsync();
            if (users == null) return null;
            return users;
        }
    }
}
