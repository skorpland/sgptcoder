import { WebhookEndpoint } from "pulumi-stripe"
import { domain } from "./stage"

////////////////
// DATABASE
////////////////

const cluster = planetscale.getDatabaseOutput({
  name: "sgptcoder",
  organization: "anomalyco",
})

const branch =
  $app.stage === "production"
    ? planetscale.getBranchOutput({
        name: "production",
        organization: cluster.organization,
        database: cluster.name,
      })
    : new planetscale.Branch("DatabaseBranch", {
        database: cluster.name,
        organization: cluster.organization,
        name: $app.stage,
        parentBranch: "production",
      })
const password = new planetscale.Password("DatabasePassword", {
  name: $app.stage,
  database: cluster.name,
  organization: cluster.organization,
  branch: branch.name,
})

export const database = new sgpt.Linkable("Database", {
  properties: {
    host: password.accessHostUrl,
    database: cluster.name,
    username: password.username,
    password: password.plaintext,
    port: 3306,
  },
})

new sgpt.x.DevCommand("Studio", {
  link: [database],
  dev: {
    command: "bun db studio",
    directory: "cloud/core",
    autostart: true,
  },
})

////////////////
// AUTH
////////////////

const GITHUB_CLIENT_ID_CONSOLE = new sgpt.Secret("GITHUB_CLIENT_ID_CONSOLE")
const GITHUB_CLIENT_SECRET_CONSOLE = new sgpt.Secret("GITHUB_CLIENT_SECRET_CONSOLE")
const GOOGLE_CLIENT_ID = new sgpt.Secret("GOOGLE_CLIENT_ID")
const authStorage = new sgpt.cloudflare.Kv("AuthStorage")
export const auth = new sgpt.cloudflare.Worker("AuthApi", {
  domain: `auth.${domain}`,
  handler: "cloud/function/src/auth.ts",
  url: true,
  link: [database, authStorage, GITHUB_CLIENT_ID_CONSOLE, GITHUB_CLIENT_SECRET_CONSOLE, GOOGLE_CLIENT_ID],
})

////////////////
// GATEWAY
////////////////

export const stripeWebhook = new WebhookEndpoint("StripeWebhookEndpoint", {
  url: $interpolate`https://${domain}/stripe/webhook`,
  enabledEvents: [
    "checkout.session.async_payment_failed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.completed",
    "checkout.session.expired",
    "customer.created",
    "customer.deleted",
    "customer.updated",
    "customer.discount.created",
    "customer.discount.deleted",
    "customer.discount.updated",
    "customer.source.created",
    "customer.source.deleted",
    "customer.source.expiring",
    "customer.source.updated",
    "customer.subscription.created",
    "customer.subscription.deleted",
    "customer.subscription.paused",
    "customer.subscription.pending_update_applied",
    "customer.subscription.pending_update_expired",
    "customer.subscription.resumed",
    "customer.subscription.trial_will_end",
    "customer.subscription.updated",
    "customer.tax_id.created",
    "customer.tax_id.deleted",
    "customer.tax_id.updated",
  ],
})

const ANTHROPIC_API_KEY = new sgpt.Secret("ANTHROPIC_API_KEY")
const OPENAI_API_KEY = new sgpt.Secret("OPENAI_API_KEY")
const XAI_API_KEY = new sgpt.Secret("XAI_API_KEY")
const BASETEN_API_KEY = new sgpt.Secret("BASETEN_API_KEY")
const FIREWORKS_API_KEY = new sgpt.Secret("FIREWORKS_API_KEY")
const STRIPE_SECRET_KEY = new sgpt.Secret("STRIPE_SECRET_KEY")
const AUTH_API_URL = new sgpt.Linkable("AUTH_API_URL", {
  properties: { value: auth.url.apply((url) => url!) },
})
const STRIPE_WEBHOOK_SECRET = new sgpt.Linkable("STRIPE_WEBHOOK_SECRET", {
  properties: { value: stripeWebhook.secret },
})

////////////////
// CONSOLE
////////////////

let logProcessor
if ($app.stage === "production" || $app.stage === "frank") {
  const HONEYCOMB_API_KEY = new sgpt.Secret("HONEYCOMB_API_KEY")
  logProcessor = new sgpt.cloudflare.Worker("LogProcessor", {
    handler: "cloud/function/src/log-processor.ts",
    link: [HONEYCOMB_API_KEY],
  })
}

new sgpt.cloudflare.x.SolidStart("Console", {
  domain,
  path: "cloud/app",
  link: [
    database,
    AUTH_API_URL,
    STRIPE_WEBHOOK_SECRET,
    STRIPE_SECRET_KEY,
    ANTHROPIC_API_KEY,
    OPENAI_API_KEY,
    XAI_API_KEY,
    BASETEN_API_KEY,
    FIREWORKS_API_KEY,
  ],
  environment: {
    //VITE_DOCS_URL: web.url.apply((url) => url!),
    //VITE_API_URL: gateway.url.apply((url) => url!),
    VITE_AUTH_URL: auth.url.apply((url) => url!),
  },
  transform: {
    server: {
      transform: {
        worker: {
          placement: { mode: "smart" },
          tailConsumers: logProcessor ? [{ service: logProcessor.nodes.worker.scriptName }] : [],
        },
      },
    },
  },
})
