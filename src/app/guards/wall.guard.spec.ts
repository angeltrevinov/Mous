import { TestBed, async, inject } from '@angular/core/testing';

import { WallGuard } from './wall.guard';

describe('WallGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WallGuard]
    });
  });

  it('should ...', inject([WallGuard], (guard: WallGuard) => {
    expect(guard).toBeTruthy();
  }));
});
