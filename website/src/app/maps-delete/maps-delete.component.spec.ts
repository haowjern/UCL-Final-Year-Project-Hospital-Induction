import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsDeleteComponent } from './maps-delete.component';

describe('MapsDeleteComponent', () => {
  let component: MapsDeleteComponent;
  let fixture: ComponentFixture<MapsDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
