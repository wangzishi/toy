export declare class Page<T> {
    contents: T[];
    total: number;
    offset: number;
    limit: number;
    constructor(contents: T[], total: number, offset: number, limit: number);
    readonly length: number;
    readonly capacity: number;
    readonly current: number;
}
