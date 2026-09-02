import { defineConfig } from "vite";
import path from "path";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // ============================================================
        // 修复 Dart Sass 双废弃 warning：
        // 1. legacy-js-api    → 设置 api: 'modern-compiler'（sass 1.77+）
        // 2. @import 语句弃用  → 改为 @use "...tokens.scss" as *（Sass 3.0 将删 @import）
        // 注：@use 默认 namespace，这里 as * 以保持原代码中 $red / @include num 写法不变
        // ============================================================
        api: "modern-compiler",
        additionalData: `@use "${path
          .resolve(__dirname, "src/styles/tokens.scss")
          .replace(/\\/g, "/")}" as *;`,
      },
    },
  },
});
