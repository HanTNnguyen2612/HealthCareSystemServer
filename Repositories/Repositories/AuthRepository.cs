using BusinessObjects.DataTransferObjects.AuthDTOs;
using BusinessObjects.DataTransferObjects.Googles;
using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ITokenRepository _tokenRepository;

        private readonly string _googleClientId;

        public AuthRepository(IOptions<GoogleSettings> googleSettings , ITokenRepository tokenRepository)
        {
            _googleClientId = googleSettings.Value.ClientId;
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

        public async Task<LoginResponse?> LoginGoogleAsync(LoginGoogle request)
        {
            try
            {
                //  Xác minh idToken với Google
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _googleClientId }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);

                //  Lấy email từ token
                var email = payload.Email;
                Console.WriteLine($"[Google Login] Email: {email}");

                // Kiểm tra
                var user = await UserDAO.GetUserByEmail(email);
                if (user == null)
                {
                    Console.WriteLine("[Google Login] Email chưa tồn tại trong hệ thống.");
                    return null;
                }

                //Nếu tồn tại → sinh JWT token bình thường
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
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] LoginGoogleAsync: {ex.Message}");
                return null;
            }
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
