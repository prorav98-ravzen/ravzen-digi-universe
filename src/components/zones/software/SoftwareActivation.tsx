'use client'

/**
 * SoftwareActivation — Cinematic 3D Monitor Power-up & Portal Sequence.
 *
 * Full Three.js WebGL scene, zero external assets, procedural geometry only.
 * Follows the exact same architecture as DesignActivation.tsx and AndroidActivation.tsx.
 *
 * ── Sequence (5.2 s total) ──────────────────────────────────────────────────
 *  Phase 0 — Scene Rise          (0.0 s – 0.9 s)
 *    Deep space backdrop fades in. Blue-violet nebula particles swirl.
 *    A large futuristic 3D monitor materialises in the centre of the scene
 *    with metallic PBR chassis, bezel, stand — powered off (dark screen).
 *
 *  Phase 1 — Energy Transfer     (0.9 s – 1.8 s)
 *    A charged violet energy orb descends from above the scene.
 *    A crackling energy beam traces down to the monitor's power button.
 *    Impact flash + sparks. Monitor chassis rim illuminates.
 *
 *  Phase 2 — Screen Power-up     (1.8 s – 2.7 s)
 *    Screen panel brightens — cyan/blue/violet energy patterns bloom
 *    across the surface as flowing particle streams. Scan lines pulse.
 *    A sci-fi interface grid and concentric rings radiate outward.
 *
 *  Phase 3 — Camera Zoom         (2.7 s – 3.6 s)
 *    Camera dollies smoothly toward the monitor screen, creating a sense
 *    of depth as it fills the entire viewport.
 *
 *  Phase 4 — Portal Reveal       (3.6 s – 4.5 s)
 *    Inside the screen, a massive ancient stone portal rises. Intricate
 *    rune carvings and mystical glyphs illuminate. The heavy doors swing
 *    open revealing blinding cyan light beyond.
 *
 *  Phase 5 — Zone Entry          (4.5 s – 5.2 s)
 *    Camera pushes through the open portal threshold.
 *    Blinding radiance fills frame → zoneReady().
 *
 * ── Performance ─────────────────────────────────────────────────────────────
 *   DPR capped at 1.25 (1.0 on mobile). All textures canvas-generated.
 *   InstancedMesh for particles. Full disposables cleanup on unmount.
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Texture helpers ───────────────────────────────────────────────────────────

function makeTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.minFilter = THREE.LinearFilter
  return t
}

/** Brushed titanium chassis material */
function makeChassisTex(): THREE.CanvasTexture {
  return makeTex(256, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 256)
    g.addColorStop(0, '#0e1830'); g.addColorStop(0.5, '#152240'); g.addColorStop(1, '#0a1020')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256)
    // Brushed horizontal lines
    ctx.strokeStyle = 'rgba(100,150,255,0.055)'; ctx.lineWidth = 1
    for (let y = 0; y < 256; y += 2) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke()
    }
    // Edge bevel
    ctx.strokeStyle = 'rgba(77,127,255,0.22)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 254, 254)
    // Logo micro-grid
    ctx.strokeStyle = 'rgba(77,127,255,0.08)'; ctx.lineWidth = 1
    for (let i = 16; i < 256; i += 32) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke()
    }
  })
}

/** Monitor screen — dormant state (dark) */
function makeScreenOffTex(): THREE.CanvasTexture {
  return makeTex(512, 320, (ctx) => {
    ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, 512, 320)
    // Faint scan lines even when off
    ctx.strokeStyle = 'rgba(77,100,200,0.05)'; ctx.lineWidth = 1
    for (let y = 0; y < 320; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
    }
  })
}

