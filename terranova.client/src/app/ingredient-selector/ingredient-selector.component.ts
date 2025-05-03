import {
    Component,
    inject,
    input,
    output,
    signal,
    model,
    OnInit,
    OnDestroy,
    forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, of, Observable } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    switchMap,
    catchError,
    tap,
} from 'rxjs/operators';
import { environment } from '../../environments/environment';

// PrimeNG Modules
import {
    AutoCompleteModule,
    AutoCompleteCompleteEvent,
} from 'primeng/autocomplete';
import { ChipModule } from 'primeng/chip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

export interface IngredientSearch {
    id: number;
    name: string;
}

@Component({
    selector: 'app-ingredient-selector',
    imports: [
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        ChipModule,
        ProgressSpinnerModule,
    ],
    templateUrl: './ingredient-selector.component.html',
    styleUrl: './ingredient-selector.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IngredientSelectorComponent),
            multi: true
        }
    ]
})
export class IngredientSelectorComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private http = inject(HttpClient);

  // --- Inputs / Outputs / Models ---
  selectedIngredients = model<IngredientSearch[]>([]);
  placeholder = input<string>('Search and add ingredients...');
  maxIngredients = input<number | undefined>(undefined);

  // --- Internal State ---
  suggestions = signal<IngredientSearch[]>([]);
  isLoading = signal<boolean>(false);
  currentSearchText = '';
  isDisabled = signal<boolean>(false); // Track disabled state

  private searchSubject = new Subject<string>();
  private searchSubscription: any;
  private ingredientApiUrl = environment.ingredientUrl;

  // --- ControlValueAccessor implementation ---
  onChange: (value: IngredientSearch[]) => void = () => {};
  onTouched: () => void = () => {};

  /** Writes a new value to the element. */
  writeValue(value: IngredientSearch[]): void {
    // When the parent form sets the value, update the internal model
    if (value) {
      this.selectedIngredients.set(value);
    } else {
      this.selectedIngredients.set([]);
    }
    console.log('writeValue called with:', value);
  }

  /** Registers a callback function that is called when the control's value changes in the UI. */
  registerOnChange(fn: (value: IngredientSearch[]) => void): void {
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
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isLoading.set(true)),
      switchMap(query => {
        if (!query || query.length < 2 || this.isDisabled()) { // Check disabled state
          this.isLoading.set(false);
          this.suggestions.set([]);
          return of([]);
        }
        const params = new HttpParams()
          .set('SearchString', query)
          .set('PageSize', '10')
          .set('Page', '1');
        return this.http.get<IngredientSearch[]>(this.ingredientApiUrl, { params }).pipe(
          catchError(error => {
            console.error('Error searching ingredients:', error);
            this.isLoading.set(false);
            return of([]);
          })
        );
      }),
      tap(() => this.isLoading.set(false))
    ).subscribe(results => {
      const currentSelectionIds = new Set(this.selectedIngredients().map(i => i.id));
      this.suggestions.set(results.filter(r => !currentSelectionIds.has(r.id)));
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

  onIngredientSelect(event: any) {
    if (this.isDisabled()) return; // Don't allow selection if disabled

    const selected: IngredientSearch = event.value;

    if (this.maxIngredients() !== undefined && this.selectedIngredients().length >= this.maxIngredients()!) {
      console.warn(`Maximum number of ingredients (${this.maxIngredients()}) reached.`);
      this.currentSearchText = '';
      this.suggestions.set([]);
      return;
    }

    if (selected && !this.selectedIngredients().some(i => i.id === selected.id)) {
      // Update the internal model AND call onChange to notify the parent form
      const newValue = [...this.selectedIngredients(), selected];
      this.selectedIngredients.set(newValue);
      this.onChange(newValue); // *** Notify Angular Forms ***
      this.onTouched(); // Mark as touched when selection changes
    }

    this.currentSearchText = '';
    this.suggestions.set([]);
  }

  removeIngredient(ingredientToRemove: IngredientSearch): void {
    if (this.isDisabled()) return; // Don't allow removal if disabled

    const newValue = this.selectedIngredients().filter(ingredient => ingredient.id !== ingredientToRemove.id);
    this.selectedIngredients.set(newValue);
    this.onChange(newValue); // *** Notify Angular Forms ***
    this.onTouched(); // Mark as touched when selection changes
    console.log('Ingredient removed:', ingredientToRemove);
  }

  get isMaxReached(): boolean {
    return this.maxIngredients() !== undefined && this.selectedIngredients().length >= this.maxIngredients()!;
  }
}