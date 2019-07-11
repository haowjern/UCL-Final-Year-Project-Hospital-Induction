import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnchorsComponent } from './anchors/anchors.component';
import { AssetsComponent } from './assets/assets.component';
import { MapsComponent } from './maps/maps.component';
import { ScenariosComponent } from './scenarios/scenarios.component';
import { UsersComponent } from './users/users.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'anchors', component: AnchorsComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'maps', component: MapsComponent },
  { path: 'scenarios', component: ScenariosComponent },
  { path: 'users', component: UsersComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
