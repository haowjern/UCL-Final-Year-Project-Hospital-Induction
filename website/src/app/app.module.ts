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
    UsersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatButtonModule,
    MatDividerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }