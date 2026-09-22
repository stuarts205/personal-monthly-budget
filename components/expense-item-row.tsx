import { EditCategoryBudgetExpenseDialog } from "@/components/edit-category-budget-expense-dialog"

type ExpenseItem = {
  id: string
  name: string
  budgetedAmount: number
}

type ExpenseItemRowProps = {
  item: ExpenseItem
  categoryName: string
}

export function ExpenseItemRow({ item, categoryName }: ExpenseItemRowProps) {
  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{item.name}</span>
      <span className="flex items-center gap-1.5">
        <span className="tabular-nums">
          $
          {item.budgetedAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
        <EditCategoryBudgetExpenseDialog
          expenseId={item.id}
          categoryName={categoryName}
          initialName={item.name}
          initialBudgetedAmount={item.budgetedAmount}
        />
      </span>
    </li>
  )
}
