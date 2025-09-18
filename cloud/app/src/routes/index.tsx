import "./index.css"
import { Title } from "@solidjs/meta"
import { onCleanup, onMount } from "solid-js"
import logoLight from "../asset/logo-ornate-light.svg"
import logoDark from "../asset/logo-ornate-dark.svg"
import IMG_SPLASH from "../asset/lander/screenshot-splash.png"
import { IconCopy, IconCheck } from "../component/icon"
import { createAsync, query } from "@solidjs/router"
import { getActor } from "~/context/auth"
import { withActor } from "~/context/auth.withActor"
import { Account } from "@skorpland/cloud-core/account.js"

function CopyStatus() {
  return (
    <div data-component="copy-status">
      <IconCopy data-slot="copy" />
      <IconCheck data-slot="check" />
    </div>
  )
}

const defaultWorkspace = query(async () => {
  "use server"
  const actor = await getActor()
  if (actor.type === "account") {
    const workspaces = await withActor(() => Account.workspaces())
    return workspaces[0].id
  }
}, "defaultWorkspace")

export default function Home() {
  const workspace = createAsync(() => defaultWorkspace())
  onMount(() => {
    const commands = document.querySelectorAll("[data-copy]")
    for (const button of commands) {
      const callback = () => {
        const text = button.textContent
        if (text) {
          navigator.clipboard.writeText(text)
          button.setAttribute("data-copied", "")
          setTimeout(() => {
            button.removeAttribute("data-copied")
          }, 1500)
        }
      }
      button.addEventListener("click", callback)
      onCleanup(() => {
        button.removeEventListener("click", callback)
      })
    }
  })

  return (
    <main data-page="home">
      <Title>sgptcoder | AI coding agent built for the terminal</Title>

      <div data-component="content">
        <section data-component="top">
          <img data-slot="logo light" src={logoLight} alt="sgptcoder logo light" />
          <img data-slot="logo dark" src={logoDark} alt="sgptcoder logo dark" />
          <h1 data-slot="title">The AI coding agent built for the terminal</h1>
          <div data-slot="login">
            <a href="/auth">sgptcoder zen</a>
          </div>
        </section>

        <section data-component="cta">
          <div data-slot="left">
            <a href="/docs">Get Started</a>
          </div>
          <div data-slot="center">
            <a href="/auth">sgptcoder zen</a>
          </div>
          <div data-slot="right">
            <button data-copy data-slot="command">
              <span>
                <span>curl -fsSL </span>
                <span data-slot="protocol">https://</span>
                <span data-slot="highlight">sgptcoder.ai/install</span>
                <span> | bash</span>
              </span>
              <CopyStatus />
            </button>
          </div>
        </section>

        <section data-component="features">
          <ul data-slot="list">
            <li>
              <strong>Native TUI</strong> A responsive, native, themeable terminal UI
            </li>
            <li>
              <strong>LSP enabled</strong> Automatically loads the right LSPs for the LLM
            </li>
            <li>
              <strong>sgptcoder zen</strong> A <a href="/docs/zen">curated list of models</a> provided by sgptcoder{" "}
              <label>New</label>
            </li>
            <li>
              <strong>Multi-session</strong> Start multiple agents in parallel on the same project
            </li>
            <li>
              <strong>Shareable links</strong> Share a link to any sessions for reference or to debug
            </li>
            <li>
              <strong>Claude Pro</strong> Log in with Anthropic to use your Claude Pro or Max account
            </li>
            <li>
              <strong>Use any model</strong> Supports 75+ LLM providers through{" "}
              <a href="https://models.dev">Models.dev</a>, including local models
            </li>
          </ul>
        </section>

        <section data-component="install">
          <div data-component="method">
            <h3 data-component="title">npm</h3>
            <button data-copy data-slot="button">
              <span>
                npm install -g <strong>@skorpland/sgptcoder</strong>
              </span>
              <CopyStatus />
            </button>
          </div>
          <div data-component="method">
            <h3 data-component="title">bun</h3>
            <button data-copy data-slot="button">
              <span>
                bun install -g <strong>@skorpland/sgptcoder</strong>
              </span>
              <CopyStatus />
            </button>
          </div>
          <div data-component="method">
            <h3 data-component="title">homebrew</h3>
            <button data-copy data-slot="button">
              <span>
                brew install <strong>sgpt/tap/sgptcoder</strong>
              </span>
              <CopyStatus />
            </button>
          </div>
          <div data-component="method">
            <h3 data-component="title">paru</h3>
            <button data-copy data-slot="button">
              <span>
                paru -S <strong>sgptcoder-bin</strong>
              </span>
              <CopyStatus />
            </button>
          </div>
        </section>

        <section data-component="screenshots">
          <figure>
            <figcaption>sgptcoder TUI with the tokyonight theme</figcaption>
            <a href="/docs/cli">
              <img src={IMG_SPLASH} alt="sgptcoder TUI with tokyonight theme" />
            </a>
          </figure>
        </section>

        <footer data-component="footer">
          <div data-slot="cell">
            <a href="https://x.com/sgptcoder">X.com</a>
          </div>
          <div data-slot="cell">
            <a href="https://github.com/skorpland/sgptcoder">GitHub</a>
          </div>
          <div data-slot="cell">
            <a href="https://sgptcoder.ai/discord">Discord</a>
          </div>
        </footer>
      </div>

      <div data-component="legal">
        <span>
          ©2025 <a href="https://anoma.ly">Anomaly Innovations</a>
        </span>
      </div>
    </main>
  )
}