/** Monitor screen — powered on with energy patterns */
function makeScreenOnTex(): THREE.CanvasTexture {
  return makeTex(512, 320, (ctx) => {
    // Background
    const bg = ctx.createLinearGradient(0, 0, 512, 320)
    bg.addColorStop(0, '#020c1e'); bg.addColorStop(1, '#08061a')
    ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 320)

    // Scan lines
    ctx.strokeStyle = 'rgba(77,127,255,0.06)'; ctx.lineWidth = 1
    for (let y = 0; y < 320; y += 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke()
    }

    // Concentric energy rings
    ctx.save()
    for (let r = 30; r < 200; r += 35) {
      const alpha = 0.6 - r / 350
      ctx.strokeStyle = `rgba(77,127,255,${alpha})`
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.arc(256, 160, r, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.restore()

    // Interface grid
    ctx.strokeStyle = 'rgba(124,92,252,0.18)'; ctx.lineWidth = 0.8
    for (let i = 0; i < 512; i += 48) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 320); ctx.stroke()
    }
    for (let j = 0; j < 320; j += 48) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(512, j); ctx.stroke()
    }

    // Central glow bloom
    const rg = ctx.createRadialGradient(256, 160, 0, 256, 160, 160)
    rg.addColorStop(0, 'rgba(0,220,255,0.55)')
    rg.addColorStop(0.3, 'rgba(77,127,255,0.3)')
    rg.addColorStop(0.7, 'rgba(124,92,252,0.12)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 512, 320)

    // "SOFTWARE ZONE" text
    ctx.font = 'bold 22px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.shadowColor = '#4d7fff'; ctx.shadowBlur = 14
    ctx.fillStyle = 'rgba(77,127,255,0.9)'; ctx.fillText('SOFTWARE ZONE', 256, 145)
    ctx.font = '11px monospace'; ctx.shadowBlur = 6
    ctx.fillStyle = 'rgba(124,92,252,0.7)'; ctx.fillText('INITIALISING PORTAL...', 256, 175)

    // Corner HUD marks
    ctx.strokeStyle = 'rgba(77,127,255,0.65)'; ctx.lineWidth = 2; ctx.shadowBlur = 8
    for (const [cx, cy, sx, sy] of [[32,24,1,1],[480,24,-1,1],[32,296,1,-1],[480,296,-1,-1]] as [number,number,number,number][]) {
      ctx.beginPath()
      ctx.moveTo(cx, cy); ctx.lineTo(cx + sx * 18, cy)
      ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + sy * 18)
      ctx.stroke()
    }
  })
}

/** Ancient portal door stone texture with runes */
function makePortalDoorTex(side: 'L' | 'R'): THREE.CanvasTexture {
  return makeTex(512, 1024, (ctx) => {
    ctx.fillStyle = '#07091a'; ctx.fillRect(0, 0, 512, 1024)
    // Stone grain
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 512; const y = Math.random() * 1024
      const v = 10 + Math.floor(Math.random() * 22)
      ctx.fillStyle = `rgb(${v},${v+2},${v+12})`
      ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3)
    }
    // Metal border frame
    ctx.fillStyle = '#120e28'
    ctx.fillRect(0, 0, 512, 52); ctx.fillRect(0, 972, 512, 52)
    ctx.fillRect(side === 'L' ? 460 : 0, 0, 52, 1024)
    // Rivets
    ctx.fillStyle = '#2a2048'
    for (let py = 90; py < 940; py += 95) {
      ctx.beginPath(); ctx.arc(side === 'L' ? 486 : 26, py, 8, 0, Math.PI * 2); ctx.fill()
    }
    // Blue-violet rune column
    const rcx = side === 'L' ? 200 : 312
    ctx.shadowColor = '#4d7fff'; ctx.shadowBlur = 20
    ctx.strokeStyle = 'rgba(77,127,255,0.88)'; ctx.lineWidth = 4
    for (let ry = 110; ry < 960; ry += 130) {
      // Triangle rune
      ctx.beginPath()
      ctx.moveTo(rcx, ry); ctx.lineTo(rcx + 32, ry + 55); ctx.lineTo(rcx - 32, ry + 55); ctx.closePath(); ctx.stroke()
      // Inner line
      ctx.beginPath(); ctx.moveTo(rcx, ry + 16); ctx.lineTo(rcx, ry + 44); ctx.stroke()
    }
    // Violet glyph cluster at centre
    ctx.shadowColor = '#7c5cfc'; ctx.shadowBlur = 28
    ctx.strokeStyle = 'rgba(124,92,252,0.92)'; ctx.lineWidth = 3.5
    const gx = rcx; const gy = 512
    ctx.beginPath(); ctx.arc(gx, gy, 60, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(gx, gy, 32, 0, Math.PI * 2); ctx.stroke()
    // Six-pointed star
    for (let k = 0; k < 6; k++) {
      const a = (Math.PI / 3) * k
      ctx.beginPath()
      ctx.moveTo(gx + Math.cos(a) * 32, gy + Math.sin(a) * 32)
      ctx.lineTo(gx + Math.cos(a + Math.PI) * 60, gy + Math.sin(a + Math.PI) * 60)
      ctx.stroke()
    }
    // Magenta accent band
    ctx.shadowColor = '#ec4899'; ctx.shadowBlur = 16
    ctx.strokeStyle = 'rgba(236,72,153,0.55)'; ctx.lineWidth = 2
    for (let by = 240; by < 900; by += 240) {
      ctx.beginPath(); ctx.moveTo(24, by); ctx.lineTo(488, by); ctx.stroke()
    }
  })
}

