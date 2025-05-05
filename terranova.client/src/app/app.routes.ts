import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { CocktailCardComponent } from './cocktail-card/cocktail-card.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { CocktailListComponent } from './cocktail-list/cocktail-list.component';

export const routes: Routes = [
	{ path: 'login', component: LoginPageComponent },
	{
		path: 'home',
		component: HomeComponent,
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'settings', component: SettingsComponent },
			{ path: 'cocktails', component: CocktailListComponent },
			{ path: 'search/:term', component: CocktailListComponent },
		]
	},
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
];
