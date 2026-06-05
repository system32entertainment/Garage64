export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec4 = [number, number, number, number]
export type BoxCoords = [number, number, number, number, number, number]

export type CemBox = {
  coordinates: BoxCoords
  textureOffset?: Vec2
  uvNorth?: Vec4
  uvSouth?: Vec4
  uvEast?: Vec4
  uvWest?: Vec4
  uvUp?: Vec4
  uvDown?: Vec4
  inflate?: number
  [key: string]: unknown
}

export type CemModel = {
  id?: string
  part?: string
  attach?: boolean
  model?: string
  invertAxis?: string
  mirrorTexture?: string
  texture?: string
  textureSize?: Vec2
  translate?: Vec3
  rotate?: Vec3
  boxes?: CemBox[]
  submodels?: CemModel[]
  [key: string]: unknown
}

export type Jem = {
  texture?: string
  textureSize?: Vec2
  models?: CemModel[]
  [key: string]: unknown
}

export type Jpm = CemModel & {
  id: string
}

export type AttachmentMeta = Omit<CemModel, 'model' | 'boxes' | 'submodels'> & {
  model?: never
}

export type TextureMap = Record<string, THREE.Texture>

import type * as THREE from 'three'
