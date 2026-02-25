import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";

/**
 * During Vitest runs, replace every *.svg import with a simple string stub so
 * jsdom never attempts to load binary assets.
 */
function svgStub(): Plugin {
  return {
    name: "vitest-svg-stub",
    enforce: "pre",
    transform(_code, id) {
      if (process.env.VITEST && id.endsWith(".svg")) {
        return 'export default "stub.svg"';
      }
    },
  };
}

export default defineConfig({
  plugins: [sveltekit(), svgStub()],
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    environment: "jsdom",
    setupFiles: ["src/tests/setup.ts"],
    globals: true,
  },
});
