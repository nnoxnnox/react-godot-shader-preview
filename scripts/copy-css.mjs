import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'src', 'GodotMaterialPreview.css');
const dist = join(root, 'dist');
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
copyFileSync(src, join(dist, 'GodotMaterialPreview.css'));
copyFileSync(src, join(dist, 'style.css'));
