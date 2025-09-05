namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping
{
    using System;

    internal sealed class Converter<TIn, TOut> : IConverter
    {
        private readonly Func<TIn, TOut> converter;

        public Converter(Func<TIn, TOut> converter)
        {
            this.converter = converter;
        }

        public object Execute(object value)
        {
            return value is null ? (object)default : this.converter((TIn)value);
        }
    }

    internal sealed class Converter<TContext, TIn, TOut> : IConverter<TContext>
    {
        private readonly Func<TContext, TIn, TOut> converter;

        public Converter(Func<TContext, TIn, TOut> converter)
        {
            this.converter = converter;
        }

        public object Execute(TContext context, object value)
        {
            return value is null ? (object)default : this.converter(context, (TIn)value);
        }
    }
}
