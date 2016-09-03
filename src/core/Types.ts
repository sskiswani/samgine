export type PIXIRenderer = PIXI.WebGLRenderer | PIXI.CanvasRenderer


export interface List<T> {
    [index: number]: T;
    length: number;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export interface NumericDictionary<T> {
    [index: number]: T;
}

export type Emitter = PIXI.EventEmitter | IEventEmitter | EventEmitter3.EventEmitter;
export interface IEventEmitter {
    /**
     * Return a list of assigned event listeners.
     *
     * @param {String} event The events that should be listed.
     * @returns {Array}
     * @api public
     */
    listeners(event?: string): Function[];

    /**
     * Return a list of assigned event listeners.
     *
     * @param {String} event The events that should be listed.
     * @param {Boolean} exists We only need to know if there are listeners.
     * @returns {Boolean}
     * @api public
     */
    listeners(event: string, param: boolean): boolean;

    /**
     * Emit an event to all registered event listeners.
     *
     * @param {String} event The name of the event.
     * @returns {Boolean} Indication if we've emitted an event.
     * @api public
     */
    emit(event: string, ...args: any[]): boolean;

    /**
     * Register a new EventListener for the given event.
     *
     * @param {String} event Name of the event.
     * @param {Function} fn Callback function.
     * @param {Mixed} [context=this] The context of the function.
     * @api public
     */
    on(event: string, fn: Function, context?: any): Emitter;

    /**
     * Add an EventListener that's only called once.
     *
     * @param {String} event Name of the event.
     * @param {Function} fn Callback function.
     * @param {Mixed} [context=this] The context of the function.
     * @api public
     */
    once(event: string, fn: Function, context?: any): Emitter;

    /**
     * Remove event listeners.
     *
     * @param {String} event The event we want to remove.
     * @param {Function} fn The listener that we need to find.
     * @param {Mixed} context Only remove listeners matching this context.
     * @param {Boolean} once Only remove once listeners.
     * @api public
     */
    removeListener(event: string, fn?: Function, context?: any, once?: boolean): Emitter;

    /**
     * Remove all listeners or only the listeners for the specified event.
     *
     * @param {String} event The event want to remove all listeners for.
     * @api public
     */
    removeAllListeners(event?: string): Emitter;

    /**
     * Remove event listeners.
     *
     * @param {String} event The event we want to remove.
     * @param {Function} fn The listener that we need to find.
     * @param {Mixed} context Only remove listeners matching this context.
     * @param {Boolean} once Only remove once listeners.
     * @api public
     */
    off(event: string, fn?: Function, context?: any, once?: boolean): Emitter;

    /**
     * Register a new EventListener for the given event.
     *
     * @param {String} event Name of the event.
     * @param {Function} fn Callback function.
     * @param {Mixed} [context=this] The context of the function.
     * @api public
     */
    addListener(event: string, fn: Function, context?: any): Emitter;
}
