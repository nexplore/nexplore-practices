/**
 * Tailwind plugin providing the `arrowtip-*` utilities (the small triangular arrow tips of the flyout).
 * The arrow tips are configured in the `tooltipArrows` theme section of tailwind.config.js.
 *
 * Note: Tailwind 4 only generates a utility whose class name matches the selector key (e.g. `.arrowtip-top`),
 * so every direction is registered as its own entry instead of the nested `&-top` syntax used with Tailwind 3.
 */
module.exports = function () {
    return function ({ addUtilities, theme }) {
        const utilities = {};

        for (const [key, { borderColor, backgroundColor, size, offset, borderWidth }] of Object.entries(
            theme('tooltipArrows')
        )) {
            const offsetValue = typeof offset === 'number' ? offset + 'px' : offset;
            const offsetExpr = `var(--tw-arrowtip-offset, ${offsetValue})`;
            const transparent = `${size}px solid transparent`;
            const outerDistance = `-${size * 2}px`;
            const innerDistance = `-${2 * size - borderWidth}px`;

            const arrowTip = (borderSide, placement) => ({
                '--tw-arrowtip-offset': offsetValue,
                '--tw-arrowtip-size': `${size}px`,
                position: 'relative',
                '&:before, &:after': {
                    content: '""',
                    position: 'absolute',
                    ...placement(outerDistance),
                    borderTop: transparent,
                    borderRight: transparent,
                    borderBottom: transparent,
                    borderLeft: transparent,
                    [borderSide]: `${size}px solid ${borderColor}`,
                },
                '&:after': {
                    [borderSide]: `${size}px solid ${backgroundColor}`,
                    ...placement(innerDistance),
                },
            });

            utilities[`.${key}-top`] = arrowTip('borderBottom', (distance) => ({ left: offsetExpr, top: distance }));
            utilities[`.${key}-right`] = arrowTip('borderLeft', (distance) => ({ top: offsetExpr, right: distance }));
            utilities[`.${key}-bottom`] = arrowTip('borderTop', (distance) => ({ left: offsetExpr, bottom: distance }));
            utilities[`.${key}-left`] = arrowTip('borderRight', (distance) => ({ top: offsetExpr, left: distance }));
        }

        addUtilities(utilities);
    };
};
