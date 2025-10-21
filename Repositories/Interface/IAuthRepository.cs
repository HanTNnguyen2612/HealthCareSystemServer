using BusinessObjects.DataTransferObjects.AuthDTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Interface
{
    public interface IAuthRepository
    {
        Task<LoginResponse?> LoginAsync(LoginRequest request);
    }
}
