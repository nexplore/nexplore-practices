namespace Nexplore.Practices.EntityFramework.Extensions
{
    using System;
    using System.Data;
    using System.Threading;
    using System.Threading.Tasks;
    using Microsoft.Data.SqlClient;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.EntityFrameworkCore.Storage;
    using Nexplore.Practices.Core;
    using Nexplore.Practices.EntityFramework.Configuration;

    public static class DatabaseFacadeExtensions
    {
        public static bool HasDbTransaction(this DatabaseFacade databaseFacade)
        {
            return databaseFacade?.CurrentTransaction != null;
        }

        public static void AssertHasDbTransaction(this DatabaseFacade databaseFacade)
        {
            Guard.Assert(HasDbTransaction(databaseFacade), "Database context with transaction is required.");
        }

        public static SqlTransaction EnsureSqlDbTransaction(this DatabaseFacade databaseFacade)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));

            AssertHasDbTransaction(databaseFacade);

            var transaction = databaseFacade.CurrentTransaction?.GetDbTransaction() as SqlTransaction;
            Guard.Assert(transaction != null, "Sql server database transaction is required.");

            return transaction;
        }

        public static IDbContextTransaction UseTransaction(this DatabaseFacade databaseFacade, IDbContextTransaction transaction)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(transaction, nameof(transaction));

            return databaseFacade.UseTransaction(transaction.GetDbTransaction());
        }

        public static void WithExistingSqlTransaction(this DatabaseFacade databaseFacade, Action<SqlConnection, SqlTransaction> callback)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(callback, nameof(callback));

            var transaction = databaseFacade.EnsureSqlDbTransaction();
            callback(transaction.Connection, transaction);
        }

        public static async Task WithExistingSqlTransactionAsync(this DatabaseFacade databaseFacade, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, CancellationToken cancellationToken = default)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(callback, nameof(callback));

            var transaction = databaseFacade.EnsureSqlDbTransaction();
            await callback(transaction.Connection, transaction, cancellationToken).ConfigureAwait(false);
        }

        public static void WithNewSqlTransaction(this DatabaseFacade databaseFacade, Action<SqlConnection, SqlTransaction> callback, IsolationLevel isolationLevel = IsolationLevel.Unspecified)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(callback, nameof(callback));

            WithNewSqlTransaction(databaseFacade.GetConnectionString(), callback, isolationLevel);
        }

        public static void WithNewSqlTransaction(this DatabaseFacade databaseFacade, DatabaseOptions databaseOptions, Action<SqlConnection, SqlTransaction> callback, IsolationLevel isolationLevel = IsolationLevel.Unspecified)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(databaseOptions, nameof(databaseOptions));
            Guard.ArgumentNotNull(callback, nameof(callback));

            WithNewSqlTransaction(databaseOptions.ConnectionString, callback, isolationLevel);
        }

        public static async Task WithNewSqlTransactionAsync(this DatabaseFacade databaseFacade, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, IsolationLevel isolationLevel = IsolationLevel.Unspecified, CancellationToken cancellationToken = default)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(callback, nameof(callback));

            await WithNewSqlTransactionAsync(databaseFacade.GetConnectionString(), callback, isolationLevel, cancellationToken).ConfigureAwait(false);
        }

        public static async Task WithNewSqlTransactionAsync(this DatabaseFacade databaseFacade, DatabaseOptions databaseOptions, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, IsolationLevel isolationLevel = IsolationLevel.Unspecified, CancellationToken cancellationToken = default)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(databaseOptions, nameof(databaseOptions));
            Guard.ArgumentNotNull(callback, nameof(callback));

            await WithNewSqlTransactionAsync(databaseOptions.ConnectionString, callback, isolationLevel, cancellationToken).ConfigureAwait(false);
        }

        public static void WithExistingOrNewSqlTransaction(this DatabaseFacade databaseFacade, Action<SqlConnection, SqlTransaction> callback)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));

            if (databaseFacade.CurrentTransaction == null)
            {
                databaseFacade.WithNewSqlTransaction(callback);
            }
            else
            {
                databaseFacade.WithExistingSqlTransaction(callback);
            }
        }

        public static void WithExistingOrNewSqlTransaction(this DatabaseFacade databaseFacade, DatabaseOptions databaseOptions, Action<SqlConnection, SqlTransaction> callback)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(databaseOptions, nameof(databaseOptions));

            if (databaseFacade.CurrentTransaction == null)
            {
                databaseFacade.WithNewSqlTransaction(databaseOptions, callback);
            }
            else
            {
                databaseFacade.WithExistingSqlTransaction(callback);
            }
        }

        public static Task WithExistingOrNewSqlTransactionAsync(this DatabaseFacade databaseFacade, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, CancellationToken cancellationToken = default)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));

            if (databaseFacade.CurrentTransaction == null)
            {
                return databaseFacade.WithNewSqlTransactionAsync(callback, cancellationToken: cancellationToken);
            }
            else
            {
                return databaseFacade.WithExistingSqlTransactionAsync(callback, cancellationToken);
            }
        }

        public static Task WithExistingOrNewSqlTransactionAsync(this DatabaseFacade databaseFacade, DatabaseOptions databaseOptions, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, CancellationToken cancellationToken = default)
        {
            Guard.ArgumentNotNull(databaseFacade, nameof(databaseFacade));
            Guard.ArgumentNotNull(databaseOptions, nameof(databaseOptions));

            if (databaseFacade.CurrentTransaction == null)
            {
                return databaseFacade.WithNewSqlTransactionAsync(databaseOptions, callback, cancellationToken: cancellationToken);
            }
            else
            {
                return databaseFacade.WithExistingSqlTransactionAsync(callback, cancellationToken);
            }
        }

        private static async Task WithNewSqlTransactionAsync(string connectionString, Func<SqlConnection, SqlTransaction, CancellationToken, Task> callback, IsolationLevel isolationLevel, CancellationToken cancellationToken = default)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync(cancellationToken).ConfigureAwait(false);

                using (var transaction = (SqlTransaction)await connection.BeginTransactionAsync(isolationLevel, cancellationToken).ConfigureAwait(false))
                {
                    await callback(transaction.Connection, transaction, cancellationToken).ConfigureAwait(false);
                    await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
                    await connection.CloseAsync().ConfigureAwait(false);
                }
            }
        }

        private static void WithNewSqlTransaction(string connectionString, Action<SqlConnection, SqlTransaction> callback, IsolationLevel isolationLevel)
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();

                using (var transaction = connection.BeginTransaction(isolationLevel))
                {
                    callback(transaction.Connection, transaction);
                    transaction.Commit();
                    connection.Close();
                }
            }
        }
    }
}
