namespace Nexplore.Practices.CommandLine
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Reflection;
    using Autofac;
    using Nexplore.Practices.CommandLine.Attributes;
    using Nexplore.Practices.CommandLine.Commands;
    using Nexplore.Practices.CommandLine.Options;
    using Nexplore.Practices.Core;

    public class CliStructureBuilder
    {
        private readonly ICliCommandInvoker commandInvoker;
        private readonly ICliCommand[] cliCommands;
        private readonly ICliOption[] options;
        private readonly Type commandInvokerType;

        public CliStructureBuilder(ICliCommandInvoker commandInvoker, ICliCommand[] cliCommands, ICliOption[] options)
        {
            Guard.ArgumentNotNull(commandInvoker, nameof(commandInvoker));
            Guard.ArgumentNotNull(cliCommands, nameof(cliCommands));

            this.commandInvoker = commandInvoker;
            this.commandInvokerType = this.commandInvoker.GetType();
            this.cliCommands = cliCommands;
            this.options = options;
        }

        public void Build()
        {
            foreach (var cliCommand in this.cliCommands)
            {
                this.RegisterCommand(cliCommand);
                this.RegisterOptions(cliCommand);
            }
        }

        public static void ContainerBuildCallbackToBuildCliStructure(ILifetimeScope lifetimeScope)
        {
            var commandInvoker = lifetimeScope.Resolve<ICliCommandInvoker>();
            var commands = lifetimeScope.Resolve<IEnumerable<ICliCommand>>();
            var options = lifetimeScope.Resolve<IEnumerable<ICliOption>>();

            var structureBuilder = new CliStructureBuilder(commandInvoker, [.. commands], [.. options]);
            structureBuilder.Build();
        }

        private void RegisterCommand(ICliCommand cliCommand)
        {
            var parentCommand = this.GetParentCommand(cliCommand);
            if (parentCommand != null)
            {
                // Register me at parent
                parentCommand.RegisterCliSubCommand(cliCommand);
                return;
            }

            // Register me at root
            this.commandInvoker.RegisterCommand(cliCommand);
        }

        private void RegisterOptions(ICliCommand cliCommand)
        {
            var cliOptions = this.GetCliOptions(cliCommand);
            cliCommand.RegisterCliOptions(cliOptions);
        }

        private ICliCommand GetParentCommand(ICliCommand cliCommand)
        {
            var parentCommandType = GetParentCommandType(cliCommand);

            if (parentCommandType == null || parentCommandType == this.commandInvokerType)
            {
                return null;
            }

            return this.cliCommands.FirstOrDefault(c => c.GetType() == parentCommandType);
        }

        private static Type GetParentCommandType(ICliCommand cliCommand)
        {
            var attribute = cliCommand.GetType().GetCustomAttributes().OfType<HasParentCliCommandAttribute>().FirstOrDefault();

            return attribute?.ParentCliCommand;
        }

        private IEnumerable<ICliOption> GetCliOptions(ICliCommand cliCommand)
        {
            var optionTypes = GetCliOptionTypes(cliCommand).ToArray();

            return optionTypes
                .Select(optionType => this.options.FirstOrDefault(o => o.GetType() == optionType))
                .Where(option => option != null);
        }

        private static IEnumerable<Type> GetCliOptionTypes(ICliCommand cliCommand)
        {
            var attributes = cliCommand.GetType().GetCustomAttributes().OfType<HasCliOptionAttribute>();

            return attributes.Where(a => a.CliOption != null).Select(a => a.CliOption);
        }
    }
}
