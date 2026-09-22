"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { updateCategoryBudgetExpense } from "@/app/(dashboard)/actions"

type EditCategoryBudgetExpenseDialogProps = {
  expenseId: string
  categoryName: string
  initialName: string
  initialBudgetedAmount: number
}

function EditExpenseForm({
  name,
  onNameChange,
  budgetedAmount,
  onBudgetedAmountChange,
  onCancel,
  onSubmit,
  isSubmitting,
  error,
}: {
  name: string
  onNameChange: (value: string) => void
  budgetedAmount: string
  onBudgetedAmountChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  error: string | null
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-expense-name">Name</Label>
        <Input
          id="edit-expense-name"
          name="name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-expense-budgeted-amount">Budgeted amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            $
          </span>
          <Input
            id="edit-expense-budgeted-amount"
            name="budgetedAmount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={budgetedAmount}
            onChange={(event) => onBudgetedAmountChange(event.target.value)}
            className="pl-7 tabular-nums"
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

export function EditCategoryBudgetExpenseDialog({
  expenseId,
  categoryName,
  initialName,
  initialBudgetedAmount,
}: EditCategoryBudgetExpenseDialogProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState(initialName)
  const [budgetedAmount, setBudgetedAmount] = React.useState(
    initialBudgetedAmount.toFixed(2)
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setName(initialName)
      setBudgetedAmount(initialBudgetedAmount.toFixed(2))
      setError(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set("id", expenseId)
      formData.set("name", name)
      formData.set("budgetedAmount", budgetedAmount)
      await updateCategoryBudgetExpense(formData)
      handleOpenChange(false)
    } catch {
      setError("Couldn't save that expense. Check the values and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`Edit ${initialName}`}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger render={triggerButton}>
          <Pencil />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit budget expense</DrawerTitle>
            <DrawerDescription>
              Update this budgeted expense under {categoryName}.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <EditExpenseForm
              name={name}
              onNameChange={setName}
              budgetedAmount={budgetedAmount}
              onBudgetedAmountChange={setBudgetedAmount}
              onCancel={() => handleOpenChange(false)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={triggerButton}>
        <Pencil />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit budget expense</DialogTitle>
          <DialogDescription>
            Update this budgeted expense under {categoryName}.
          </DialogDescription>
        </DialogHeader>
        <EditExpenseForm
          name={name}
          onNameChange={setName}
          budgetedAmount={budgetedAmount}
          onBudgetedAmountChange={setBudgetedAmount}
          onCancel={() => handleOpenChange(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </DialogContent>
    </Dialog>
  )
}
