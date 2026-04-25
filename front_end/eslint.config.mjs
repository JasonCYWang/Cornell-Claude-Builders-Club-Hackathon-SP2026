import next from "eslint-config-next"

const config = [
  ...next,
  {
    ignores: [".next/**", "node_modules/**"],
    rules: {
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]

export default config

