using BankReconciliation.BLL;
using BankReconciliation.Domain;
using Xunit;

namespace BankReconciliation.Tests;

public class ReconciliationServiceTests
{
    [Fact]
    public void Reconcile_ShouldIdentifyUnmatchedTransactionsAndCalculateDifference()
    {
        var service = new ReconciliationService();
        
        var sharedDate = new DateTime(2026, 9, 1);
        
        var bankTransactions = new List<BankTransaction>
        {
            new() { Amount = 1000.00m, Date = sharedDate, ReferenceNumber = "REF001" }, 
            new() { Amount = -500.00m, Date = sharedDate, ReferenceNumber = "REF002" }, 
            new() { Amount = -15.00m, Date = sharedDate, ReferenceNumber = "BANK_FEE" }  
        };

        var ledgerTransactions = new List<LedgerTransaction>
        {
            new() { Amount = 1000.00m, Date = sharedDate, Description = "REF001" }, 
            new() { Amount = -500.00m, Date = sharedDate, Description = "REF002" }, 
            new() { Amount = -200.00m, Date = sharedDate, Description = "REF003" }  
        };
        
        var result = service.Reconcile(bankTransactions, ledgerTransactions);
        
        Assert.Equal(485.00m, result.TotalBankBalance);
        Assert.Equal(300.00m, result.TotalLedgerBalance);
        Assert.Equal(185.00m, result.Difference); 
        
        Assert.Equal(2, result.MatchedBankTransactions.Count);
        Assert.Equal(2, result.MatchedLedgerTransactions.Count);
        
        Assert.Single(result.UnmatchedBankTransactions);
        Assert.Equal(-15.00m, result.UnmatchedBankTransactions.First().Amount);

        Assert.Single(result.UnmatchedLedgerTransactions);
        Assert.Equal(-200.00m, result.UnmatchedLedgerTransactions.First().Amount);
    }
}