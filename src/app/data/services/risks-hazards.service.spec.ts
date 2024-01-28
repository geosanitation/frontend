import { TestBed } from '@angular/core/testing';

import { RisksHazardsService } from './risks-hazards.service';

describe('RisksHazardsService', () => {
  let service: RisksHazardsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RisksHazardsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
