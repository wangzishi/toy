import 'reflect-metadata';
import * as glob from 'glob';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as compose from 'koa-compose';

// import * as Convert from 'koa-convert';
// import * as jwt from 'koa-jwt';

// import { APP } from '../configs/app';

// import * as _ from 'lodash';
const isEmpty = require('lodash.isempty');

let bodyMetadataKey = Symbol('body');
let pathMetadataKey = Symbol('path');
let queryMetadataKey = Symbol('query');
let routeMetadataKey = Symbol('route');
let prefixMetadataKey = Symbol('prefix');
let contextMetadataKey = Symbol('context');
let headerMetadataKey = Symbol('header');

enum Method { GET, POST, PUT, PATCH, DELETE };
type TRouteMetadata = { requestMethod: Method, methodName: string, path: string };
type TParameterMetadata = { parameterIndex: number };
type TPathParameterMetadata = { parameterIndex: number, pathParam: string };
type TQueryParameterMetadata = { parameterIndex: number, queryName: string };
type THeaderParameterMetadata = { parameterIndex: number, headerParam: string };

type TOptions = { controllerRoot: string };

export default (app, options: TOptions) => ({
    listen: (port: number) => glob(`${options.controllerRoot}/**/*`, { nodir: true, ignore: '**/*(index.js|*.map)' }, (err, files: string[]) => {

        // load all controller definition into memory
        files.forEach(file => require(file));

        controllers.forEach((controller) => {
            let instance = new controller();
            let prefix: string = Reflect.getOwnMetadata(prefixMetadataKey, controller);
            let router = new Router({ prefix });
            let routersMetadataList: TRouteMetadata[] = Reflect.getMetadata(routeMetadataKey, instance);

            routersMetadataList.forEach(metadata => {
                let middlewares = [];
                let argvs: any[] = [];
                let requestMethod: string;
                let bodyMetadata: TParameterMetadata = Reflect.getMetadata(bodyMetadataKey, instance, metadata.methodName);
                let pathMetadata: TPathParameterMetadata[] = Reflect.getMetadata(pathMetadataKey, instance, metadata.methodName);
                let queryMetadata: TQueryParameterMetadata[] = Reflect.getMetadata(queryMetadataKey, instance, metadata.methodName);
                let contextMetadata: TParameterMetadata = Reflect.getMetadata(contextMetadataKey, instance, metadata.methodName);
                let headerMetadata: THeaderParameterMetadata[] = Reflect.getMetadata(headerMetadataKey, instance, metadata.methodName);

                switch (metadata.requestMethod) {
                    case Method.GET: requestMethod = 'get'; break;
                    case Method.PUT: requestMethod = 'put'; break;
                    case Method.POST: requestMethod = 'post'; break;
                    case Method.PATCH: requestMethod = 'pacth'; break;
                    case Method.DELETE: requestMethod = 'delete'; break;
                    default: break;
                }

                router[requestMethod](metadata.path, async (ctx: Router.IRouterContext, next) => {
                    // @Body
                    if (!isEmpty(bodyMetadata)) {
                        await bodyParser()(ctx, next);
                        argvs[bodyMetadata.parameterIndex] = ctx.request['body'];
                    }

                    // @Context
                    if (!isEmpty(contextMetadata)) {
                        argvs[contextMetadata.parameterIndex] = ctx;
                    }

                    // @Path()
                    if (!isEmpty(pathMetadata)) {
                        pathMetadata.forEach(metadata => argvs[metadata.parameterIndex] = ctx.params[metadata.pathParam]);
                    }

                    // @Query()
                    if (!isEmpty(queryMetadata)) {
                        queryMetadata.forEach(metadata => argvs[metadata.parameterIndex] = ctx.query[metadata.queryName]);
                    }

                    // @Header()
                    if (!isEmpty(headerMetadata)) {
                        headerMetadata.forEach(metadata => argvs[metadata.parameterIndex] = ctx.request.headers[metadata.headerParam]);
                    }

                    let result: any;// | Promise<any> | Sheencity.qrcode.shared.Result<any>;
                    try {

                        result = await instance[metadata.methodName].apply(this, argvs);
                        ctx.body = { success: true, value: result };

                    } catch (err) {
                        console.error(err);
                        ctx.status = err.status || 500;
                        ctx.body = { success: false, reason: err.message || err };
                    }

                });
            });


            app.use(router.routes());
        });

        app.listen(port);
    })
});

// interface IFuntion<T> extends Function {
//     new (...args: any[]): T;
// }

let controllers = new Set();

export function Controller(target) {
    controllers.add(target);
};

export function Prefix(path: string) {
    return Reflect.metadata(prefixMetadataKey, path);
};


function methodBuilder(method: Method) {
    return (path: string) => (target: Object, prop: string, desc: TypedPropertyDescriptor<any>) => {
        let routers: TRouteMetadata[] = Reflect.getMetadata(routeMetadataKey, target) || [];
        routers.push({ requestMethod: method, methodName: prop, path });
        Reflect.defineMetadata(routeMetadataKey, routers, target);
    };
}

export let Get: (path: string) => MethodDecorator = methodBuilder(Method.GET);
export let Put: (path: string) => MethodDecorator = methodBuilder(Method.PUT);
export let Post: (path: string) => MethodDecorator = methodBuilder(Method.POST);
export let Patch: (path: string) => MethodDecorator = methodBuilder(Method.PATCH);
export let Delete: (path: string) => MethodDecorator = methodBuilder(Method.DELETE);

export let Body = (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Reflect.defineMetadata(bodyMetadataKey, { parameterIndex }, target, propertyKey);
};

export let Path = (pathParam: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let pathParams: TPathParameterMetadata[] = Reflect.getMetadata(pathMetadataKey, target) || [];
        pathParams.push({ parameterIndex, pathParam });
        Reflect.defineMetadata(pathMetadataKey, pathParams, target, propertyKey);
    };
};

export let Query = (queryName: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let queryParams: TQueryParameterMetadata[] = Reflect.getMetadata(queryMetadataKey, target) || [];
        queryParams.push({ parameterIndex, queryName });
        Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
    };
};

export let Header = (headerParam: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
        let headerParams: THeaderParameterMetadata[] = Reflect.getMetadata(headerMetadataKey, target) || [];
        headerParams.push({ parameterIndex, headerParam });
        Reflect.defineMetadata(headerMetadataKey, headerParams, target, propertyKey);
    };
};

export let Context = (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    Reflect.defineMetadata(contextMetadataKey, { parameterIndex }, target, propertyKey);
};
