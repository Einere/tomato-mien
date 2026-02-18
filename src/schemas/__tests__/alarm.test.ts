import { describe, it, expect } from "vitest";
import {
  RangeConditionSchema,
  IntervalConditionSchema,
  SpecificConditionSchema,
  TimeConditionSchema,
  TriggerConditionSchema,
  FilterConditionSchema,
  AlarmRuleSchema,
  AlarmStorageSchema,
  AlarmEventSchema,
  AppSettingsSchema,
} from "@/schemas/alarm";

describe("RangeConditionSchema", () => {
  it("accepts a valid range", () => {
    const data = {
      type: "range",
      startHour: 9,
      startMinute: 0,
      endHour: 17,
      endMinute: 0,
    };
    expect(RangeConditionSchema.parse(data)).toEqual(data);
  });

  it("accepts midnight-crossing range (start > end)", () => {
    const data = {
      type: "range",
      startHour: 22,
      startMinute: 0,
      endHour: 2,
      endMinute: 0,
    };
    expect(RangeConditionSchema.parse(data)).toEqual(data);
  });

  it("rejects out-of-range hour", () => {
    const data = {
      type: "range",
      startHour: 25,
      startMinute: 0,
      endHour: 17,
      endMinute: 0,
    };
    const result = RangeConditionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range minute", () => {
    const data = {
      type: "range",
      startHour: 9,
      startMinute: 60,
      endHour: 17,
      endMinute: 0,
    };
    const result = RangeConditionSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts equal start and end (zero-length range)", () => {
    const data = {
      type: "range",
      startHour: 12,
      startMinute: 30,
      endHour: 12,
      endMinute: 30,
    };
    expect(RangeConditionSchema.parse(data)).toEqual(data);
  });
});

