import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../services/config.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-maps-delete',
  templateUrl: './maps-delete.component.html',
  styleUrls: ['./maps-delete.component.css']
})
export class MapsDeleteComponent implements OnInit {
  idToDelete: string;

  constructor(
    public dialogRef: MatDialogRef<MapsDeleteComponent>,
    private configService: ConfigService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onDeleteMap() {
    console.log('deleting map...');
    this.configService.deleteMap(this.idToDelete).subscribe(res => {
      console.log('Deleted map');
      this.dialogRef.close();
      this.router.navigate(['/maps']) // refresh page;
    });
  }
}
