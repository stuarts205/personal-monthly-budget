"use client"

import { ChevronDown } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AddCategoryBudgetExpenseDialog } from "@/components/add-category-budget-expense-dialog"
import { ExpenseItemRow } from "@/components/expense-item-row"

type ExpenseItem = {
  id: string
  name: string
  budgetedAmount: number
  actualAmount: number | null
}

type ExpenseCategoryRowProps = {
  categoryId: string
  category: string
  budgeted: number
  spent: number
  items: ExpenseItem[]
}

export function ExpenseCategoryRow({
  categoryId,
  category,
  budgeted,
  spent,
  items,
}: ExpenseCategoryRowProps) {
  const percentage = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
  const hasItems = items.length > 0

  return (
    <Collapsible className="py-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div>
          <div className="flex items-center justify-between gap-4">
            <CollapsibleTrigger
              disabled={!hasItems}
              render={
                <button
                  type="button"
                  className="group/trigger flex items-center gap-1 font-medium text-blue-700 disabled:cursor-default"
                />
              }
            >
              {category}
              {hasItems && (
                <ChevronDown className="size-3.5 transition-transform group-data-panel-open/trigger:rotate-180" />
              )}
            </CollapsibleTrigger>
            <p className="text-sm text-muted-foreground tabular-nums sm:hidden">
              ${spent.toLocaleString()} / ${budgeted.toLocaleString()}
            </p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="hidden text-right sm:block">
          <p className="font-medium tabular-nums">${spent.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">
            of ${budgeted.toLocaleString()} budget
          </p>
        </div>
        <div className="flex justify-end">
          <AddCategoryBudgetExpenseDialog
            categoryId={categoryId}
            categoryName={category}
          />
        </div>
      </div>
      {hasItems && (
        <CollapsibleContent>
          <ul className="mt-3 space-y-1.5 border-t pt-3">
            {items.map((item) => (
              <ExpenseItemRow
                key={item.id}
                item={item}
                categoryName={category}
              />
            ))}
          </ul>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}
