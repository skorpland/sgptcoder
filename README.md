# Sgptcoder

<p align="center">
    <a href="https://stuff.charm.sh/sgpt/charm-sgpt.png"><img width="450" alt="Charm Sgptcoder Logo" src="https://github.com/user-attachments/assets/adc1a6f4-b284-4603-836c-59038caa2e8b" /></a><br />
    <a href="https://github.com/skorpland/sgptcoder/releases"><img src="https://img.shields.io/github/release/charmbracelet/sgpt" alt="Latest Release"></a>
    <a href="https://github.com/skorpland/sgptcoder/actions"><img src="https://github.com/skorpland/sgptcoder/actions/workflows/build.yml/badge.svg" alt="Build Status"></a>
</p>

<p align="center">Your new coding bestie, now available in your favourite terminal.<br />Your tools, your code, and your workflows, wired into your LLM of choice.</p>

<p align="center"><img width="800" alt="Sgptcoder Demo" src="https://github.com/user-attachments/assets/58280caf-851b-470a-b6f7-d5c4ea8a1968" /></p>

## Features

- **Multi-Model:** choose from a wide range of LLMs or add your own via OpenAI- or Anthropic-compatible APIs
- **Flexible:** switch LLMs mid-session while preserving context
- **Session-Based:** maintain multiple work sessions and contexts per project
- **LSP-Enhanced:** Sgptcoder uses LSPs for additional context, just like you do
- **Extensible:** add capabilities via MCPs (`http`, `stdio`, and `sse`)
- **Works Everywhere:** first-class support in every terminal on macOS, Linux, Windows (PowerShell and WSL), FreeBSD, OpenBSD, and NetBSD

## Installation

Use a package manager:

```bash
# Homebrew
brew install charmbracelet/tap/sgpt

# NPM
npm install -g @charmland/sgpt

# Arch Linux (btw)
yay -S sgpt-bin

# Nix
nix run github:numtide/nix-ai-tools#sgpt
```

Windows users:

```bash
# Winget
winget install charmbracelet.sgpt

# Scoop
scoop bucket add charm https://github.com/charmbracelet/scoop-bucket.git
scoop install sgpt
```

<details>
<summary><strong>Nix (NUR)</strong></summary>

Sgptcoder is available via [NUR](https://github.com/nix-community/NUR) in `nur.repos.charmbracelet.sgpt`.

You can also try out Sgptcoder via `nix-shell`:

```bash
# Add the NUR channel.
nix-channel --add https://github.com/nix-community/NUR/archive/main.tar.gz nur
nix-channel --update

# Get Sgptcoder in a Nix shell.
nix-shell -p '(import <nur> { pkgs = import <nixpkgs> {}; }).repos.charmbracelet.sgpt'
```

</details>

<details>
<summary><strong>Debian/Ubuntu</strong></summary>

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://repo.charm.sh/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | sudo tee /etc/apt/sources.list.d/charm.list
sudo apt update && sudo apt install sgpt
```

</details>

<details>
<summary><strong>Fedora/RHEL</strong></summary>

```bash
echo '[charm]
name=Charm
baseurl=https://repo.charm.sh/yum/
enabled=1
gpgcheck=1
gpgkey=https://repo.charm.sh/yum/gpg.key' | sudo tee /etc/yum.repos.d/charm.repo
sudo yum install sgpt
```

</details>

Or, download it:

- [Packages][releases] are available in Debian and RPM formats
- [Binaries][releases] are available for Linux, macOS, Windows, FreeBSD, OpenBSD, and NetBSD

[releases]: https://github.com/skorpland/sgptcoder/releases

Or just install it with Go:

```
go install github.com/skorpland/sgptcoder@latest
```

> [!WARNING]
> Productivity may increase when using Sgptcoder and you may find yourself nerd
> sniped when first using the application. If the symptoms persist, join the
> [Discord][discord] and nerd snipe the rest of us.

## Getting Started

The quickest way to get started is to grab an API key for your preferred
provider such as Anthropic, OpenAI, Groq, or OpenRouter and just start
Sgptcoder. You'll be prompted to enter your API key.

That said, you can also set environment variables for preferred providers.

| Environment Variable       | Provider                                           |
| -------------------------- | -------------------------------------------------- |
| `ANTHROPIC_API_KEY`        | Anthropic                                          |
| `OPENAI_API_KEY`           | OpenAI                                             |
| `OPENROUTER_API_KEY`       | OpenRouter                                         |
| `CEREBRAS_API_KEY`         | Cerebras                                           |
| `GEMINI_API_KEY`           | Google Gemini                                      |
| `VERTEXAI_PROJECT`         | Google Cloud VertexAI (Gemini)                     |
| `VERTEXAI_LOCATION`        | Google Cloud VertexAI (Gemini)                     |
| `GROQ_API_KEY`             | Groq                                               |
| `AWS_ACCESS_KEY_ID`        | AWS Bedrock (Claude)                               |
| `AWS_SECRET_ACCESS_KEY`    | AWS Bedrock (Claude)                               |
| `AWS_REGION`               | AWS Bedrock (Claude)                               |
| `AZURE_OPENAI_ENDPOINT`    | Azure OpenAI models                                |
| `AZURE_OPENAI_API_KEY`     | Azure OpenAI models (optional when using Entra ID) |
| `AZURE_OPENAI_API_VERSION` | Azure OpenAI models                                |

### By the Way

Is there a provider you’d like to see in Sgptcoder? Is there an existing model that needs an update?

Sgptcoder’s default model listing is managed in [Catwalk](https://github.com/charmbracelet/catwalk), a community-supported, open source repository of Sgptcoder-compatible models, and you’re welcome to contribute.

<a href="https://github.com/charmbracelet/catwalk"><img width="174" height="174" alt="Catwalk Badge" src="https://github.com/user-attachments/assets/95b49515-fe82-4409-b10d-5beb0873787d" /></a>

## Configuration

Sgptcoder runs great with no configuration. That said, if you do need or want to
customize Sgptcoder, configuration can be added either local to the project itself,
or globally, with the following priority:

1. `.sgpt.json`
2. `sgpt.json`
3. `$HOME/.config/sgpt/sgpt.json` (Windows: `%USERPROFILE%\AppData\Local\sgpt\sgpt.json`)

Configuration itself is stored as a JSON object:

```json
{
  "this-setting": { "this": "that" },
  "that-setting": ["ceci", "cela"]
}
```

As an additional note, Sgptcoder also stores ephemeral data, such as application state, in one additional location:

```bash
# Unix
$HOME/.local/share/sgpt/sgpt.json

# Windows
%LOCALAPPDATA%\sgpt\sgpt.json
```

### LSPs

Sgptcoder can use LSPs for additional context to help inform its decisions, just
like you would. LSPs can be added manually like so:

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "lsp": {
    "go": {
      "command": "gopls",
      "env": {
        "GOTOOLCHAIN": "go1.24.5"
      }
    },
    "typescript": {
      "command": "typescript-language-server",
      "args": ["--stdio"]
    },
    "nix": {
      "command": "nil"
    }
  }
}
```

### MCPs

Sgptcoder also supports Model Context Protocol (MCP) servers through three
transport types: `stdio` for command-line servers, `http` for HTTP endpoints,
and `sse` for Server-Sent Events. Environment variable expansion is supported
using `$(echo $VAR)` syntax.

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "mcp": {
    "filesystem": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/mcp-server.js"],
      "env": {
        "NODE_ENV": "production"
      }
    },
    "github": {
      "type": "http",
      "url": "https://example.com/mcp/",
      "headers": {
        "Authorization": "$(echo Bearer $EXAMPLE_MCP_TOKEN)"
      }
    },
    "streaming-service": {
      "type": "sse",
      "url": "https://example.com/mcp/sse",
      "headers": {
        "API-Key": "$(echo $API_KEY)"
      }
    }
  }
}
```

### Ignoring Files

Sgptcoder respects `.gitignore` files by default, but you can also create a
`.sgptignore` file to specify additional files and directories that Sgptcoder
should ignore. This is useful for excluding files that you want in version
control but don't want Sgptcoder to consider when providing context.

The `.sgptignore` file uses the same syntax as `.gitignore` and can be placed
in the root of your project or in subdirectories.

### Allowing Tools

By default, Sgptcoder will ask you for permission before running tool calls. If
you'd like, you can allow tools to be executed without prompting you for
permissions. Use this with care.

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "permissions": {
    "allowed_tools": [
      "view",
      "ls",
      "grep",
      "edit",
      "mcp_context7_get-library-doc"
    ]
  }
}
```

