using Microsoft.AspNetCore.Mvc;

namespace HealthCareSystemClient.Controllers
{
    public class ChatController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Messages()
        {
            ViewData["ActiveMenu"] = "Messages";
            return View();
        }
    }
}
