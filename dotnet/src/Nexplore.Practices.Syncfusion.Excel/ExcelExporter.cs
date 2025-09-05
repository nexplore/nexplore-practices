namespace Nexplore.Practices.Syncfusion.Excel
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.IO;
    using System.Linq;
    using System.Numerics;
    using System.Reflection;
    using System.Runtime.CompilerServices;
    using System.Threading;
    using System.Threading.Tasks;
    using global::Syncfusion.XlsIO;
    using Microsoft.Extensions.Localization;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.Syncfusion.Excel.ColumnMapping;
    using Nexplore.Practices.Syncfusion.Excel.Config;

    public sealed class ExcelExporter : IExcelExporter
    {
        private const int ROW_START = 1;
        private const int COL_START = 1;

        private readonly ExcelEngine excelEngine;
        private readonly IExcelFormats excelFormats;

        private readonly Dictionary<Type, Action<IMigrantRange, object>> cellTypeMap;

        public ExcelExporter(ExcelEngine excelEngine, IExcelFormats excelFormats)
        {
            this.excelEngine = excelEngine;
            this.excelEngine.Excel.DefaultVersion = ExcelVersion.Excel2013;
            this.excelFormats = excelFormats;
            this.cellTypeMap = CreateCellTypeMappings(this.excelFormats);
        }

        public async Task<Stream> ExportAsync<TEntity>(IEnumerable<TEntity> entities, IExportConfig<TEntity> config, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            var workbook = await this.ConvertToExcelAsync(entities, config, localizer, cancellationToken).ConfigureAwait(false);
            return StreamWorkbook(workbook);
        }

        public async Task ExportToStreamAsync<TEntity>(IEnumerable<TEntity> entities, IExportConfig<TEntity> config, Stream outputStream, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            var workbook = await this.ConvertToExcelAsync(entities, config, localizer, cancellationToken).ConfigureAwait(false);
            workbook.SaveAs(outputStream);
        }

        public async Task<Stream> ExportAsync<TEntity>(IAsyncEnumerable<TEntity> entities, IExportConfig<TEntity> config, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            var workbook = await this.ConvertToExcelAsync(entities, config, localizer, cancellationToken).ConfigureAwait(false);
            return StreamWorkbook(workbook);
        }

        public async Task ExportToStreamAsync<TEntity>(IAsyncEnumerable<TEntity> entities, IExportConfig<TEntity> config, Stream outputStream, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            var workbook = await this.ConvertToExcelAsync(entities, config, localizer, cancellationToken).ConfigureAwait(false);
            workbook.SaveAs(outputStream);
        }

        private Task<IWorkbook> ConvertToExcelAsync<TEntity>(IEnumerable<TEntity> entities, IExportConfig<TEntity> config, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            return this.ConvertToExcelAsync(ToAsync(entities, cancellationToken), config, localizer, cancellationToken);
        }

        private async Task<IWorkbook> ConvertToExcelAsync<TEntity>(IAsyncEnumerable<TEntity> entities, IExportConfig<TEntity> config, IStringLocalizer localizer, CancellationToken cancellationToken)
            where TEntity : class
        {
            // Add a new workbook and worksheet. We're working with a "migrant range" which is Syncfusion's proposed construct for
            // fast cell manipulation. (https://help.syncfusion.com/file-formats/xlsio/improving-performance#range-access)
            var workbook = this.excelEngine.Excel.Workbooks.Create(1);
            var sheet = workbook.Worksheets.First();
            var migrantRange = sheet.MigrantRange;

            var entityProperties = GetProperties(typeof(TEntity), config);

            CreateHeader(migrantRange, entityProperties, config.Translations, localizer);
            cancellationToken.ThrowIfCancellationRequested();

            var row = 1; // The "1" accounts for the header row
            await foreach (var entity in entities.WithCancellation(cancellationToken))
            {
                this.PopulateRow(migrantRange, entityProperties, config, row, entity);

                row++;
            }

            cancellationToken.ThrowIfCancellationRequested();
            this.AdjustColumnWidths(sheet);

            return workbook;
        }

        private static void CreateHeader<TEntity>(IMigrantRange migrantRange, IReadOnlyList<PropertyInfo> entityProperties, IColumnTranslations<TEntity> translations, IStringLocalizer localizer)
            where TEntity : class
        {
            for (var col = 0; col < entityProperties.Count; col++)
            {
                var prop = entityProperties[col];
                var columnIndex = col + COL_START;

                string columnHeader;
                if (translations.HasTranslationFor(prop.Name))
                {
                    columnHeader = translations.GetOrDefault(prop.Name);
                }
                else
                {
                    var localized = localizer[translations.GetOrDefault(prop.Name)];
                    columnHeader = localized.ResourceNotFound ? prop.Name : localized.Value;
                }

                UpdateCell(migrantRange, ROW_START, columnIndex, cell =>
                {
                    cell.Text = columnHeader;
                    cell.CellStyle.Font.Bold = true;
                });
            }
        }

        private void PopulateRow<TEntity>(IMigrantRange migrantRange, IReadOnlyList<PropertyInfo> entityProperties, IExportConfig<TEntity> config, int row, TEntity entity)
            where TEntity : class
        {
            for (var col = 0; col < entityProperties!.Count; col++)
            {
                var prop = entityProperties[col];
                var columnIndex = COL_START + col;
                var rowIndex = ROW_START + row;

                // We prefer a value converter because it is more specific than a type converter.
                var value = config.ValueConverters.HasConverterFor(prop.Name) ?
                    config.ValueConverters.ConvertOrDefault(entity, prop.Name, prop.GetValue(entity)) :
                    config.TypeConverters.ConvertOrDefault(prop.PropertyType, prop.GetValue(entity));

                UpdateCell(migrantRange, rowIndex, columnIndex, cell =>
                {
                    if (value is null)
                    {
                        cell.Text = string.Empty;
                    }
                    else if (this.cellTypeMap.TryGetValue(value.GetType(), out var cellTypeMapper))
                    {
                        cellTypeMapper(cell, value);
                    }
                    else
                    {
                        cell.Text = value.ToString();
                    }
                });
            }
        }

        private void AdjustColumnWidths(IWorksheet sheet)
        {
            sheet.UsedRange.AutofitColumns();
            foreach (var column in sheet.UsedRange.Columns)
            {
                column.ColumnWidth = Math.Min(this.excelFormats.MaxColumnWidth, column.ColumnWidth);
            }
        }

        private static void UpdateCell(IMigrantRange migrantRange, int row, int col, Action<IMigrantRange> cellAction)
        {
            migrantRange.ResetRowColumn(row, col);
            cellAction(migrantRange);
        }

        private static MemoryStream StreamWorkbook(IWorkbook workbook)
        {
            var stream = new MemoryStream();
            workbook.SaveAs(stream);

            Guard.ArgumentAssert(stream.CanSeek, "stream.CanSeek", nameof(stream));
            stream.Position = 0;

            return stream;
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("StyleCop.CSharp.SpacingRules", "SA1010:Opening square brackets should be spaced correctly", Justification = "old rules")]
        private static IReadOnlyList<PropertyInfo> GetProperties<TEntity>(Type type, IExportConfig<TEntity> config)
            where TEntity : class
        {
            const BindingFlags bindingFlags = BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly;

            var baseProperties = type.BaseType == typeof(object) ? [] : GetProperties(type.BaseType, config);
            var currentProperties = type
                .GetProperties(bindingFlags)
                .Where(p => !config.Exclusions.IsExcluded(p.Name));

            return [
                .. baseProperties,
                .. currentProperties];
        }

        private static Dictionary<Type, Action<IMigrantRange, object>> CreateCellTypeMappings(IExcelFormats excelFormats)
        {
            // Excel supports the following cell formats:
            // Number, Currency, Percentage, DateTime, Accounting, Scientific, Fraction and Text
            // We want to map the CLR types to these cell formats - where applicable.
            // See https://help.syncfusion.com/flutter/xlsio/working-with-cell-formatting for further information.
            void Integer<T>(IMigrantRange cell, object value)
                where T : IBinaryInteger<T>
            {
                var number = (T)value;
                cell.Number = Convert.ToDouble(number, CultureInfo.InvariantCulture);
                cell.NumberFormat = excelFormats.IntegerFormat;
            }

            void Float<T>(IMigrantRange cell, object value)
                where T : IFloatingPoint<T>
            {
                var number = (T)value;
                cell.Number = Convert.ToDouble(number, CultureInfo.InvariantCulture);
                cell.NumberFormat = excelFormats.FloatFormat;
            }

            return new Dictionary<Type, Action<IMigrantRange, object>>
            {
                // Integer numbers
                [typeof(byte)] = Integer<byte>,
                [typeof(sbyte)] = Integer<sbyte>,
                [typeof(short)] = Integer<short>,
                [typeof(ushort)] = Integer<ushort>,
                [typeof(int)] = Integer<int>,
                [typeof(uint)] = Integer<uint>,
                [typeof(long)] = Integer<long>,
                [typeof(ulong)] = Integer<ulong>,

                // Floating point numbers
                [typeof(float)] = Float<float>,
                [typeof(double)] = Float<double>,
                [typeof(decimal)] = Float<decimal>,

                // Dates
                [typeof(DateOnly)] = (cell, value) =>
                {
                    var dateOnly = (DateOnly)value;
                    cell.DateTime = dateOnly.ToDateTime(new TimeOnly(0, 0));
                    cell.NumberFormat = excelFormats.DateOnlyFormat;
                },
                [typeof(TimeOnly)] = (cell, value) =>
                {
                    var timeOnly = (TimeOnly)value;
                    cell.DateTime = new DateTime(new DateOnly(0, 0, 0), timeOnly);
                    cell.NumberFormat = excelFormats.TimeOnlyFormat;
                },
                [typeof(DateTimeOffset)] = (cell, value) =>
                {
                    var dateTimeOffset = (DateTimeOffset)value;
                    cell.DateTime = dateTimeOffset.DateTime;
                    cell.NumberFormat = excelFormats.DateTimeFormat;
                },
                [typeof(DateTime)] = (cell, value) =>
                {
                    cell.DateTime = (DateTime)value;
                    cell.NumberFormat = excelFormats.DateTimeFormat;
                },

                // String
                [typeof(string)] = (cell, value) =>
                {
                    cell.Text = (string)value;
                },
            };
        }

        private static async IAsyncEnumerable<TEntity> ToAsync<TEntity>(IEnumerable<TEntity> entities, [EnumeratorCancellation] CancellationToken cancellationToken = default)
        {
            foreach (var item in entities)
            {
                cancellationToken.ThrowIfCancellationRequested();
                yield return item;
            }

            await Task.CompletedTask.ConfigureAwait(false);
        }
    }
}
