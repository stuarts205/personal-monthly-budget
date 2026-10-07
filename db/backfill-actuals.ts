import "dotenv/config";
import { eq, isNotNull } from "drizzle-orm";
import { db } from "./index";
import {
  categoryBudgetExpenses,
  expenseCategories,
  monthlyActualExpenses,
} from "./schema";
import { getCurrentMonth } from "../lib/budget-month";

// One-off: copies actuals entered before monthly tracking existed (the old
// category_budget_expenses.actual_amount column) into the current month.
// Safe to re-run; rows that already exist are left alone.
async function main() {
  const month = getCurrentMonth();

  const legacy = await db
    .select({
      userId: categoryBudgetExpenses.userId,
      budgetExpenseId: categoryBudgetExpenses.id,
      expenseName: categoryBudgetExpenses.name,
      budgetedAmount: categoryBudgetExpenses.budgetedAmount,
      actualAmount: categoryBudgetExpenses.actualAmount,
      categoryName: expenseCategories.name,
    })
    .from(categoryBudgetExpenses)
    .innerJoin(
      expenseCategories,
      eq(categoryBudgetExpenses.categoryId, expenseCategories.id),
    )
    .where(isNotNull(categoryBudgetExpenses.actualAmount));

  if (legacy.length === 0) {
    console.log("No legacy actual expenses to copy.");
    return;
  }

  const inserted = await db
    .insert(monthlyActualExpenses)
    .values(
      legacy.map((row) => ({
        ...row,
        actualAmount: row.actualAmount!,
        month,
      })),
    )
    .onConflictDoNothing()
    .returning({ id: monthlyActualExpenses.id });

  console.log(
    `Copied ${inserted.length} of ${legacy.length} legacy actual expenses into ${month}.`,
  );
}

main();
