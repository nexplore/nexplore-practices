import type { IQueryParamsWithFilter } from '@nexplore/practices-ui';
import { OrderDirection } from '@nexplore/practices-ui';
import { map, timer } from 'rxjs';

export interface SampleModel {
    id: number;
    name: string;
    created: Date;
}

function generateItem<TItem>(i: number) {
    return { id: i, name: `Eintrag ${i}`, created: new Date() } as TItem;
}

function generateSampleData<TItem = SampleModel>(size: number, generateItemFn = generateItem<TItem>) {
    const data = [];
    for (let i = 0; i < size; i++) {
        data.push(generateItemFn(i));
    }

    return data as TItem[];
}

export const tableSampleLoadFn = <TItem = SampleModel, TFilter = any>(
    params: IQueryParamsWithFilter<TFilter>,
    size: number,
    generateItemFn = generateItem<TItem>
) => {
    let data = generateSampleData(size, generateItemFn);

    if (params.orderings && params.orderings.length > 0) {
        data = data.sort((a, b) => {
            return params.orderings[0].direction === OrderDirection.Asc
                ? a[params.orderings[0].field] > b[params.orderings[0].field]
                    ? 1
                    : -1
                : b[params.orderings[0].field] > a[params.orderings[0].field]
                  ? 1
                  : -1;
        });
    }

    if (params.filter) {
        data = data.filter((d) => {
            return Object.entries(params.filter).every(([key, value]) =>
                value === null ? true : d[key]?.toString()?.includes(value?.toString())
            );
        });
    }

    if (params.skip != null && params.take != null) {
        data = data.slice(params.skip, params.skip + params.take);
    }

    return timer(1000).pipe(
        map((_) => ({
            data: data,
            total: size,
        }))
    );
};
