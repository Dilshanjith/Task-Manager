using Microsoft.EntityFrameworkCore;
using backend_aspnet.Models;

namespace backend_aspnet.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<TaskItem> Tasks { get; set; } = null!;
    }
}
