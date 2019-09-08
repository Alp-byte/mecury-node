import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncWidgetComponent } from './sync-widget.component';

describe('SyncWidgetComponent', () => {
  let component: SyncWidgetComponent;
  let fixture: ComponentFixture<SyncWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
