export function compressMemory(rawMemory: string): string {
    console.log('🗜️ Compressing memory to save context window...');

    // In the future, we will use an LLM to summarize this.
    // For now, if the memory is over 1000 characters, we truncate it and add a summary flag.
    if (rawMemory.length > 1000) {
        const start = rawMemory.substring(0, 400);
        const end = rawMemory.substring(rawMemory.length - 400);
        return `${start}\n\n...[SYSTEM: ${rawMemory.length - 800} characters compressed]...\n\n${end}`;
    }

    return rawMemory;
}