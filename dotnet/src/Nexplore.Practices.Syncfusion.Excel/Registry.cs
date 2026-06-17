namespace Nexplore.Practices.Syncfusion.Excel
{
    using Autofac;
    using global::Syncfusion.XlsIO;
    using Nexplore.Practices.Syncfusion.Excel.Config;

    public class Registry : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            // Excel engine is disposable and should not be registered as singleton (it keeps a list of all workbooks)
            builder.RegisterType<ExcelEngine>().AsSelf().InstancePerLifetimeScope();
            builder.RegisterType<ExcelExporter>().As<IExcelExporter>().InstancePerLifetimeScope();
            builder.RegisterType<DefaultExportConfigFactory>().As<IExportConfigFactory>().SingleInstance();
            builder.RegisterType<DefaultExcelFormats>().As<IExcelFormats>().SingleInstance();
        }
    }
}