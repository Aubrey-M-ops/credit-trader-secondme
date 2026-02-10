import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Ignore Prisma generated files
    "src/generated/**",
    "**/node_modules/**",
  ]),
  // Custom rules
  {
    rules: {
      // Disable rules that conflict with generated code
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "off",
      // Disable Next.js image optimization warning (can be re-enabled later)
      "@next/next/no-img-element": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
]);

export default eslintConfig;
