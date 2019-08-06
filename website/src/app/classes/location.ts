import { Room } from './Room';
import { Building } from './Building';
import { Position } from './position';

export class Location {
    name: string;
    type: Room | Building;
    relativePositionOnMap: Position; // fraction number
    mapId: number;
    locationId: number;

    constructor(inputX: number, inputY: number) {
      this.relativePositionOnMap = new Position(inputX, inputY);
    }

  static determineIfIsBuildingOrRoom(toBeDetermined: Room | Building): toBeDetermined is Building {
    if ((toBeDetermined as Building).type === 'building') {
      return true;
    } else {
      return false;
    }
  }
}