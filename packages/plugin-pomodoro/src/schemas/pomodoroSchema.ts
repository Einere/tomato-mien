import { z } from "zod";

export const PomodoroConfigSchema = z.object({
  workMinutes: z.number().int().min(1).max(120).default(25),
  shortBreakMinutes: z.number().int().min(1).max(60).default(5),
  longBreakMinutes: z.number().int().min(1).max(120).default(15),
  longBreakInterval: z.number().int().min(1).max(10).default(4),
  autoStart: z.boolean().default(false),
});

export const PomodoroStateSchema = z.enum([
  "idle",
  "working",
  "shortBreak",
  "longBreak",
]);

export const PomodoroSessionSchema = z.object({
  state: PomodoroStateSchema,
  remainingSeconds: z.number().int().min(0),
  completedCycles: z.number().int().min(0),
  isRunning: z.boolean(),
});

export type PomodoroConfig = z.infer<typeof PomodoroConfigSchema>;
export type PomodoroState = z.infer<typeof PomodoroStateSchema>;
export type PomodoroSession = z.infer<typeof PomodoroSessionSchema>;
