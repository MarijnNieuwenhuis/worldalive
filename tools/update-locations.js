#!/usr/bin/env node
/**
 * Update location coordinates across ALL tick world.json files.
 *
 * Usage:
 *   1. Use location-picker.html to position locations on the map
 *   2. Copy the JSON output and save it to a file (e.g. locations.json)
 *   3. Run: node tools/update-locations.js locations.json
 *
 * Or pipe directly:
 *   node tools/update-locations.js < locations.json
 *
 * This updates x/y coordinates in every tick's world.json file.
 * It only updates coordinates — it won't add or remove locations.
 */

const fs = require('fs')
const path = require('path')

// Default to billings-montana, override with --world flag
const worldId = process.argv.find(a => a.startsWith('--world='))?.split('=')[1] ?? 'billings-montana'
const distDir = path.join(__dirname, '..', 'dist', worldId, 'ticks')

// Read input: file arg or stdin
let input
if (process.argv[2]) {
  input = fs.readFileSync(process.argv[2], 'utf8')
} else {
  input = fs.readFileSync(0, 'utf8') // stdin
}

const newLocations = JSON.parse(input)

// Build a lookup: id → { x, y }
const coordMap = {}
newLocations.forEach(loc => {
  if (loc.id && loc.x != null && loc.y != null) {
    coordMap[loc.id] = { x: loc.x, y: loc.y }
  }
})

console.log(`Loaded ${Object.keys(coordMap).length} location coordinates`)

// Find all tick world.json files
const tickDirs = fs.readdirSync(distDir).filter(d => {
  return fs.statSync(path.join(distDir, d)).isDirectory()
}).sort()

let updated = 0
let skipped = 0

tickDirs.forEach(tick => {
  const worldPath = path.join(distDir, tick, 'world.json')
  if (!fs.existsSync(worldPath)) return

  const world = JSON.parse(fs.readFileSync(worldPath, 'utf8'))
  if (!world.locations) return

  let changed = false
  world.locations.forEach(loc => {
    if (coordMap[loc.id]) {
      const newCoords = coordMap[loc.id]
      if (loc.x !== newCoords.x || loc.y !== newCoords.y) {
        loc.x = newCoords.x
        loc.y = newCoords.y
        changed = true
      }
    }
  })

  if (changed) {
    fs.writeFileSync(worldPath, JSON.stringify(world, null, 2))
    updated++
    console.log(`  Updated: ${tick}`)
  } else {
    skipped++
  }
})

console.log(`\nDone: ${updated} ticks updated, ${skipped} unchanged`)
