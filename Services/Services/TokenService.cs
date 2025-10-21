using BusinessObjects.Domain;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class TokenService : ITokenService
    {
        private readonly ITokenRepository _repository;

        public TokenService(ITokenRepository repository)
        {
            _repository = repository;
        }

        public string GenerateJwtToken(User user)
        {
            return _repository.GenerateJwtToken(user);
        }
    }
}