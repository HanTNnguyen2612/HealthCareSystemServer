using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.DataTransferObjects.PaymentDTOs;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly DataAccessObjects.DAO.AppointmentDAO _appointmentDAO;
        private readonly IDoctorService _doctorService;
        private readonly IPatientService _patientService;
        private readonly IPaymentService? _paymentService;



        public AppointmentService(DataAccessObjects.DAO.AppointmentDAO appointmentDAO, IDoctorService doctorService, IPatientService patientService, IPaymentService? paymentService = null)
        {
            _appointmentDAO = appointmentDAO;
            _doctorService = doctorService;
            _patientService = patientService;
            _paymentService = paymentService;
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
                    doctorid = appointment.DoctorUserId,
                    patientid = appointment.PatientUserId,
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
                doctorid = appointment.DoctorUserId,
                patientid = appointment.PatientUserId,
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

        public async Task<AppointmentResponseDetails?> GetAppointmentForDoctorAsync(int appointmentId)
        {
            var appointment = await _appointmentDAO.GetByIdAsync(appointmentId);
            if (appointment == null) return null;
            var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
            var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);
            return new AppointmentResponseDetails
            {
                PatientUserId                     = appointment.PatientUserId,
                DoctorUserId                      = appointment.DoctorUserId,
                Status                            = appointment.Status,
                AppointmentDateTime               = appointment.AppointmentDateTime,
                AppointmentId                     = appointment.AppointmentId,
                Notes                             = appointment.Notes,
                CreatedAt                         = appointment.CreatedAt,
                UpdatedAt                         = appointment.UpdatedAt,
                PatientAvatarUrl                  = patient.AvatarUrl,
                PatientName                       = patient.FullName,
                DoctorName                        = doctor.FullName,
                PatientEmail                      = patient.Email,
                PatientPhoneNumber                = patient.PhoneNumber,
                PatientDateOfBirth                = appointment.PatientUser.DateOfBirth,
                PatientGender                     = patient.Gender,
                PatientAddress                    = patient.Address,
                PatientEmergencyPhoneNumber       = patient.EmergencyPhoneNumber,
                PatientBloodType                  = patient.BloodType,
                PatientAllergies                  = appointment.PatientUser.Allergies,
                PatientWeight                     = appointment.PatientUser.Weight,
                PatientHeight                     = appointment.PatientUser.Height,
                PatientBmi                        = appointment.PatientUser.Bmi
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
                doctorid = appointment.DoctorUserId,
                patientid = appointment.PatientUserId,
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
                doctorid = appointment.DoctorUserId,
                patientid = appointment.PatientUserId,
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
                doctorid = appointment.DoctorUserId,
                patientid = appointment.PatientUserId,
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



        public async Task<List<AppointmentResponse?>> GetByDoctorId(int doctorId)
        {
            var results = new List<AppointmentResponse>();
            var appointments = await _appointmentDAO.GetByDoctorId(doctorId);
            foreach (var appointment in appointments)
            {
                var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
                var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);

                results.Add(new AppointmentResponse
                {
                    doctorid = appointment.DoctorUserId,
                    patientid = appointment.PatientUserId,
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

        public async Task<List<AppointmentResponse?>> GetByUserId(int patientId)
        {
            var results = new List<AppointmentResponse>();
            var appointments = await _appointmentDAO.GetByUserId(patientId);
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

        public async Task<List<AppointmentResponse?>> GetStatusPatientId(String status , int patientid)
        {
            var results = new List<AppointmentResponse>();
            var appointments = await _appointmentDAO.GetByUserId(patientid);
            foreach (var appointment in appointments)
            {
              if (appointment.Status == status)
                {
                    var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
                    var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);

                    results.Add(new AppointmentResponse
                    {
                        doctorid = appointment.DoctorUserId,
                        patientid = appointment.PatientUserId,
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
            }

            return results;
        }

        public async Task<List<AppointmentResponse?>> GetStatusDoctorId(String status, int doctorid)
        {
            var results = new List<AppointmentResponse>();
            var appointments = await _appointmentDAO.GetByDoctorId(doctorid);
            foreach (var appointment in appointments)
            {
                if (appointment.Status == status)
                {
                    var doctor = await _doctorService.GetDoctorProfileAsync(appointment.DoctorUserId);
                    var patient = await _patientService.GetPatientProfileAsync(appointment.PatientUserId);

                    results.Add(new AppointmentResponse
                    {
                        doctorid = appointment.DoctorUserId,
                        patientid = appointment.PatientUserId,
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
            }

            return results;
        }

        public async Task<List<AppointmentResponse>> GetAppointmentsByWeekAsync(int doctorId, DateTime weekStart)
        {
            var appointment = _appointmentDAO.GetAppointmentsByWeekAsync(doctorId, weekStart);
            var results = new List<AppointmentResponse>();
            foreach (var app in await appointment)
            {
                var doctor = await _doctorService.GetDoctorProfileAsync(app.DoctorUserId);
                var patient = await _patientService.GetPatientProfileAsync(app.PatientUserId);
                results.Add(new AppointmentResponse
                {
                    doctorid = app.DoctorUserId,
                    patientid = app.PatientUserId,
                    AppointmentId = app.AppointmentId,
                    DoctorName = doctor.FullName,
                    PatientName = patient.FullName,
                    AppointmentDateTime = app.AppointmentDateTime,
                    Notes = app.Notes,
                    CreatedAt = app.CreatedAt,
                    UpdatedAt = app.UpdatedAt,
                    Status = app.Status
                });
            }
            return results;

        }


        public async Task<List<Specialty?>> GetAllSpecialtiesAsync()
        {
            return await _appointmentDAO.GetAllSpecialtiesAsync();
        }



        public async Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime)
        {
            return await _appointmentDAO.IsTimeSlotBookedAsync(doctorId, dateTime);
        }

        public async Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime, int excludeAppointmentId)
        {
            return await _appointmentDAO.IsTimeSlotBookedAsync(doctorId, dateTime, excludeAppointmentId);
        }

        public async Task<List<DoctorSpecialtyResponse>> GetAllUsersAsync(int specialtyid)
        {
            return await _appointmentDAO.GetAllUsersAsync(specialtyid);
        }

        public async Task<bool?> UpdateRejectAsync(RejectRequest dto)
        {
            var appointment = await _appointmentDAO.GetByIdAsync(dto.AppointmentId);
            if (appointment == null) return false;
            appointment.Status = "Cancelled";
            appointment.UpdatedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(dto.Notes))
            {
                appointment.Notes = $"Cancelled by doctor: {dto.Notes}";
            }
            await _appointmentDAO.UpdateAsync(appointment);
            return true;
        }


        public async Task<bool?> RequestConfirm(ConfirmRequest dto)
        {
            var appointment = await _appointmentDAO.GetByIdAsync(dto.AppointmentId);
            if (appointment == null) return false;
            appointment.Status = "Confirmed";
            appointment.UpdatedAt = DateTime.UtcNow;
            await _appointmentDAO.UpdateAsync(appointment);
            return true;
        }

        public async Task<bool?> RequestCompleted(RejectRequest dto)
        {
            var appointment = await _appointmentDAO.GetByIdAsync(dto.AppointmentId);
            if (appointment == null) return false;
            appointment.Status = "Completed";
            appointment.UpdatedAt = DateTime.UtcNow;
            await _appointmentDAO.UpdateAsync(appointment);
            return true;
        }


        public async Task<IEnumerable<TimeOff>> GetTimeOffByDoctoridAsync(int doctorid)
        {
            var result = await _appointmentDAO.GetTimeOffByDoctoridAsync(doctorid);
            return result;
        }
    }
}
