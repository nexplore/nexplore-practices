// .storybook/main.ts

import type { StorybookConfig } from '@storybook/angular';
const config: Partial<StorybookConfig> = {
    addons: ['@storybook/addon-links', '@storybook/addon-docs'],
    framework: {
        name: '@storybook/angular',
        options: {},
    },
};
export default config;
