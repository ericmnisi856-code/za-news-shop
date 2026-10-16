// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Detect Netlify build environment. When deploying on Netlify, switch the
// nitro deploy target to the `netlify` preset (Netlify Functions) so the app
// works on Netlify hosting instead of Cloudflare Workers.
const isNetlify = !!process.env.NETLIFY;

export default defineConfig(
  isNetlify
    ? {
        // On Netlify: let nitro use its default TanStack server entry so the
        // Cloudflare-specific Worker wrapper in src/server.ts is not used.
        nitro: {
          preset: "netlify",
        },
      }
    : {
        tanstackStart: {
          // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
          // nitro/vite builds from this. Cloudflare-only.
          server: { entry: "server" },
        },
      },
);
