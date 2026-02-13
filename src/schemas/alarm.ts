import { z } from "zod";

// --- 시간 조건 스키마 ---

const hour = z.number().int().min(0).max(23);
const minute = z.number().int().min(0).max(59);

export const RangeConditionSchema = z
  .object({
    type: z.literal("range"),
    startHour: hour,
    startMinute: minute,
    endHour: hour,
    endMinute: minute,
  })
  .refine(
    c => c.startHour * 60 + c.startMinute <= c.endHour * 60 + c.endMinute,
    { message: "Start time must be before end time.", path: [] },
  );

export const IntervalConditionSchema = z.object({
  type: z.literal("interval"),
  intervalMinutes: z.number().int().min(1).max(720),
});

export const SpecificConditionSchema = z.object({
  type: z.literal("specific"),
  hour: hour.optional(),
  minute: minute.optional(),
});

export const TimeConditionSchema = z.union([
  RangeConditionSchema,
  IntervalConditionSchema,
  SpecificConditionSchema,
]);

// --- 논리 연산자 ---

export const LogicalOperatorSchema = z.enum(["AND", "OR"]);

// --- 복합 조건 (재귀) ---

export type CompoundCondition = {
  operator: z.infer<typeof LogicalOperatorSchema>;
  conditions: (TimeCondition | CompoundCondition)[];
};

export const CompoundConditionSchema: z.ZodType<CompoundCondition> = z.lazy(
  () =>
    z.object({
      operator: LogicalOperatorSchema,
      conditions: z.array(AnyConditionSchema).min(1),
    }),
);

// --- 조합 타입 ---

export const AnyConditionSchema: z.ZodType<TimeCondition | CompoundCondition> =
  z.lazy(() => z.union([TimeConditionSchema, CompoundConditionSchema]));

// --- AlarmRule ---

export const AlarmRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  condition: AnyConditionSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  notificationEnabled: z.boolean().default(true),
  soundName: z.string().optional(),
});

// --- AlarmEvent ---

export const AlarmEventSchema = z.object({
  ruleId: z.string(),
  ruleName: z.string(),
  triggeredAt: z.coerce.date(),
  message: z.string().optional(),
});

// --- AlarmStorage ---

export const AlarmStorageSchema = z.object({
  rules: z.array(AlarmRuleSchema),
  lastCheck: z.coerce.date(),
});

// --- TimeFormat ---

export const TimeFormatSchema = z.enum(["12h", "24h"]);

// --- Theme ---

export const ThemeSchema = z.enum(["system", "light", "dark"]);

// --- AppSettings ---

export const AppSettingsSchema = z.object({
  timeFormat: TimeFormatSchema,
  theme: ThemeSchema.optional(),
});

// --- 타입 추출 ---

export type RangeCondition = z.infer<typeof RangeConditionSchema>;
export type IntervalCondition = z.infer<typeof IntervalConditionSchema>;
export type SpecificCondition = z.infer<typeof SpecificConditionSchema>;
export type TimeCondition = z.infer<typeof TimeConditionSchema>;
export type LogicalOperator = z.infer<typeof LogicalOperatorSchema>;
// CompoundCondition은 위에서 수동 정의
export type AnyCondition = TimeCondition | CompoundCondition;
export type AlarmRule = z.infer<typeof AlarmRuleSchema>;
export type AlarmEvent = z.infer<typeof AlarmEventSchema>;
export type AlarmStorage = z.infer<typeof AlarmStorageSchema>;
export type TimeFormat = z.infer<typeof TimeFormatSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
