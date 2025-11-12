using Microsoft.AspNetCore.Mvc;

namespace HealthCareSystemClient.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            ViewData["ActiveMenu"] = "Dashboard";
            return View();
        }

        public IActionResult Users()
        {
            ViewData["ActiveMenu"] = "UserManagement";
            return View();
        }

        public IActionResult Contents()
        {
            ViewData["ActiveMenu"] = "ContentManagement";
            return View();
        }

        public IActionResult System()
        {
            ViewData["ActiveMenu"] = "SystemManagement";
            return View();
        }

        public IActionResult Reports()
        {
            ViewData["ActiveMenu"] = "Reports";
            return View();
        }
    }
}
