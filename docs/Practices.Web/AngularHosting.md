# Angular Hosting

If an Angular application should be hosted within the same IIS site as the backend api, you need to call the following method in your `Startup.Configure()` method:

```
app.UseAngular(env);
```

This enables static files served from the `wwwroot` folder and rewrites client side routes back to `index.html` (every request which was not mapped previously by any other
middleware and is not under `/api`). Be sure to configure this middleware at the end of the pipeline.
