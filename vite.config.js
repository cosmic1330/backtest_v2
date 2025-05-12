import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), reactRefresh()],
  test: {
    global: true,
    environment: "jsdom",
  },
  root: 'example',
});
