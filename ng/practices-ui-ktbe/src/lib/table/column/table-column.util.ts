import { OrderDirection } from '@nexplore/practices-ui';
import { IconDirection } from '../../icons/icon.interface';

export function firstCharToUpper(str: string) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

export function firstCharToLower(str: string | undefined | null) {
    if (!str) {
        return str;
    }

    return str.slice(0, 1).toLowerCase() + str.slice(1);
}

export function combineTranslationPrefixAndKey(prefix: string, key: string) {
    if (prefix && key) {
        return prefix + firstCharToUpper(key);
    } else {
        return null;
    }
}

export function sortDirToIconDir(sortDir: OrderDirection): IconDirection {
    switch (sortDir) {
        case OrderDirection.Asc:
            return IconDirection.UP;
        case OrderDirection.Desc:
            return IconDirection.DOWN;
        default:
            return null;
    }
}

export function sortDirToAriaSort(sortDir: OrderDirection | undefined): 'ascending' | 'descending' {
    switch (sortDir) {
        case OrderDirection.Asc:
            return 'ascending';
        case OrderDirection.Desc:
            return 'descending';
        default:
            return null;
    }
}

export function sortDirToLabelKey(sortDir: OrderDirection | undefined): string {
    switch (sortDir) {
        case OrderDirection.Asc:
            return 'Practices.Labels_Table_Ascending';
        case OrderDirection.Desc:
            return 'Practices.Labels_Table_Descending';
        default:
            return null;
    }
}
