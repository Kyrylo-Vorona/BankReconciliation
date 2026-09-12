namespace BankReconciliation.API.Dtos;

public class ReconcileRequestDto
{
    public List<BankTransactionDto> BankTransactions { get; set; } = new();
    public List<LedgerTransactionDto> LedgerTransactions { get; set; } = new();
}

public class BankTransactionDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ReferenceNumber { get; set; } = string.Empty;
}

public class LedgerTransactionDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string AccountCode { get; set; } = string.Empty;
}

public class CreateAdjustmentDto
{
    public string AccountCode { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}