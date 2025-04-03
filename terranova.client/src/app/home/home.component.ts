import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  sidebarExpanded = signal<boolean>(true);
  themeService = inject(ThemeService);
  
  toggleSidebar() {
    this.sidebarExpanded.set(!this.sidebarExpanded());
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}