export class PayableItemsResponseModel {
    areaName: string;
    areaPrefix: string;
    subAreas: [{
        subAreaName: string;
        subAreaPrefix: string;
        items: [{
            itemId: string;
            unit: string;
            price: Number
            description: string;
        }]
    }];
    createdAt: Date
}