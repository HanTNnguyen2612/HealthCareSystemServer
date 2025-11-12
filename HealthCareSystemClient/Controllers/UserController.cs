using Microsoft.AspNetCore.Mvc;

namespace HealthCareSystemClient.Controllers
{
    public class UserController : Controller
    {
        public IActionResult Index()
        {
            ViewData["ActiveMenu"] = "Dashboard";
            return View();
        }
        public IActionResult Appointments()
        {
            ViewData["ActiveMenu"] = "Appointments";
            return View();
        }
        public IActionResult Calendar()
        {
            ViewData["ActiveMenu"] = "Calendar";
            return View();
        }
        public IActionResult Doctors()
        {
            ViewData["ActiveMenu"] = "Doctors";
            return View();
        }
        public IActionResult Messages()
        {
            ViewData["ActiveMenu"] = "Messages";
            return View();
        }
        public IActionResult ChatBox()
        {
            ViewData["ActiveMenu"] = "ChatBox";
            return View();
        }
        public IActionResult Profile()
        {
            ViewData["ActiveMenu"] = "Profile";
            return View();
        }
    }
}
