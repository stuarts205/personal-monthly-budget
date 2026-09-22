import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { user, expenseCategories } from "./schema";

const categoryNames = [
  "HOME EXPENSES",
  "TRANSPORTATION",
  "HEALTH",
  "CHARITY/GIFTS",
  "SUBSCRIPTIONS",
  "DAILY LIVING",
  "ENTERTAINMENT",
  "SAVINGS",
  "OBLIGATIONS",
  "MISCELLANEOUS",
];

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npm run db:seed -- <user-email>");
    process.exit(1);
  }

  const [owner] = await db.select().from(user).where(eq(user.email, email));
  if (!owner) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await db
    .insert(expenseCategories)
    .values(categoryNames.map((name) => ({ name, userId: owner.id })))
    .onConflictDoNothing();

  console.log(`Seeded ${categoryNames.length} expense categories for ${email}.`);
}

main();
