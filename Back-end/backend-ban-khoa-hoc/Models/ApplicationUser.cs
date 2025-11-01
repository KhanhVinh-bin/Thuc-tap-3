using Microsoft.AspNetCore.Identity;

namespace Du_An_Web_Ban_Khoa_Hoc.Models
{

    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
