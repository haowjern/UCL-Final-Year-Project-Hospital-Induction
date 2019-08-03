import { Floor } from '../classes/floor';

export class Building {
    type = 'building';
    floors: Floor[];

    constructor(floors: Floor[]) {
        this.floors = floors;
    }
}
