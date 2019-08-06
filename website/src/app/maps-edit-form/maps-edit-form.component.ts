import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ConfigService } from '../services/config.service';
import { Utility } from '../classes/utility'; 
import { Location } from '../classes/location';
import { LocationFormComponent } from '../location-form/location-form.component';
import { MatDialog } from '@angular/material/dialog'; 
import { Router } from '@angular/router';
import { Room } from '../classes/room';
import { Building } from '../classes/building';
import { Floor } from '../classes/floor';
import { Map } from '../classes/map';
import { AddResponse } from '../classes/addResponse';


@Component({
  selector: 'app-maps-edit-form',
  templateUrl: './maps-edit-form.component.html',
  styleUrls: ['./maps-edit-form.component.css']
})
export class MapsEditFormComponent implements OnInit {
  editMapForm = new FormGroup({
    uploadedMapName: new FormControl(''),
    uploadedMapFile: new FormControl(''),
    selectedEditMap: new FormControl(''),
    selectedMap: new FormControl(''),
    selectedBuilding: new FormControl(''),
    selectedFloor: new FormControl('')
  });

  maps;
  buildings;
  floors;
  mapToEdit;
  locations;
  initialLocations;

  baseMap; 
  baseLocation;
  baseFloor;

  editMapId; 
  baseMapId;
  buildingId;
  floorId; 

  selectedFile: File;

  selectedIsEditMap = false;
  selectedIsMap = false;
  selectedIsBuilding = false;

  imgUrl; 

  widthMouse = 15;
  heightMouse = 15;

  widthCanvas = 1000;
  heightCanvas = 700;

  constructor(
    private configService: ConfigService,
    private dialog: MatDialog,
    private router: Router) { }

  ngOnInit() {
    document.getElementById('addLocations').style.display = 'none';

    this.configService.getMaps().subscribe(res => {
      this.maps = JSON.parse(JSON.stringify(res));
    }, err => console.log(err));

    this.editMapForm.get('selectedEditMap').valueChanges.subscribe(res => {
      this.editMapId = this.editMapForm.get('selectedEditMap').value;
      this.selectedIsEditMap = true;

      document.getElementById('editMap').style.display = 'block';

      this.mapToEdit = Utility.searchArrayWithKeyValue(this.maps, 'assetID', this.editMapId);

      // put in default url for files
      this.imgUrl = this.mapToEdit.imgUrl;

      console.log("editMapId " + this.editMapId);

      // search for default values for base map, location, and floor and assign them to variables 
      this.initBaseMapLocationFloor();
    });


    this.editMapForm.get('selectedMap').valueChanges.subscribe(res => {
      this.baseMapId = this.editMapForm.get('selectedMap').value;

      // check if is map
      if (this.baseMapId) {
        this.configService.getMapWithID(this.baseMapId).subscribe(res2 => {
          const resMap = JSON.parse(JSON.stringify(res2))[0]; // response is a list with one element

          if (resMap) {
            if (resMap.asset_type_name === 'map') {
              this.selectedIsMap = true;

              this.configService.getLocationsOfMapWithType(this.baseMapId, 'building').subscribe((res3: Response) => {
                this.buildings = JSON.parse(JSON.stringify(res3));
              }, error => console.log(error));

            } else {
              this.selectedIsMap = false;
            }
          } else {
            this.selectedIsMap = false;
          }
        });
      }

      this.editMapForm.get('selectedBuilding').valueChanges.subscribe(res2 => {
        this.buildingId = this.editMapForm.get('selectedBuilding').value;

        // check if is building
        if (this.buildingId) {
          this.configService.getLocationWithID(this.buildingId).subscribe(res3 => {
            if (res3[0]) {
              const location = JSON.parse(JSON.stringify(res3))[0]; // response is a list with one element

              if (location.location_type_name === 'building') {
                console.log('is a building');
                this.selectedIsBuilding = true;

                // if is building, then get floors of the building that doesn't already have maps
                this.configService.getFloorsWithoutMaps(this.baseMapId, this.buildingId).subscribe((res4: Response) => {
                  this.floors = JSON.parse(JSON.stringify(res4));

                }, error => console.log(error));
              } else {
                console.log('not a building');
                console.log(location);
                this.selectedIsBuilding = false;
              }
            } else {
              console.log('no response to compare as a building');
              this.selectedIsBuilding = false;
            }
          });
        }
      });
    });
  }

