"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Page {
    // capacity: number;
    // current: number;
    constructor(contents, total, offset, limit) {
        this.contents = contents;
        this.total = total;
        this.offset = offset;
        this.limit = limit;
    }
    get length() {
        return Math.ceil(this.total / this.limit);
    }
    get capacity() {
        return this.length * this.limit;
    }
    get current() {
        return 1 + this.offset / this.limit;
    }
    toJSON() {
        const obj = {
            total: this.total,
            offset: this.offset,
            limit: this.limit,
            length: this.length,
            capacity: this.capacity,
            current: this.current,
            contents: this.contents
        };
        return obj;
    }
}
exports.Page = Page;
// const p = new Page([1], 121, 20, 10);
// console.log({ p }, JSON.stringify(p));
//# sourceMappingURL=page.js.map