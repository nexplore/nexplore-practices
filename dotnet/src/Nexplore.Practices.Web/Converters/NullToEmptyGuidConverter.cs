namespace Nexplore.Practices.Web.Converters
{
    using System;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    public class NullToEmptyGuidConverter : JsonConverter<Guid>
    {
        public override Guid Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.GetString() == null ? Guid.Empty : reader.GetGuid();
        }

        public override void Write(Utf8JsonWriter writer, Guid value, JsonSerializerOptions options)
        {
            writer.WriteStringValue(value);
        }
    }
}
