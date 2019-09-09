import { Component, OnInit, ViewChild, Input  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MapsDeleteComponent } from '../../maps-delete/maps-delete.component';
import { MatDialog } from '@angular/material/dialog';
import { AssetsDeleteComponent } from '../../assets-delete/assets-delete.component';
import { routes } from '../../app-routing.module';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  addLink: string;
  editLink: string;
  deleteLink: string;

  addButtonDisabled: boolean;
  editButtonDisabled: boolean;
  deleteButtonDisabled: boolean;

  @Input() title: string;
  @Input() displayedColumns: string[];
  @Input() dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.addButtonDisabled = true;
    this.editButtonDisabled = true;
    this.deleteButtonDisabled = true;

    if (this.title === 'maps' || this.title === 'assets') {
      this.deleteButtonDisabled = false;
    }

    this.addLink = '/' + this.title + '/add';
    this.editLink = '/' + this.title + '/edit';
    // this.deleteLink = '/' + this.title + '/delete';

    for (const route of routes) {
      console.log('route is: ' + route);
      if (route.path === this.addLink.slice(1)) {
        this.addButtonDisabled = false;
      }

      if (route.path === this.editLink.slice(1)) {
        this.editButtonDisabled = false;
      }
    }
  }

  onDelete() {
    if (this.title === 'maps') {
      this.dialog.open(MapsDeleteComponent, {
        width: '500px',
        height: '500px',
      });
    } else if (this.title === 'assets') {
      this.dialog.open(AssetsDeleteComponent, {
        width: '500px',
        height: '500px',
      });
    }
  }
}
