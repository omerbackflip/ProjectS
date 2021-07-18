import {Container} from "typedi";

export function CustomInject<T>(c: {new(): T; }) {
    return function(object: Object, propertyName: string, index?: number) {
        const model =new c();
        Container.registerHandler({ object, propertyName, index, value: containerInstance => model });
    };
}