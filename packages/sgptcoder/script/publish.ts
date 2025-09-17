#!/usr/bin/env bun
const dir = new URL("..", import.meta.url).pathname
process.chdir(dir)
import { $ } from "bun"

import pkg from "../package.json"

const dry = process.env["SGPTCODER_DRY"] === "true"
const version = process.env["SGPTCODER_VERSION"]!
const snapshot = process.env["SGPTCODER_SNAPSHOT"] === "true"

console.log(`publishing ${version}`)

const GOARCH: Record<string, string> = {
  arm64: "arm64",
  x64: "amd64",
  "x64-baseline": "amd64",
}

const targets = [
  ["windows", "x64"],
  ["linux", "arm64"],
  ["linux", "x64"],
  ["linux", "x64-baseline"],
  ["darwin", "x64"],
  ["darwin", "x64-baseline"],
  ["darwin", "arm64"],
]

await $`rm -rf dist`

const optionalDependencies: Record<string, string> = {}
const npmTag = snapshot ? "snapshot" : "latest"
for (const [os, arch] of targets) {
  console.log(`building ${os}-${arch}`)
  const name = `${pkg.name}-${os}-${arch}`
  await $`mkdir -p dist/${name}/bin`
  await $`CGO_ENABLED=0 GOOS=${os} GOARCH=${GOARCH[arch]} go build -ldflags="-s -w -X main.Version=${version}" -o ../sgptcoder/dist/${name}/bin/tui ../tui/cmd/sgptcoder/main.go`.cwd(
    "../tui",
  )
  await Bun.build({
    compile: {
      target: `bun-${os}-${arch}` as any,
      outfile: `dist/${name}/bin/sgptcoder`,
      execArgv: [`--user-agent=sgptcoder/${version}`, `--env-file=""`, `--`],
      windows: {},
    },
    entrypoints: ["./src/index.ts"],
    define: {
      SGPTCODER_VERSION: `'${version}'`,
      SGPTCODER_TUI_PATH: `'../../../dist/${name}/bin/tui'`,
    },
  })
  // await $`bun build --define SGPTCODER_TUI_PATH="'../../../dist/${name}/bin/tui'" --define SGPTCODER_VERSION="'${version}'" --compile --target=bun-${os}-${arch} --outfile=dist/${name}/bin/sgptcoder ./src/index.ts`
  // Run the binary only if it matches current OS/arch
  if (
    process.platform === (os === "windows" ? "win32" : os) &&
    (process.arch === arch || (process.arch === "x64" && arch === "x64-baseline"))
  ) {
    console.log(`smoke test: running dist/${name}/bin/sgptcoder --version`)
    await $`./dist/${name}/bin/sgptcoder --version`
  }
  await $`rm -rf ./dist/${name}/bin/tui`
  await Bun.file(`dist/${name}/package.json`).write(
    JSON.stringify(
      {
        name,
        version,
        os: [os === "windows" ? "win32" : os],
        cpu: [arch],
      },
      null,
      2,
    ),
  )
  if (!dry) await $`cd dist/${name} && chmod 777 -R . && bun publish --access public --tag ${npmTag}`
  optionalDependencies[name] = version
}

await $`mkdir -p ./dist/${pkg.name}`
await $`cp -r ./bin ./dist/${pkg.name}/bin`
await $`cp ./script/preinstall.mjs ./dist/${pkg.name}/preinstall.mjs`
await $`cp ./script/postinstall.mjs ./dist/${pkg.name}/postinstall.mjs`
await Bun.file(`./dist/${pkg.name}/package.json`).write(
  JSON.stringify(
    {
      name: pkg.name + "-ai",
      bin: {
        [pkg.name]: `./bin/${pkg.name}`,
      },
      scripts: {
        preinstall: "node ./preinstall.mjs",
        postinstall: "node ./postinstall.mjs",
      },
      version,
      optionalDependencies,
    },
    null,
    2,
  ),
)
if (!dry) await $`cd ./dist/${pkg.name} && bun publish --access public --tag ${npmTag}`

