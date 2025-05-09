import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailCreatorComponent } from './cocktail-creator.component';

describe('CocktailCreatorComponent', () => {
  let component: CocktailCreatorComponent;
  let fixture: ComponentFixture<CocktailCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
