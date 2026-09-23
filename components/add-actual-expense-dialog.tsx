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
import { updateActualExpense } from "@/app/(dashboard)/actions"

type AddActualExpenseDialogProps = {
  expenseId: string
  expenseName: string
  categoryName: string
  budgetedAmount: number
  actualAmount: number | null
}

function ActualExpenseForm({
  budgetedAmount,
  actualAmount,
  onActualAmountChange,
  onCancel,
  onSubmit,
  isSubmitting,
  error,
}: {
  budgetedAmount: number
  actualAmount: string
  onActualAmountChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  error: string | null
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Budgeted:{" "}
        <span className="font-medium text-foreground tabular-nums">
          $
          {budgetedAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}
        </span>
      </p>
      <div className="space-y-2">
        <Label htmlFor="actual-expense-amount">Actual amount</Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            $
          </span>
          <Input
            id="actual-expense-amount"
            name="actualAmount"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={actualAmount}
            onChange={(event) => onActualAmountChange(event.target.value)}
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
          {isSubmitting ? "Saving..." : "Save actual"}
        </Button>
      </div>
    </form>
  )
}

export function AddActualExpenseDialog({
  expenseId,
  expenseName,
  categoryName,
  budgetedAmount,
  actualAmount,
}: AddActualExpenseDialogProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [amount, setAmount] = React.useState(actualAmount?.toFixed(2) ?? "")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setAmount(actualAmount?.toFixed(2) ?? "")
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
      formData.set("actualAmount", amount)
      await updateActualExpense(formData)
      handleOpenChange(false)
    } catch {
      setError("Couldn't save that amount. Check the value and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const title =
    actualAmount === null ? "Add actual expense" : "Update actual expense"
  const description = `Record what you actually spent on ${expenseName} under ${categoryName}.`

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={`${title} for ${expenseName}`}
    />
  )

  const form = (
    <ActualExpenseForm
      budgetedAmount={budgetedAmount}
      actualAmount={amount}
      onActualAmountChange={setAmount}
      onCancel={() => handleOpenChange(false)}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      error={error}
    />
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger render={triggerButton}>
          <Plus />
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <div className="p-4">{form}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={triggerButton}>
        <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
