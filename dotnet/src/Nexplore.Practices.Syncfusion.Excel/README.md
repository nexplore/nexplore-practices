# Excel Export

This package is designed to facilitate easy exporting of lists as an excel file. If you consider using this package in your project please mind the following information:

-   This package handles the file generation with Syncfusion. You need to license Syncfusion for your project and register the licence within your project. Make sure that your projects licence key for Syncfusion matches with the major version of Syncfusion that is used in this package.
-   Item types are not exported recursively. I.e. if an item type consists of lists or complex types, those properties are not going to be exported.
-   By default, the property names are translated if there is a `<MyProperty>` resource in your project.
-   There is a mapping for CLR types to excel types (see `ExcelExporter.cs`, property `cellTypeMap`). If you wish to apply different mappings you can do so by registering TypeConverters or ValueConverters.
-   There is a default format configuration (see `DefaultExcelFormats.cs`). You can override these formats through DI by registering a different implementation of `IExcelFormats`.
-   There is a `DefaultExportConfigFactory.cs` that is ready to use and will return a config without predefined Type- or ValueConverters. If you want to define default Converters for your entire project you can do so through DI by registering a different implementation of `IExportConfigFactory`.

## Example Usage

Here's how the usage could look like:

```
public Stream Export(IEnumerable<RechnungExportEntry> entries)
{
    return this.excelExporter.Export(entries, this.GetConfig(), this.stringLocalizer);
}

private IExportConfig<RechnungExportEntry> GetConfig()
{
    var config = this.configFactory.CreateConfig<RechnungExportEntry>();

    // define which properties should be ignored
    config.Exclusions.AddOrUpdate(e => e.RechnungId);
    config.Exclusions.AddOrUpdate(e => e.KreditorbelegCreatedOn);

    // define translations for the column header (only necessary if the resourcekey is different from the property name)
    config.Translations.AddOrUpdate(e => e.LeistungsempfaengerName, this.stringLocalizer[nameof(App.Antrag_LeistungsempfaengerName)]);
    config.Translations.AddOrUpdate(e => e.LeistungsempfaengerVorname, this.stringLocalizer[nameof(App.Antrag_LeistungsempfaengerVorname)]);
    ...

    // define value converters e.g. to output a string for enum values etc.
    config.ValueConverters.AddOrUpdate(e => e.Status, value => this.stringLocalizer[$"WorkflowStatus_{value}"]);
    config.ValueConverters.AddOrUpdate(e => e.Behandlungsart, value => this.stringLocalizer[$"Enum_{nameof(Behandlungsart)}_{(int)value}"]);
    config.ValueConverters.AddOrUpdate(e => e.Rechnungstyp, value => this.stringLocalizer[$"Enum_{nameof(Rechnungstyp)}_{(int)value}"]);

    return config;
}
```
