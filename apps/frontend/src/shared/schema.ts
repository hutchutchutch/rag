import { z } from 'zod';

export const insertEmbeddingSettingsSchema = z.object({
  chunkSize: z.number(),
  overlap: z.number(),
  cleaner: z.string(),
  strategy: z.string(),
  model: z.string(),
  vectorDb: z.string(),
  embeddingModel: z.string()
});