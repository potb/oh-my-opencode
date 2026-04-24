import { z } from "zod"

const FallbackModelObjectSchema = z.object({
  model: z.string(),
  variant: z.string().optional(),
  reasoningEffort: z.enum(["none", "minimal", "low", "medium", "high", "xhigh"]).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  maxTokens: z.number().optional(),
  thinking: z
    .object({
      type: z.enum(["enabled", "disabled"]),
      budgetTokens: z.number().optional(),
    })
    .optional(),
})

export type FallbackModelObject = z.infer<typeof FallbackModelObjectSchema>

const FallbackModelStringArraySchema = z.array(z.string())
const FallbackModelObjectArraySchema = z.array(FallbackModelObjectSchema)
const FallbackModelMixedArraySchema = z.array(z.union([z.string(), FallbackModelObjectSchema]))

export const FallbackModelsSchema = z.union([
  z.string(),
  FallbackModelStringArraySchema,
  FallbackModelObjectArraySchema,
  FallbackModelMixedArraySchema,
])

type FallbackModels = z.infer<typeof FallbackModelsSchema>
