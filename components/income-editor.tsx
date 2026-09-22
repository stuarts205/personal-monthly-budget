"use client"

import * as React from "react"
import { ArrowUpRight, Pencil } from "lucide-react"

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
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/hooks/use-mobile"
import { updateIncome } from "@/app/(dashboard)/actions"

type IncomeEditorProps = {
  initialAmount: number
}

function IncomeForm({
  amount,
  onAmountChange,
  onCancel,
  onSubmit,
  isSubmitting,
  error,
}: {
  amount: string
  onAmountChange: (value: string) => void
  onCancel: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
  error: string | null
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="monthly-income" className="text-sm font-medium">
          Monthly income
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            $
          </span>
          <Input
            id="monthly-income"
            name="monthly-income"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            className="h-10 pl-7 tabular-nums"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Enter the total income you expect for this month.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save income"}
        </Button>
      </div>
    </form>
  )
}

export function IncomeEditor({ initialAmount }: IncomeEditorProps) {
  const isMobile = useIsMobile()
  const [amount, setAmount] = React.useState(initialAmount.toFixed(2))
  const [draftAmount, setDraftAmount] = React.useState(amount)
  const [open, setOpen] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const openEditor = () => {
    setDraftAmount(amount)
    setError(null)
    setOpen(true)
  }

  const saveIncome = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.set("amount", draftAmount)
      await updateIncome(formData)
      setAmount(Number.parseFloat(draftAmount).toFixed(2))
      setOpen(false)
    } catch {
      setError("Couldn't save your income. Check the value and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const incomeCard = (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Monthly income</p>
          <ArrowUpRight
            className="size-4 text-emerald-600"
            aria-hidden="true"
          />
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums">
          $
          {Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Expected this month
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={openEditor}
        >
          <Pencil data-icon="inline-start" />
          Adjust income
        </Button>
      </CardContent>
    </Card>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={incomeCard} />
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Adjust monthly income</DrawerTitle>
            <DrawerDescription>
              Update the income amount used in your overall budget.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <IncomeForm
              amount={draftAmount}
              onAmountChange={setDraftAmount}
              onCancel={() => setOpen(false)}
              onSubmit={saveIncome}
              isSubmitting={isSubmitting}
              error={error}
            />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={incomeCard} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust monthly income</DialogTitle>
          <DialogDescription>
            Update the income amount used in your overall budget.
          </DialogDescription>
        </DialogHeader>
        <IncomeForm
          amount={draftAmount}
          onAmountChange={setDraftAmount}
          onCancel={() => setOpen(false)}
          onSubmit={saveIncome}
          isSubmitting={isSubmitting}
          error={error}
        />
      </DialogContent>
    </Dialog>
  )
}
