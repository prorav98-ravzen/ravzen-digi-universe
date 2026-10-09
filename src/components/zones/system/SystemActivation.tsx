'use client'

/**
 * SystemActivation — Cinematic 3D Teleportation, Desktop Power-up & Portal.
 *
 * Full Three.js WebGL scene. Zero external assets. Procedural geometry only.
 * Architecture identical to DesignActivation / AndroidActivation / SoftwareActivation.
 *
 * ── Sequence (5.4 s total) ──────────────────────────────────────────────────
 *
 *  Phase 0 — Void & Card Energy  (0.0 – 0.9 s)
 *    Deep void background. The System card energy condenses into a blazing
 *    amber/gold energy shard that trails cyan-magenta light as it teleports
 *    across the scene — dimensional light streaks and particle wake.
 *
 *  Phase 1 — Desktop Reveal      (0.9 – 1.8 s)
 *    A futuristic 3D desktop computer setup materialises: wide monitor on a
 *    muscular tower, mechanical keyboard, ambient neon desk lamp.
 *    All components start dark / powered off.
 *
 *  Phase 2 — Power-up            (1.8 – 2.7 s)
 *    The teleported energy shard slams into the tower. Impact flash. The tower
 *    front panel illuminates progressively — fan grilles, drive bays, LEDs.
 *    Monitor screen powers on: boot code streams, concentric energy rings.
 *    Keyboard backlights ripple. CPU heat shimmer light flickers.
 *
 *  Phase 3 — Transformation      (2.7 – 3.7 s)
 *    Desktop morphs into a massive sci-fi portal. The monitor grows into the
 *    portal arch, the tower becomes a stone megalith pillar, keyboard melts
 *    into the floor seal. Ancient glyphs and circuit-runes ignite across the
 *    emerging door surface. Mechanical arms extend from the frame corners.
 *
 *  Phase 4 — Portal Opening      (3.7 – 4.6 s)
 *    The two vast doors swing open. A brilliant amber-cyan vortex blazes.
 *    Energy arcs discharge across the stone frame. Camera begins its dolly.
 *
 *  Phase 5 — Zone Entry          (4.6 – 5.4 s)
 *    Camera pushes through the open threshold. Blinding golden light fills
 *    the frame → zoneReady() fires.
 *
 * ── Performance ─────────────────────────────────────────────────────────────
 *   DPR capped at 1.25. Canvas 2D procedural textures. InstancedMesh particles.
 *   Full disposables cleanup. Skip button + reduced-motion fast path.
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Texture factories ─────────────────────────────────────────────────────────

function mkTex(
  w: number, h: number,
  fn: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  fn(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t
}

/** Dark brushed steel — tower chassis */
function mkTowerTex(): THREE.CanvasTexture {
  return mkTex(256, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 256, 512)
    g.addColorStop(0, '#0e1018'); g.addColorStop(0.6, '#141820'); g.addColorStop(1, '#0a0c14')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 512)
    // Horizontal brushing
    ctx.strokeStyle = 'rgba(120,140,200,0.04)'; ctx.lineWidth = 1
    for (let y = 0; y < 512; y += 3) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y); ctx.stroke() }
    // Edge rim
    ctx.strokeStyle = 'rgba(255,180,0,0.18)'; ctx.lineWidth = 2; ctx.strokeRect(1, 1, 254, 510)
    // Drive bay slots
    ctx.fillStyle = '#07090f'
    for (let i = 0; i < 4; i++) { ctx.fillRect(28, 60 + i * 55, 200, 36); ctx.strokeStyle = 'rgba(255,180,0,0.15)'; ctx.lineWidth = 1; ctx.strokeRect(28, 60 + i * 55, 200, 36) }
    // Front panel LED strip
    ctx.fillStyle = '#ffb800'; ctx.shadowColor = '#ffb800'; ctx.shadowBlur = 8
    ctx.fillRect(28, 320, 200, 5)
    // Fan grille (circle array)
    ctx.strokeStyle = 'rgba(255,180,0,0.12)'; ctx.lineWidth = 1.5; ctx.shadowBlur = 0
    for (let r = 8; r <= 40; r += 10) { ctx.beginPath(); ctx.arc(128, 420, r, 0, Math.PI * 2); ctx.stroke() }
    for (let a = 0; a < 8; a++) { const ang = (a / 8) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(128, 420); ctx.lineTo(128 + Math.cos(ang) * 40, 420 + Math.sin(ang) * 40); ctx.stroke() }
  })
}

