import { TestBed } from '@angular/core/testing';

import { JWThandlerService } from './jwthandler.service';

describe('JWThandlerService', () => {
  let service: JWThandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JWThandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