describe("IntervalConditionSchema", () => {
  it("accepts a valid interval", () => {
    const data = { type: "interval", intervalMinutes: 15 };
    expect(IntervalConditionSchema.parse(data)).toEqual(data);
  });

  it("rejects zero interval", () => {
    const result = IntervalConditionSchema.safeParse({
      type: "interval",
      intervalMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative interval", () => {
    const result = IntervalConditionSchema.safeParse({
      type: "interval",
      intervalMinutes: -5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects interval exceeding 720", () => {
    const result = IntervalConditionSchema.safeParse({
      type: "interval",
      intervalMinutes: 721,
    });
    expect(result.success).toBe(false);
  });

  it("accepts max interval of 720", () => {
    const data = { type: "interval", intervalMinutes: 720 };
    expect(IntervalConditionSchema.parse(data)).toEqual(data);
  });

  it("rejects non-integer interval", () => {
    const result = IntervalConditionSchema.safeParse({
      type: "interval",
      intervalMinutes: 15.5,
    });
    expect(result.success).toBe(false);
  });
});

describe("SpecificConditionSchema", () => {
  it("accepts full specific condition", () => {
    const data = { type: "specific", hour: 14, minute: 30 };
    expect(SpecificConditionSchema.parse(data)).toEqual(data);
  });

  it("accepts hour-only specific", () => {
    const data = { type: "specific", hour: 9 };
    expect(SpecificConditionSchema.parse(data)).toEqual(data);
  });

  it("accepts minute-only specific", () => {
    const data = { type: "specific", minute: 30 };
    expect(SpecificConditionSchema.parse(data)).toEqual(data);
  });

  it("accepts empty specific (all wildcards)", () => {
    const data = { type: "specific" };
    expect(SpecificConditionSchema.parse(data)).toEqual(data);
  });

  it("rejects invalid hour", () => {
    const result = SpecificConditionSchema.safeParse({
      type: "specific",
      hour: 25,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid minute", () => {
    const result = SpecificConditionSchema.safeParse({
      type: "specific",
      minute: 60,
    });
    expect(result.success).toBe(false);
  });
});

describe("TimeConditionSchema", () => {
  it("accepts any valid time condition variant", () => {
    expect(
      TimeConditionSchema.safeParse({
        type: "range",
        startHour: 0,
        startMinute: 0,
        endHour: 23,
        endMinute: 59,
      }).success,
    ).toBe(true);
    expect(
      TimeConditionSchema.safeParse({
        type: "interval",
        intervalMinutes: 30,
      }).success,
    ).toBe(true);
    expect(
      TimeConditionSchema.safeParse({ type: "specific", hour: 12 }).success,
    ).toBe(true);
  });

  it("rejects unknown type", () => {
    const result = TimeConditionSchema.safeParse({ type: "unknown" });
    expect(result.success).toBe(false);
  });
});

describe("TriggerConditionSchema", () => {
  it("accepts an interval condition", () => {
    expect(
      TriggerConditionSchema.safeParse({
        type: "interval",
        intervalMinutes: 10,
      }).success,
    ).toBe(true);
  });

  it("accepts a specific condition", () => {
    expect(
      TriggerConditionSchema.safeParse({
        type: "specific",
        hour: 8,
        minute: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects a range condition", () => {
    expect(
      TriggerConditionSchema.safeParse({
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      }).success,
    ).toBe(false);
  });
});

describe("FilterConditionSchema", () => {
  it("accepts a range condition", () => {
    expect(
      FilterConditionSchema.safeParse({
        type: "range",
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      }).success,
    ).toBe(true);
  });

  it("rejects an interval condition", () => {
    expect(
      FilterConditionSchema.safeParse({
        type: "interval",
        intervalMinutes: 15,
      }).success,
    ).toBe(false);
  });
});

describe("AlarmRuleSchema", () => {
  const validRule = {
    id: "abc-123",
    name: "Morning Alarm",
    enabled: true,
    triggers: [{ type: "specific", hour: 7, minute: 0 }],
    filters: [],
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  it("accepts a valid alarm rule", () => {
    const result = AlarmRuleSchema.parse(validRule);
    expect(result.id).toBe("abc-123");
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  it("coerces date strings to Date objects", () => {
    const data = {
      ...validRule,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-06-15T12:30:00.000Z",
    };
    const result = AlarmRuleSchema.parse(data);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(result.updatedAt.toISOString()).toBe("2024-06-15T12:30:00.000Z");
  });

  it("accepts optional fields", () => {
    const data = { ...validRule, soundName: "chime.mp3" };
    const result = AlarmRuleSchema.parse(data);
    expect(result.soundName).toBe("chime.mp3");
  });

  it("rejects missing required fields", () => {
    const { name, ...noName } = validRule;
    expect(AlarmRuleSchema.safeParse(noName).success).toBe(false);
  });

  it("defaults notificationEnabled to true when omitted", () => {
    const result = AlarmRuleSchema.parse(validRule);
    expect(result.notificationEnabled).toBe(true);
  });

  it("accepts explicit notificationEnabled=false", () => {
    const data = { ...validRule, notificationEnabled: false };
    const result = AlarmRuleSchema.parse(data);
    expect(result.notificationEnabled).toBe(false);
  });

  it("accepts explicit notificationEnabled=true", () => {
    const data = { ...validRule, notificationEnabled: true };
    const result = AlarmRuleSchema.parse(data);
    expect(result.notificationEnabled).toBe(true);
  });

  it("accepts activatedAt as Date", () => {
    const data = {
      ...validRule,
      activatedAt: new Date("2024-06-15T10:30:00Z"),
    };
    const result = AlarmRuleSchema.parse(data);
    expect(result.activatedAt).toBeInstanceOf(Date);
    expect(result.activatedAt!.toISOString()).toBe("2024-06-15T10:30:00.000Z");
  });

  it("coerces activatedAt from ISO string", () => {
    const data = { ...validRule, activatedAt: "2024-06-15T10:30:00.000Z" };
    const result = AlarmRuleSchema.parse(data);
    expect(result.activatedAt).toBeInstanceOf(Date);
  });

  it("accepts missing activatedAt (optional)", () => {
    const result = AlarmRuleSchema.parse(validRule);
    expect(result.activatedAt).toBeUndefined();
  });

  it("rejects empty triggers array", () => {
    const data = { ...validRule, triggers: [] };
    expect(AlarmRuleSchema.safeParse(data).success).toBe(false);
  });

  it("defaults filters to empty array when omitted", () => {
    const { filters, ...noFilters } = validRule;
    const result = AlarmRuleSchema.parse(noFilters);
    expect(result.filters).toEqual([]);
  });
});

describe("AlarmEventSchema", () => {
  it("accepts a valid alarm event", () => {
    const data = {
      ruleId: "r1",
      ruleName: "Test",
      triggeredAt: new Date(),
    };
    expect(AlarmEventSchema.safeParse(data).success).toBe(true);
  });

  it("coerces string triggeredAt", () => {
    const data = {
      ruleId: "r1",
      ruleName: "Test",
      triggeredAt: "2024-01-01T00:00:00Z",
      message: "Alert!",
    };
    const result = AlarmEventSchema.parse(data);
    expect(result.triggeredAt).toBeInstanceOf(Date);
  });
});

describe("AlarmStorageSchema", () => {
  it("accepts valid storage data", () => {
    const data = {
      rules: [
        {
          id: "1",
          name: "Rule",
          enabled: true,
          triggers: [{ type: "interval", intervalMinutes: 10 }],
          filters: [],
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ],
      lastCheck: "2024-06-01T12:00:00Z",
    };
    const result = AlarmStorageSchema.parse(data);
    expect(result.rules).toHaveLength(1);
    expect(result.lastCheck).toBeInstanceOf(Date);
  });
});

describe("AppSettingsSchema", () => {
  it("accepts 24h format", () => {
    expect(AppSettingsSchema.parse({ timeFormat: "24h" })).toEqual({
      timeFormat: "24h",
    });
  });

  it("accepts 12h format", () => {
    expect(AppSettingsSchema.parse({ timeFormat: "12h" })).toEqual({
      timeFormat: "12h",
    });
  });

  it("rejects invalid format", () => {
    expect(AppSettingsSchema.safeParse({ timeFormat: "AM/PM" }).success).toBe(
      false,
    );
  });
});
