import * as THREE from 'three'

import type { CemBox, CemModel, Jem, TextureMap, Vec4 } from './types'

const DEG = Math.PI / 180

type UvFace = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'
type UvFaces = Record<UvFace, Vec4>

/**
 * Build a Three.js Group from a compiled JEM JSON object.
 */
export function jemToScene(jem: Jem, textureMap: TextureMap): THREE.Group {
  const [tw, th] = jem.textureSize || [64, 32]
  const defaultMat = makeMat(jem.texture ? textureMap[jem.texture] : undefined)

  const root = new THREE.Group()
  // Minecraft CEM exports with Y inverted relative to Three.js world space.
  root.scale.y = -1

  for (const entry of jem.models || []) {
    if ('model' in entry) continue
    root.add(parseModel(entry, defaultMat, textureMap, tw, th))
  }

  return root
}

function makeMat(texture?: THREE.Texture): THREE.MeshBasicMaterial {
  if (texture) {
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace
  }
  return new THREE.MeshBasicMaterial({
    map: texture || null,
    transparent: true,
    alphaTest: 0.05,
    side: THREE.DoubleSide,
  })
}

function parseModel(
  model: CemModel,
  parentMat: THREE.Material,
  textureMap: TextureMap,
  parentTw: number,
  parentTh: number,
  parentMirror = false,
): THREE.Group {
  const group = new THREE.Group()
  group.name = model.id || model.part || ''

  const inv = model.invertAxis || ''
  const mirror = parentMirror || (model.mirrorTexture || '').includes('u')

  const [tw, th] = model.textureSize ? model.textureSize : [parentTw, parentTh]
  let mat = parentMat
  if (model.texture && model.textureSize) {
    const tex = textureMap[model.texture]
    if (tex) mat = makeMat(tex)
  }

  applyTransform(group, model, inv)

  for (const box of model.boxes || []) {
    const mesh = parseBox(box, mat, tw, th, inv, mirror)
    if (mesh) group.add(mesh)
  }

  for (const sub of model.submodels || []) {
    group.add(parseModel(sub, mat, textureMap, tw, th, mirror))
  }

  return group
}

function applyTransform(obj: THREE.Object3D, model: CemModel, inv: string) {
  const [tx = 0, ty = 0, tz = 0] = model.translate || []
  const [rx = 0, ry = 0, rz = 0] = model.rotate || []

  const sx = inv.includes('x') ? -1 : 1
  const sy = inv.includes('y') ? -1 : 1
  const sz = inv.includes('z') ? -1 : 1

  obj.position.set(tx * sx, ty * sy, tz * sz)
  obj.rotation.order = 'ZYX'
  obj.rotation.x = rx * DEG * sx
  obj.rotation.y = ry * DEG * sy
  obj.rotation.z = rz * DEG * sz
}

function parseBox(
  box: CemBox,
  mat: THREE.Material,
  tw: number,
  th: number,
  inv: string,
  mirrorU: boolean,
): THREE.Mesh | null {
  const [bx, by, bz, bw, bh, bd] = box.coordinates
  const inflate = box.inflate || 0
  const w = bw + inflate * 2
  const h = bh + inflate * 2
  const d = bd + inflate * 2

  let uvFaces: UvFaces
  if (box.textureOffset) {
    const [u, v] = box.textureOffset
    uvFaces = mcCubeUVs(u, v, bw, bh, bd, tw, th)
  } else if (box.uvNorth !== undefined) {
    uvFaces = {
      north: normUV(box.uvNorth, tw, th),
      south: normUV(box.uvSouth!, tw, th),
      east: normUV(box.uvEast!, tw, th),
      west: normUV(box.uvWest!, tw, th),
      up: normUV(box.uvUp!, tw, th),
      down: normUV(box.uvDown!, tw, th),
    }
  } else {
    const geo = new THREE.BoxGeometry(w, h, d)
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0x555555,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    }))
    mesh.position.set(bx + bw / 2, by + bh / 2, bz + bd / 2)
    return mesh
  }

  if (mirrorU && !box.textureOffset && inv.includes('x')) {
    ;[uvFaces.east, uvFaces.west] = [uvFaces.west, uvFaces.east]
  }
  if (mirrorU && !box.textureOffset && inv.includes('z')) {
    ;[uvFaces.north, uvFaces.south] = [uvFaces.south, uvFaces.north]
  }

  if (mirrorU) {
    for (const key of Object.keys(uvFaces) as UvFace[]) {
      const [u0, v0, u1, v1] = uvFaces[key]
      uvFaces[key] = [u1, v0, u0, v1]
    }
  }

  const geo = buildBoxGeo(w, h, d, uvFaces)
  const mesh = new THREE.Mesh(geo, mat)

  const sx = inv.includes('x') ? -1 : 1
  const sy = inv.includes('y') ? -1 : 1
  const sz = inv.includes('z') ? -1 : 1

  mesh.position.set(
    (bx + bw / 2) * sx,
    (by + bh / 2) * sy,
    (bz + bd / 2) * sz,
  )

  return mesh
}

function normUV([x1, y1, x2, y2]: Vec4, tw: number, th: number): Vec4 {
  return [x1 / tw, 1 - y2 / th, x2 / tw, 1 - y1 / th]
}

function mcCubeUVs(u: number, v: number, w: number, h: number, d: number, tw: number, th: number): UvFaces {
  const f = (x1: number, y1: number, x2: number, y2: number) => normUV([x1, y1, x2, y2], tw, th)
  return {
    up: f(u + d, v, u + d + w, v + d),
    down: f(u + d + w, v, u + 2 * d + w, v + d),
    west: f(u, v + d, u + d, v + d + h),
    south: f(u + d, v + d, u + d + w, v + d + h),
    east: f(u + d + w, v + d, u + 2 * d + w, v + d + h),
    north: f(u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h),
  }
}

function buildBoxGeo(w: number, h: number, d: number, uvFaces: UvFaces): THREE.BufferGeometry {
  const hw = w / 2
  const hh = h / 2
  const hd = d / 2

  const faces: Array<{ name: UvFace, flipV: boolean, verts: Array<[number, number, number]> }> = [
    { name: 'south', flipV: true, verts: [[-hw, -hh, hd], [hw, -hh, hd], [hw, hh, hd], [-hw, hh, hd]] },
    { name: 'north', flipV: true, verts: [[hw, -hh, -hd], [-hw, -hh, -hd], [-hw, hh, -hd], [hw, hh, -hd]] },
    { name: 'east', flipV: true, verts: [[hw, -hh, hd], [hw, -hh, -hd], [hw, hh, -hd], [hw, hh, hd]] },
    { name: 'west', flipV: true, verts: [[-hw, -hh, -hd], [-hw, -hh, hd], [-hw, hh, hd], [-hw, hh, -hd]] },
    { name: 'down', flipV: false, verts: [[-hw, hh, hd], [hw, hh, hd], [hw, hh, -hd], [-hw, hh, -hd]] },
    { name: 'up', flipV: true, verts: [[-hw, -hh, -hd], [hw, -hh, -hd], [hw, -hh, hd], [-hw, -hh, hd]] },
  ]

  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  let vi = 0

  for (const face of faces) {
    const uv = uvFaces[face.name]
    if (!uv) continue
    const [u0, v0, u1, v1] = uv
    for (const [px, py, pz] of face.verts) positions.push(px, py, pz)
    const [va, vb] = face.flipV ? [v1, v0] : [v0, v1]
    uvs.push(u0, va, u1, va, u1, vb, u0, vb)
    indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
    vi += 4
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}
