/**
 * Generates perceptually distinct colors using golden ratio hue stepping.
 * Given any index, the resulting hue is maximally far from all previous hues.
 * Two series will never share the same color regardless of how many there are.
 */

const GOLDEN_RATIO_CONJUGATE = 0.618033988749895;

/**
 * Returns an HSL color string for a given index.
 * Saturation and lightness are fixed for readability in both light and dark themes.
 */
export function getChartColor(index: number): string {
  const hue = ((index * GOLDEN_RATIO_CONJUGATE) % 1) * 360;
  return `hsl(${hue.toFixed(1)}, 65%, 55%)`;
}

/**
 * Given a list of items (by any key), returns a stable map of key → color.
 * Stable meaning the same list always produces the same color assignments.
 */
export function buildColorMap(keys: (string | number)[]): Record<string, string> {
  return Object.fromEntries(keys.map((k, i) => [String(k), getChartColor(i)]));
}

