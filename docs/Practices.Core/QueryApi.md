# Query API

The `Nexplore.Practices.Core.Query`-namespace provides an easy way to search, limit, order, select and count an `IListQueryable<T>`.
The intent is to prevent having to expose an IQueryable trough the repository by providing a consistent API for this purpose.

## Features

### Ordering

The ordering is supported the following way:

| Case                                        | Example                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------- |
| Ascending                                   | `new Ordering { Field = "PropertyName", Direction = OrderDirection.Asc }`               |
| Descending                                  | `new Ordering { Field = "PropertyName", Direction = OrderDirection.Desc }`              |
| Nested Property like Property.OtherProperty | `new Ordering { Field = "PropertyName/OtherPropertyName", Direction = Direction.Desc }` |

Multiple ordering conditions are supported. They're all applied in the same order as they are defined.

#### Limitations

The ordering will overwrite any existing ordering on the `IQueryable<T>` (`OrderBy` is used internally).

### Limit (Skip / Take)

Using `Skip` and `Take` you can limit the result set (normally used for pagination).

**Note**: Is `Take == 0` no query will be executed. Use this if you need only the result count by setting `IncludeTotal` to true.

### Total / Count

Using the `IncludeTotal` will include the `Total` property in the result set.

This parameter will:

- Execute an additional database query to get its value. For performance reasons consider the following:
  - Set `Take = 0` if you only need the count and no results
  - Set `IncludeTotal = false` (default) if you only need the results (eg. when changing the page but you store the total count locally)
- Will respect any defined query parameters
- Can be used together with `Skip` / `Take` (will take the real and not the paged count)

## Usage

The usage of the `Query Api` looks like the following:

```csharp

public class SampleRepository : ISampleRepository
{
    public IListQueryable<Sample> GetAsList(SampleQueryParams params)
    {
        if (params.OnlyActive)
        {
            return this.set.Where(s => s.IsActive).AsListQueryable();
        }

        return this.set.AsListQueryable();

    }
}

```

If you have a queryable in memory, there is the method `AsSyncListQueryable()` to convert the result to a `IListQueryable`. This is mainly used if your query needs to enumerate the result before doing an in-memory evaluation:

```csharp

public class SampleRepository : ISampleRepository
{
    public IListQueryable<Sample> GetAsSyncList()
    {
        var query = this.set.Where(s => s.IsActive).AsEnumerable();

        var permitted = query.Where(s => s.HasPermission());

        return permitted.AsSyncListQueryable();
    }
}

```

For the materialization part, there are 3 approaches possible:

### In-Memory Mapping of the data

This approach loads the data from the database with the provided query parameters first.
By providing a mapper function which translates the source type in-memory into any desired type, you can enrich the result with data and logic that would not be practical and feasible with query projection.
The drawback with this approach is, that the property names of the target type need to match the source type as the client needs those for sorting.

```
public class SampleController : ApiController
{
    public SampleController(ISampleRepository sampleRepository, IMapper mapper)
    {
        // Load additional dependencies and store them in fields...
    }

	// Gets the data projected to a target type before the parameters are applied. Useful if you need to limit the information you need
    public async Task<ListResult<SampleDto> GetList([FromUri] SampleQueryParams params)
    {
        var listResult = await this.sampleRepository.GetAsList(params) // Pass filter to filter by additional properties
            .ToListResultAsync(filter, this.mapper.ToDto); // Apply the default query params and map the Sample entities to SampleDto in-memory
    }
}
```

### With query projection

This approach translates the queryable data into a target type before the query parameters are applied.
This allows to select only specific properties and their names can differ from the source type (the client only knows about the projected property names for sorting).
Complexer logic may not be possible due to the expression limitations.

```
public class SampleController : ApiController
{
    public SampleController(ISampleRepository sampleRepository, IMapper mapper)
    {
        // Load additional dependencies and store them in fields...
    }

	// Gets the data projected to a target type before the parameters are applied. Useful if you need to limit the information you need
    public async Task<ListResult<SampleDto> GetList([FromUri] SampleQueryParams params)
    {
        var listResult = await this.sampleRepository.GetAsList(params) // Pass filter to filter by additional properties
            .ProjectTo(this.mapper) // Map data to dto's at query time by implementing IQueryableProjector<TSource, TDestination>
            .ToListResultAsync(filter); // Apply the default query params to return a ListResult<SampleDto>
    }
}
```

### With a domain object

This approach only uses ToListResultAsync without projection or mapping at all. If your source type is a projected domain object already (e.g. a specialized ListEntry object), you can provide this to the client directly.
This leaves the sorting capabilities of the client intact and you can write more complex queries in the repository.

## Objects

### QueryParams

The `QueryParams` object holds every parameter for applying to an `IListQueryable<T>`. This will be the type of the default parameter for every `Query Api` but can also be extended to include additional filters.

#### Example content

The default `QueryParams` object can be created the following way (backend usage or tests).

```csharp
var parameters = new QueryParams
{
    Skip = 10, // To skip the first 10 entries
    Take = 5, // To take only 5 entries
    IncludeTotal = true // To include the total count of records
};

parameters.Orderings.Add(new Ordering { Field = "Lastname", Direction = Direction.Asc }); // To order by Lastname asc
parameters.Orderings.Add(new Ordering { Field = "Firstname", Direction = Direction.Asc }); // Then by Firstname asc
```

Inside the controllers the usage is like this:

```csharp
public Task<ListResult<SampleDto>> GetSamplesByFilter([FromQuery] QueryParams filters) { /* Content */ }
```

#### Example for extended filters

The query params can easily be extended. For example to add an special filter criteria to only include active or both (active / inactive) entries, the following class can be created.

```csharp
public class SampleQueryParams : QueryParams
{
    public bool OnlyActive { get; set; }
}
```

Now you can pass an `SampleQueryParams` instead of the default `QueryParams`.

**Note**: The filtering by every additional parameter must explicitely be done in the repository before translating the query into an `IListQueryable<T>`.

### ListResult

The list result holds the result of an `IListQueryable<T>` with applied `QueryParams`.

The list result consists of the following properties:

- `Data`: The resulting collection (filtered, ordered and limited)
- `Total`: The total count of records (only if requested)
