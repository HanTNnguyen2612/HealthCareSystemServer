using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects.DataTransferObjects.AI
{
    public class AiChatRequest
    {
        public int UserId { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
