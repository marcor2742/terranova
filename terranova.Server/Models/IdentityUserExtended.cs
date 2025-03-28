using Microsoft.AspNetCore.Identity;
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
        [Column(TypeName = "nvarchar(150)")]
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
        [Column(TypeName = "nvarchar(150)")]
        public string? GlassPreference { get; set; }

        [PersonalData]
        [Column(TypeName = "nvarchar(150)")]
        public string? BaseIngredientPreference { get; set; }

        [PersonalData]
        [Column(TypeName = "nvarchar(150)")]
        public string? Bio { get; set; }

        [PersonalData]
        [Column(TypeName = "nvarchar(150)")]
        public string? PropicUrl { get; set; }
    }
}
