import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { Component } from '@angular/core';
export const routes: Routes = [
	{ path: "login", component: LoginPageComponent },
	{ path: "", redirectTo: "login", pathMatch: "full" },
];
