import { StorybookConfig } from '@storybook/angular';
import mainRoot from '../../.storybook/main';

const config: StorybookConfig = {
    ...mainRoot,
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    staticDirs: [...(mainRoot.staticDirs ?? []), { from: '../../samples-ktbe/src/assets', to: '/assets' }],
};
export default config;
