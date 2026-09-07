# Bank Reconciliation System

At the end of the month, the Statement of Financial Position of the bank and the company often differ due to:
* Deposit in transit
* Outstanding Checks
* Notes collected by bank
* NSF (bounced) checks
* Check printing or other service charges
* Book/Bank errors

This program allows to instantly find discrepancies in transactions by uploading Bank's and Ledger's CSV files to complete Bank Reconciliation.

## Tech Stack
* **Backend:** .NET 10 Web API
* **Database:** PostgreSQL (Docker)
* **ORM:** Entity Framework Core
