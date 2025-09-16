/**
 * Glossary Composable - 术语解释管理
 *
 * 支持：
 * - 多语言术语加载
 * - 自动术语识别
 * - 术语定义缓存
 * - Markdown 语法解析 (*term*)
 */

export interface GlossaryTerm {
  /** 术语名称 */
  term: string;
  /** 术语定义/解释 */
  definition: string;
  /** 分类标签 */
  tags?: string;
  category?: string;
}

export interface GlossaryData {
  [key: string]: GlossaryTerm;
}

export const useGlossary = () => {
  const { locale } = useI18n();

  // 术语数据缓存
  const glossaryData = ref<GlossaryData>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * 加载指定语言的术语数据
   */
  const loadGlossary = async (
    lang: string = locale.value
  ) => {
    try {
      isLoading.value = true;
      error.value = null;

      // 从 public/glossary/ 加载对应语言的术语文件
      const response = await $fetch<GlossaryData>(
        `/glossary/${lang}.json`
      );
      glossaryData.value = response || {};
    } catch (err) {
      error.value = `Failed to load glossary for language: ${lang}`;
      console.warn("Glossary loading failed:", err);
      glossaryData.value = {};
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 获取术语定义
   */
  const getTerm = (key: string): GlossaryTerm | null => {
    const normalizedKey = key.toLowerCase().trim();
    return glossaryData.value[normalizedKey] || null;
  };

  /**
   * 检查术语是否存在
   */
  const hasTerm = (key: string): boolean => {
    return !!getTerm(key);
  };

  /**
   * 解析文本中的术语标记
   * 支持 *term* 语法，转换为术语对象
   */
  const parseTermsInText = (
    text: string
  ): Array<{
    type: "text" | "term";
    content: string;
    term?: GlossaryTerm;
  }> => {
    if (!text) return [];

    const parts: Array<{
      type: "text" | "term";
      content: string;
      term?: GlossaryTerm;
    }> = [];

    // 匹配 *term* 格式的术语
    const termRegex = /\*([^*]+)\*/g;
    let lastIndex = 0;
    let match = termRegex.exec(text);

    while (match !== null) {
      // 添加术语前的普通文本
      if (match.index > lastIndex) {
        const textContent = text.slice(
          lastIndex,
          match.index
        );
        if (textContent) {
          parts.push({
            type: "text",
            content: textContent,
          });
        }
      }

      // 处理术语
      const termKey = match[1];
      if (termKey) {
        const termData = getTerm(termKey);

        if (termData) {
          parts.push({
            type: "term",
            content: termKey,
            term: termData,
          });
        } else {
          // 如果没有找到术语定义，作为普通文本处理
          parts.push({
            type: "text",
            content: match[0], // 保留原始的 *text* 格式
          });
        }
      }

      lastIndex = termRegex.lastIndex;
      match = termRegex.exec(text);
    }

    // 添加剩余的普通文本
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex);
      if (remaining) {
        parts.push({
          type: "text",
          content: remaining,
        });
      }
    }

    return parts;
  };

  /**
   * 获取所有术语列表（用于搜索、自动完成等）
   */
  const getAllTerms = computed(() => {
    return Object.entries(glossaryData.value).map(
      ([key, term]) => ({
        key,
        ...term,
      })
    );
  });

  /**
   * 按分类获取术语
   */
  const getTermsByCategory = (
    category: string
  ): Array<{ key: string; term: GlossaryTerm }> => {
    return Object.entries(glossaryData.value)
      .filter(
        ([, term]) =>
          term.tags === category ||
          term.category === category
      )
      .map(([key, term]) => ({ key, term }));
  };

  /**
   * 搜索术语（按名称或定义搜索）
   */
  const searchTerms = (
    query: string
  ): Array<{ key: string; term: GlossaryTerm }> => {
    if (!query.trim()) return [];

    const lowercaseQuery = query.toLowerCase();

    return Object.entries(glossaryData.value)
      .filter(
        ([key, term]) =>
          key.toLowerCase().includes(lowercaseQuery) ||
          term.term
            .toLowerCase()
            .includes(lowercaseQuery) ||
          term.definition
            .toLowerCase()
            .includes(lowercaseQuery)
      )
      .map(([key, term]) => ({ key, term }));
  };

  // 语言切换时自动重新加载
  watch(locale, (newLocale) => {
    if (newLocale) {
      loadGlossary(newLocale);
    }
  });

  // 首次加载
  onMounted(() => {
    loadGlossary(locale.value || "en");
  });

  return {
    // 状态
    glossaryData: readonly(glossaryData),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // 操作方法
    loadGlossary,
    getTerm,
    hasTerm,
    parseTermsInText,
    getAllTerms,
    getTermsByCategory,
    searchTerms,
  };
};
