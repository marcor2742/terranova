import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CocktailCarouselComponent } from './cocktail-carousel.component';

describe('CocktailCarouselComponent', () => {
  let component: CocktailCarouselComponent;
  let fixture: ComponentFixture<CocktailCarouselComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CocktailCarouselComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CocktailCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
