namespace BankReconciliation.Domain;

public class AdjustmentEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReconciliationResultId { get; set; }
    public ReconciliationResult? ReconciliationResult { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string AccountCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}