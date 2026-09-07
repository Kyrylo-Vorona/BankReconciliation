using BankReconciliation.Domain;
using Microsoft.EntityFrameworkCore;

namespace BankReconciliation.DAL;

public class BankDbContext : DbContext
{
    public BankDbContext(DbContextOptions<BankDbContext> options) : base(options)
    {
    }
    
    public DbSet<BankTransaction> BankTransactions => Set<BankTransaction>();
    public DbSet<LedgerTransaction> LedgerTransactions => Set<LedgerTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<BankTransaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LedgerTransaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);
    }
}