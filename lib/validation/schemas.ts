/**
 * Zod validation schemas for API inputs and form values.
 */
import { z } from "zod";

// ─── Primitives ───────────────────────────────────────────────────────────────

export const evmAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/, "Must be a valid EVM address (0x followed by 40 hex characters)");

export const bytes32Schema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a valid bytes32 hex string");

export const txHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/, "Must be a valid transaction hash");

export const recordCategorySchema = z.enum([
  "checkup",
  "laboratory",
  "prescription",
  "vaccination",
  "consultation",
  "insurance",
  "certificate",
  "other",
]);

// ─── Record Schemas ───────────────────────────────────────────────────────────

export const createRecordSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  category: recordCategorySchema,
  providerName: z
    .string()
    .min(1, "Provider name is required")
    .max(120, "Provider name must be 120 characters or fewer"),
  serviceDate: z
    .string()
    .min(1, "Service date is required")
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, "Service date must be a valid date")
    .refine((val) => {
      const d = new Date(val);
      return d <= new Date();
    }, "Service date cannot be in the future"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be 1000 characters or fewer"),
  externalReference: z
    .string()
    .max(80, "External reference must be 80 characters or fewer")
    .optional()
    .or(z.literal("")),
  ownerAddress: evmAddressSchema,
});

export const updateRecordSchema = z.object({
  blockchainStatus:   z.string().optional(),
  verificationStatus: z.string().optional(),
  blockchainRecordId: z.string().optional(),
  transactionHash:    txHashSchema.optional().or(z.literal("")),
  blockNumber:        z.string().optional(),
  deactivated:        z.boolean().optional(),
  confirmationTime:   z.string().optional(),
});

// ─── Query Schemas ────────────────────────────────────────────────────────────

export const recordListQuerySchema = z.object({
  wallet:             evmAddressSchema.optional(),
  category:           recordCategorySchema.optional(),
  blockchainStatus:   z.string().optional(),
  verificationStatus: z.string().optional(),
  search:             z.string().max(100).optional(),
  shared:             z.coerce.boolean().optional(),
});

export const activityQuerySchema = z.object({
  wallet:    evmAddressSchema.optional(),
  recordId:  z.string().optional(),
  eventName: z.string().optional(),
  limit:     z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const indexedEventsQuerySchema = z.object({
  eventName: z.string().min(1).optional(),
  page:      z.coerce.number().int().min(1).optional().default(1),
  pageSize:  z.coerce.number().int().min(1).max(100).optional().default(20),
});

// ─── Exported Types ───────────────────────────────────────────────────────────

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type RecordListQuery   = z.infer<typeof recordListQuerySchema>;
export type ActivityQuery     = z.infer<typeof activityQuerySchema>;
export type IndexedEventsQuery = z.infer<typeof indexedEventsQuerySchema>;
