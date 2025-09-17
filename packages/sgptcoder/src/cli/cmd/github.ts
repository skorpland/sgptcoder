import path from "path"
import { $ } from "bun"
import { exec } from "child_process"
import * as prompts from "@clack/prompts"
import { map, pipe, sortBy, values } from "remeda"
import { UI } from "../ui"
import { cmd } from "./cmd"
import { ModelsDev } from "../../provider/models"
import { Instance } from "../../project/instance"

const WORKFLOW_FILE = ".github/workflows/sgptcoder.yml"

export const GithubCommand = cmd({
  command: "github",
  describe: "manage GitHub agent",
  builder: (yargs) => yargs.command(GithubInstallCommand).demandCommand(),
  async handler() {},
})

export const GithubInstallCommand = cmd({
  command: "install",
  describe: "install the GitHub agent",
  async handler() {
    await Instance.provide(process.cwd(), async () => {
      UI.empty()
      prompts.intro("Install GitHub agent")
      const app = await getAppInfo()
      await installGitHubApp()

      const providers = await ModelsDev.get()
      const provider = await promptProvider()
      const model = await promptModel()
      //const key = await promptKey()

      await addWorkflowFiles()
      printNextSteps()

      function printNextSteps() {
        let step2
        if (provider === "amazon-bedrock") {
          step2 =
            "Configure OIDC in AWS - https://docs.github.com/en/actions/how-tos/security-for-github-actions/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services"
        } else {
          step2 = [
            `    2. Add the following secrets in org or repo (${app.owner}/${app.repo}) settings`,
            "",
            ...providers[provider].env.map((e) => `       - ${e}`),
          ].join("\n")
        }

        prompts.outro(
          [
            "Next steps:",
            "",
            `    1. Commit the \`${WORKFLOW_FILE}\` file and push`,
            step2,
            "",
            "    3. Go to a GitHub issue and comment `/oc summarize` to see the agent in action",
            "",
            "   Learn more about the GitHub agent - https://sgptcoder.ai/docs/github/#usage-examples",
          ].join("\n"),
        )
      }

      async function getAppInfo() {
        const project = Instance.project
        if (project.vcs !== "git") {
          prompts.log.error(`Could not find git repository. Please run this command from a git repository.`)
          throw new UI.CancelledError()
        }

        // Get repo info
        const info = await $`git remote get-url origin`
          .quiet()
          .nothrow()
          .text()
          .then((text) => text.trim())
        // match https or git pattern
        // ie. https://github.com/skorpland/sgptcoder.git
        // ie. https://github.com/skorpland/sgptcoder
        // ie. git@github.com:sst/sgptcoder.git
        // ie. git@github.com:sst/sgptcoder
        // ie. ssh://git@github.com/skorpland/sgptcoder.git
        // ie. ssh://git@github.com/skorpland/sgptcoder
        const parsed = info.match(/^(?:(?:https?|ssh):\/\/)?(?:git@)?github\.com[:/]([^/]+)\/([^/.]+?)(?:\.git)?$/)
        if (!parsed) {
          prompts.log.error(`Could not find git repository. Please run this command from a git repository.`)
          throw new UI.CancelledError()
        }
        const [, owner, repo] = parsed
        return { owner, repo, root: Instance.worktree }
      }

      async function promptProvider() {
        const priority: Record<string, number> = {
          sgptcoder: 0,
          anthropic: 1,
          "github-copilot": 2,
          openai: 3,
          google: 4,
          openrouter: 5,
          vercel: 6,
        }
        let provider = await prompts.select({
          message: "Select provider",
          maxItems: 8,
          options: pipe(
            providers,
            values(),
            sortBy(
              (x) => priority[x.id] ?? 99,
              (x) => x.name ?? x.id,
            ),
            map((x) => ({
              label: x.name,
              value: x.id,
              hint: priority[x.id] <= 1 ? "recommended" : undefined,
            })),
          ),
        })

        if (prompts.isCancel(provider)) throw new UI.CancelledError()

        return provider
      }

      async function promptModel() {
        const providerData = providers[provider]!

        const model = await prompts.select({
          message: "Select model",
          maxItems: 8,
          options: pipe(
            providerData.models,
            values(),
            sortBy((x) => x.name ?? x.id),
            map((x) => ({
              label: x.name ?? x.id,
              value: x.id,
            })),
          ),
        })

        if (prompts.isCancel(model)) throw new UI.CancelledError()
        return model
      }

      async function installGitHubApp() {
        const s = prompts.spinner()
        s.start("Installing GitHub app")

        // Get installation
        const installation = await getInstallation()
        if (installation) return s.stop("GitHub app already installed")

        // Open browser
        const url = "https://github.com/apps/sgptcoder-agent"
        const command =
          process.platform === "darwin"
            ? `open "${url}"`
            : process.platform === "win32"
              ? `start "${url}"`
              : `xdg-open "${url}"`

        exec(command, (error) => {
          if (error) {
            prompts.log.warn(`Could not open browser. Please visit: ${url}`)
          }
        })

        // Wait for installation
        s.message("Waiting for GitHub app to be installed")
        const MAX_RETRIES = 120
        let retries = 0
        do {
          const installation = await getInstallation()
          if (installation) break

          if (retries > MAX_RETRIES) {
            s.stop(
              `Failed to detect GitHub app installation. Make sure to install the app for the \`${app.owner}/${app.repo}\` repository.`,
            )
            throw new UI.CancelledError()
          }

          retries++
          await new Promise((resolve) => setTimeout(resolve, 1000))
        } while (true)

        s.stop("Installed GitHub app")

        async function getInstallation() {
          return await fetch(`https://api.sgptcoder.ai/get_github_app_installation?owner=${app.owner}&repo=${app.repo}`)
            .then((res) => res.json())
            .then((data) => data.installation)
        }
      }

      async function addWorkflowFiles() {
        const envStr =
          provider === "amazon-bedrock"
            ? ""
            : `\n        env:${providers[provider].env.map((e) => `\n          ${e}: \${{ secrets.${e} }}`).join("")}`

        await Bun.write(
          path.join(app.root, WORKFLOW_FILE),
          `
name: sgptcoder

on:
  issue_comment:
    types: [created]

jobs:
  sgptcoder:
    if: |
      contains(github.event.comment.body, ' /oc') ||
      startsWith(github.event.comment.body, '/oc') ||
      contains(github.event.comment.body, ' /sgptcoder') ||
      startsWith(github.event.comment.body, '/sgptcoder')
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Run sgptcoder
        uses: skorpland/sgptcoder/github@latest${envStr}
        with:
          model: ${provider}/${model}
`.trim(),
        )

        prompts.log.success(`Added workflow file: "${WORKFLOW_FILE}"`)
      }
    })
  },
})
