import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { TypedOrdering, TypedQueryParamsWithFilter } from './types';

export type HasTypedQueryParams<TFilter, TQueryParams> =
    | {
          /**
           * The default ordering.
           * 
           * Examples:
           * ```ts
           *  { orderBy: 'name' } // orders by 'name' ascending
           *  { orderBy: { field: 'name', direction: OrderDirection.Desc } } // orders by 'name' descending
           * ````

           * Note: the reason why this is required is to promote explicitness and ensure that developers consciously decide on the default ordering behavior.
           *
           */
          orderBy: StringKeyOf<TQueryParams> | TypedOrdering<TQueryParams>;
      }
    | {
          /**
           * The default query params.
           *
           * Example:
           * ```ts
           * { defaultQueryParams: { orderings: [ { field: 'name', direction: OrderDirection.Asc } ], take: 20} }
           * ```
           *
           * Alternatively, you can also use `orderBy` for simpler cases (If you don't need to set multiple orderings):
           * ```ts
           * { orderBy: 'name' } // orders by 'name' ascending
           * { orderBy: { field: 'name', direction: OrderDirection.Desc } } // orders by 'name' descending
           * ```
           *
           * Note: the reason why this is required is to promote explicitness and ensure that developers consciously decide on the default query params behavior.
           */
          defaultQueryParams: Partial<TypedQueryParamsWithFilter<TFilter, TQueryParams>>;
      };
