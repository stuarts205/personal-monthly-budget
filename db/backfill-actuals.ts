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

  // Every actual is its own row, so there's no unique key to lean on: skip any
  // budget item that already has an entry this month so a re-run can't
  // double-count.
  const existing = await db
    .select({ budgetExpenseId: monthlyActualExpenses.budgetExpenseId })
    .from(monthlyActualExpenses)
    .where(eq(monthlyActualExpenses.month, month));
  const alreadyRecorded = new Set(existing.map((row) => row.budgetExpenseId));
  const pending = legacy.filter((row) => !alreadyRecorded.has(row.budgetExpenseId));

  if (pending.length === 0) {
    console.log(`All ${legacy.length} legacy actual expenses are already in ${month}.`);
    return;
  }

  await db.insert(monthlyActualExpenses).values(
    pending.map((row) => ({
      ...row,
      actualAmount: row.actualAmount!,
      month,
    })),
  );

  console.log(
    `Copied ${pending.length} of ${legacy.length} legacy actual expenses into ${month}.`,
  );
}

main();
