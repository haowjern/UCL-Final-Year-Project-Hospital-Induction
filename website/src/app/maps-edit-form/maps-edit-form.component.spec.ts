import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsEditFormComponent } from './maps-edit-form.component';

describe('MapsEditFormComponent', () => {
  let component: MapsEditFormComponent;
  let fixture: ComponentFixture<MapsEditFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsEditFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
