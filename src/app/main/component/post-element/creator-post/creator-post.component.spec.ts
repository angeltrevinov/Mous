import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatorPostComponent } from './creator-post.component';

describe('CreatorPostComponent', () => {
  let component: CreatorPostComponent;
  let fixture: ComponentFixture<CreatorPostComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatorPostComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
