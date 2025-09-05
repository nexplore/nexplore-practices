import { StringKeyOf } from '@nexplore/practices-ng-common-util';
import { TypedOrdering, TypedQueryParamsWithFilter } from './types';

export type HasTypedQueryParams<TFilter, TQueryParams> =
    | {
          /** The default ordering for the select view source */
          orderBy: StringKeyOf<TQueryParams> | TypedOrdering<TQueryParams>;
      }
    | {
          defaultQueryParams: Partial<TypedQueryParamsWithFilter<TFilter, TQueryParams>>;
      };
