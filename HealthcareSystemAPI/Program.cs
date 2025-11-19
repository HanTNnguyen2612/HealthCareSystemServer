using BusinessObjects.Domain;
using DataAccessObjects.DAO;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repositories.Interface;
using Repositories.Repositories;
using Services.Interface;
using Services.Services;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using HealthcareSystemAPI.Converters;
using HealthcareSystemAPI.Hubs;
using BusinessObjects.DataTransferObjects;
using BusinessObjects.DataTransferObjects.Googles;
using BusinessObjects.DataTransferObjects.AI;
using Services.Service;

var builder = WebApplication.CreateBuilder(args);

// FIX: Hợp nhất tất cả các policy CORS vào một block AddCors duy nhất.
builder.Services.AddCors(options =>
{
    // Policy cho Client MVC (cổng 7206) - Dùng cho API calls chính
    options.AddPolicy(name: "AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("https://localhost:7206") // 🎯 Client của bạn
                      .AllowAnyHeader()
                      .AllowAnyMethod(); // Quan trọng: Cho phép DELETE và OPTIONS
        });

    // Policy cho các cổng khác (ví dụ: 7002, nếu cần cho SignalR hoặc testing)
    options.AddPolicy("AllowLocalhost",
        policy =>
        {
            policy.WithOrigins(
                    "https://localhost:7002",
                    "http://localhost:7002",
                    "https://localhost:7206",
                    "http://localhost:7206",
                    "https://localhost:5237",
                    "http://localhost:5237"
                )
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        // Add DateOnly converters for proper JSON serialization/deserialization
        options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter());
        options.JsonSerializerOptions.Converters.Add(new DateOnlyNullableJsonConverter());
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthorization();

builder.Services.AddHttpClient();

builder.Services.Configure<GoogleSettings>(builder.Configuration.GetSection("GoogleAuth"));

builder.Services.AddDbContext<HealthCareSystemContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString")));
builder.Services.Configure<OpenAIOptions>(builder.Configuration.GetSection("Gemini"));
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

// ------------------ Repository DI ----------------------
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<ITokenRepository, TokenRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<IDoctorRepository, DoctorRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IAiMessageRepository, AiMessageRepository>();
builder.Services.AddScoped<IAiConversationRepository, AiConversationRepository>();
builder.Services.AddScoped<ISpecialtyRepository, SpecialtyRepository>();

// ------------------ Service DI ----------------------
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IDoctorService, DoctorService>();
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<IMessageService, MessageService>();
// Hợp nhất các dịch vụ mới từ cả hai nhánh
builder.Services.AddScoped<IAiConversationService, AiConversationService>();
builder.Services.AddScoped<IAiMessageService, AiMessageService>();
builder.Services.AddScoped<ISpecialtyService, SpecialtyService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();


// ------------------ DAO DI ----------------------
builder.Services.AddScoped<PatientDAO>();
builder.Services.AddScoped<DoctorDAO>();
builder.Services.AddScoped<AppointmentDAO>();
builder.Services.AddScoped<ConversationDAO>();
builder.Services.AddScoped<MessageDAO>();
builder.Services.AddScoped<UserDAO>();
builder.Services.AddScoped<PaymentDAO>();

// ------------------ SignalR ----------------------
builder.Services.AddSignalR();

// JWT Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
            ValidAudience = builder.Configuration["JwtSettings:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:SecretKey"]!)),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };

        // Allow JWT via query string for WebSocket connections to hubs
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var path = context.HttpContext.Request.Path;
                if (path.StartsWithSegments("/hubs/chat"))
                {
                    var accessToken = context.Request.Query["access_token"];
                    if (!string.IsNullOrEmpty(accessToken))
                    {
                        context.Token = accessToken;
                    }
                }
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                // Skip authentication for OPTIONS requests (CORS preflight)
                if (context.Request.Method == "OPTIONS")
                {
                    context.HandleResponse();
                    return Task.CompletedTask;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowLocalhost");

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowLocalhost");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();