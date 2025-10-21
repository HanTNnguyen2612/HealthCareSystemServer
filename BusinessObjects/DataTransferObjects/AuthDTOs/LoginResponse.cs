﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AuthDTOs
{
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Email { get; set; } = null!;
        public string? Role { get; set; }
        public string Token { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
