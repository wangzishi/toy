/// <reference types="koa" />
/// <reference types="koa-router" />
/// <reference types="koa-bodyparser" />
import 'reflect-metadata';
import * as Koa from 'koa';
export declare type TOptions = {
    controllerRoot: string;
};
export default function (this: any, app: Koa, options: TOptions): {
    listen: (port: number) => void;
};
export declare function Controller(target: any): void;
export declare function Prefix(path: string): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare let Get: (path: string) => MethodDecorator;
export declare let Put: (path: string) => MethodDecorator;
export declare let Post: (path: string) => MethodDecorator;
export declare let Patch: (path: string) => MethodDecorator;
export declare let Delete: (path: string) => MethodDecorator;
export declare let Body: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export declare let Path: (pathParam: string) => ParameterDecorator;
export declare let Query: (queryName: string) => ParameterDecorator;
export declare let Header: (headerParam: string) => ParameterDecorator;
export declare let Context: (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
