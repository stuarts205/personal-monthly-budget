"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { and, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { categoryBudgetExpenses, expenseCategories, income } from "@/db/schema"
import { auth } from "@/lib/auth"

export async function addExpenseCategory(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized")
  }

  const name = String(formData.get("name") ?? "").trim()

  if (!name) {
    return { success: false, error: "Category name is required." }
  }

  const [existing] = await db
    .select({ id: expenseCategories.id })
    .from(expenseCategories)
    .where(
      and(
        eq(expenseCategories.userId, session.user.id),
        sql`lower(${expenseCategories.name}) = lower(${name})`
      )
    )

  if (existing) {
    return {
      success: false,
      error: `You already have a category named "${name}".`,
    }
  }

  await db.insert(expenseCategories).values({ name, userId: session.user.id })

  revalidatePath("/")
  return { success: true }
}

export async function addCategoryBudgetExpense(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized")
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const budgetedAmount = Number.parseFloat(
    String(formData.get("budgetedAmount") ?? "")
  )

  if (!categoryId) {
    throw new Error("Category is required")
  }
  if (!name) {
    throw new Error("Name is required")
  }
  if (!Number.isFinite(budgetedAmount) || budgetedAmount < 0) {
    throw new Error("Budgeted amount must be a positive number")
  }

  const [category] = await db
    .select()
    .from(expenseCategories)
    .where(
      and(
        eq(expenseCategories.id, categoryId),
        eq(expenseCategories.userId, session.user.id)
      )
    )

  if (!category) {
    throw new Error("Category not found")
  }

  await db.insert(categoryBudgetExpenses).values({
    name,
    budgetedAmount,
    categoryId,
    userId: session.user.id,
  })

  revalidatePath("/")
}

export async function updateCategoryBudgetExpense(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized")
  }

  const id = String(formData.get("id") ?? "").trim()
  const name = String(formData.get("name") ?? "").trim()
  const budgetedAmount = Number.parseFloat(
    String(formData.get("budgetedAmount") ?? "")
  )

  if (!id) {
    throw new Error("Expense id is required")
  }
  if (!name) {
    throw new Error("Name is required")
  }
  if (!Number.isFinite(budgetedAmount) || budgetedAmount < 0) {
    throw new Error("Budgeted amount must be a positive number")
  }

  const [updated] = await db
    .update(categoryBudgetExpenses)
    .set({ name, budgetedAmount })
    .where(
      and(
        eq(categoryBudgetExpenses.id, id),
        eq(categoryBudgetExpenses.userId, session.user.id)
      )
    )
    .returning()

  if (!updated) {
    throw new Error("Expense not found")
  }

  revalidatePath("/")
}

export async function updateIncome(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    throw new Error("Unauthorized")
  }

  const amount = Number.parseFloat(String(formData.get("amount") ?? ""))

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Income must be a positive number")
  }

  await db
    .insert(income)
    .values({ amount, userId: session.user.id })
    .onConflictDoUpdate({
      target: income.userId,
      set: { amount },
    })

  revalidatePath("/")
}
