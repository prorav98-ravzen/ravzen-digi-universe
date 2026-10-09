'use client'

/**
 * AndroidActivation — Cinematic 3D Android Awakening & Portal Sequence.
 *
 * Full Three.js WebGL scene, zero external assets, procedural geometry only.
 * Follows the same architecture as DesignActivation.tsx.
 *
 * ── Sequence (5.0 s total) ──────────────────────────────────────────────────
 *  Phase 0 — Environment boot         (0.0 s – 0.8 s)
 *    Dark void + teal nebula fades in. Scan-line grid rises from floor.
 *    Energy transfer column materialises from above.
 *
 *  Phase 1 — Android Materialisation  (0.8 s – 1.8 s)
 *    Full-body humanoid android assembles piece-by-piece from glowing energy.
 *    Detailed PBR: metallic chassis, articulated joints, glowing chest reactor.
 *
 *  Phase 2 — Awakening                (1.8 s – 2.8 s)
 *    Chest reactor illuminates, eye visors ignite cyan, arm energy circuits
 *    ripple with electricity. Particle burst radiates outward.
 *    Energy column transfers into the robot — sparks fly.
 *
 *  Phase 3 — Approach & Portal Rise   (2.8 s – 3.8 s)
 *    Robot steps forward. Massive ancient sci-fi portal door rises from floor.
 *    Carvings and runes glow progressively. Robot raises one arm.
 *
 *  Phase 4 — Portal Activation        (3.8 s – 4.5 s)
 *    Robot hand contacts door surface — energy ripple spreads across glyphs.
 *    Enormous doors swing open, revealing blinding cyan light. Camera dolly.
 *    zoneReady() fires.
 *
 * ── Performance ─────────────────────────────────────────────────────────────
 *   DPR capped at 1.25 (1.0 on mobile). Procedural textures via Canvas 2D.
 *   Particle system: InstancedMesh for zero draw-call overhead.
 *   All geometries/materials tracked in `disposables` — zero leaks.
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Procedural texture helpers ────────────────────────────────────────────────

function makeTex(
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.minFilter = THREE.LinearFilter
  return t
}

/** Brushed carbon-steel plate for android body panels */
function makeArmorTex(): THREE.CanvasTexture {
  return makeTex(256, 256, (ctx) => {
    // Dark metallic base
    const grd = ctx.createLinearGradient(0, 0, 256, 256)
    grd.addColorStop(0, '#0d1627')
    grd.addColorStop(0.5, '#142038')
    grd.addColorStop(1, '#0a111e')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 256, 256)

    // Micro-brushed steel lines
    ctx.strokeStyle = 'rgba(100,160,220,0.06)'
    ctx.lineWidth = 1
    for (let y = 0; y < 256; y += 3) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(256, y + (Math.random() - 0.5) * 2); ctx.stroke()
    }

    // Subtle edge bevel
    ctx.strokeStyle = 'rgba(0,220,255,0.18)'
    ctx.lineWidth = 2
    ctx.strokeRect(2, 2, 252, 252)

    // Circuit trace accents
    ctx.strokeStyle = 'rgba(0,200,255,0.12)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20, 128); ctx.lineTo(80, 128); ctx.lineTo(80, 80); ctx.lineTo(160, 80)
    ctx.moveTo(20, 150); ctx.lineTo(60, 150); ctx.lineTo(60, 200); ctx.lineTo(140, 200)
    ctx.stroke()
  })
}

/** Glowing cyan energy panel for chest reactor */
function makeReactorTex(): THREE.CanvasTexture {
  return makeTex(256, 256, (ctx) => {
    ctx.fillStyle = '#020c18'
    ctx.fillRect(0, 0, 256, 256)

    // Concentric hex rings
    ctx.strokeStyle = 'rgba(0,230,255,0.7)'
    ctx.lineWidth = 3
    for (let r = 20; r < 120; r += 22) {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const x = 128 + r * Math.cos(a); const y = 128 + r * Math.sin(a)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.closePath(); ctx.stroke()
    }

    // Core radial glow
    const rg = ctx.createRadialGradient(128, 128, 0, 128, 128, 120)
    rg.addColorStop(0, 'rgba(0,255,220,0.95)')
    rg.addColorStop(0.35, 'rgba(0,180,255,0.6)')
    rg.addColorStop(1, 'rgba(0,100,200,0)')
    ctx.fillStyle = rg
    ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill()
  })
}

