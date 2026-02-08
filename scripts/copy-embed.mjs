import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(packageRoot, 'godot');
const embedFolderName = 'react_godot_shader_preview_embed';
// When installed as a dependency, cwd is the package dir; project root is two levels up.
const projectRoot = path.resolve(packageRoot, '..', '..');
const publicDir = path.join(projectRoot, 'public');
const destDir = path.join(publicDir, embedFolderName);

if (!fs.existsSync(sourceDir)) {
  console.warn('[react-godot-shader-preview] postinstall: godot folder not found, skip copy');
  process.exit(0);
}

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}

fs.mkdirSync(publicDir, { recursive: true });
fs.mkdirSync(destDir, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(sourceDir, destDir);
console.log(`[react-godot-shader-preview] Copied godot export to public/${embedFolderName}/`);
