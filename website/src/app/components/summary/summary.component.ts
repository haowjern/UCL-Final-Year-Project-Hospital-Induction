import { Component, OnInit, ViewChild, Input  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  displayedColumns: string[];
  addLink: string;
  editLink: string;
  deleteLink: string;

  @Input() title: string;
  @Input() items: JSON[];
  @Input() dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  constructor() { }

  ngOnInit() {
    this.addLink = '/' + this.title + '/add';
    this.editLink = '/' + this.title + '/edit';
    this.deleteLink = '/' + this.title + '/delete';

    this.displayedColumns = this.getKeys(this.items);
    this.dataSource = new MatTableDataSource<any>(this.items);
    this.dataSource.paginator = this.paginator;
  }

  getKeys(items: JSON[]) {
    const keys: string[] = [];

    // tslint:disable-next-line: forin
    for (const key in items[0]) {
      keys.push(key);
    }

    return keys;
  }

}
