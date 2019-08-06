import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from '../classes/location';
import { Map } from '../classes/map';
import { HttpHeaders } from '@angular/common/http';

export class Hero {
  id: number;
  name: string;
}


@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
    })
  };
  


  websiteName = 'localhost:8000';

  mapsUrl = 'http://' + this.websiteName + '/api/map-management/maps';
  locationsUrl = 'http://' + this.websiteName + '/api/location-management/locations';
  floorsUrl = 'http://' + this.websiteName + '/api/floor-management/floors';
  
  constructor(private http: HttpClient) { }

  getMaps() {
    return this.http.get(this.mapsUrl).pipe(
      catchError(this.handleError)
    );
  }

  getMapWithName(name: string) {
    const mapUrl = this.mapsUrl + '?name=' + name;
    return this.http.get(mapUrl).pipe(
      catchError(this.handleError)
    );
  }

  getMapWithID(id: string) {
    const mapsIdUrl = this.mapsUrl + '/' + id;
    return this.http.get(mapsIdUrl).pipe(
      catchError(this.handleError)
    );
  }

  putMap(map) {
    const updateMapUrl = this.mapsUrl + '/' + map.id;

    return this.http.put(updateMapUrl, map).pipe(
      catchError(this.handleError)
    );
  }

  getLocations(mapId: string) {
    const locationUrl = this.mapsUrl + '/' + mapId + '/locations'
    return this.http.get(locationUrl).pipe(
      catchError(this.handleError)
    );
  }

  getLocationWithQuery(mapId: string, type: string, name: string) {
    const locationUrl = this.mapsUrl + '/' + mapId + '/locations' + '?type=' + type + '&name=' + name;
    return this.http.get(locationUrl).pipe(
      catchError(this.handleError)
    );
  }

  getLocationsOfMapWithType(mapId: string, type: string) {
    const locationTypeUrl = this.mapsUrl + '/' + mapId + '/locations' + '?type=' + type;
    return this.http.get(locationTypeUrl).pipe(
      catchError(this.handleError)
    );
  }

  getLocationWithID(id: string) {
    const locationIdUrl = this.locationsUrl + '/' + id;
    return this.http.get(locationIdUrl).pipe(
      catchError(this.handleError)
    );
  }

  deleteLocations(mapId: string) {
    const locationUrl = this.mapsUrl + '/' + mapId + '/locations'
    return this.http.delete(locationUrl).pipe(
      catchError(this.handleError)
    );
  }

  getFloorsWithoutMaps(mapId: string, buildingId: string) {
    const floorsUrl = this.mapsUrl + '/' + mapId + '/locations' + '/' + buildingId + '/floors';
    return this.http.get(floorsUrl).pipe(
      catchError(this.handleError)
    );
  }

  getFloorWithMap(mapId: string) {
    const url = this.floorsUrl + '/?mapId=' + mapId;
    console.log(url);
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  addMap(formData) {
    return this.http.post(this.mapsUrl, formData).pipe(
      catchError(this.handleError)
    );
  }

  deleteMap(idToDelete) {
    const deleteUrl = this.mapsUrl + '/' + idToDelete;
    return this.http.delete(deleteUrl).pipe(
      catchError(this.handleError)
    );
  }

  addLocation(mapId, data) {
    const locationsUrl = this.mapsUrl + '/' + mapId + '/locations';
    return this.http.post(locationsUrl, data).pipe(
      catchError(this.handleError)
    );
  }

  addFloor(mapId: string, buildingId: string, floor) {
    const floorUrl = this.mapsUrl + '/' + mapId + '/locations' + '/' + buildingId + '/floors' + '?number=' + floor.floorNumber;
    return this.http.post(floorUrl, floor);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Error is ${error}, ` +
        `Backend returned code ${error.status}, ` +
        `body was: ${JSON.stringify(error.error)}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  }

  // post 

  // put for updating

}
