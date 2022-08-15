import {
  Percentage,
  RgbColor,
  HslColor,
  RgbaColor,
  NormalizedRgbColor,
  RybColor,
} from '../types';

export function lighten(color: RgbColor, percentage: Percentage): RgbColor {
  const hsl = rgbToHsl(color);
  hsl[2] += (percentage / 100) * 50;
  return hslToRgb(hsl);
}

export function darken(color: RgbColor, percentage: Percentage) {
  const hsl = rgbToHsl(color);
  hsl[2] -= (percentage / 100) * 50;
  return hslToRgb(hsl);
}

export function mergeRgb(rgb: RgbColor): number {
  const [r, g, b] = rgb;
  let res = r;
  res = (res << 8) + g;
  res = (res << 8) + b;
  return res;
}

export function splitRgb(rgb: number): RgbColor {
  const r = (rgb & 0x00ff0000) >> 16;
  const g = (rgb & 0x0000ff00) >> 8;
  const b = rgb & 0x000000ff;
  return [r, g, b];
}

export function normalizeRgb(rgb: RgbColor): RgbColor {
  return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255];
}

export function normalizeRgba(rgba: RgbaColor): RgbaColor {
  return [rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3] / 255];
}

export function rgbToRyb(rgb: RgbColor): RybColor {
  const [r, g, b] = rgb;
  const Iw = Math.min(r, g, b);
  const Ib = Math.min(255 - r, 255 - g, 255 - b);
  const rRGB = r - Iw;
  const gRGB = g - Iw;
  const bRGB = b - Iw;
  const minRG = Math.min(rRGB, gRGB);
  const rRYB = rRGB - minRG;
  const yRYB = (gRGB + minRG) / 2;
  const bRYB = (bRGB + gRGB - minRG) / 2;
  const n = Math.max(rRYB, yRYB, bRYB, 1) / Math.max(rRGB, gRGB, bRGB, 1);
  return [rRYB / n + Ib, yRYB / n + Ib, bRYB / n + Ib];
}

export function rybToRgb(ryb: RybColor): RgbColor {
  const [r, y, b] = ryb;
  const Iw = Math.min(r, y, b);
  const Ib = Math.min(255 - r, 255 - y, 255 - b);
  const rRYB = r - Iw;
  const yRYB = y - Iw;
  const bRYB = b - Iw;
  const minYB = Math.min(yRYB, bRYB);
  const rRGB = rRYB + yRYB - minYB;
  const gRGB = yRYB + 2 * minYB;
  const bRGB = 2 * (bRYB - minYB);
  const n = Math.max(rRGB, gRGB, bRGB, 1) / Math.max(rRYB, yRYB, bRYB, 1);
  return [rRGB / n + Ib, gRGB / n + Ib, bRGB / n + Ib];
}

export function mixRyb(a: RybColor, b: RybColor): RybColor {
  return [
    Math.min(255, a[0] + b[0]),
    Math.min(255, a[1] + b[1]),
    Math.min(255, a[2] + b[2]),
  ];
}

//FROM: https://css-tricks.com/converting-color-spaces-in-javascript/
export function hslToRgb(hsl: HslColor): RgbColor {
  const h = hsl[0];
  let s = hsl[1];
  let l = hsl[2];
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);
  return [r, g, b];
}

//FROM: https://css-tricks.com/converting-color-spaces-in-javascript/
export function rgbToHsl(rgb: RgbColor): HslColor {
  let [r, g, b] = rgb;
  // Make r, g, and b fractions of 1
  r /= 255;
  g /= 255;
  b /= 255;

  // Find greatest and smallest channel values
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;

  // Calculate hue
  // No difference
  if (delta == 0) h = 0;
  // Red is max
  else if (cmax == r) h = ((g - b) / delta) % 6;
  // Green is max
  else if (cmax == g) h = (b - r) / delta + 2;
  // Blue is max
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  // Make negative hues positive behind 360°
  if (h < 0) h += 360;

  // Calculate lightness
  l = (cmax + cmin) / 2;

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
}

export function rgbaString(color: RgbaColor): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
}

export function rgbString(color: RgbColor): string {
  return rgbaString([...color, 1]);
}

export function rgbToRgbaString(color: RgbColor, alpha: number) {
  return rgbaString([...color, alpha]);
}

export function hexToRgb(hex: string): RgbColor {
  let c: string[];
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    const c2 = Number('0x' + c.join(''));
    return [(c2 >> 16) & 255, (c2 >> 8) & 255, c2 & 255];
  }
  throw new Error('Bad Hex');
}

export function hexToNormalizedRgb(hex: string): NormalizedRgbColor {
  return normalizeRgb(hexToRgb(hex));
}