  initBaseMapLocationFloor() {
    // check if there is a floor attached to this 
    console.log('getting init floor with map: ');
    this.configService.getFloorWithMap(this.editMapId).subscribe(res2 => {
      console.log('this map is attached to a floor:' + JSON.stringify(res2));
      if (res2[0]) {
        this.baseFloor = res2[0];
        this.floorId = this.baseFloor.location_floor_mapID;
        this.buildingId = this.baseFloor.selected_locationID;

        console.log('buildingId is ' + this.buildingId);
        console.log('floorId is ' + this.floorId);

        // get location (building)
        this.configService.getLocationWithID(this.buildingId).subscribe(res3 => {
          this.baseLocation = res3[0];
          this.baseMapId = this.baseLocation.current_mapID;

          // get map from base map 
          this.configService.getMapWithID(this.baseMapId).subscribe(res4 => {
            this.baseMap = res4[0];
            this.initFormValues();
            console.log("selected building value: " + this.editMapForm.get('selectedBuilding').value);
          });
        });
      } else {
        console.log('this map is not attached to any floors');
        this.baseFloor = {};
        this.floorId = '';
        this.buildingId = '';
        this.baseLocation = {};
        this.baseMapId = '';
        this.baseMap = {};
      }
      this.initFormValues();
    });
  }

  initFormValues() {
    console.log('init form values are: ')
    console.log(this.mapToEdit.asset_name);
    console.log(this.baseMapId);
    console.log(this.buildingId);
    console.log(this.floorId);

    this.editMapForm.patchValue({
      uploadedMapName: this.mapToEdit.asset_name,
      // uploadedMapFile:
      selectedMap: this.baseMapId,
      selectedBuilding: this.buildingId,
      selectedFloor: this.floorId
    });
  }

  async isMap(mapId) {
    const isMapSubscription = await this.configService.getMapWithID(mapId).subscribe((res: Response) => {
      isMapSubscription.unsubscribe();
      const resMap = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

      if (resMap) {
        if (resMap.asset_type_name === 'map') {
          return true;
        }
      }
      return false;
    });
  }

  checkIsBuilding(mapId, buildingID) {
    // send buildingID's get request
    const isBuildingSubscription = this.configService.getLocationWithID(buildingID).subscribe((res) => {
      isBuildingSubscription.unsubscribe();

      if (res[0]) {
        const location = JSON.parse(JSON.stringify(res))[0]; // response is a list with one element

        if (location.location_type_name === 'building') {
          this.selectedIsBuilding = true;
        }
      } else {
        console.log('no response to compare as a building');
        this.selectedIsBuilding = false;
      }
    })
    this.selectedIsBuilding = false;
  }

  onFileSelected(event) {
    const file = event.target.files[0];
    this.selectedFile = file;
  }

  onSubmitEditMap() {
    document.getElementById('editMapForm').style.display = 'none';
    document.getElementById('addLocations').style.display = 'block';

    if (this.selectedFile) {
      const fileReader = new FileReader();
      fileReader.onload = (event => {
        this.imgUrl = fileReader.result;
        this.initCanvas();
      });
      fileReader.readAsDataURL(this.selectedFile);
    } else {
      this.initCanvas();
    }
  }

  displayForm() {
    console.log('switching forms');
    const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
    canvas.removeEventListener('mousedown', this.handleMouseDown);

    document.getElementById('editMapForm').style.display = 'block';
    document.getElementById('addLocations').style.display = 'none';
  }

