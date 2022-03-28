import { z } from 'zod'

const ValueSchema = z.object({
  type: z.string(),
  value: z.string().optional(),
}).strict()

const ParameterSchema = z.object({
  type: z.string(),
  key: z.string(),
  value: z.string().optional(),
  list: z.object({}).or(z.array(z.any())).optional()
}).strict()

const ParameterArray = z.array(ParameterSchema).transform(c => c.sort((a, b) => a.key > b.key ? 1 : -1));

const TypedParameterList = z.object({
  type: z.string(),
  parameter: ParameterArray
}).strict()


const VariableSchema = z.object({
  accountId: z.string(),
  containerId: z.string(),
  variableId: z.string(),
  name: z.string(),
  type: z.string(),
  fingerprint: z.string(),
  parentFolderId: z.string().optional(),
  formatValue: z.object({}).optional(),
  parameter: ParameterArray.optional(),
}).strict()

const FolderSchema = z.object({
  accountId: z.string(),
  containerId: z.string(),
  folderId: z.string(),
  name: z.string(),
  fingerprint: z.string(),
}).strict()

const TagSchema = z.object({
  name: z.string(),
  type: z.string(),
  tagId: z.string(),
  parameter: ParameterArray,
  priority: ValueSchema.optional(),

  accountId: z.string(),
  containerId: z.string(),

  fingerprint: z.string(),
  firingTriggerId: z.array(z.string()).optional(),
  blockingTriggerId: z.array(z.string()).optional(),
  parentFolderId: z.string().optional(),
  tagFiringOption: z.string().optional(),
  monitoringMetadata: z.object({ type: z.string() }).strict().optional(),
  consentSettings: z.object({ consentStatus: z.string() }).strict(),
  setupTag: z.array(z.object({ tagName: z.string(), stopOnSetupFailure: z.boolean().optional() })).optional(),

}).strict()

const TriggerSchema = z.object({
  accountId: z.string(),
  containerId: z.string(),
  triggerId: z.string(),
  name: z.string(),
  type: z.string(),
  customEventFilter: z.array(
    TypedParameterList,
  ).optional(),
  filter: z.array(TypedParameterList).optional(),
  fingerprint: z.string(),
  parentFolderId: z.string().optional(),
  parameter: ParameterArray.optional(),
  waitForTags: ValueSchema.optional(),
  checkValidation: ValueSchema.optional(),
  waitForTagsTimeout: ValueSchema.optional(),
  uniqueTriggerId: z.object({ type: z.string() }).optional(),
  autoEventFilter: z.array(TypedParameterList).optional()
}).strict()

export const ContainerSchema = z.object({

  containerVersion: z.object({
    tag: z.array(TagSchema),
    trigger: z.array(TriggerSchema),
    variable: z.array(VariableSchema),
    folder: z.array(FolderSchema),
  })
})

export type Container = z.infer<typeof ContainerSchema>;
export type Tag = z.infer<typeof TagSchema>;
export type Trigger = z.infer<typeof TriggerSchema>;
export type Variable = z.infer<typeof VariableSchema>;
export type Folder = z.infer<typeof FolderSchema>;
