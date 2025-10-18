import type { AlarmRule, AlarmEvent } from '../types/alarm';

export class WebWorkerAlarmService {
  private static instance: WebWorkerAlarmService;
  private worker: Worker | null = null;
  private rules: AlarmRule[] = [];
  private onAlarmTriggered?: (event: AlarmEvent) => void;
  private lastCheckTime: Date | null = null;

  private constructor() {
    this.initializeWorker();
  }

  public static getInstance(): WebWorkerAlarmService {
    if (!WebWorkerAlarmService.instance) {
      WebWorkerAlarmService.instance = new WebWorkerAlarmService();
    }
    return WebWorkerAlarmService.instance;
  }

  private initializeWorker() {
    try {
      // 원래의 파일 기반 Web Worker 사용
      this.worker = new Worker(
        new URL('../workers/alarmWorker.ts', import.meta.url),
        {
          type: 'module',
        },
      );

      // 워커 메시지 리스너
      this.worker.onmessage = event => {
        const { type, data } = event.data;

        switch (type) {
          case 'ALARM_TRIGGERED':
            this.handleAlarmTriggered(data);
            break;
          case 'LAST_CHECK_TIME_UPDATE':
            this.lastCheckTime = new Date(data.lastCheckTime);
            break;
        }
      };

      // 워커 에러 처리
      this.worker.onerror = error => {
        console.error('Alarm Worker Error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize alarm worker:', error);
      // 워커 생성 실패 시 폴백으로 기존 방식 사용
      this.fallbackToMainThread();
    }
  }

  private fallbackToMainThread() {
    console.warn('Web Worker not supported, falling back to main thread');
    // 폴백 로직은 필요시 구현
  }

  private handleAlarmTriggered(event: AlarmEvent) {
    // 브라우저 알림
    if (Notification.permission === 'granted') {
      new Notification(event.ruleName, {
        body: event.message,
        icon: '/vite.svg',
        tag: event.ruleId,
      });
    }

    // 알람 소리 재생
    this.playAlarmSound();

    // 콜백 호출
    if (this.onAlarmTriggered) {
      this.onAlarmTriggered(event);
    }

    console.log('Alarm triggered:', event);
  }

  // 알람 소리 재생
  private playAlarmSound(): void {
    try {
      // Web Audio API를 사용한 알람 소리 생성
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      function playPingSound() {
        // 500Hz 주파수로 0.5초간 재생
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.3,
          audioContext.currentTime + 0.01,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }

      // 3번의 핑 사운드 재생
      playPingSound();
      setTimeout(() => {
        playPingSound();
      }, 300);
      setTimeout(() => {
        playPingSound();
      }, 600);
    } catch (error) {
      console.warn('Failed to play alarm sound:', error);
      // Web Audio API가 지원되지 않는 경우 대체 방법
      this.playFallbackSound();
    }
  }

  // 대체 알람 소리 (Web Audio API 미지원 시)
  private playFallbackSound(): void {
    try {
      // HTML5 Audio를 사용한 간단한 알람 소리
      const audio = new Audio();
      // data URL로 간단한 사인파 생성
      const sampleRate = 44100;
      const duration = 0.5;
      const frequency = 800;
      const samples = Math.floor(sampleRate * duration);
      const buffer = new ArrayBuffer(44 + samples * 2);
      const view = new DataView(buffer);

      // WAV 헤더 작성
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, 'RIFF');
      view.setUint32(4, 36 + samples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, samples * 2, true);

      // 사인파 데이터 생성
      for (let i = 0; i < samples; i++) {
        const sample =
          Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      audio.src = URL.createObjectURL(blob);
      audio.play().catch(() => {
        console.warn('Failed to play fallback alarm sound');
      });
    } catch (error) {
      console.warn('Failed to create fallback alarm sound:', error);
    }
  }

  // 알람 서비스 시작
  public start(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'START_ALARM' });
    }
  }

  // 알람 서비스 중지
  public stop(): void {
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP_ALARM' });
    }
  }

  // 규칙 업데이트
  public updateRules(rules: AlarmRule[]): void {
    this.rules = rules;
    if (this.worker) {
      this.worker.postMessage({
        type: 'UPDATE_RULES',
        data: { rules },
      });
    }
  }

  // 개별 규칙 업데이트
  public updateRule(rule: AlarmRule): void {
    // 로컬 rules 배열에서 해당 규칙 찾아서 업데이트
    const index = this.rules.findIndex(r => r.id === rule.id);
    if (index !== -1) {
      this.rules[index] = rule;
    } else {
      this.rules.push(rule);
    }

    if (this.worker) {
      this.worker.postMessage({
        type: 'UPDATE_RULE',
        data: { rule },
      });
    }
  }

  // 알람 콜백 설정
  public setAlarmCallback(callback: (event: AlarmEvent) => void): void {
    this.onAlarmTriggered = callback;
  }

  // 알림 권한 요청
  public async requestNotificationPermission(): Promise<boolean> {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // 워커 정리
  public destroy(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }

  // 현재 활성화된 규칙 수 반환
  public getActiveRuleCount(): number {
    return this.rules.filter(rule => rule.enabled).length;
  }

  // 마지막 체크 시간 반환
  public getLastCheckTime(): Date | null {
    return this.lastCheckTime;
  }
}
