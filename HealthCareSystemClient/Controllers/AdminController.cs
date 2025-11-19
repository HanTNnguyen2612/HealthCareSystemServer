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

    }
}
