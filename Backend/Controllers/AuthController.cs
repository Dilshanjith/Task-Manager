using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend_aspnet.Data;
using backend_aspnet.Models;
using backend_aspnet.Services;
using FirebaseAdmin.Auth;

namespace backend_aspnet.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AppDbContext context, IEmailService emailService, ILogger<AuthController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] OtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email)) return BadRequest("Email is required.");

            // Generate 6-digit OTP
            var code = new Random().Next(100000, 999999).ToString();
            
            // Save to database
            var otpCode = new OtpCode
            {
                Email = request.Email,
                Code = code,
                ExpiryTime = DateTime.UtcNow.AddMinutes(10) // 10 minutes expiry
            };

            _context.OtpCodes.Add(otpCode);
            await _context.SaveChangesAsync();

            // Send Email
            var subject = "Your Verification Code";
            var body = $"<h3>Task Manager Verification</h3><p>Your 6-digit verification code is: <b>{code}</b></p><p>This code will expire in 10 minutes.</p>";
            
            await _emailService.SendEmailAsync(request.Email, subject, body);

            return Ok(new { message = "OTP sent successfully." });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Code))
                return BadRequest("Email and Code are required.");

            var otpRecord = await _context.OtpCodes
                .Where(o => o.Email == request.Email && o.Code == request.Code && !o.IsUsed && o.ExpiryTime > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otpRecord == null)
            {
                return BadRequest("Invalid or expired OTP.");
            }

            // Mark OTP as used
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            // Update Firebase User (optional but recommended)
            try 
            {
                var userRecord = await FirebaseAuth.DefaultInstance.GetUserByEmailAsync(request.Email);
                var args = new UserRecordArgs
                {
                    Uid = userRecord.Uid,
                    EmailVerified = true
                };
                await FirebaseAuth.DefaultInstance.UpdateUserAsync(args);
                _logger.LogInformation($"Successfully verified email in Firebase for user: {request.Email}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to update Firebase user status: {ex.Message}");
                // We don't return error here because the OTP itself was valid, 
                // and the Admin SDK might not be configured yet.
            }

            return Ok(new { message = "Email verified successfully." });
        }
    }

    public class OtpRequest { public string Email { get; set; } = string.Empty; }
    public class VerifyOtpRequest 
    { 
        public string Email { get; set; } = string.Empty; 
        public string Code { get; set; } = string.Empty; 
    }
}
