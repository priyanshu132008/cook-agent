import path from 'node:path';

const MEMORY_ROOT: string = path.join(process.cwd(), 'memory');

export function enforceSandbox(targetPath: string): string {
    const resolvedPath = path.resolve(targetPath);
    const normalizedResolved = resolvedPath.replace(/\\/g, '/');
    const normalizedRoot = MEMORY_ROOT.replace(/\\/g, '/');

    // Restrict all sandboxed access to the memory directory
    if (normalizedResolved !== normalizedRoot &&
        !normalizedResolved.startsWith(normalizedRoot + '/')) {
        throw new Error(`🛑 SANDBOX BREACH ATTEMPT: Access denied to ${resolvedPath}`);
    }

    // Hard-block sensitive configuration files
    if (resolvedPath.includes('.env')) {
        throw new Error(`🛑 SECURITY BREACH: The AI attempted to access the .env file.`);
    }

    return resolvedPath;
}