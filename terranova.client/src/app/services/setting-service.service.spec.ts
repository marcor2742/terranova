import { TestBed } from '@angular/core/testing';

import { SettingServiceService } from './setting-service.service';

describe('SettingServiceService', () => {
  let service: SettingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