/** Portal vortex centre — swirling light */
function makeVortexTex(): THREE.CanvasTexture {
  return makeTex(512, 512, (ctx) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 512, 512)
    const rg = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    rg.addColorStop(0, 'rgba(255,255,255,1)')
    rg.addColorStop(0.08, 'rgba(0,240,255,0.95)')
    rg.addColorStop(0.22, 'rgba(77,127,255,0.75)')
    rg.addColorStop(0.45, 'rgba(124,92,252,0.45)')
    rg.addColorStop(0.7, 'rgba(236,72,153,0.2)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 512, 512)
    // Spiral arms
    ctx.strokeStyle = 'rgba(0,220,255,0.4)'; ctx.lineWidth = 2
    for (let arm = 0; arm < 5; arm++) {
      ctx.beginPath()
      const startA = (arm / 5) * Math.PI * 2
      for (let i = 0; i <= 80; i++) {
        const t = i / 80; const r = t * 200; const a = startA + t * Math.PI * 4
        const x = 256 + Math.cos(a) * r; const y = 256 + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}

// ── Monitor 3D builder ────────────────────────────────────────────────────────

interface MonitorParts {
  group:         THREE.Group
  screenMesh:    THREE.Mesh
  rimLight:      THREE.RectAreaLight | THREE.PointLight
  screenLight:   THREE.PointLight
  geometries:    THREE.BufferGeometry[]
  materials:     THREE.Material[]
  textures:      THREE.Texture[]
}

function buildMonitor(): MonitorParts {
  const geometries: THREE.BufferGeometry[] = []
  const materials:  THREE.Material[]       = []
  const textures:   THREE.Texture[]        = []

  const chassisTex = makeChassisTex(); textures.push(chassisTex)
  const screenOff  = makeScreenOffTex(); textures.push(screenOff)

  const chassisMat = new THREE.MeshStandardMaterial({
    map: chassisTex, color: 0xd0deff, metalness: 0.88, roughness: 0.26,
  })
  materials.push(chassisMat)

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x060d1e, metalness: 0.94, roughness: 0.22,
  })
  materials.push(darkMat)

  const bezelMat = new THREE.MeshStandardMaterial({
    color: 0x03060e, metalness: 0.9, roughness: 0.35,
  })
  materials.push(bezelMat)

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x4d7fff, emissive: new THREE.Color(0x1a3a80), emissiveIntensity: 0,
    metalness: 0.7, roughness: 0.3,
  })
  materials.push(rimMat)

  const screenMat = new THREE.MeshStandardMaterial({
    map: screenOff, emissive: new THREE.Color(0x000a20),
    emissiveIntensity: 0, roughness: 0.05, metalness: 0.0,
  })
  materials.push(screenMat)

  const group = new THREE.Group()

  // ── Chassis body ──────────────────────────────────────────────────────────
  const bodyGeo = new THREE.BoxGeometry(6.4, 3.8, 0.32)
  geometries.push(bodyGeo)
  const bodyMesh = new THREE.Mesh(bodyGeo, chassisMat)
  group.add(bodyMesh)

  // Chassis rim — top/bottom/side accent strips
  const rimTopGeo = new THREE.BoxGeometry(6.4, 0.08, 0.36)
  geometries.push(rimTopGeo)
  const rimTop = new THREE.Mesh(rimTopGeo, rimMat)
  rimTop.position.set(0, 1.94, 0); group.add(rimTop)

  const rimBotGeo = new THREE.BoxGeometry(6.4, 0.08, 0.36)
  geometries.push(rimBotGeo)
  const rimBot = new THREE.Mesh(rimBotGeo, rimMat)
  rimBot.position.set(0, -1.94, 0); group.add(rimBot)

  for (const sx of [-3.2, 3.2]) {
    const rsg = new THREE.BoxGeometry(0.08, 3.8, 0.36)
    geometries.push(rsg)
    const rs = new THREE.Mesh(rsg, rimMat)
    rs.position.set(sx, 0, 0); group.add(rs)
  }

  // Bezel inner frame
  const bezelGeo = new THREE.BoxGeometry(5.8, 3.3, 0.10)
  geometries.push(bezelGeo)
  const bezel = new THREE.Mesh(bezelGeo, bezelMat)
  bezel.position.set(0, 0.05, 0.21); group.add(bezel)

  // ── Screen panel ──────────────────────────────────────────────────────────
  const screenGeo = new THREE.PlaneGeometry(5.5, 3.08)
  geometries.push(screenGeo)
  const screenMesh = new THREE.Mesh(screenGeo, screenMat)
  screenMesh.position.set(0, 0.08, 0.265); group.add(screenMesh)

  // ── Stand neck ────────────────────────────────────────────────────────────
  const neckGeo = new THREE.BoxGeometry(0.52, 1.05, 0.38)
  geometries.push(neckGeo)
  const neck = new THREE.Mesh(neckGeo, chassisMat)
  neck.position.set(0, -2.42, 0); group.add(neck)

  // Stand base
  const baseGeo = new THREE.BoxGeometry(2.4, 0.22, 0.72)
  geometries.push(baseGeo)
  const base = new THREE.Mesh(baseGeo, darkMat)
  base.position.set(0, -2.97, 0.12); group.add(base)

  // Power button
  const btnGeo = new THREE.CylinderGeometry(0.10, 0.10, 0.10, 12)
  geometries.push(btnGeo)
  const btnMat = new THREE.MeshStandardMaterial({
    color: 0x4d7fff, emissive: new THREE.Color(0x0a1a40), emissiveIntensity: 0,
    metalness: 0.8, roughness: 0.3,
  })
  materials.push(btnMat)
  const btn = new THREE.Mesh(btnGeo, btnMat)
  btn.rotation.x = Math.PI / 2; btn.position.set(2.85, -1.75, 0.22); group.add(btn)

  // Ventilation slots (left side)
  for (let i = 0; i < 3; i++) {
    const vg = new THREE.BoxGeometry(0.06, 0.36, 0.38)
    geometries.push(vg)
    const vm = new THREE.Mesh(vg, darkMat)
    vm.position.set(-3.05, -0.4 + i * 0.44, 0); group.add(vm)
  }

  // Screen rim glow light
  const screenLight = new THREE.PointLight(0x4d7fff, 0, 8)
  screenLight.position.set(0, 0, 1.5)
  group.add(screenLight)

  const rimLight = new THREE.PointLight(0x4d7fff, 0, 6)
  rimLight.position.set(0, 0, 0.8)
  group.add(rimLight)

  return { group, screenMesh, rimLight, screenLight, geometries, materials, textures }
}

