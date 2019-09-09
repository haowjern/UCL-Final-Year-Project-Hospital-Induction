import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConfigService } from '../services/config.service';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LocationFormComponent } from '../location-form/location-form.component';
import { Location } from '../classes/location';
import { Router } from '@angular/router';
import { AddResponse } from '../classes/addResponse';


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
    uploadedMapDefault: new FormControl(''),
    selectedMap: new FormControl(''),
    selectedBuilding: new FormControl(''),
    selectedFloor: new FormControl('')
  });

  addMapSelectSubscription;
  buildingSelectSubscription;
  onSelectedMap = false;

  selectedFile: File;

  selectedIsMap = false;
  selectedIsBuilding = false;

  imgURL;

  locations: Location[];

  constructor(
    private configService: ConfigService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    document.getElementById('addLocations').style.display = 'none';

    this.subscription = this.configService.getMaps().subscribe((res: Response) => {
      this.maps = JSON.parse(JSON.stringify(res));
    }, error => console.log(error));

    this.addMapSelectSubscription = this.addMapForm.get('selectedMap').valueChanges.subscribe(res => {
      this.mapId = this.addMapForm.get('selectedMap').value;
      console.log('found map ID ' + this.mapId);

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

        this.floorsSubscription = this.configService.getFloorsWithoutMaps(this.mapId, this.buildingId).subscribe((res2: Response) => {
          this.floors = JSON.parse(JSON.stringify(res2));
        }, error => console.log(error));

      } else {
        this.selectedIsBuilding = false;
      }
    });
  }

  async isMap(mapID) {
    // send mapID's get request
    const isMapSubscription = await this.configService.getMapWithID(mapID).subscribe((res) => {
      // isMapSubscription.unsubscribe();
      const resMap = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

      if (resMap) {
        if (resMap.asset_type_name === 'map') {
          return true;
        }
      }
      return false;
    });
  }

  async isBuilding(mapId, buildingID) {
    // send buildingID's get request
    const isBuildingSubscription = await this.configService.getLocationWithID(buildingID).subscribe((res: Response) => {
      isBuildingSubscription.unsubscribe();
      const location = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

      if (location.location_type_name === 'building') {
        return true;
      } else {
        return false;
      }
    });
  }

  onSubmitAddMap() {
    console.log(this.addMapForm.value);
    document.getElementById('addMapForm').style.display = 'none';
    document.getElementById('addLocations').style.display = 'block';

    const fileReader = new FileReader();
    fileReader.onload = (event => {
      this.imgURL = fileReader.result;
      this.initCanvas();
    });
    fileReader.readAsDataURL(this.selectedFile);
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  displayForm() {
    document.getElementById('addMapForm').style.display = 'block';
    document.getElementById('addLocations').style.display = 'none';
  }

  drawCanvas(ctx, widthCanvas, heightCanvas, widthMouse, heightMouse) {
    // clear canvas
    ctx.clearRect(0, 0, widthCanvas, heightCanvas);

    // draw image in background
    const img = new Image();
    console.log('image is ' + this.imgURL);
    img.src = this.imgURL;
    img.onload = (res) => {
      ctx.drawImage(img, 0, 0, widthCanvas, heightCanvas);

      // draw existing locations
      console.log('this.locations: ' + JSON.stringify(this.locations));
      for (const location of this.locations) {
        const x = location.relativePositionOnMap.x * widthCanvas;
        const y = location.relativePositionOnMap.y * heightCanvas;

        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, widthMouse, heightMouse);
      }
    };
  }

  initCanvas() {
    const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const widthMouse = 15;
    const heightMouse = 15;

    const widthCanvas = 1000;
    const heightCanvas = 700;
    canvas.setAttribute('width', String(widthCanvas));
    canvas.setAttribute('height', String(heightCanvas));

    this.locations = [];
    let location;

    this.drawCanvas(ctx, widthCanvas, heightCanvas, widthMouse, heightMouse);

    // draw a Location when user clicks
    canvas.addEventListener('mousedown', (event) => {
      const x = event.clientX - rect.left - (widthMouse / 2);
      const y = event.clientY - rect.top - (heightMouse / 2);

      // check if a Location has been drawn at the spot
      location = this.isWithinHitRegionLocation(this.locations, widthMouse, heightMouse, x, y, widthCanvas, heightCanvas);
      let dialog;
      if (location) {
        console.log('opening an existing location');
        console.log('location: ' + location);
        dialog = this.openLocationDialog(location);
        dialog.afterClosed().subscribe(data => {
          if (data.event === 'delete') {
            console.log('Delete Location');
            const deleteIndex = this.locations.indexOf(location, 0);
            if (deleteIndex > -1) {
              this.locations.splice(deleteIndex, 1);
              this.drawCanvas(ctx, widthCanvas, heightCanvas, widthMouse, heightMouse);
            }
          }
        });

      } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, widthMouse, heightMouse);

        console.log('x: ' + x);
        console.log('y: ' + y);

        const relPositionOnMapX = x / widthCanvas;
        const relPositionOnMapY = y / heightCanvas;

        location = new Location(relPositionOnMapX, relPositionOnMapY);
        // since location is new, add a location to this.locations
        dialog = this.openLocationDialog(location);
        dialog.afterClosed().subscribe(data => {
          if (data) {
            if (data.event === 'delete') {
              console.log('Delete Location');
              const deleteIndex = this.locations.indexOf(location, 0);
              if (deleteIndex > -1) {
                this.locations.splice(deleteIndex, 1);
                this.drawCanvas(ctx, widthCanvas, heightCanvas, widthMouse, heightMouse);
              }
            }
          }

          this.locations.push(location);
          console.log('added locations: ', this.locations);
        });
      }


    });
  }

  openLocationDialog(location: Location) {
    return this.dialog.open(LocationFormComponent, {
      width: '500px',
      height: '500px',
      data: location
    });
  }

  isWithinHitRegionLocation(
    locations: Location[],
    locationWidth: number,
    locationHeight: number,
    mouseX: number,
    mouseY: number,
    canvasWidth: number,
    canvasHeight: number) {

      for (const location of locations) {
        const locationX = location.relativePositionOnMap.x * canvasWidth;
        const locationY = location.relativePositionOnMap.y * canvasHeight;
        const locationLeft = locationX - locationWidth;
        const locationRight = locationX + locationWidth;
        const locationTop = locationY - locationHeight;
        const locationBottom = locationY + locationHeight;

        if (mouseX >= locationLeft) {
          if (mouseX <= locationRight) {
            // mouse is in between region horizontally
            if (mouseY >= locationTop) {
              if (mouseY <= locationBottom) {
                // mouse is in between region vertically
                return location;
              }
            }
          }
        }
      }
      return false;
    // get existing locations
  }

  async onSubmitForm() {
    console.log('Submitting Form');

    const formData = new FormData();
    const mapName = this.addMapForm.get('uploadedMapName').value;
    const mapDefault = this.addMapForm.get('uploadedMapDefault').value;
    const locationFloorMapID = this.addMapForm.get('selectedFloor').value;
    console.log("Default map: " + mapDefault);
    formData.append('file_name', mapName);
    formData.append('is_default_map', mapDefault);
    formData.append('file_path', this.selectedFile);
    formData.append('location_floor_mapID', locationFloorMapID);

    console.log('adding map form data');
    await this.configService.addMap(formData).subscribe(res => {
      console.log(res);

      let lastMapId: string;
      console.log('getting recently added map id');

      this.configService.getMapWithName(mapName).subscribe(res2 => {

        console.log(mapName);
        console.log(res);
        lastMapId = res2[0].assetID;

        console.log('adding location form data');

        if (this.locations.length === 0) {
          this.router.navigate(['/maps']);
        }

        for (const location of this.locations) {

          console.log('location is: ' + JSON.stringify(location));

          const loc = {
            name: location.name,
            type: location.type.type,
            relativePositionOnMapX: location.relativePositionOnMap.x,
            relativePositionOnMapY: location.relativePositionOnMap.y,
          };

          const floors = [];
          if (Location.determineIfIsBuildingOrRoom(location.type)) {
            for (const lFloor of location.type.floors) {
              const floor = {
                type: 'floor',
                floorNumber: ''
              };
              floor.floorNumber = String(lFloor.floorNumber);
              floors.push(floor);
            }
          }

          console.log('floors: ' + JSON.stringify(floors)); 
          console.log('lastMapId: ' + lastMapId);
          console.log('loc: ' + JSON.stringify(loc));

          this.configService.addLocation(String(lastMapId), loc).subscribe((res3: AddResponse) => {
            console.log('Added location');
            console.log('response: ' + JSON.stringify(res3));

            const lastBuildingId = res3.lastInsertedId;
            console.log('last building id: ' + lastBuildingId);

            for (const floor of floors) {
              console.log('adding floors...');
              this.configService.addFloor(String(lastMapId), lastBuildingId, floor).subscribe(res5 => {
                console.log('added floor ' + floor.floorNumber);
              });
            }
            this.router.navigate(['/maps']);
          }, err => {
            console.log('Cant add locations: ' + err);
          });
        }
      });
    });
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


