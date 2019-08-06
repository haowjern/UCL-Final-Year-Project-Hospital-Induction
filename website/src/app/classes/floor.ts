export class Floor {
    type = 'floor';
    floorNumber: number;
    mapId; 

    constructor(fNumber: number, mapId=null) {
        this.floorNumber = fNumber;
    }
}
