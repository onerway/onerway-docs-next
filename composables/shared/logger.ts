import type { DebugInfo } from "./types";
import { createEventHook } from "@vueuse/core";
import { DEBUG_CONFIG } from "./constants";

export function createLogger(prefix: string) {
  const fullPrefix = `[${DEBUG_CONFIG.logPrefix}${prefix}]`;

  const onLog = createEventHook<{
    level: string;
    message: string;
    args: unknown[];
  }>();

  const logger = {
    info: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.log(`${fullPrefix} ${message} - `, ...args);
        onLog.trigger({ level: "info", message, args });
      }
    },
    warn: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.warn(
          `${fullPrefix} ${message} - `,
          ...args
        );
        onLog.trigger({ level: "warn", message, args });
      }
    },
    error: (message: string, ...args: unknown[]) => {
      if (DEBUG_CONFIG.enabled) {
        console.error(
          `${fullPrefix} ${message} - `,
          ...args
        );
        onLog.trigger({ level: "error", message, args });
      }
    },
    debug: (message: string, data?: DebugInfo) => {
      if (
        DEBUG_CONFIG.enabled &&
        DEBUG_CONFIG.logLevel === "info"
      ) {
        console.log(`${fullPrefix} ${message} - `, data);
        onLog.trigger({
          level: "debug",
          message,
          args: [data],
        });
      }
    },
    onLog: onLog.on,
  };

  return logger;
}
