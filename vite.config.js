import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `vite dev` we proxy /api to a local express-less handler is not
// available, so dev uses the deployed function or `vercel dev`. For local
// preview without Vercel, the app falls back to fetching the sources
// directly is blocked by CORS, hence prefer `vercel dev`.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
