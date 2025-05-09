import { TestBed } from '@angular/core/testing';

import { CocktailModifierService } from './cocktail-modifier.service';

describe('CocktailModifierService', () => {
  let service: CocktailModifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CocktailModifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
