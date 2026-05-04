import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      },
      globals: {
        Boolean: "readonly",
        CustomEvent: "readonly",
        Date: "readonly",
        document: "readonly",
        FormData: "readonly",
        Intl: "readonly",
        JSON: "readonly",
        Number: "readonly",
        Object: "readonly",
        Set: "readonly",
        Array: "readonly",
        localStorage: "readonly",
        window: "readonly"
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off"
    },
    settings: {
      react: { version: "detect" }
    }
  }
];
