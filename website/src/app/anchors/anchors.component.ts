import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-anchors',
  templateUrl: './anchors.component.html',
  styleUrls: ['./anchors.component.css']
})
export class AnchorsComponent implements OnInit {
  title = 'anchors';
  error: Error;
  displayedColumns: string[]; 
  dataSource: MatTableDataSource<any>;
  subscription;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.displayedColumns = ['anchorNumber', 'anchorID', 'locationID', 'anchor_name'];

    this.subscription = this.configService.getAnchors().subscribe((res: Response) => {
      this.dataSource = JSON.parse(JSON.stringify(res));
    }, error => this.error);
  }

}
