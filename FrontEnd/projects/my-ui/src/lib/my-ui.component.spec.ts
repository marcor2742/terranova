import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUiComponent } from './my-ui.component';

describe('MyUiComponent', () => {
  let component: MyUiComponent;
  let fixture: ComponentFixture<MyUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
