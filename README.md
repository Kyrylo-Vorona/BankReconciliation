# Bank Reconciliation System

At the end of the month, the Cash balance of the bank and the company often differ due to:
* Deposit in transit
* Outstanding Checks
* Notes collected by bank
* NSF (bounced) checks
* Check printing or other service charges
* Book/Bank errors

This program allows to instantly find discrepancies in transactions by uploading Bank's and Ledger's CSV files to complete Bank Reconciliation.

Note: the program supports parsing both US CSV format (decimals separated with ".", columns with ",") and European CSV format (decimals with ",", columns with ";"), and exports files in European format.

## Features
* **CSV Import & Parsing:** Upload and process bank statement and company ledger files.
* **Automated Reconciliation:** Instantly match transactions, track discrepancies, and highlight matched/unmatched items.
* **Manual Adjustments:** Apply direct adjustments and corrections within the application interface.
* **Flexible Export:** Export comprehensive report (matched & unmatched items), discrepancies-only report, or adjusted data file.

## Tech Stack
* **Backend:** .NET 10 Web API
* **Database:** PostgreSQL (Docker)
* **ORM:** Entity Framework Core
