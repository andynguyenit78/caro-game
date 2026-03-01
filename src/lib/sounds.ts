// Sound effects using Web Audio API — no external files needed
const AudioContext =
    typeof window !== 'undefined'
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof window.AudioContext })
              .webkitAudioContext
        : null;

let audioCtx: InstanceType<typeof window.AudioContext> | null = null;

function getAudioCtx() {
    if (!audioCtx && AudioContext) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.15
) {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

export function playMoveSound() {
    playTone(600, 0.08, 'sine', 0.12);
}

export function playVictorySound() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    // Ascending chord: C E G C
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 120);
    });
}

export function playDefeatSound() {
    // Descending sad tones
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.35, 'triangle', 0.1), i * 150);
    });
}
