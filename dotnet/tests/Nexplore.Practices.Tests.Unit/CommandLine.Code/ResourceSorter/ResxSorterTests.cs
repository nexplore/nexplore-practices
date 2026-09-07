namespace Nexplore.Practices.Tests.Unit.CommandLine.Code.ResourceSorter
{
    using System;
    using System.IO;
    using System.Text;
    using System.Xml.Linq;
    using Nexplore.Practices.CommandLine.Code;
    using NUnit.Framework;

    [TestFixture]
    public class ResxSorterTests
    {
        [Test]
        public void Sort_WithXsdDataOnlyDocument_DoesNotChangeXsdData()
        {
            // Arrange
            const string fileContent = @"<root>
  <!-- Some Comment -->
  <xsd:schema id=""root"" xmlns="""" xmlns:xsd=""http://www.w3.org/2001/XMLSchema"" xmlns:msdata=""urn:schemas-microsoft-com:xml-msdata"">
    <xsd:import namespace=""http://www.w3.org/XML/1998/namespace"" />
    <xsd:element name=""root"" msdata:IsDataSet=""true"">
      <xsd:complexType>
        <xsd:choice maxOccurs=""unbounded"">
          <xsd:element name=""metadata"">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name=""value"" type=""xsd:string"" minOccurs=""0"" />
              </xsd:sequence>
              <xsd:attribute name=""name"" use=""required"" type=""xsd:string"" />
              <xsd:attribute name=""type"" type=""xsd:string"" />
              <xsd:attribute name=""mimetype"" type=""xsd:string"" />
              <xsd:attribute ref=""xml:space"" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name=""assembly"">
            <xsd:complexType>
              <xsd:attribute name=""alias"" type=""xsd:string"" />
              <xsd:attribute name=""name"" type=""xsd:string"" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name=""data"">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name=""value"" type=""xsd:string"" minOccurs=""0"" msdata:Ordinal=""1"" />
                <xsd:element name=""comment"" type=""xsd:string"" minOccurs=""0"" msdata:Ordinal=""2"" />
              </xsd:sequence>
              <xsd:attribute name=""name"" type=""xsd:string"" use=""required"" msdata:Ordinal=""1"" />
              <xsd:attribute name=""type"" type=""xsd:string"" msdata:Ordinal=""3"" />
              <xsd:attribute name=""mimetype"" type=""xsd:string"" msdata:Ordinal=""4"" />
              <xsd:attribute ref=""xml:space"" />
            </xsd:complexType>
          </xsd:element>
          <xsd:element name=""resheader"">
            <xsd:complexType>
              <xsd:sequence>
                <xsd:element name=""value"" type=""xsd:string"" minOccurs=""0"" msdata:Ordinal=""1"" />
              </xsd:sequence>
              <xsd:attribute name=""name"" type=""xsd:string"" use=""required"" />
            </xsd:complexType>
          </xsd:element>
        </xsd:choice>
      </xsd:complexType>
    </xsd:element>
  </xsd:schema>
</root>";

            var fileContentPlatformIndependent = fileContent.ReplaceLineEndings();
            using var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContentPlatformIndependent));
            var document = XDocument.Load(stream);

            // Act
            var sortedDoc = ResxSorter.Sort(document);

            // Assert
            Assert.That(sortedDoc.ToString(), Is.EqualTo(fileContentPlatformIndependent));
        }

        [Test]
        public void Sort_WithUnsortedDocument_SortsDataByNameAttribute()
        {
            // Arrange
            var sorted = MakeResxFileDocument("Foo", "Zoo");
            var unsorted = MakeResxFileDocument("Zoo", "Foo");

            // Act
            var result = ResxSorter.Sort(unsorted);

            // Assert
            Assert.That(sorted.ToString(), Is.EqualTo(result.ToString()));
        }

        [Test]
        public void Sort_WithSortedDocument_LeavesDocumentAsIs()
        {
            // Arrange
            var sorted = MakeResxFileDocument("Foo", "Zoo");

            // Act
            var result = ResxSorter.Sort(sorted);

            // Assert
            Assert.That(sorted.ToString(), Is.EqualTo(result.ToString()));
        }

        [Test]
        public void IsSame_WithSortedAndUnsortedData_ReturnsTrueIfTheSameNodesAreContained()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo");
            var b = MakeResxFileDocument("Foo", "Zoo");

            // Act, Assert
            Assert.That(ResxSorter.IsSame(a.Root, b.Root), Is.True);
        }

        [Test]
        public void IsSame_WithTwoResxDocuments_ReturnsFalseIfTheSecondFileDoesNotHaveAllTheSameNodesAsTheFirst()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo", "Bar");
            var b = MakeResxFileDocument("Foo", "Zoo");

            // Act, Assert
            Assert.That(ResxSorter.IsSame(a.Root, b.Root), Is.False);
        }

        [Test]
        public void IsSame_WithTwoResxDocuments_ReturnsTrueIfTheSecondFileHasAllAndMoreNodesAsTheFirst()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo");
            var b = MakeResxFileDocument("Foo", "Zoo", "Bar");

            // Act, Assert
            Assert.That(ResxSorter.IsSame(a.Root, b.Root), Is.True);
        }

        [Test]
        public void IsSameOrder_WithTwoResxDocuments_ReturnsTrueIfTheSecondFileHasAllTheSameNodesAsTheFirstInSameOrder()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo");
            var b = MakeResxFileDocument("Zoo", "Foo");

            // Act, Assert
            Assert.That(ResxSorter.IsSameOrder(a.Root, b.Root), Is.True);
        }

        [Test]
        public void IsSameOrder_WithTwoResxDocuments_ReturnsFalseIfTheOrderIsNotTheSame()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo");
            var b = MakeResxFileDocument("Foo", "Bar");

            // Act, Assert
            Assert.That(ResxSorter.IsSameOrder(a.Root, b.Root), Is.False);
        }

        [Test]
        public void IsSameOrder_WithTwoResxDocuments_ReturnsFalseIfOneOfTheFilesHasMoreNodesDespiteOrder()
        {
            // Arrange
            var a = MakeResxFileDocument("Zoo", "Foo");
            var b = MakeResxFileDocument("Zoo", "Foo", "Bar");

            // Act, Assert
            Assert.That(ResxSorter.IsSameOrder(a.Root, b.Root), Is.False);
            Assert.That(ResxSorter.IsSameOrder(b.Root, a.Root), Is.False);
        }

        private static XDocument MakeResxFileDocument(params string[] names)
        {
            var fileContent = $"<root>{Environment.NewLine}";

            foreach (var name in names)
            {
                fileContent +=
                    $"  <data name=\"{name}\" xml:space=\"preserve\">{Environment.NewLine}" +
                    $"    <value>{name.ToUpperInvariant()}</value>{Environment.NewLine}" +
                    $"  </data>{Environment.NewLine}";
            }

            fileContent += "</root>";

            using var stream = new MemoryStream(Encoding.UTF8.GetBytes(fileContent));
            return XDocument.Load(stream);
        }
    }
}