/** Monitor chassis texture */
function mkMonitorTex(): THREE.CanvasTexture {
  return mkTex(512, 320, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 512, 320)
    g.addColorStop(0, '#0d0f1c'); g.addColorStop(1, '#070910')
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 320)
    // Scan lines
    ctx.strokeStyle = 'rgba(255,180,0,0.04)'; ctx.lineWidth = 1
    for (let y = 0; y < 320; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke() }
    // Boot code streams
    ctx.font = '10px monospace'; ctx.fillStyle = 'rgba(255,180,0,0.6)'; ctx.shadowColor = '#ffb800'; ctx.shadowBlur = 4
    const lines = ['> SYSTEM BOOT v3.2.1', '> CPU: 48-CORE RAVZEN-X', '> RAM: 512 GB HYPER', '> QUANTUM DRIVE ONLINE', '> INITIALISING...', '> PORTAL PROTOCOLS ACTIVE']
    lines.forEach((l, i) => ctx.fillText(l, 24, 55 + i * 30))
    // Concentric rings
    ctx.shadowColor = '#ffb800'; ctx.shadowBlur = 16
    ctx.strokeStyle = 'rgba(255,180,0,0.5)'; ctx.lineWidth = 1.5
    for (let r = 30; r <= 150; r += 30) { ctx.beginPath(); ctx.arc(420, 160, r, 0, Math.PI * 2); ctx.stroke() }
    // HUD corners
    ctx.strokeStyle = 'rgba(255,180,0,0.7)'; ctx.lineWidth = 2; ctx.shadowBlur = 8
    for (const [cx, cy, sx, sy] of [[20,16,1,1],[492,16,-1,1],[20,304,1,-1],[492,304,-1,-1]] as [number,number,number,number][]) {
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+sx*20,cy); ctx.moveTo(cx,cy); ctx.lineTo(cx,cy+sy*20); ctx.stroke()
    }
  })
}

