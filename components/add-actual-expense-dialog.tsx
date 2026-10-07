"use client"

import * as React from "react"
import { format } from "date-fns"
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

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

function ActualExpenseForm({
  budgetedAmount,
  currentActualAmount,
  actualAmount,
  onActualAmountChange,
  spentOn,
  onSpentOnChange,
  description,
  onDescriptionChange,
  onCancel,
  onSubmit,
  isSubmitting,
  error,
}: {
  budgetedAmount: number
  currentActualAmount: number | null
  actualAmount: string
  onActualAmountChange: (value: string) => void
  spentOn: string
  onSpentOnChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  error: string | null
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1 text-sm text-muted-foreground">
        <p>
          Budgeted:{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatCurrency(budgetedAmount)}
          </span>
        </p>
        {currentActualAmount !== null && (
          <p>
            Spent so far this month:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {formatCurrency(currentActualAmount)}
            </span>
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="actual-expense-amount">Amount to add</Label>
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
      <div className="space-y-2">
        <Label htmlFor="actual-expense-date">Date</Label>
        <Input
          id="actual-expense-date"
          name="spentOn"
          type="date"
          value={spentOn}
          onChange={(event) => onSpentOnChange(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="actual-expense-description">
          Description{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="actual-expense-description"
          name="description"
          type="text"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={200}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add to actual"}
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
  // Starts empty each time: the amount entered is added to the month's total.
  const [amount, setAmount] = React.useState("")
  const [spentOn, setSpentOn] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      setAmount("")
      // Set on open rather than at first render so the server and browser
      // can't disagree about what "today" is during hydration.
      setSpentOn(format(new Date(), "yyyy-MM-dd"))
      setDescription("")
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
      formData.set("spentOn", spentOn)
      formData.set("description", description)
      await updateActualExpense(formData)
      handleOpenChange(false)
    } catch {
      setError("Couldn't save that amount. Check the value and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const title = "Add actual expense"
  const dialogDescription = `Record what you actually spent on ${expenseName} under ${categoryName}. Each amount you add counts toward the month of the date you pick.`

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
      currentActualAmount={actualAmount}
      actualAmount={amount}
      onActualAmountChange={setAmount}
      spentOn={spentOn}
      onSpentOnChange={setSpentOn}
      description={description}
      onDescriptionChange={setDescription}
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
            <DrawerDescription>{dialogDescription}</DrawerDescription>
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
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  )
}
