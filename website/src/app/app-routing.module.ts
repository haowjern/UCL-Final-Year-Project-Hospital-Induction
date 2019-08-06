import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnchorsComponent } from './anchors/anchors.component';
import { AssetsComponent } from './assets/assets.component';
import { MapsComponent } from './maps/maps.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UsersComponent } from './users/users.component';
import { MapsAddFormComponent } from './maps-add-form/maps-add-form.component';
import { MapsEditFormComponent } from './maps-edit-form/maps-edit-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'anchors', component: AnchorsComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'scenarios', component: ScenariosComponent },
  { path: 'users', component: UsersComponent },
  { path: 'maps/add', component: MapsAddFormComponent },
  { path: 'maps/edit', component: MapsEditFormComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
