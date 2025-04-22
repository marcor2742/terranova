using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace terranova.Server.Models
{
    public enum AlcoholContentPreference
    {
        Alcoholic,
        NonAlcoholic,
        NoPreference
    }

    public enum Language
    {
        Italian,
        English,
        French,
        Spanish,
        German,
        Other
    }

    public enum MeasurementSystem
    {
        Metric,
        Imperial
    }

    public class IdentityUserExtended : IdentityUser
    {
        [PersonalData]
        [StringLength(150, ErrorMessage = "Name cannot be more than 150 char long")]
        public string? FullName { get; set; }

        [PersonalData]
        public DateOnly? BirthDate { get; set; }

        [PersonalData]
        public AlcoholContentPreference? AlcoholContentPreference { get; set; }

        //default is English
        private Language? _language;
        [PersonalData]
        public Language? Language
        {
            get => _language ?? Models.Language.English;
            set => _language = value;
        }

        //default is Metric
        private MeasurementSystem? _measurementSystem;
        [PersonalData]
        public MeasurementSystem? MeasurementSystem
        {
            get => _measurementSystem ?? Models.MeasurementSystem.Metric;
            set => _measurementSystem = value;
        }

        [PersonalData]
        [StringLength(150, ErrorMessage = "Glass preference cannot be more than 150 characters long")]
        public string? GlassPreference { get; set; }

        [PersonalData]
        [StringLength(150, ErrorMessage = "Base ingredient preference cannot be more than 150 characters long")]
        public string? BaseIngredientPreference { get; set; }

        [PersonalData]
        [StringLength(150, ErrorMessage = "Bio cannot be more than 150 char long")]
        public string? Bio { get; set; }

        [PersonalData]
        public string? PropicUrl { get; set; }

        public bool ShowMyCocktails { get; set; } = false;

        public virtual ICollection<Favorite>? Favorites { get; set; }
        public virtual ICollection<SearchHistory>? SearchHistories { get; set; }
    }

    public class Favorite
    {
        public long Id { get; set; }
        public string UserId { get; set; }
        public virtual IdentityUserExtended User { get; set; }
        public long CocktailId { get; set; }
        public DateTimeOffset Date { get; set; } = DateTimeOffset.UtcNow;
        public int Count { get; set; } = 1;
    }

    public class SearchHistory
    {
        public long Id { get; set; }
        public string UserId { get; set; }
        public IdentityUserExtended User { get; set; }
        public long CocktailId { get; set; }
        public DateTimeOffset Date { get; set; } = DateTimeOffset.UtcNow;
        public int Count { get; set; } = 1;
    }
}
