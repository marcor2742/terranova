import { sample } from "rxjs";

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
	
type Weightmeasure = 'gr' | 'kg' | 'lb' | 'oz' | 'mg';

export type MeasureUnit = 'imperial' | 'metric';
export class ingredient {
	constructor(
		public name: string,
		public quantity: number,
		public measure: Volumemeasure | Weightmeasure
	) {}
}

export class Cocktail {
	constructor(
		public id: number,
		public Name: string,
		public Description: string,
		public ingredients: Array<ingredient>,
		public Instructions: string,
		public ImageUrl: string
	) {}
}

export type FullCocktail = {
	Cocktail: Cocktail;
	errors?: string;
};

export type CockResoults = "small" | "medium" | "large"

export function getSampleCocktail(): Cocktail {
	return new Cocktail(
		1,
		'Mojito',
		'A refreshing Cuban cocktail with rum, mint, and lime.',
		[
			new ingredient('White rum', 60, 'ml'),
			new ingredient('Fresh lime juice', 30, 'ml'),
			new ingredient('Sugar', 2, 'tsp'),
			new ingredient('Mint leaves', 8, 'oz'),
			new ingredient('Soda water', 100, 'ml'),
		],
		'Mix all ingredients in a glass and stir well.',
		'https://example.com/mojito.jpg'
	);
}

export function getSampleCocktailList(): Cocktail[] {
	return [
		new Cocktail(
			1,
			'Mojito',
			'A refreshing Cuban cocktail with rum, mint, and lime.',
			[
				new ingredient('White rum', 60, 'ml'),
				new ingredient('Fresh lime juice', 30, 'ml'),
				new ingredient('Sugar', 2, 'tsp'),
				new ingredient('Mint leaves', 8, 'oz'),
				new ingredient('Soda water', 100, 'ml'),
			],
			'Mix all ingredients in a glass and stir well.',
			'https://example.com/mojito.jpg'
		),
		new Cocktail(
			2,
			'Daiquiri',
			'A classic cocktail made with rum, lime juice, and sugar.',
			[
				new ingredient('White rum', 50, 'ml'),
				new ingredient('Fresh lime juice', 25, 'ml'),
				new ingredient('Sugar', 1, 'tsp'),
			],
			'Simplify by shaking all ingredients with ice and straining into a chilled glass.',
			'https://example.com/daiquiri.jpg'
		),
	];
}
