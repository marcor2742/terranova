import { TestBed } from '@angular/core/testing';

import { CockgetterService } from './cockgetter.service';

describe('CockgetterService', () => {
  let service: CockgetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CockgetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
