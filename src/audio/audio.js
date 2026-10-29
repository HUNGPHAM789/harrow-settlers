/**
 * Audio system for Harrow Settlers.
 * Synthesizes SFX via WebAudio and generates gentle ambient music & nature soundscapes.
 */

const STORAGE_MUTE_KEY = 'harrow_audio_muted';
const STORAGE_SFX_KEY = 'harrow_audio_sfx_vol';
const STORAGE_MUSIC_KEY = 'harrow_audio_music_vol';

const PENTATONIC_FREQ = [
  130.81, // C3
  146.83, // D3
  164.81, // E3
  196.00, // G3
  220.00, // A3
  261.63, // C4
  293.66, // D4
  329.63, // E4
  392.00, // G4
  440.00, // A4
  523.25, // C5
  587.33, // D5
  659.25, // E5
  783.99, // G5
  880.00  // A5
];

export class Audio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.natureGain = null;

    this.muted = false;
    this.sfxVol = 0.8;
    this.musicVol = 0.3;

    this.unlocked = false;
    this.lastPlayTime = {};
    this.rateLimitMs = 60;

    this.musicTimer = null;
    this.nextBeatTime = 0;
    this.nextPadTime = 0;
    this.natureSource = null;

    this._loadSettings();
  }

  _loadSettings() {
    try {
      this.muted = localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
      const s = localStorage.getItem(STORAGE_SFX_KEY);
      if (s !== null) this.sfxVol = parseFloat(s);
      const m = localStorage.getItem(STORAGE_MUSIC_KEY);
      if (m !== null) this.musicVol = parseFloat(m);
    } catch (e) {
      // Ignore localStorage restrictions
    }
  }

  unlockOnGesture() {
    if (this.unlocked && this.ctx && this.ctx.state === 'running') return;
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (!this.masterGain) {
        this._initAudioNodes();
        this._startAmbientMusic();
        this._startNatureNoise();
      }

      this.unlocked = true;
    } catch (e) {
      // Never throw if AudioContext unavailable
    }
  }

  _initAudioNodes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, t);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVol, t);
    this.sfxGain.connect(this.masterGain);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVol, t);
    this.musicGain.connect(this.masterGain);

    this.natureGain = this.ctx.createGain();
    this.natureGain.gain.setValueAtTime(0.25, t);
    this.natureGain.connect(this.musicGain);
  }

  setMuted(b) {
    this.muted = !!b;
    try {
      localStorage.setItem(STORAGE_MUTE_KEY, this.muted ? 'true' : 'false');
    } catch (e) {}
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  isMuted() {
    return this.muted;
  }

  setMusicVolume(v) {
    this.musicVol = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem(STORAGE_MUSIC_KEY, this.musicVol.toString());
    } catch (e) {}
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    }
  }

  setSfxVolume(v) {
    this.sfxVol = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem(STORAGE_SFX_KEY, this.sfxVol.toString());
    } catch (e) {}
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    }
  }

  play(name, opts = {}) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;

    const now = performance.now();
    if (this.lastPlayTime[name] && (now - this.lastPlayTime[name]) < this.rateLimitMs) {
      return;
    }
    this.lastPlayTime[name] = now;

    try {
      const vol = opts.volume !== undefined ? opts.volume : 1;
      const pan = opts.pan !== undefined ? opts.pan : 0;

      let dest = this.sfxGain;
      if (pan !== 0 && this.ctx.createStereoPanner) {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), this.ctx.currentTime);
        panner.connect(this.sfxGain);
        dest = panner;
      }

      switch (name) {
        case 'click':
          this._synthClick(dest, vol);
          break;
        case 'place':
          this._synthPlace(dest, vol);
          break;
        case 'build_done':
          this._synthBuildDone(dest, vol);
          break;
        case 'error':
          this._synthError(dest, vol);
          break;
        case 'chop':
          this._synthChop(dest, vol);
          break;
        case 'mine':
          this._synthMine(dest, vol);
          break;
        case 'victory':
          this._synthVictory(dest, vol);
          break;
        case 'born':
          this._synthBorn(dest, vol);
          break;
        case 'warn':
          this._synthWarn(dest, vol);
          break;
        default:
          break;
      }
    } catch (e) {
      // Never throw
    }
  }

  // SFX Synthesizers
  _synthClick(dest, vol) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.025);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.12 * vol, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  _synthPlace(dest, vol) {
    const t = this.ctx.currentTime;

    [220, 330].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq * 1.1, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.18 * vol, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.13);
    });
  }

  _synthBuildDone(dest, vol) {
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];

    notes.forEach((freq, idx) => {
      const startTime = t + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.15 * vol, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(startTime);
      osc.stop(startTime + 0.36);
    });
  }

  _synthError(dest, vol) {
    const t = this.ctx.currentTime;
    [0, 0.09].forEach((offset) => {
      const st = t + offset;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, st);
      osc.frequency.linearRampToValueAtTime(120, st + 0.07);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.15 * vol, st + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.07);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(st);
      osc.stop(st + 0.08);
    });
  }

  _synthChop(dest, vol) {
    const t = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.06;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, t);
    filter.Q.setValueAtTime(2.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, t);
    noiseGain.gain.linearRampToValueAtTime(0.25 * vol, t + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);

    noise.start(t);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.06);

    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.2 * vol, t + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(oscGain);
    oscGain.connect(dest);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  _synthMine(dest, vol) {
    const t = this.ctx.currentTime;

    [1760, 2640].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime((idx === 0 ? 0.15 : 0.08) * vol, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.16);
    });

    const oscTap = this.ctx.createOscillator();
    const gainTap = this.ctx.createGain();
    oscTap.type = 'triangle';
    oscTap.frequency.setValueAtTime(320, t);
    oscTap.frequency.exponentialRampToValueAtTime(100, t + 0.04);

    gainTap.gain.setValueAtTime(0.001, t);
    gainTap.gain.linearRampToValueAtTime(0.12 * vol, t + 0.002);
    gainTap.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    oscTap.connect(gainTap);
    gainTap.connect(dest);

    oscTap.start(t);
    oscTap.stop(t + 0.05);
  }

  _synthVictory(dest, vol) {
    const t = this.ctx.currentTime;
    const sequence = [
      { tOffset: 0.0, freqs: [261.63, 329.63, 392.00] },
      { tOffset: 0.18, freqs: [349.23, 440.00, 523.25] },
      { tOffset: 0.36, freqs: [392.00, 493.88, 587.33] },
      { tOffset: 0.54, freqs: [523.25, 659.25, 783.99, 1046.50] }
    ];

    sequence.forEach((step) => {
      const st = t + step.tOffset;
      step.freqs.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, st);

        gain.gain.setValueAtTime(0.001, st);
        gain.gain.linearRampToValueAtTime(0.1 * vol, st + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(st);
        osc.stop(st + 0.51);
      });
    });
  }

  _synthBorn(dest, vol) {
    const t = this.ctx.currentTime;
    const freqs = [349.23, 440.00, 523.25, 698.46];
    freqs.forEach((freq, i) => {
      const st = t + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, st + 0.08);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.12 * vol, st + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(st);
      osc.stop(st + 0.1);
    });
  }

  _synthWarn(dest, vol) {
    const t = this.ctx.currentTime;
    [659.25, 493.88].forEach((freq, idx) => {
      const st = t + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, st);

      gain.gain.setValueAtTime(0.001, st);
      gain.gain.linearRampToValueAtTime(0.12 * vol, st + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(st);
      osc.stop(st + 0.23);
    });
  }

  // Generative Ambient Music
  _startAmbientMusic() {
    this.nextBeatTime = this.ctx.currentTime + 0.5;
    this.nextPadTime = this.ctx.currentTime + 1.0;

    const schedule = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      while (this.nextBeatTime < now + 1.5) {
        if (Math.random() < 0.38) {
          const noteIndex = 8 + Math.floor(Math.random() * 7);
          const freq = PENTATONIC_FREQ[noteIndex];
          this._playPluck(freq, this.nextBeatTime);
        }
        this.nextBeatTime += 0.55 + Math.random() * 0.2;
      }

      if (now >= this.nextPadTime) {
        this._playPadChord(now);
        this.nextPadTime = now + 7.0 + Math.random() * 4.0;
      }
    };

    this.musicTimer = setInterval(schedule, 300);
  }

  _playPluck(freq, time) {
    if (!this.ctx || !this.musicGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.035, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.58);
  }

  _playPadChord(time) {
    if (!this.ctx || !this.musicGain) return;

    const rootIdx = Math.floor(Math.random() * 4);
    const chordNotes = [
      PENTATONIC_FREQ[rootIdx],
      PENTATONIC_FREQ[rootIdx + 2 + Math.floor(Math.random() * 2)],
      PENTATONIC_FREQ[rootIdx + 4 + Math.floor(Math.random() * 2)]
    ];

    chordNotes.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq * (1 + (Math.random() * 0.004 - 0.002)), time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);

      const attack = 2.0;
      const hold = 2.5;
      const release = 2.5;

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(0.025, time + attack);
      gain.gain.setValueAtTime(0.025, time + attack + hold);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + hold + release);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + attack + hold + release + 0.1);
    });
  }

  _startNatureNoise() {
    if (!this.ctx || !this.natureGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noiseSource.connect(filter);
      filter.connect(this.natureGain);

      lfo.start();
      noiseSource.start();

      this.natureSource = noiseSource;
    } catch (e) {
      // Ignore audio synthesis error if restricted
    }
  }
}

export default Audio;
