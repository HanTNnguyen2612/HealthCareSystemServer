using BusinessObjects.DataTransferObjects.UserDTOs;
using BusinessObjects.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Interface
{
    public interface IUserService
    {
        Task<User?> GetUserByEmail(string email);
        Task<User?> CreateUserAsync(User user);
        Task<User?> UpdateUserAsync(string email, UserUpdateRequest request);
        Task<bool> ChangePasswordAsync(string email, ChangePasswordRequest request);
        Task<bool> BanOrUnBanUserAsync(string email);
    }
}
