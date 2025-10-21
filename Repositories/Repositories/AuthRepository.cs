using BusinessObjects.DataTransferObjects.AuthDTOs;
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
                return null; // User không tồn tại
            }

            // Kiểm tra password (trong thực tế nên hash password)
            if (user.Password != request.Password)
            {
                return null; // Password sai
            }

            // Tạo JWT token
            var token = _tokenRepository.GenerateJwtToken(user);

            return new LoginResponse
            {
                UserId = user.UserId,
                Email = user.Email,
                Role = user.Role,
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24) // Token hết hạn sau 24 giờ
            };
        }
    }
}
