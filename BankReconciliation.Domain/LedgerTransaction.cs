namespace BankReconciliation.Domain;

public class LedgerTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty; 
    
    public bool IsReconciled { get; set; } = false;
    public Guid? MatchedBankTransactionId { get; set; }
    public Guid? ReconciliationResultId { get; set; }
}