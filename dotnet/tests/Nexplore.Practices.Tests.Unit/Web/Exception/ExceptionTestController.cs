namespace Nexplore.Practices.Tests.Unit.Web.Exception
{
    using System;
    using System.Security;
    using Microsoft.AspNetCore.Mvc;
    using Nexplore.Practices.Core.Exceptions;
    using Nexplore.Practices.Core.Validation;

    [ApiController]
    [Route("")]
    public class ExceptionTestController : ControllerBase
    {
        [HttpGet(ExceptionTestsBase.Endpoints.WithoutException)]
        public string GetWithoutException()
            => "Dummy response";

        [HttpGet(ExceptionTestsBase.Endpoints.EntityNotFoundException)]
        public string GetEntityNotFoundException()
            => throw new EntityNotFoundException();

        [HttpGet(ExceptionTestsBase.Endpoints.EntityValidationException)]
        public string GetEntityValidationException()
        {
            var errors = new[]
            {
                new EntityValidationError("Test validation exception"),
                new EntityValidationError("Test validation exception", nameof(ExceptionTestsBase.TestEntity.SampleProperty)),
            };
            var validationResult = new EntityValidationResult(new ExceptionTestsBase.TestEntity(), errors);
            throw new EntityValidationException([validationResult]);
        }

        [HttpGet(ExceptionTestsBase.Endpoints.BusinessException)]
        public string GetBusinessException()
               => throw new ExceptionTestsBase.TestBusinessException("Test exception occured.");

        [HttpGet(ExceptionTestsBase.Endpoints.SecurityException)]
        public string GetSecurityException()
            => throw new SecurityException();

        [HttpGet(ExceptionTestsBase.Endpoints.UnhandledException)]
        public string GetUnhandledException()
            => throw new InvalidOperationException();
    }
}
