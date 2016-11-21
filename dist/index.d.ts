import 'reflect-metadata';
declare var _default: (app: any, options: {
    controllerRoot: string;
}) => {
    listen: (port: number) => void;
};
export default _default;
export declare function Controller(target: any): void;
export declare function Prefix(path: string): {
    (target: Function): void;
    (target: Object, targetKey: string | symbol): void;
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
