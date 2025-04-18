import { sample } from "rxjs";

/**
 * Defines the different volume and weight measurement units available for ingredients
 */
type MeasureUnit = 'imperial' | 'metric';

/**
 * Represents a cocktail ingredient with name and measurements
 */
export class Ingredient {
    /**
     * Creates a new ingredient
     * @param ingredient Name of the ingredient
     * @param metricMeasure Amount in metric units (e.g., "60 ml", "2 tsp")
     * @param imperialMeasure Amount in imperial units (e.g., "2 oz", "1/2 cup")
     */
    constructor(
        public ingredient: string,
        public metricMeasure: string,
        public imperialMeasure: string
    ) {}

    /**
     * Gets the name of the ingredient
     */
    get name(): string {
        return this.ingredient;
    }

    /**
     * Gets the appropriate measurement based on preferred unit system
     */
    getMeasure(preferredUnit: MeasureUnit = 'metric'): string {
        return preferredUnit === 'metric' ? this.metricMeasure : this.imperialMeasure;
    }

    /**
     * Returns a formatted string representation of the ingredient
     */
    toString(preferredUnit: MeasureUnit = 'metric'): string {
        return `${this.ingredient}: ${this.getMeasure(preferredUnit)}`;
    }
}

export interface Instructions {
    en: string;
    es?: string;
    de?: string;
    fr?: string;
    it?: string;
}

export type Glass = {
    name: string;
    measure: number; //always in ml
}

/**
 * Represents a cocktail with its properties and methods
 */
export class Cocktail {
    /**
     * Creates an instance of the Cocktail class
     */
    constructor(
        public id: number,
        public isAlcoholic: boolean,
        public name: string,
        public category: string,
        public glass?: string | Glass,
        public ingredients?: Ingredient[],
        public instructions?: string | Instructions,
        public imageUrl?: string
    ) {}

    /**
     * Gets the display name of the glass used for the cocktail
     * @returns The name of the glass, or "Standard Glass" if no specific glass is defined
     */
    public getGlassName(): string {
        if (typeof this.glass === 'string') {
            return this.glass;
        } else if (this.glass && typeof this.glass === 'object') {
            return this.glass.name;
        }
        return 'Standard Glass';
    }

    /**
     * Retrieves the preparation instructions for the cocktail in the specified language
     * @param lang - The language key for the instructions (default is 'en')
     * @returns The instruction text in the specified language, or a fallback if not available
     */
    public getInstructions(lang: keyof Instructions = 'en'): string {
        if (typeof this.instructions === 'string') {
            return this.instructions;
        } else if (this.instructions && typeof this.instructions === 'object') {
            return this.instructions[lang] || this.instructions.en || '';
        }
        return '';
    }

    /**
     * Gets the ingredients formatted based on the preferred measurement system
     * @param preferredUnit - The preferred measurement unit ('metric' or 'imperial')
     * @returns An array of formatted ingredient strings
     */
    public getIngredients(preferredUnit: MeasureUnit = 'metric'): string[] {
        if (!this.ingredients) return [];
        
        return this.ingredients.map(ing => ing.toString(preferredUnit));
    }
}

/**
 * Response structure for a full cocktail with potential errors
 */
export type FullCocktail = {
    cocktail: Cocktail;
    errors?: string;
};

/**
 * Defines the size options for displaying cocktail results
 */
export type CockResoults = "small" | "medium" | "large";

/**
 * Returns a sample cocktail for testing purposes
 */
export function getSampleCocktail(): Cocktail {
    return new Cocktail(
        1,
        true,
        'Mojito',
        'Cocktail',
        'Highball glass',
        [
            new Ingredient('White rum', '60 ml', '2 oz'),
            new Ingredient('Fresh lime juice', '30 ml', '1 oz'),
            new Ingredient('Sugar', '2 tsp', '2 tsp')
        ],
        {
            en: 'Mix all ingredients in a glass and stir well.',
            es: 'Mezclar todos los ingredientes en un vaso y remover bien.',
            it: 'Mescola tutti gli ingredienti in un bicchiere e mescola bene.'
        },
        'https://example.com/mojito.jpg'
    );
}