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
        public async Task<IActionResult> Schedule(DateTime? week)
        {
            if (currentUser == null)
            {
                return RedirectToAction("Index", "Login");
            }
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var responsepatient = await client.GetAsync($"api/Doctor/{currentUser.Value}");
            if (!responsepatient.IsSuccessStatusCode) return View(new DoctorProfileDTO());
            var doctor = await responsepatient.Content.ReadFromJsonAsync<DoctorProfileDTO>();
            ViewBag.Doctor = doctor;
            ViewData["ActiveMenu"] = "Schedule";

            var currentWeek = week ?? DateTime.Now;

            

            var scheduleViewModel = await BuildScheduleViewModelAsync(currentUser.Value, currentWeek);

            return View(scheduleViewModel);
        }

        private async Task<ScheduleViewModel> BuildScheduleViewModelAsync(int doctorId, DateTime currentWeek)
        {
            // Get start and end of week
            var startOfWeek = currentWeek.AddDays(-(int)currentWeek.DayOfWeek);
            var endOfWeek = startOfWeek.AddDays(6);

            // Get appointments for the week
            //var weekAppointments = await _appointmentService.GetAppointmentsByWeekAsync(doctorId, startOfWeek);
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var dto = new 
            {
                DoctorId = doctorId,
                WeekStart = startOfWeek
            };
            var apointmentResponse = await client.PostAsJsonAsync("api/Appointment/week" , dto);
            var weekAppointments = await apointmentResponse.Content.ReadFromJsonAsync<List<AppointmentResponse>>();

            // Build weekly schedule
            var weeklySchedule = new List<WeeklyScheduleDay>();
            for (int i = 0; i < 7; i++)
            {
                var currentDate = startOfWeek.AddDays(i);
                var dayAppointments = weekAppointments
                    .Where(a => a.AppointmentDateTime.Date == currentDate.Date)
                    .ToList();

                var daySchedule = new WeeklyScheduleDay
                {
                    DayName = currentDate.ToString("dddd"),
                    Date = currentDate,
                    IsToday = currentDate.Date == DateTime.Today,
                    Appointments = MapToScheduleAppointments(dayAppointments),
                    AvailableSlots = GenerateAvailableSlots(currentDate, dayAppointments)
                };

                weeklySchedule.Add(daySchedule);
            }

            // Get time off list from database
            //var timeOffs = await _timeOffService.GetTimeOffsByDoctorAsync(doctorId);

            var responsetime = await client.GetAsync($"api/Appointment/TimeOff/{doctorId}");
            var timeOffs = await responsetime.Content.ReadFromJsonAsync<List<TimeOff>>();

            var timeOffList = timeOffs.Select(t => new TimeOffItem
            {
                TimeOffId = t.TimeOffId,
                Type = t.Type,
                Title = t.Title,
                StartDate = t.StartDate.ToDateTime(TimeOnly.MinValue),
                EndDate = t.EndDate.ToDateTime(TimeOnly.MinValue),
                IsAllDay = t.IsAllDay ?? true,
                Reason = t.Reason ?? "",
                DateRangeDisplay = $"{t.StartDate:MMM dd} - {t.EndDate:MMM dd}, {t.StartDate:yyyy}",
                Icon = GetTimeOffIcon(t.Type)
            }).ToList();

            return new ScheduleViewModel
            {
                DoctorId = doctorId,
                CurrentWeek = currentWeek,
                CurrentWeekDisplay = $"{startOfWeek:MMM dd} - {endOfWeek:MMM dd}, {currentWeek:yyyy}",
                WeeklySchedule = weeklySchedule,
                TimeOffList = timeOffList
            };
        }
        private string GetTimeOffIcon(string type)
        {
            return type.ToLower() switch
            {
                "vacation" => "plane",
                "sick" => "thermometer-half",
                "conference" => "graduation-cap",
                "personal" => "user",
                "holiday" => "gift",
                _ => "calendar-times"
            };
        }

        private List<ScheduleAppointment> MapToScheduleAppointments(List<AppointmentResponse> appointments)
        {
            return appointments.Select(a => new ScheduleAppointment
            {
                AppointmentId = a.AppointmentId,
                PatientName = a.PatientName ?? "Unknown Patient",
                PatientEmail ="",
                PatientPhone = "",
                AppointmentDateTime = a.AppointmentDateTime,
                Status = a.Status ?? "Unknown",
                Notes = a.Notes ?? "",
                AppointmentType = GetAppointmentType(a.Notes),
                StatusColor = GetStatusColor(a.Status),
                TimeDisplay = a.AppointmentDateTime.ToString("HH:mm"),
                Duration = "30 min"
            }).ToList();
        }
        private string GetAppointmentType(string? notes)
        {
            if (string.IsNullOrEmpty(notes)) return "General";

            var lowerNotes = notes.ToLower();
            if (lowerNotes.Contains("follow-up")) return "Follow-up";
            if (lowerNotes.Contains("check-up")) return "Check-up";
            if (lowerNotes.Contains("emergency")) return "Emergency";
            if (lowerNotes.Contains("consultation")) return "Consultation";

            return "General";
        }
        private string GetStatusColor(string? status)
        {
            return status?.ToLower() switch
            {
                "pending" => "warning",
                "confirmed" => "primary",
                "completed" => "success",
                "cancelled" => "danger",
                _ => "secondary"
            };
        }

        private List<TimeSlot> GenerateAvailableSlots(DateTime date, List<AppointmentResponse> appointments)
        {
            var slots = new List<TimeSlot>();
            var startTime = new TimeSpan(9, 0, 0); // 9:00 AM
            var endTime = new TimeSpan(17, 00, 0); // 5:00 PM
            var slotDuration = new TimeSpan(0, 30, 0); // 30 minutes

            for (var time = startTime; time < endTime; time += slotDuration)
            {
                var slotEndTime = time + slotDuration;
                var isAvailable = !appointments.Any(a =>
                    a.AppointmentDateTime.TimeOfDay >= time &&
                    a.AppointmentDateTime.TimeOfDay < slotEndTime);

                slots.Add(new TimeSlot
                {
                    TimeSlotId = slots.Count + 1,
                    Date = date,
                    StartTime = time,
                    EndTime = slotEndTime,
                    SlotType = "regular",
                    Notes = "",
                    IsAvailable = isAvailable,
                    TimeDisplay = $"{time:hh\\:mm} - {slotEndTime:hh\\:mm}",
                    DayName = date.ToString("dddd")
                });
            }

            return slots;
        }




        public IActionResult Profile()
        {
            ViewData["ActiveMenu"] = "Profile";
            return View();
        }
        public async Task<IActionResult> Calendar(int? year, int? month)
        {
            ViewData["ActiveMenu"] = "Calendar";

            var doctorId = HttpContext.Session.GetInt32("UserId") ?? 1;
            var currentDate = year.HasValue && month.HasValue
                ? new DateTime(year.Value, month.Value, 1)
                : new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var responsepatient = await client.GetAsync($"api/Doctor/{currentUser.Value}");
            if (!responsepatient.IsSuccessStatusCode) return View(new DoctorProfileDTO());
            var doctor = await responsepatient.Content.ReadFromJsonAsync<DoctorProfileDTO>();


            var calendarViewModel = await BuildCalendarViewModelAsync(doctorId, currentDate);

            ViewBag.Doctor = doctor;

            return View(calendarViewModel);
        }
        private async Task<CalendarViewModel> BuildCalendarViewModelAsync(int doctorId, DateTime currentMonth)
        {
            var client = _httpClientFactory.CreateClient("healthcaresystemapi");
            var appointmentResponse = await client.GetAsync($"api/Appointment/doctor/{currentUser.Value}");
            var appointments = await appointmentResponse.Content.ReadFromJsonAsync<List<AppointmentResponse>>();
            // Get appointments for the month
            //var monthAppointments = await _appointmentService.GetAppointmentsByMonthAsync(doctorId, currentMonth);
            var monthAppointments = appointments
                .Where(a => a.AppointmentDateTime.Year == currentMonth.Year && a.AppointmentDateTime.Month == currentMonth.Month)
                .Select(a => new Appointment
                {
                    AppointmentId = a.AppointmentId,
                    PatientUser = new BusinessObjects.Domain.Patient
                    {
                        User = new BusinessObjects.Domain.User
                        {
                            FullName = a.PatientName
                        }
                    },
                    AppointmentDateTime = a.AppointmentDateTime,
                    Status = a.Status,
                    Notes = a.Notes
                })
                .ToList();

            // Get today's appointments
            //var todayAppointments = await _appointmentService.GetTodayAppointmentsByDoctorAsync(doctorId);
            var todayAppointments = monthAppointments
                .Where(a => a.AppointmentDateTime.Date == DateTime.Now.Date)
                .ToList();

            // Get upcoming appointments (next 7 days)
            //var upcomingAppointments = await _appointmentService.GetUpcomingAppointmentsByDoctorAsync(doctorId);
            var upcomingAppointments = monthAppointments
                .Where(a => a.AppointmentDateTime.Date > DateTime.Now.Date)
                .ToList();
            var nextWeekAppointments = upcomingAppointments.Where(a => a.AppointmentDateTime <= DateTime.Now.AddDays(7)).ToList();

            var calendarViewModel = new CalendarViewModel
            {
                CurrentMonth = currentMonth,
                DoctorId = doctorId,
                TodayAppointments = MapToCalendarItems(todayAppointments),
                UpcomingAppointments = MapToCalendarItems(nextWeekAppointments),
                CalendarDays = BuildCalendarDays(currentMonth, monthAppointments)
            };

            return calendarViewModel;
        }

        private List<CalendarDay> BuildCalendarDays(DateTime currentMonth, List<Appointment> monthAppointments)
        {
            var calendarDays = new List<CalendarDay>();

            // Get the first day of the month and find the start of the calendar grid
            var firstDayOfMonth = new DateTime(currentMonth.Year, currentMonth.Month, 1);
            var startDate = firstDayOfMonth.AddDays(-(int)firstDayOfMonth.DayOfWeek);

            // Build 42 days (6 weeks) for the calendar grid
            for (int i = 0; i < 42; i++)
            {
                var currentDate = startDate.AddDays(i);
                var dayAppointments = monthAppointments
                    .Where(a => a.AppointmentDateTime.Date == currentDate.Date)
                    .ToList();

                calendarDays.Add(new CalendarDay
                {
                    Date = currentDate,
                    IsCurrentMonth = currentDate.Month == currentMonth.Month,
                    IsToday = currentDate.Date == DateTime.Today,
                    Appointments = MapToCalendarItems(dayAppointments),
                    AppointmentCount = dayAppointments.Count
                });
            }

            return calendarDays;
        }

        private List<AppointmentCalendarItem> MapToCalendarItems(List<Appointment> appointments)
        {
            return appointments.Select(a => new AppointmentCalendarItem
            {
                AppointmentId = a.AppointmentId,
                PatientName = a.PatientUser?.User?.FullName ?? "Unknown Patient",
                AppointmentDateTime = a.AppointmentDateTime,
                Status = a.Status ?? "Unknown",
                Notes = a.Notes ?? "",
                AppointmentType = GetAppointmentType(a.Notes),
                StatusColor = GetStatusColor(a.Status),
                TimeDisplay = a.AppointmentDateTime.ToString("HH:mm"),
                DateDisplay = a.AppointmentDateTime.ToString("MMM dd")
            }).ToList();
        }
        public IActionResult Messages()
        {
            ViewData["ActiveMenu"] = "Messages";
            ViewBag.ApiBaseUrl = "https://localhost:7293";
            return View();
        }
    }
}
