import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-maps-add-form',
  templateUrl: './maps-add-form.component.html',
  styleUrls: ['./maps-add-form.component.css']
})
export class MapsAddFormComponent implements OnInit, OnDestroy {
  subscription;
  buildingsSubscription;
  floorsSubscription;

  mapId: string;
  buildingId: string;

  maps;
  buildings;
  floors;

  addMapForm = new FormGroup({
    uploadedMapName: new FormControl(''),
    uploadedMapFile: new FormControl(''),
    selectedMap: new FormControl(''),
    selectedBuilding: new FormControl(''),
    selectedFloor: new FormControl('')
  });

  addMapSelectSubscription;
  buildingSelectSubscription;
  onSelectedMap = false;

  selectedIsMap = false;
  selectedIsBuilding = false;

  isFillingForm = true;

  constructor(private configService: ConfigService) { }

  ngOnInit() {
    this.subscription = this.configService.getMaps().subscribe((res: Response) => {
      this.maps = JSON.parse(JSON.stringify(res));
    }, error => console.log(error));

    this.addMapSelectSubscription = this.addMapForm.get('selectedMap').valueChanges.subscribe(res => {
      this.mapId = this.addMapForm.get('selectedMap').value;

      if (this.isMap(this.mapId)) {
        this.selectedIsMap = true;

        this.buildingsSubscription = this.configService.getLocationsOfMapWithType(this.mapId, 'building').subscribe((res2: Response) => {
          this.buildings = JSON.parse(JSON.stringify(res2));
        }, error => console.log(error));

      } else {
        this.selectedIsMap = false;
      }
    });

    this.buildingSelectSubscription = this.addMapForm.get('selectedBuilding').valueChanges.subscribe(res => {
      this.buildingId = this.addMapForm.get('selectedBuilding').value;

      if (this.isBuilding(this.mapId, this.buildingId)) {
        this.selectedIsBuilding = true;

        this.floorsSubscription = this.configService.getFloors(this.mapId, this.buildingId).subscribe((res2: Response) => {
          this.floors = JSON.parse(JSON.stringify(res2));
        }, error => console.log(error));

      } else {
        this.selectedIsBuilding = false;
      }
    });
  }

  async isMap(mapID) {
    // send mapID's get request
    const isMapSubscription = await this.configService.getMapWithID(mapID).subscribe((res: Response) => {
      isMapSubscription.unsubscribe();
      const map = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

      if (map.asset_type_name === 'map') {
        return true;
      } else {
        return false;
      }
    });
  }

  async isBuilding(mapId, buildingID) {
    // send buildingID's get request
    const isBuildingSubscription = await this.configService.getLocationWithID(mapId, buildingID).subscribe((res: Response) => {
      isBuildingSubscription.unsubscribe();
      const location = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

      if (location.location_type_name === 'building') {
        return true;
      } else {
        return false;
      }
    });
  }

  onNext() {
    this.isFillingForm = true;
  }

  onSubmitAddMap() {
    console.log(this.addMapForm.value);
    document.getElementById('addMapForm').style.display='none';
  }

  ngOnDestroy() {
  }

  // ngOnDestroy() {
  //   this.addMapSelectSubscription.unsubscribe();
  //   this.buildingSelectSubscription.unsubscribe();
  //   this.subscription.unsubscribe();
  //   this.buildingsSubscription.unsubscribe();
  //   this.floorsSubscription.unsubscribe();
  // }
}
