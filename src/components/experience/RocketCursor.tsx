'use client'

/**
 * RocketCursor — Realistic 3D Rocket following the user's cursor.
 *
 * Features:
 *   1. Detailed 3D Rocket: Metallic PBR fuselage, cockpit visor, swept delta wings
 *      with navigation nodes, titanium exhaust nozzle, and pulsating plasma plume.
 *   2. Realistic Flight Dynamics: Inertia, natural acceleration, smooth heading
 *      alignment, banking into turns, forward pitch, and zero-g idle floating.
 *   3. 3D Gradient Particle Trail: Translucent glowing 3D bubbles in electric cyan,
 *      energy blue, deep violet, and magenta emitted along the flight path.
 *   4. Ultra-Optimized: Single draw call for all trail bubbles (InstancedMesh),
 *      capped pixel ratio, zero-allocation RAF loop, safe for GTX 520 & mobile.
 *   5. Interaction Safe: pointer-events: none, native cursor preserved, clicks pass through.
 *   6. Accessible: Automatically respects prefers-reduced-motion and gracefully
 *      falls back if WebGL is unavailable.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useExperience } from '@/store/experienceStore'

// ── Configuration Constants ───────────────────────────────────────────────────

const MAX_BUBBLES = 120
const MAX_SPARKS = 36
const FOV = 45
const CAMERA_Z = 22
const ROCKET_BASE_SCALE = 0.58 // Sleek, perfectly-sized 3D escort companion (~85px)

// Palette: Cyan -> Blue -> Violet -> Magenta
const BUBBLE_COLORS = [
  new THREE.Color(0x00f0ff), // Electric Cyan
  new THREE.Color(0x3b82f6), // Energy Blue
  new THREE.Color(0x8b5cf6), // Deep Violet
  new THREE.Color(0xec4899), // Neon Magenta
]

function detectLowPerformance(): boolean {
  if (typeof window === 'undefined') return true
  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
  let isLowGPU = false
  try {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const r = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
        if (/GT\s*520|GeForce\s*520|Intel|Mali|Adreno\s*[345]|PowerVR/i.test(r)) {
          isLowGPU = true
        }
      }
    }
  } catch {
    // ignore
  }
  return isMobile || cores <= 4 || memory <= 4 || isLowGPU
}

// ── Particle Data Structures ──────────────────────────────────────────────────

interface Bubble {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  maxLife: number
  life: number
  colorIndex: number
  wobbleSpeed: number
  wobblePhase: number
}

interface Spark {
  active: boolean
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  life: number
  maxLife: number
  color: THREE.Color
}

// ── Procedural 3D Rocket Builder ──────────────────────────────────────────────

function buildRocketModel(): {
  group: THREE.Group
  flameMesh: THREE.Mesh
  innerFlameMesh: THREE.Mesh
  engineLight: THREE.PointLight
  disposables: {
    geometries: THREE.BufferGeometry[]
    materials: THREE.Material[]
  }
} {
  const group = new THREE.Group()
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []

  // Shared Materials
  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xf2f5ff,
    metalness: 0.85,
    roughness: 0.22,
  })
  materials.push(hullMat)

  const blueStripeMat = new THREE.MeshStandardMaterial({
    color: 0x4d7fff,
    metalness: 0.9,
    roughness: 0.18,
    emissive: 0x1d3570,
    emissiveIntensity: 0.35,
  })
  materials.push(blueStripeMat)

  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x161a29,
    metalness: 0.94,
    roughness: 0.26,
  })
  materials.push(darkTitaniumMat)

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xd8e4ff,
    metalness: 0.98,
    roughness: 0.08,
  })
  materials.push(chromeMat)

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    metalness: 0.85,
    roughness: 0.08,
    transparent: true,
    opacity: 0.90,
    emissive: 0x004466,
    emissiveIntensity: 0.45,
  })
  materials.push(visorMat)

  const violetWingMat = new THREE.MeshStandardMaterial({
    color: 0x7c5cfc,
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x2e1a66,
    emissiveIntensity: 0.25,
  })
  materials.push(violetWingMat)

  // 1. Main Fuselage
  const fuselageGeo = new THREE.CylinderGeometry(0.24, 0.32, 1.35, 24)
  geometries.push(fuselageGeo)
  const fuselage = new THREE.Mesh(fuselageGeo, hullMat)
  fuselage.position.y = 0.05
  group.add(fuselage)

  // 2. RAVZEN Energy Ring (Mid-hull accent)
  const accentRingGeo = new THREE.CylinderGeometry(0.285, 0.295, 0.22, 24)
  geometries.push(accentRingGeo)
  const accentRing = new THREE.Mesh(accentRingGeo, blueStripeMat)
  accentRing.position.y = 0.1
  group.add(accentRing)

  const glowRingGeo = new THREE.TorusGeometry(0.298, 0.018, 12, 32)
  geometries.push(glowRingGeo)
  const glowRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  materials.push(glowRingMat)
  const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat)
  glowRing.rotation.x = Math.PI / 2
  glowRing.position.y = 0.1
  group.add(glowRing)

  // 3. Nose Cone
  const noseGeo = new THREE.ConeGeometry(0.24, 0.82, 24)
  geometries.push(noseGeo)
  const nose = new THREE.Mesh(noseGeo, hullMat)
  nose.position.y = 1.13
  group.add(nose)

  // Nose Probe / Pitot Tube
  const probeGeo = new THREE.CylinderGeometry(0.015, 0.03, 0.38, 12)
  geometries.push(probeGeo)
  const probe = new THREE.Mesh(probeGeo, chromeMat)
  probe.position.y = 1.64
  group.add(probe)

  // 4. Cockpit Canopy Visor (Dorsal side +Z)
  const visorGeo = new THREE.SphereGeometry(0.18, 20, 16)
  geometries.push(visorGeo)
  const visor = new THREE.Mesh(visorGeo, visorMat)
  visor.scale.set(0.68, 1.45, 0.62)
  visor.position.set(0, 0.42, 0.2)
  group.add(visor)

  // 5. Engine Collar & Nozzle
  const collarGeo = new THREE.CylinderGeometry(0.32, 0.24, 0.3, 24)
  geometries.push(collarGeo)
  const collar = new THREE.Mesh(collarGeo, darkTitaniumMat)
  collar.position.y = -0.72
  group.add(collar)

  const nozzleGeo = new THREE.CylinderGeometry(0.22, 0.15, 0.32, 20, 1, true)
  geometries.push(nozzleGeo)
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: 0x1f2436,
    metalness: 0.96,
    roughness: 0.24,
    side: THREE.DoubleSide,
  })
  materials.push(nozzleMat)
  const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat)
  nozzle.position.y = -0.98
  group.add(nozzle)

  // Glowing Thruster Throat
  const throatGeo = new THREE.CircleGeometry(0.14, 16)
  geometries.push(throatGeo)
  const throatMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
  materials.push(throatMat)
  const throat = new THREE.Mesh(throatGeo, throatMat)
  throat.rotation.x = Math.PI / 2
  throat.position.y = -0.86
  group.add(throat)

  // 6. Swept Aerodynamic Delta Wings
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0)
  wingShape.lineTo(0.82, -0.44)
  wingShape.lineTo(0.76, -0.74)
  wingShape.lineTo(0, -0.58)
  wingShape.closePath()

  const wingExtrudeSettings = {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.015,
    bevelSegments: 2,
  }
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, wingExtrudeSettings)
  geometries.push(wingGeo)

  // Left Wing
  const leftWing = new THREE.Mesh(wingGeo, darkTitaniumMat)
  leftWing.position.set(0.18, -0.15, -0.02)
  leftWing.rotation.z = -0.05
  group.add(leftWing)

  // Left Wing Leading-Edge Strip
  const leftTrim = new THREE.Mesh(wingGeo, blueStripeMat)
  leftTrim.scale.set(0.98, 0.98, 1.05)
  leftTrim.position.set(0.19, -0.14, -0.02)
  group.add(leftTrim)

  // Right Wing (Mirrored)
  const rightWing = new THREE.Mesh(wingGeo, darkTitaniumMat)
  rightWing.position.set(-0.18, -0.15, -0.02)
  rightWing.scale.set(-1, 1, 1)
  rightWing.rotation.z = 0.05
  group.add(rightWing)

  const rightTrim = new THREE.Mesh(wingGeo, blueStripeMat)
  rightTrim.scale.set(-0.98, 0.98, 1.05)
  rightTrim.position.set(-0.19, -0.14, -0.02)
  group.add(rightTrim)

  // Wingtip Plasma Beacons
  const beaconGeo = new THREE.SphereGeometry(0.045, 12, 12)
  geometries.push(beaconGeo)
  const cyanBeaconMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff })
  materials.push(cyanBeaconMat)
  const magentaBeaconMat = new THREE.MeshBasicMaterial({ color: 0xec4899 })
  materials.push(magentaBeaconMat)

  const leftBeacon = new THREE.Mesh(beaconGeo, cyanBeaconMat)
  leftBeacon.position.set(0.98, -0.68, 0)
  group.add(leftBeacon)

  const rightBeacon = new THREE.Mesh(beaconGeo, magentaBeaconMat)
  rightBeacon.position.set(-0.98, -0.68, 0)
  group.add(rightBeacon)

  // 7. Dorsal & Ventral Stabilizers (Tail Fins)
  const finShape = new THREE.Shape()
  finShape.moveTo(0, 0)
  finShape.lineTo(0.5, -0.34)
  finShape.lineTo(0.46, -0.58)
  finShape.lineTo(0, -0.44)
  finShape.closePath()

  const finGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  })
  geometries.push(finGeo)

  // Dorsal Fin (+Z)
  const dorsalFin = new THREE.Mesh(finGeo, violetWingMat)
  dorsalFin.rotation.y = Math.PI / 2
  dorsalFin.position.set(0, -0.22, 0.22)
  group.add(dorsalFin)

  // Ventral Keel Fin (-Z)
  const ventralFin = new THREE.Mesh(finGeo, darkTitaniumMat)
  ventralFin.rotation.y = -Math.PI / 2
  ventralFin.scale.set(0.7, 0.7, 0.7)
  ventralFin.position.set(0, -0.35, -0.2)
  group.add(ventralFin)

  // 8. Dynamic Engine Flame Plume
  const flameGeo = new THREE.ConeGeometry(0.18, 0.75, 16)
  geometries.push(flameGeo)
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  })
  materials.push(flameMat)
  const flameMesh = new THREE.Mesh(flameGeo, flameMat)
  flameMesh.rotation.x = Math.PI
  flameMesh.position.y = -1.35
  group.add(flameMesh)

  const innerFlameGeo = new THREE.ConeGeometry(0.09, 0.48, 12)
  geometries.push(innerFlameGeo)
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
  })
  materials.push(innerFlameMat)
  const innerFlameMesh = new THREE.Mesh(innerFlameGeo, innerFlameMat)
  innerFlameMesh.rotation.x = Math.PI
  innerFlameMesh.position.y = -1.22
  group.add(innerFlameMesh)

  // Dynamic Engine Light
  const engineLight = new THREE.PointLight(0x00e5ff, 2.0, 4.5)
  engineLight.position.set(0, -1.15, 0)
  group.add(engineLight)

  // Initial scale set to 0; smoothly animates in upon first mouse interaction
  group.scale.set(0, 0, 0)

  return {
    group,
    flameMesh,
    innerFlameMesh,
    engineLight,
    disposables: { geometries, materials },
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RocketCursor() {
  const reducedMotion = useReducedMotion()
  const { stage, activeZone } = useExperience()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Completely hide 3D rocket, exhaust, and trailing particles in Design, Android, Software, and System sections
  const isSectionActive =
    Boolean(activeZone) ||
    stage === 'zone' ||
    stage === 'zone-enter' ||
    stage === 'zone-exit' ||
    stage === 'closing'

  const isSectionActiveRef = useRef(isSectionActive)
  isSectionActiveRef.current = isSectionActive

  useEffect(() => {
    if (reducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    // ── Three.js Scene Setup ──────────────────────────────────────────────────
    const isLow = detectLowPerformance()
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isLow,
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    const dpr = isLow ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25)
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight, false)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    )
    camera.position.set(0, 0, CAMERA_Z)
    camera.lookAt(0, 0, 0)

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x7080b0, 1.5)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6)
    keyLight.position.set(10, 16, 20)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x4d7fff, 2.0)
    rimLight.position.set(-12, -10, -6)
    scene.add(rimLight)

    // ── 3D Rocket Assembly ────────────────────────────────────────────────────
    const {
      group: rocket,
      flameMesh,
      innerFlameMesh,
      engineLight,
      disposables,
    } = buildRocketModel()
    scene.add(rocket)

    // ── 3D Gradient Particle Trail (Instanced Bubbles) ────────────────────────
    const bubbleGeo = new THREE.SphereGeometry(1, 14, 10)
    disposables.geometries.push(bubbleGeo)

    const bubbleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.22,
      transparent: true,
      opacity: 0.75,
    })
    disposables.materials.push(bubbleMat)

    const bubbleMesh = new THREE.InstancedMesh(bubbleGeo, bubbleMat, MAX_BUBBLES)
    bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    scene.add(bubbleMesh)

    const bubbles: Bubble[] = Array.from({ length: MAX_BUBBLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      size: 0.2,
      maxLife: 1.5,
      life: 0,
      colorIndex: 0,
      wobbleSpeed: 2,
      wobblePhase: 0,
    }))

    const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0)
    for (let i = 0; i < MAX_BUBBLES; i++) {
      bubbleMesh.setMatrixAt(i, zeroMatrix)
      bubbleMesh.setColorAt(i, BUBBLE_COLORS[0])
    }
    bubbleMesh.instanceMatrix.needsUpdate = true
    if (bubbleMesh.instanceColor) bubbleMesh.instanceColor.needsUpdate = true

    // ── Engine Exhaust Micro-Sparks ───────────────────────────────────────────
    const sparkPositions = new Float32Array(MAX_SPARKS * 3)
    const sparkColors = new Float32Array(MAX_SPARKS * 3)
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(sparkPositions, 3)
    )
    sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3))
    disposables.geometries.push(sparkGeo)

    const sparkMat = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(sparkMat)

    const sparkPoints = new THREE.Points(sparkGeo, sparkMat)
    scene.add(sparkPoints)

    const sparks: Spark[] = Array.from({ length: MAX_SPARKS }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
      maxLife: 0.2,
      color: new THREE.Color(0x00f0ff),
    }))

    // ── Coordinate Mapping Helpers ────────────────────────────────────────────
    let windowW = window.innerWidth
    let windowH = window.innerHeight

    function getVisibleDimensions(depthZ: number) {
      const distance = CAMERA_Z - depthZ
      const vHeight = 2 * Math.tan((FOV * Math.PI) / 360) * distance
      const vWidth = vHeight * (windowW / windowH)
      return { vWidth, vHeight }
    }

    let { vWidth: curW, vHeight: curH } = getVisibleDimensions(0)

    function screenToWorld(clientX: number, clientY: number) {
      const wx = (clientX / windowW - 0.5) * curW
      const wy = -(clientY / windowH - 0.5) * curH
      return { wx, wy }
    }

    // ── Mouse & State Tracking ────────────────────────────────────────────────
    let targetWorldX = 0
    let targetWorldY = 0
    let hasInteracted = false
    let currentScale = 0
    let isMouseInside = true

    let prevRocketX = 0
    let prevRocketY = 0

    let currentHeading = 0
    let targetHeading = 0
    let currentRoll = 0
    let currentPitch = 0
    let currentSpeed = 0
    let spawnTimer = 0

    // Reusable math objects
    const tempMatrix = new THREE.Matrix4()
    const tempQuat = new THREE.Quaternion()
    const tempEuler = new THREE.Euler(0, 0, 0, 'ZYX')
    const tempColor = new THREE.Color()
    const tempVec = new THREE.Vector3()

    // ── Event Handlers ────────────────────────────────────────────────────────
    function onPointerMove(e: MouseEvent | TouchEvent) {
      let cx = 0
      let cy = 0
      if ('touches' in e && e.touches.length > 0) {
        cx = e.touches[0].clientX
        cy = e.touches[0].clientY
      } else if ('clientX' in e) {
        cx = e.clientX
        cy = e.clientY
      }

      const { wx, wy } = screenToWorld(cx, cy)
      targetWorldX = wx
      targetWorldY = wy
      isMouseInside = true

      if (!hasInteracted) {
        hasInteracted = true
        rocket.position.set(targetWorldX, targetWorldY, 0)
        prevRocketX = targetWorldX
        prevRocketY = targetWorldY
      }
    }

    function onPointerLeave() {
      isMouseInside = false
    }

    function onPointerEnter() {
      isMouseInside = true
    }

    function onPointerDown() {
      if (!hasInteracted || isSectionActiveRef.current) return
      // Pulse burst of bubbles and sparks on click
      for (let k = 0; k < 6; k++) {
        spawnBubble(true)
      }
      for (let k = 0; k < 4; k++) {
        spawnSpark()
      }
    }

    function onResize() {
      windowW = window.innerWidth
      windowH = window.innerHeight
      camera.aspect = windowW / windowH
      camera.updateProjectionMatrix()
      renderer.setSize(windowW, windowH, false)
      const dims = getVisibleDimensions(0)
      curW = dims.vWidth
      curH = dims.vHeight
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('touchstart', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('mousedown', onPointerDown, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    document.addEventListener('mouseenter', onPointerEnter)
    window.addEventListener('resize', onResize)

    // ── Particle Emitter Logic ────────────────────────────────────────────────
    function getNozzleWorldPos(): THREE.Vector3 {
      tempVec.set(0, -1.15, 0)
      return rocket.localToWorld(tempVec)
    }

    let nextBubbleIdx = 0
    function spawnBubble(burst = false) {
      if (!hasInteracted || isSectionActiveRef.current) return
      const b = bubbles[nextBubbleIdx]
      nextBubbleIdx = (nextBubbleIdx + 1) % MAX_BUBBLES

      const nozzlePos = getNozzleWorldPos()
      b.active = true
      b.x = nozzlePos.x + (Math.random() - 0.5) * 0.1
      b.y = nozzlePos.y + (Math.random() - 0.5) * 0.1
      b.z = nozzlePos.z + (Math.random() - 0.5) * 0.1

      const backAngle = currentHeading - Math.PI / 2
      const baseSpeed = burst ? 1.6 : 0.7 + Math.random() * 0.5
      const spread = (Math.random() - 0.5) * 0.85

      b.vx = Math.cos(backAngle + spread) * baseSpeed * 0.4
      b.vy = Math.sin(backAngle + spread) * baseSpeed * 0.4
      b.vz = (Math.random() - 0.5) * 0.35

      b.size = burst ? 0.26 + Math.random() * 0.16 : 0.13 + Math.random() * 0.2
      b.maxLife = 1.3 + Math.random() * 0.7
      b.life = 0
      b.colorIndex = Math.floor(Math.random() * BUBBLE_COLORS.length)
      b.wobbleSpeed = 2 + Math.random() * 3
      b.wobblePhase = Math.random() * Math.PI * 2
    }

    let nextSparkIdx = 0
    function spawnSpark() {
      if (!hasInteracted || isSectionActiveRef.current) return
      const s = sparks[nextSparkIdx]
      nextSparkIdx = (nextSparkIdx + 1) % MAX_SPARKS

      const nozzlePos = getNozzleWorldPos()
      s.active = true
      s.x = nozzlePos.x
      s.y = nozzlePos.y
      s.z = nozzlePos.z

      const backAngle = currentHeading - Math.PI / 2 + (Math.random() - 0.5) * 0.4
      const sparkSpeed = 2.4 + Math.random() * 2.2

      s.vx = Math.cos(backAngle) * sparkSpeed
      s.vy = Math.sin(backAngle) * sparkSpeed
      s.vz = (Math.random() - 0.5) * 0.7

      s.life = 0
      s.maxLife = 0.14 + Math.random() * 0.08
      s.color = Math.random() > 0.4 ? BUBBLE_COLORS[0] : BUBBLE_COLORS[2]
    }

    // ── Animation Loop ────────────────────────────────────────────────────────
    let animationFrameId: number
    let lastTime = performance.now()
    let isTabVisible = true
    let wasSectionActive = isSectionActiveRef.current

    function onVisibilityChange() {
      isTabVisible = document.visibilityState === 'visible'
      if (isTabVisible) lastTime = performance.now()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    let renderTimeoutId: number | null = null

    function animate(now: number) {
      if (!isTabVisible) {
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      const isHidden = isSectionActiveRef.current

      if (isHidden) {
        if (!wasSectionActive) {
          wasSectionActive = true
          // Completely hide 3D rocket model, exhaust plume & lighting
          rocket.visible = false
          currentScale = 0
          rocket.scale.set(0, 0, 0)

          // Deactivate and clear all trailing bubbles
          for (let i = 0; i < MAX_BUBBLES; i++) {
            if (bubbles[i].active) {
              bubbles[i].active = false
              bubbleMesh.setMatrixAt(i, zeroMatrix)
            }
          }
          bubbleMesh.instanceMatrix.needsUpdate = true

          // Deactivate and clear all engine exhaust sparks
          for (let i = 0; i < MAX_SPARKS; i++) {
            if (sparks[i].active) {
              sparks[i].active = false
              const idx = i * 3
              sparkPositions[idx] = 9999
              sparkPositions[idx + 1] = 9999
              sparkPositions[idx + 2] = 9999
            }
          }
          ;(sparkGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true
          ;(sparkGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true

          // Clear WebGL framebuffer
          renderer.clear()
        }
        // Throttled check when hidden: poll every 250ms instead of burning full 60fps RAF loop
        renderTimeoutId = window.setTimeout(() => {
          animationFrameId = requestAnimationFrame(animate)
        }, 250)
        return
      }

      animationFrameId = requestAnimationFrame(animate)

      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      // Restore rocket when returning to main universe/home screen
      if (wasSectionActive) {
        wasSectionActive = false
        rocket.visible = true
        rocket.position.set(targetWorldX, targetWorldY, 0)
        prevRocketX = targetWorldX
        prevRocketY = targetWorldY
        currentSpeed = 0
        spawnTimer = 0
        currentScale = 0
      }

      // Smooth Scale In/Out based on user presence
      const targetScale = hasInteracted && isMouseInside ? ROCKET_BASE_SCALE : 0
      currentScale += (targetScale - currentScale) * Math.min(1, 0.12 * (dt / 0.016))
      rocket.scale.set(currentScale, currentScale, currentScale)

      if (hasInteracted) {
        // 1. Natural Movement & Inertia
        const dx = targetWorldX - rocket.position.x
        const dy = targetWorldY - rocket.position.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        // Smooth follow factor with natural inertia
        const followRate = Math.min(1, 0.082 * (dt / 0.016))
        rocket.position.x += dx * followRate
        rocket.position.y += dy * followRate

        // Smoothed velocity calculation
        const instVx = (rocket.position.x - prevRocketX) / dt
        const instVy = (rocket.position.y - prevRocketY) / dt
        prevRocketX = rocket.position.x
        prevRocketY = rocket.position.y

        const instSpeed = Math.sqrt(instVx * instVx + instVy * instVy)
        currentSpeed += (instSpeed - currentSpeed) * Math.min(1, 0.15 * (dt / 0.016))

        // 2. Heading, Banking & Orientation
        if (instSpeed > 0.35 && dist > 0.12) {
          // Rocket nose points along +Y in local space
          targetHeading = Math.atan2(instVy, instVx) - Math.PI / 2
        }

        // Shortest arc interpolation
        let headingDiff = (targetHeading - currentHeading) % (Math.PI * 2)
        if (headingDiff > Math.PI) headingDiff -= Math.PI * 2
        if (headingDiff < -Math.PI) headingDiff += Math.PI * 2
        currentHeading += headingDiff * Math.min(1, 0.12 * (dt / 0.016))

        // Banking into turns (roll)
        const turnRate = headingDiff / Math.max(dt, 0.001)
        const targetRoll = THREE.MathUtils.clamp(-turnRate * 0.12, -0.65, 0.65)
        currentRoll += (targetRoll - currentRoll) * Math.min(1, 0.1 * (dt / 0.016))

        // Pitch tilt forward when moving
        const targetPitch = THREE.MathUtils.clamp(currentSpeed * 0.035, 0, 0.32)
        currentPitch += (targetPitch - currentPitch) * Math.min(1, 0.1 * (dt / 0.016))

        // Idle zero-g floating when standing still
        const idleTime = now * 0.0015
        const idleFloatZ = Math.sin(idleTime * 2.2) * 0.12
        const idleRoll = Math.sin(idleTime * 1.6) * 0.04
        const idlePitch = Math.cos(idleTime * 1.8) * 0.03

        rocket.position.z = idleFloatZ

        // Apply combined orientation
        tempEuler.set(
          currentPitch + idlePitch,
          currentRoll + idleRoll,
          currentHeading,
          'ZYX'
        )
        tempQuat.setFromEuler(tempEuler)
        rocket.quaternion.slerp(tempQuat, Math.min(1, 0.25 * (dt / 0.016)))

        // 3. Dynamic Engine Jet & Lighting
        const speedRatio = THREE.MathUtils.clamp(currentSpeed / 12, 0, 1)
        const flicker = 0.85 + Math.random() * 0.3
        const flameScaleY = (0.55 + speedRatio * 1.4) * flicker
        const flameScaleXZ = (0.7 + speedRatio * 0.6) * flicker

        flameMesh.scale.set(flameScaleXZ, flameScaleY, flameScaleXZ)
        innerFlameMesh.scale.set(flameScaleXZ, flameScaleY * 0.9, flameScaleXZ)
        engineLight.intensity = (1.2 + speedRatio * 2.2) * flicker

        // 4. Particle Trail Emission
        spawnTimer += dt
        const spawnInterval = instSpeed > 0.5 ? 0.024 : 0.14
        if (spawnTimer >= spawnInterval && currentScale > 0.3) {
          spawnBubble()
          if (instSpeed > 1.2) {
            spawnSpark()
          }
          spawnTimer = 0
        }
      }

      // 5. Update 3D Bubbles
      let activeBubblesExist = false
      for (let i = 0; i < MAX_BUBBLES; i++) {
        const b = bubbles[i]
        if (!b.active) {
          bubbleMesh.setMatrixAt(i, zeroMatrix)
          continue
        }

        activeBubblesExist = true
        b.life += dt
        const progress = b.life / b.maxLife

        if (progress >= 1) {
          b.active = false
          bubbleMesh.setMatrixAt(i, zeroMatrix)
          continue
        }

        // Motion with drag & gentle zero-g wobble
        b.x += b.vx * dt
        b.y += b.vy * dt
        b.z += b.vz * dt
        b.vx *= 0.965
        b.vy *= 0.965
        b.vz *= 0.965

        const wobble = Math.sin(now * 0.003 * b.wobbleSpeed + b.wobblePhase) * 0.008
        b.x += wobble
        b.y += wobble * 0.5

        // Scale envelope: pop in -> expand -> gently shrink and fade
        let scaleFactor = 1
        if (progress < 0.12) {
          scaleFactor = progress / 0.12
        } else {
          scaleFactor = Math.sin((1 - progress) * Math.PI * 0.5)
        }
        const currentRadius = Math.max(0.001, b.size * scaleFactor)

        tempMatrix.makeTranslation(b.x, b.y, b.z)
        tempMatrix.scale(tempVec.set(currentRadius, currentRadius, currentRadius))
        bubbleMesh.setMatrixAt(i, tempMatrix)

        // Color transition towards violet/magenta
        const baseCol = BUBBLE_COLORS[b.colorIndex]
        const targetCol = BUBBLE_COLORS[(b.colorIndex + 1) % BUBBLE_COLORS.length]
        tempColor.copy(baseCol).lerp(targetCol, progress * 0.7)
        bubbleMesh.setColorAt(i, tempColor)
      }

      if (activeBubblesExist) {
        bubbleMesh.instanceMatrix.needsUpdate = true
        if (bubbleMesh.instanceColor) bubbleMesh.instanceColor.needsUpdate = true
      }

      // 6. Update Sparks
      const posAttr = sparkGeo.attributes.position as THREE.BufferAttribute
      const colAttr = sparkGeo.attributes.color as THREE.BufferAttribute
      let activeSparkCount = 0

      for (let i = 0; i < MAX_SPARKS; i++) {
        const s = sparks[i]
        const idx = i * 3

        if (!s.active) {
          sparkPositions[idx] = 9999
          sparkPositions[idx + 1] = 9999
          sparkPositions[idx + 2] = 9999
          continue
        }

        s.life += dt
        if (s.life >= s.maxLife) {
          s.active = false
          sparkPositions[idx] = 9999
          sparkPositions[idx + 1] = 9999
          sparkPositions[idx + 2] = 9999
          continue
        }

        activeSparkCount++
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.z += s.vz * dt

        sparkPositions[idx] = s.x
        sparkPositions[idx + 1] = s.y
        sparkPositions[idx + 2] = s.z

        const sparkFade = 1 - s.life / s.maxLife
        sparkColors[idx] = s.color.r * sparkFade
        sparkColors[idx + 1] = s.color.g * sparkFade
        sparkColors[idx + 2] = s.color.b * sparkFade
      }

      if (activeSparkCount > 0) {
        posAttr.needsUpdate = true
        colAttr.needsUpdate = true
      }

      // 7. Render Scene
      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    // ── Teardown & Cleanup ────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId)
      if (renderTimeoutId) clearTimeout(renderTimeoutId)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchstart', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('mouseleave', onPointerLeave)
      document.removeEventListener('mouseenter', onPointerEnter)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)

      disposables.geometries.forEach((g) => g.dispose())
      disposables.materials.forEach((m) => m.dispose())
      bubbleGeo.dispose()
      bubbleMat.dispose()
      sparkGeo.dispose()
      sparkMat.dispose()
      scene.clear()
      renderer.dispose()
    }
  }, [reducedMotion])

  if (reducedMotion) return null

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-[60] w-full h-full ${
        isSectionActive ? 'hidden' : 'block'
      }`}
      style={{
        display: isSectionActive ? 'none' : 'block',
        transform: 'translateZ(0)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