/** Ancient sci-fi portal door stone with runes */
function makeDoorTex(side: 'left' | 'right'): THREE.CanvasTexture {
  return makeTex(512, 1024, (ctx) => {
    // Dark stone base
    ctx.fillStyle = '#080a14'
    ctx.fillRect(0, 0, 512, 1024)

    // Stone grain
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512; const y = Math.random() * 1024
      const v = 12 + Math.floor(Math.random() * 20)
      ctx.fillStyle = `rgb(${v}, ${v + 2}, ${v + 8})`
      ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3)
    }

    // Metal border frame
    ctx.fillStyle = '#1a1430'
    ctx.fillRect(0, 0, 512, 48)
    ctx.fillRect(0, 976, 512, 48)
    ctx.fillRect(side === 'left' ? 468 : 0, 0, 44, 1024)

    // Border rivets
    ctx.fillStyle = '#362858'
    for (let py = 80; py < 950; py += 88) {
      ctx.beginPath()
      ctx.arc(side === 'left' ? 490 : 22, py, 7, 0, Math.PI * 2)
      ctx.fill()
    }

    // Glowing rune carvings
    ctx.shadowColor = '#00d4ff'
    ctx.shadowBlur = 18
    ctx.strokeStyle = 'rgba(0,210,255,0.85)'
    ctx.lineWidth = 4

    const cx = side === 'left' ? 200 : 312

    // Vertical rune column
    for (let ry = 100; ry < 950; ry += 120) {
      ctx.beginPath()
      // Diamond rune
      ctx.moveTo(cx, ry); ctx.lineTo(cx + 28, ry + 40)
      ctx.lineTo(cx, ry + 80); ctx.lineTo(cx - 28, ry + 40)
      ctx.closePath(); ctx.stroke()
      // Inner cross
      ctx.beginPath()
      ctx.moveTo(cx - 14, ry + 40); ctx.lineTo(cx + 14, ry + 40)
      ctx.moveTo(cx, ry + 26); ctx.lineTo(cx, ry + 54)
      ctx.stroke()
    }

    // Horizontal tech bands
    ctx.shadowBlur = 10
    ctx.strokeStyle = 'rgba(80,0,255,0.55)'
    ctx.lineWidth = 2
    for (let by = 200; by < 900; by += 200) {
      ctx.beginPath(); ctx.moveTo(20, by); ctx.lineTo(492, by); ctx.stroke()
    }

    // Glyph cluster (mid-panel)
    ctx.shadowColor = '#b04dff'
    ctx.shadowBlur = 24
    ctx.strokeStyle = 'rgba(176,77,255,0.9)'
    ctx.lineWidth = 3
    const gx = cx; const gy = 512
    ctx.beginPath()
    ctx.arc(gx, gy, 55, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(gx - 40, gy - 40); ctx.lineTo(gx + 40, gy + 40)
    ctx.moveTo(gx + 40, gy - 40); ctx.lineTo(gx - 40, gy + 40)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(gx, gy, 25, 0, Math.PI * 2); ctx.stroke()
  })
}

/** Eye visor texture */
function makeEyeTex(): THREE.CanvasTexture {
  return makeTex(128, 64, (ctx) => {
    ctx.fillStyle = '#000a14'
    ctx.fillRect(0, 0, 128, 64)

    const rg = ctx.createRadialGradient(64, 32, 2, 64, 32, 48)
    rg.addColorStop(0, '#ffffff')
    rg.addColorStop(0.2, '#00f0ff')
    rg.addColorStop(0.6, '#0066cc')
    rg.addColorStop(1, 'rgba(0,50,100,0)')
    ctx.fillStyle = rg
    ctx.beginPath()
    ctx.ellipse(64, 32, 48, 24, 0, 0, Math.PI * 2)
    ctx.fill()
  })
}

// ── Android Robot Builder ─────────────────────────────────────────────────────

interface AndroidParts {
  group:          THREE.Group
  // Animated parts
  torso:          THREE.Mesh
  headGroup:      THREE.Group
  leftArm:        THREE.Group
  rightArm:       THREE.Group
  leftLeg:        THREE.Group
  rightLeg:       THREE.Group
  reactor:        THREE.Mesh
  reactorLight:   THREE.PointLight
  eyeL:           THREE.Mesh
  eyeR:           THREE.Mesh
  eyeLight:       THREE.PointLight
  // Disposables
  geometries:     THREE.BufferGeometry[]
  materials:      THREE.Material[]
  textures:       THREE.Texture[]
}

