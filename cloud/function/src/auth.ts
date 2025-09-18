import { z } from "zod"
import { issuer } from "@openauthjs/openauth"
import type { Theme } from "@openauthjs/openauth/ui/theme"
import { createSubjects } from "@openauthjs/openauth/subject"
import { THEME_OPENAUTH } from "@openauthjs/openauth/ui/theme"
import { GithubProvider } from "@openauthjs/openauth/provider/github"
import { GoogleOidcProvider } from "@openauthjs/openauth/provider/google"
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare"
import { Account } from "@skorpland/cloud-core/account.js"
import { Workspace } from "@skorpland/cloud-core/workspace.js"
import { Actor } from "@skorpland/cloud-core/actor.js"
import { Resource } from "@skorpland/cloud-resource"
import { Database } from "@skorpland/cloud-core/drizzle/index.js"

type Env = {
  AuthStorage: KVNamespace
}

export const subjects = createSubjects({
  account: z.object({
    accountID: z.string(),
    email: z.string(),
  }),
  user: z.object({
    userID: z.string(),
    workspaceID: z.string(),
  }),
})

const MY_THEME: Theme = {
  ...THEME_OPENAUTH,
  logo: "https://sgptcoder.ai/favicon.svg",
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const result = await issuer({
      theme: MY_THEME,
      providers: {
        github: GithubProvider({
          clientID: Resource.GITHUB_CLIENT_ID_CONSOLE.value,
          clientSecret: Resource.GITHUB_CLIENT_SECRET_CONSOLE.value,
          scopes: ["read:user", "user:email"],
        }),
        google: GoogleOidcProvider({
          clientID: Resource.GOOGLE_CLIENT_ID.value,
          scopes: ["openid", "email"],
        }),
        //        email: CodeProvider({
        //          async request(req, state, form, error) {
        //            console.log(state)
        //            const params = new URLSearchParams()
        //            if (error) {
        //              params.set("error", error.type)
        //            }
        //            if (state.type === "start") {
        //              return Response.redirect(process.env.AUTH_FRONTEND_URL + "/auth/email?" + params.toString(), 302)
        //            }
        //
        //            if (state.type === "code") {
        //              return Response.redirect(process.env.AUTH_FRONTEND_URL + "/auth/code?" + params.toString(), 302)
        //            }
        //
        //            return new Response("ok")
        //          },
        //          async sendCode(claims, code) {
        //            const email = z.string().email().parse(claims.email)
        //            const cmd = new SendEmailCommand({
        //              Destination: {
        //                ToAddresses: [email],
        //              },
        //              FromEmailAddress: `SGPT <auth@${Resource.Email.sender}>`,
        //              Content: {
        //                Simple: {
        //                  Body: {
        //                    Html: {
        //                      Data: `Your pin code is <strong>${code}</strong>`,
        //                    },
        //                    Text: {
        //                      Data: `Your pin code is ${code}`,
        //                    },
        //                  },
        //                  Subject: {
        //                    Data: "SGPT Console Pin Code: " + code,
        //                  },
        //                },
        //              },
        //            })
        //            await ses.send(cmd)
        //          },
        //        }),
      },
      storage: CloudflareStorage({
        namespace: env.AuthStorage,
      }),
      subjects,
      async success(ctx, response) {
        console.log(response)

        let email: string | undefined

        if (response.provider === "github") {
          const emails = (await fetch("https://api.github.com/user/emails", {
            headers: {
              Authorization: `Bearer ${response.tokenset.access}`,
              "User-Agent": "sgptcoder",
              Accept: "application/vnd.github+json",
            },
          }).then((x) => x.json())) as any
          email = emails.find((x: any) => x.primary && x.verified)?.email
        } else if (response.provider === "google") {
          if (!response.id.email_verified) throw new Error("Google email not verified")
          email = response.id.email as string
        }
        //if (response.provider === "email") {
        //  email = response.claims.email
        //}
        else throw new Error("Unsupported provider")

        if (!email) throw new Error("No email found")

        let accountID = await Account.fromEmail(email).then((x) => x?.id)
        if (!accountID) {
          console.log("creating account for", email)
          accountID = await Account.create({
            email: email!,
          })
        }
        await Actor.provide("account", { accountID, email }, async () => {
          const workspaces = await Account.workspaces()
          if (workspaces.length === 0) {
            await Workspace.create()
          }
        })
        return ctx.subject("account", accountID, { accountID, email })
      },
    }).fetch(request, env, ctx)
    return result
  },
}
