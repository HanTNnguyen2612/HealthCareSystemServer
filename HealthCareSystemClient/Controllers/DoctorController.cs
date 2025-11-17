using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.DataTransferObjects.DoctorDTOs;
using BusinessObjects.Domain;
using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.Net.Http;

namespace HealthCareSystemClient.Controllers
{
    public class DoctorController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<LoginController> _logger;

        public DoctorController(IHttpClientFactory httpClientFactory, ILogger<LoginController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }
        private int? currentUser => HttpContext.Session.GetInt32("UserId");
        public IActionResult Index()
        {
            ViewData["ActiveMenu"] = "Dashboard";
            return View();
        }
        public async Task<IActionResult> Appointments()
        {
            ViewData["ActiveMenu"] = "Appointments";

            //// Get doctor ID from session (you should implement proper authentication)
            //// For demo purposes, assuming doctor ID is stored in session
            //var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1; // Default to 1 for testing
            if (currentUser == null)
            {
                return RedirectToAction("Index", "Login");
            }
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");

            var responsepatient = await client.GetAsync($"api/Doctor/{currentUser.Value}");
            if (!responsepatient.IsSuccessStatusCode) return View(new DoctorProfileDTO());
            var doctor = await responsepatient.Content.ReadFromJsonAsync<DoctorProfileDTO>();

            var appointmentResponse = await client.GetAsync($"api/Appointment/doctor/{currentUser.Value}");
            if (!appointmentResponse.IsSuccessStatusCode) return View(doctor);
            var appointments = await appointmentResponse.Content.ReadFromJsonAsync<List<AppointmentResponse>>();
            //var user = await _userService.GetUserById(currentUser.Value);
            //var doctor = await _doctorService.GetDoctorsByIdAsync(currentUser.Value);

         
            var pendingAppointments = new List<AppointmentResponse>();
            var todayAppointments = new List<AppointmentResponse>();
            var upcomingAppointments = new List<AppointmentResponse>();
            var completedAppointments = new List<AppointmentResponse>();
            var cancelledAppointments =  new List<AppointmentResponse>();

            foreach (var appointment in appointments)
            {
                if (appointment.Status == "Pending")
                {
                    pendingAppointments.Add(appointment);
                }
                else if (appointment.Status == "Completed")
                {
                    completedAppointments.Add(appointment);
                }
                else if (appointment.Status == "Cancelled")
                {
                    cancelledAppointments.Add(appointment);
                }
                else
                {
                    var appointmentDate = appointment.AppointmentDateTime.Date;
                    var today = DateTime.Now.Date;
                    if (appointmentDate == today)
                    {
                        todayAppointments.Add(appointment);
                    }
                    else 
                    //if (appointmentDate > today)
                    {
                        upcomingAppointments.Add(appointment);
                    }
                }
            }

            ViewBag.PendingAppointments = pendingAppointments;
            ViewBag.TodayAppointments = todayAppointments;
            ViewBag.UpcomingAppointments = upcomingAppointments;
            ViewBag.CompletedAppointments = completedAppointments;
            ViewBag.CancelledAppointments = cancelledAppointments;
            ViewBag.PendingCount = pendingAppointments.Count;

            return View(doctor);
        }


        public async Task<IActionResult> AppointmentDetails(int id)
        {
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var responsespecialy = await client.GetAsync($"api/Appointment/detail/{id}");
            if (!responsespecialy.IsSuccessStatusCode) return View(new List<AppointmentResponseDetails>());
            var appointment = await responsespecialy.Content.ReadFromJsonAsync<AppointmentResponseDetails>();
            if (appointment == null)
            {
                return NotFound();
            }

            var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
            if (appointment.DoctorUserId != doctorId)
            {
                return Forbid();
            }

            return View(appointment);
        }


