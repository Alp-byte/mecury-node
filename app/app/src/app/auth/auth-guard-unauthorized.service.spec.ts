import { TestBed, inject } from '@angular/core/testing';

import { AuthGuardUnauthorizedService } from './auth-guard-unauthorized.service';

describe('AuthGuardUnauthorizedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthGuardUnauthorizedService]
    });
  });

  it('should be created', inject([AuthGuardUnauthorizedService], (service: AuthGuardUnauthorizedService) => {
    expect(service).toBeTruthy();
  }));
});
