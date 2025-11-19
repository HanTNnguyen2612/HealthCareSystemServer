using Azure;
using Azure.Core;
using BusinessObjects.DataTransferObjects.AppointmentDTOs;
using BusinessObjects.DataTransferObjects.AuthDTOs;
using BusinessObjects.DataTransferObjects.PatientDTOs;
using BusinessObjects.Domain;
using HealthCareSystemClient.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text.Json;


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
            if (!responsespecialy.IsSuccessStatusCode) return View(new List<Specialty>());
            var sespecialy = await responsespecialy.Content.ReadFromJsonAsync<List<Specialty>>();
            model.Specialties = sespecialy
                .Select(s => new SpecialtyViewModel
                {
                    SpecialtyId = s.SpecialtyId,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();

            // Load payment info for each appointment
            var upcomingAppts = GetUpcomingAppointments(userAppointments);
            var pastAppts = GetStatusAppointments(userAppointments, "Completed");
            var cancelledAppts = GetStatusAppointments(userAppointments, "Cancelled");

            // Load payments for upcoming appointments
            var appointmentPayments = new Dictionary<int, BusinessObjects.DataTransferObjects.PaymentDTOs.PaymentResponse?>();
            foreach (var appt in upcomingAppts)
            {
                try
                {
                    var paymentResponse = await client.GetAsync($"api/Payment/appointment/{appt.AppointmentId}");
                    if (paymentResponse.IsSuccessStatusCode)
                    {
                        var payments = await paymentResponse.Content.ReadFromJsonAsync<List<BusinessObjects.DataTransferObjects.PaymentDTOs.PaymentResponse>>();
                        var pendingPayment = payments?.FirstOrDefault(p => p.Status == "PENDING");
                        appointmentPayments[appt.AppointmentId] = pendingPayment;
                    }
                }
                catch
                {
                    // Ignore errors
                }
            }

            // Add appointment data to ViewBag for the appointments list
            ViewBag.UpcomingAppointments = upcomingAppts;
            ViewBag.PastAppointments = pastAppts;
            ViewBag.CancelledAppointments = cancelledAppts;
            ViewBag.AppointmentPayments = appointmentPayments;

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult StorePendingBooking([FromBody] BookingDraftRequest request)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return Unauthorized();
            }

            HttpContext.Session.SetString("BookingDraft", JsonSerializer.Serialize(request));
            return Ok();
        }


        [HttpGet]
        public async Task<IActionResult> GetDoctorsBySpecialty(int specialtyId)
        {
            try
            {
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");
                var response = await client.GetAsync($"api/Appointment/spe/{specialtyId}");
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Failed to get doctors for specialty {specialtyId}. Status: {response.StatusCode}");
                    return PartialView("_DoctorOptions", new List<DoctorViewModel>());
                }

                var doctors = await response.Content.ReadFromJsonAsync<List<DoctorSpecialtyResponse>>();
                
                if (doctors == null || !doctors.Any())
                {
                    return PartialView("_DoctorOptions", new List<DoctorViewModel>());
                }

                var doctorViewModels = doctors.Select(d => new DoctorViewModel
                {
                    UserId = d.UserId,
                    FullName = d.FullName ?? "Unknown",
                    SpecialtyId = d.SpecialtyId,
                    SpecialtyName = d.SpecialtyName ?? "Unknown",
                    Qualifications = d.Qualifications,
                    Experience = d.Experience,
                    Rating = d.Rating,
                    AvatarUrl = d.AvatarUrl ?? "/images/default-doctor.png"
                }).ToList();

                return PartialView("_DoctorOptions", doctorViewModels);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting doctors for specialty {specialtyId}");
                return PartialView("_DoctorOptions", new List<DoctorViewModel>());
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAvailableTimeSlots(int doctorId, DateTime date)
        {
            var timeSlots = new List<TimeSlotViewModel>();
            var workingHours = new[]
            {

                new TimeSpan(9, 0, 0),   // 9:00 AM
                new TimeSpan(9, 30, 0),  // 9:30 AM
                new TimeSpan(10, 0, 0),  // 10:00 AM
                new TimeSpan(10, 30, 0), // 10:30 AM
                new TimeSpan(11, 0, 0),  // 11:00 AM
                new TimeSpan(11, 30, 0), // 11:30 AM
                new TimeSpan(14, 0, 0),  // 2:00 PM
                new TimeSpan(14, 30, 0), // 2:30 PM
                new TimeSpan(15, 0, 0),  // 3:00 PM
                new TimeSpan(15, 30, 0), // 3:30 PM
                new TimeSpan(16, 0, 0),  // 4:00 PM
                new TimeSpan(16, 30, 0), // 4:30 PM

            };

            foreach (var time in workingHours)
            {
                var appointmentDateTime = date.Add(time);

                //var isBooked = await _appointmentService.IsTimeSlotBookedAsync(doctorId, appointmentDateTime);
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");

                var dto = new
                {
                    DoctorId = doctorId,
                    AppointmentDate = appointmentDateTime
                };

                var response = await client.PostAsJsonAsync("api/Appointment/timeslot2", dto);

                if (!response.IsSuccessStatusCode)
                    return View();

                var isBooked = await response.Content.ReadFromJsonAsync<bool>();

                timeSlots.Add(new TimeSlotViewModel
                {
                    Time = time,
                    IsAvailable = !isBooked && appointmentDateTime > DateTime.Now,
                    DisplayTime = $"{time.Hours:00}:{time.Minutes:00}"
                });
            }

            return PartialView("_TimeSlotOptions", timeSlots);
        }

        [HttpGet]
        public async Task<IActionResult> GetAvailableTimeSlotsForReschedule(int doctorId, string date, int excludeAppointmentId)
        {
            // Parse date
            if (!DateTime.TryParse(date, out DateTime parsedDate))
            {
                return BadRequest("Invalid date format");
            }

            var timeSlots = new List<TimeSlotViewModel>();
            var workingHours = new[]
            {
                new TimeSpan(9, 0, 0),   // 9:00 AM
                new TimeSpan(9, 30, 0),  // 9:30 AM
                new TimeSpan(10, 0, 0),  // 10:00 AM
                new TimeSpan(10, 30, 0), // 10:30 AM
                new TimeSpan(11, 0, 0),  // 11:00 AM
                new TimeSpan(11, 30, 0), // 11:30 AM
                new TimeSpan(14, 0, 0),  // 2:00 PM
                new TimeSpan(14, 30, 0), // 2:30 PM
                new TimeSpan(15, 0, 0),  // 3:00 PM
                new TimeSpan(15, 30, 0), // 3:30 PM
                new TimeSpan(16, 0, 0),  // 4:00 PM
                new TimeSpan(16, 30, 0), // 4:30 PM
            };

            foreach (var time in workingHours)
            {
                var appointmentDateTime = parsedDate.Add(time);
                var client = _httpClientFactory.CreateClient("healthcaresystemapi");

                var dto = new
                {
                    DoctorId = doctorId,
                    AppointmentDate = appointmentDateTime,
                    excludeAppointmentId = excludeAppointmentId
                };

                var response = await client.PostAsJsonAsync("api/Appointment/timeslot3", dto);

                if (!response.IsSuccessStatusCode)
                    return View();

                var isBooked = await response.Content.ReadFromJsonAsync<bool>();

                timeSlots.Add(new TimeSlotViewModel
                {
                    Time = time,
                    IsAvailable = !isBooked && appointmentDateTime > DateTime.Now,
                    DisplayTime = $"{time.Hours:00}:{time.Minutes:00}"
                });
            }

            return PartialView("_TimeSlotOptions", timeSlots);
        }



        // Appointment Management Actions

        [HttpGet]
        public async Task<IActionResult> AppointmentDetails(int id)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var responsespecialy = await client.GetAsync($"api/Appointment/{id}");
            if (!responsespecialy.IsSuccessStatusCode) return View(new List<Specialty>());
            var appointment = await responsespecialy.Content.ReadFromJsonAsync<AppointmentResponse>();
            if (appointment == null)
            {
                TempData["Error"] = "Appointment not found or access denied.";
                return RedirectToAction("Appointments");
            }

            var appointmentDetail = new AppointmentViewModel
            {
                AppointmentId = appointment.AppointmentId,
                AppointmentDateTime = appointment.AppointmentDateTime,
                Status = appointment.Status ?? "Unknown",
                Notes = appointment.Notes ?? "",
                DoctorName = appointment.DoctorName?? "Unknown Doctor",
                SpecialtyName = appointment.Notes ?? "General",
                PatientName = appointment.PatientName ?? "Unknown Patient",
                DoctorAvatarUrl = "/images/default-doctor.png",
                CreatedAt = appointment.CreatedAt ?? DateTime.Now
            };

            return PartialView("_AppointmentDetails", appointmentDetail);
        }



        [HttpGet]
        public async Task<IActionResult> RescheduleAppointment(int id)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var apointmentdetail = await client.GetAsync($"api/Appointment/{id}");
            if (!apointmentdetail.IsSuccessStatusCode) return View(new AppointmentResponse());
            var appointment = await apointmentdetail.Content.ReadFromJsonAsync<AppointmentResponse>();



            if (appointment == null )
            {
                TempData["Error"] = "Appointment not found or access denied.";
                return RedirectToAction("Appointments");
            }

            // Check if appointment can be rescheduled (not past date, not completed/cancelled)
            if (
                appointment.Status == "Completed" ||
                appointment.Status == "Cancelled")
            {
                TempData["Error"] = "This appointment cannot be rescheduled.";
                return RedirectToAction("Appointments");
            }

            var model = new BookAppointmentViewModel
            {
                DoctorUserId = appointment.doctorid,
                AppointmentDate = appointment.AppointmentDateTime.Date,
                AppointmentTime = appointment.AppointmentDateTime.TimeOfDay,
                Notes = appointment.Notes
            };
            var responsespecialy = await client.GetAsync($"api/Appointment/specialty");
            if (!responsespecialy.IsSuccessStatusCode) return View(new List<Specialty>());
            var sespecialy = await responsespecialy.Content.ReadFromJsonAsync<List<Specialty>>();
            //if (sespecialy == null) 
            model.Specialties = sespecialy
                .Select(s => new SpecialtyViewModel
                {
                    SpecialtyId = s.SpecialtyId,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();

            ViewBag.AppointmentId = id;
            ViewBag.DoctorName = appointment.DoctorName ?? "Unknown Doctor";
            ViewBag.SpecialtyName =  "Unknown Specialty";
            ViewBag.SpecialtyId =   0;

            return PartialView("_RescheduleAppointment", model);
        }

        [HttpPost]
        public async Task<IActionResult> RescheduleAppointment(int id, BookAppointmentViewModel model)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var apointmentdetail = await client.GetAsync($"api/Appointment/{id}");
            if (!apointmentdetail.IsSuccessStatusCode) return View(new List<Specialty>());
            var appointment = await apointmentdetail.Content.ReadFromJsonAsync<AppointmentResponse>();
            if (appointment == null )
            {
                TempData["Error"] = "Appointment not found or access denied.";
                return RedirectToAction("Appointments");
            }

            try
            {
                var newAppointmentDateTime = model.AppointmentDate.Add(model.AppointmentTime);
                var dto = new
                {
                    DoctorId = model.DoctorUserId,
                    AppointmentDate = newAppointmentDateTime,
                    excludeAppointmentId = id
                };

                var response = await client.PostAsJsonAsync("api/Appointment/timeslot3", dto);

                if (!response.IsSuccessStatusCode)
                    return View();

                var isBooked = await response.Content.ReadFromJsonAsync<bool>();
                // Check if new time slot is available (excluding current appointment)
                //var isBooked = await _appointmentService.IsTimeSlotBookedAsync(model.DoctorUserId, newAppointmentDateTime, id);
                if (isBooked)
                {
                    TempData["Error"] = "This time slot is already booked. Please choose another time.";
                    return RedirectToAction("Appointments");
                }

                // Update appointment
                //appointment.AppointmentDateTime = newAppointmentDateTime;
                //appointment.Notes = model.Notes;
                //appointment.UpdatedAt = DateTime.Now;
                //await _appointmentService.UpdateAppointmentAsync(appointment);          -------------------------------------------------------------------------------------------
                var updaterequest = new AppoimentUpdateRequest
                {
                        PatientUserId  = appointment.patientid,
                        DoctorUserId = appointment.doctorid,
                        AppointmentDateTime = newAppointmentDateTime,
                        Status = appointment.Status,
                        CreatedAt = appointment.CreatedAt,
                        Notes = model.Notes
                };
                var responseupdate = await client.PutAsJsonAsync($"api/Appointment/{id}", updaterequest);
                if (!responseupdate.IsSuccessStatusCode)
                {
                    TempData["Error"] = "Failed to reschedule appointment. Please try again.";
                    return RedirectToAction("Appointments");
                }
                TempData["Success"] = "Appointment rescheduled successfully!";
                return RedirectToAction("Appointments");
            }
            catch (Exception ex)
            {
                TempData["Error"] = "An error occurred while rescheduling: " + ex.Message;
                return RedirectToAction("Appointments");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CancelAppointment(int id)
        {
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var apointmentdetail = await client.GetAsync($"api/Appointment/{id}");
            if (!apointmentdetail.IsSuccessStatusCode) return View(new List<Specialty>());
            var appointment = await apointmentdetail.Content.ReadFromJsonAsync<AppointmentResponse>();
            if (appointment == null )
            {
                TempData["Error"] = "Appointment not found or access denied.";
                return RedirectToAction("Appointments");
            }

            // Check if appointment can be cancelled
            if (appointment.Status == "Completed" || appointment.Status == "Cancelled")
            {
                TempData["Error"] = "This appointment cannot be cancelled.";
                return RedirectToAction("Appointments");
            }

            try
            {
                //appointment.Status = "Cancelled";
                //appointment.UpdatedAt = DateTime.Now;

                //await _appointmentService.UpdateAppointmentAsync(appointment); ----------------------------------------------------------------------------------------------------
                var isdelete = await client.DeleteAsync($"api/Appointment/{id}");
                if (!isdelete.IsSuccessStatusCode)
                {
                    TempData["Error"] = "Failed to cancel appointment. Please try again.";
                    return RedirectToAction("Appointments");
                }
                TempData["Success"] = "Appointment cancelled successfully.";
                return RedirectToAction("Appointments");
            }
            catch (Exception ex)
            {
                TempData["Error"] = "An error occurred while cancelling: " + ex.Message;
                return RedirectToAction("Appointments");
            }
        }

        public async Task<IActionResult> Calendar()
        {
            ViewData["ActiveMenu"] = "Calendar";
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var patientcurent = await client.GetAsync($"api/Patient/{currentUserId}");
            if (!patientcurent.IsSuccessStatusCode) return View(new PatientProfileDTO());
            var currentUser = await patientcurent.Content.ReadFromJsonAsync<PatientProfileDTO>();
            ViewBag.CurrentUser = currentUser;

            if (currentUserId == null)
            {
                return RedirectToAction("Index", "Login");
            }

            //var allAppointments = await _appointmentService.GetAllAppointmentsAsync();

            var response = await client.GetAsync($"api/Appointment/patient/{currentUserId}");
            if (!response.IsSuccessStatusCode) return View(new List<AppointmentResponse>());
            var userAppointments = await response.Content.ReadFromJsonAsync<List<AppointmentResponse>>();

            var model = new BookAppointmentViewModel();
            var responsespecialy = await client.GetAsync($"api/Appointment/specialty");
            if (!responsespecialy.IsSuccessStatusCode) return View(new List<Specialty>());
            var sespecialy = await responsespecialy.Content.ReadFromJsonAsync<List<Specialty>>();
            model.Specialties = sespecialy
                .Select(s => new SpecialtyViewModel
                {
                    SpecialtyId = s.SpecialtyId,
                    Name = s.Name,
                    Description = s.Description
                }).ToList();

            // Prepare calendar data
            ViewBag.TodayAppointments = GetTodayAppointments(userAppointments);
            ViewBag.WeekAppointments = GetWeekAppointments(userAppointments);
            ViewBag.MonthAppointments = GetMonthAppointments(userAppointments);
            ViewBag.CurrentDate = DateTime.Now;

            return View(model);
        }

        private List<AppointmentViewModel> GetTodayAppointments(List<AppointmentResponse> appointments)
        {
            return appointments
                .Where(a => a.AppointmentDateTime.Date == DateTime.Today && (a.Status == "Pending" || a.Status == "Confirmed"))
                .OrderBy(a => a.AppointmentDateTime)
                .Select(a => new AppointmentViewModel
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status ?? "Unknown",
                    Notes = a.Notes ?? "",
                    DoctorName = a.DoctorName ?? "Unknown Doctor",
                    PatientName = a.PatientName ?? "Unknown Patient",
                    CreatedAt = a.CreatedAt ?? DateTime.Now
                }).ToList();
        }

        private List<AppointmentViewModel> GetWeekAppointments(List<AppointmentResponse> appointments)
        {
            var startOfWeek = DateTime.Now.Date.AddDays(-(int)DateTime.Now.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(7);

            return appointments
                .Where(a => a.AppointmentDateTime >= startOfWeek &&
                           a.AppointmentDateTime < endOfWeek &&
                           (a.Status == "Pending" || a.Status == "Confirmed"))
                .OrderBy(a => a.AppointmentDateTime)
                .Select(a => new AppointmentViewModel
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status ?? "Unknown",
                    Notes = a.Notes ?? "",
                    DoctorName = a.DoctorName ?? "Unknown Doctor",
                    PatientName = a.PatientName ?? "Unknown Patient",
                    CreatedAt = a.CreatedAt ?? DateTime.Now
                }).ToList();
        }

        private List<AppointmentViewModel> GetMonthAppointments(List<AppointmentResponse> appointments)
        {
            var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            return appointments
                .Where(a => a.AppointmentDateTime >= startOfMonth &&
                           a.AppointmentDateTime < endOfMonth &&
                           (a.Status == "Pending" || a.Status == "Confirmed"))
                .OrderBy(a => a.AppointmentDateTime)
                .Select(a => new AppointmentViewModel
                {
                    AppointmentId = a.AppointmentId,
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status ?? "Unknown",
                    Notes = a.Notes ?? "",
                    DoctorName = a.DoctorName ?? "Unknown Doctor",
                    PatientName = a.PatientName ?? "Unknown Patient",
                    CreatedAt = a.CreatedAt ?? DateTime.Now
                }).ToList();
        }

        public IActionResult Doctors()
        {
            ViewData["ActiveMenu"] = "Doctors";
            return View();
        }
        public IActionResult Messages()
        {
            ViewData["ActiveMenu"] = "Messages";
            ViewBag.ApiBaseUrl = "https://localhost:7293";
            return View();
        }

        [HttpGet]
        public IActionResult ChatBox()
        {
            ViewData["ActiveMenu"] = "ChatBox";

            // 1. Lấy thông tin từ Session
            var currentUserId = HttpContext.Session.GetInt32("UserId");
            var fullName = HttpContext.Session.GetString("FullName");
            var avatarUrl = HttpContext.Session.GetString("AvatarUrl");

            // 2. Khởi tạo Model, đảm bảo không có thuộc tính nào là null
            var model = new UserAIChatViewModel
            {
                // Nếu UserId không tồn tại, gán giá trị 0 hoặc xử lý chuyển hướng
                UserId = currentUserId ?? 0,
                FullName = fullName ?? "Patient",
                AvatarUrl = avatarUrl ?? "/images/default-avatar.png"
            };

            // 3. Truyền Model vào View
            return View(model);
        }

        public IActionResult Profile()
        {
            ViewData["ActiveMenu"] = "Profile";
            return View();
        }
    }
}
