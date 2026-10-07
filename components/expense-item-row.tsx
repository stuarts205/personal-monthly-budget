"use client"

import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AddActualExpenseDialog } from "@/components/add-actual-expense-dialog"
import { EditCategoryBudgetExpenseDialog } from "@/components/edit-category-budget-expense-dialog"

export type ExpenseEntry = {
  id: string
  amount: number
  description: string | null
  dateLabel: string
}

export type ExpenseItem = {
  id: string
  name: string
  budgetedAmount: number
  actualAmount: number | null
  entries: ExpenseEntry[]
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
  const hasEntries = item.entries.length > 0

  return (
    <li className="text-sm">
      <Collapsible>
        <div className="flex items-center justify-between gap-3">
          <CollapsibleTrigger
            disabled={!hasEntries}
            aria-label={`Show actual expenses for ${item.name}`}
            render={
              <button
                type="button"
                className="group/trigger flex items-center gap-1 text-left text-muted-foreground disabled:cursor-default"
              />
            }
          >
            {item.name}
            {hasEntries && (
              <ChevronDown className="size-3.5 shrink-0 transition-transform group-data-panel-open/trigger:rotate-180" />
            )}
          </CollapsibleTrigger>
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
        </div>
        {hasEntries && (
          <CollapsibleContent>
            <ul className="mt-1.5 ml-1 space-y-1 border-l pl-3 text-xs text-muted-foreground">
              {item.entries.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3">
                  <span>{entry.dateLabel}</span>
                  <span className="tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                  {entry.description && (
                    <span className="min-w-0 truncate" title={entry.description}>
                      {entry.description}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        )}
      </Collapsible>
    </li>
  )
}
