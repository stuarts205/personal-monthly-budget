"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addCategoryBudgetExpense } from "@/app/(dashboard)/actions"

type AddCategoryBudgetExpenseDialogProps = {
  categoryId: string
  categoryName: string
}

export function AddCategoryBudgetExpenseDialog({
  categoryId,
  categoryName,
}: AddCategoryBudgetExpenseDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState("")
  const [budgetedAmount, setBudgetedAmount] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setName("")
      setBudgetedAmount("")
      setError(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set("categoryId", categoryId)
      formData.set("name", name)
      formData.set("budgetedAmount", budgetedAmount)
      await addCategoryBudgetExpense(formData)
      handleOpenChange(false)
    } catch {
      setError("Couldn't save that expense. Check the values and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={`Add budget expense to ${categoryName}`}
          />
        }
      >
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add budget expense</DialogTitle>
          <DialogDescription>
            Add a new budgeted expense under {categoryName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-name">Name</Label>
            <Input
              id="expense-name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-budgeted-amount">Budgeted amount</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                $
              </span>
              <Input
                id="expense-budgeted-amount"
                name="budgetedAmount"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={budgetedAmount}
                onChange={(event) => setBudgetedAmount(event.target.value)}
                className="pl-7 tabular-nums"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
