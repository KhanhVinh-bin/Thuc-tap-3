namespace Du_An_Web_Ban_Khoa_Hoc.Models.DTO
{
    public class ResponsePageResult<T>
    {
        public IEnumerable<T> Data { get; set; } = new List<T>();
        public int Page { get; set; }
        public int Limit { get; set; } = 4;
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
    }

}
