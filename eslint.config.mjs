import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: ["build/**", ".next/**", "node_modules/**", "coverage/**"],
  },
  ...nextVitals,
  {
    rules: {
      "no-unused-expressions": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default config;
