/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const tooltipArrowPlugin = require('./tailwind-tooltip-arrow.plugin');

// Colors of the KTBE style guide, exposed as `text-*`, `bg-*`, `border-*`, ... utilities.
const colors = {
    transparent: 'transparent',
    red: '#EA161F',
    black: '#000000',
    'light-sand': '#FCF8F3',
    sand: '#FAF1E3',
    'dark-sand': '#F7E9D2',
    'sand-hover': '#F2E0C3',
    cappuchino: '#EBD3AE',
    anthrazit: 'rgba(78,78,78,0.95)',
    'anthrazit-solid': '#565656',
    'anthrazit-hover': '#404040',
    'dark-gray': 'rgba(112,112,112,1)',
    'dark-gray-68': 'rgba(112,112,112,0.68)',
    'dark-gray-50': 'rgba(112,112,112,0.50)',
    'dark-gray-50-solid': '#B6B6B6',
    gray: '#DEDEDE',
    'light-gray': '#F2F2F2',
    'very-light-gray': '#F8F8F8',
    white: '#FFFFFF',
    'red-hover': '#D01018',
    green: '#3D8608',
    'success-green': '#DCF7D2',
};

// Line heights of the KTBE typography. Used by the font sizes below and exposed as `leading-ktbe-*` utilities.
const lineHeights = {
    'ktbe-extra-small': '1.125rem',
    'ktbe-very-small': '1.0625rem',
    'ktbe-small': '1.125rem',
    'ktbe-logo-caption': '1.0625rem',
    'ktbe-base': '1.625rem',
    'ktbe-intro-text': '1.75rem',
    'ktbe-h6': '1.3125rem',
    'ktbe-h5': '1.5625rem',
    'ktbe-h4': '1.75rem',
    'ktbe-h3': '2rem',
    'ktbe-large': '2.25rem',
    'ktbe-h2': '2.25rem',
    'ktbe-h1': '3.875rem',
    'ktbe-very-large': '4.625rem',
};

// Font sizes of the KTBE typography, exposed as `text-*` utilities together with the matching line height.
const fontSizes = {
    'extra-small': '0.75rem',
    'very-small': '0.8125rem',
    small: '0.875rem',
    'logo-caption': '1rem',
    base: '1rem',
    'intro-text': '1.125rem',
    h6: '1.125rem',
    h5: '1.3125rem',
    h4: '1.5rem',
    h3: '1.625rem',
    large: '1.75rem',
    h2: '1.875rem',
    h1: '3.375rem',
    'very-large': '4.0625rem',
};

// Breakpoints of the KTBE layout, exposed as `xs:`, `sm:`, ... variants.
const screens = {
    xs: '375px',
    sm: '600px',
    md: '900px',
    lg: '1180px',
    xl: '1480px',
};

