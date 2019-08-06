import { Component, OnInit, ViewChild, Input  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MapsDeleteComponent } from '../../maps-delete/maps-delete.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  addLink: string;
  editLink: string;
  deleteLink: string;

  @Input() title: string;
  @Input() displayedColumns: string[];
  @Input() dataSource: MatTableDataSource<any>; 

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.addLink = '/' + this.title + '/add';
    this.editLink = '/' + this.title + '/edit';
    //this.deleteLink = '/' + this.title + '/delete';
  }

  onDelete() {
    if (this.title === 'maps') {
      let dialogRef = this.dialog.open(MapsDeleteComponent, {
        width: '500px',
        height: '500px',
      });
    }
  }
}
