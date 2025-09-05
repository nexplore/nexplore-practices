namespace Nexplore.Practices.Syncfusion.Excel.ColumnMapping;

using System;
using System.Linq.Expressions;

public static class ExpressionExtensions
{
    public static string GetPropertyName<TEntity, TProp>(this Expression<Func<TEntity, TProp>> propertySelector)
        where TEntity : class
    {
        if (propertySelector.Body is MemberExpression memberBody)
        {
            return memberBody.Member.Name;
        }

        throw new InvalidOperationException(
            $"Property Selectors must be a {nameof(MemberExpression)}. Cannot handle {propertySelector.Body.Type.Name}");
    }
}