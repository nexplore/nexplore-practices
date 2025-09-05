namespace Nexplore.Practices.Core.Helpers
{
    using System;
    using System.Globalization;

    public class CultureInfoSwitcher : IDisposable
    {
        private readonly CultureInfo originalCulture;

        private bool isDisposed;

        public CultureInfoSwitcher(CultureInfo culture)
        {
            this.originalCulture = culture;
            SetCulture(culture);
        }

        public CultureInfoSwitcher(string cultureName)
            : this(new CultureInfo(cultureName))
        {
        }

        public void Dispose()
        {
            this.Dispose(true);
            GC.SuppressFinalize(this);
        }

        private static void SetCulture(CultureInfo culture)
        {
            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        protected virtual void Dispose(bool isDisposing)
        {
            if (isDisposing && !this.isDisposed)
            {
                SetCulture(this.originalCulture);
                this.isDisposed = true;
            }
        }
    }
}
