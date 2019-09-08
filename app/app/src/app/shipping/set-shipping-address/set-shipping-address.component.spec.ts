import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetShippingAddressComponent } from './set-shipping-address.component';

describe('SetShippingAddressComponent', () => {
  let component: SetShippingAddressComponent;
  let fixture: ComponentFixture<SetShippingAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetShippingAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetShippingAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
