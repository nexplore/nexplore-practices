namespace Nexplore.Practices.Syncfusion.Excel.Config;

// Excel supports the following cell formats:
// Number, Currency, Percentage, DateTime, Accounting, Scientific, Fraction and Text
// We want to map the CLR types to these cell formats - where applicable.
// See https://help.syncfusion.com/flutter/xlsio/working-with-cell-formatting for further information.
public interface IExcelFormats
{
    int MaxColumnWidth { get; }

    string DateTimeFormat { get; }

    string DateOnlyFormat { get; }

    string TimeOnlyFormat { get; }

    string IntegerFormat { get; }

    string FloatFormat { get; }
}