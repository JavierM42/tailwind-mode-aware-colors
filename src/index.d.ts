import type { Config } from "tailwindcss";

type Options = {
  /** @default "light" */
  lightId: string;
  /** @default "dark" */
  darkId: string;
};

/**
 * Adds dynamic colors to TailwindCSS with light and dark shades that are shown based on the user's color scheme.
 *
 * With this plugin, `bg-primary` can be used instead of `bg-primary-light dark:bg-primary-dark`.
 *
 * @example
 * ```
 * module.exports = require('tailwind-mode-aware-colors')({
 *   // your usual config
 *   theme: {
 *     colors: {
 *       primary: {
 *         // colors defined with light and dark keys will be dynamic
 *         light: '#bbffa3',
 *         dark: '#144b00'
 *       }
 *       ...
 *     }
 *   }
 *   ...
 * });
 * ```
 */
export default function withModeAwareColors(config: Config, options: Options): Config;
