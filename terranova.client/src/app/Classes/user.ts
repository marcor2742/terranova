import { MeasureUnit } from './cocktail';

export class User {
	constructor(
		public id: string,
		public username: string,
		public email: string,
		public firstName: string,
		public lastName: string,
		public measurements: MeasureUnit
	) {}
}
