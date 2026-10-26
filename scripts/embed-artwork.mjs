// Keep the installed plugin self-contained: the Host's module loader does not
// need an extra asset route or access to the original artist directory.
import { readFile, writeFile } from 'node:fs/promises'
const root = new URL('../', import.meta.url)
const image = await readFile(new URL('assets/deepseek-ocean.png', root))
const source = await readFile(new URL('src/ocean-artwork.js', root), 'utf8')
const target = new URL('client.js', root)
const client = await readFile(target, 'utf8')
const start = '    // BEGIN OCEAN ARTWORK'
const end = '    // END OCEAN ARTWORK'
const from = client.indexOf(start), to = client.indexOf(end, from)
if (from < 0 || to < 0) throw new Error('Missing artwork bundle markers')
const block = `${start}\n    const ARTWORK_DATA = 'data:image/png;base64,${image.toString('base64')}'\n${source.split('\n').map(line => line ? `    ${line}` : '').join('\n')}\n${end}`
await writeFile(target, client.slice(0, from) + block + client.slice(to + end.length))
console.log(`Embedded artwork (${image.length} bytes) and animation source into client.js`)
