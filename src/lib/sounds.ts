/**
 * Sound effects module — generates tones via the Web Audio API.
 *
 * All sounds respect the user's `caroSoundEnabled` localStorage setting.
 * The guard is centralised inside `playTone()` so individual functions
 * don't need to repeat the check.
 */

const AudioContext =
    typeof window !== 'undefined'
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof window.AudioContext })
              .webkitAudioContext
        : null;

let audioCtx: InstanceType<typeof window.AudioContext> | null = null;

/** Lazily create and cache a single AudioContext instance. */
function getAudioContext(): InstanceType<typeof window.AudioContext> | null {
    if (!audioCtx && AudioContext) {
        audioCtx = new AudioContext();
    }
    return audioCtx;
}

/** Check whether the user has muted game sounds via the profile settings. */
function isSoundEnabled(): boolean {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('caroSoundEnabled');
    return stored === null ? true : stored === 'true';
}

/**
 * Play a single oscillator tone.
 * This is the central sound primitive — it checks `isSoundEnabled()` once,
 * so callers don't need to guard individually.
 */
function playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.15
) {
    if (!isSoundEnabled()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/** Short "click" sound for placing a piece on the board. */
export function playMoveSound() {
    playTone(600, 0.08, 'sine', 0.12);
}

/** Ascending major chord (C-E-G-C) played on victory. */
export function playVictorySound() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 120);
    });
}

/** Descending sad tones played on defeat. */
export function playDefeatSound() {
    const notes = [400, 350, 300, 250];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.35, 'triangle', 0.1), i * 150);
    });
}

/** A quick, sharp frequency sweep simulating a sword slash. */
export function playSlashSound() {
    if (!isSoundEnabled()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
}
