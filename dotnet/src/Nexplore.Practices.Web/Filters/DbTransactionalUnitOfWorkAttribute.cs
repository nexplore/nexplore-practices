namespace Nexplore.Practices.Web.Filters
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics.CodeAnalysis;
    using System.Linq;
    using System.Threading.Tasks;
    using Autofac;
    using Microsoft.AspNetCore.Mvc.Filters;
    using Microsoft.Extensions.DependencyInjection;
    using Nexplore.Practices.Core.Extensions;
    using Nexplore.Practices.Core.Scopes;

    /// <summary>
    /// Creates a <see cref="IUnitOfWorkWithSingleDbTransaction"/> for controller invocation.
    /// </summary>
    public class DbTransactionalUnitOfWorkAttribute : ActionFilterAttribute, IAsyncResourceFilter
    {
        private readonly bool commitDbTransactionIfNoException;
        private readonly HashSet<int> commitDbTransactionIfNoExceptionAndOneOfStatusCodes = null!;

        /// <summary>
        /// Initializes a new instance of the <see cref="DbTransactionalUnitOfWorkAttribute"/> class.
        /// </summary>
        /// <param name="commitDbTransactionIfNoException">If set to true, the transaction is committed when the controller response ends.
        /// Be aware of in case of streaming responses the transaction is kept open for a long period. In this case it's better to commit the transaction by yourself.</param>
        public DbTransactionalUnitOfWorkAttribute(bool commitDbTransactionIfNoException = false)
        {
            this.commitDbTransactionIfNoException = commitDbTransactionIfNoException;
        }

        /// <summary>
        ///  Initializes a new instance of the <see cref="DbTransactionalUnitOfWorkAttribute"/> class.
        /// </summary>
        /// <param name="commitDbTransactionIfNoExceptionAndStatusCode">The transaction is committed when the controller response ends with the given status code.
        /// Be aware of in case of streaming responses the transaction is kept open for a long period. In this case it's better to commit the transaction by yourself.</param>
        /// <param name="commitDbTransactionIfNoExceptionAndOneOfStatusCodes">Additional status codes to commit the transaction if response ends with one of the given status codes.</param>
        public DbTransactionalUnitOfWorkAttribute(int commitDbTransactionIfNoExceptionAndStatusCode, params int[] commitDbTransactionIfNoExceptionAndOneOfStatusCodes)
        {
            this.commitDbTransactionIfNoExceptionAndOneOfStatusCodes = new[] { commitDbTransactionIfNoExceptionAndStatusCode }.Union(commitDbTransactionIfNoExceptionAndOneOfStatusCodes).Distinct().ToHashSet();
        }

        /// <summary>
        /// When invoked, a new <see cref="IUnitOfWorkWithSingleDbTransaction"/> is created.
        /// </summary>
        /// <param name="context"><see cref="ResourceExecutingContext"/>.</param>
        /// <param name="next"><see cref="ResourceExecutionDelegate"/>.</param>
        /// <returns><see cref="Task"/>.</returns>
        [SuppressMessage("Naming", "CA1716:Identifiers should not match keywords", Justification = "Defined by the interface.")]
        public virtual async Task OnResourceExecutionAsync(ResourceExecutingContext context, ResourceExecutionDelegate next)
        {
            using var transactionalUnitOfWork = await context.HttpContext.RequestServices.GetRequiredService<IUnitOfWorkFactory<ILifetimeScope>>()
                .BeginWithSingleDbTransactionAsync().ConfigureAwait(false);

            context.HttpContext.RequestServices = transactionalUnitOfWork.Dependent.Resolve<IServiceProvider>();

            await next().ConfigureAwait(false);
        }

        /// <summary>
        /// When invoked, the <see cref="IUnitOfWorkWithSingleDbTransaction"/> is committed if specified.
        /// </summary>
        /// <param name="context"><see cref="ActionExecutingContext"/>.</param>
        /// <param name="next"><see cref="ActionExecutionDelegate"/>.</param>
        /// <returns><see cref="Task"/>.</returns>
        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            ActionExecutedContext resultContext = await next().ConfigureAwait(false);

            if (resultContext.Exception == null)
            {
                var shouldCommitByHttpStatus = this.commitDbTransactionIfNoExceptionAndOneOfStatusCodes != null
                    && this.commitDbTransactionIfNoExceptionAndOneOfStatusCodes.Contains(resultContext.HttpContext.Response.StatusCode);

                var shouldCommitByFlag = this.commitDbTransactionIfNoException;

                if (shouldCommitByHttpStatus || shouldCommitByFlag)
                {
                    await context.HttpContext.RequestServices.GetRequiredService<IUnitOfWorkWithSingleDbTransaction>()
                       .ThrowIfDefault(() => new InvalidOperationException($"There is no '{nameof(IUnitOfWorkWithSingleDbTransaction)}' present."))
                       .CommitDbTransactionAsync().ConfigureAwait(false);
                }
            }
        }
    }
}
