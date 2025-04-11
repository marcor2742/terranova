import { MeasureUnit } from './cocktail';

/**
 * Represents a user in the application
 * Contains user details and preferences
 */
export class User {
	/**
	 * Creates a new User instance
	 * @param id - Unique identifier for the user
	 * @param username - User's chosen username
	 * @param email - User's email address
	 * @param firstName - User's first name
	 * @param lastName - User's last name
	 * @param measurements - User's preferred measurement system (metric or imperial)
	 */
	constructor(
		public id: string,
		public username: string,
		public email: string,
		public firstName: string,
		public lastName: string,
		public measurements: MeasureUnit
	) {}
}
