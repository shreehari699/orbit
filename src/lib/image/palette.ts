export interface Swatch {
  hex: string;
  count: number;
  percent: number;
}

function toHex(n: number): string {
  return n.toString(16).padStart(2, "0");
}

/**
 * A real, deterministic dominant-color extractor: quantizes each channel
 * to reduce noise, builds a frequency histogram over the actual pixel
 * data, and returns the most common buckets. Not a neural palette model —
 * an honest, fast approximation that runs entirely client-side.
 */
export function extractPalette(image: HTMLImageElement, count = 6): Swatch[] {
  const canvas = document.createElement("canvas");
  const maxDim = 200; // downsample for speed — doesn't change the dominant colors
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();
  const STEP = 24; // quantization bucket size per channel

  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]!;
    if (alpha < 128) continue; // skip mostly-transparent pixels
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    const key = `${Math.round(r / STEP)}-${Math.round(g / STEP)}-${Math.round(b / STEP)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
    total += 1;
  }

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((bucket) => ({
      hex: `#${toHex(Math.round(bucket.r / bucket.count))}${toHex(Math.round(bucket.g / bucket.count))}${toHex(Math.round(bucket.b / bucket.count))}`,
      count: bucket.count,
      percent: total ? Math.round((bucket.count / total) * 100) : 0,
    }));
}
