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
        Task<User?> GetUserByEmail(string email);
        Task<User?> CreateUserAsync(User user);
    }
}
