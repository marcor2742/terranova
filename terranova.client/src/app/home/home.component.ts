import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { SearchbarComponent } from '../searchbar/searchbar.component';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../services/theme.service';
import { CommonModule } from '@angular/common';

/**
 * Main home component of the application
 * Displays the home page with sidebar navigation and theme toggling
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchbarComponent, RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
  /**
   * Signal controlling sidebar expanded state
   */
  sidebarExpanded = signal<boolean>(true);
  
  /**
   * Theme service for managing application theme
   */
  themeService = inject(ThemeService);
  
  /**
   * Toggles the sidebar between expanded and collapsed states
   */
  toggleSidebar() {
    this.sidebarExpanded.set(!this.sidebarExpanded());
  }

  /**
   * Toggles between light and dark theme
   */
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}