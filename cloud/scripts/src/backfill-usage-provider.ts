import { Database, eq } from "@skorpland/cloud-core/drizzle/index.js"
import { UsageTable } from "@skorpland/cloud-core/schema/billing.sql.js"

await Database.use(async (tx) => {
  await tx
    .update(UsageTable)
    .set({ model: "grok-code" })
    .where(eq(UsageTable.model, "x-ai/grok-code-fast-1"))
    .limit(90000)
})
