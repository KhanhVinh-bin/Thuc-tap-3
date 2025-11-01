namespace DuAnWebBanKhoaHocAPI.DTOs
{
    public class CategoryDTO
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int? ParentId { get; set; }
    }

    public class CategoryCreateDTO
    {
        public string CategoryName { get; set; }
        public int? ParentId { get; set; }
    }

    public class CategoryUpdateDTO
    {
        public string CategoryName { get; set; }
        public int? ParentId { get; set; }
    }
}