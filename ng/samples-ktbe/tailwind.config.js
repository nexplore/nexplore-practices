/** @type {import('tailwindcss').Config} **/

const path = require('path');
const ktbeTheme = require('../practices-ui-ktbe/tailwind.config.js');

module.exports = {
    content: [
        path.resolve(__dirname, '../practices-ui-ktbe/src/**/*.{html,ts}'),
        path.resolve(__dirname, './src/**/*.{html,ts}'),
    ],
    presets: [ktbeTheme],
};
