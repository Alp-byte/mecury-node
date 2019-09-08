import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateShippingComponent } from './calculate-shipping.component';

describe('CalculateShippingComponent', () => {
  let component: CalculateShippingComponent;
  let fixture: ComponentFixture<CalculateShippingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculateShippingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateShippingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
