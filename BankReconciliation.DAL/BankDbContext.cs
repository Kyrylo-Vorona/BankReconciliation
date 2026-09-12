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
    public DbSet<ReconciliationResult> ReconciliationResults => Set<ReconciliationResult>();
    
    public DbSet<AdjustmentEntry> AdjustmentEntries => Set<AdjustmentEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<BankTransaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<LedgerTransaction>()
            .Property(t => t.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ReconciliationResult>()
            .Property(r => r.TotalBankBalance)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ReconciliationResult>()
            .Property(r => r.TotalLedgerBalance)
            .HasPrecision(18, 2);
        
        modelBuilder.Entity<AdjustmentEntry>()
            .Property(a => a.Amount)
            .HasPrecision(18, 2);
        
        modelBuilder.Entity<AdjustmentEntry>()
            .HasOne(a => a.ReconciliationResult)
            .WithMany(r => r.Adjustments)
            .HasForeignKey(a => a.ReconciliationResultId)
            .OnDelete(DeleteBehavior.Cascade);
        
        modelBuilder.Entity<ReconciliationResult>().Ignore(r => r.MatchedBankTransactions);
        modelBuilder.Entity<ReconciliationResult>().Ignore(r => r.MatchedLedgerTransactions);
        modelBuilder.Entity<ReconciliationResult>().Ignore(r => r.UnmatchedBankTransactions);
        modelBuilder.Entity<ReconciliationResult>().Ignore(r => r.UnmatchedLedgerTransactions);
    }
}