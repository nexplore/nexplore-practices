/** @type {import('tailwindcss').Config} */

const plugin = require('tailwindcss/plugin');
const defaultTheme = require('tailwindcss/defaultTheme');
const tooltipArrowPlugin = require('./tailwind-tooltip-arrow.plugin');

module.exports = {
    content: ['./practices-ui-tailwind/src/**/*.{html,ts}'],
    theme: {
        colors: ({ colors }) => ({
            transparent: colors.transparent,
            red: '#EA161F',
            black: '#000000',
            'very-light-secondary': '#FCF8F3',
            highlight: '#FAF1E3',
            'dark-highlight': '#F7E9D2',
            'surface-hover': '#F2E0C3',
            secondary: '#EBD3AE',
            bgdark: 'rgba(78,78,78,0.95)',
            'bgdark-solid': '#565656',
            'bgdark-hover': '#404040',
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
        }),
        fontSize: ({ theme }) => ({
            'extra-small': ['0.75rem', { lineHeight: theme('lineHeight.pui-extra-small') }],
            'very-small': ['0.8125rem', { lineHeight: theme('lineHeight.pui-very-small') }],
            small: ['0.875rem', { lineHeight: theme('lineHeight.pui-small') }],
            'logo-caption': ['1rem', { lineHeight: theme('lineHeight.pui-logo-caption') }],
            base: ['1rem', { lineHeight: theme('lineHeight.pui-base') }],
            'intro-text': ['1.125rem', { lineHeight: theme('lineHeight.pui-intro-text') }],
            h6: ['1.125rem', { lineHeight: theme('lineHeight.pui-h6') }],
            h5: ['1.3125rem', { lineHeight: theme('lineHeight.pui-h5') }],
            h4: ['1.5rem', { lineHeight: theme('lineHeight.pui-h4') }],
            h3: ['1.625rem', { lineHeight: theme('lineHeight.pui-h3') }],
            large: ['1.75rem', { lineHeight: theme('lineHeight.pui-large') }],
            h2: ['1.875rem', { lineHeight: theme('lineHeight.pui-h2') }],
            h1: ['3.375rem', { lineHeight: theme('lineHeight.pui-h1') }],
            'very-large': ['4.0625rem', { lineHeight: theme('lineHeight.pui-very-large') }],
        }),
        fontWeight: {
            thin: '100',
            light: '300',
            normal: '400',
            medium: '500',
            bold: '700',
        },
        screens: {
            xs: '375px',
            // => @media (min-width: 375px) { ... }

            sm: '600px',
            // => @media (min-width: 600px) { ... }

            md: '900px',
            // => @media (min-width: 900px) { ... }

            lg: '1180px',
            // => @media (min-width: 1180px) { ... }

            xl: '1480px',
            // => @media (min-width: 1480px) { ... }
        },
        extend: {
            fontFamily: {
                sans: ['Roboto', ...defaultTheme.fontFamily.sans],
            },
            lineHeight: {
                'pui-extra-small': '1.125rem',
                'pui-very-small': '1.0625rem',
                'pui-small': '1.125rem',
                'pui-logo-caption': '1.0625rem',
                'pui-base': '1.625rem',
                'pui-intro-text': '1.75rem',
                'pui-h6': '1.3125rem',
                'pui-h5': '1.5625rem',
                'pui-h4': '1.75rem',
                'pui-h3': '2rem',
                'pui-large': '2.25rem',
                'pui-h2': '2.25rem',
                'pui-h1': '3.875rem',
                'pui-very-large': '4.625rem',
            },
            spacing: {
                'pui-4.5': '1.125rem',
                'pui-5.5': '1.375rem',
                'pui-7.5': '1.875rem',
                'pui-controlsize': '3.75rem',
            },
            borderWidth: {
                'pui-controlinvalidbordersize': '6px',
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
        tooltipArrows: (theme) => {
            const common = {
                borderColor: theme('colors.gray'),
                borderWidth: 1,
                backgroundColor: theme('colors.white'),
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
        },
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
                    fontSize: theme('fontSize.base'),
                    lineHeight: theme('lineHeight.pui-base'),
                    fontWeight: theme('fontWeight.light'),
                },
                small: {
                    fontSize: theme('fontSize.small'),
                    lineHeight: theme('lineHeight.pui-small'),
                    fontWeight: theme('fontWeight.normal'),
                },
                a: {
                    fontSize: theme('fontSize.base'),
                    lineHeight: theme('lineHeight.pui-base'),
                    fontWeight: theme('fontWeight.light'),
                    textDecoration: 'underline',
                },
                'a:hover': {
                    color: theme('colors.red'),
                    cursor: 'pointer',
                },
                ul: {
                    listStyleType: 'square',
                    lineHeight: theme('lineHeight.pui-base'),
                    margin: '2.25rem 0 2.25rem 1.25rem',
                    fontWeight: theme('fontWeight.light'),
                },
                li: {
                    margin: '0 0 0 0.75rem',
                },
                'li::marker': {
                    color: theme('colors.red'),
                },
                /* <ul> elements are sometimes used for non-list components e.g. navigation or menu.
                    Make sure those components have the class 'list-none' set, so that the default styles of <ul> elements are not applied */
                'ul.list-none, ul.list-none>li': {
                    margin: '0',
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
            fontSize: theme('fontSize.h1'),
            lineHeight: theme('lineHeight.pui-h1'),
            fontWeight: theme('fontWeight.thin'),
            margin: `0 0 2.75rem 0`,

            [`@media (max-width: ${theme('screens.md')})`]: {
                fontSize: '3rem',
                lineHeight: '3.5rem',
                margin: `0 0 1.75rem 0`,
            },

            [`@media (max-width: ${theme('screens.sm')})`]: {
                fontSize: '2rem',
                lineHeight: '2.375rem',
                margin: `2.75rem 0 1.5rem 0`,
                fontWeight: theme('fontWeight.light'),
            },
        },
        h2: {
            fontSize: theme('fontSize.h2'),
            lineHeight: theme('lineHeight.pui-h2'),
            fontWeight: theme('fontWeight.light'),
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${theme('screens.md')})`]: {
                fontSize: '1.5rem',
                lineHeight: '1.8125rem',
                margin: `0 0 0.5rem 0`,
            },

            [`@media (max-width: ${theme('screens.sm')})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
                margin: `0 0 0.75rem 0`,
            },
        },
        h3: {
            fontSize: theme('fontSize.h3'),
            lineHeight: theme('lineHeight.pui-h3'),
            fontWeight: theme('fontWeight.light'),
            fontStyle: 'italic',
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${theme('screens.md')})`]: {
                fontSize: '1.5rem',
                lineHeight: '1.8125rem',
                margin: `0 0 0.5rem 0`,
            },

            [`@media (max-width: ${theme('screens.sm')})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
                margin: `0 0 0.75rem 0`,
            },
        },
        h4: {
            fontSize: theme('fontSize.h4'),
            lineHeight: theme('lineHeight.pui-h4'),
            fontWeight: theme('fontWeight.light'),
            margin: `0 0 0.75rem 0`,

            [`@media (max-width: ${theme('screens.sm')})`]: {
                fontSize: '1.3125rem',
                lineHeight: '1.625rem',
            },
        },
        h5: {
            fontSize: theme('fontSize.h5'),
            lineHeight: theme('lineHeight.pui-h5'),
            fontWeight: theme('fontWeight.light'),
            fontStyle: 'italic',
            [`@media (max-width: ${theme('screens.sm')})`]: {
                fontSize: '1.125rem',
                lineHeight: '1.3125rem',
            },
        },
        h6: {
            fontSize: theme('fontSize.h6'),
            lineHeight: theme('lineHeight.pui-h6'),
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
            background: theme('colors.light-gray'),
        },
        '&::-webkit-scrollbar-thumb': {
            background: theme('colors.dark-gray-68'),
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
            background: theme('colors.dark-gray'),
            backgroundClip: 'padding-box',
        },
    };
};
