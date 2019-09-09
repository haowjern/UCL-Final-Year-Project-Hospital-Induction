import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { MatToolbarModule} from '@angular/material/toolbar';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatListModule} from '@angular/material/list';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AnchorsComponent } from './anchors/anchors.component';
import { AssetsComponent } from './assets/assets.component';
import { MapsComponent } from './maps/maps.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UsersComponent } from './users/users.component';
import { MatTableModule} from '@angular/material/table';
import { MatButtonModule} from '@angular/material/button';
import { MatDividerModule} from '@angular/material/divider';
import { MatPaginatorModule} from '@angular/material/paginator';
import 'hammerjs';
import { MapsAddFormComponent } from './maps-add-form/maps-add-form.component';
import { SummaryComponent } from './components/summary/summary.component';

import { HttpClientModule } from '@angular/common/http';

import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


import { MatIconModule } from '@angular/material/icon';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { LocationFormComponent } from './location-form/location-form.component';

import { MatDialogModule} from '@angular/material/dialog'; 
import { MatRadioModule} from '@angular/material/radio';
import { MapsDeleteComponent } from './maps-delete/maps-delete.component';
import { MapsEditFormComponent } from './maps-edit-form/maps-edit-form.component';
import { AssetsDeleteComponent } from './assets-delete/assets-delete.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AnchorsComponent,
    AssetsComponent,
    MapsComponent,
    ScenariosComponent,
    UsersComponent,
    MapsAddFormComponent,
    SummaryComponent,
    LocationFormComponent,
    MapsDeleteComponent,
    MapsEditFormComponent,
    AssetsDeleteComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule, 
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatButtonModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [ LocationFormComponent, MapsDeleteComponent ]
})
export class AppModule { }