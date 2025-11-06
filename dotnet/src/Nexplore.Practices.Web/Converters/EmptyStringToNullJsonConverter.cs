namespace Nexplore.Practices.Web.Converters
{
    using System;
    using System.Text.Json;
    using System.Text.Json.Serialization;

    public class EmptyStringToNullJsonConverter : JsonConverter<string>
    {
        public override string Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            var value = reader.GetString();
            if (string.IsNullOrEmpty(value))
            {
                return null;
            }
            else if (string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
            else
            {
                return value.Trim();
            }
        }

        public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
        {
            if (string.IsNullOrEmpty(value))
            {
                writer.WriteNullValue();
            }
            else
            {
                writer.WriteStringValue(value);
            }
        }
    }
}
