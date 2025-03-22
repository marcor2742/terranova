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
