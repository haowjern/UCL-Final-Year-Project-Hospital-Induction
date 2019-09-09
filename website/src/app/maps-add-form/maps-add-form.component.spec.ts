import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MapsAddFormComponent } from './maps-add-form.component';
import { ConfigService } from '../services/config.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatRadioModule} from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';

import { DashboardComponent } from '../dashboard/dashboard.component';

import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MapsAddFormComponent', () => {
  let comp: MapsAddFormComponent;
  let fixture: ComponentFixture<MapsAddFormComponent>;
  let service: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatRadioModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        BrowserAnimationsModule
      ],
      declarations: [
        MapsAddFormComponent,
      ],
      providers: [
        ConfigService,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsAddFormComponent);
    comp = fixture.componentInstance;
    service = TestBed.get(ConfigService);
    fixture.detectChanges();
  });

  it ('isMap should return true', () => {
    spyOn(service, 'getMapWithID').and.returnValue(of([{asset_type_name: 'map'}]));
    expect(comp.isMap(1)).toBeTruthy();
  });
});
