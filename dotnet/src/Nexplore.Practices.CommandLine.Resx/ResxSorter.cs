namespace Nexplore.Practices.CommandLine.Resx
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Xml;
    using System.Xml.Linq;

    public static class ResxSorter
    {
        /// <summary>
        /// Sort a Resource XML Document by "comment", "schema", "resheader", "assembly", "metadata", "data" appear in that order.
        /// With "resheader", "assembly", "metadata" and "data" elements sorted by "name" attribute.
        /// </summary>
        /// <param name="resx"></param>
        public static XDocument Sort(XDocument resx)
        {
            if(resx.Root == null)
            {
                throw new ArgumentException("The input document must not be null.");
            }

            return new XDocument(
                new XElement(resx.Root.Name,
                    from comment in resx.Root.Nodes() where comment.NodeType == XmlNodeType.Comment select comment,
                    from schema in resx.Root.Elements() where schema.Name.LocalName == "schema" select schema,
                    from resheader in resx.Root.Elements("resheader")
                    orderby resheader.Attribute("name")?.ToString() ?? string.Empty
                    select resheader,
                    from assembly in resx.Root.Elements("assembly")
                    orderby assembly.Attribute("name")?.ToString() ?? string.Empty
                    select assembly,
                    from metadata in resx.Root.Elements("metadata")
                    orderby metadata.Attribute("name")?.ToString() ?? string.Empty
                    select metadata,
                    from data in resx.Root.Elements("data").OrderBy(d => d.Attribute("name")?.ToString() ?? string.Empty, StringComparer.OrdinalIgnoreCase)
                    select data
                )
            );
        }

        /// <summary>
        /// Test if 'b' is the same as 'a' in the context of Resource XML.
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        public static bool ElementEquals(XElement a, XElement b)
        {
            return a.Name.LocalName == b.Name.LocalName &&
                   a.Attribute("name")?.Value == b.Attribute("name")?.Value;
        }

        /// <summary>
        /// Test if 'b' has the same elements as 'a' recursively.
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        public static bool IsSame(XElement a, XElement b)
        {
            var aDescendants = a.Elements().ToList();
            var bDescendants = b.Elements().ToList();

            return aDescendants.All(aElem =>
            {
                var bElem = bDescendants.Find(bElem => ElementEquals(aElem, bElem));

                return bElem != null && IsSame(aElem, bElem);
            });
        }

        /// <summary>
        /// Test if 'b' has the same order of elements as 'a'.
        /// </summary>
        /// <param name="a"></param>
        /// <param name="b"></param>
        public static bool IsSameOrder(XElement a, XElement b)
        {
            var aStack = new Stack<XElement>(a.Elements().ToList());
            var bStack = new Stack<XElement>(b.Elements().ToList());

            while (aStack.Count > 0)
            {
                var aElem = aStack.Count > 0 ? aStack.Pop() : null;
                var bElem = bStack.Count > 0 ? bStack.Pop() : null;

                while (aElem?.Attribute("name") == null && aStack.Count > 0)
                {
                    aElem = aStack.Pop();
                }

                while (bElem?.Attribute("name") == null && bStack.Count > 0)
                {
                    bElem = bStack.Pop();
                }

                if (aElem == null ||
                    bElem == null ||
                    !IsSameOrder(aElem, bElem) ||
                    !ElementEquals(aElem, bElem))
                {
                    return false;
                }
            }

            return true;
        }
    }
}
