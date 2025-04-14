import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchresoultComponent } from './searchresoult.component';

describe('SearchresoultComponent', () => {
  let component: SearchresoultComponent;
  let fixture: ComponentFixture<SearchresoultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchresoultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchresoultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
