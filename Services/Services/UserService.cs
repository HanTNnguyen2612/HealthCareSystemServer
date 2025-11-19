using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.DataTransferObjects.UserDTOs;
using BusinessObjects.Domain;
using CloudinaryDotNet.Actions;
using DataAccessObjects.DAO;
using Repositories.Interface;
using Services.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repository;

        private readonly AppointmentDAO _dao;

        public UserService(IUserRepository repository , AppointmentDAO dao )
        {
            _repository = repository;
            _dao = dao;
        }

        public async Task<List<UserResponseDTO>> GetAllUsers()
        {
            return await _repository.GetAllUsers();
        }
        public async Task<bool> BanOrUnBanUserAsync(int id)
        {
            return await _repository.BanOrUnBanUserAsync(id);
        }

        public async Task<bool> ChangePasswordAsync(string email, ChangePasswordRequest request)
        {
            return await _repository.ChangePasswordAsync(email, request);
        }

        public async Task<User?> CreateUserAsync(User user)
        {
            return await _repository.CreateUserAsync(user);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _repository.GetUserByEmail(email);
        }

        public async Task<User?> UpdateUserAsync(string email, UserUpdateRequest request)
        {            
            return await _repository.UpdateUserAsync(email, request);
        }

        public async Task<User?> GetUserById(int id) => await _repository.GetUserById(id);
    }
}