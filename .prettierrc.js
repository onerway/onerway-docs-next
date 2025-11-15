/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5", // 尾随逗号·
  printWidth: 60, // 每行最大字符数，超过会换行
  tabWidth: 2, // 缩进宽度
  endOfLine: "lf", // 行尾换行符
  vueIndentScriptAndStyle: false, // Vue 文件中的 script 和 style 标签缩进
  singleAttributePerLine: true, // 单行属性换行
  htmlWhitespaceSensitivity: "strict", // HTML 空格敏感度
  proseWrap: "always", // 段落换行
  bracketSpacing: true, // 对象括号内加空格 { foo: bar }
  objectWrap: "preserve", // 对象换行
  embeddedLanguageFormatting: "auto", // 嵌入式语言格式化
  bracketSameLine: true, // 多行元素的 > 换行
};

export default config;
