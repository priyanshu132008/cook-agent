// Headless-mode helpers for skill runners.
//
// The Telegram daemon runs every skill with `__COOK_NONINTERACTIVE__ = true`.
// In that environment we must NEVER call clack's `spinner()` because its
// `setInterval` re-renders the current message on every tick (~80ms) and,
// without a real TTY, each tick appends a new line of text instead of
// overwriting — producing thousands of duplicate "Synthesizing..." lines
// in a single response. See the clack source: the render loop writes
// `process.stdout.write(\`${W}  ${o}${_}\`)` and relies on a cursor-up
// sequence (Z.move) to clear the previous frame; in our captured-stdout
// setup that sequence is stripped, so the buffer just grows.
//
// These helpers preserve the existing clack spinner shape in TTY mode and
// become no-op sinks in headless mode. Skill call sites do not change.

import { intro, outro, spinner } from '@clack/prompts';

export const NONINTERACTIVE_FLAG = '__COOK_NONINTERACTIVE__';

export function isNonInteractive(): boolean {
    return !!(globalThis as any)[NONINTERACTIVE_FLAG];
}

/** Shape returned by both the real clack spinner and the headless stub.
 *  Skills only touch start/message/stop, so this is the full contract. */
export interface SpinnerLike {
    start(message?: string): void;
    message(message: string): void;
    stop(message?: string): void;
}

/** Returns a clack spinner when on a real TTY; otherwise returns a silent
 *  stub. The stub is a true no-op — no setInterval, no console writes —
 *  so the captured stdout in headless mode contains only what the skill
 *  body itself deliberately prints (the final LLM report, file paths, etc.). */
export function headlessSpinner(): SpinnerLike {
    if (isNonInteractive()) {
        return SILENT_SPINNER;
    }
    const s = spinner();
    return {
        start: (msg?: string) => s.start(msg ?? ''),
        message: (msg: string) => s.message(msg),
        stop: (msg?: string) => s.stop(msg ?? ''),
    };
}

const SILENT_SPINNER: SpinnerLike = {
    start: () => { /* silent in headless */ },
    message: () => { /* silent in headless */ },
    stop: () => { /* silent in headless */ },
};

/** Replaces `console.clear() + intro(label)` with a headless-safe equivalent.
 *  In headless mode the operator's terminal (which is the daemon's PM2 log
 *  buffer) is preserved and no banner is drawn. */
export function introSafe(label: string): void {
    if (isNonInteractive()) return;
    console.clear();
    intro(label);
}

/** Replaces a bare `outro(label)` with a headless-safe equivalent. */
export function outroSafe(label: string): void {
    if (isNonInteractive()) return;
    outro(label);
}
