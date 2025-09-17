interface ImportMetaEnv {
  readonly VITE_SGPTCODER_SERVER_HOST: string
  readonly VITE_SGPTCODER_SERVER_PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
