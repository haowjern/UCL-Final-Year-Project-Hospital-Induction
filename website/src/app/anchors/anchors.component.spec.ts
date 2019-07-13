import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatPaginatorModule} from '@angular/material/paginator';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


import { AnchorsComponent } from './anchors.component';

describe('AnchorsComponent', () => {
  let component: AnchorsComponent;
  let fixture: ComponentFixture<AnchorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        MatDividerModule,
        MatToolbarModule,
        MatTableModule,
        MatButtonModule,
        MatDividerModule,
        MatPaginatorModule,
        BrowserAnimationsModule
      ],
      declarations: [ AnchorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnchorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create anchors component', () => {
    expect(component).toBeTruthy();
  });
});
