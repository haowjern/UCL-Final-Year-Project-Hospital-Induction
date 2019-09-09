import { Component, OnInit, DebugElement } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {
  title = 'assets';
  error: Error;
  displayedColumns: string[]; 
  dataSource: MatTableDataSource<any>;
  subscription;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.displayedColumns = ['assetID', 'asset_type_name', 'asset_name', 'blob_name', 'created_at'];

    this.subscription = this.configService.getAssets('augmented_reality').subscribe((res: Response) => {
      this.dataSource = JSON.parse(JSON.stringify(res));
    }, error => this.error);
  }

}
