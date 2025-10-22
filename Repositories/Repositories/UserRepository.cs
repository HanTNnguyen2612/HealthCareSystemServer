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
        public async Task<User?> CreateUserAsync(User user)
        {
            return await UserDAO.CreateUserAsync(user);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await UserDAO.GetUserByEmail(email);
        }
    }
}
