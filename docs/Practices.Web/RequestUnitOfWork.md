# Request Unit of Work

To enable the creation of a unit of work per http request, you need to call the following method in your `Startup.Configure()` method (`container` is the Autofac
container instance):

```
app.UsePerRequestUnitOfWork(container);
```