function buildAndroid(): AndroidParts {
  const geometries: THREE.BufferGeometry[] = []
  const materials:  THREE.Material[]       = []
  const textures:   THREE.Texture[]        = []

  const armorTex   = makeArmorTex();   textures.push(armorTex)
  const reactorTex = makeReactorTex(); textures.push(reactorTex)
  const eyeTex     = makeEyeTex();     textures.push(eyeTex)

  // Shared materials
  const armorMat = new THREE.MeshStandardMaterial({
    map:       armorTex,
    color:     0xd0e0ff,
    metalness: 0.88,
    roughness: 0.28,
  })
  materials.push(armorMat)

  const darkMat = new THREE.MeshStandardMaterial({
    color:     0x060d1a,
    metalness: 0.95,
    roughness: 0.20,
  })
  materials.push(darkMat)

  const jointMat = new THREE.MeshStandardMaterial({
    color:     0x3a4a6a,
    metalness: 0.92,
    roughness: 0.32,
  })
  materials.push(jointMat)

  const reactorMat = new THREE.MeshStandardMaterial({
    map:              reactorTex,
    emissive:         new THREE.Color(0x00d4ff),
    emissiveIntensity: 0.0,  // starts dark, animated
    roughness:         0.1,
    metalness:         0.3,
  })
  materials.push(reactorMat)

  const eyeMat = new THREE.MeshStandardMaterial({
    map:              eyeTex,
    emissive:         new THREE.Color(0x00c8ff),
    emissiveIntensity: 0.0,  // starts dark, animated
    roughness:         0.05,
    metalness:         0.0,
  })
  materials.push(eyeMat)

  const accentMat = new THREE.MeshStandardMaterial({
    color:             0x00aaff,
    emissive:          new THREE.Color(0x0066cc),
    emissiveIntensity: 0.0,
    metalness:         0.7,
    roughness:         0.2,
  })
  materials.push(accentMat)

  const group = new THREE.Group()

  // ── TORSO ──────────────────────────────────────────────────────────────────
  const torsoGeo = new THREE.BoxGeometry(1.4, 1.8, 0.72, 2, 2, 1)
  geometries.push(torsoGeo)
  const torso = new THREE.Mesh(torsoGeo, armorMat)
  torso.position.y = 0
  group.add(torso)

  // Chest reactor housing (hexagonal prism approximation via cylinder)
  const reactorHousingGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 6)
  geometries.push(reactorHousingGeo)
  const reactorHousing = new THREE.Mesh(reactorHousingGeo, darkMat)
  reactorHousing.rotation.y = Math.PI / 6
  reactorHousing.position.set(0, 0.1, 0.37)
  group.add(reactorHousing)

  // Reactor core disc
  const reactorGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.08, 6)
  geometries.push(reactorGeo)
  const reactor = new THREE.Mesh(reactorGeo, reactorMat)
  reactor.rotation.y = Math.PI / 6
  reactor.position.set(0, 0.1, 0.42)
  group.add(reactor)

  // Reactor point light (starts dim)
  const reactorLight = new THREE.PointLight(0x00d4ff, 0, 5)
  reactorLight.position.set(0, 0.1, 0.6)
  group.add(reactorLight)

  // Shoulder pauldrons
  for (const side of [-1, 1]) {
    const pGeo = new THREE.BoxGeometry(0.44, 0.36, 0.64)
    geometries.push(pGeo)
    const p = new THREE.Mesh(pGeo, armorMat)
    p.position.set(side * 0.92, 0.82, 0)
    group.add(p)
  }

  // Torso detail strips (accent lines)
  for (let i = 0; i < 3; i++) {
    const stripGeo = new THREE.BoxGeometry(1.1, 0.06, 0.76)
    geometries.push(stripGeo)
    const strip = new THREE.Mesh(stripGeo, accentMat)
    strip.position.set(0, -0.4 + i * 0.38, 0)
    group.add(strip)
  }

  // ── HEAD ───────────────────────────────────────────────────────────────────
  const headGroup = new THREE.Group()
  headGroup.position.set(0, 1.28, 0)
  group.add(headGroup)

  const headGeo = new THREE.BoxGeometry(0.9, 0.78, 0.72, 2, 2, 1)
  geometries.push(headGeo)
  const head = new THREE.Mesh(headGeo, armorMat)
  headGroup.add(head)

  // Visor panel
  const visorGeo = new THREE.BoxGeometry(0.72, 0.22, 0.04)
  geometries.push(visorGeo)
  const visorPanel = new THREE.Mesh(visorGeo, darkMat)
  visorPanel.position.set(0, 0.05, 0.37)
  headGroup.add(visorPanel)

  // Eyes (emissive lenses)
  const eyeGeo = new THREE.BoxGeometry(0.24, 0.14, 0.04)
  geometries.push(eyeGeo)

  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(-0.22, 0.05, 0.38)
  headGroup.add(eyeL)

  const eyeR = new THREE.Mesh(eyeGeo, eyeMat.clone() as THREE.MeshStandardMaterial)
  eyeR.position.set(0.22, 0.05, 0.38)
  headGroup.add(eyeR)
  materials.push(eyeR.material as THREE.Material)

  // Eye light (shared)
  const eyeLight = new THREE.PointLight(0x00d4ff, 0, 3)
  eyeLight.position.set(0, 0.05, 0.5)
  headGroup.add(eyeLight)

  // Chin accent stripe
  const chinGeo = new THREE.BoxGeometry(0.55, 0.08, 0.78)
  geometries.push(chinGeo)
  const chin = new THREE.Mesh(chinGeo, accentMat)
  chin.position.set(0, -0.30, 0)
  headGroup.add(chin)

  // Antenna
  const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8)
  geometries.push(antGeo)
  const ant = new THREE.Mesh(antGeo, darkMat)
  ant.position.set(0, 0.65, 0)
  headGroup.add(ant)

  const antOrbGeo = new THREE.SphereGeometry(0.055, 10, 10)
  geometries.push(antOrbGeo)
  const antOrb = new THREE.Mesh(antOrbGeo, accentMat)
  antOrb.position.set(0, 0.92, 0)
  headGroup.add(antOrb)

  // Neck connector
  const neckGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.24, 12)
  geometries.push(neckGeo)
  const neck = new THREE.Mesh(neckGeo, jointMat)
  neck.position.set(0, -0.51, 0)
  headGroup.add(neck)

  // ── ARMS ───────────────────────────────────────────────────────────────────
  function buildArm(side: -1 | 1): THREE.Group {
    const armGroup = new THREE.Group()

    // Upper arm
    const upperGeo = new THREE.BoxGeometry(0.32, 0.88, 0.32)
    geometries.push(upperGeo)
    const upper = new THREE.Mesh(upperGeo, armorMat)
    upper.position.y = -0.44
    armGroup.add(upper)

    // Elbow joint
    const elbowGeo = new THREE.SphereGeometry(0.17, 10, 8)
    geometries.push(elbowGeo)
    const elbow = new THREE.Mesh(elbowGeo, jointMat)
    elbow.position.y = -0.92
    armGroup.add(elbow)

    // Forearm
    const foreGeo = new THREE.BoxGeometry(0.27, 0.74, 0.27)
    geometries.push(foreGeo)
    const fore = new THREE.Mesh(foreGeo, armorMat)
    fore.position.y = -1.40
    armGroup.add(fore)

    // Hand / fist block
    const handGeo = new THREE.BoxGeometry(0.30, 0.26, 0.30)
    geometries.push(handGeo)
    const hand = new THREE.Mesh(handGeo, darkMat)
    hand.position.y = -1.84
    armGroup.add(hand)

    // Forearm energy stripe
    const stripeGeo = new THREE.BoxGeometry(0.3, 0.08, 0.3)
    geometries.push(stripeGeo)
    const stripe = new THREE.Mesh(stripeGeo, accentMat)
    stripe.position.y = -1.18
    armGroup.add(stripe)

    // Shoulder sphere joint
    const shoulderGeo = new THREE.SphereGeometry(0.2, 10, 8)
    geometries.push(shoulderGeo)
    const shoulder = new THREE.Mesh(shoulderGeo, jointMat)
    shoulder.position.y = 0
    armGroup.add(shoulder)

    armGroup.position.set(side * 0.86, 0.76, 0)
    return armGroup
  }

  const leftArm  = buildArm(-1)
  const rightArm = buildArm(1)
  group.add(leftArm, rightArm)

  // ── LEGS ───────────────────────────────────────────────────────────────────
  function buildLeg(side: -1 | 1): THREE.Group {
    const legGroup = new THREE.Group()

    // Hip joint
    const hipGeo = new THREE.SphereGeometry(0.22, 10, 8)
    geometries.push(hipGeo)
    const hip = new THREE.Mesh(hipGeo, jointMat)
    legGroup.add(hip)

    // Thigh
    const thighGeo = new THREE.BoxGeometry(0.42, 0.96, 0.40)
    geometries.push(thighGeo)
    const thigh = new THREE.Mesh(thighGeo, armorMat)
    thigh.position.y = -0.58
    legGroup.add(thigh)

    // Knee joint
    const kneeGeo = new THREE.SphereGeometry(0.18, 10, 8)
    geometries.push(kneeGeo)
    const knee = new THREE.Mesh(kneeGeo, jointMat)
    knee.position.y = -1.10
    legGroup.add(knee)

    // Shin
    const shinGeo = new THREE.BoxGeometry(0.36, 0.84, 0.36)
    geometries.push(shinGeo)
    const shin = new THREE.Mesh(shinGeo, armorMat)
    shin.position.y = -1.62
    legGroup.add(shin)

    // Ankle
    const ankleGeo = new THREE.SphereGeometry(0.14, 10, 8)
    geometries.push(ankleGeo)
    const ankle = new THREE.Mesh(ankleGeo, jointMat)
    ankle.position.y = -2.08
    legGroup.add(ankle)

    // Boot
    const bootGeo = new THREE.BoxGeometry(0.44, 0.26, 0.58)
    geometries.push(bootGeo)
    const boot = new THREE.Mesh(bootGeo, darkMat)
    boot.position.set(0.04 * side, -2.30, 0.10)
    legGroup.add(boot)

    // Shin accent
    const sAccentGeo = new THREE.BoxGeometry(0.38, 0.10, 0.38)
    geometries.push(sAccentGeo)
    const sAccent = new THREE.Mesh(sAccentGeo, accentMat)
    sAccent.position.y = -1.32
    legGroup.add(sAccent)

    legGroup.position.set(side * 0.42, -1.12, 0)
    return legGroup
  }

  const leftLeg  = buildLeg(-1)
  const rightLeg = buildLeg(1)
  group.add(leftLeg, rightLeg)

  // Initial state: invisible (assembled via animation)
  group.visible = false
  group.scale.set(0.01, 0.01, 0.01)

  return {
    group, torso, headGroup, leftArm, rightArm, leftLeg, rightLeg,
    reactor, reactorLight, eyeL, eyeR, eyeLight,
    geometries, materials, textures,
  }
}

