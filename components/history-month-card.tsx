"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type HistoryMonthCardProps = {
  monthLabel: string
  summary: string
  isCurrent: boolean
  children: React.ReactNode
}

// The current month starts expanded; past months start hidden and can be
// toggled with the chevron next to the month label.
export function HistoryMonthCard({
  monthLabel,
  summary,
  isCurrent,
  children,
}: HistoryMonthCardProps) {
  const [open, setOpen] = useState(isCurrent)

  return (
    <Collapsible open={open} onOpenChange={setOpen} render={<Card />}>
      <CardHeader className={open ? "border-b" : undefined}>
        <CardTitle className="flex items-center gap-1 text-blue-700">
          {monthLabel}
          <CollapsibleTrigger
            render={<Button type="button" variant="ghost" size="icon-xs" />}
            aria-label={`${open ? "Hide" : "Show"} ${monthLabel} history`}
          >
            <ChevronDown
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
        </CardTitle>
        <CardDescription>{summary}</CardDescription>
        {isCurrent && (
          <CardAction>
            <Badge variant="secondary">Current month</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CollapsibleContent>
        <CardContent className="divide-y">{children}</CardContent>
      </CollapsibleContent>
    </Collapsible>
  )
}
