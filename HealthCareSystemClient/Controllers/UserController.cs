using Azure;
using Azure.Core;
using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.DataTransferObjects.AuthDTOs;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Net.Http.Json;

namespace HealthCareSystemClient.Controllers
{
    public class UserController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LoginController> _logger;

        public UserController(IHttpClientFactory httpClientFactory, ILogger<LoginController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }
        public IActionResult Index()
        {
            ViewData["ActiveMenu"] = "Dashboard";
            return View();
        }



        private List<AppointmentViewModel> GetUpcomingAppointments(List<AppointmentResponse> appointments)
        {
            return appointments
                .Where(a =>  a.Status == "Pending" || a.Status == "Confirmed")
                .OrderBy(a => a.AppointmentDateTime)
                .Take(5)
                .Select(a => new AppointmentViewModel
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status ?? "Unknown",
                    Notes = a.Notes ?? "",
                    DoctorName = a.DoctorName ?? "Unknown Doctor",
                    SpecialtyName = a.DoctorName ?? "General",
                    PatientName = a.PatientName ?? "Unknown Patient",
                    DoctorAvatarUrl = "/images/default-doctor.png",
                    CreatedAt = a.CreatedAt ?? DateTime.Now
                }).ToList();
        }


        private List<AppointmentViewModel> GetStatusAppointments(List<AppointmentResponse> appointments , string status)
        {
            return appointments
                .Where(a => a.Status == status)
                .OrderBy(a => a.AppointmentDateTime)
                .Take(5)
                .Select(a => new AppointmentViewModel
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status ?? "Unknown",
                    Notes = a.Notes ?? "",
                    DoctorName = a.DoctorName ?? "Unknown Doctor",
                    SpecialtyName = a.DoctorName ?? "General",
                    PatientName = a.PatientName ?? "Unknown Patient",
                    DoctorAvatarUrl = "/images/default-doctor.png",
                    CreatedAt = a.CreatedAt ?? DateTime.Now
                }).ToList();
        }




        [HttpGet]
        public async Task<IActionResult> Appointments()
        {
            ViewData["ActiveMenu"] = "Appointments";
            var currentUserId = HttpContext.Session.GetInt32("UserId");

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var userId = HttpContext.Session.GetInt32("UserId");
            var response = await client.GetAsync($"api/Appointment/patient/{userId}");
            if (!response.IsSuccessStatusCode) return View(new List<AppointmentResponse>());
            var userAppointments = await response.Content.ReadFromJsonAsync<List<AppointmentResponse>>();


            var model = new BookAppointmentViewModel();

            var responsespecialy = await client.GetAsync($"api/Appointment/specialty");
            if (!response.IsSuccessStatusCode) return View(new List<AppointmentResponse>());
            var sespecialy = await response.Content.ReadFromJsonAsync<List<Specialty>>();
            model.Specialties = sespecialy
                .Select(s => new SpecialtyViewModel
                {
                    SpecialtyId = s.SpecialtyId,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();


            // Add appointment data to ViewBag for the appointments list
            ViewBag.UpcomingAppointments = GetUpcomingAppointments(userAppointments);
            ViewBag.PastAppointments = GetStatusAppointments(userAppointments, "Completed");
            ViewBag.PastAppointments = GetStatusAppointments(userAppointments, "Cancelled");

            return View(model);
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
