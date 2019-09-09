import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../services/config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assets-delete',
  templateUrl: './assets-delete.component.html',
  styleUrls: ['./assets-delete.component.css']
})
export class AssetsDeleteComponent implements OnInit {
  idToDelete: string;

  constructor(
    public dialogRef: MatDialogRef<AssetsDeleteComponent>,
    private configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onDeleteAsset() {
    console.log('deleting asset...');
    this.configService.deleteAsset(this.idToDelete).subscribe(res => {
      console.log('Deleted asset');
      this.dialogRef.close();
      this.router.navigate(['/assets']); // refresh page;
    });
  }

}
