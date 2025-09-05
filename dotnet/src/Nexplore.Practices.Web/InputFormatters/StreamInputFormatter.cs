namespace Nexplore.Practices.Web.InputFormatters
{
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.AspNetCore.Mvc.Formatters;

    public class StreamInputFormatter : IInputFormatter
    {
        public bool CanRead(InputFormatterContext context)
        {
            ArgumentNullException.ThrowIfNull(context);

            return context.ModelType.IsAssignableTo<Stream>();
        }

        public Task<InputFormatterResult> ReadAsync(InputFormatterContext context)
        {
            ArgumentNullException.ThrowIfNull(context);

            return InputFormatterResult.SuccessAsync(context.HttpContext.Request.Body);
        }
    }
}
