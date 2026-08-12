import fs from 'fs'
import path from 'path'

// Gera um PNG simples de 192x192 e 512x512
// PNG mínimo válido com cor #0F172A
function createPngBuffer(width, height) {
  // SVG de ícone estilizado
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" rx="${width * 0.2}" fill="#0F172A"/>
    <text x="50%" y="55%" font-family="sans-serif" font-size="${width * 0.45}" font-weight="bold" fill="#F8FAFC" text-anchor="middle" dominant-baseline="middle">📰</text>
  </svg>`

  return svg
}

const publicDir = path.join(process.cwd(), 'public')
fs.writeFileSync(path.join(publicDir, 'icon.svg'), createPngBuffer(512, 512))
console.log('SVG Icon criado em public/icon.svg')
