namespace Nexplore.Practices.Syncfusion.Pdf.ReportBuilder.Components
{
    using System;
    using System.Data;
    using System.Linq;
    using global::Syncfusion.Drawing;
    using global::Syncfusion.Pdf;
    using global::Syncfusion.Pdf.Graphics;
    using global::Syncfusion.Pdf.Grid;

    public interface IPdfGridBuilder
    {
        IPdfGridBuilderHeader AddDataDefinition(string[] columnPropertyNames);
    }

    public interface IPdfGridBuilderHeader
    {
        IPdfGridBuilderConfig WithoutHeader();

        IPdfGridBuilderConfig SetHeader(string[] headerRowContent, bool asHtmlText = false, Action<PdfGridRow> addedHeaderRowAction = null);

        IPdfGridBuilderConfig SetMultipleHeaders(string[][] headerRowContents, bool asHtmlText = false, Action<PdfGridRow[]> addedHeaderRowsAction = null);
    }

    public interface IPdfGridBuilderConfig
    {
        IPdfGridBuilderConfig AddRow(string[] rowContent, bool asHtmlText = false, Action<PdfGridRow> addedRowAction = null);

        IPdfGridBuilderConfig AtIndent(float indent);

        IPdfGridBuilderConfig ConfigureColumns(Action<PdfGridColumnCollection> styleSetter);
    }

    internal sealed class PdfGridBuilder : PdfComponentBuilderBase, IPdfGridBuilder, IPdfGridBuilderHeader, IPdfGridBuilderConfig
    {
        private readonly PdfGrid grid;

        private float tab;

        private string[] dataDefinition;

        public PdfGridBuilder(IPdfReportBuilder builder)
            : base(builder)
        {
            this.grid = new PdfGrid();

            // Default behaviour
            this.grid.Style.AllowHorizontalOverflow = false; // false = Span Width
            this.grid.RepeatHeader = true;
            this.grid.AllowRowBreakAcrossPages = true;

            // Default styles
            this.grid.Style.CellSpacing = 0;
            this.grid.Style.CellPadding = new PdfPaddings { All = 0f };
        }

        public IPdfGridBuilderHeader AddDataDefinition(string[] columnPropertyNames)
        {
            this.dataDefinition = columnPropertyNames;
            var dataSource = new DataTable();

            foreach (var headerData in this.dataDefinition)
            {
                var column = new DataColumn
                {
                    DataType = typeof(string),
                    ColumnName = headerData,
                    Caption = string.Empty
                };
                dataSource.Columns.Add(column);
            }

            this.grid.DataSource = dataSource;

            return this;
        }

        public IPdfGridBuilderConfig WithoutHeader()
        {
            this.grid.BeginCellLayout += (_, args) =>
            {
                args.Skip = args.IsHeaderRow;
            };

            foreach (PdfGridRow header in this.grid.Headers)
            {
                header.Height = 0f;
            }

            return this;
        }

        public IPdfGridBuilderConfig SetHeader(string[] headerRowContent, bool asHtmlText = false, Action<PdfGridRow> addedHeaderRowAction = null) =>
            this.SetMultipleHeaders(new[] { headerRowContent }, asHtmlText, addedRows => addedHeaderRowAction?.Invoke(addedRows[0]));

        public IPdfGridBuilderConfig SetMultipleHeaders(string[][] headerRowContents, bool asHtmlText = false, Action<PdfGridRow[]> addedHeaderRowsAction = null)
        {
            if (this.grid.Headers.Count != 1)
            {
                throw new InvalidOperationException(
                    "Only one header row can be present when calling this function. It's not useful to set headers multiple times");
            }

            if (headerRowContents.Any(headerRowContent => headerRowContent.Length != this.dataDefinition.Length))
            {
                throw new ArgumentException(
                    $"Cannot add unbalanced rows. Expected row with {this.dataDefinition.Length} cells, but received at least one row with differing cell count");
            }

            var headerFontTag = $"<font color='{ColorTranslator.ToHtml(this.builder.Context.HeaderBrush.Color)}' face='{this.builder.Context.HeaderFont.Name}' size='{this.builder.Context.HeaderFont.Size}'>";

            var mappedHeaderRowsContent = !asHtmlText ? headerRowContents : headerRowContents.Select(
                headerRow => headerRow.Select(
                    header => $"{headerFontTag}{header}</font>").ToArray()).ToArray();

            var headers = this.grid.Headers.Add(mappedHeaderRowsContent.Length - this.grid.Headers.Count);

            for (var i = 0; i < mappedHeaderRowsContent.Length; i++)
            {
                var mappedHeaderRow = mappedHeaderRowsContent[i];
                for (var j = 0; j < mappedHeaderRow.Length; j++)
                {
                    if (!string.IsNullOrEmpty(mappedHeaderRow[j]))
                    {
                        headers[i].Cells[j].Value = !asHtmlText ? mappedHeaderRow[j] : new PdfHTMLTextElement(
                            mappedHeaderRow[j],
                            this.builder.Context.HeaderFont,
                            this.builder.Context.HeaderBrush);
                    }
                }
            }

            addedHeaderRowsAction?.Invoke(headers);

            return this;
        }

        public IPdfGridBuilderConfig AddRow(string[] rowContent, bool asHtmlText = false, Action<PdfGridRow> addedRowAction = null)
        {
            if (rowContent.Length != this.dataDefinition.Length)
            {
                throw new ArgumentException(
                    $"Cannot add unbalanced rows. Expected row with {this.dataDefinition.Length} cells, but received {rowContent.Length} cells");
            }

            var row = new PdfGridRow(this.grid);
            this.grid.Rows.Add(row);

            for (var j = 0; j < rowContent.Length; j++)
            {
                if (!string.IsNullOrEmpty(rowContent[j]))
                {
                    row.Cells[j].Value = !asHtmlText ? rowContent[j] : new PdfHTMLTextElement(
                        rowContent[j],
                        this.builder.Context.HeaderFont,
                        this.builder.Context.HeaderBrush);
                }
            }

            addedRowAction?.Invoke(row);

            return this;
        }

        public IPdfGridBuilderConfig AtIndent(float indent)
        {
            this.tab = indent;
            return this;
        }

        public IPdfGridBuilderConfig ConfigureColumns(Action<PdfGridColumnCollection> styleSetter)
        {
            styleSetter.Invoke(this.grid.Columns);
            return this;
        }

        public override PdfComponentBuilderDrawAction BuildDrawAction()
        {
            var layout = new PdfGridLayoutFormat();
            layout.Break = PdfLayoutBreakType.FitPage;
            layout.Layout = PdfLayoutType.Paginate;

            var headerHeight = this.grid.Headers.Cast<PdfGridRow>().Sum(header => header.Height);
            var firstDataRowHeight = this.grid.Rows.FirstOrDefault()?.Height;
            var requiredVerticalSpace = headerHeight + (firstDataRowHeight ?? 0f);

            var availableVerticalSpaceOnPage = this.builder.GetPageBounds().Height - this.builder.VerticalPointer;
            var forceNewPage = (availableVerticalSpaceOnPage - requiredVerticalSpace) <= 0;

            return new PdfComponentBuilderDrawAction(page =>
            {
                var yPosition = forceNewPage ? this.builder.VerticalPointer + availableVerticalSpaceOnPage : this.builder.VerticalPointer!;
                return this.grid.Draw(page, this.tab, yPosition, layout);
            });
        }
    }
}
