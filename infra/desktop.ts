import { domain } from "./stage"

new sgpt.cloudflare.StaticSite("Desktop", {
  domain: "desktop." + domain,
  path: "packages/agentapp",
  build: {
    command: "bun run build",
    output: "./dist",
  },
})
