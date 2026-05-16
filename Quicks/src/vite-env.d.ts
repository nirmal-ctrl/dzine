/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_IS_NOT_API_ACCESS: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
