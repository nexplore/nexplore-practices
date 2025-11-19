// scripts/enforce-pnpm.cjs
const ua = process.env.npm_config_user_agent || '';
const isPnpm = ua.includes('pnpm');

if (!isPnpm) {
    console.error('\n🚫 This repo uses pnpm.');
    console.error('   Please run: pnpm install\n');
    process.exit(1);
}
