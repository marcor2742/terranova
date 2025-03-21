import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { CocktailCardComponent } from './cocktail-card/cocktail-card.component';
export const routes: Routes = [
	{ path: "login", component: LoginPageComponent },
	{ path: "card", component: CocktailCardComponent },
	{ path: "", redirectTo: "login", pathMatch: "full" },
];
