import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, OnDestroy {
  title = 'maps';
  error: Error;
  displayedColumns: string[]; 
  dataSource: MatTableDataSource<any>;
  subscription;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.displayedColumns = ["assetID", "asset_typeID", 'asset_name'];

    this.subscription = this.configService.getMaps().subscribe((res: Response) => {
      this.dataSource = JSON.parse(JSON.stringify(res));
    }, error => this.error);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
