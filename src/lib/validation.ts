import { z } from "zod";

const maxWorkEmailLength = 120;
const maxNameLength = 80;
const maxCompanyLength = 120;
const maxMaterialLength = 160;
const maxQuantityLength = 80;
const maxDeliveryLength = 120;
const maxSpecsLength = 1000;
const maxQuestionLength = 600;

const workEmailDomainBlackList = /@(gmail|yahoo|hotmail|outlook)\./i;
const safeEmailChars = /[\w.+-]+@[\w.-]+\.[\w.-]+/;
const namePattern = /^[A-Za-z' -]+$/;

const trimText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { message: "is too long." });

export const idSchema = z
  .string()
  .trim()
  .min(1, { message: "is required" })
  .max(80, { message: "must be 80 characters or fewer." })
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/, "uses unsupported characters");

export const actionSchema = z.enum([
  "ask",
  "search_suppliers",
  "compare_bids",
  "create_rfq",
  "request_sample",
  "recommend_award",
  "query_memory",
  "risk_review"
]);

const requiredText = (max: number, errorMessage?: string) =>
  trimText(max).min(1, { message: errorMessage ?? "is required" });

export const optionalSafeText = (max: number) => trimText(max).default("");

export const optionalArray = z.array(z.string().trim().max(80)).max(12).default([]);

export const requestAccessSchema = z.object({
  firstName: requiredText(maxNameLength).regex(namePattern, "contains invalid characters"),
  lastName: requiredText(maxNameLength).regex(namePattern, "contains invalid characters"),
  email: trimText(maxWorkEmailLength)
    .refine((value) => safeEmailChars.test(value), "is not a valid email")
    .refine((value) => !workEmailDomainBlackList.test(value), "must be a work email"),
  company: requiredText(maxCompanyLength),
  procurementOwner: optionalSafeText(maxNameLength),
  securityContact: optionalSafeText(maxWorkEmailLength)
    .refine((value) => value === "" || safeEmailChars.test(value), "is not a valid email")
    .refine((value) => value === "" || !workEmailDomainBlackList.test(value), "must be a work email"),
  sourcing: optionalArray,
  volume: optionalSafeText(80),
  layers: optionalArray,
  notes: optionalSafeText(maxSpecsLength).default("")
});

export const rfqCreateSchema = z.object({
  supplierId: idSchema,
  material: requiredText(maxMaterialLength),
  quantity: requiredText(maxQuantityLength),
  targetDelivery: requiredText(maxDeliveryLength),
  specifications: optionalSafeText(maxSpecsLength).default("")
});

export const awardSchema = z.object({
  bidId: idSchema,
  approvalIntent: z.literal("human-approved").optional()
});

export const supplierSampleSchema = z.object({
  material: optionalSafeText(maxMaterialLength).default(""),
  quantity: requiredText(maxQuantityLength, "Sample quantity is required."),
  targetDelivery: optionalSafeText(maxDeliveryLength).default(""),
  specifications: optionalSafeText(maxSpecsLength).default("")
});

export const memoryQuerySchema = z.object({
  question: requiredText(maxQuestionLength)
});

export const agentRunSchema = z.object({
  action: actionSchema.optional(),
  prompt: optionalSafeText(1000).default(""),
  supplierId: idSchema.optional(),
  rfqId: idSchema.optional(),
  material: optionalSafeText(maxMaterialLength).default(""),
  quantity: optionalSafeText(maxQuantityLength).default(""),
  targetDelivery: optionalSafeText(maxDeliveryLength).default(""),
  specifications: optionalSafeText(maxSpecsLength).default("")
}).superRefine((value, ctx) => {
  if ((value.action === "ask" || value.action === undefined) && value.prompt.trim().length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["prompt"],
      message: "A prompt is required when asking for a generic agent answer."
    });
  }
});