if (!snapshot) {
  for (const key of Object.keys(optionalDependencies)) {
    await $`cd dist/${key}/bin && zip -r ../../${key}.zip *`
  }

  // Calculate SHA values
  const arm64Sha = await $`sha256sum ./dist/sgptcoder-linux-arm64.zip | cut -d' ' -f1`.text().then((x) => x.trim())
  const x64Sha = await $`sha256sum ./dist/sgptcoder-linux-x64.zip | cut -d' ' -f1`.text().then((x) => x.trim())
  const macX64Sha = await $`sha256sum ./dist/sgptcoder-darwin-x64.zip | cut -d' ' -f1`.text().then((x) => x.trim())
  const macArm64Sha = await $`sha256sum ./dist/sgptcoder-darwin-arm64.zip | cut -d' ' -f1`.text().then((x) => x.trim())

  const binaryPkgbuild = [
    "# Maintainer: dax",
    "# Maintainer: adam",
    "",
    "pkgname='sgptcoder-bin'",
    `pkgver=${version.split("-")[0]}`,
    "options=('!debug' '!strip')",
    "pkgrel=1",
    "pkgdesc='The AI coding agent built for the terminal.'",
    "url='https://github.com/skorpland/sgptcoder'",
    "arch=('aarch64' 'x86_64')",
    "license=('MIT')",
    "provides=('sgptcoder')",
    "conflicts=('sgptcoder')",
    "depends=('fzf' 'ripgrep')",
    "",
    `source_aarch64=("\${pkgname}_\${pkgver}_aarch64.zip::https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-linux-arm64.zip")`,
    `sha256sums_aarch64=('${arm64Sha}')`,
    "",
    `source_x86_64=("\${pkgname}_\${pkgver}_x86_64.zip::https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-linux-x64.zip")`,
    `sha256sums_x86_64=('${x64Sha}')`,
    "",
    "package() {",
    '  install -Dm755 ./sgptcoder "${pkgdir}/usr/bin/sgptcoder"',
    "}",
    "",
  ].join("\n")

  // Source-based PKGBUILD for sgptcoder
  const sourcePkgbuild = [
    "# Maintainer: dax",
    "# Maintainer: adam",
    "",
    "pkgname='sgptcoder'",
    `pkgver=${version.split("-")[0]}`,
    "options=('!debug' '!strip')",
    "pkgrel=1",
    "pkgdesc='The AI coding agent built for the terminal.'",
    "url='https://github.com/skorpland/sgptcoder'",
    "arch=('aarch64' 'x86_64')",
    "license=('MIT')",
    "provides=('sgptcoder')",
    "conflicts=('sgptcoder-bin')",
    "depends=('fzf' 'ripgrep')",
    "makedepends=('git' 'bun-bin' 'go')",
    "",
    `source=("sgptcoder-\${pkgver}.tar.gz::https://github.com/skorpland/sgptcoder/archive/v${version}.tar.gz")`,
    `sha256sums=('SKIP')`,
    "",
    "build() {",
    `  cd "sgptcoder-\${pkgver}"`,
    `  bun install`,
    "  cd packages/tui",
    `  CGO_ENABLED=0 go build -ldflags="-s -w -X main.Version=\${pkgver}" -o tui cmd/sgptcoder/main.go`,
    "  cd ../sgptcoder",
    `  bun build --define SGPTCODER_TUI_PATH="'$(realpath ../tui/tui)'" --define SGPTCODER_VERSION="'\${pkgver}'" --compile --target=bun-linux-x64 --outfile=sgptcoder ./src/index.ts`,
    "}",
    "",
    "package() {",
    `  cd "sgptcoder-\${pkgver}/packages/sgptcoder"`,
    '  install -Dm755 ./sgptcoder "${pkgdir}/usr/bin/sgptcoder"',
    "}",
    "",
  ].join("\n")

  for (const [pkg, pkgbuild] of [
    ["sgptcoder-bin", binaryPkgbuild],
    ["sgptcoder", sourcePkgbuild],
  ]) {
    await $`rm -rf ./dist/aur-${pkg}`
    while (true) {
      try {
        await $`git clone ssh://aur@aur.archlinux.org/${pkg}.git ./dist/aur-${pkg}`
        break
      } catch (e) {
        continue
      }
    }
    await $`cd ./dist/aur-${pkg} && git checkout master`
    await Bun.file(`./dist/aur-${pkg}/PKGBUILD`).write(pkgbuild)
    await $`cd ./dist/aur-${pkg} && makepkg --printsrcinfo > .SRCINFO`
    await $`cd ./dist/aur-${pkg} && git add PKGBUILD .SRCINFO`
    await $`cd ./dist/aur-${pkg} && git commit -m "Update to v${version}"`
    if (!dry) await $`cd ./dist/aur-${pkg} && git push`
  }

  // Homebrew formula
  const homebrewFormula = [
    "# typed: false",
    "# frozen_string_literal: true",
    "",
    "# This file was generated by GoReleaser. DO NOT EDIT.",
    "class Sgptcoder < Formula",
    `  desc "The AI coding agent built for the terminal."`,
    `  homepage "https://github.com/skorpland/sgptcoder"`,
    `  version "${version.split("-")[0]}"`,
    "",
    "  on_macos do",
    "    if Hardware::CPU.intel?",
    `      url "https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-darwin-x64.zip"`,
    `      sha256 "${macX64Sha}"`,
    "",
    "      def install",
    '        bin.install "sgptcoder"',
    "      end",
    "    end",
    "    if Hardware::CPU.arm?",
    `      url "https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-darwin-arm64.zip"`,
    `      sha256 "${macArm64Sha}"`,
    "",
    "      def install",
    '        bin.install "sgptcoder"',
    "      end",
    "    end",
    "  end",
    "",
    "  on_linux do",
    "    if Hardware::CPU.intel? and Hardware::CPU.is_64_bit?",
    `      url "https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-linux-x64.zip"`,
    `      sha256 "${x64Sha}"`,
    "      def install",
    '        bin.install "sgptcoder"',
    "      end",
    "    end",
    "    if Hardware::CPU.arm? and Hardware::CPU.is_64_bit?",
    `      url "https://github.com/skorpland/sgptcoder/releases/download/v${version}/sgptcoder-linux-arm64.zip"`,
    `      sha256 "${arm64Sha}"`,
    "      def install",
    '        bin.install "sgptcoder"',
    "      end",
    "    end",
    "  end",
    "end",
    "",
    "",
  ].join("\n")

  await $`rm -rf ./dist/homebrew-tap`
  await $`git clone https://${process.env["GITHUB_TOKEN"]}@github.com/skorpland/homebrew-tap.git ./dist/homebrew-tap`
  await Bun.file("./dist/homebrew-tap/sgptcoder.rb").write(homebrewFormula)
  await $`cd ./dist/homebrew-tap && git add sgptcoder.rb`
  await $`cd ./dist/homebrew-tap && git commit -m "Update to v${version}"`
  if (!dry) await $`cd ./dist/homebrew-tap && git push`
}
