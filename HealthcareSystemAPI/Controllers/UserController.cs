using BusinessObjects.DataTransferObjects.UserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interface;
using System.Security.Claims;

namespace HealthcareSystemAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            // Lấy email từ token
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
            {
                return Unauthorized("Invalid token: missing email.");
            }

            var result = await _userService.ChangePasswordAsync(email, request);
            if (!result)
            {
                return BadRequest("Incorrect old password or failed to change password.");
            }

            return Ok("Password changed successfully!");
        }
        [HttpPost("update-user")]
        public async Task<IActionResult> UpdateUser([FromBody] UserUpdateRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
            {
                return Unauthorized("Invalid token: missing email.");
            }
            var result = await _userService.UpdateUserAsync(email, request);
            if(result == null)
            {
                return BadRequest("Error when updating user information");
            }
            return Ok("Update successfully");
        }

        [HttpPost("ban-unban-user")]
        public async Task<IActionResult> BanOrUnbanUser()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null)
            {
                return Unauthorized("Invalid token: missing email.");
            }
            var result = await _userService.BanOrUnBanUserAsync(email);
            if (!result)
            {
                return BadRequest("Error when ban/unban user");
            }
            return Ok("Update successfully");
        }


       
    }
}
