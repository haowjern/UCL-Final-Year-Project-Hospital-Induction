import { Component, OnInit } from '@angular/core';

export interface RouteInfo {
  path: string;
  title: string;
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard'},
  { path: '/anchors', title: 'Anchors'},
  { path: '/assets', title: 'Assets'},
  { path: '/maps', title: 'Maps'},
  { path: '/scenarios', title: 'Scenarios'},
  { path: '/users', title: 'Users'}
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'GOSH Treasure Hunt App Editor';
  sidebarItems: any[];

  ngOnInit() {
    this.sidebarItems = ROUTES;
  }

}