// ── Portal builder (inside monitor space) ────────────────────────────────────

interface PortalParts {
  group:       THREE.Group
  leftPivot:   THREE.Group
  rightPivot:  THREE.Group
  vortex:      THREE.Mesh
  glowLight:   THREE.PointLight
  geometries:  THREE.BufferGeometry[]
  materials:   THREE.Material[]
  textures:    THREE.Texture[]
}

function buildPortal(): PortalParts {
  const geometries: THREE.BufferGeometry[] = []
  const materials:  THREE.Material[]       = []
  const textures:   THREE.Texture[]        = []

  const group = new THREE.Group()

  const lTex = makePortalDoorTex('L'); textures.push(lTex)
  const rTex = makePortalDoorTex('R'); textures.push(rTex)
  const vTex = makeVortexTex();         textures.push(vTex)

  const lMat = new THREE.MeshStandardMaterial({
    map: lTex, metalness: 0.55, roughness: 0.58,
    emissive: new THREE.Color(0x050820), emissiveIntensity: 0.5,
  })
  materials.push(lMat)

  const rMat = new THREE.MeshStandardMaterial({
    map: rTex, metalness: 0.55, roughness: 0.58,
    emissive: new THREE.Color(0x050820), emissiveIntensity: 0.5,
  })
  materials.push(rMat)

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0c0a20, metalness: 0.9, roughness: 0.24,
  })
  materials.push(frameMat)

  const vortexMat = new THREE.MeshBasicMaterial({
    map: vTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending,
  })
  materials.push(vortexMat)

  // Top lintel
  const lintelGeo = new THREE.BoxGeometry(5.4, 0.55, 0.72)
  geometries.push(lintelGeo)
  const lintel = new THREE.Mesh(lintelGeo, frameMat)
  lintel.position.set(0, 4.28, 0); group.add(lintel)

  // Pillars
  for (const sx of [-2.46, 2.46]) {
    const pg = new THREE.BoxGeometry(0.60, 8.8, 0.72)
    geometries.push(pg)
    const pm = new THREE.Mesh(pg, frameMat)
    pm.position.set(sx, 0, 0); group.add(pm)
  }

  // Pivot hinges
  const leftPivot  = new THREE.Group(); leftPivot.position.set(-2.16, 0, 0.36)
  const rightPivot = new THREE.Group(); rightPivot.position.set(2.16, 0, 0.36)
  group.add(leftPivot, rightPivot)

  // Door leaves
  const dlGeo = new THREE.BoxGeometry(4.12, 8.5, 0.16)
  geometries.push(dlGeo)
  const dL = new THREE.Mesh(dlGeo, lMat); dL.position.set(-2.06, 0, 0)
  leftPivot.add(dL)

  const drGeo = new THREE.BoxGeometry(4.12, 8.5, 0.16)
  geometries.push(drGeo)
  const dR = new THREE.Mesh(drGeo, rMat); dR.position.set(2.06, 0, 0)
  rightPivot.add(dR)

  // Vortex plane (revealed when doors open)
  const vGeo = new THREE.PlaneGeometry(4.2, 8.4)
  geometries.push(vGeo)
  const vortex = new THREE.Mesh(vGeo, vortexMat); vortex.position.set(0, 0, -0.08)
  group.add(vortex)

  const glowLight = new THREE.PointLight(0x00d4ff, 0, 14)
  glowLight.position.set(0, 0, 1.5); group.add(glowLight)

  // Start hidden far below
  group.position.set(0, -20, -6)
  group.scale.set(0.8, 0.8, 0.8)

  return { group, leftPivot, rightPivot, vortex, glowLight, geometries, materials, textures }
}

