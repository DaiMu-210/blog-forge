import sharp from 'sharp'
import { readFileSync, writeFileSync, unlinkSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const iconsDir = join(__dirname, '..', 'src-tauri', 'icons')
const svgPath = join(iconsDir, 'forge-pen.svg')

const sizes = [
  { name: '32x32.png', size: 32 },
  { name: '128x128.png', size: 128 },
  { name: '128x128@2x.png', size: 256 },
  { name: 'icon.png', size: 512 },
  { name: 'Square30x30Logo.png', size: 30 },
  { name: 'Square44x44Logo.png', size: 44 },
  { name: 'Square71x71Logo.png', size: 71 },
  { name: 'Square89x89Logo.png', size: 89 },
  { name: 'Square107x107Logo.png', size: 107 },
  { name: 'Square142x142Logo.png', size: 142 },
  { name: 'Square150x150Logo.png', size: 150 },
  { name: 'Square284x284Logo.png', size: 284 },
  { name: 'Square310x310Logo.png', size: 310 },
  { name: 'StoreLogo.png', size: 50 },
]

const svgBuffer = readFileSync(svgPath)

async function main() {
  // Generate all PNGs
  for (const { name, size } of sizes) {
    const outputPath = join(iconsDir, name)
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer()
    writeFileSync(outputPath, pngBuffer)
    console.log(`Generated ${name} (${size}x${size})`)
  }

  // Generate icon.ico from 256x256 PNG
  // ICO is just a container; we embed multiple sizes
  const png256 = join(iconsDir, '128x128@2x.png')
  const png32 = join(iconsDir, '32x32.png')
  const icoPath = join(iconsDir, 'icon.ico')

  // Build ICO manually: 32x32 + 256x256
  const png32Buf = readFileSync(png32)
  const png256Buf = readFileSync(png256)

  // ICO header: reserved(2) + type(2) = 1(ico) + count(2)
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)  // reserved
  header.writeUInt16LE(1, 2)  // type: ICO
  header.writeUInt16LE(2, 4)  // number of images

  // ICO directory entries (4 entries: 32x32, 64x64, 128x128, 256x256)
  const entries = [
    { w: 32, h: 32, buf: png32Buf },
    { w: 64, h: 64, buf: await sharp(svgBuffer).resize(64, 64).png().toBuffer() },
    { w: 128, h: 128, buf: await sharp(svgBuffer).resize(128, 128).png().toBuffer() },
    { w: 0, h: 0, buf: png256Buf },  // 0 means 256 in ICO
  ]

  const dirEntrySize = 16
  let offset = 6 + entries.length * dirEntrySize

  const dirEntries = []
  for (const entry of entries) {
    const dirEntry = Buffer.alloc(16)
    dirEntry.writeUInt8(entry.w, 0)   // width
    dirEntry.writeUInt8(entry.h, 1)   // height
    dirEntry.writeUInt8(0, 2)          // colors
    dirEntry.writeUInt8(0, 3)          // reserved
    dirEntry.writeUInt16LE(1, 4)       // planes
    dirEntry.writeUInt16LE(32, 6)      // bpp
    dirEntry.writeUInt32LE(entry.buf.length, 8)   // size
    dirEntry.writeUInt32LE(offset, 12)             // offset
    dirEntries.push(dirEntry)
    offset += entry.buf.length
  }

  const icoBuffer = Buffer.concat([header, ...dirEntries, ...entries.map(e => e.buf)])
  writeFileSync(icoPath, icoBuffer)
  console.log('Generated icon.ico')

  console.log('\nAll icons generated!')
}

main().catch(console.error)
