/** @type {import('tailwindcss').Config} **/

const ktbeTheme = require('../practices-ui-ktbe/tailwind.config.js');

module.exports = {
    content: ['./practices-ui-ktbe/src/**/*.{html,ts}', './samples-ktbe/src/**/*.{html,ts}'],
    presets: [ktbeTheme],
};
