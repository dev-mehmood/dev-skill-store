import { cloneDeep } from 'lodash';

export class Redux {

    constructor() {

        this.reducersArray = [ /* { propName:fn} */]
        this.state = {}
        this.preMiddleware = []
        this.postMiddleware = []
        this.subscribersArray = []
        this.isUniqueAction = []
    }
    dispatch(action) {

        if (typeof action === 'function') {
            const test = action(this.dispatch.bind(this), this.getState.bind(this));
            if (typeof test?.then !== 'function') throw "Thunk function  must return a promise"
            return
        }

        let key;
        let keyArr = []
        let stateCopy = cloneDeep(this.state)
        this.reducersArray.filter(obj => {
            key = Object.keys(obj)[0]
            return key in this.state; // if this property exists in state root level
        }).forEach(obj => {

            key = Object.keys(obj)[0]; ////obj == { data: fn}
            keyArr.push(key)
            // after change
            stateCopy[key] = obj[key](stateCopy[key], action, this.getState.bind({ state: stateCopy }));
            // getState should return the current changed state from reducers

        });

        let prevValue = this.state;// before change
        this.state = stateCopy; // new value after reducer's change 
        this.subscribersArray.forEach(obj1 => { // this.state = ini
            let key_ = Object.keys(obj1)[0];
            if ('standard' in obj1 || keyArr.includes(key_)) {
                let key_ = Object.keys(obj1)[0];
                const slectedValue = obj1[key_][1](cloneDeep(this.state))
                const selectedPrevValue = obj1[key_][1](prevValue)
                obj1[key_][0](slectedValue, selectedPrevValue)
            }
        })

    }
    subscribe(cb, selector = state => state, propName = 'standard') { // {data:[cb, selector]}
        debugger;
        this.subscribersArray.push({ [propName]: [cb, selector] })
        this.subscribersArray.forEach(obj1 => { // this.state = ini

            const slectedValue = selector(cloneDeep(this.state))
            cb(slectedValue, slectedValue)

        })

        return () => {
            this.subscribersArray = this.subscribersArray.filter((obj) => propName in obj && cb !== [obj[0]])

        }
    }

    registerReducerObject(initialState, rootReducerObj) {
        for (let key in rootReducerObj) {
            this.reducersArray.push({
                [key]: rootReducerObj[key]
            });
            this.state[key] = initialState[key] || null
        }

    }

    removeReducerObject(key) {

    }
    /* string Selector: prop.another.another[3] // returns an array;
       function returns function call with state;
     */
    getState(str) {
        let copy = cloneDeep(this.state)
        if (typeof str === undefined) return copy;

        if (typeof str === 'string') {
            // ["prop", "another", "another", "3"]
            str = str.replace(/\[/, '.').replace(/\]/, '').split('.')

            return str.reduce((acc, el, i) => {
                if (typeof acc === 'undefined') return undefined;
                return acc[el]
            }, copy)

        } else if (typeof str === 'function') {
            return str(copy)
        }
    }
    unique(action) {
        if (!this.isUniqueAction.includes(action)) {
            this.isUniqueAction.push(action)
            return action;
        }
        throw `${action} is already used`
    }
}
