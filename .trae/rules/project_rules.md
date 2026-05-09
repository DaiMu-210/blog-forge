# Project Rules

## Build Commands
- Frontend TypeScript check: `npm run build` (runs `tsc -b && vite build`)
- Rust backend build: `cargo build` (run from `src-tauri/` directory)
- Dev server: `npm run tauri dev`

## Environment PATH
- Node.js: `C:\nvm4w\nodejs`
- Rust/Cargo: `C:\Users\KJSone\scoop\shims`
- In PowerShell, prepend these to PATH: `$env:Path = "C:\nvm4w\nodejs;C:\Users\KJSone\scoop\shims;" + $env:Path`
