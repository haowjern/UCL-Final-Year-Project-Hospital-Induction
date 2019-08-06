export class Utility {
    static searchArrayWithKeyValue(array, key: string, value: any) {
        for (const item of array) {
            if (item[key] === value) {
                return item;
            }
        }
    }
}