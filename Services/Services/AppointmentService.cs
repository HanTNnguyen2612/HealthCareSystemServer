using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.Domain;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly DataAccessObjects.DAO.AppointmentDAO _appointmentDAO;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;

        public AppointmentService(DataAccessObjects.DAO.AppointmentDAO appointmentDAO, IDoctorService doctorService, IPatientService patientService)
        {
            _appointmentDAO = appointmentDAO;
            _doctorService = doctorService;
            _patientService = patientService;
        }
        public async Task<List<AppointmentResponse>> GetAll()
        {
            var results = new List<AppointmentResponse>();
            var appointments =  await _appointmentDAO.GetAll();
            foreach (var appointment in appointments)
            {
                var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
                var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);

                results.Add(new AppointmentResponse
                {
                    AppointmentId = appointment.AppointmentId,
                    DoctorName = doctor.FullName,
                    PatientName = patient.FullName,
                    AppointmentDateTime = appointment.AppointmentDateTime,
                    Notes = appointment.Notes,
                    CreatedAt = appointment.CreatedAt,
                    UpdatedAt = appointment.UpdatedAt,
                    Status = appointment.Status
                });
            }

            return results;
        }
        public async Task<AppointmentResponse?> GetByIdAsync(int appointmentId)
        {
            var appointment = await _appointmentDAO.GetByIdAsync(appointmentId);
            if (appointment == null) return null;
            var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
            var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);
            return new AppointmentResponse
            {
                AppointmentId = appointment.AppointmentId,
                DoctorName = doctor.FullName,
                PatientName = patient.FullName,
                AppointmentDateTime = appointment.AppointmentDateTime,
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt,
                Status = appointment.Status
            };

        }


        public async Task<AppointmentResponse?> GetByDetailsAsync(int doctorId, int patientId)
        {
            var appointment = await _appointmentDAO.GetByDetailsAsync(doctorId, patientId);
            if (appointment == null) return null;
            var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
            var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);
            return new AppointmentResponse
            {
                AppointmentId = appointment.AppointmentId,
                DoctorName = doctor.FullName,
                PatientName = patient.FullName,
                AppointmentDateTime = appointment.AppointmentDateTime,
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt,
                Status = appointment.Status
            };

        }


        public async Task<AppointmentResponse> CreateAsync(AppointmentAddRequest appointment)
        {
            var appointmentEntity = new Appointment
            {
                DoctorUserId = appointment.DoctorUserId,
                PatientUserId = appointment.PatientUserId,
                AppointmentDateTime = appointment.AppointmentDateTime,
                Notes = appointment.Notes,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = "Pending"
            };
            var createdAppointment = await _appointmentDAO.CreateAsync(appointmentEntity);
            var doctor = await _doctorService.GetDoctorProfileAsync(createdAppointment.DoctorUserId);
            var patient = await _patientService.GetPatientProfileAsync(createdAppointment.PatientUserId);
            return new AppointmentResponse
            {
                AppointmentId = createdAppointment.AppointmentId,
                DoctorName = doctor.FullName,
                PatientName = patient.FullName,
                AppointmentDateTime = createdAppointment.AppointmentDateTime,
                Notes = createdAppointment.Notes,
                CreatedAt = createdAppointment.CreatedAt,
                UpdatedAt = createdAppointment.UpdatedAt,
                Status = createdAppointment.Status
            };
        }

        public async Task<AppointmentResponse> UpdateAsync(AppoimentUpdateRequest appointment , int appointmentid)
        {
            var appointmentEntity = new Appointment
            {
                AppointmentId = appointmentid,
                DoctorUserId = appointment.DoctorUserId,
                PatientUserId = appointment.PatientUserId,
                AppointmentDateTime = appointment.AppointmentDateTime,
                Notes = appointment.Notes,
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = DateTime.UtcNow,
                Status = appointment.Status
            };
            var updatedAppointment = await _appointmentDAO.UpdateAsync(appointmentEntity);
            var doctor = await _doctorService.GetDoctorProfileAsync(updatedAppointment.DoctorUserId);
            var patient = await _patientService.GetPatientProfileAsync(updatedAppointment.PatientUserId);
            return new AppointmentResponse
            {
                AppointmentId = updatedAppointment.AppointmentId,
                DoctorName = doctor.FullName,
                PatientName = patient.FullName,
                AppointmentDateTime = updatedAppointment.AppointmentDateTime,
                Notes = updatedAppointment.Notes,
                CreatedAt = updatedAppointment.CreatedAt,
                UpdatedAt = updatedAppointment.UpdatedAt,
                Status = updatedAppointment.Status
            };
        }


        public async Task<bool> DeleteAsync(int appointmentId)
        {
            return await _appointmentDAO.DeleteAsync(appointmentId);
        }
    }
}
