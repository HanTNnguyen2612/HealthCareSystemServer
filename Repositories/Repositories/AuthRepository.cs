using BusinessObjects.DataTransferObjects.AuthDTOs;
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
    public class AuthRepository : IAuthRepository
    {
        private readonly ITokenRepository _tokenRepository;

        public AuthRepository(ITokenRepository tokenRepository)
        {
            _tokenRepository = tokenRepository;
        }
        public async Task<LoginResponse?> LoginAsync(LoginRequest request)
        {
            // Tìm user theo email
            var user = await UserDAO.GetUserByEmail(request.Email);

            if (user == null)
            {
                return null; 
            }

            if (user.Password != request.Password)
            {
                return null;
            }

            // Tạo JWT token
            var token = _tokenRepository.GenerateJwtToken(user);

            return new LoginResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            };
        }

        public async Task<RegisterResponse?> RegisterAsync(RegisterRequest request)
        {
            // Kiểm tra email đã tồn tại chưa
            var existingUser = await UserDAO.GetUserByEmail(request.Email);
            if (existingUser != null)
            {
                return null; // Email đã tồn tại
            }

            // Tạo user mới
            var newUser = new User
            {
                Email = request.Email,
                Password = request.Password, 
                FullName = request.FullName,
                PhoneNumber = request.PhoneNumber,
                Role = request.Role ?? "Patient",
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var createdUser = await UserDAO.CreateUserAsync(newUser);
            if (createdUser == null)
            {
                return null; 
            }

            return new RegisterResponse
            {
                UserId = createdUser.UserId,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                Role = createdUser.Role,
                PhoneNumber = createdUser.PhoneNumber,
                CreatedAt = createdUser.CreatedAt ?? DateTime.UtcNow,
                Message = "User registered successfully"
            };
        }
    }
}
