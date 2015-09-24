

    internalStorage = internalStorage();


    /**
     * Expose internal storage.
     * @returns {{all: Function, get: Function, put: Function}}
     */
    function internalStorage() {

        window.ResourceLoad.internal = {

            filesLoaded:    {},
            filesFailed:    {},
            loadedIds:      [],
            waitQueues:     []
        };

        return {


            /**
             * Return all internal storage properties.
             * @returns {{filesLoaded: {}, filesFailed: {}, loadedIds: Array, waitQueues: Array, ieError: null}|*}
             */
            all: function() {

                return window.ResourceLoad.internal;
            },


            /**
             *
             * @param key {String}
             * @param prop {String|Number}
             * @returns {*}
             */
            get: function(key, prop) {

                var ret = window.ResourceLoad.internal[key];

                switch(prop)
                {
                    case 'update':
                    case 'wait':
                    case 'success':
                    case 'error':
                    default:

                        if (ret && ret[prop]) {

                            ret = ret[prop];
                        }

                        break;
                }

                return ret || null;
            },


            /**
             *
             * @param key {String}
             * @param prop {String}
             * @param value {*}
             */
            put: function(key, prop, value) {

                switch(key)
                {
                    case 'loadedIds':
                    case 'waitQueues':

                        window.ResourceLoad.internal[key] = convertArguments(window.ResourceLoad.internal[key], prop);

                        break;

                    case 'filesLoaded':
                    case 'filesFailed':
                    default:

                        if (!window.ResourceLoad.internal[key]) {

                            window.ResourceLoad.internal[key] = {};
                        }

                        window.ResourceLoad.internal[key][prop] = convertArguments(window.ResourceLoad.internal[key][prop], [].slice.call(arguments,2));

                        break;
                }

                return this;
            },


            /**
             * Reset properties
             * @param key {String}
             * @param value {*}
             */
            reset: function(key, value) {

                if (key && value) {

                    window.ResourceLoad.internal[key] = value;

                    return this;
                }

                switch(key)
                {
                    case 'loadedIds':
                    case 'waitQueues':

                        window.ResourceLoad.internal[key] = [];

                        break;

                    case 'filesLoaded':
                    case 'filesFailed':

                        window.ResourceLoad.internal[key] = {};

                        break;
                }

                return this;
            }
        };
    }