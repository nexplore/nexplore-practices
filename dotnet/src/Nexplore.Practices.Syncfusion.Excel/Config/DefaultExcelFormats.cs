namespace Nexplore.Practices.Syncfusion.Excel.Config
{
    public class DefaultExcelFormats : IExcelFormats
    {
        public int MaxColumnWidth => 40;

        public string DateTimeFormat => $"{this.DateOnlyFormat} {this.TimeOnlyFormat}";

        public string DateOnlyFormat => "dd.mm.yyyy";

        public string TimeOnlyFormat => "hh:mm:ss";

        public string IntegerFormat => "0";

        public string FloatFormat => "0.00";
    }
}