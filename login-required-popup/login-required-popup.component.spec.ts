import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRequiredPopupComponent } from './login-required-popup.component';

describe('LoginRequiredPopupComponent', () => {
  let component: LoginRequiredPopupComponent;
  let fixture: ComponentFixture<LoginRequiredPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRequiredPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginRequiredPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
