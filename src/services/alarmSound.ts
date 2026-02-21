const PING_FREQUENCY_HZ = 500;
const PING_DURATION_SEC = 0.5;
const PING_PEAK_GAIN = 0.3;
const PING_FADE_GAIN = 0.01;
const PING_ATTACK_SEC = 0.01;
const PING_COUNT = 3;
const PING_INTERVAL_SEC = 0.3;

const FALLBACK_SAMPLE_RATE = 44100;
const FALLBACK_DURATION_SEC = 0.5;
const FALLBACK_FREQUENCY_HZ = 800;
const FALLBACK_AMPLITUDE = 0.3;
const WAV_HEADER_SIZE = 44;
const PCM_MAX_VALUE = 32767;

// AudioContext를 재사용하여 suspended 상태 문제를 완화
let sharedAudioContext: AudioContext | null = null;

function getOrCreateAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new (
      window.AudioContext ||
      (window as never as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  }
  return sharedAudioContext;
}

async function ensureRunningContext(): Promise<AudioContext> {
  let ctx = getOrCreateAudioContext();
  console.debug("[AlarmSound] AudioContext state:", ctx.state);

  if (ctx.state === "suspended") {
    console.debug("[AlarmSound] Resuming suspended AudioContext...");
    await ctx.resume();
    console.debug("[AlarmSound] After resume:", ctx.state);
  }

  // resume 후에도 running이 아니면 새 컨텍스트 생성
  if (ctx.state !== "running") {
    console.debug("[AlarmSound] Still not running, creating new AudioContext");
    try {
      ctx.close();
    } catch {
      /* ignore */
    }
    sharedAudioContext = null;
    ctx = getOrCreateAudioContext();
    await ctx.resume();
    console.debug("[AlarmSound] New context state:", ctx.state);
  }

  if (ctx.state !== "running") {
    throw new Error(`AudioContext not running: ${ctx.state}`);
  }

  return ctx;
}

export async function playAlarmSound(): Promise<void> {
  console.debug("[AlarmSound] playAlarmSound called");
  try {
    const audioContext = await ensureRunningContext();

    // AudioContext 네이티브 스케줄링 사용 (setTimeout 대신)
    // → 백그라운드 탭 throttling 영향 없음, sample-accurate 타이밍
    const baseTime = audioContext.currentTime;
    for (let i = 0; i < PING_COUNT; i++) {
      playPing(audioContext, baseTime + i * PING_INTERVAL_SEC);
    }
    console.debug(
      "[AlarmSound] Scheduled",
      PING_COUNT,
      "pings at baseTime",
      baseTime,
    );
  } catch (error) {
    console.warn("[AlarmSound] AudioContext failed, trying fallback:", error);
    playFallbackSound();
  }
}

function playPing(audioContext: AudioContext, startTime: number): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(PING_FREQUENCY_HZ, startTime);
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(
    PING_PEAK_GAIN,
    startTime + PING_ATTACK_SEC,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    PING_FADE_GAIN,
    startTime + PING_DURATION_SEC,
  );

  oscillator.start(startTime);
  oscillator.stop(startTime + PING_DURATION_SEC);
}

function playFallbackSound(): void {
  console.debug("[AlarmSound] Playing fallback WAV sound");
  try {
    const audio = new Audio();
    const samples = Math.floor(FALLBACK_SAMPLE_RATE * FALLBACK_DURATION_SEC);
    const buffer = new ArrayBuffer(WAV_HEADER_SIZE + samples * 2);
    const view = new DataView(buffer);

    writeWavHeader(view, samples);
    writeSineWaveData(view, samples);

    const blob = new Blob([buffer], { type: "audio/wav" });
    audio.src = URL.createObjectURL(blob);
    audio.play().catch(error => {
      console.error("[AlarmSound] Fallback play() failed:", error);
    });
  } catch (error) {
    console.error("[AlarmSound] Fallback creation failed:", error);
  }
}

function writeString(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function writeWavHeader(view: DataView, samples: number): void {
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, FALLBACK_SAMPLE_RATE, true);
  view.setUint32(28, FALLBACK_SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples * 2, true);
}

function writeSineWaveData(view: DataView, samples: number): void {
  for (let i = 0; i < samples; i++) {
    const sample =
      Math.sin(
        (2 * Math.PI * FALLBACK_FREQUENCY_HZ * i) / FALLBACK_SAMPLE_RATE,
      ) * FALLBACK_AMPLITUDE;
    view.setInt16(WAV_HEADER_SIZE + i * 2, sample * PCM_MAX_VALUE, true);
  }
}
