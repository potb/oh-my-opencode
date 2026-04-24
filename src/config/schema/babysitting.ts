import { z } from "zod"

const BabysittingConfigSchema = z.object({
  timeout_ms: z.number().default(120000),
})

type BabysittingConfig = z.infer<typeof BabysittingConfigSchema>
