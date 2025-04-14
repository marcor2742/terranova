import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { CocktailCardComponent } from './cocktail-card/cocktail-card.component';
import { HomeComponent } from './home/home.component';
export const routes: Routes = [
	{ path: 'login', component: LoginPageComponent },
	// { path: 'card', component: CocktailCardComponent },
	{ path: 'home', component: HomeComponent },
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
];
