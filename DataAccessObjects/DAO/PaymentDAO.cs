using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class PaymentDAO
    {
        private readonly HealthCareSystemContext _context;

        public PaymentDAO(HealthCareSystemContext context)
        {
            _context = context;
        }

        public async Task<List<Payment>> GetAll()
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .ToListAsync();
        }

        public async Task<Payment?> GetByIdAsync(int paymentId)
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);
        }

        public async Task<Payment?> GetByTransactionIdAsync(string transactionId)
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
        }

        public async Task<Payment?> GetByPaymentLinkIdAsync(string paymentLinkId)
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .FirstOrDefaultAsync(p => p.PaymentLinkId == paymentLinkId);
        }

        public async Task<List<Payment>> GetByPatientIdAsync(int patientId)
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .Where(p => p.PatientUserId == patientId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Payment>> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _context.Payments
                .Include(p => p.PatientUser)
                .Where(p => p.AppointmentId == appointmentId)
                .ToListAsync();
        }

        public async Task<Payment> CreateAsync(Payment payment)
        {
            payment.CreatedAt = DateTime.UtcNow;
            payment.UpdatedAt = DateTime.UtcNow;
            await _context.Payments.AddAsync(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment> UpdateAsync(Payment payment)
        {
            payment.UpdatedAt = DateTime.UtcNow;
            _context.Payments.Update(payment);
            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<bool> DeleteAsync(int paymentId)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null) return false;
            _context.Payments.Remove(payment);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

