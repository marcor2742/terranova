import { TestBed } from '@angular/core/testing';

import { UserGetterService } from './user-getter.service';

describe('UserGetterService', () => {
  let service: UserGetterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserGetterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
