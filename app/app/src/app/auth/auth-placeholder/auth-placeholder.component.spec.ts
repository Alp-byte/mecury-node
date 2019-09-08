import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthPlaceholderComponent } from './auth-placeholder.component';

describe('AuthPlaceholderComponent', () => {
  let component: AuthPlaceholderComponent;
  let fixture: ComponentFixture<AuthPlaceholderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthPlaceholderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
