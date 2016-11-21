"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require("reflect-metadata");
const glob = require("glob");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
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
var Method;
(function (Method) {
    Method[Method["GET"] = 0] = "GET";
    Method[Method["POST"] = 1] = "POST";
    Method[Method["PUT"] = 2] = "PUT";
    Method[Method["PATCH"] = 3] = "PATCH";
    Method[Method["DELETE"] = 4] = "DELETE";
})(Method || (Method = {}));
;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (app, options) => ({
    listen: (port) => glob(`${options.controllerRoot}/**/*`, { nodir: true, ignore: '**/*(index.js|*.map)' }, (err, files) => {
        // load all controller definition into memory
        files.forEach(file => require(file));
        controllers.forEach((controller) => {
            let instance = new controller();
            let prefix = Reflect.getOwnMetadata(prefixMetadataKey, controller);
            let router = new Router({ prefix });
            let routersMetadataList = Reflect.getMetadata(routeMetadataKey, instance);
            routersMetadataList.forEach(metadata => {
                let middlewares = [];
                let argvs = [];
                let requestMethod;
                let bodyMetadata = Reflect.getMetadata(bodyMetadataKey, instance, metadata.methodName);
                let pathMetadata = Reflect.getMetadata(pathMetadataKey, instance, metadata.methodName);
                let queryMetadata = Reflect.getMetadata(queryMetadataKey, instance, metadata.methodName);
                let contextMetadata = Reflect.getMetadata(contextMetadataKey, instance, metadata.methodName);
                let headerMetadata = Reflect.getMetadata(headerMetadataKey, instance, metadata.methodName);
                switch (metadata.requestMethod) {
                    case Method.GET:
                        requestMethod = 'get';
                        break;
                    case Method.PUT:
                        requestMethod = 'put';
                        break;
                    case Method.POST:
                        requestMethod = 'post';
                        break;
                    case Method.PATCH:
                        requestMethod = 'pacth';
                        break;
                    case Method.DELETE:
                        requestMethod = 'delete';
                        break;
                    default: break;
                }
                router[requestMethod](metadata.path, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    // @Body
                    if (!isEmpty(bodyMetadata)) {
                        yield bodyParser()(ctx, next);
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
                    let result; // | Promise<any> | Sheencity.qrcode.shared.Result<any>;
                    try {
                        result = yield instance[metadata.methodName].apply(this, argvs);
                        ctx.body = { success: true, value: result };
                    }
                    catch (err) {
                        console.error(err);
                        ctx.status = err.status || 500;
                        ctx.body = { success: false, reason: err.message || err };
                    }
                }));
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
function Controller(target) {
    controllers.add(target);
}
exports.Controller = Controller;
;
function Prefix(path) {
    return Reflect.metadata(prefixMetadataKey, path);
}
exports.Prefix = Prefix;
;
function methodBuilder(method) {
    return (path) => (target, prop, desc) => {
        let routers = Reflect.getMetadata(routeMetadataKey, target) || [];
        routers.push({ requestMethod: method, methodName: prop, path });
        Reflect.defineMetadata(routeMetadataKey, routers, target);
    };
}
exports.Get = methodBuilder(Method.GET);
exports.Put = methodBuilder(Method.PUT);
exports.Post = methodBuilder(Method.POST);
exports.Patch = methodBuilder(Method.PATCH);
exports.Delete = methodBuilder(Method.DELETE);
exports.Body = (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(bodyMetadataKey, { parameterIndex }, target, propertyKey);
};
exports.Path = (pathParam) => {
    return (target, propertyKey, parameterIndex) => {
        let pathParams = Reflect.getMetadata(pathMetadataKey, target) || [];
        pathParams.push({ parameterIndex, pathParam });
        Reflect.defineMetadata(pathMetadataKey, pathParams, target, propertyKey);
    };
};
exports.Query = (queryName) => {
    return (target, propertyKey, parameterIndex) => {
        let queryParams = Reflect.getMetadata(queryMetadataKey, target) || [];
        queryParams.push({ parameterIndex, queryName });
        Reflect.defineMetadata(queryMetadataKey, queryParams, target, propertyKey);
    };
};
exports.Header = (headerParam) => {
    return (target, propertyKey, parameterIndex) => {
        let headerParams = Reflect.getMetadata(headerMetadataKey, target) || [];
        headerParams.push({ parameterIndex, headerParam });
        Reflect.defineMetadata(headerMetadataKey, headerParams, target, propertyKey);
    };
};
exports.Context = (target, propertyKey, parameterIndex) => {
    Reflect.defineMetadata(contextMetadataKey, { parameterIndex }, target, propertyKey);
};
//# sourceMappingURL=index.js.map