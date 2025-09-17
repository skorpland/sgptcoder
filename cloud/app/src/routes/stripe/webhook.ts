import { Billing } from "@skorpland/cloud-core/billing.js"
import type { APIEvent } from "@solidjs/start/server"
import { Database, eq, sql } from "@skorpland/cloud-core/drizzle/index.js"
import { BillingTable, PaymentTable } from "@skorpland/cloud-core/schema/billing.sql.js"
import { Identifier } from "@skorpland/cloud-core/identifier.js"
import { centsToMicroCents } from "@skorpland/cloud-core/util/price.js"
import { Actor } from "@skorpland/cloud-core/actor.js"
import { Resource } from "@skorpland/cloud-resource"

export async function POST(input: APIEvent) {
  const body = await Billing.stripe().webhooks.constructEventAsync(
    await input.request.text(),
    input.request.headers.get("stripe-signature")!,
    Resource.STRIPE_WEBHOOK_SECRET.value,
  )

  console.log(body.type, JSON.stringify(body, null, 2))
  if (body.type === "customer.updated") {
    // check default payment method changed
    const prevInvoiceSettings = body.data.previous_attributes?.invoice_settings ?? {}
    if (!("default_payment_method" in prevInvoiceSettings)) return

    const customerID = body.data.object.id
    const paymentMethodID = body.data.object.invoice_settings.default_payment_method as string

    if (!customerID) throw new Error("Customer ID not found")
    if (!paymentMethodID) throw new Error("Payment method ID not found")

    const paymentMethod = await Billing.stripe().paymentMethods.retrieve(paymentMethodID)
    await Database.use(async (tx) => {
      await tx
        .update(BillingTable)
        .set({
          paymentMethodID,
          paymentMethodLast4: paymentMethod.card!.last4,
        })
        .where(eq(BillingTable.customerID, customerID))
    })
  }
  if (body.type === "checkout.session.completed") {
    const workspaceID = body.data.object.metadata?.workspaceID
    const customerID = body.data.object.customer as string
    const paymentID = body.data.object.payment_intent as string
    const amount = body.data.object.amount_total

    if (!workspaceID) throw new Error("Workspace ID not found")
    if (!customerID) throw new Error("Customer ID not found")
    if (!amount) throw new Error("Amount not found")
    if (!paymentID) throw new Error("Payment ID not found")

    await Actor.provide("system", { workspaceID }, async () => {
      const customer = await Billing.get()
      if (customer?.customerID && customer.customerID !== customerID) throw new Error("Customer ID mismatch")

      // set customer metadata
      if (!customer?.customerID) {
        await Billing.stripe().customers.update(customerID, {
          metadata: {
            workspaceID,
          },
        })
      }

      // get payment method for the payment intent
      const paymentIntent = await Billing.stripe().paymentIntents.retrieve(paymentID, {
        expand: ["payment_method"],
      })
      const paymentMethod = paymentIntent.payment_method
      if (!paymentMethod || typeof paymentMethod === "string") throw new Error("Payment method not expanded")

      await Database.transaction(async (tx) => {
        await tx
          .update(BillingTable)
          .set({
            balance: sql`${BillingTable.balance} + ${centsToMicroCents(Billing.CHARGE_AMOUNT)}`,
            customerID,
            paymentMethodID: paymentMethod.id,
            paymentMethodLast4: paymentMethod.card!.last4,
            reload: true,
            reloadError: null,
            timeReloadError: null,
          })
          .where(eq(BillingTable.workspaceID, workspaceID))
        await tx.insert(PaymentTable).values({
          workspaceID,
          id: Identifier.create("payment"),
          amount: centsToMicroCents(Billing.CHARGE_AMOUNT),
          paymentID,
          customerID,
        })
      })
    })
  }

  console.log("finished handling")

  return Response.json("ok", { status: 200 })
}
