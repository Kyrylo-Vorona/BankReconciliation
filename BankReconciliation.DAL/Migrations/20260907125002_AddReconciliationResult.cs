using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankReconciliation.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddReconciliationResult : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ReconciliationResultId",
                table: "LedgerTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ReconciliationResultId",
                table: "BankTransactions",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ReconciliationResults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TotalBankBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalLedgerBalance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReconciliationResults", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LedgerTransactions_ReconciliationResultId",
                table: "LedgerTransactions",
                column: "ReconciliationResultId");

            migrationBuilder.CreateIndex(
                name: "IX_BankTransactions_ReconciliationResultId",
                table: "BankTransactions",
                column: "ReconciliationResultId");

            migrationBuilder.AddForeignKey(
                name: "FK_BankTransactions_ReconciliationResults_ReconciliationResult~",
                table: "BankTransactions",
                column: "ReconciliationResultId",
                principalTable: "ReconciliationResults",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LedgerTransactions_ReconciliationResults_ReconciliationResu~",
                table: "LedgerTransactions",
                column: "ReconciliationResultId",
                principalTable: "ReconciliationResults",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BankTransactions_ReconciliationResults_ReconciliationResult~",
                table: "BankTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_LedgerTransactions_ReconciliationResults_ReconciliationResu~",
                table: "LedgerTransactions");

            migrationBuilder.DropTable(
                name: "ReconciliationResults");

            migrationBuilder.DropIndex(
                name: "IX_LedgerTransactions_ReconciliationResultId",
                table: "LedgerTransactions");

            migrationBuilder.DropIndex(
                name: "IX_BankTransactions_ReconciliationResultId",
                table: "BankTransactions");

            migrationBuilder.DropColumn(
                name: "ReconciliationResultId",
                table: "LedgerTransactions");

            migrationBuilder.DropColumn(
                name: "ReconciliationResultId",
                table: "BankTransactions");
        }
    }
}