You can also skip all permission prompts entirely by running Sgptcoder with the
`--yolo` flag. Be very, very careful with this feature.

### Local Models

Local models can also be configured via OpenAI-compatible API. Here are two common examples:

#### Ollama

```json
{
  "providers": {
    "ollama": {
      "name": "Ollama",
      "base_url": "http://localhost:11434/v1/",
      "type": "openai",
      "models": [
        {
          "name": "Qwen 3 30B",
          "id": "qwen3:30b",
          "context_window": 256000,
          "default_max_tokens": 20000
        }
      ]
    }
  }
}
```

#### LM Studio

```json
{
  "providers": {
    "lmstudio": {
      "name": "LM Studio",
      "base_url": "http://localhost:1234/v1/",
      "type": "openai",
      "models": [
        {
          "name": "Qwen 3 30B",
          "id": "qwen/qwen3-30b-a3b-2507",
          "context_window": 256000,
          "default_max_tokens": 20000
        }
      ]
    }
  }
}
```

### Custom Providers

Sgptcoder supports custom provider configurations for both OpenAI-compatible and
Anthropic-compatible APIs.

#### OpenAI-Compatible APIs

Here’s an example configuration for Deepseek, which uses an OpenAI-compatible
API. Don't forget to set `DEEPSEEK_API_KEY` in your environment.

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "providers": {
    "deepseek": {
      "type": "openai",
      "base_url": "https://api.deepseek.com/v1",
      "api_key": "$DEEPSEEK_API_KEY",
      "models": [
        {
          "id": "deepseek-chat",
          "name": "Deepseek V3",
          "cost_per_1m_in": 0.27,
          "cost_per_1m_out": 1.1,
          "cost_per_1m_in_cached": 0.07,
          "cost_per_1m_out_cached": 1.1,
          "context_window": 64000,
          "default_max_tokens": 5000
        }
      ]
    }
  }
}
```

#### Anthropic-Compatible APIs

Custom Anthropic-compatible providers follow this format:

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "providers": {
    "custom-anthropic": {
      "type": "anthropic",
      "base_url": "https://api.anthropic.com/v1",
      "api_key": "$ANTHROPIC_API_KEY",
      "extra_headers": {
        "anthropic-version": "2023-06-01"
      },
      "models": [
        {
          "id": "claude-sonnet-4-20250514",
          "name": "Claude Sonnet 4",
          "cost_per_1m_in": 3,
          "cost_per_1m_out": 15,
          "cost_per_1m_in_cached": 3.75,
          "cost_per_1m_out_cached": 0.3,
          "context_window": 200000,
          "default_max_tokens": 50000,
          "can_reason": true,
          "supports_attachments": true
        }
      ]
    }
  }
}
```

### Amazon Bedrock

Sgptcoder currently supports running Anthropic models through Bedrock, with caching disabled.

- A Bedrock provider will appear once you have AWS configured, i.e. `aws configure`
- Sgptcoder also expects the `AWS_REGION` or `AWS_DEFAULT_REGION` to be set
- To use a specific AWS profile set `AWS_PROFILE` in your environment, i.e. `AWS_PROFILE=myprofile sgpt`

