using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BankReconciliation.DAL.Migrations
{
    /// <inheritdoc />
    public partial class AddAdjustmentEntries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdjustmentEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReconciliationResultId = table.Column<Guid>(type: "uuid", nullable: false),
                    Date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AccountCode = table.Column<string>(type: "text", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdjustmentEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AdjustmentEntries_ReconciliationResults_ReconciliationResul~",
                        column: x => x.ReconciliationResultId,
                        principalTable: "ReconciliationResults",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdjustmentEntries_ReconciliationResultId",
                table: "AdjustmentEntries",
                column: "ReconciliationResultId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdjustmentEntries");
        }
    }
}
