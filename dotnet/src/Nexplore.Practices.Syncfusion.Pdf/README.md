# PDF Reports

## Background

The `PdfReportBuilder` class and the related interfaces and classes were created to provide a developer-friendly _framework_ for implementing PDF reports. The need originally arose from the desire to move away from RDLC reports and instead use a library such as [`Syncfusion.Pdf`](https://help.syncfusion.com/file-formats/pdf/overview).

## Structure

At its core, the framework consists of a **main class** (`PdfReportBuilder`) and several **components** (derived from `PdfComponentBuilderBase`).
Each component is responsible for a **type** of graphic element you want to place in a report.
For example, the `PdfImageBuilder` component handles adding an image.
All components use a fluent-API pattern that constrains how they can be used, which in turn assists the report author.

This structure was chosen so the framework can be easily extended with new functionality while still leveraging static type-safety by hiding elements that report or component authors should not access directly.

| Name                                                | Responsibility                                                                                                                                                                                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PdfReportBuilder` class                            | **Main class** – it manages:<ul><li>The vertical space within a `PdfDocument`.</li><li>The current `PdfGraphics` instance, which is kept private and made available to components only while they are being built.</li><li>The creation and execution of components.</li></ul> |
| `IPdfReportBuilder` interface                       | Exposes only those methods and properties of the main class that components are allowed to use.                                                                                                                                                                                |
| `PdfComponentBuilderBase` class and its derivatives | Provide the drawing functionality that the main class exposes via `CreateFoo(Action<FooBuilder> b)` methods. Components declare their own set of interfaces that control the build process (fluent API).                                                                       |

## Adding New Components

1. Derive a new class from `PdfComponentBuilderBase`.
2. Define a fluent API by creating an interface that the component’s methods return.
3. Override the `Build()` method – it must return a `PdfComponentBuilderAction` instance that contains an action which draws the component on the supplied `PdfPage`.

> **Note on drawing on a `PdfPage` within your component’s `PdfComponentBuilderAction`:**
> Syncfusion handles page breaks when you pass `PdfLayoutType.Paginate`
