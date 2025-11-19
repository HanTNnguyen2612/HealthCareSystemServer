using BusinessObjects.DataTransferObjects.UserDTOs;
using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IUserRepository
    {
        Task<List<UserResponseDTO>> GetAllUsers();
        Task<User?> GetUserByEmail(string email);
        Task<User?> GetUserById(int id);
        Task<User?> CreateUserAsync(User user);
        Task<User?> UpdateUserAsync(string email,UserUpdateRequest request);
        Task<bool> ChangePasswordAsync(string email, ChangePasswordRequest request);
        Task<bool> BanOrUnBanUserAsync(int id);
    }
}
