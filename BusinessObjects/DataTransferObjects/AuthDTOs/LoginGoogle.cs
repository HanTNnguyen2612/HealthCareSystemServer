using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AuthDTOs
{
    public class LoginGoogle
    {
        [Required(ErrorMessage = "Google ID Token is required")]
        public string IdToken { get; set; } = null!;
    }
}
