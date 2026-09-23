import { AddActualExpenseDialog } from "@/components/add-actual-expense-dialog"
import { EditCategoryBudgetExpenseDialog } from "@/components/edit-category-budget-expense-dialog"

type ExpenseItem = {
  id: string
  name: string
  budgetedAmount: number
  actualAmount: number | null
}

type ExpenseItemRowProps = {
  item: ExpenseItem
  categoryName: string
}

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

export function ExpenseItemRow({ item, categoryName }: ExpenseItemRowProps) {
  const isOverBudget =
    item.actualAmount !== null && item.actualAmount > item.budgetedAmount

  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{item.name}</span>
      <span className="flex items-center gap-1.5">
        <span className="tabular-nums">
          {item.actualAmount !== null && (
            <span
              className={isOverBudget ? "text-red-600" : "text-emerald-600"}
              title="Actual"
            >
              {formatCurrency(item.actualAmount)}
              <span className="text-muted-foreground"> / </span>
            </span>
          )}
          <span title="Budgeted">{formatCurrency(item.budgetedAmount)}</span>
        </span>
        <EditCategoryBudgetExpenseDialog
          expenseId={item.id}
          categoryName={categoryName}
          initialName={item.name}
          initialBudgetedAmount={item.budgetedAmount}
        />
        <AddActualExpenseDialog
          expenseId={item.id}
          expenseName={item.name}
          categoryName={categoryName}
          budgetedAmount={item.budgetedAmount}
          actualAmount={item.actualAmount}
        />
      </span>
    </li>
  )
}
