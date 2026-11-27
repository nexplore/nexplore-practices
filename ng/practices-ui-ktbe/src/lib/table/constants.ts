export class ClassNames {
    static readonly TABLE_COLUMN = 'group border-b p-3 leading-tight font-medium table-cell align-bottom';
    static readonly TABLE_CELL =
        'border-dark-gray-68 p-3 leading-tight table-cell group-last-of-type:border-b-black align-middle overflow-hidden text-ellipsis';
    static readonly TABLE_ROW = 'table-row group font-light';
    /** Row class names used when the table renders with `useGridLayout` (rows are CSS subgrids). */
    static readonly TABLE_ROW_GRID = 'group font-light border-dark-gray-68 last-of-type:border-black';
}

export type CssSizeUnit = 'px' | 'em' | 'rem' | 'fr' | '%' | 'ch' | 'vw';
type CssSizeConstant = 'auto' | 'min-content' | 'max-content' | 'fit-content';
type CssSizeOrConstant = CssSizeConstant | `${number}${CssSizeUnit}`;

/**
 * A CSS size that can be used as a track size in `grid-template-columns`, e.g. `'auto'`, `'1fr'`, `'8rem'` or `'minmax(8rem, 1fr)'`.
 */
export type CssGridSize = CssSizeOrConstant | `minmax(${CssSizeOrConstant}, ${CssSizeOrConstant})`;
