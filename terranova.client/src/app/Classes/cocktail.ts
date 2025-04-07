import { sample } from "rxjs";

/**
 * Defines the different volume measurement units available for ingredients
 */
type Volumemeasure =
	| 'cc'
	| 'ml'
	| 'cl'
	| 'tsp'
	| 'fl oz'
	| 'cup'
	| 'pint'
	| 'quart'
	| 'gallon';
	
/**
 * Defines the different weight measurement units available for ingredients
 */
type Weightmeasure = 'gr' | 'kg' | 'lb' | 'oz' | 'mg';

/**
 * Measurement system preference for users
 */
export type MeasureUnit = 'imperial' | 'metric';

/**
 * Represents a cocktail ingredient with name, quantity, and measurement unit
 */
export class Ingredient {
	constructor(
		public name: string,
		public quantity: number,
		public measure: Volumemeasure | Weightmeasure
	) {}
}

export type Glass = {
	name: string;
	measure: number; //always in ml
}

/**
 * Represents a cocktail with all its properties
 */
export class Cocktail {
	constructor(
		public id: number,
		public Alcoholic: boolean,
		public Name: string,
		public Category: string,
		public Glass: Glass,
		public Description: string,
		public ingredients: Array<Ingredient>,
		public Instructions: string,
		public ImageUrl: string
	) {}
}

/**
 * Response structure for a full cocktail with potential errors
 */
export type FullCocktail = {
	Cocktail: Cocktail;
	errors?: string;
};

/**
 * Defines the size options for displaying cocktail results
 */
export type CockResoults = "small" | "medium" | "large";

/**
 * Returns a sample cocktail for testing purposes
 * @returns A pre-populated Cocktail instance
 */
export function getSampleCocktail(): Cocktail {
	return new Cocktail(
		1,
		true,
		'Mojito',
		'A refreshing Cuban cocktail with rum, mint, and lime.',
		{
			name: 'Highball glass',
			measure: 300,
		},
		'A refreshing Cuban cocktail with rum, mint, and lime.',
		[
			new Ingredient('White rum', 60, 'ml'),
			new Ingredient('Fresh lime juice', 30, 'ml'),
			new Ingredient('Sugar', 2, 'tsp'),
			new Ingredient('Mint leaves', 8, 'oz'),
			new Ingredient('Soda water', 100, 'ml'),
		],
		'Mix all ingredients in a glass and stir well.',
		'https://example.com/mojito.jpg'
	);
}

/**
 * Returns a sample list of cocktails for testing purposes
 * @returns An array of pre-populated Cocktail instances
 */
export function getSampleCocktailList(): Cocktail[] {
	return [
		new Cocktail(
			1,
			true,
			'Mojito',
			'Cocktail',
			{
				name: 'Highball glass',
				measure: 300,
			},
			'A refreshing Cuban cocktail with rum, mint, and lime.',
			[
				new Ingredient('White rum', 60, 'ml'),
				new Ingredient('Fresh lime juice', 30, 'ml'),
				new Ingredient('Sugar', 2, 'tsp'),
			],
			'Mix all ingredients in a glass and stir well.',
			'https://example.com/mojito.jpg'
		),
		new Cocktail(
			2,
			true,
			'Daiquiri',
			'Cocktail',
			{
				name: 'Cocktail glass',
				measure: 150,
			},
			'A classic cocktail made with rum, lime juice, and sugar.',
			[
				new Ingredient('White rum', 50, 'ml'),
				new Ingredient('Fresh lime juice', 25, 'ml'),
				new Ingredient('Sugar', 1, 'tsp'),
			],
			'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
			'https://example.com/daiquiri.jpg'
		),
	];
}