  drawCanvas(ctx, widthCanvas, heightCanvas, widthMouse, heightMouse) {
    // clear canvas
    ctx.clearRect(0, 0, widthCanvas, heightCanvas);

    // draw image in background
    const img = new Image();
    console.log('image is ' + this.imgUrl);
    img.src = this.imgUrl;
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

    canvas.setAttribute('width', String(this.widthCanvas));
    canvas.setAttribute('height', String(this.heightCanvas));

    this.locations = [];
    this.initialLocations = [];
    let resLocation: Location;
    let prev_locationID: number;

    // get existing locations
    // database returns a response which have multiple rows with the same locationID
    // the different locationID indicate a new location, the same locationID indiciate a new floor for a building
    this.configService.getLocations(this.editMapId).subscribe(res => {
      const jsonResponse = JSON.parse(JSON.stringify(res));
      console.log('locations response: ' + jsonResponse);
      prev_locationID = 0;
      for (let i = 0; i < jsonResponse.length; i++) {
        const loc = jsonResponse[i];

        if (loc && (parseInt(loc.locationID, 10) !== prev_locationID)) {

          // add a new location to the this.locations as soon as a new location is ready 
          if (prev_locationID !== 0) {
            this.locations.push(resLocation);
          }

          // create new Location
          resLocation = new Location(loc.rel_position_on_map_x, loc.rel_position_on_map_y);
          resLocation.name = loc.location_name;
          resLocation.locationId = loc.locationID;

          if (loc.location_type_name === 'building') {
            resLocation.type = new Building([new Floor(loc.floor_number, loc.floor_mapID)]);
          } else if (loc.location_type_name === 'room') {
            resLocation.type = new Room();
          }
          resLocation.mapId = loc.current_mapID;

          // set previous locationID to be the current locationID 
          prev_locationID = parseInt(loc.locationID, 10);
        } else if (Location.determineIfIsBuildingOrRoom(resLocation.type)) {
            resLocation.type.floors.push(new Floor(loc.floor_number, loc.floor_mapID));
        } else {
          console.log('Error - unexpected row result');
        }
      }
      if (resLocation) {
        this.locations.push(resLocation); // add last location 
      }
      console.log('Found locations to be: ' + JSON.stringify(this.locations));
      this.initialLocations = JSON.parse(JSON.stringify(this.locations));
      for (const loc of this.initialLocations) {
        loc.comparedFlag = 0; // so it can be used for comparison when check if locations have been deleted
      }

      this.drawCanvas(ctx, this.widthCanvas, this.heightCanvas, this.widthMouse, this.heightMouse);
    });

    // draw a Location when user clicks
    canvas.addEventListener('mousedown', this.handleMouseDown);
  }