module.exports = {
    // Sources of the library, relative to this file: the sources in this repository and the compiled bundles in the
    // published package (consumers import this preset through the shipped tailwind.css).
    content: ['./src/**/*.{html,ts}', './fesm2022/**/*.mjs'],
    theme: {
        colors,
        // The values are defined as constants above and referenced directly: inside this preset (function-valued theme sections
        // and plugins) Tailwind 4 resolves `theme('colors.*')`, `theme('fontSize.*')` and `theme('screens.*')` against its
        // default theme instead of the values of this preset.
        fontSize: {
            'extra-small': [fontSizes['extra-small'], { lineHeight: lineHeights['ktbe-extra-small'] }],
            'very-small': [fontSizes['very-small'], { lineHeight: lineHeights['ktbe-very-small'] }],
            small: [fontSizes.small, { lineHeight: lineHeights['ktbe-small'] }],
            'logo-caption': [fontSizes['logo-caption'], { lineHeight: lineHeights['ktbe-logo-caption'] }],
            base: [fontSizes.base, { lineHeight: lineHeights['ktbe-base'] }],
            'intro-text': [fontSizes['intro-text'], { lineHeight: lineHeights['ktbe-intro-text'] }],
            h6: [fontSizes.h6, { lineHeight: lineHeights['ktbe-h6'] }],
            h5: [fontSizes.h5, { lineHeight: lineHeights['ktbe-h5'] }],
            h4: [fontSizes.h4, { lineHeight: lineHeights['ktbe-h4'] }],
            h3: [fontSizes.h3, { lineHeight: lineHeights['ktbe-h3'] }],
            large: [fontSizes.large, { lineHeight: lineHeights['ktbe-large'] }],
            h2: [fontSizes.h2, { lineHeight: lineHeights['ktbe-h2'] }],
            h1: [fontSizes.h1, { lineHeight: lineHeights['ktbe-h1'] }],
            'very-large': [fontSizes['very-large'], { lineHeight: lineHeights['ktbe-very-large'] }],
        },
        fontWeight: {
            thin: '100',
            light: '300',
            normal: '400',
            medium: '500',
            bold: '700',
        },
        screens,
        extend: {
            fontFamily: {
                sans: ['Roboto', ...defaultTheme.fontFamily.sans],
            },
            lineHeight: lineHeights,
            spacing: {
                'ktbe-4.5': '1.125rem',
                'ktbe-5.5': '1.375rem',
                'ktbe-7.5': '1.875rem',
                'ktbe-15': '3.75rem',
            },
            borderWidth: {
                'ktbe-6': '6px',
            },
            boxShadow: {
                sidepane: 'rgba(0, 0, 0, 0.16) 0px 3px 6px',
                stickyHeader: '0 6px 24px -20px rgba(0, 0, 0, 0.5)',
            },
            keyframes: {
                pop: {
                    '50%': { transform: 'scale(1.25)' },
                },
            },
            animation: {
                pop: 'pop 0.7s linear 1',
            },
            minHeight: ({ theme }) => ({
                ...theme('height'),
            }),
            minWidth: ({ theme }) => ({
                ...theme('width'),
            }),
            maxHeight: ({ theme }) => ({
                ...theme('height'),
            }),
            maxWidth: ({ theme }) => ({
                ...theme('width'),
            }),
            scrollbarGutter: {
                stable: 'stable',
                'stable-both': 'stable both-edges',
            },
        },
        tooltipArrows: (() => {
            const common = {
                borderColor: colors.gray,
                borderWidth: 1,
                backgroundColor: colors.white,
                size: 10,
            };
            return {
                arrowtip: {
                    ...common,
                    offset: 10,
                },
                'arrowtip-start': {
                    ...common,
                    offset: 10,
                },
                'arrowtip-center': {
                    ...common,
                    offset: `calc(50% - 5px)`,
                },
                'arrowtip-end': {
                    ...common,
                    offset: `calc(100% - 10px)`,
                },
            };
        })(),
    },
    plugins: [
        tooltipArrowPlugin(),
        plugin(function ({ addBase, theme, addComponents, addUtilities }) {
            addBase({
                h1: headingStylingRules(theme).h1,
                h2: headingStylingRules(theme).h2,
                h3: headingStylingRules(theme).h3,
                h4: headingStylingRules(theme).h4,
                h5: headingStylingRules(theme).h5,
                h6: headingStylingRules(theme).h6,
                p: {
                    fontSize: fontSizes.base,
                    lineHeight: theme('lineHeight.ktbe-base'),
                    fontWeight: theme('fontWeight.light'),
                },
                small: {
                    fontSize: fontSizes.small,
                    lineHeight: theme('lineHeight.ktbe-small'),
                    fontWeight: theme('fontWeight.normal'),
                },
                a: {
                    fontSize: fontSizes.base,
                    lineHeight: theme('lineHeight.ktbe-base'),
                    fontWeight: theme('fontWeight.light'),
                    textDecoration: 'underline',
                },
                'a:hover': {
                    color: colors.red,
                    cursor: 'pointer',
                },
                ul: {
                    listStyleType: 'square',
                    lineHeight: theme('lineHeight.ktbe-base'),
                    margin: '2.25rem 0 2.25rem 1.25rem',
                    fontWeight: theme('fontWeight.light'),
                },
                li: {
                    margin: '0 0 0 0.75rem',
                },
                'li::marker': {
                    color: colors.red,
                },
                /* <ul> elements are sometimes used for non-list components e.g. navigation or menu.
                    Make sure those components have the class 'list-none' set, so that the default styles of <ul> elements are not applied */
                'ul.list-none, ul.list-none>li': {
                    margin: '0',
                },
                // Tailwind 4 no longer sets `cursor: pointer` on buttons. Keep the Tailwind 3 behaviour for KTBE.
                'button:not(:disabled), [role="button"]:not(:disabled)': {
                    cursor: 'pointer',
                },
                body: {
                    // Provide a global default fill value for svg based icons, using the inherited text `color`.
                    // Has to be globally so that it can still be overridden using the `fill` css property
                    fill: 'currentColor',
                },
            });
            addComponents({
                '.h1': headingStylingRules(theme).h1,
                '.h2': headingStylingRules(theme).h2,
                '.h3': headingStylingRules(theme).h3,
                '.h4': headingStylingRules(theme).h4,
                '.h5': headingStylingRules(theme).h5,
                '.h6': headingStylingRules(theme).h6,
                '.scrollbar-thin': scrollbarThinRule(theme),
            });
            addUtilities({
                '.scrollbar-gutter-stable': {
                    'scrollbar-gutter': 'stable',
                },
                '.scrollbar-gutter-stable-both': {
                    'scrollbar-gutter': 'stable both-edges',
                },
            });
        }),
    ],
};

