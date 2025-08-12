/**
 * 文档版本管理组合式函数 - 完全重构版
 * 基于共享基础设施，提供简洁的版本管理功能
 */

import type { VersionInfo } from "./shared/types";
import { DEFAULT_CONFIG } from "./shared/constants";
import {
  createLogger,
  getModuleDefaultVersion,
  getModuleLatestVersion,
  getModuleSupportedVersions,
  isVersionSupportedByModule,
  useSharedPathInfo,
  useVersionPreferencesStorage,
} from "./shared/utils";

/**
 * 版本管理主要组合式函数
 */
export function useDocumentationVersion() {
  const logger = createLogger("useDocumentationVersion");

  // ==================== 使用共享路径解析 ====================

  const { currentLocale, pathInfo } = useSharedPathInfo();
  const versionPreferences = useVersionPreferencesStorage();

  // ==================== 核心计算属性 ====================

  /**
   * 当前模块信息
   */
  const currentModule = computed(
    () => pathInfo.value.module
  );

  /**
   * 当前版本信息
   */
  const currentVersion = computed(
    () => pathInfo.value.version
  );

  /**
   * 是否有模块
   */
  const hasModule = computed(
    () => pathInfo.value.hasModule
  );

  /**
   * 用户偏好版本
   */
  const getUserPreferredVersion = (
    module: string
  ): string => {
    if (!module || !hasModule.value)
      return DEFAULT_CONFIG.version;

    return (
      versionPreferences.value[module] ||
      getModuleDefaultVersion(module)
    );
  };

  /**
   * 获取版本详细信息
   */
  const getVersionInfo = (
    module?: string,
    version?: string
  ): VersionInfo => {
    const targetModule = module || currentModule.value;
    const targetVersion = version || currentVersion.value;

    if (!targetModule) {
      return {
        module: "",
        version: DEFAULT_CONFIG.version,
        isUserPreferred: false,
        isLatest: false,
        isDeprecated: false,
        isSupported: true,
      };
    }

    const userPreferredVersion =
      getUserPreferredVersion(targetModule);
    const latestVersion =
      getModuleLatestVersion(targetModule);
    const isSupported = isVersionSupportedByModule(
      targetModule,
      targetVersion
    );

    return {
      module: targetModule,
      version: targetVersion,
      isUserPreferred:
        targetVersion === userPreferredVersion,
      isLatest: targetVersion === latestVersion,
      isDeprecated: false, // 目前没有废弃版本
      isSupported,
    };
  };

  // ==================== 版本管理操作 ====================

  /**
   * 设置用户偏好版本
   */
  const setUserPreferredVersion = (
    module: string,
    version: string
  ) => {
    if (!isVersionSupportedByModule(module, version)) {
      logger.warn("Attempting to set unsupported version", {
        module,
        version,
        supported: getModuleSupportedVersions(module),
      });
      return false;
    }

    versionPreferences.value = {
      ...versionPreferences.value,
      [module]: version,
    };

    logger.info("User preference updated", {
      module,
      version,
    });

    return true;
  };

  /**
   * 重置用户偏好版本
   */
  const resetUserPreferredVersion = (module: string) => {
    const newPreferences = { ...versionPreferences.value };
    delete newPreferences[module];
    versionPreferences.value = newPreferences;

    logger.info("User preference reset", {
      module,
    });
  };

  /**
   * 清除所有用户偏好
   */
  const clearAllUserPreferences = () => {
    versionPreferences.value = {};
    logger.info("All user preferences cleared");
  };

  // ==================== 路径构建 ====================

  /**
   * 构建带版本的路径
   */
  const buildVersionedPath = (
    basePath: string,
    version?: string
  ): string => {
    const targetVersion = version || currentVersion.value;
    const info = pathInfo.value;

    if (!info.hasModule) {
      return basePath;
    }

    // 如果已经包含版本，替换它
    if (basePath.includes(`/${info.version}/`)) {
      return basePath.replace(
        `/${info.version}/`,
        `/${targetVersion}/`
      );
    }

    // 如果是简化路径，保持简化
    if (info.isSimplified) {
      return basePath; // 保持简化路径
    }

    // 构建完整路径
    const segments = basePath.split("/").filter(Boolean);
    const [lang, module, ...rest] = segments;
    return `/${lang}/${module}/${targetVersion}/${rest.join("/")}`;
  };

  /**
   * 获取版本切换路径
   */
  const getVersionSwitchPath = (
    targetVersion: string
  ): string => {
    return buildVersionedPath(
      pathInfo.value.contentPath,
      targetVersion
    );
  };

  // ==================== 计算属性导出 ====================

  const versionInfo = computed(() => getVersionInfo());
  const supportedVersions = computed(() =>
    hasModule.value
      ? getModuleSupportedVersions(currentModule.value)
      : []
  );
  const isCurrentVersionLatest = computed(
    () => versionInfo.value.isLatest
  );
  const isCurrentVersionPreferred = computed(
    () => versionInfo.value.isUserPreferred
  );

  // ==================== 调试工具 ====================

  const getDebugInfo = () => ({
    currentLocale: currentLocale.value,
    pathInfo: pathInfo.value,
    versionInfo: versionInfo.value,
    userPreferences: versionPreferences.value,
  });

  // ==================== 返回接口 ====================

  return {
    // 状态
    currentModule: readonly(currentModule),
    currentVersion: readonly(currentVersion),
    currentLocale: readonly(currentLocale),
    hasModule: readonly(hasModule),
    versionPreferences: readonly(versionPreferences),

    // 计算属性
    versionInfo: readonly(versionInfo),
    supportedVersions: readonly(supportedVersions),
    isCurrentVersionLatest: readonly(
      isCurrentVersionLatest
    ),
    isCurrentVersionPreferred: readonly(
      isCurrentVersionPreferred
    ),

    // 工具方法
    getVersionInfo,
    getUserPreferredVersion,
    getModuleDefaultVersion,
    getModuleLatestVersion,
    getModuleSupportedVersions,
    isVersionSupported: isVersionSupportedByModule,

    // 版本管理
    setUserPreferredVersion,
    resetUserPreferredVersion,
    clearAllUserPreferences,

    // 路径构建
    buildVersionedPath,
    getVersionSwitchPath,

    // 调试工具
    getDebugInfo,
  };
}

// 重新导出类型
export type {
  UserVersionPreferences,
  VersionInfo,
} from "./shared/types";
