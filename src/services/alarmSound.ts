const PING_FREQUENCY_HZ = 500;
const PING_DURATION_SEC = 0.5;
const PING_PEAK_GAIN = 0.3;
const PING_FADE_GAIN = 0.01;
const PING_ATTACK_SEC = 0.01;
const PING_COUNT = 3;
const PING_INTERVAL_MS = 300;

const FALLBACK_SAMPLE_RATE = 44100;
const FALLBACK_DURATION_SEC = 0.5;
const FALLBACK_FREQUENCY_HZ = 800;
const FALLBACK_AMPLITUDE = 0.3;
const WAV_HEADER_SIZE = 44;
const PCM_MAX_VALUE = 32767;

export function playAlarmSound(): void {
  try {
    const audioContext = new (
      window.AudioContext ||
      (window as never as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();

    for (let i = 0; i < PING_COUNT; i++) {
      setTimeout(() => playPing(audioContext), i * PING_INTERVAL_MS);
    }
  } catch {
    playFallbackSound();
  }
}

function playPing(audioContext: AudioContext): void {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(
    PING_FREQUENCY_HZ,
    audioContext.currentTime,
  );
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    PING_PEAK_GAIN,
    audioContext.currentTime + PING_ATTACK_SEC,
  );
  gainNode.gain.exponentialRampToValueAtTime(
    PING_FADE_GAIN,
    audioContext.currentTime + PING_DURATION_SEC,
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + PING_DURATION_SEC);
}

function playFallbackSound(): void {
  try {
    const audio = new Audio();
    const samples = Math.floor(FALLBACK_SAMPLE_RATE * FALLBACK_DURATION_SEC);
    const buffer = new ArrayBuffer(WAV_HEADER_SIZE + samples * 2);
    const view = new DataView(buffer);

    writeWavHeader(view, samples);
    writeSineWaveData(view, samples);

    const blob = new Blob([buffer], { type: "audio/wav" });
    audio.src = URL.createObjectURL(blob);
    audio.play().catch(() => {
      console.warn("Failed to play fallback alarm sound");
    });
  } catch {
    console.warn("Failed to create fallback alarm sound");
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
