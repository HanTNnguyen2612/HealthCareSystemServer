using BusinessObjects.DataTransferObjects.AuthDTOs;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _repository;

        public AuthService(IAuthRepository repository)
        {
            _repository = repository;
        }

        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            return await _repository.LoginAsync(request);
        }

        public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request)
        {
            return await _repository.RegisterAsync(request);
        }
    }
}