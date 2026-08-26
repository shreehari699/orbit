/**
 * The tool registry — the single source of truth for every utility ORBIT
 * ships. Command Center, ORBIT Search, the sidebar, and favorites/history
 * all read from this list rather than hardcoding tool metadata, so a new
 * tool is added in exactly one place.
 */

export type ToolCategory = "text" | "convert" | "data" | "document" | "image" | "file" | "ai";

export interface ToolDef {
  id: string;
  label: string;
  description: string;
  href: string;
  category: ToolCategory;
  icon: string; // lucide-react icon name
  keywords: string[];
  /** Set when a tool's core function depends on a provider that isn't always configured (e.g. an AI model). Never set for a tool that's simply unfinished. */
  requiresProvider?: "ai";
}

export const TOOL_CATEGORIES: { id: ToolCategory; label: string }[] = [
  { id: "text", label: "Text" },
  { id: "ai", label: "AI Writing" },
  { id: "convert", label: "Calculators & Converters" },
  { id: "data", label: "Data" },
  { id: "image", label: "Image" },
  { id: "document", label: "Document" },
  { id: "file", label: "File" },
];

export const TOOLS: ToolDef[] = [
  // --- Text ---------------------------------------------------------------
  {
    id: "word-counter",
    label: "Word & Character Counter",
    description: "Live word, character, sentence, and reading-time stats as you type.",
    href: "/tools/word-counter",
    category: "text",
    icon: "Type",
    keywords: ["words", "characters", "count", "reading time", "letters"],
  },
  {
    id: "text-case",
    label: "Text Case Converter",
    description: "Switch between UPPER, lower, Title, Sentence, camelCase, and snake_case.",
    href: "/tools/text-case",
    category: "text",
    icon: "CaseSensitive",
    keywords: ["uppercase", "lowercase", "title case", "camelcase", "snake_case", "case"],
  },
  {
    id: "markdown-converter",
    label: "Markdown Converter",
    description: "Render Markdown to clean, copyable HTML with a live preview.",
    href: "/tools/markdown-converter",
    category: "text",
    icon: "FileText",
    keywords: ["markdown", "html", "convert", "render", "md"],
  },

  // --- AI Writing (requires a configured AI provider) ----------------------
  {
    id: "grammar-checker",
    label: "Grammar Checker",
    description: "Find and fix grammar, spelling, and punctuation issues.",
    href: "/tools/grammar-checker",
    category: "ai",
    icon: "SpellCheck",
    keywords: ["grammar", "spelling", "proofread", "correct"],
    requiresProvider: "ai",
  },
  {
    id: "text-rewriter",
    label: "Text Rewriter",
    description: "Rewrite a passage while preserving its meaning.",
    href: "/tools/text-rewriter",
    category: "ai",
    icon: "Wand2",
    keywords: ["rewrite", "rephrase", "improve"],
    requiresProvider: "ai",
  },
  {
    id: "text-summarizer",
    label: "Text Summarizer",
    description: "Condense long text into a short summary or bullet points.",
    href: "/tools/text-summarizer",
    category: "ai",
    icon: "ListTree",
    keywords: ["summarize", "summary", "tldr", "condense"],
    requiresProvider: "ai",
  },
  {
    id: "paraphraser",
    label: "Paraphraser",
    description: "Restate a sentence or paragraph in different words.",
    href: "/tools/paraphraser",
    category: "ai",
    icon: "Repeat2",
    keywords: ["paraphrase", "reword", "rewrite"],
    requiresProvider: "ai",
  },
  {
    id: "tone-changer",
    label: "Tone Changer",
    description: "Rewrite text in a different tone — formal, friendly, confident, and more.",
    href: "/tools/tone-changer",
    category: "ai",
    icon: "AudioLines",
    keywords: ["tone", "formal", "casual", "voice"],
    requiresProvider: "ai",
  },
  {
    id: "email-writer",
    label: "Email Writer",
    description: "Draft a complete email from a short description of what you need to say.",
    href: "/tools/email-writer",
    category: "ai",
    icon: "Mail",
    keywords: ["email", "draft", "write", "compose"],
    requiresProvider: "ai",
  },

  // --- Calculators & Converters --------------------------------------------
  {
    id: "unit-converter",
    label: "Unit Converter",
    description: "Convert length, mass, volume, speed, digital storage, and temperature.",
    href: "/tools/unit-converter",
    category: "convert",
    icon: "ArrowLeftRight",
    keywords: ["convert", "units", "km", "miles", "kg", "lb", "celsius", "fahrenheit", "data storage"],
  },
  {
    id: "percentage-calculator",
    label: "Percentage Calculator",
    description: "What is X% of Y, what percent is X of Y, and percentage change.",
    href: "/tools/percentage-calculator",
    category: "convert",
    icon: "Percent",
    keywords: ["percent", "percentage", "of", "change", "increase", "decrease"],
  },
  {
    id: "date-calculator",
    label: "Date Calculator",
    description: "Days between two dates, or add/subtract days from a date.",
    href: "/tools/date-calculator",
    category: "convert",
    icon: "CalendarRange",
    keywords: ["date", "days between", "add days", "duration"],
  },
  {
    id: "age-calculator",
    label: "Age Calculator",
    description: "Exact age in years, months, and days from a birth date.",
    href: "/tools/age-calculator",
    category: "convert",
    icon: "Cake",
    keywords: ["age", "birthday", "years old"],
  },

  // --- Data -----------------------------------------------------------------
  {
    id: "json-formatter",
    label: "JSON Formatter",
    description: "Format, minify, and validate JSON with inline error location.",
    href: "/tools/json-formatter",
    category: "data",
    icon: "Braces",
    keywords: ["json", "format", "pretty print", "minify", "validate"],
  },
  {
    id: "csv-json",
    label: "CSV ⇄ JSON",
    description: "Convert between CSV and JSON in either direction.",
    href: "/tools/csv-json",
    category: "data",
    icon: "Table",
    keywords: ["csv", "json", "convert", "spreadsheet"],
  },
  {
    id: "base64",
    label: "Base64 Encoder / Decoder",
    description: "Encode text to Base64 or decode Base64 back to text.",
    href: "/tools/base64",
    category: "data",
    icon: "Binary",
    keywords: ["base64", "encode", "decode"],
  },
  {
    id: "password-generator",
    label: "Password Generator",
    description: "Generate strong random passwords with configurable rules, using the browser's CSPRNG.",
    href: "/tools/password-generator",
    category: "data",
    icon: "KeyRound",
    keywords: ["password", "generate", "random", "secure"],
  },
  {
    id: "qr-generator",
    label: "QR Code Generator",
    description: "Turn any text or URL into a downloadable QR code.",
    href: "/tools/qr-generator",
    category: "data",
    icon: "QrCode",
    keywords: ["qr", "qr code", "barcode"],
  },

  // --- Image (Canvas-based, entirely client-side) ---------------------------
  {
    id: "image-compressor",
    label: "Image Compressor",
    description: "Shrink a JPEG, PNG, or WebP file size with an adjustable quality slider.",
    href: "/tools/image-compressor",
    category: "image",
    icon: "ImageDown",
    keywords: ["compress", "image", "shrink", "optimize"],
  },
  {
    id: "image-resizer",
    label: "Image Resizer",
    description: "Resize an image to exact dimensions or a percentage, with aspect-ratio lock.",
    href: "/tools/image-resizer",
    category: "image",
    icon: "Expand",
    keywords: ["resize", "image", "dimensions", "scale"],
  },
  {
    id: "image-converter",
    label: "Image Converter",
    description: "Convert between JPEG, PNG, and WebP.",
    href: "/tools/image-converter",
    category: "image",
    icon: "RefreshCw",
    keywords: ["convert", "image", "jpeg", "png", "webp"],
  },
  {
    id: "image-cropper",
    label: "Image Cropper",
    description: "Crop an image to a precise rectangle before exporting.",
    href: "/tools/image-cropper",
    category: "image",
    icon: "Crop",
    keywords: ["crop", "image", "trim"],
  },
  {
    id: "image-rotator",
    label: "Image Rotator",
    description: "Rotate or flip an image, then export the result.",
    href: "/tools/image-rotator",
    category: "image",
    icon: "RotateCw",
    keywords: ["rotate", "flip", "image"],
  },
  {
    id: "color-extractor",
    label: "Color Extractor",
    description: "Pull a dominant color palette out of an image.",
    href: "/tools/color-extractor",
    category: "image",
    icon: "Palette",
    keywords: ["color", "palette", "extract", "hex"],
  },
  {
    id: "image-to-text",
    label: "Image → Text (OCR)",
    description: "Extract text from a photo or screenshot, entirely in your browser.",
    href: "/tools/image-to-text",
    category: "image",
    icon: "ScanText",
    keywords: ["ocr", "image to text", "screenshot", "extract text"],
  },

  // --- Document ---------------------------------------------------------------
  {
    id: "pdf-intelligence",
    label: "PDF Intelligence",
    description: "Extract text, page count, and reading stats from a PDF — with optional AI summary.",
    href: "/pdf-intelligence",
    category: "document",
    icon: "FileSearch",
    keywords: ["pdf", "extract", "summary", "document", "text extraction"],
  },
  {
    id: "pdf-merger",
    label: "PDF Merger",
    description: "Combine multiple PDFs into one, in the order you choose.",
    href: "/tools/pdf-merger",
    category: "document",
    icon: "FilePlus2",
    keywords: ["pdf", "merge", "combine", "join"],
  },
  {
    id: "pdf-splitter",
    label: "PDF Splitter",
    description: "Split a PDF into individual pages or a chosen page range.",
    href: "/tools/pdf-splitter",
    category: "document",
    icon: "Scissors",
    keywords: ["pdf", "split", "extract pages"],
  },
  {
    id: "images-to-pdf",
    label: "Images → PDF",
    description: "Combine one or more images into a single PDF.",
    href: "/tools/images-to-pdf",
    category: "document",
    icon: "FileImage",
    keywords: ["images", "pdf", "convert", "combine"],
  },
  {
    id: "pdf-to-images",
    label: "PDF → Images",
    description: "Export every page of a PDF as a PNG image.",
    href: "/tools/pdf-to-images",
    category: "document",
    icon: "Images",
    keywords: ["pdf", "images", "png", "export pages"],
  },

  // --- File -----------------------------------------------------------------
  {
    id: "zip-creator",
    label: "ZIP Creator",
    description: "Bundle multiple files into a single .zip archive.",
    href: "/tools/zip-creator",
    category: "file",
    icon: "FolderArchive",
    keywords: ["zip", "archive", "compress", "bundle"],
  },
  {
    id: "zip-extractor",
    label: "ZIP Extractor",
    description: "Unpack a .zip archive and download its contents.",
    href: "/tools/zip-extractor",
    category: "file",
    icon: "FolderOpen",
    keywords: ["zip", "extract", "unzip", "archive"],
  },
];

export function getToolById(id: string): ToolDef | undefined {
  return TOOLS.find((t) => t.id === id);
}
