namespace BankReconciliation.Domain;

public class BankTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
    
    public bool IsReconciled { get; set; } = false;
    public Guid? MatchedLedgerTransactionId { get; set; }
    public Guid? ReconciliationResultId { get; set; }
}