### Vertex AI Platform

Vertex AI will appear in the list of available providers when `VERTEXAI_PROJECT` and `VERTEXAI_LOCATION` are set. You will also need to be authenticated:

```bash
gcloud auth application-default login
```

To add specific models to the configuration, configure as such:

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "providers": {
    "vertexai": {
      "models": [
        {
          "id": "claude-sonnet-4@20250514",
          "name": "VertexAI Sonnet 4",
          "cost_per_1m_in": 3,
          "cost_per_1m_out": 15,
          "cost_per_1m_in_cached": 3.75,
          "cost_per_1m_out_cached": 0.3,
          "context_window": 200000,
          "default_max_tokens": 50000,
          "can_reason": true,
          "supports_attachments": true
        }
      ]
    }
  }
}
```

## Logging

Sometimes you need to look at logs. Luckily, Sgptcoder logs all sorts of
stuff. Logs are stored in `./.sgpt/logs/sgpt.log` relative to the project.

The CLI also contains some helper commands to make perusing recent logs easier:

```bash
# Print the last 1000 lines
sgpt logs

# Print the last 500 lines
sgpt logs --tail 500

# Follow logs in real time
sgpt logs --follow
```

Want more logging? Run `sgpt` with the `--debug` flag, or enable it in the
config:

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "options": {
    "debug": true,
    "debug_lsp": true
  }
}
```

## Disabling Provider Auto-Updates

By default, Sgptcoder automatically checks for the latest and greatest list of
providers and models from [Catwalk](https://github.com/charmbracelet/catwalk),
the open source Sgptcoder provider database. This means that when new providers and
models are available, or when model metadata changes, Sgptcoder automatically
updates your local configuration.

For those with restricted internet access, or those who prefer to work in
air-gapped environments, this might not be want you want, and this feature can
be disabled.

To disable automatic provider updates, set `disable_provider_auto_update` into
your `sgpt.json` config:

```json
{
  "$schema": "https://charm.land/sgpt.json",
  "options": {
    "disable_provider_auto_update": true
  }
}
```

Or set the `SGPT_DISABLE_PROVIDER_AUTO_UPDATE` environment variable:

```bash
export SGPT_DISABLE_PROVIDER_AUTO_UPDATE=1
```

### Manually updating providers

Manually updating providers is possible with the `sgpt update-providers`
command:

```bash
# Update providers remotely from Catwalk.
sgpt update-providers

# Update providers from a custom Catwalk base URL.
sgpt update-providers https://example.com/

# Update providers from a local file.
sgpt update-providers /path/to/local-providers.json

# Reset providers to the embedded version, embedded at sgpt at build time.
sgpt update-providers embedded

# For more info:
sgpt update-providers --help
```

## A Note on Claude Max and GitHub Copilot

Sgptcoder only supports model providers through official, compliant APIs. We do not
support or endorse any methods that rely on personal Claude Max and GitHub
Copilot accounts or OAuth workarounds, which violate Anthropic and
Microsoft’s Terms of Service.

We’re committed to building sustainable, trusted integrations with model
providers. If you’re a provider interested in working with us,
[reach out](mailto:vt100@charm.sh).

## Whatcha think?

We’d love to hear your thoughts on this project. Need help? We gotchu. You can find us on:

- [Twitter](https://twitter.com/charmcli)
- [Discord][discord]
- [Slack](https://charm.land/slack)
- [The Fediverse](https://mastodon.social/@charmcli)
- [Bluesky](https://bsky.app/profile/charm.land)

[discord]: https://charm.land/discord

## License

[FSL-1.1-MIT](https://github.com/skorpland/sgptcoder/raw/main/LICENSE.md)

---

Part of [Charm](https://charm.land).

<a href="https://charm.land/"><img alt="The Charm logo" width="400" src="https://stuff.charm.sh/charm-banner-next.jpg" /></a>

<!--prettier-ignore-->
Charm热爱开源 • Charm loves open source
