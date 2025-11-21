import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable missing dependency warning for hooks
      "react-hooks/exhaustive-deps": "off",

      // Disable "any" usage restriction
      "@typescript-eslint/no-explicit-any": "off",

      // Allow empty interfaces
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",

      // Allow unused variables (use with caution!)
      "@typescript-eslint/no-unused-vars": "warn",

      // Disable prefer-const for intentional let usage
      "prefer-const": "warn",
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
    ],
  },
];

export default eslintConfig;
