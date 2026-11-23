export enum IconDirection {
    LEFT = 'left',
    UP = 'up',
    RIGHT = 'right',
    DOWN = 'down',
}

/** An icon direction as enum member or as its string value, so that templates can use `direction="left"`. */
export type IconDirectionInput = IconDirection | `${IconDirection}`;

export enum IconSize {
    /** Do not apply any size (default) */
    NONE = 'none',
    /** Adapt to container size */
    FIT = 'fit',
    XXS = 'xxs',
    XS = 'xs',
    S = 's',
    M = 'm',
    L = 'l',
}

/** An icon size as enum member or as its string value, so that templates can use `size="m"`. */
export type IconSizeInput = IconSize | `${IconSize}`;
