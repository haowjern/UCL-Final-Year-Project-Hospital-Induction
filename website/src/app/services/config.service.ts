import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  websiteName = 'localhost:8000';

  mapsUrl = this.websiteName + '/api/map-management/maps';

  constructor(private http: HttpClient) { }

  getMaps() {
    return this.http.get(this.mapsUrl);
  }

  // post 

  // put for updating

}
