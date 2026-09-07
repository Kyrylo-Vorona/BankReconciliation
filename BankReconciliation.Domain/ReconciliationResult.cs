namespace BankReconciliation.Domain;

public class ReconciliationResult
{
    public List<BankTransaction> MatchedBankTransactions { get; set; } = new();
    public List<LedgerTransaction> MatchedLedgerTransactions { get; set; } = new();
    public List<BankTransaction> UnmatchedBankTransactions { get; set; } = new();
    public List<LedgerTransaction> UnmatchedLedgerTransactions { get; set; } = new();
    
    public decimal TotalBankBalance { get; set; }
    public decimal TotalLedgerBalance { get; set; }
    public decimal Difference => TotalBankBalance - TotalLedgerBalance;
}