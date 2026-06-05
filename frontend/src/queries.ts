import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api, type VariantPayload } from './api'

export const queryKeys = {
  bodies: ['bodies'] as const,
  parts: ['parts'] as const,
  slots: ['slots'] as const,
  variants: ['variants'] as const,
  compiledJem: (variantId: number | string | null | undefined) => ['variants', variantId, 'compiledJem'] as const,
}

export function useBodiesQuery() {
  return useQuery({
    queryKey: queryKeys.bodies,
    queryFn: api.bodies.list,
  })
}

export function usePartsQuery() {
  return useQuery({
    queryKey: queryKeys.parts,
    queryFn: api.parts.list,
  })
}

export function useSlotsQuery() {
  return useQuery({
    queryKey: queryKeys.slots,
    queryFn: api.slots.list,
  })
}

export function useVariantsQuery() {
  return useQuery({
    queryKey: queryKeys.variants,
    queryFn: api.variants.list,
  })
}

export function useCompiledJemQuery(variantId: number | string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.compiledJem(variantId),
    queryFn: () => api.variants.compiledJem(variantId!),
    enabled: variantId !== null && variantId !== undefined && variantId !== '',
  })
}

export function useCreateVariantMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: VariantPayload) => api.variants.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.variants })
    },
  })
}

export function useUpdateVariantMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string, data: VariantPayload }) => api.variants.update(id, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.variants })
      qc.invalidateQueries({ queryKey: queryKeys.compiledJem(variables.id) })
    },
  })
}

export function useDeleteVariantMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => api.variants.delete(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.variants })
      qc.removeQueries({ queryKey: queryKeys.compiledJem(id) })
    },
  })
}

export function useExportPackMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.variants.exportPack,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.variants })
      qc.invalidateQueries({ queryKey: queryKeys.parts })
      qc.invalidateQueries({ queryKey: queryKeys.bodies })
    },
  })
}
