import { Routes } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';
import { CocktailListComponent } from './cocktail-list/cocktail-list.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ForYouComponent } from './for-you/for-you.component';
import { CocktailCardComponent } from './cocktail-card/cocktail-card.component';
import { CocktailCreatorComponent } from './cocktail-creator/cocktail-creator.component';

export const routes: Routes = [
	{ path: 'login', component: LoginPageComponent },
	{
		path: 'home',
		component: HomeComponent,
		children: [
			{ path: '', redirectTo: 'home', pathMatch: 'full' },
			{ path: 'home', component: ForYouComponent },
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'settings', component: SettingsComponent },
			{ path: 'cocktail/:id', component: CocktailCardComponent },
			{ path: 'cocktails/:ids', component: CocktailListComponent},
			{ path: 'search', component: CocktailListComponent },
			{ path: 'search/:term', component: CocktailListComponent },
			{ path: 'create', component: CocktailCreatorComponent },
		],
	},
	{ path: '', redirectTo: 'home', pathMatch: 'full' },
	{ path: '**', component: NotFoundComponent },
];
