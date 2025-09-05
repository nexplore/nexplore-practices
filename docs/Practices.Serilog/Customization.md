# Customization

In the provided implementation of the *SerilogLoggerBuilder*, a number of methods and properties are virtual and can be overridden in a derived class:

#### Properties
- **UseProcessIdEnricher**: Enable/disable usage of *ProcessId* in the log template *(default: true)*
- **UseCorrelationIdEnricher**: Enable/disable usage of *CorrelationId* in the log template *(default: true)*
- **UseMachineNameEnricher**: Enable/disable usage of *MachineName* in the log template *(default: true)*
- **UseUserIdEnricher**: Enable/disable usage of *UserId* in the log template *(default: true)*

#### Methods
- **AddCustomEnrichers**: Extend this method to enrich the *LoggerConfiguration* with your own properties, so you can use them in the log template *(default implementation: empty)*

## Registration
If a custom implementation of the ILoggerBuilder should be used, it needs to be added to the registry:
```csharp
builder.RegisterType<MyProjectLoggerBuilder>().As<ILoggerBuilder>().SingleInstance();
```