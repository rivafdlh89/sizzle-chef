// Sizzle Chef — tiny WebAudio bleeps, made in code (no sound files, no network).
// Every sound is one short oscillator burst; the game stays silent until the
// player first interacts, as browsers require.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      try {
        const AudioContext = window.AudioContext ?? window.webkitAudioContext;
        context = new AudioContext();
      } catch {
        context = null;
      }
    }
    if (context && context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function beep(frequency, seconds, type = 'sine', volume = 0.12, when = 0) {
    if (muted) return;
    const audio = ensure();
    if (!audio) return;
    const start = audio.currentTime + when;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + seconds);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.02);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    pickup() {
      beep(520, 0.07, 'triangle', 0.1);
    },
    place() {
      beep(340, 0.07, 'triangle', 0.1);
    },
    chop() {
      beep(180, 0.05, 'square', 0.08);
      beep(140, 0.05, 'square', 0.08, 0.06);
    },
    sizzle() {
      beep(900, 0.12, 'sawtooth', 0.04);
    },
    ready() {
      beep(660, 0.09, 'sine', 0.12);
      beep(880, 0.12, 'sine', 0.12, 0.09);
    },
    serve() {
      beep(784, 0.1, 'sine', 0.14);
      beep(1047, 0.16, 'sine', 0.14, 0.1);
    },
    fail() {
      beep(220, 0.18, 'sawtooth', 0.1);
      beep(160, 0.25, 'sawtooth', 0.1, 0.14);
    },
    tick() {
      beep(980, 0.05, 'sine', 0.06);
    },
  };
}
