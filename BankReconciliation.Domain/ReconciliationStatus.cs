namespace BankReconciliation.Domain;

public enum ReconciliationStatus
{
    Matched,          
    PartialMatch,    
    UnmatchedBank,  
    UnmatchedLedger 
}