// ── Portal Door Builder ───────────────────────────────────────────────────────

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
  const materials:  THREE.Material[]       = []
  const textures:   THREE.Texture[]        = []

  const group = new THREE.Group()

  const leftDoorTex  = makeDoorTex('left');  textures.push(leftDoorTex)
  const rightDoorTex = makeDoorTex('right'); textures.push(rightDoorTex)

  const leftDoorMat = new THREE.MeshStandardMaterial({
    map:       leftDoorTex,
    metalness: 0.6,
    roughness: 0.55,
    emissive:  new THREE.Color(0x001133),
    emissiveIntensity: 0.4,
  })
  materials.push(leftDoorMat)

  const rightDoorMat = new THREE.MeshStandardMaterial({
    map:       rightDoorTex,
    metalness: 0.6,
    roughness: 0.55,
    emissive:  new THREE.Color(0x001133),
    emissiveIntensity: 0.4,
  })
  materials.push(rightDoorMat)

  const frameMat = new THREE.MeshStandardMaterial({
    color:    0x1a1240,
    metalness: 0.9,
    roughness: 0.22,
    emissive:  new THREE.Color(0x000c28),
  })
  materials.push(frameMat)

  const glowMat = new THREE.MeshBasicMaterial({
    color:       0x00d4ff,
    transparent: true,
    opacity:     0.0,
    side:        THREE.FrontSide,
  })
  materials.push(glowMat)

  const archMat = new THREE.MeshStandardMaterial({
    color:     0x0a0820,
    metalness: 0.85,
    roughness: 0.30,
    emissive:  new THREE.Color(0x050414),
  })
  materials.push(archMat)

  // ── Arch frame (top + sides) ───────────────────────────────────────────────
  // Top lintel
  const lintelGeo = new THREE.BoxGeometry(5.6, 0.65, 0.85)
  geometries.push(lintelGeo)
  const lintel = new THREE.Mesh(lintelGeo, archMat)
  lintel.position.set(0, 4.55, 0)
  group.add(lintel)

  // Pillar left
  const pillarGeo = new THREE.BoxGeometry(0.72, 9.5, 0.85)
  geometries.push(pillarGeo)
  const pillarL = new THREE.Mesh(pillarGeo, archMat)
  pillarL.position.set(-2.58, 0, 0)
  group.add(pillarL)

  // Pillar right
  const pillarR = pillarL.clone()
  pillarR.position.set(2.58, 0, 0)
  group.add(pillarR)

  // ── Glowing frame edge strips ─────────────────────────────────────────────
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0x0044aa })
  materials.push(edgeMat)

  for (const [x, w, h, y] of [
    [-2.22, 0.06, 9.5, 0],  // left inner edge
    [ 2.22, 0.06, 9.5, 0],  // right inner edge
    [0, 5.6, 0.06, 4.22],  // top inner edge
  ] as [number, number, number, number][]) {
    const eg = new THREE.BoxGeometry(w, h, 0.06)
    geometries.push(eg)
    const em = new THREE.Mesh(eg, edgeMat)
    em.position.set(x, y, 0.43)
    group.add(em)
  }

  // ── Door leaves with hinged pivots ────────────────────────────────────────
  const leftPivot = new THREE.Group()
  leftPivot.position.set(-2.22, 0, 0.42)
  group.add(leftPivot)

  const rightPivot = new THREE.Group()
  rightPivot.position.set(2.22, 0, 0.42)
  group.add(rightPivot)

  const doorGeoL = new THREE.BoxGeometry(4.3, 9.3, 0.18)
  geometries.push(doorGeoL)
  const doorL = new THREE.Mesh(doorGeoL, leftDoorMat)
  doorL.position.set(-2.15, 0, 0)   // pivot at right edge
  leftPivot.add(doorL)

  const doorGeoR = new THREE.BoxGeometry(4.3, 9.3, 0.18)
  geometries.push(doorGeoR)
  const doorR = new THREE.Mesh(doorGeoR, rightDoorMat)
  doorR.position.set(2.15, 0, 0)   // pivot at left edge
  rightPivot.add(doorR)

  // ── Portal vortex (revealed when doors open) ──────────────────────────────
  const vortexGeo = new THREE.PlaneGeometry(4.4, 9.2)
  geometries.push(vortexGeo)
  const vortex = new THREE.Mesh(vortexGeo, glowMat)
  vortex.position.set(0, 0, -0.1)
  group.add(vortex)

  // Portal glow light
  const glowLight = new THREE.PointLight(0x00c0ff, 0, 12)
  glowLight.position.set(0, 0, 1)
  group.add(glowLight)

  // Start below floor
  group.position.set(0, -15, -6)

  return { group, leftPivot, rightPivot, vortex, glowLight, geometries, materials, textures }
}

