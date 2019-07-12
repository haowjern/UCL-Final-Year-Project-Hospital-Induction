import { Component, OnInit } from '@angular/core';
import { ROUTES } from './routes';

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
