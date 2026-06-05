import type { AttachmentMeta, Jem, Jpm } from './domain/cem/types'

const BASE = `${import.meta.env.BASE_URL}api`

type Id = number | string

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(status: number, statusText: string, payload: unknown) {
    super(formatErrorMessage(status, statusText, payload))
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export type EntityBody = {
  id: number
  name: string
  jem_file_name: string
  entity_type: string
  body_data: Jem
}

export type ModelPart = {
  id: number
  name: string
  jpm_path: string
  part_data: Jpm
  attachment_meta: AttachmentMeta
  slot: string
}

export type VariantPart = {
  id: number
  part: ModelPart
  part_id?: number
  order: number
}

export type CarVariant = {
  id: number
  file_name: string
  trigger_name: string
  body_name: string
  order: number
  texture_override: string
  variant_parts: VariantPart[]
}

export type PartSlot = {
  id: number
  name: string
  display_name: string
  order: number
}

export type BodyPayload = {
  name: string
  jem_file_name?: string
  entity_type?: string
  body_data: Jem
}

export type PartPayload = {
  name: string
  jpm_path: string
  part_data: Jpm
  attachment_meta: AttachmentMeta
  slot?: string
}

export type VariantPayload = {
  file_name: string
  trigger_name?: string
  body?: Id
  order?: number
  texture_override?: string
  part_ids?: Id[]
}

export type SlotPayload = {
  name: string
  display_name: string
  order?: number
}

export type ExportResult = {
  status: 'ok' | 'partial'
  written?: number
  errors?: string[]
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

async function req<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })
  const payload = await readPayload(res)
  if (!res.ok) throw new ApiError(res.status, res.statusText, payload)
  return payload as T
}

async function readPayload(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function formatErrorMessage(status: number, statusText: string, payload: unknown): string {
  if (payload && typeof payload === 'object') {
    return `${status} ${statusText}: ${JSON.stringify(payload)}`
  }
  if (typeof payload === 'string' && payload) {
    return `${status} ${statusText}: ${payload}`
  }
  return `${status} ${statusText}`
}

async function saveTexture(path: string, blob: Blob): Promise<{ status: string }> {
  const res = await fetch(`${BASE}/asset/?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: blob,
  })
  const payload = await readPayload(res)
  if (!res.ok) throw new ApiError(res.status, res.statusText, payload)
  return payload as { status: string }
}

export const api = {
  variants: {
    list: () => req<CarVariant[]>('/variants/'),
    get: (id: Id) => req<CarVariant>(`/variants/${id}/`),
    create: (data: VariantPayload) => req<CarVariant>('/variants/', { method: 'POST', body: data }),
    update: (id: Id, data: VariantPayload) => req<CarVariant>(`/variants/${id}/`, { method: 'PUT', body: data }),
    patch: (id: Id, data: Partial<VariantPayload>) => req<CarVariant>(`/variants/${id}/`, { method: 'PATCH', body: data }),
    delete: (id: Id) => req<null>(`/variants/${id}/`, { method: 'DELETE' }),
    exportPack: () => req<ExportResult>('/variants/export/', { method: 'POST' }),
    compiledJem: (id: Id) => req<Jem>(`/variants/${id}/compiled_jem/`),
  },

  parts: {
    list: () => req<ModelPart[]>('/parts/'),
    get: (id: Id) => req<ModelPart>(`/parts/${id}/`),
    create: (data: PartPayload) => req<ModelPart>('/parts/', { method: 'POST', body: data }),
    update: (id: Id, data: PartPayload) => req<ModelPart>(`/parts/${id}/`, { method: 'PUT', body: data }),
    patch: (id: Id, data: Partial<PartPayload>) => req<ModelPart>(`/parts/${id}/`, { method: 'PATCH', body: data }),
    delete: (id: Id) => req<null>(`/parts/${id}/`, { method: 'DELETE' }),
  },

  bodies: {
    list: () => req<EntityBody[]>('/bodies/'),
    get: (id: Id) => req<EntityBody>(`/bodies/${id}/`),
    create: (data: BodyPayload) => req<EntityBody>('/bodies/', { method: 'POST', body: data }),
    update: (id: Id, data: BodyPayload) => req<EntityBody>(`/bodies/${id}/`, { method: 'PUT', body: data }),
    patch: (id: Id, data: Partial<BodyPayload>) => req<EntityBody>(`/bodies/${id}/`, { method: 'PATCH', body: data }),
  },

  slots: {
    list: () => req<PartSlot[]>('/slots/'),
    create: (data: SlotPayload) => req<PartSlot>('/slots/', { method: 'POST', body: data }),
    update: (id: Id, data: SlotPayload) => req<PartSlot>(`/slots/${id}/`, { method: 'PUT', body: data }),
    delete: (id: Id) => req<null>(`/slots/${id}/`, { method: 'DELETE' }),
  },

  assets: {
    saveTexture,
  },

  async saveVariantTexture(carSlug: string, variantId: Id, fileName: string, blob: Blob) {
    const texPath = `optifine/cem/${carSlug}/variants/${fileName}.png`
    await saveTexture(texPath, blob)
    return api.variants.patch(variantId, { texture_override: `minecraft:${texPath}` })
  },

  // Legacy aliases. New code should prefer the grouped resources above.
  getVariants: () => api.variants.list(),
  getVariant: (id: Id) => api.variants.get(id),
  createVariant: (data: VariantPayload) => api.variants.create(data),
  updateVariant: (id: Id, data: VariantPayload) => api.variants.update(id, data),
  patchVariant: (id: Id, data: Partial<VariantPayload>) => api.variants.patch(id, data),
  deleteVariant: (id: Id) => api.variants.delete(id),
  exportPack: () => api.variants.exportPack(),
  getCompiledJem: (id: Id) => api.variants.compiledJem(id),

  getParts: () => api.parts.list(),
  getPart: (id: Id) => api.parts.get(id),
  createPart: (data: PartPayload) => api.parts.create(data),
  updatePart: (id: Id, data: PartPayload) => api.parts.update(id, data),
  patchPart: (id: Id, data: Partial<PartPayload>) => api.parts.patch(id, data),
  deletePart: (id: Id) => api.parts.delete(id),

  getBodies: () => api.bodies.list(),
  getBody: (id: Id) => api.bodies.get(id),
  createBody: (data: BodyPayload) => api.bodies.create(data),
  updateBody: (id: Id, data: BodyPayload) => api.bodies.update(id, data),
  patchBody: (id: Id, data: Partial<BodyPayload>) => api.bodies.patch(id, data),

  getSlots: () => api.slots.list(),
  createSlot: (data: SlotPayload) => api.slots.create(data),
  updateSlot: (id: Id, data: SlotPayload) => api.slots.update(id, data),
  deleteSlot: (id: Id) => api.slots.delete(id),

  saveTexture,
}
