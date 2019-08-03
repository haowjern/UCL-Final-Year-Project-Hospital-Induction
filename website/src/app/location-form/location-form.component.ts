import { Component, OnInit, Inject, Output } from '@angular/core';
import { Floor } from '../classes/floor';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Location } from '../classes/location';
import { LocationFormDataInterface } from '../interfaces/location-form-data'
import { Building } from '../classes/building';
import { Room } from '../classes/room';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.css']
})
export class LocationFormComponent implements OnInit {
  typeIsBuilding = false;
  maxNumberOfFloors: number;
  floors: Floor[] = [];
  numberOfFloors: number;

  name: string;
  locationTypeString: string;

  locationForm = new FormGroup({
    locationName: new FormControl(''),
    selectedLocationType: new FormControl(''),
    selectedNumberOfFloors: new FormControl('')
  });

  nameSelectSubscription;
  locationSelectSubscription;
  numberOfFloorsSubscription;

  constructor(
    public dialogRef: MatDialogRef<LocationFormComponent>,
    @Inject (MAT_DIALOG_DATA) public inputData: Location
  ) { }

  ngOnInit() {
    this.name = this.inputData.name;

    if (this.inputData.type) {
      this.locationTypeString = this.inputData.type.type;

      if (Location.determineIfIsBuildingOrRoom(this.inputData.type)) {
        this.floors = this.inputData.type.floors;
        this.numberOfFloors = this.floors.length;
        this.typeIsBuilding = true;
      } else {
        this.floors = [];
        this.numberOfFloors = 0;
        this.typeIsBuilding = false;
      }
    }

    // set initial values for form if selected
    this.setDefaultValues();

    this.nameSelectSubscription = this.locationForm.get('locationName').valueChanges.subscribe(res => {
      this.name = this.locationForm.get('locationName').value;
    });

    this.locationSelectSubscription = this.locationForm.get('selectedLocationType').valueChanges.subscribe(res => {
      this.locationTypeString = this.locationForm.get('selectedLocationType').value;

      if (this.locationTypeString === 'building') {
        this.typeIsBuilding = true;
      } else {
        this.typeIsBuilding = false;
      }
    });

    this.numberOfFloorsSubscription = this.locationForm.get('selectedNumberOfFloors').valueChanges.subscribe(res => {
      this.numberOfFloors = this.locationForm.get('selectedNumberOfFloors').value;
    });
  }

  setDefaultValues() {
    this.locationForm.get('locationName').setValue(this.name);
    this.locationForm.patchValue({selectedLocationType: this.locationTypeString});
    this.locationForm.get('selectedNumberOfFloors').setValue(String(this.numberOfFloors));
  }

  onSubmitAddLocation() {
    // set floors object to be the correct number of floors
    if (this.typeIsBuilding && (this.floors.length !== this.numberOfFloors)) {
      this.floors = [];
      for (let i = 1; i < this.numberOfFloors + 1; i++) {
        this.floors.push(new Floor(i));
      }
    }

    this.inputData.name = this.name;
    if (this.locationTypeString === 'building') {
      this.inputData.type = new Building(this.floors);
    } else if (this.locationTypeString === 'room') {
      this.inputData.type = new Room();
    }
    this.dialogRef.close({
      event: 'ok'
    });
  }

  onDeleteLocation() {
    this.dialogRef.close({
      event: 'delete'
    });
  }
}
