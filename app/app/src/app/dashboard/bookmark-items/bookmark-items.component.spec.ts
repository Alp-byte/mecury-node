import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkItemsComponent } from './bookmark-items.component';

describe('BookmarkItemsComponent', () => {
  let component: BookmarkItemsComponent;
  let fixture: ComponentFixture<BookmarkItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookmarkItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
