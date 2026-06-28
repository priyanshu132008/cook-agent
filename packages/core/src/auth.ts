import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const REGISTRY_PATH = fileURLToPath(new URL('./registry/index.json', import.meta.url));

export async function verifySkillAuth(skillName: string): Promise<boolean> {
    const rawRegistry = await fs.readFile(REGISTRY_PATH, 'utf-8');
    const registry = JSON.parse(rawRegistry);

    const skill = registry.skills[skillName];
    if (!skill) {
        console.error(`❌ SECURITY: Skill '${skillName}' is not registered in the manifest.`);
        return false;
    }

    if (skill.dangerous) {
        console.warn(`⚠️ WARNING: Agent is requesting a DANGEROUS skill: ${skillName}`);
    }

    console.log(`🔐 Auth verified for skill: ${skillName}`);
    return true;
}