import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"
import dts from "vite-plugin-dts"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),dts({ tsconfigPath: './tsconfig.app.json', exclude: ["./src/TestApp.tsx", "./src/testappentrypoint.tsx"] })],
  build: {
    lib: {
      name: "react-cscarousel",
      entry: ["src/index.tsx"],
    },
    rollupOptions: {
      external: ["react", "react-dom","react/jsx-runtime", "react-cslib", "@sidfishus/cslib"],
      output: {
        assetFileNames: "styles.css",
        globals: {
          react: "react",
          "react-dom": "react-dom",
          "react/jsx-runtime": "jsxRuntime",
          "react-cslib": "reactCsLib",
          "@sidfishus/cslib": "csLib"
        },
      },
    },
    sourcemap: true,
  },
})
