using BusinessObjects.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessObjects.DAO
{
    public class UserDAO
    {
        private static readonly HealthCareSystemContext _context = new HealthCareSystemContext();

        public static async Task<List<User>> GetAllUsers()
        {
            return await _context.Users.ToListAsync();
        } 
        public static async Task<User?> GetUserByEmail(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
        public static async Task<User?> GetUserById(int Id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.UserId == Id);
        }
        public static async Task<User?> CreateUserAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
            return user;
        }

        public static async Task<User?> UpdateUserAsync(User userToUpdate)
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userToUpdate.UserId);

            if (existingUser == null)
            {
                return null;
            }
            existingUser.Email = userToUpdate.Email;
            existingUser.Email = userToUpdate.Password;
            existingUser.FullName = userToUpdate.FullName;
            existingUser.PhoneNumber = userToUpdate.PhoneNumber;
            existingUser.AvatarUrl = userToUpdate.AvatarUrl;
            existingUser.UpdatedAt = DateTime.UtcNow;
            existingUser.IsActive = userToUpdate.IsActive;
            await _context.SaveChangesAsync();
            return existingUser;
        }
    }
}