const headingStylingRules = (theme) => {
    return {
        h1: {
            fontSize: fontSizes.h1,
            lineHeight: theme('lineHeight.ktbe-h1'),
            fontWeight: theme('fontWeight.thin'),
            margin: `0 0 2.75rem 0`,

            [`@media (max-width: ${screens.md})`]: {
                fontSize: '3rem',
                lineHeight: '3.5rem',
                margin: `0 0 1.75rem 0`,
            },

            [`@media (max-width: ${screens.sm})`]: {
                fontSize: '2rem',
                lineHeight: '2.375rem',
                margin: `2.75rem 0 1.5rem 0`,
                fontWeight: theme('fontWeight.light'),
            },
        },
        h2: {
            fontSize: fontSizes.h2,
            lineHeight: theme('lineHeight.ktbe-h2'),
            fontWeight: theme('fontWeight.light'),
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${screens.md})`]: {
                fontSize: '1.5rem',
                lineHeight: '1.8125rem',
                margin: `0 0 0.5rem 0`,
            },

            [`@media (max-width: ${screens.sm})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
                margin: `0 0 0.75rem 0`,
            },
        },
        h3: {
            fontSize: fontSizes.h3,
            lineHeight: theme('lineHeight.ktbe-h3'),
            fontWeight: theme('fontWeight.light'),
            fontStyle: 'italic',
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${screens.md})`]: {
                fontSize: '1.5rem',
                lineHeight: '1.8125rem',
                margin: `0 0 0.5rem 0`,
            },

            [`@media (max-width: ${screens.sm})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
                margin: `0 0 0.75rem 0`,
            },
        },
        h4: {
            fontSize: fontSizes.h4,
            lineHeight: theme('lineHeight.ktbe-h4'),
            fontWeight: theme('fontWeight.light'),
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${screens.sm})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
            },
        },
        h5: {
            fontSize: fontSizes.h5,
            lineHeight: theme('lineHeight.ktbe-h5'),
            fontWeight: theme('fontWeight.light'),
            fontStyle: 'italic',
            [`@media (max-width: ${screens.sm})`]: {
                fontSize: '1.125rem',
                lineHeight: '1.3125rem',
            },
        },
        h6: {
            fontSize: fontSizes.h6,
            lineHeight: theme('lineHeight.ktbe-h6'),
            fontWeight: theme('fontWeight.light'),
        },
    };
};

// TODO: Use `scrollbar-width: thin` once available in all browsers (https://caniuse.com/?search=scrollbar-width)
const scrollbarThinRule = (theme) => {
    return {
        '&::-webkit-scrollbar': {
            width: '.8rem',
            cursor: 'default',
        },
        '&::-webkit-scrollbar-track': {
            background: colors['light-gray'],
        },
        '&::-webkit-scrollbar-thumb': {
            background: colors['dark-gray-68'],
            transition: 'all 1s ease-in-out',
            border: '1px solid',
            borderWidth: '2px',
            borderLeftWidth: '0px',
            borderRadius: '2px',
            backgroundClip: 'padding-box',
            borderColor: 'transparent',
            clipPath: 'circle(40%)',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: colors['dark-gray'],
            backgroundClip: 'padding-box',
        },
    };
};
