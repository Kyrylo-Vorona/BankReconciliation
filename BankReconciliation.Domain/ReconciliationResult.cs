namespace BankReconciliation.Domain;

public class ReconciliationResult
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public decimal TotalBankBalance { get; set; }
    public decimal TotalLedgerBalance { get; set; }
    public decimal Difference => TotalBankBalance - TotalLedgerBalance;
    
    public List<BankTransaction> BankTransactions { get; set; } = new();
    public List<LedgerTransaction> LedgerTransactions { get; set; } = new();
    
    public List<BankTransaction> MatchedBankTransactions => 
        BankTransactions.Where(t => t.IsReconciled).ToList();

    public List<LedgerTransaction> MatchedLedgerTransactions => 
        LedgerTransactions.Where(t => t.IsReconciled).ToList();

    public List<BankTransaction> UnmatchedBankTransactions => 
        BankTransactions.Where(t => !t.IsReconciled).ToList();

    public List<LedgerTransaction> UnmatchedLedgerTransactions => 
        LedgerTransactions.Where(t => !t.IsReconciled).ToList();
}