        [HttpPost]
        public async Task<IActionResult> RejectAppointment(int appointmentId, string? reason)
        {
            var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var response = await client.PatchAsJsonAsync("api/Appointment/Reject", new RejectRequest
            {
                AppointmentId = appointmentId,
                DoctorUserId = doctorId,
                Notes = reason
            });
            if (!response.IsSuccessStatusCode) return View(false);
            var result = await response.Content.ReadFromJsonAsync<bool>();

            if (result)
            {
                TempData["SuccessMessage"] = "Appointment rejected successfully!";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to reject appointment.";
            }

            return RedirectToAction("Appointments");
        }


        [HttpPost]
        public async Task<IActionResult> ApproveAppointment(int appointmentId)
        {
            var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var response = await client.PatchAsJsonAsync("api/Appointment/Confirmed", new RejectRequest
            {
                AppointmentId = appointmentId,
                DoctorUserId = doctorId,
            });
            if (!response.IsSuccessStatusCode) return View(false);
            var result = await response.Content.ReadFromJsonAsync<bool>();
            if (result)
            {
                TempData["SuccessMessage"] = "Appointment approved successfully!";
            }
            else
            {
                TempData["ErrorMessage"] = "Failed to approve appointment.";
            }

            return RedirectToAction("Appointments");
        }



        [HttpPost]
        public async Task<IActionResult> CompleteAppointment(int appointmentId)
        {
            try
            {
                var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var responsespecialy = await client.GetAsync($"api/Appointment/detail/{appointmentId}");
                if (!responsespecialy.IsSuccessStatusCode) return View(new List<AppointmentResponseDetails>());
                var appointment = await responsespecialy.Content.ReadFromJsonAsync<AppointmentResponseDetails>();

                if (appointment == null)
                {
                    TempData["ErrorMessage"] = "Appointment not found.";
                    return RedirectToAction("Appointments");
                }

                // Check if the appointment belongs to the current doctor
                if (appointment.DoctorUserId != doctorId)
                {
                    TempData["ErrorMessage"] = "You are not authorized to complete this appointment.";
                    return RedirectToAction("Appointments");
                }

                // Check if appointment is in a valid status to be completed
                if (appointment.Status != "Confirmed")
                {
                    TempData["ErrorMessage"] = $"Cannot complete appointment with status '{appointment.Status}'. Only confirmed appointments can be completed.";
                    return RedirectToAction("Appointments");
                }

                // Update appointment status
                appointment.Status = "Completed";
                appointment.UpdatedAt = DateTime.Now;

                //await _appointmentService.UpdateAppointmentAsync(appointment);
                var response = await client.PatchAsJsonAsync("api/Appointment/Completed", new RejectRequest
                {
                    AppointmentId = appointmentId,
                    DoctorUserId = doctorId,
                });
                if (!response.IsSuccessStatusCode) return View(false);
                var result = await response.Content.ReadFromJsonAsync<bool>();
                if (!result)
                {
                    TempData["ErrorMessage"] = $"Cannot complete appointment with status '{appointment.Status}'. Only confirmed appointments can be completed.";
                    return RedirectToAction("Appointments");
                }
                TempData["SuccessMessage"] = "Appointment completed successfully!";
            }
            catch (Exception ex)
            {
                // Log the exception if you have logging configured
                TempData["ErrorMessage"] = "An error occurred while completing the appointment.";
            }

            return RedirectToAction("Appointments");
        }

        [HttpGet]
        public async Task<IActionResult> GetAppointmentInfo(int appointmentId)
        {
            try
            {
                var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var responsespecialy = await client.GetAsync($"api/Appointment/detail/{appointmentId}");
                if (!responsespecialy.IsSuccessStatusCode) return View(new List<AppointmentResponseDetails>());
                var appointment = await responsespecialy.Content.ReadFromJsonAsync<AppointmentResponseDetails>();

                if (appointment == null || appointment.DoctorUserId != doctorId)
                {
                    return Json(new { success = false, message = "Appointment not found or unauthorized." });
                }

                return Json(new
                {
                    success = true,
                    patientName = appointment.PatientName,
                    appointmentDate = appointment.AppointmentDateTime.ToString("MMM dd, yyyy - HH:mm"),
                    notes = appointment.Notes ?? "No additional notes"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Error retrieving appointment information." });
            }
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
