-- ORBIT — seed data mirroring src/registry/tools.ts and src/registry/apps.ts
-- as of this writing. Every row here is a real ORBIT tool, not filler.
-- App URLs are intentionally left null — see supabase/README.md's note on
-- never fabricating a Zero Degree app URL; set them via UPDATE once real
-- deployments exist, mirroring the NEXT_PUBLIC_*_URL env vars.

insert into categories (id, label, sort_order) values
  ('text', 'Text', 0),
  ('ai', 'AI Writing', 1),
  ('convert', 'Calculators & Converters', 2),
  ('data', 'Data', 3),
  ('image', 'Image', 4),
  ('document', 'Document', 5),
  ('file', 'File', 6)
on conflict (id) do nothing;

insert into tools (id, label, description, href, category_id, icon, keywords, requires_provider) values
  ('word-counter', 'Word & Character Counter', 'Live word, character, sentence, and reading-time stats as you type.', '/tools/word-counter', 'text', 'Type', array['words','characters','count','reading time','letters'], null),
  ('text-case', 'Text Case Converter', 'Switch between UPPER, lower, Title, Sentence, camelCase, and snake_case.', '/tools/text-case', 'text', 'CaseSensitive', array['uppercase','lowercase','title case','camelcase','snake_case','case'], null),
  ('markdown-converter', 'Markdown Converter', 'Render Markdown to clean, copyable HTML with a live preview.', '/tools/markdown-converter', 'text', 'FileText', array['markdown','html','convert','render','md'], null),

  ('grammar-checker', 'Grammar Checker', 'Find and fix grammar, spelling, and punctuation issues.', '/tools/grammar-checker', 'ai', 'SpellCheck', array['grammar','spelling','proofread','correct'], 'ai'),
  ('text-rewriter', 'Text Rewriter', 'Rewrite a passage while preserving its meaning.', '/tools/text-rewriter', 'ai', 'Wand2', array['rewrite','rephrase','improve'], 'ai'),
  ('text-summarizer', 'Text Summarizer', 'Condense long text into a short summary or bullet points.', '/tools/text-summarizer', 'ai', 'ListTree', array['summarize','summary','tldr','condense'], 'ai'),
  ('paraphraser', 'Paraphraser', 'Restate a sentence or paragraph in different words.', '/tools/paraphraser', 'ai', 'Repeat2', array['paraphrase','reword','rewrite'], 'ai'),
  ('tone-changer', 'Tone Changer', 'Rewrite text in a different tone — formal, friendly, confident, and more.', '/tools/tone-changer', 'ai', 'AudioLines', array['tone','formal','casual','voice'], 'ai'),
  ('email-writer', 'Email Writer', 'Draft a complete email from a short description of what you need to say.', '/tools/email-writer', 'ai', 'Mail', array['email','draft','write','compose'], 'ai'),

  ('unit-converter', 'Unit Converter', 'Convert length, mass, volume, speed, digital storage, and temperature.', '/tools/unit-converter', 'convert', 'ArrowLeftRight', array['convert','units','km','miles','kg','lb','celsius','fahrenheit','data storage'], null),
  ('percentage-calculator', 'Percentage Calculator', 'What is X% of Y, what percent is X of Y, and percentage change.', '/tools/percentage-calculator', 'convert', 'Percent', array['percent','percentage','of','change','increase','decrease'], null),
  ('date-calculator', 'Date Calculator', 'Days between two dates, or add/subtract days from a date.', '/tools/date-calculator', 'convert', 'CalendarRange', array['date','days between','add days','duration'], null),
  ('age-calculator', 'Age Calculator', 'Exact age in years, months, and days from a birth date.', '/tools/age-calculator', 'convert', 'Cake', array['age','birthday','years old'], null),

  ('json-formatter', 'JSON Formatter', 'Format, minify, and validate JSON with inline error location.', '/tools/json-formatter', 'data', 'Braces', array['json','format','pretty print','minify','validate'], null),
  ('csv-json', 'CSV ⇄ JSON', 'Convert between CSV and JSON in either direction.', '/tools/csv-json', 'data', 'Table', array['csv','json','convert','spreadsheet'], null),
  ('base64', 'Base64 Encoder / Decoder', 'Encode text to Base64 or decode Base64 back to text.', '/tools/base64', 'data', 'Binary', array['base64','encode','decode'], null),
  ('password-generator', 'Password Generator', 'Generate strong random passwords with configurable rules, using the browser''s CSPRNG.', '/tools/password-generator', 'data', 'KeyRound', array['password','generate','random','secure'], null),
  ('qr-generator', 'QR Code Generator', 'Turn any text or URL into a downloadable QR code.', '/tools/qr-generator', 'data', 'QrCode', array['qr','qr code','barcode'], null),

  ('image-compressor', 'Image Compressor', 'Shrink a JPEG, PNG, or WebP file size with an adjustable quality slider.', '/tools/image-compressor', 'image', 'ImageDown', array['compress','image','shrink','optimize'], null),
  ('image-resizer', 'Image Resizer', 'Resize an image to exact dimensions or a percentage, with aspect-ratio lock.', '/tools/image-resizer', 'image', 'Expand', array['resize','image','dimensions','scale'], null),
  ('image-converter', 'Image Converter', 'Convert between JPEG, PNG, and WebP.', '/tools/image-converter', 'image', 'RefreshCw', array['convert','image','jpeg','png','webp'], null),
  ('image-cropper', 'Image Cropper', 'Crop an image to a precise rectangle before exporting.', '/tools/image-cropper', 'image', 'Crop', array['crop','image','trim'], null),
  ('image-rotator', 'Image Rotator', 'Rotate or flip an image, then export the result.', '/tools/image-rotator', 'image', 'RotateCw', array['rotate','flip','image'], null),
  ('color-extractor', 'Color Extractor', 'Pull a dominant color palette out of an image.', '/tools/color-extractor', 'image', 'Palette', array['color','palette','extract','hex'], null),
  ('image-to-text', 'Image → Text (OCR)', 'Extract text from a photo or screenshot, entirely in your browser.', '/tools/image-to-text', 'image', 'ScanText', array['ocr','image to text','screenshot','extract text'], null),

  ('pdf-intelligence', 'PDF Intelligence', 'Extract text, page count, and reading stats from a PDF — with optional AI summary.', '/pdf-intelligence', 'document', 'FileSearch', array['pdf','extract','summary','document','text extraction'], null),
  ('pdf-merger', 'PDF Merger', 'Combine multiple PDFs into one, in the order you choose.', '/tools/pdf-merger', 'document', 'FilePlus2', array['pdf','merge','combine','join'], null),
  ('pdf-splitter', 'PDF Splitter', 'Split a PDF into individual pages or a chosen page range.', '/tools/pdf-splitter', 'document', 'Scissors', array['pdf','split','extract pages'], null),
  ('images-to-pdf', 'Images → PDF', 'Combine one or more images into a single PDF.', '/tools/images-to-pdf', 'document', 'FileImage', array['images','pdf','convert','combine'], null),
  ('pdf-to-images', 'PDF → Images', 'Export every page of a PDF as a PNG image.', '/tools/pdf-to-images', 'document', 'Images', array['pdf','images','png','export pages'], null),

  ('zip-creator', 'ZIP Creator', 'Bundle multiple files into a single .zip archive.', '/tools/zip-creator', 'file', 'FolderArchive', array['zip','archive','compress','bundle'], null),
  ('zip-extractor', 'ZIP Extractor', 'Unpack a .zip archive and download its contents.', '/tools/zip-extractor', 'file', 'FolderOpen', array['zip','extract','unzip','archive'], null)
on conflict (id) do nothing;

insert into zero_degree_apps (id, name, tagline, url, is_self, sort_order) values
  ('orbit', 'ORBIT', 'Command Center, search, and utility tools.', null, true, 0),
  ('zhub', 'Z Hub', 'Campus OS — market, print, spaces, connect.', null, false, 1),
  ('loop', 'LOOP', 'Zero Degree''s workflow & automation product.', null, false, 2),
  ('civi', 'CIVI', 'Zero Degree''s civic/community product.', null, false, 3)
on conflict (id) do nothing;
