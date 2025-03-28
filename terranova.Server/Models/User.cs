//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace terranova.Server.Models
//{
//    public class User
//    {
//        [Key]
//        public int UserId { get; set; }

//        [Required]
//        [Column(TypeName = "nvarchar(50)")]
//        [StringLength(50, MinimumLength = 3)]
//        public string Username { get; set; } = "";

//        [Required]
//        [Column(TypeName = "nvarchar(100)")]
//        [EmailAddress]
//        public string Email { get; set; } = "";

//        [Required]
//        [Column(TypeName = "nvarchar(100)")]
//        [StringLength(100, MinimumLength = 8)]
//        public string Password { get; set; } = "";

//    }
//}
