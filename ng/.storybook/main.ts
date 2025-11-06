// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-webpack5)
import type { StorybookConfig } from '@storybook/types';
const config: Partial<StorybookConfig> = {
    addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
    docs: {
        autodocs: 'tag',
    },
    framework: {
        name: '@storybook/angular',
        options: {},
    },
};
export default config;
