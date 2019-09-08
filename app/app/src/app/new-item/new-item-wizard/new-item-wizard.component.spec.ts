import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewItemWizardComponent } from './new-item-wizard.component';

describe('NewItemWizardComponent', () => {
  let component: NewItemWizardComponent;
  let fixture: ComponentFixture<NewItemWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewItemWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