  handleMouseDown = (event) => {
    const canvas = document.getElementById('mapCanvas') as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const x = event.clientX - rect.left - (this.widthMouse / 2);
    const y = event.clientY - rect.top - (this.heightMouse / 2);

    // check if a Location has been drawn at the spot
    let location = this.isWithinHitRegionLocation(this.locations, this.widthMouse, this.heightMouse, x, y, this.widthCanvas, this.heightCanvas);
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
            this.drawCanvas(ctx, this.widthCanvas, this.heightCanvas, this.widthMouse, this.heightMouse);
          }
        }
      });

    } else {
      ctx.fillStyle = 'red';
      ctx.fillRect(x, y, this.widthMouse, this.heightMouse);

      console.log('x: ' + x);
      console.log('y: ' + y);

      const relPositionOnMapX = x / this.widthCanvas;
      const relPositionOnMapY = y / this.heightCanvas;

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
              this.drawCanvas(ctx, this.widthCanvas, this.heightCanvas, this.widthMouse, this.heightMouse);
            }
          }
        }

        this.locations.push(location);
        console.log('added locations: ', this.locations);
      });
    }
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
    console.log('Submitting form');
    const formData = new FormData();
    const mapName = this.editMapForm.get('uploadedMapName').value;
    const locationFloorMapID = this.editMapForm.get('selectedFloor').value;
    formData.append('file_name', mapName);
    formData.append('file_path', this.selectedFile);
    formData.append('location_floor_mapID', locationFloorMapID);
    formData.append('id', this.mapToEdit.assetID);
    formData.append('blob_name', this.mapToEdit.blob_name);
    formData.append('prev_location_floor_mapID', this.floorId);

    this.configService.putMap(formData).subscribe(res => {
      console.log('res: ' + res);
    }); // update values

    // delete all locations 
    this.configService.deleteLocations(String(this.mapToEdit.assetID)).subscribe(res => {
      // add all locations + floors 
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
              floorNumber: '',
              mapId: ''
            };
            floor.floorNumber = String(lFloor.floorNumber);
            floor.mapId = String(lFloor.mapId);
            floors.push(floor);
          }
        }

        this.configService.addLocation(String(this.mapToEdit.assetID), loc).subscribe((res3: AddResponse) => {
          console.log('Added location');
          console.log('response: ' + JSON.stringify(res3));

          const lastBuildingId = res3.lastInsertedId;
          console.log('last building id: ' + lastBuildingId);

          for (const floor of floors) {
            console.log('adding floors...');
            this.configService.addFloor(String(this.mapToEdit.assetID), lastBuildingId, floor).subscribe(res5 => {
              console.log('added floor ' + floor.floorNumber);
            });
          }
          this.router.navigate(['/maps'])
        }, err => {
          console.log('Cant add locations: ' + err);
        });
      }
    });


    // below is too complicated ,too many checks to perform, better to use simple method, and only improve when speed
    // is needed

    // // check if new file is uploaded - have to delete old locations and add new locations for the map
    // if (this.imgUrl != this.mapToEdit.imgUrl) {
    //   // delete all locations associated

    //   // add all new locations 
    // } else {
    //   // most likely only locations have changed somehow

    //   for (const loc of this.locations) {
    //     const add_loc = {
    //       name: loc.name,
    //       type: loc.type.type,
    //       relativePositionOnMapX: loc.relativePositionOnMap.x,
    //       relativePositionOnMapY: loc.relativePositionOnMap.y,
    //     };

    //     for (const initLoc of this.initialLocations) {
    //       if (loc.locationId) {
    //         if (loc.locationId === initLoc.locationId) {
    //           loc.comparedFlag += 1;
    //           // still the same location
    //           // update location
    //         }
    //       } else {
    //         // else location is new and should be added to the database

    //         const floors = [];
    //         if (Location.determineIfIsBuildingOrRoom(loc.type)) {
    //           for (const lFloor of loc.type.floors) {
    //             const floor = {
    //               type: 'floor',
    //               floorNumber: ''
    //             };
    //             floor.floorNumber = String(lFloor.floorNumber);
    //             floors.push(floor);
    //           }
    //         }

    //         console.log('floors: ' + JSON.stringify(floors)); 
    //         console.log('lastMapId: ' + this.mapToEdit.assetID);
    //         console.log('add_loc: ' + JSON.stringify(add_loc));

    //         this.configService.addLocation(String(this.mapToEdit.assetID), add_loc).subscribe((res3: AddResponse) => {
    //           console.log('Added location');
    //           console.log('response: ' + JSON.stringify(res3));

    //           const lastBuildingId = res3.lastInsertedId;
    //           console.log('last building id: ' + lastBuildingId);

    //           for (const floor of floors) {
    //             console.log('adding floors...');
    //             this.configService.addFloor(String(this.mapToEdit.assetID), lastBuildingId, floor).subscribe(res5 => {
    //               console.log('added floor ' + floor.floorNumber);
    //             });
    //           }

    //         }, err => {
    //           console.log('Cant add locations: ' + err);
    //         });
    //       }
    //     }
    //   }

    //   for (const loc of this.initialLocations) {
    //     if (loc.comparedFlag === 0) {
    //       // if still the same initial value
    //       // means hasn't been compared yet
    //       // delete location from database
    //     }
    //   }
    //   this.router.navigate(['/maps']);
    // }
  }
}
