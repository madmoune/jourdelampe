const MELODY = [
  64, 0, 67, 71, 69, 67, 64, 62, 65, 0, 69, 72, 74, 72, 69, 67,
  64, 67, 72, 76, 74, 72, 71, 69, 67, 0, 62, 66, 69, 67, 66, 62,
] as const;
const BASS = [40, 40, 43, 43, 41, 41, 45, 45, 48, 48, 47, 47, 43, 43, 38, 38] as const;
const BEAT = 0.145;

export class BattleMusic {
  private context: AudioContext | null = null;
  private timer: number | null = null;
  private next = 0;
  private index = 0;

  constructor(private readonly browser: Window & typeof globalThis) {}

  async start(): Promise<void> {
    if (this.context) return;
    const context = new this.browser.AudioContext();
    this.context = context;
    try {
      await context.resume();
      if (this.context !== context) return;
      if (context.state !== 'running') throw new Error('Audio indisponible.');
      this.index = 0;
      this.next = context.currentTime + 0.025;
      this.queue(context);
      this.timer = this.browser.setInterval(() => this.queue(context), 55);
    } catch (error) {
      if (this.context === context) this.stop();
      throw error;
    }
  }

  stop(): void {
    if (this.timer !== null) this.browser.clearInterval(this.timer);
    this.timer = null;
    const context = this.context;
    this.context = null;
    void context?.close().catch(() => {});
  }

  private queue(context: AudioContext): void {
    if (this.context !== context) return;
    if (this.next < context.currentTime) this.next = context.currentTime + 0.025;
    while (this.next < context.currentTime + 0.22) {
      const note = MELODY[this.index % MELODY.length];
      if (note) this.note(context, note, this.next, BEAT * 0.76, 'square', 0.035);
      if (this.index % 2 === 0) {
        const bass = BASS[Math.floor(this.index / 2) % BASS.length];
        this.note(context, bass, this.next, BEAT * 1.55, 'triangle', 0.075);
      }
      this.index++;
      this.next += BEAT;
    }
  }

  private note(
    context: AudioContext, midi: number, time: number, duration: number,
    waveform: OscillatorType, volume: number,
  ): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = waveform;
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(time);
    oscillator.stop(time + duration);
  }
}
