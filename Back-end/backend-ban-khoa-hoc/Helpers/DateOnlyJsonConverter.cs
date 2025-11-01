using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Du_An_Web_Ban_Khoa_Hoc.Helpers
{
    public class NullableDateOnlyJsonConverter : JsonConverter<DateOnly?>
    {
        private readonly string _format = "yyyy-MM-dd";

        // 2 dk tiên quyết

        //Nếu nhập object {year, month, day} thì phải nhập đủ cả 3 → không cho phép nhập thiếu.
        //Nếu không nhập gì(null hoặc bỏ trống) → cho qua, không làm mất dữ liệu cũ trong DB.
        //Nếu client gửi {0,0,0} thì coi như không nhập luôn (không báo lỗi).

        public override DateOnly? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null; // không nhập gì -> cho qua
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var str = reader.GetString();
                if (string.IsNullOrWhiteSpace(str))
                    return null; // cho phép bỏ trống ""

                return DateOnly.ParseExact(str, _format, null);
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                using var doc = JsonDocument.ParseValue(ref reader);
                var root = doc.RootElement;

                if (!root.TryGetProperty("year", out var yearProp) ||
                    !root.TryGetProperty("month", out var monthProp) ||
                    !root.TryGetProperty("day", out var dayProp))
                {
                    throw new JsonException("DateOnly object must include {year, month, day}.");
                }

                int year = yearProp.GetInt32();
                int month = monthProp.GetInt32();
                int day = dayProp.GetInt32();

                //  Nếu toàn bộ đều = 0 => coi như null (không nhập)
                if (year == 0 && month == 0 && day == 0)
                    return null;

                //  Check hợp lệ
                if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31)
                    throw new JsonException($"Invalid DateOnly value: {year}-{month}-{day}");

                return new DateOnly(year, month, day);
            }

            throw new JsonException("DateOnly? must be null, a string ('yyyy-MM-dd'), or an object with {year, month, day}.");
        }

        public override void Write(Utf8JsonWriter writer, DateOnly? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
            {
                // Xuất ra dạng yyyy-MM-dd
                writer.WriteStringValue(value.Value.ToString("yyyy-MM-dd"));
            }
            else
            {
                // Nếu null thì trả về null JSON
                writer.WriteNullValue();
            }
        }

    }
}
