/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LAMBDA_URL: string;
  // add other VITE_ vars here if you have them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
