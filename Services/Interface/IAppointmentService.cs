using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IAppointmentService
    {
        Task<List<AppointmentResponse>> GetAll();
        Task<AppointmentResponse?> GetByIdAsync(int appointmentId);
        Task<AppointmentResponse?> GetByDetailsAsync(int doctorId, int patientId);
        Task<AppointmentResponse> CreateAsync(AppointmentAddRequest appointment);

        Task<List<AppointmentResponse?>> GetByDoctorId(int doctorId);

        Task<List<Specialty?>> GetAllSpecialtiesAsync();
        Task<List<AppointmentResponse?>> GetByUserId(int patientId);

        Task<List<AppointmentResponse?>> GetStatusPatientId(String status, int patientid);

        Task<List<AppointmentResponse?>> GetStatusDoctorId(String status, int doctorid);
        Task<AppointmentResponse> UpdateAsync(AppoimentUpdateRequest appointment, int appointmentid);
        Task<bool> DeleteAsync(int appointmentId);

        Task<List<DoctorSpecialtyResponse>> GetAllUsersAsync(int specialtyid);
        Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime);

        Task<bool> IsTimeSlotBookedAsync(int doctorId, DateTime dateTime, int excludeAppointmentId);

        Task<AppointmentResponseDetails?> GetAppointmentForDoctorAsync(int appointmentId);

        Task<bool?> UpdateRejectAsync(RejectRequest dto);

        Task<bool?> RequestConfirm(ConfirmRequest dto);

        Task<bool?> RequestCompleted(RejectRequest dto);
    }
}