// ── Energy Particle System ────────────────────────────────────────────────────

const MAX_PARTICLES = 200

interface ParticleState {
  active: boolean
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  life: number; maxLife: number
  size: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AndroidActivation() {
  const { zoneReady }  = useExperience()
  const reduced        = useReducedMotion()
  const canvasRef      = useRef<HTMLCanvasElement | null>(null)
  const terminatedRef  = useRef(false)

  // Reduced-motion fast path
  useEffect(() => {
    if (!reduced) return
    zoneReady()
  }, [reduced, zoneReady])

  const handleSkip = useCallback(() => {
    terminatedRef.current = true
    zoneReady()
  }, [zoneReady])

  // ── Full 3D cinematic path ────────────────────────────────────────────────
  useEffect(() => {
    if (reduced) return
    terminatedRef.current = false

    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ──────────────────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha:            false,
        antialias:        true,
        powerPreference:  'high-performance',
      })
    } catch {
      zoneReady(); return
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.shadowMap.enabled = false
    renderer.toneMapping       = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020810)
    scene.fog = new THREE.FogExp2(0x020810, 0.038)

    const camera = new THREE.PerspectiveCamera(
      52, window.innerWidth / window.innerHeight, 0.1, 120
    )
    camera.position.set(0, 1.2, 14)
    camera.lookAt(0, 0.5, 0)

