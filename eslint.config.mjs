// @ts-check
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt({
  rules: {
    // TypeScript 项目中，可选 props（?）的隐式默认值是 undefined
    // 不需要强制设置显式默认值
    "vue/require-default-prop": "off",
  },
});
