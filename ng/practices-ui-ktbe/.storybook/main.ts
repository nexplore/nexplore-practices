import { StorybookConfig } from '@storybook/angular';
import mainRoot from '../../.storybook/main';

const config: StorybookConfig = {
    ...mainRoot,
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
};
export default config;
