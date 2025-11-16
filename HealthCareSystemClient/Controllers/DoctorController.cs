using Microsoft.AspNetCore.Mvc;

namespace HealthCareSystemClient.Controllers
{
    public class DoctorController : Controller
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
        public IActionResult Patients()
        {
            ViewData["ActiveMenu"] = "Patients";
            return View();
        }
        public IActionResult Schedule()
        {
            ViewData["ActiveMenu"] = "Schedule";
            return View();
        }
        public IActionResult Profile()
        {
            ViewData["ActiveMenu"] = "Profile";
            return View();
        }
        public IActionResult Calendar()
        {
            ViewData["ActiveMenu"] = "Calendar";
            return View();
        }
        public IActionResult Messages()
        {
            ViewData["ActiveMenu"] = "Messages";
            ViewBag.ApiBaseUrl = "https://localhost:7293";
            return View();
        }
    }
}
