
module.exports = function () {
    return function ({ addUtilities, e, theme }) {
        addUtilities(
            Object.fromEntries(Object.entries(theme('tooltipArrows')).map(([key, { borderColor, backgroundColor, size, offset, borderWidth }]) => {
                offset = typeof offset === 'number' ? offset + 'px' : offset;
                const common = {
                    '--tw-arrowtip-offset': offset,
                    '--tw-arrowtip-size': size + 'px',
                    position: 'relative',
                };

                const offsetExpr = `var(--tw-arrowtip-offset, ${offset})`;
                return [`.${e(key)}`, {
                    '&-top': {
                        ...common,
                        '&:before, &:after': {
                            content: '""',
                            position: 'absolute',
                            left: offsetExpr,
                            top: '-' + size * 2 + 'px',
                            borderTop: size + 'px solid transparent',
                            borderRight: size + 'px solid transparent',
                            borderBottom: size + 'px solid ' + borderColor,
                            borderLeft: size + 'px solid transparent',
                        },
                        '&:after': {
                            borderBottom: size + 'px solid ' + backgroundColor,
                            top: '-' + (2 * size - borderWidth) + 'px',
                        },
                    },
                    '&-right': {
                        ...common,
                        '&:before, &:after': {
                            content: '""',
                            position: 'absolute',
                            top: offsetExpr,
                            right: '-' + size * 2 + 'px',
                            borderTop: size + 'px solid transparent',
                            borderRight: size + 'px solid transparent',
                            borderBottom: size + 'px solid transparent',
                            borderLeft: size + 'px solid ' + borderColor,
                        },
                        '&:after': {
                            borderLeft: size + 'px solid ' + backgroundColor,
                            right: '-' + (2 * size - borderWidth) + 'px',
                        },
                    },
                    '&-bottom': {
                        ...common,
                        '&:before, &:after': {
                            content: '""',
                            position: 'absolute',
                            left: offsetExpr,
                            bottom: '-' + size * 2 + 'px',
                            borderTop: size + 'px solid ' + borderColor,
                            borderRight: size + 'px solid transparent',
                            borderBottom: size + 'px solid transparent',
                            borderLeft: size + 'px solid transparent',
                        },
                        '&:after': {
                            borderTop: size + 'px solid ' + backgroundColor,
                            bottom: '-' + (2 * size - borderWidth) + 'px',
                        },
                    },
                    '&-left': {
                        ...common,
                        '&:before, &:after': {
                            content: '""',
                            position: 'absolute',
                            top: offsetExpr,
                            left: '-' + size * 2 + 'px',
                            borderTop: size + 'px solid transparent',
                            borderRight: size + 'px solid ' + borderColor,
                            borderBottom: size + 'px solid transparent',
                            borderLeft: size + 'px solid transparent',
                        },
                        '&:after': {
                            borderRight: size + 'px solid ' + backgroundColor,
                            left: '-' + (2 * size - borderWidth) + 'px',
                        },
                    }
                }];
            })))
    };
};
