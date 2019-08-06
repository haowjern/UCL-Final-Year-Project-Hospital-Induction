export class Map {
    file_name: string;
    file_path: File;
    id; 
    name;
    blob_name;
    created_at;

    constructor(fileName, filePath) {
        this.file_name = fileName;
        this.file_path = filePath; 
    }
}
