import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { desc, eq, sql } from "drizzle-orm"

import { HistoryMonthCard } from "@/components/history-month-card"
import { auth } from "@/lib/auth"
import { formatMonth, getCurrentMonth } from "@/lib/budget-month"
import { db } from "@/db"
import { categoryBudgetExpenses, monthlyActualExpenses } from "@/db/schema"

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) redirect("/sign-in")

  const currentMonth = getCurrentMonth()

  // The same "Total budgeted expenses" figure the dashboard shows: every
  // budget item, not just the ones with an entry in a given month. Past
  // months don't keep their own copy of the budget, so only the current month
  // shows it; past months show just what was spent.
  const [{ totalBudgeted }] = await db
    .select({
      totalBudgeted:
        sql<string>`coalesce(sum(${categoryBudgetExpenses.budgetedAmount}), 0)`.mapWith(
          Number
        ),
    })
    .from(categoryBudgetExpenses)
    .where(eq(categoryBudgetExpenses.userId, session.user.id))

  // Each actual entered is its own row, so total them per budget item. The
  // snapshot columns are part of the grouping so an item keeps one budgeted
  // amount no matter how many entries it has.
  const rows = await db
    .select({
      month: monthlyActualExpenses.month,
      budgetExpenseId: monthlyActualExpenses.budgetExpenseId,
      categoryName: monthlyActualExpenses.categoryName,
      expenseName: monthlyActualExpenses.expenseName,
      budgetedAmount: monthlyActualExpenses.budgetedAmount,
      actualAmount:
        sql<string>`sum(${monthlyActualExpenses.actualAmount})`.mapWith(Number),
    })
    .from(monthlyActualExpenses)
    .where(eq(monthlyActualExpenses.userId, session.user.id))
    .groupBy(
      monthlyActualExpenses.month,
      monthlyActualExpenses.budgetExpenseId,
      monthlyActualExpenses.categoryName,
      monthlyActualExpenses.expenseName,
      monthlyActualExpenses.budgetedAmount
    )
    .orderBy(
      desc(monthlyActualExpenses.month),
      monthlyActualExpenses.categoryName,
      monthlyActualExpenses.expenseName
    )

  // Rows arrive newest month first, then by category and name.
  const months: {
    month: string
    actual: number
    categories: { name: string; items: typeof rows }[]
  }[] = []
  for (const row of rows) {
    let entry = months.at(-1)
    if (entry?.month !== row.month) {
      entry = { month: row.month, actual: 0, categories: [] }
      months.push(entry)
    }
    entry.actual += row.actualAmount

    let category = entry.categories.at(-1)
    if (category?.name !== row.categoryName) {
      category = { name: row.categoryName, items: [] }
      entry.categories.push(category)
    }
    category.items.push(row)
  }

  return (
    <div className="min-h-svh bg-muted/40 p-4 sm:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Actual spending recorded in each month. Actuals start over on the
            1st; nothing recorded is removed.
          </p>
        </header>

        {months.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No actual expenses recorded yet.
          </p>
        ) : (
          months.map(({ month, actual, categories }) => (
            <HistoryMonthCard
              key={month}
              monthLabel={formatMonth(month)}
              summary={
                month === currentMonth
                  ? `${formatCurrency(actual)} spent of ${formatCurrency(totalBudgeted)} total budgeted expenses`
                  : `${formatCurrency(actual)} spent`
              }
              isCurrent={month === currentMonth}
            >
              {categories.map(({ name, items }) => (
                <div key={name} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="font-medium text-blue-700">{name}</h3>
                  <ul className="mt-2 space-y-1.5">
                    {items.map((item) => (
                      <li
                        key={`${item.budgetExpenseId}-${item.expenseName}-${item.budgetedAmount}`}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {item.expenseName}
                        </span>
                        <span className="tabular-nums">
                          <span
                            className={
                              item.actualAmount > item.budgetedAmount
                                ? "text-red-600"
                                : "text-emerald-600"
                            }
                            title="Actual"
                          >
                            {formatCurrency(item.actualAmount)}
                          </span>
                          <span className="text-muted-foreground"> / </span>
                          <span title="Budgeted">
                            {formatCurrency(item.budgetedAmount)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </HistoryMonthCard>
          ))
        )}
      </div>
    </div>
  )
}
