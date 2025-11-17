using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using Twilio.Jwt.AccessToken; // ⬅️ Namespace quan trọng
using System.Collections.Generic;

[ApiController]
[Route("api/twilio")]
[Authorize] // Yêu cầu phải có JWT hợp lệ
public class TwilioController : ControllerBase
{
    private readonly string _accountSid;
    private readonly string _apiKey;
    private readonly string _apiSecret;

    public TwilioController(IConfiguration configuration)
    {
        _accountSid = configuration["Twilio:AccountSid"]!;
        _apiKey = configuration["Twilio:ApiKey"]!;
        _apiSecret = configuration["Twilio:ApiSecret"]!;
    }

    [HttpGet("token")]
    public IActionResult GetVideoToken([FromQuery] string roomName)
    {
        if (string.IsNullOrEmpty(roomName))
        {
            return BadRequest(new { message = "Tên phòng (roomName) là bắt buộc." });
        }

        // Lấy User ID (danh tính) từ JWT Token
        var identity = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(identity))
        {
            return Unauthorized("Danh tính user không tìm thấy trong token.");
        }

        try
        {
            var grant = new VideoGrant { Room = roomName };
            var grants = new HashSet<IGrant> { grant };

            var token = new Token(
                _accountSid,
                _apiKey,
                _apiSecret,
                identity: identity,
                grants: grants
            );

            return Ok(new
            {
                token = token.ToJwt(),
                room = roomName
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi nội bộ khi tạo token Twilio: {ex.Message}");
        }
    }
}