import { Component, inject, input, model, signal, OnInit, OnDestroy, forwardRef } from '@angular/core'; // Import forwardRef
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Glass } from '../Classes/cocktail';

// PrimeNG Modules
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-glass-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    ChipModule,
    ProgressSpinnerModule
  ],
  templateUrl: './glass-selector.component.html',
  styleUrls: ['./glass-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GlassSelectorComponent),
      multi: true
    }
  ]
})
// Implement ControlValueAccessor
export class GlassSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private http = inject(HttpClient);

  // --- Inputs / Outputs / Models ---
  // Keep the model for internal state management and potential external binding if needed
  selectedGlasses = model<Glass[]>([]);
  placeholder = input<string>('Search and add glasses...');
  maxGlasses = input<number | undefined>(undefined);

  // --- Internal State ---
  suggestions = signal<Glass[]>([]);
  isLoading = signal<boolean>(false);
  currentSearchText = '';
  isDisabled = signal<boolean>(false); // Track disabled state

  private searchSubject = new Subject<string>();
  private searchSubscription: any;
  private glassApiUrl = environment.glassUrl;

  // --- ControlValueAccessor implementation ---
  onChange: (value: Glass[]) => void = () => {}; // Placeholder for the callback function
  onTouched: () => void = () => {}; // Placeholder for the callback function

  /** Writes a new value to the element. */
  writeValue(value: Glass[]): void {
    // When the parent form sets the value, update the internal model
    if (value) {
      this.selectedGlasses.set(value);
    } else {
      this.selectedGlasses.set([]);
    }
    console.log('writeValue called with:', value);
  }

  /** Registers a callback function that is called when the control's value changes in the UI. */
  registerOnChange(fn: (value: Glass[]) => void): void {
    this.onChange = fn; // Save the function
    console.log('registerOnChange called');
  }

  /** Registers a callback function that is called by the forms API on initialization to update the form model on blur. */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn; // Save the function
    console.log('registerOnTouched called');
  }

  /** Function that is called by the forms API when the control status changes to or from 'DISABLED'. */
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled); // Update the disabled state signal
    console.log('setDisabledState called with:', isDisabled);
  }
  // --- End ControlValueAccessor implementation ---


  ngOnInit() {
    this.searchSubscription = this.searchSubject.pipe(
      // ... existing pipe logic ...
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isLoading.set(true)),
      switchMap(query => {
        if (!query || query.length < 1 || this.isDisabled()) { // Check disabled state
          this.isLoading.set(false);
          this.suggestions.set([]);
          return of([]);
        }
        const params = new HttpParams()
          .set('SearchString', query)
          .set('PageSize', '10')
          .set('Page', '1');
        return this.http.get<Glass[]>(this.glassApiUrl, { params }).pipe(
          catchError(error => {
            console.error('Error searching glasses:', error);
            this.isLoading.set(false);
            return of([]);
          })
        );
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe(results => {
      const currentSelectionNames = new Set(this.selectedGlasses().map(g => g.name));
      this.suggestions.set(results.filter(r => !currentSelectionNames.has(r.name)));
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  search(event: AutoCompleteCompleteEvent) {
    if (!this.isDisabled()) { // Don't search if disabled
        this.searchSubject.next(event.query);
    }
  }

  onGlassSelect(event: any) {
    if (this.isDisabled()) return; // Don't allow selection if disabled

    const selected: Glass = event.value;

    if (this.maxGlasses() !== undefined && this.selectedGlasses().length >= this.maxGlasses()!) {
        console.warn(`Maximum number of glasses (${this.maxGlasses()}) reached.`);
        this.currentSearchText = '';
        this.suggestions.set([]);
        return;
    }

    if (selected && !this.selectedGlasses().some(g => g.name === selected.name)) {
      // Update the internal model AND call onChange to notify the parent form
      const newValue = [...this.selectedGlasses(), selected];
      this.selectedGlasses.set(newValue);
      this.onChange(newValue); // *** Notify Angular Forms ***
      this.onTouched(); // Mark as touched when selection changes
    }

    this.currentSearchText = '';
    this.suggestions.set([]);
  }

  removeGlass(glassToRemove: Glass): void {
    if (this.isDisabled()) return; // Don't allow removal if disabled

    const newValue = this.selectedGlasses().filter(glass => glass.name !== glassToRemove.name);
    this.selectedGlasses.set(newValue);
    this.onChange(newValue); // *** Notify Angular Forms ***
    this.onTouched(); // Mark as touched when selection changes
    console.log('Glass removed:', glassToRemove);
  }

  // You might want to call onTouched when the autocomplete loses focus,
  // but p-autoComplete doesn't have a standard blur output.
  // Calling it on selection/removal change is a common approach.

  get isMaxReached(): boolean {
    return this.maxGlasses() !== undefined && this.selectedGlasses().length >= this.maxGlasses()!;
  }
}