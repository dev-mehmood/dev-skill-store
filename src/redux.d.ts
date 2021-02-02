
export {Redux};
declare class Redux {
    constructor();
    reducersArray:Array<any>; // [ /* { propName:fn} */]
    state: any;
    preMiddleware:Array<any>; 
    postMiddleware:Array<any>; 
    subscribersArray:Array<any>; 
    isUniqueAction:Array<any>; 
    dispatch(action: any): any;
    subscribe(cb: Function, selector?: Function, propName?: string) : Function;
    registerReducerObject(initialState: any, rootReducerObj: Function) :void;
    removeReducerObject(stateMainPropKey: string):void;
    getState(str: undefined | string | Function):any;
    unique(action: string):string
}



