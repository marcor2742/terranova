import { TestBed } from '@angular/core/testing';

import { MyUiService } from './my-ui.service';

describe('MyUiService', () => {
  let service: MyUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
