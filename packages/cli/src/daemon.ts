import chalk from 'chalk';
import { execSync } from 'node:child_process';
import pm2 from 'pm2';
import path from 'node:path';

const DAEMON_NAME = 'cook-agent-daemon';

// ─────────────────────────────────────────────────────────────────────
// PM2 background daemon for the Telegram bot.
//
// We use the PM2 API directly (not the CLI wrapper) so the lifecycle hooks
// — pm2.connect / pm2.disconnect — run inside the same Node process and we
// can guarantee the parent CLI never hangs the user's terminal on exit.
// All three commands are fire-and-forget from the user's perspective.
// ─────────────────────────────────────────────────────────────────────

/** Build the absolute script path so PM2 can locate the daemon entry regardless
 *  of the user's `cwd`. PM2 runs `node script` from this path. */
function resolveScriptPath(): string {
    // CLI bin entry is `packages/cli/src/index.ts` — the same file the user
    // invokes interactively with `cook serve:telegram`. PM2 launches it with
    // args `serve:telegram` so the existing switch dispatches into startTelegram().
    return path.resolve(
        process.cwd(),
        'packages/cli/src/index.ts',
    );
}

/** Ask PM2 to launch the Telegram daemon in the background and detach. */
export function daemonStart(): Promise<void> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                // Daemon already running? PM2 still connects — only error if it's real.
                pm2.disconnect();
                return reject(err);
            }

            const startOpts: pm2.StartOptions = {
                name: DAEMON_NAME,
                script: resolveScriptPath(),
                args: ['serve:telegram'],
                // Node flags so .env loads and TypeScript can run natively under
                // Node 22's experimental strip-types mode.
                node_args: ['--env-file=.env', '--experimental-strip-types'],
                cwd: process.cwd(),
                // Detach so the daemon survives the parent CLI exiting. PM2 orphans it.
                autorestart: true,
                exec_mode: 'fork',
            };

            pm2.start(startOpts, (startErr) => {
                // Always release the PM2 client — otherwise the CLI will block on
                // exit indefinitely waiting for the PM2 RPC socket to close.
                pm2.disconnect();

                if (startErr) return reject(startErr);

                console.log(
                    chalk.hex('#00FF41')(
                        `\n✅ Cook Agent daemon is now running in the background.\n`,
                    ),
                );
                console.log(
                    chalk.gray(
                        `   ${chalk.white('cook daemon:logs')}  → stream daemon output\n` +
                        `   ${chalk.white('cook daemon:stop')}  → stop and remove daemon\n`,
                    ),
                );
                resolve();
            });
        });
    });
}

/** Ask PM2 to stop and remove the daemon process. Idempotent — calling on a
 *  daemon that's already gone is treated as a successful no-op. */
export function daemonStop(): Promise<void> {
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
                pm2.disconnect();
                return reject(err);
            }

            let stopErr: Error | null = null;
            let pending = 2;

            const finish = () => {
                pm2.disconnect();
                if (stopErr) reject(stopErr);
                else {
                    console.log(
                        chalk.hex('#00FF41')(
                            `\n✅ Cook Agent daemon stopped and removed.\n`,
                        ),
                    );
                    resolve();
                }
            };

            pm2.stop(DAEMON_NAME, (e) => {
                if (e && e.message && !/not found/i.test(e.message)) stopErr = e;
                if (--pending === 0) finish();
            });

            pm2.delete(DAEMON_NAME, (e) => {
                if (e && e.message && !/not found/i.test(e.message)) stopErr = e;
                if (--pending === 0) finish();
            });
        });
    });
}

/** Spawn `npx pm2 logs cook-agent-daemon` in the foreground with stdio inherit.
 *  The user sees the same output they would from running PM2 directly, and the
 *  command blocks until they hit Ctrl+C. Uses execSync so the parent CLI
 *  process stays the foreground owner of the TTY. */
export function daemonLogs(): void {
    try {
        execSync(`npx pm2 logs ${DAEMON_NAME}`, { stdio: 'inherit' });
    } catch (e: any) {
        // execSync only throws if the underlying process exits with a non-zero
        // status — Ctrl+C counts. Swallow it: the user's intent was to kill the
        // stream, not to surface a stack trace.
        if (e?.status !== undefined && (e.signal === 'SIGINT' || e.signal === 'SIGTERM' || e.status === 130)) {
            console.log(chalk.gray('\n[logs] stream closed'));
            return;
        }
        console.log(chalk.red(`\n❌ Failed to stream logs: ${e?.message ?? String(e)}`));
    }
}