/** Portal door stone with amber/gold runes */
function mkDoorTex(side: 'L' | 'R'): THREE.CanvasTexture {
  return mkTex(512, 1024, (ctx) => {
    ctx.fillStyle = '#080610'; ctx.fillRect(0, 0, 512, 1024)
    // Stone grain
    for (let i = 0; i < 3800; i++) {
      const x = Math.random() * 512; const y = Math.random() * 1024
      const v = 10 + Math.floor(Math.random() * 18)
      ctx.fillStyle = `rgb(${v+4},${v+2},${v})`; ctx.fillRect(x, y, 1+Math.random()*3, 1+Math.random()*3)
    }
    // Border frame
    ctx.fillStyle = '#130e00'; ctx.fillRect(0,0,512,52); ctx.fillRect(0,972,512,52)
    ctx.fillRect(side==='L'?460:0,0,52,1024)
    // Rivets
    ctx.fillStyle = '#3a2a00'
    for (let py=90; py<940; py+=100) { ctx.beginPath(); ctx.arc(side==='L'?486:26,py,7,0,Math.PI*2); ctx.fill() }
    // Gold rune column
    const rcx = side==='L'?190:322
    ctx.shadowColor='#ffb800'; ctx.shadowBlur=20; ctx.strokeStyle='rgba(255,184,0,0.9)'; ctx.lineWidth=4
    for (let ry=110; ry<960; ry+=128) {
      // Diamond rune
      ctx.beginPath(); ctx.moveTo(rcx,ry); ctx.lineTo(rcx+28,ry+44); ctx.lineTo(rcx,ry+88); ctx.lineTo(rcx-28,ry+44); ctx.closePath(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(rcx-14,ry+44); ctx.lineTo(rcx+14,ry+44); ctx.moveTo(rcx,ry+22); ctx.lineTo(rcx,ry+66); ctx.stroke()
    }
    // Central glyph
    ctx.shadowColor='#ff6b35'; ctx.shadowBlur=28; ctx.strokeStyle='rgba(255,107,53,0.88)'; ctx.lineWidth=3.5
    const gx=rcx; const gy=512
    ctx.beginPath(); ctx.arc(gx,gy,62,0,Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.arc(gx,gy,30,0,Math.PI*2); ctx.stroke()
    // Eight-point star
    for (let k=0;k<8;k++) {
      const a=(Math.PI/4)*k; ctx.beginPath()
      ctx.moveTo(gx+Math.cos(a)*30,gy+Math.sin(a)*30); ctx.lineTo(gx+Math.cos(a+Math.PI)*62,gy+Math.sin(a+Math.PI)*62); ctx.stroke()
    }
    // Cyan circuit traces
    ctx.shadowColor='#00d4ff'; ctx.shadowBlur=14; ctx.strokeStyle='rgba(0,212,255,0.45)'; ctx.lineWidth=2
    for (let by=200; by<900; by+=200) { ctx.beginPath(); ctx.moveTo(24,by); ctx.lineTo(488,by); ctx.stroke() }
    // Mechanical arm corners
    ctx.strokeStyle='rgba(255,184,0,0.55)'; ctx.lineWidth=3; ctx.shadowColor='#ffb800'; ctx.shadowBlur=10
    for (const [ax,ay,sx,sy] of [[24,80,1,1],[488,80,-1,1],[24,944,1,-1],[488,944,-1,-1]] as [number,number,number,number][]) {
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ax+sx*44,ay); ctx.lineTo(ax+sx*44,ay+sy*28); ctx.stroke()
    }
  })
}

/** Vortex center — amber/cyan swirl */
function mkVortexTex(): THREE.CanvasTexture {
  return mkTex(512, 512, (ctx) => {
    ctx.fillStyle='#000'; ctx.fillRect(0,0,512,512)
    const rg = ctx.createRadialGradient(256,256,0,256,256,256)
    rg.addColorStop(0,'rgba(255,255,255,1)')
    rg.addColorStop(0.06,'rgba(255,220,80,0.98)')
    rg.addColorStop(0.18,'rgba(255,130,0,0.8)')
    rg.addColorStop(0.38,'rgba(0,200,255,0.5)')
    rg.addColorStop(0.65,'rgba(180,50,255,0.25)')
    rg.addColorStop(1,'rgba(0,0,0,0)')
    ctx.fillStyle=rg; ctx.fillRect(0,0,512,512)
    ctx.strokeStyle='rgba(255,200,0,0.35)'; ctx.lineWidth=1.8
    for (let arm=0;arm<6;arm++) {
      ctx.beginPath(); const sa=(arm/6)*Math.PI*2
      for (let i=0;i<=80;i++) { const t=i/80; const r=t*220; const a=sa+t*Math.PI*4; const x=256+Math.cos(a)*r; const y=256+Math.sin(a)*r; if(i===0)ctx.moveTo(x,y); else ctx.lineTo(x,y) }
      ctx.stroke()
    }
  })
}

/** Keyboard top texture */
function mkKeyboardTex(): THREE.CanvasTexture {
  return mkTex(256, 128, (ctx) => {
    ctx.fillStyle='#0a0c10'; ctx.fillRect(0,0,256,128)
    ctx.fillStyle='#141820'; ctx.strokeStyle='rgba(255,180,0,0.15)'; ctx.lineWidth=0.8
    // Key grid
    for (let row=0;row<4;row++) for (let col=0;col<12;col++) {
      const kx=8+col*20; const ky=16+row*24
      ctx.fillRect(kx,ky,18,20); ctx.strokeRect(kx,ky,18,20)
    }
    // LED strip backlight
    ctx.fillStyle='rgba(255,180,0,0.0)'; ctx.shadowColor='#ffb800'; ctx.shadowBlur=12
    ctx.fillRect(8,110,240,4)
  })
}

// ── Desktop 3D builder ────────────────────────────────────────────────────────

interface DesktopParts {
  group:       THREE.Group
  tower:       THREE.Mesh
  monitor:     THREE.Mesh
  screenMesh:  THREE.Mesh
  keyboard:    THREE.Mesh
  towerLight:  THREE.PointLight
  screenLight: THREE.PointLight
  geometries:  THREE.BufferGeometry[]
  materials:   THREE.Material[]
  textures:    THREE.Texture[]
}

function buildDesktop(): DesktopParts {
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []

  const towerTex   = mkTowerTex();   textures.push(towerTex)
  const monitorTex = mkMonitorTex(); textures.push(monitorTex)
  const kbTex      = mkKeyboardTex(); textures.push(kbTex)

  const towerMat = new THREE.MeshStandardMaterial({ map: towerTex, color: 0xd8e0ff, metalness: 0.9, roughness: 0.25 })
  materials.push(towerMat)
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x0c101c, metalness: 0.95, roughness: 0.22 })
  materials.push(chassisMat)
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x05070e, metalness: 0.9, roughness: 0.35 })
  materials.push(darkMat)
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xffb800, emissive: new THREE.Color(0xff8800), emissiveIntensity: 0, metalness: 0.6, roughness: 0.3 })
  materials.push(accentMat)
  const monitorMat = new THREE.MeshStandardMaterial({ color: 0xc0ccee, metalness: 0.88, roughness: 0.28 })
  materials.push(monitorMat)
  const screenMat = new THREE.MeshStandardMaterial({ map: monitorTex, emissive: new THREE.Color(0x100800), emissiveIntensity: 0, roughness: 0.05, metalness: 0 })
  materials.push(screenMat)
  const kbMat = new THREE.MeshStandardMaterial({ map: kbTex, color: 0xb0b8cc, metalness: 0.85, roughness: 0.32 })
  materials.push(kbMat)

  const group = new THREE.Group()

  // ── Tower (left side) ──────────────────────────────────────────────────────
  const towerGeo = new THREE.BoxGeometry(1.6, 4.4, 1.8)
  geometries.push(towerGeo)
  const tower = new THREE.Mesh(towerGeo, towerMat)
  tower.position.set(-3.6, 0, 0)
  group.add(tower)

  // Tower accent strips
  for (const y of [1.8, 0.8, -0.2]) {
    const sg = new THREE.BoxGeometry(1.62, 0.07, 1.82)
    geometries.push(sg); const s = new THREE.Mesh(sg, accentMat)
    s.position.set(-3.6, y, 0); group.add(s)
  }
  // Tower top
  const topGeo = new THREE.BoxGeometry(1.5, 0.12, 1.7)
  geometries.push(topGeo); const top = new THREE.Mesh(topGeo, chassisMat)
  top.position.set(-3.6, 2.26, 0); group.add(top)

  // Tower light
  const towerLight = new THREE.PointLight(0xffb800, 0, 6)
  towerLight.position.set(-3.6, 0, 1.2); group.add(towerLight)

  // ── Monitor ────────────────────────────────────────────────────────────────
  const monBodyGeo = new THREE.BoxGeometry(6.0, 3.4, 0.28)
  geometries.push(monBodyGeo)
  const monitor = new THREE.Mesh(monBodyGeo, monitorMat)
  monitor.position.set(0.8, 0.6, 0); group.add(monitor)

  // Monitor rim strips
  for (const [x, w, h, py] of [
    [0.8, 6.02, 0.07, 2.335], [0.8, 6.02, 0.07, -1.135],
    [-2.69, 0.07, 3.4, 0.6],  [4.29, 0.07, 3.4, 0.6],
  ] as [number,number,number,number][]) {
    const rg = new THREE.BoxGeometry(w, h, 0.32)
    geometries.push(rg); const rm = new THREE.Mesh(rg, accentMat)
    rm.position.set(x, py, 0); group.add(rm)
  }

  // Screen
  const screenGeo = new THREE.PlaneGeometry(5.6, 3.0)
  geometries.push(screenGeo)
  const screenMesh = new THREE.Mesh(screenGeo, screenMat)
  screenMesh.position.set(0.8, 0.62, 0.15); group.add(screenMesh)

  // Monitor neck
  const neckGeo = new THREE.BoxGeometry(0.48, 1.1, 0.36)
  geometries.push(neckGeo); const neck = new THREE.Mesh(neckGeo, chassisMat)
  neck.position.set(0.8, -1.18, 0); group.add(neck)

  // Monitor base
  const baseGeo = new THREE.BoxGeometry(2.2, 0.18, 0.8)
  geometries.push(baseGeo); const base = new THREE.Mesh(baseGeo, darkMat)
  base.position.set(0.8, -1.8, 0.12); group.add(base)

  // Screen light
  const screenLight = new THREE.PointLight(0xffb800, 0, 8)
  screenLight.position.set(0.8, 0.6, 1.5); group.add(screenLight)

  // ── Keyboard ───────────────────────────────────────────────────────────────
  const kbGeo = new THREE.BoxGeometry(4.2, 0.18, 1.5)
  geometries.push(kbGeo)
  const keyboard = new THREE.Mesh(kbGeo, kbMat)
  keyboard.position.set(0.8, -2.1, 1.2); group.add(keyboard)

  // Keyboard bevel
  const kbTopGeo = new THREE.PlaneGeometry(4.2, 1.5)
  geometries.push(kbTopGeo); const kbTop = new THREE.Mesh(kbTopGeo, kbMat)
  kbTop.rotation.x = -Math.PI / 2; kbTop.position.set(0.8, -2.01, 1.2); group.add(kbTop)

  // ── Desk surface ───────────────────────────────────────────────────────────
  const deskGeo = new THREE.BoxGeometry(14, 0.14, 4)
  geometries.push(deskGeo)
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, metalness: 0.4, roughness: 0.8 })
  materials.push(deskMat)
  const desk = new THREE.Mesh(deskGeo, deskMat)
  desk.position.set(0, -2.24, 0.5); group.add(desk)

  // Start hidden
  group.visible = false; group.scale.set(0.01, 0.01, 0.01)

  return { group, tower, monitor, screenMesh, keyboard, towerLight, screenLight, geometries, materials, textures }
}

