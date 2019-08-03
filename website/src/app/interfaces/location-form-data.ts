import { Floor } from '../classes/floor';

export interface LocationFormDataInterface {
    name: string;
    type: string;
    floors: Floor[];
}
