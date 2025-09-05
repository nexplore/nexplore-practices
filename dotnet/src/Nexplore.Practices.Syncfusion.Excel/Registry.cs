namespace Nexplore.Practices.Syncfusion.Excel
{
    using Autofac;
    using global::Syncfusion.XlsIO;
    using Nexplore.Practices.Syncfusion.Excel.Config;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            builder.RegisterType<ExcelExporter>().As<IExcelExporter>().InstancePerLifetimeScope();
            builder.RegisterType<DefaultExportConfigFactory>().As<IExportConfigFactory>().SingleInstance();
            builder.RegisterType<DefaultExcelFormats>().As<IExcelFormats>().SingleInstance();
            builder.RegisterType<ExcelEngine>().AsSelf().SingleInstance();
        }
    }
}