// ── Portal builder ────────────────────────────────────────────────────────────

interface PortalParts {
  group:      THREE.Group
  leftPivot:  THREE.Group
  rightPivot: THREE.Group
  vortex:     THREE.Mesh
  glowLight:  THREE.PointLight
  geometries: THREE.BufferGeometry[]
  materials:  THREE.Material[]
  textures:   THREE.Texture[]
}

function buildPortal(): PortalParts {
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  const group = new THREE.Group()

  const lTex = mkDoorTex('L'); textures.push(lTex)
  const rTex = mkDoorTex('R'); textures.push(rTex)
  const vTex = mkVortexTex(); textures.push(vTex)

  const lMat = new THREE.MeshStandardMaterial({ map: lTex, metalness: 0.6, roughness: 0.52, emissive: new THREE.Color(0x100800), emissiveIntensity: 0.5 })
  materials.push(lMat)
  const rMat = new THREE.MeshStandardMaterial({ map: rTex, metalness: 0.6, roughness: 0.52, emissive: new THREE.Color(0x100800), emissiveIntensity: 0.5 })
  materials.push(rMat)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c0800, metalness: 0.9, roughness: 0.28 })
  materials.push(frameMat)
  const vortexMat = new THREE.MeshBasicMaterial({ map: vTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
  materials.push(vortexMat)
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffb800 })
  materials.push(edgeMat)

  // Lintel
  const lintelGeo = new THREE.BoxGeometry(5.6, 0.6, 0.82)
  geometries.push(lintelGeo); const lintel = new THREE.Mesh(lintelGeo, frameMat)
  lintel.position.set(0, 4.35, 0); group.add(lintel)

  // Pillars
  for (const sx of [-2.5, 2.5]) {
    const pg = new THREE.BoxGeometry(0.68, 9.3, 0.82)
    geometries.push(pg); const pm = new THREE.Mesh(pg, frameMat)
    pm.position.set(sx, 0, 0); group.add(pm)
  }

  // Inner edge glow strips
  for (const [x, w, h, y] of [[-2.16,0.06,9.3,0],[2.16,0.06,9.3,0],[0,5.6,0.06,4.0]] as [number,number,number,number][]) {
    const eg = new THREE.BoxGeometry(w, h, 0.06); geometries.push(eg)
    const em = new THREE.Mesh(eg, edgeMat); em.position.set(x, y, 0.42); group.add(em)
  }

  // Door pivots
  const leftPivot = new THREE.Group(); leftPivot.position.set(-2.16, 0, 0.41)
  const rightPivot = new THREE.Group(); rightPivot.position.set(2.16, 0, 0.41)
  group.add(leftPivot, rightPivot)

  const dlGeo = new THREE.BoxGeometry(4.22, 9.0, 0.17); geometries.push(dlGeo)
  const dL = new THREE.Mesh(dlGeo, lMat); dL.position.set(-2.11, 0, 0); leftPivot.add(dL)

  const drGeo = new THREE.BoxGeometry(4.22, 9.0, 0.17); geometries.push(drGeo)
  const dR = new THREE.Mesh(drGeo, rMat); dR.position.set(2.11, 0, 0); rightPivot.add(dR)

  // Vortex plane
  const vGeo = new THREE.PlaneGeometry(4.3, 8.9); geometries.push(vGeo)
  const vortex = new THREE.Mesh(vGeo, vortexMat); vortex.position.set(0, 0, -0.08); group.add(vortex)

  // Mechanical arm corners (L-brackets on frame)
  for (const [ax, ay] of [[-2.5,4.1],[2.5,4.1],[-2.5,-4.5],[2.5,-4.5]] as [number,number][]) {
    const ag = new THREE.BoxGeometry(0.4, 0.12, 0.55); geometries.push(ag)
    const am = new THREE.Mesh(ag, edgeMat); am.position.set(ax, ay, 0.52); group.add(am)
  }

  const glowLight = new THREE.PointLight(0xffb800, 0, 16)
  glowLight.position.set(0, 0, 1.5); group.add(glowLight)

  // Start below floor
  group.position.set(0, -18, -7); group.scale.set(0.85, 0.85, 0.85)

  return { group, leftPivot, rightPivot, vortex, glowLight, geometries, materials, textures }
}