    // ── Global lights ─────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x203050, 0.6)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0x88aaff, 1.8)
    keyLight.position.set(5, 10, 8)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x0088ff, 1.4)
    rimLight.position.set(-8, 4, -6)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0x004466, 0.8)
    fillLight.position.set(0, -6, 5)
    scene.add(fillLight)

    // Cinematic cyan backlight
    const backLight = new THREE.PointLight(0x00d4ff, 0.0, 20)
    backLight.position.set(0, 2, -8)
    scene.add(backLight)

    // ── Scene disposables tracker ─────────────────────────────────────────────
    const disposables = {
      geometries: [] as THREE.BufferGeometry[],
      materials:  [] as THREE.Material[],
      textures:   [] as THREE.Texture[],
    }

    // ── Floor grid ────────────────────────────────────────────────────────────
    const gridTex = makeTex(512, 512, (ctx) => {
      ctx.fillStyle = '#020810'
      ctx.fillRect(0, 0, 512, 512)
      ctx.strokeStyle = 'rgba(0, 100, 220, 0.35)'
      ctx.lineWidth = 1
      for (let i = 0; i <= 512; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke()
      }
      // Glow cross at centre
      ctx.strokeStyle = 'rgba(0, 180, 255, 0.8)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(256, 0); ctx.lineTo(256, 512); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, 256); ctx.lineTo(512, 256); ctx.stroke()
    })
    disposables.textures.push(gridTex)

    const floorGeo = new THREE.PlaneGeometry(30, 30)
    disposables.geometries.push(floorGeo)
    const floorMat = new THREE.MeshStandardMaterial({
      map:       gridTex,
      metalness: 0.3,
      roughness: 0.75,
    })
    disposables.materials.push(floorMat)
    const floor = new THREE.Mesh(floorGeo, floorMat)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -3.45
    scene.add(floor)

    // ── Energy transfer column ────────────────────────────────────────────────
    const columnGeo = new THREE.CylinderGeometry(0.06, 0.06, 14, 12, 1, true)
    disposables.geometries.push(columnGeo)
    const columnMat = new THREE.MeshBasicMaterial({
      color:       0x00c8ff,
      transparent: true,
      opacity:     0,
      side:        THREE.DoubleSide,
    })
    disposables.materials.push(columnMat)
    const column = new THREE.Mesh(columnGeo, columnMat)
    column.position.set(0, 3.5, 0)
    scene.add(column)

    // Column outer glow halo
    const haloGeo = new THREE.CylinderGeometry(0.22, 0.22, 14, 12, 1, true)
    disposables.geometries.push(haloGeo)
    const haloMat = new THREE.MeshBasicMaterial({
      color:       0x0066cc,
      transparent: true,
      opacity:     0,
      side:        THREE.DoubleSide,
    })
    disposables.materials.push(haloMat)
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.copy(column.position)
    scene.add(halo)

    // Column top orb
    const orbGeo = new THREE.SphereGeometry(0.28, 14, 10)
    disposables.geometries.push(orbGeo)
    const orbMat = new THREE.MeshBasicMaterial({
      color:       0x00f0ff,
      transparent: true,
      opacity:     0,
    })
    disposables.materials.push(orbMat)
    const orb = new THREE.Mesh(orbGeo, orbMat)
    orb.position.set(0, 10.5, 0)
    scene.add(orb)

    const orbLight = new THREE.PointLight(0x00d4ff, 0, 8)
    orbLight.position.copy(orb.position)
    scene.add(orbLight)

    // ── Android robot ─────────────────────────────────────────────────────────
    const android = buildAndroid()
    android.group.position.set(0, -0.1, 0)
    scene.add(android.group)
    // Transfer all android disposables
    disposables.geometries.push(...android.geometries)
    disposables.materials.push(...android.materials)
    disposables.textures.push(...android.textures)

    // ── Portal door ───────────────────────────────────────────────────────────
    const portal = buildPortal()
    scene.add(portal.group)
    disposables.geometries.push(...portal.geometries)
    disposables.materials.push(...portal.materials)
    disposables.textures.push(...portal.textures)

    // ── Particle system (InstancedMesh) ───────────────────────────────────────
    const pGeo = new THREE.SphereGeometry(1, 6, 5)
    disposables.geometries.push(pGeo)
    const pMat = new THREE.MeshBasicMaterial({
      color:       0x00d4ff,
      transparent: true,
      opacity:     0.8,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })
    disposables.materials.push(pMat)
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_PARTICLES)
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(pMesh)

    const zeroM4 = new THREE.Matrix4().makeScale(0, 0, 0)
    for (let i = 0; i < MAX_PARTICLES; i++) pMesh.setMatrixAt(i, zeroM4)
    pMesh.instanceMatrix.needsUpdate = true

    const particles: ParticleState[] = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false, x: 0, y: 0, z: 0,
      vx: 0, vy: 0, vz: 0,
      life: 0, maxLife: 1, size: 0.05,
    }))
    let nextP = 0
    const pMat4 = new THREE.Matrix4()
    const pScale = new THREE.Vector3()

    function spawnParticle(x: number, y: number, z: number, speed = 0.8) {
      const p = particles[nextP]
      nextP = (nextP + 1) % MAX_PARTICLES
      p.active = true; p.x = x; p.y = y; p.z = z
      const θ = Math.random() * Math.PI * 2
      const φ = Math.random() * Math.PI
      p.vx = Math.sin(φ) * Math.cos(θ) * speed
      p.vy = Math.sin(φ) * Math.sin(θ) * speed
      p.vz = Math.cos(φ) * speed
      p.life = 0; p.maxLife = 0.8 + Math.random() * 0.8
      p.size = 0.04 + Math.random() * 0.08
    }

    // ── Background nebula particles ───────────────────────────────────────────
    const nebGeo = new THREE.BufferGeometry()
    const nebCount = 260
    const nebPos = new Float32Array(nebCount * 3)
    for (let i = 0; i < nebCount; i++) {
      nebPos[i * 3]     = (Math.random() - 0.5) * 40
      nebPos[i * 3 + 1] = (Math.random() - 0.5) * 20
      nebPos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5
    }
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPos, 3))
    disposables.geometries.push(nebGeo)
    const nebMat = new THREE.PointsMaterial({
      color:       0x004488,
      size:        0.12,
      transparent: true,
      opacity:     0.5,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    })
    disposables.materials.push(nebMat)
    const nebula = new THREE.Points(nebGeo, nebMat)
    scene.add(nebula)

    // ── Animation loop ────────────────────────────────────────────────────────
    let animId: number
    let startTime = performance.now()
    let lastTime  = startTime
    let isVisible = true

    function onVisChange() {
      isVisible = document.visibilityState === 'visible'
      if (isVisible) { startTime += performance.now() - lastTime; lastTime = performance.now() }
    }
    document.addEventListener('visibilitychange', onVisChange)

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
    function clamp01(t: number) { return Math.max(0, Math.min(1, t)) }
    function smoothstep(t: number) { return t * t * (3 - 2 * t) }
    function easeOut(t: number, p = 2) { return 1 - Math.pow(1 - t, p) }
    function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2 }

    function animate(now: number) {
      animId = requestAnimationFrame(animate)
      if (!isVisible || terminatedRef.current) return

      const elapsed = (now - startTime) / 1000
      const dt = Math.min((now - lastTime) / 1000, 0.04)
      lastTime = now

      // ── Nebula drift ────────────────────────────────────────────────────────
      nebula.rotation.y = elapsed * 0.015
      nebula.rotation.x = Math.sin(elapsed * 0.05) * 0.04

      // ── Particle simulation ─────────────────────────────────────────────────
      let pDirty = false
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particles[i]
        if (!p.active) continue
        p.life += dt
        if (p.life >= p.maxLife) { p.active = false; pMesh.setMatrixAt(i, zeroM4); pDirty = true; continue }
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt
        p.vy -= 0.4 * dt  // gravity
        const fade = 1 - p.life / p.maxLife
        pScale.set(p.size * fade, p.size * fade, p.size * fade)
        pMat4.makeScale(p.size * fade, p.size * fade, p.size * fade)
        pMat4.setPosition(p.x, p.y, p.z)
        pMesh.setMatrixAt(i, pMat4)
        pDirty = true
      }
      if (pDirty) pMesh.instanceMatrix.needsUpdate = true

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 0: Environment Boot  (0.0 – 0.8 s)
      // ═══════════════════════════════════════════════════════════════════════
      if (elapsed < 0.8) {
        const t = clamp01(elapsed / 0.8)
        const te = smoothstep(t)

        // Fade in background lighting
        ambient.intensity = lerp(0, 0.6, te)
        backLight.intensity = lerp(0, 0.4, te)

        // Energy column starts appearing at 0.3 s
        if (elapsed > 0.3) {
          const ct = clamp01((elapsed - 0.3) / 0.5)
          const ce = smoothstep(ct)
          columnMat.opacity = ce * 0.7
          haloMat.opacity   = ce * 0.25
          orbMat.opacity    = ce * 0.9
          orbLight.intensity = ce * 4
        }

        // Slow orb pulse
        const pulse = Math.sin(elapsed * 6) * 0.05
        orb.scale.setScalar(1 + pulse)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 1: Android Materialisation  (0.8 – 1.8 s)
      // ═══════════════════════════════════════════════════════════════════════
      else if (elapsed < 1.8) {
        const t = clamp01((elapsed - 0.8) / 1.0)
        const te = easeOut(t)

        // Column stays visible + pulses
        columnMat.opacity = 0.7 + Math.sin(elapsed * 8) * 0.12
        haloMat.opacity   = 0.25 + Math.sin(elapsed * 6) * 0.08
        orbLight.intensity = 4 + Math.sin(elapsed * 10) * 1.5

        // Android assembles: scale up from particle cloud
        android.group.visible = true
        const s = smoothstep(t)
        android.group.scale.setScalar(lerp(0.01, 1, s))
        android.group.position.y = lerp(-2, -0.1, smoothstep(t))

        // Spawn materialisation particles
        if (t < 0.85 && Math.random() < 0.55) {
          const spread = 1.2 * (1 - t)
          spawnParticle(
            (Math.random() - 0.5) * spread * 2,
            -0.1 + Math.random() * 3.5 * t,
            (Math.random() - 0.5) * spread,
            0.6
          )
        }

        // Dramatic key light ramp
        keyLight.intensity = lerp(1.8, 3.2, te)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 2: Awakening  (1.8 – 2.8 s)
      // ═══════════════════════════════════════════════════════════════════════
      else if (elapsed < 2.8) {
        const t = clamp01((elapsed - 1.8) / 1.0)
        const te = smoothstep(t)

        android.group.scale.setScalar(1)

        // Energy column merges into robot chest
        const colFade = 1 - te
        columnMat.opacity = colFade * 0.7
        haloMat.opacity   = colFade * 0.25
        orbMat.opacity    = colFade
        orbLight.intensity = colFade * 4

        // Reactor illuminates
        const reactorMat = android.reactor.material as THREE.MeshStandardMaterial
        reactorMat.emissiveIntensity = lerp(0, 3.5, smoothstep(clamp01((t - 0.1) / 0.5)))
        android.reactorLight.intensity = lerp(0, 6, smoothstep(clamp01((t - 0.15) / 0.5)))

        // Eyes light up (staggered)
        const eyeMat  = android.eyeL.material as THREE.MeshStandardMaterial
        const eyeMat2 = android.eyeR.material as THREE.MeshStandardMaterial
        const eyeT = clamp01((t - 0.25) / 0.45)
        eyeMat.emissiveIntensity  = lerp(0, 4.0, smoothstep(eyeT))
        eyeMat2.emissiveIntensity = lerp(0, 4.0, smoothstep(clamp01((t - 0.32) / 0.45)))
        android.eyeLight.intensity = lerp(0, 3.5, smoothstep(eyeT))

        // Accent glow ramp
        android.group.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial
            if (mat.emissive && mat.emissive.r < 0.5) {
              mat.emissiveIntensity = lerp(0, 0.8, te)
            }
          }
        })

        // Back light swells as robot activates
        backLight.intensity = lerp(0.4, 3.5, te)

        // Awakening particle burst
        if (t > 0.15 && t < 0.75 && Math.random() < 0.65) {
          const θ = Math.random() * Math.PI * 2
          const r = 0.3 + Math.random() * 0.8
          spawnParticle(
            Math.cos(θ) * r,
            0.1 + Math.random() * 2.2,
            Math.sin(θ) * r,
            1.4
          )
        }

        // Subtle head look-around
        android.headGroup.rotation.y = Math.sin(elapsed * 3.5) * 0.18
        android.headGroup.rotation.x = Math.sin(elapsed * 2.2) * 0.06

        // Breathing idle
        android.torso.scale.y = 1 + Math.sin(elapsed * 2.8) * 0.018
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 3: Portal Rise & Approach  (2.8 – 3.8 s)
      // ═══════════════════════════════════════════════════════════════════════
      else if (elapsed < 3.8) {
        const t = clamp01((elapsed - 2.8) / 1.0)
        const te = smoothstep(t)

        // Column fully gone
        columnMat.opacity = 0; haloMat.opacity = 0; orbMat.opacity = 0; orbLight.intensity = 0

        // Reactor keeps pulsing
        const reactorMat = android.reactor.material as THREE.MeshStandardMaterial
        reactorMat.emissiveIntensity = 3.5 + Math.sin(elapsed * 8) * 0.8
        android.reactorLight.intensity = 6 + Math.sin(elapsed * 6) * 1.2

        // Portal rises from floor with cinematic slowdown
        const portalY = lerp(-15, 0, smoothstep(smoothstep(t)))
        portal.group.position.y = portalY

        // Portal ambient ramp
        portal.glowLight.intensity = lerp(0, 4, te)

        // Android steps forward (approaches door)
        android.group.position.z = lerp(0, 2.2, smoothstep(clamp01((t - 0.3) / 0.7)))

        // Walk animation (leg swing)
        if (t > 0.3) {
          const wt = (elapsed - 3.1) * 4
          android.leftLeg.rotation.x  = Math.sin(wt) * 0.38
          android.rightLeg.rotation.x = Math.sin(wt + Math.PI) * 0.38
          android.leftArm.rotation.x  = Math.sin(wt + Math.PI) * 0.22
          android.rightArm.rotation.x = Math.sin(wt) * 0.22
          // Slight body bob
          android.group.position.y = -0.1 + Math.abs(Math.sin(wt * 2)) * 0.06
        }

        // Right arm starts raising toward door
        if (t > 0.75) {
          const raiseT = clamp01((t - 0.75) / 0.25)
          android.rightArm.rotation.x = lerp(android.rightArm.rotation.x, -1.05, smoothstep(raiseT))
        }

        // Head looks toward portal
        android.headGroup.rotation.y = lerp(0, 0.0, te)
        android.headGroup.rotation.x = lerp(0, 0.12, te)

        // Door emissive ramps up
        const lMat = (portal.leftPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        const rMat = (portal.rightPivot.children[0] as THREE.Mesh)?.material as THREE.MeshStandardMaterial
        if (lMat) lMat.emissiveIntensity = lerp(0.4, 1.8, te)
        if (rMat) rMat.emissiveIntensity = lerp(0.4, 1.8, te)

        // Atmospheric particles rising from ground near portal
        if (Math.random() < 0.5) {
          spawnParticle(
            (Math.random() - 0.5) * 3.5,
            -3 + Math.random() * 0.5,
            -3 + Math.random() * 1.5,
            0.5
          )
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 4: Portal Activation & Zone Entry  (3.8 – 5.0 s)
      // ═══════════════════════════════════════════════════════════════════════
      else {
        const t = clamp01((elapsed - 3.8) / 1.2)
        const te = smoothstep(t)

        // Android arm fully raised, body tilted forward
        android.rightArm.rotation.x = -1.05
        android.group.position.z = lerp(2.2, 2.8, smoothstep(clamp01(t * 2)))

        // Contact flash at 0.1 s into phase
        if (t > 0.1 && t < 0.45) {
          const ct = clamp01((t - 0.1) / 0.35)
          // Burst particles from contact point
          if (Math.random() < 0.75) {
            spawnParticle(
              (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 3.5 + 1,
              -4 + Math.random() * 0.5,
              2.0
            )
          }
          portal.glowLight.intensity = lerp(4, 12, Math.sin(ct * Math.PI))
        }

        // Doors swing open (hinged at edges)
        if (t > 0.2) {
          const openT = clamp01((t - 0.2) / 0.65)
          const doorEase = easeInOut(openT)
          portal.leftPivot.rotation.y  = lerp(0, 1.52, doorEase)
          portal.rightPivot.rotation.y = lerp(0, -1.52, doorEase)
        }

        // Vortex/portal glow brightens
        const vortexMat = portal.vortex.material as THREE.MeshBasicMaterial
        vortexMat.opacity = lerp(0, 0.85, smoothstep(clamp01((t - 0.25) / 0.55)))
        portal.glowLight.intensity = lerp(4, 18, easeOut(clamp01((t - 0.25) / 0.6)))

        // Camera dolly forward through portal
        if (t > 0.55) {
          const dollyT = clamp01((t - 0.55) / 0.45)
          const dollyEase = easeInOut(dollyT)
          camera.position.z = lerp(14, 1, dollyEase)
          camera.position.y = lerp(1.2, 0.5, dollyEase)
          camera.lookAt(0, 0.4, -6)
        }

        // Back light blast
        backLight.intensity = lerp(3.5, 22, easeOut(te))

        // Completion
        if (elapsed >= 5.0) {
          terminatedRef.current = true
          zoneReady()
          return
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    // ── Resize ────────────────────────────────────────────────────────────────
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight, false)
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      terminatedRef.current = true
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisChange)
      disposables.geometries.forEach((g) => g.dispose())
      disposables.materials.forEach((m) => m.dispose())
      disposables.textures.forEach((t) => t.dispose())
      renderer.dispose()
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        zIndex:     'var(--z-zone)' as unknown as number,
        background: '#020810',
      }}
      role="presentation"
      aria-label="Android awakening — entering Android Zone"
    >
      {/* ── WebGL Canvas ───────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />

      {/* ── Edge vignette ──────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(2,8,16,0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Skip button ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]"
        style={{
          color:            'rgba(0, 220, 255, 0.80)',
          background:       'rgba(0, 100, 200, 0.12)',
          border:           '1px solid rgba(0, 180, 255, 0.35)',
          backdropFilter:   'blur(8px)',
        }}
        aria-label="Skip Android awakening cinematic"
      >
        SKIP &#10140;
      </button>

      {/* ── Screen reader status ────────────────────────────────────────── */}
      <span className="sr-only" aria-live="polite">
        Android robot awakening — entering Android Zone...
      </span>
    </div>
  )
}
