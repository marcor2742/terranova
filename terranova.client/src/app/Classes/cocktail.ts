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
		name: string,
		quantity: number,
		measure: Volumemeasure | Weightmeasure
	) {}
}

export class Cocktail {
	constructor(
		id: number,
		Name: string,
		Description: string,
		ingredients: Array<ingredient>
	) {}
}