// ── Particle state ────────────────────────────────────────────────────────────

const MAX_P = 200
interface PSt { active: boolean; x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; ml: number; sz: number }

// ── Component ─────────────────────────────────────────────────────────────────

export default function SystemActivation() {
  const { zoneReady } = useExperience()
  const reduced       = useReducedMotion()
  const canvasRef     = useRef<HTMLCanvasElement | null>(null)
  const doneRef       = useRef(false)

  useEffect(() => { if (!reduced) return; zoneReady() }, [reduced, zoneReady])
  const handleSkip = useCallback(() => { doneRef.current = true; zoneReady() }, [zoneReady])

  useEffect(() => {
    if (reduced) return
    doneRef.current = false
    const canvas = canvasRef.current; if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'high-performance' })
    } catch { zoneReady(); return }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    renderer.setPixelRatio(dpr); renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.35

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02030a)
    scene.fog = new THREE.FogExp2(0x02030a, 0.028)

    const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 120)
    camera.position.set(0, 0.5, 18); camera.lookAt(0, 0, 0)

    // Lights
    const ambient = new THREE.AmbientLight(0x182030, 0.5); scene.add(ambient)
    const key = new THREE.DirectionalLight(0xaabbff, 1.8); key.position.set(6, 10, 10); scene.add(key)
    const rim = new THREE.DirectionalLight(0xcc6600, 1.4); rim.position.set(-8, 3, -5); scene.add(rim)
    const fill = new THREE.DirectionalLight(0x002244, 0.7); fill.position.set(0, -8, 4); scene.add(fill)
    const backGlow = new THREE.PointLight(0xffb800, 0, 22); backGlow.position.set(0, 2, -10); scene.add(backGlow)
    const teleportLight = new THREE.PointLight(0xffcc44, 0, 10); scene.add(teleportLight)

    // Disposables
    const dis = { geometries: [] as THREE.BufferGeometry[], materials: [] as THREE.Material[], textures: [] as THREE.Texture[] }

    // ── Star field ────────────────────────────────────────────────────────────
    const stGeo = new THREE.BufferGeometry(); dis.geometries.push(stGeo)
    const stPos = new Float32Array(280 * 3)
    for (let i = 0; i < 280; i++) {
      stPos[i*3] = (Math.random()-0.5)*65; stPos[i*3+1] = (Math.random()-0.5)*38; stPos[i*3+2] = (Math.random()-0.5)*28 - 8
    }
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3))
    const stMat = new THREE.PointsMaterial({ color: 0x334466, size: 0.1, transparent: true, opacity: 0.55, depthWrite: false })
    dis.materials.push(stMat); scene.add(new THREE.Points(stGeo, stMat))

    // ── Energy shard (teleporting object) ─────────────────────────────────────
    const shardGeo = new THREE.OctahedronGeometry(0.42, 1)
    dis.geometries.push(shardGeo)
    const shardMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0 })
    dis.materials.push(shardMat)
    const shard = new THREE.Mesh(shardGeo, shardMat)
    shard.position.set(-8, 4, 6); scene.add(shard)

    // Shard corona
    const coronaGeo = new THREE.SphereGeometry(0.72, 12, 8)
    dis.geometries.push(coronaGeo)
    const coronaMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true, opacity: 0, side: THREE.BackSide })
    dis.materials.push(coronaMat)
    const corona = new THREE.Mesh(coronaGeo, coronaMat); corona.position.copy(shard.position); scene.add(corona)

    // Light trail (tapered cylinder representing motion streak)
    const trailGeo = new THREE.CylinderGeometry(0.02, 0.14, 6, 8, 1, true)
    dis.geometries.push(trailGeo)
    const trailMat = new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0, side: THREE.DoubleSide })
    dis.materials.push(trailMat)
    const trail = new THREE.Mesh(trailGeo, trailMat); scene.add(trail)

    // ── Desktop ───────────────────────────────────────────────────────────────
    const desk = buildDesktop(); scene.add(desk.group)
    dis.geometries.push(...desk.geometries); dis.materials.push(...desk.materials); dis.textures.push(...desk.textures)

    // ── Portal ────────────────────────────────────────────────────────────────
    const port = buildPortal(); scene.add(port.group)
    dis.geometries.push(...port.geometries); dis.materials.push(...port.materials); dis.textures.push(...port.textures)

    // ── Particle system ───────────────────────────────────────────────────────
    const pGeo = new THREE.SphereGeometry(1, 5, 4); dis.geometries.push(pGeo)
    const pMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    dis.materials.push(pMat)
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_P); pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(pMesh)
    const zero4 = new THREE.Matrix4().makeScale(0,0,0)
    for (let i=0;i<MAX_P;i++) pMesh.setMatrixAt(i,zero4); pMesh.instanceMatrix.needsUpdate=true
    const pArr: PSt[] = Array.from({length:MAX_P},()=>({active:false,x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0,ml:1,sz:0.06}))
    let nextP=0; const pm4=new THREE.Matrix4()
    function spawnP(x:number,y:number,z:number,spd=1.2) {
      const p=pArr[nextP]; nextP=(nextP+1)%MAX_P
      p.active=true; p.x=x; p.y=y; p.z=z
      const θ=Math.random()*Math.PI*2; const φ=Math.random()*Math.PI
      p.vx=Math.sin(φ)*Math.cos(θ)*spd; p.vy=Math.sin(φ)*Math.sin(θ)*spd; p.vz=Math.cos(φ)*spd
      p.life=0; p.ml=0.6+Math.random()*0.9; p.sz=0.03+Math.random()*0.08
    }

    // Helpers
    function L(a:number,b:number,t:number){return a+(b-a)*t}
    function C(t:number){return Math.max(0,Math.min(1,t))}
    function SS(t:number){return t*t*(3-2*t)}
    function EO(t:number,p=2){return 1-Math.pow(1-t,p)}
    function EIO(t:number){return t<0.5?2*t*t:1-(-2*t+2)**2/2}

    // Animation
    let animId: number; let t0=performance.now(); let lastT=t0; let vis=true
    function onVis(){vis=document.visibilityState==='visible';if(vis){t0+=performance.now()-lastT;lastT=performance.now()}}
    document.addEventListener('visibilitychange',onVis)

    let deskScreenOnDone=false

    function animate(now: number) {
      animId=requestAnimationFrame(animate)
      if(!vis||doneRef.current) return
      const el=(now-t0)/1000; const dt=Math.min((now-lastT)/1000,0.04); lastT=now

      // Particle tick
      let pDirty=false
      for(let i=0;i<MAX_P;i++){
        const p=pArr[i]; if(!p.active)continue; p.life+=dt
        if(p.life>=p.ml){p.active=false;pMesh.setMatrixAt(i,zero4);pDirty=true;continue}
        p.x+=p.vx*dt; p.y+=p.vy*dt; p.z+=p.vz*dt; p.vy-=0.3*dt
        const f=1-p.life/p.ml; pm4.makeScale(p.sz*f,p.sz*f,p.sz*f); pm4.setPosition(p.x,p.y,p.z)
        pMesh.setMatrixAt(i,pm4); pDirty=true
      }
      if(pDirty) pMesh.instanceMatrix.needsUpdate=true

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 0 — Void & Card Energy   0.0 – 0.9 s
      // ═══════════════════════════════════════════════════════════════════════
      if(el<0.9){
        const t=C(el/0.9); const te=SS(t)
        ambient.intensity=L(0,0.5,te)
        // Shard appears and streaks across scene
        shardMat.opacity=L(0,0.95,SS(C(el/0.5)))
        coronaMat.opacity=L(0,0.55,SS(C(el/0.5)))
        shard.rotation.y=el*6; shard.rotation.z=el*4
        shard.scale.setScalar(1+Math.sin(el*10)*0.08)
        // Move from top-left to centre-right (toward tower position)
        shard.position.set(L(-8,-3.6,SS(te)),L(4,0,SS(te)),L(6,1.5,SS(te)))
        corona.position.copy(shard.position)
        teleportLight.position.copy(shard.position); teleportLight.intensity=L(0,4,SS(C(el/0.5)))
        // Trail behind shard
        trail.position.set(shard.position.x-0.6,shard.position.y,shard.position.z)
        trail.rotation.z=Math.PI/2+0.4; trailMat.opacity=L(0,0.5,te)*0.7
        // Wake particles
        if(t>0.15&&Math.random()<0.5) spawnP(shard.position.x+(Math.random()-0.5)*0.4,shard.position.y+(Math.random()-0.5)*0.3,shard.position.z+(Math.random()-0.5)*0.3,0.7)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 1 — Desktop Reveal   0.9 – 1.8 s
      // ═══════════════════════════════════════════════════════════════════════
      else if(el<1.8){
        const t=C((el-0.9)/0.9); const te=SS(t)
        // Shard circles the tower
        shard.position.set(L(-3.6,-3.6,t),L(0,2.5,SS(C(t*2))),L(1.5,1.5,t))
        corona.position.copy(shard.position); teleportLight.position.copy(shard.position)
        teleportLight.intensity=L(4,2,te)
        // Desktop materialises
        desk.group.visible=true
        desk.group.scale.setScalar(L(0.01,1,SS(t)))
        desk.group.position.y=L(-1.5,0,SS(t))
        ambient.intensity=L(0.5,0.8,te)
        backGlow.intensity=L(0,0.8,te)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 2 — Power-up   1.8 – 2.7 s
      // ═══════════════════════════════════════════════════════════════════════
      else if(el<2.7){
        const t=C((el-1.8)/0.9); const te=SS(t)
        // Shard slams into tower at t=0
        if(t<0.15){
          const it=C(t/0.15)
          shard.position.set(L(-3.6,-3.6,it),L(2.5,0,EO(it,3)),L(1.5,0.9,it))
          corona.position.copy(shard.position); shardMat.opacity=L(0.95,0,it); coronaMat.opacity=L(0.55,0,it)
          trailMat.opacity=L(0.35,0,it); teleportLight.intensity=L(2,8,it<0.5?it*2:2-it*2)
          if(it<0.4&&Math.random()<0.9) spawnP(-3.6+(Math.random()-0.5)*0.5,0.5+(Math.random()-0.5)*0.5,1+Math.random()*0.5,2.5)
        } else {
          shardMat.opacity=0; coronaMat.opacity=0; trailMat.opacity=0; teleportLight.intensity=0
        }
        // Tower powers on
        const accentM = desk.tower.material as THREE.MeshStandardMaterial
        ;(accentM as THREE.MeshStandardMaterial).emissiveIntensity = L(0, 0.4, SS(C((t-0.1)/0.6)))
        desk.towerLight.intensity=L(0,3.5,SS(C((t-0.15)/0.6)))
        // Screen powers on with flicker then stable
        if(!deskScreenOnDone&&t>0.35){
          deskScreenOnDone=true
          const sm=desk.screenMesh.material as THREE.MeshStandardMaterial
          sm.emissiveIntensity=Math.sin(el*28)*1.5 // boot flicker handled by initial pulse
        }
        const smt=desk.screenMesh.material as THREE.MeshStandardMaterial
        if(t<0.5){ smt.emissiveIntensity=Math.sin(el*30)*1.2+0.3 }
        else { smt.emissiveIntensity=L(0.3,3.5,SS(C((t-0.5)/0.5))) }
        desk.screenLight.intensity=L(0,5.5,SS(C((t-0.35)/0.55)))
        // Screen-surface particles radiate
        if(t>0.4&&Math.random()<0.6) spawnP(0.8+(Math.random()-0.5)*5.5,0.6+(Math.random()-0.5)*2.8,0.6,0.8)
        backGlow.intensity=L(0.8,2.5,te)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 3 — Transformation   2.7 – 3.7 s
      // ═══════════════════════════════════════════════════════════════════════
      else if(el<3.7){
        const t=C((el-2.7)/1.0); const te=SS(t)
        // Desktop fades and dissolves as portal rises
        desk.group.scale.setScalar(L(1,0.88,te))
        desk.group.position.y=L(0,-0.6,te)
        const sm=desk.screenMesh.material as THREE.MeshStandardMaterial
        sm.emissiveIntensity=L(3.5,0,te)
        desk.towerLight.intensity=L(3.5,0,te)
        desk.screenLight.intensity=L(5.5,0,te)
        // Dissolve particles burst from desktop
        if(t<0.5&&Math.random()<0.65) {
          spawnP((Math.random()-0.5)*8,L(-2.2,0,t)+Math.random()*2.5,(Math.random()-0.5)*2,1.2)
        }
        // Portal rises simultaneously
        port.group.position.y=L(-18,0,SS(SS(t)))
        port.group.position.z=L(-7,-5,te)
        port.glowLight.intensity=L(0,3,te)
        const lMat=(port.leftPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        const rMat=(port.rightPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        if(lMat) lMat.emissiveIntensity=L(0.5,2.5,te)
        if(rMat) rMat.emissiveIntensity=L(0.5,2.5,te)
        backGlow.intensity=L(2.5,5,te)
        // Atmospheric rise particles
        if(Math.random()<0.5) spawnP((Math.random()-0.5)*4,-2.5+Math.random()*0.5,L(-7,-5,t)+Math.random(),0.6)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 4 — Portal Opening   3.7 – 4.6 s
      // ═══════════════════════════════════════════════════════════════════════
      else if(el<4.6){
        const t=C((el-3.7)/0.9); const te=SS(t)
        // Desktop fully gone
        desk.group.visible=(t<0.15)
        // Doors swing open
        if(t>0.12){
          const ot=C((t-0.12)/0.72); const oe=EIO(ot)
          port.leftPivot.rotation.y=L(0,1.50,oe)
          port.rightPivot.rotation.y=L(0,-1.50,oe)
          const vm=port.vortex.material as THREE.MeshBasicMaterial
          vm.opacity=L(0,0.85,SS(ot))
          port.glowLight.intensity=L(3,14,EO(ot))
        }
        // Camera starts approaching
        if(t>0.55){
          const ct=C((t-0.55)/0.45); const ce=EIO(ct)
          camera.position.z=L(18,3.5,ce); camera.position.y=L(0.5,0.4,ce)
          camera.fov=L(52,40,ce); camera.updateProjectionMatrix()
          camera.lookAt(0,0.4,-3)
        }
        backGlow.intensity=L(5,12,te)
        if(Math.random()<0.55) spawnP((Math.random()-0.5)*3,(Math.random()-0.5)*5,L(-5,-4,t),1.0)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 5 — Zone Entry   4.6 – 5.4 s
      // ═══════════════════════════════════════════════════════════════════════
      else {
        const t=C((el-4.6)/0.8); const te=EO(t)
        port.leftPivot.rotation.y=1.50; port.rightPivot.rotation.y=-1.50
        camera.position.z=L(3.5,-2.5,te); camera.position.y=L(0.4,0.3,te)
        camera.fov=L(40,30,te); camera.updateProjectionMatrix()
        camera.lookAt(0,0.3,-6)
        port.glowLight.intensity=L(14,32,te)
        backGlow.intensity=L(12,36,te)
        if(Math.random()<0.7) spawnP((Math.random()-0.5)*2,(Math.random()-0.5)*4,L(-4,-2,t),1.6)
        if(el>=5.4){doneRef.current=true;zoneReady();return}
      }

      renderer.render(scene,camera)
    }
    animId=requestAnimationFrame(animate)

    function onResize(){
      camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth,window.innerHeight,false)
    }
    window.addEventListener('resize',onResize)

    return ()=>{
      doneRef.current=true; cancelAnimationFrame(animId)
      window.removeEventListener('resize',onResize)
      document.removeEventListener('visibilitychange',onVis)
      dis.geometries.forEach(g=>g.dispose()); dis.materials.forEach(m=>m.dispose()); dis.textures.forEach(t=>t.dispose())
      renderer.dispose()
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 'var(--z-zone)' as unknown as number, background: '#02030a' }}
      role="presentation"
      aria-label="System Zone activation — card teleportation, desktop power-up and portal entry"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />

      {/* Edge vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(2,3,10,0.78) 100%)' }}
        aria-hidden="true"
      />

      {/* Skip button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]"
        style={{
          color:          'rgba(255,200,80,0.82)',
          background:     'rgba(200,120,0,0.10)',
          border:         '1px solid rgba(255,180,0,0.32)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Skip System activation cinematic"
      >
        SKIP &#10140;
      </button>

      <span className="sr-only" aria-live="polite">
        System Zone activating — card teleporting, desktop powering up, portal opening...
      </span>
    </div>
  )
}
