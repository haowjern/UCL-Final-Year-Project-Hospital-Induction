import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { EditorComponent } from './components/editor/editor.component';
import { DisplayDataComponent } from './components/display-data/display-data.component';
import { AnchorsComponent } from './anchors/anchors.component';
import { AssetsComponent } from './assets/assets.component';
import { MapsComponent } from './maps/maps.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UsersComponent } from './users/users.component';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatPaginatorModule} from '@angular/material/paginator';
import 'hammerjs';
import { MapsAddFormComponent } from './maps-add-form/maps-add-form.component';
import { SummaryComponent } from './components/summary/summary.component';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    EditorComponent,
    DisplayDataComponent,
    AnchorsComponent,
    AssetsComponent,
    MapsComponent,
    ScenariosComponent,
    UsersComponent,
    MapsAddFormComponent,
    SummaryComponent
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
    MatPaginatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }