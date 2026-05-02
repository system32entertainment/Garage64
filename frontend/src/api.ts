const BASE = `${import.meta.env.BASE_URL}api`

async function req(path: string, options: any = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export const api = {
  // Variants
  getVariants: () => req('/variants/'),
  getVariant: (id: any) => req(`/variants/${id}/`),
  createVariant: (data: any) => req('/variants/', { method: 'POST', body: data }),
  updateVariant: (id: any, data: any) => req(`/variants/${id}/`, { method: 'PUT', body: data }),
  deleteVariant: (id: any) => req(`/variants/${id}/`, { method: 'DELETE' }),
  exportPack: () => req('/variants/export/', { method: 'POST' }),

  // Parts
  getParts: () => req('/parts/'),
  getPart: (id: any) => req(`/parts/${id}/`),
  createPart: (data: any) => req('/parts/', { method: 'POST', body: data }),
  updatePart: (id: any, data: any) => req(`/parts/${id}/`, { method: 'PUT', body: data }),
  deletePart: (id: any) => req(`/parts/${id}/`, { method: 'DELETE' }),
  patchPart: (id: any, data: any) => req(`/parts/${id}/`, { method: 'PATCH', body: data }),

  // Bodies
  getBodies: () => req('/bodies/'),
  getBody: (id: any) => req(`/bodies/${id}/`),
  createBody: (data: any) => req('/bodies/', { method: 'POST', body: data }),
  updateBody: (id: any, data: any) => req(`/bodies/${id}/`, { method: 'PUT', body: data }),
  patchBody: (id: any, data: any) => req(`/bodies/${id}/`, { method: 'PATCH', body: data }),

  // Assets
  saveTexture: (path: string, blob: Blob) => fetch(`${import.meta.env.BASE_URL}api/asset/?path=${encodeURIComponent(path)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/png' },
    body: blob,
  }).then(r => { if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json() }),

  // Save a painted texture for a variant and update texture_override on the variant.
  // carSlug:   EntityBody.name  e.g. "miata_base"
  // variantId: CarVariant.id
  // fileName:  CarVariant.file_name  e.g. "oak_boat3"
  // blob:      PNG Blob
  async saveVariantTexture(carSlug: string, variantId: any, fileName: string, blob: Blob) {
    const texPath = `optifine/cem/${carSlug}/variants/${fileName}.png`
    await api.saveTexture(texPath, blob)
    return req(`/variants/${variantId}/`, {
      method: 'PATCH',
      body: { texture_override: `minecraft:${texPath}` },
    })
  },

  patchVariant: (id: any, data: any) => req(`/variants/${id}/`, { method: 'PATCH', body: data }),

  // Slots
  getSlots: () => req('/slots/'),
  createSlot: (data: any) => req('/slots/', { method: 'POST', body: data }),
  updateSlot: (id: any, data: any) => req(`/slots/${id}/`, { method: 'PUT', body: data }),
  deleteSlot: (id: any) => req(`/slots/${id}/`, { method: 'DELETE' }),
}
