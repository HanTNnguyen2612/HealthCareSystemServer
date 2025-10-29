using BusinessObjects.DataTransferObjects.UserDTOs;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repositories
{
    public class UserRepository : IUserRepository
    {
        public async Task<bool> ChangePasswordAsync(string email, ChangePasswordRequest request)
        {
            var user = await UserDAO.GetUserByEmail(email);
            if (user == null)
            {
                return false;
            }

            if (user.Password != request.OldPassword)
            {
                return false;
            }
            user.Password = request.NewPassword;
            user = await UserDAO.UpdateUserAsync(user);
            return true;
        }

        public async Task<User?> CreateUserAsync(User user)
        {
            return await UserDAO.CreateUserAsync(user);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await UserDAO.GetUserByEmail(email);
        }

        //Hàm update này có thể gọi riêng để update từng cái được, không cần gọi hết
        //Sau này các function như thay avatar, ban, khoá acc chỉ cần gọi updateUser là ok
        //Nếu cần update thêm mấy cái khác của user chỉ cần mở rộng ra ở đây với DTO, DAO
        public async Task<User?> UpdateUserAsync(string email, UserUpdateRequest request)
        {
            var user = await UserDAO.GetUserByEmail(email);
            if (user == null)
            {
                return null;
            }
            if (request.Email != null) user.Email = request.Email;
            if (request.FullName != null) user.FullName = request.FullName;
            if (request.PhoneNumber != null) user.PhoneNumber = request.PhoneNumber;
            if (request.AvatarUrl != null) user.AvatarUrl = request.AvatarUrl;
            if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;
            return user;
        }
        public async Task<bool> BanOrUnBanUserAsync(string email)
        {
            var user = await UserDAO.GetUserByEmail(email);
            if (user == null)
            {
                return false;
            }
            if(user.IsActive.HasValue)
            {
                if((bool)user.IsActive)
                user.IsActive = false;
                else user.IsActive = true;
                await UserDAO.UpdateUserAsync(user);
            }
            return true;
        }
    }
}