// ── Particle System ───────────────────────────────────────────────────────────

const MAX_PARTICLES = 180
interface PSt { active: boolean; x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; maxLife: number; size: number }

// ── Component ─────────────────────────────────────────────────────────────────

export default function SoftwareActivation() {
  const { zoneReady } = useExperience()
  const reduced       = useReducedMotion()
  const canvasRef     = useRef<HTMLCanvasElement | null>(null)
  const doneRef       = useRef(false)

  useEffect(() => { if (!reduced) return; zoneReady() }, [reduced, zoneReady])

  const handleSkip = useCallback(() => { doneRef.current = true; zoneReady() }, [zoneReady])

  useEffect(() => {
    if (reduced) return
    doneRef.current = false
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'high-performance' })
    } catch { zoneReady(); return }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x030510)
    scene.fog = new THREE.FogExp2(0x030510, 0.025)

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120)
    camera.position.set(0, 0.4, 18)
    camera.lookAt(0, 0, 0)

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x182840, 0.5)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0x88aaff, 2.0)
    key.position.set(6, 10, 10); scene.add(key)

    const rim = new THREE.DirectionalLight(0x4d22cc, 1.6)
    rim.position.set(-8, 3, -5); scene.add(rim)

    const fill = new THREE.DirectionalLight(0x0033aa, 0.7)
    fill.position.set(0, -8, 4); scene.add(fill)

    const backGlow = new THREE.PointLight(0x4d7fff, 0, 20)
    backGlow.position.set(0, 2, -10); scene.add(backGlow)

    // Global orb light (energy transfer)
    const orbLight = new THREE.PointLight(0x7c5cfc, 0, 12)
    orbLight.position.set(0, 7, 5); scene.add(orbLight)

    // ── Disposables tracker ───────────────────────────────────────────────────
    const dis = { geometries: [] as THREE.BufferGeometry[], materials: [] as THREE.Material[], textures: [] as THREE.Texture[] }

    // ── Nebula star field ─────────────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry()
    dis.geometries.push(starGeo)
    const sc = 320; const sp = new Float32Array(sc * 3)
    for (let i = 0; i < sc; i++) {
      sp[i*3]   = (Math.random()-0.5)*60
      sp[i*3+1] = (Math.random()-0.5)*35
      sp[i*3+2] = (Math.random()-0.5)*30 - 8
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    const starMat = new THREE.PointsMaterial({ color: 0x4466bb, size: 0.1, transparent: true, opacity: 0.6, depthWrite: false })
    dis.materials.push(starMat)
    scene.add(new THREE.Points(starGeo, starMat))

    // ── Energy orb (floating above monitor) ──────────────────────────────────
    const orbGeo = new THREE.SphereGeometry(0.38, 16, 12)
    dis.geometries.push(orbGeo)
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x9966ff, transparent: true, opacity: 0 })
    dis.materials.push(orbMat)
    const orbMesh = new THREE.Mesh(orbGeo, orbMat)
    orbMesh.position.set(0, 7.5, 5); scene.add(orbMesh)

    // Orb corona halo
    const haloGeo = new THREE.SphereGeometry(0.72, 14, 10)
    dis.geometries.push(haloGeo)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x5533cc, transparent: true, opacity: 0, side: THREE.BackSide })
    dis.materials.push(haloMat)
    const haloMesh = new THREE.Mesh(haloGeo, haloMat)
    haloMesh.position.copy(orbMesh.position); scene.add(haloMesh)

    // Energy beam (cylinder from orb to monitor)
    const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 6.2, 10, 1, true)
    dis.geometries.push(beamGeo)
    const beamMat = new THREE.MeshBasicMaterial({ color: 0x6644ff, transparent: true, opacity: 0, side: THREE.DoubleSide })
    dis.materials.push(beamMat)
    const beamMesh = new THREE.Mesh(beamGeo, beamMat)
    beamMesh.position.set(0, 4.5, 5); scene.add(beamMesh)

    // ── Monitor ───────────────────────────────────────────────────────────────
    const mon = buildMonitor()
    mon.group.position.set(0, 0.3, 0)
    scene.add(mon.group)
    dis.geometries.push(...mon.geometries)
    dis.materials.push(...mon.materials)
    dis.textures.push(...mon.textures)

    // ── Portal ────────────────────────────────────────────────────────────────
    const port = buildPortal()
    scene.add(port.group)
    dis.geometries.push(...port.geometries)
    dis.materials.push(...port.materials)
    dis.textures.push(...port.textures)

    // ── Particle system ───────────────────────────────────────────────────────
    const pGeo = new THREE.SphereGeometry(1, 5, 4)
    dis.geometries.push(pGeo)
    const pMat = new THREE.MeshBasicMaterial({ color: 0x66aaff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })
    dis.materials.push(pMat)
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_PARTICLES)
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(pMesh)
    const zero4 = new THREE.Matrix4().makeScale(0,0,0)
    for (let i=0;i<MAX_PARTICLES;i++) pMesh.setMatrixAt(i,zero4)
    pMesh.instanceMatrix.needsUpdate = true

    const pArr: PSt[] = Array.from({length:MAX_PARTICLES},()=>({active:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0,maxLife:1,size:0.05}))
    let nextP = 0
    const pm4 = new THREE.Matrix4()

    function spawnP(x:number,y:number,z:number,spd=1.0,_color=0x66aaff) {
      const p = pArr[nextP]; nextP = (nextP+1)%MAX_PARTICLES
      p.active=true; p.x=x; p.y=y; p.z=z
      const θ=Math.random()*Math.PI*2; const φ=Math.random()*Math.PI
      p.vx=Math.sin(φ)*Math.cos(θ)*spd; p.vy=Math.sin(φ)*Math.sin(θ)*spd; p.vz=Math.cos(φ)*spd
      p.life=0; p.maxLife=0.7+Math.random()*0.9; p.size=0.03+Math.random()*0.07
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function L(a:number,b:number,t:number){return a+(b-a)*t}
    function C01(t:number){return Math.max(0,Math.min(1,t))}
    function SS(t:number){return t*t*(3-2*t)}
    function EO(t:number,p=2){return 1-Math.pow(1-t,p)}
    function EIO(t:number){return t<0.5?2*t*t:1-(-2*t+2)**2/2}

    // ── Animation ─────────────────────────────────────────────────────────────
    let animId: number
    let t0 = performance.now(); let lastT = t0; let vis = true

    function onVis(){vis=document.visibilityState==='visible';if(vis){t0+=performance.now()-lastT;lastT=performance.now()}}
    document.addEventListener('visibilitychange',onVis)

    // Track screen on texture (generated once, applied in phase 2)
    let screenOnApplied = false

    function animate(now: number) {
      animId = requestAnimationFrame(animate)
      if (!vis || doneRef.current) return

      const el = (now - t0) / 1000
      const dt = Math.min((now - lastT) / 1000, 0.04)
      lastT = now

      // Particle tick
      let pDirty = false
      for (let i=0;i<MAX_PARTICLES;i++){
        const p=pArr[i]; if(!p.active)continue
        p.life+=dt
        if(p.life>=p.maxLife){p.active=false;pMesh.setMatrixAt(i,zero4);pDirty=true;continue}
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=0.25*dt
        const f=1-p.life/p.maxLife
        pm4.makeScale(p.size*f,p.size*f,p.size*f); pm4.setPosition(p.x,p.y,p.z)
        pMesh.setMatrixAt(i,pm4); pDirty=true
      }
      if(pDirty) pMesh.instanceMatrix.needsUpdate=true

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 0: Scene Rise  0.0 – 0.9 s
      // ─────────────────────────────────────────────────────────────────────
      if (el < 0.9) {
        const t = C01(el/0.9); const te = SS(t)
        ambient.intensity = L(0, 0.5, te)
        backGlow.intensity = L(0, 0.5, te)
        // Monitor rises from slight below
        mon.group.position.y = L(-1.2, 0.3, SS(t))
        mon.group.scale.setScalar(L(0.85, 1, SS(t)))
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 1: Energy Transfer  0.9 – 1.8 s
      // ─────────────────────────────────────────────────────────────────────
      else if (el < 1.8) {
        const t = C01((el-0.9)/0.9)
        mon.group.position.y = 0.3

        // Orb appears and charges
        if (t < 0.45) {
          const ot = C01(t/0.45); const oe = SS(ot)
          orbMat.opacity = oe * 0.92
          haloMat.opacity = oe * 0.55
          orbLight.intensity = oe * 5
          orbMesh.scale.setScalar(1 + Math.sin(el * 9) * 0.08)
          haloMesh.scale.setScalar(1 + Math.sin(el * 7) * 0.06)
          // Spawn charge particles around orb
          if (Math.random() < 0.4) spawnP(
            orbMesh.position.x+(Math.random()-0.5)*1.2,
            orbMesh.position.y+(Math.random()-0.5)*0.8,
            orbMesh.position.z+(Math.random()-0.5)*0.8, 0.8
          )
        }

        // Beam descends + impact
        if (t > 0.4 && t < 0.82) {
          const bt = C01((t-0.4)/0.42)
          beamMat.opacity = L(0, 0.8, SS(bt))
          orbLight.intensity = 5 + Math.sin(el*12)*1.5
        }

        // Impact + power-on
        if (t > 0.82) {
          const it = C01((t-0.82)/0.18)
          beamMat.opacity = L(0.8, 0, it)
          orbMat.opacity = L(0.92, 0, it)
          haloMat.opacity = L(0.55, 0, it)
          orbLight.intensity = L(6, 0, it)
          // Impact particle burst
          if (it < 0.3 && Math.random() < 0.8) {
            spawnP(0, 0.3, 0.5, 2.2)
          }
          // Chassis rim illuminates
          const rimChild = mon.group.children[1] as THREE.Mesh | undefined
          const rMat = rimChild?.material as THREE.MeshStandardMaterial | undefined
          if (rMat?.emissive) rMat.emissiveIntensity = L(0, 1.5, SS(it))
          mon.rimLight.intensity = L(0, 2.5, SS(it))
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 2: Screen Power-up  1.8 – 2.7 s
      // ─────────────────────────────────────────────────────────────────────
      else if (el < 2.7) {
        const t = C01((el-1.8)/0.9); const te = SS(t)

        // Apply screen-on texture once
        if (!screenOnApplied) {
          screenOnApplied = true
          const onTex = makeScreenOnTex()
          dis.textures.push(onTex)
          const sm = mon.screenMesh.material as THREE.MeshStandardMaterial
          sm.map = onTex; sm.needsUpdate = true
        }

        const sm = mon.screenMesh.material as THREE.MeshStandardMaterial
        sm.emissiveIntensity = L(0, 2.5, te)
        mon.screenLight.intensity = L(0, 5, te)
        backGlow.intensity = L(0.5, 3, te)

        // Screen energy particles radiate outward from screen surface
        if (Math.random() < 0.6) {
          const sx = (Math.random()-0.5)*5.2
          const sy = (Math.random()-0.5)*2.8
          spawnP(sx, sy+0.3, 0.8, 0.9)
        }

        // Chassis rim stays lit
        mon.rimLight.intensity = 2.5 + Math.sin(el*5)*0.4

        // Screen pulse flicker on boot
        if (t < 0.25) {
          sm.emissiveIntensity = Math.sin(el*35)*1.2
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 3: Camera Zoom into Screen  2.7 – 3.6 s
      // ─────────────────────────────────────────────────────────────────────
      else if (el < 3.6) {
        const t = C01((el-2.7)/0.9); const te = EIO(t)

        camera.position.z = L(18, 2.8, te)
        camera.position.y = L(0.4, 0.32, te)
        camera.fov = L(50, 36, te)
        camera.updateProjectionMatrix()
        camera.lookAt(0, 0.32, 0)

        const sm = mon.screenMesh.material as THREE.MeshStandardMaterial
        sm.emissiveIntensity = L(2.5, 4.0, te)
        mon.screenLight.intensity = L(5, 9, te)
        backGlow.intensity = L(3, 6, te)

        // Screen particles still flowing
        if (Math.random() < 0.45) spawnP((Math.random()-0.5)*4, (Math.random()-0.5)*2.4+0.3, 0.5, 0.7)
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 4: Portal Reveal  3.6 – 4.5 s
      // ─────────────────────────────────────────────────────────────────────
      else if (el < 4.5) {
        const t = C01((el-3.6)/0.9); const te = SS(t)

        // Camera fully into screen
        camera.position.z = 2.8 - t * 0.5
        camera.fov = 36

        // Portal rises from below
        port.group.position.y = L(-20, 0, SS(SS(t)))
        port.group.position.z = L(-6, -4.5, te)
        port.glowLight.intensity = L(0, 3, te)

        const lMat = (port.leftPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        const rMat = (port.rightPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        if (lMat) lMat.emissiveIntensity = L(0.5, 2.2, te)
        if (rMat) rMat.emissiveIntensity = L(0.5, 2.2, te)

        // Atmospheric portal particles
        if (Math.random() < 0.55) {
          spawnP((Math.random()-0.5)*3.5, -2.5+Math.random(), L(-6,-4,t), 0.6)
        }

        // Doors begin to open at t > 0.55
        if (t > 0.55) {
          const ot = C01((t-0.55)/0.45); const oe = EIO(ot)
          port.leftPivot.rotation.y = L(0, 1.48, oe)
          port.rightPivot.rotation.y = L(0, -1.48, oe)

          const vm = port.vortex.material as THREE.MeshBasicMaterial
          vm.opacity = L(0, 0.8, SS(ot))
          port.glowLight.intensity = L(3, 12, EO(ot))
        }

        backGlow.intensity = L(6, 12, te)
      }

      // ─────────────────────────────────────────────────────────────────────
      // PHASE 5: Zone Entry  4.5 – 5.2 s
      // ─────────────────────────────────────────────────────────────────────
      else {
        const t = C01((el-4.5)/0.7); const te = EO(t)

        port.leftPivot.rotation.y = 1.48
        port.rightPivot.rotation.y = -1.48

        camera.position.z = L(2.3, -3, te)
        camera.fov = L(36, 28, te)
        camera.updateProjectionMatrix()

        port.glowLight.intensity = L(12, 30, te)
        backGlow.intensity = L(12, 35, te)

        if (Math.random() < 0.7) spawnP((Math.random()-0.5)*2, (Math.random()-0.5)*4+0.5, L(-5,-2.5,t), 1.5)

        if (el >= 5.2) { doneRef.current = true; zoneReady(); return }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight, false)
    }
    window.addEventListener('resize', onResize)

    return () => {
      doneRef.current = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      dis.geometries.forEach(g=>g.dispose())
      dis.materials.forEach(m=>m.dispose())
      dis.textures.forEach(t=>t.dispose())
      renderer.dispose()
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 'var(--z-zone)' as unknown as number, background: '#030510' }}
      role="presentation"
      aria-label="Software Zone activation — monitor power-up and portal entry"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(3,5,16,0.75) 100%)' }}
        aria-hidden="true"
      />

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]"
        style={{
          color:          'rgba(150,180,255,0.82)',
          background:     'rgba(50,80,200,0.10)',
          border:         '1px solid rgba(100,140,255,0.32)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Skip Software activation cinematic"
      >
        SKIP &#10140;
      </button>

      <span className="sr-only" aria-live="polite">
        Software Zone activating — monitor powering up, portal opening...
      </span>
    </div>
  )
}
