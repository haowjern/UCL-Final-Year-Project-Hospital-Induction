import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsAddFormComponent } from './maps-add-form.component';

describe('MapsAddFormComponent', () => {
  let component: MapsAddFormComponent;
  let fixture: ComponentFixture<MapsAddFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapsAddFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
