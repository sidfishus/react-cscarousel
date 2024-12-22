import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"
//import typescript from "rollup-plugin-typescript2"
import dts from "vite-plugin-dts"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),dts({ tsconfigPath: './tsconfig.app.json' })],
  build: {
    lib: {
      name: "react-cscarousel",
      entry: ["src/carousel/index.tsx"],
    },
    rollupOptions: {
      external: ["react", "react-dom","react/jsx-runtime"],
      output: {
        globals: {
          react: "react",
          "react-dom": "react-dom",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
    sourcemap: true,
  },
})
