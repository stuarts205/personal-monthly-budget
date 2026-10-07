import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { and, asc, eq, sql } from "drizzle-orm"
import { CircleDollarSign, Receipt } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddExpenseCategoryDialog } from "@/components/add-expense-category-dialog"
import { IncomeEditor } from "@/components/income-editor"
import { ExpenseCategoryRow } from "@/components/expense-category-row"
import { auth } from "@/lib/auth"
import { db } from "@/db"
import {
  categoryBudgetExpenses,
  expenseCategories,
  income,
  monthlyActualExpenses,
} from "@/db/schema"
import type { ExpenseEntry, ExpenseItem } from "@/components/expense-item-row"
import {
  formatEntryDate,
  formatMonth,
  getCurrentDate,
  getCurrentMonth,
} from "@/lib/budget-month"

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/sign-in")

  const month = getCurrentMonth()

  const [incomeRow] = await db
    .select()
    .from(income)
    .where(eq(income.userId, session.user.id))

  const categories = await db
    .select()
    .from(expenseCategories)
    .where(eq(expenseCategories.userId, session.user.id))
    .orderBy(expenseCategories.createdAt)

  const expenses = await db
    .select()
    .from(categoryBudgetExpenses)
    .where(eq(categoryBudgetExpenses.userId, session.user.id))
    .orderBy(asc(categoryBudgetExpenses.name))

  // Only this month's actuals: when the month changes there are none, so every
  // item starts over. Earlier months stay in monthly_actual_expenses. Each
  // entry is its own row, so they're totalled per budget item here.
  const monthlyActuals = await db
    .select({
      budgetExpenseId: monthlyActualExpenses.budgetExpenseId,
      actualAmount:
        sql<string>`sum(${monthlyActualExpenses.actualAmount})`.mapWith(Number),
    })
    .from(monthlyActualExpenses)
    .where(
      and(
        eq(monthlyActualExpenses.userId, session.user.id),
        eq(monthlyActualExpenses.month, month)
      )
    )
    .groupBy(monthlyActualExpenses.budgetExpenseId)

  const actualByExpenseId = new Map<string, number>()
  for (const { budgetExpenseId, actualAmount } of monthlyActuals) {
    if (budgetExpenseId) actualByExpenseId.set(budgetExpenseId, actualAmount)
  }

  // The individual entries behind each total, for the expandable list under
  // every budget item. Entries recorded before spent_on existed fall back to
  // the day they were created. Dates are formatted here because the budget
  // time zone is only known on the server.
  const monthlyEntries = (
    await db
      .select({
        id: monthlyActualExpenses.id,
        budgetExpenseId: monthlyActualExpenses.budgetExpenseId,
        amount: monthlyActualExpenses.actualAmount,
        description: monthlyActualExpenses.description,
        spentOn: monthlyActualExpenses.spentOn,
        createdAt: monthlyActualExpenses.createdAt,
      })
      .from(monthlyActualExpenses)
      .where(
        and(
          eq(monthlyActualExpenses.userId, session.user.id),
          eq(monthlyActualExpenses.month, month)
        )
      )
  )
    .map((row) => ({
      ...row,
      date: row.spentOn ?? getCurrentDate(row.createdAt),
    }))
    // Newest first; same-day entries by when they were added.
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.createdAt.getTime() - a.createdAt.getTime()
    )

  const entriesByExpenseId = new Map<string, ExpenseEntry[]>()
  for (const { id, budgetExpenseId, amount, description, date } of monthlyEntries) {
    if (!budgetExpenseId) continue
    const entries = entriesByExpenseId.get(budgetExpenseId) ?? []
    entries.push({ id, amount, description, dateLabel: formatEntryDate(date) })
    entriesByExpenseId.set(budgetExpenseId, entries)
  }

  const itemsByCategory = new Map<string, ExpenseItem[]>()
  for (const expense of expenses) {
    const items = itemsByCategory.get(expense.categoryId) ?? []
    items.push({
      id: expense.id,
      name: expense.name,
      budgetedAmount: expense.budgetedAmount,
      actualAmount: actualByExpenseId.get(expense.id) ?? null,
      entries: entriesByExpenseId.get(expense.id) ?? [],
    })
    itemsByCategory.set(expense.categoryId, items)
  }

  const spending = categories.map((category) => {
    const items = itemsByCategory.get(category.id) ?? []
    return {
      id: category.id,
      category: category.name,
      budgeted: items.reduce((total, item) => total + item.budgetedAmount, 0),
      spent: items.reduce((total, item) => total + (item.actualAmount ?? 0), 0),
      items,
    }
  })

  const actualSpendingTotal = spending.reduce(
    (total, item) => total + item.spent,
    0
  )

  const totalBudgetedExpenses = expenses.reduce(
    (total, expense) => total + expense.budgetedAmount,
    0
  )

  const incomeAmount = incomeRow?.amount ?? 0
  const plannedSavings = incomeAmount - totalBudgetedExpenses

  return (
    <div className="min-h-svh bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Personal Monthly Budget
          </h1>
        </header>

        <section aria-labelledby="overall-budget-heading" className="space-y-4">
          <div>
            <h2 id="overall-budget-heading" className="text-xl font-semibold">
              Overall budget
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The plan for your full month.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <IncomeEditor initialAmount={incomeRow?.amount ?? 0} />
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Total budgeted expenses
                  </p>
                  <Receipt
                    className="size-4 text-amber-600"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">
                  $
                  {totalBudgetedExpenses.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across all expense categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Planned savings
                  </p>
                  <CircleDollarSign
                    className={`size-4 ${
                      plannedSavings >= 0 ? "text-sky-600" : "text-red-600"
                    }`}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-2xl font-semibold tabular-nums">
                  {plannedSavings < 0 ? "-" : ""}$
                  {Math.abs(plannedSavings).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Available after spending
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section
          aria-labelledby="actual-spending-heading"
          className="space-y-4"
        >
          <div>
            <h2 id="actual-spending-heading" className="text-xl font-semibold">
              Actual Spending
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMonth(month)}: ${actualSpendingTotal.toLocaleString()}{" "}
              spent across all expense categories.
            </p>
          </div>
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-blue-700">
                Expense categories
              </CardTitle>
              <CardAction>
                <AddExpenseCategoryDialog />
              </CardAction>
            </CardHeader>
            <CardContent className="divide-y">
              {spending.map(({ id, category, budgeted, spent, items }) => (
                <ExpenseCategoryRow
                  key={id}
                  categoryId={id}
                  category={category}
                  budgeted={budgeted}
                  spent={spent}
                  items={items}
                />
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
