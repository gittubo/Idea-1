"use client";

/**
 * VESTIGE's sound identity, synthesised so no audio file loads unless the visitor asks:
 * a low, almost imperceptible tone over filtered room noise. Starts only from a user
 * gesture (browsers block audio otherwise) and never plays loudly.
 */
class AmbientSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  start() {
    if (typeof window === "undefined") return;
    if (!this.ctx) this.build();
    const ctx = this.ctx!;
    void ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setTargetAtTime(0.06, ctx.currentTime, 1.2);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
  }

  /** Lower the room while the visitor focuses on a work. */
  focus(on: boolean) {
    if (!this.ctx || !this.master || this.master.gain.value === 0) return;
    this.master.gain.setTargetAtTime(on ? 0.03 : 0.06, this.ctx.currentTime, 0.8);
  }

  private build() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Tonal signature: two low sines a fifth apart, slowly breathing.
    for (const [freq, level] of [[55, 0.5], [82.4, 0.25]] as const) {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.value = level;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.05 + freq / 4000;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = level * 0.4;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(master);
      osc.start();
      lfo.start();
    }

    // Room tone: brown-ish noise through a low-pass filter.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.9;
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();

    this.ctx = ctx;
    this.master = master;
  }
}

export const ambientSound = new AmbientSound();
