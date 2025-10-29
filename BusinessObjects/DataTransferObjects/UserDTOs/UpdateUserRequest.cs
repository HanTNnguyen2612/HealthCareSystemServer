using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.UserDTOs
{
    public class UserUpdateRequest
    {
        public string? Email { get; set; }

        public string? FullName { get; set; }

        public string? PhoneNumber { get; set; }

        public string? AvatarUrl { get; set; }

        public bool? IsActive { get; set; }
    }
}
