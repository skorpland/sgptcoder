export namespace Flag {
  export const SGPTCODER_AUTO_SHARE = truthy("SGPTCODER_AUTO_SHARE")
  export const SGPTCODER_CONFIG = process.env["SGPTCODER_CONFIG"]
  export const SGPTCODER_CONFIG_CONTENT = process.env["SGPTCODER_CONFIG_CONTENT"]
  export const SGPTCODER_DISABLE_AUTOUPDATE = truthy("SGPTCODER_DISABLE_AUTOUPDATE")
  export const SGPTCODER_DISABLE_PRUNE = truthy("SGPTCODER_DISABLE_PRUNE")
  export const SGPTCODER_PERMISSION = process.env["SGPTCODER_PERMISSION"]
  export const SGPTCODER_DISABLE_DEFAULT_PLUGINS = truthy("SGPTCODER_DISABLE_DEFAULT_PLUGINS")
  export const SGPTCODER_DISABLE_LSP_DOWNLOAD = truthy("SGPTCODER_DISABLE_LSP_DOWNLOAD")
  export const SGPTCODER_ENABLE_EXPERIMENTAL_MODELS = truthy("SGPTCODER_ENABLE_EXPERIMENTAL_MODELS")
  export const SGPTCODER_DISABLE_AUTOCOMPACT = truthy("SGPTCODER_DISABLE_AUTOCOMPACT")

  // Experimental
  export const SGPTCODER_EXPERIMENTAL_WATCHER = truthy("SGPTCODER_EXPERIMENTAL_WATCHER")

  function truthy(key: string) {
    const value = process.env[key]?.toLowerCase()
    return value === "true" || value === "1"
  }
}
