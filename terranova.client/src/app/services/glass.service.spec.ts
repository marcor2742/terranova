import { TestBed } from '@angular/core/testing';

import { GlassService } from './glass.service';

describe('GlassService', () => {
  let service: GlassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
