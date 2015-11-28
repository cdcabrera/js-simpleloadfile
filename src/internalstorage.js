
    /**
     * Expose internal storage.
     *
     * @constructor
     */
    function InternalStorage() {

        if (!InternalStorage.internal) {

            InternalStorage.internal = {

                filesLoaded:    {},
                filesFailed:    {},
                loadedIds:      [],
                waitQueues:     []
            };
        }

        this.internal = InternalStorage.internal;
    }



    /**
     * Return all internal storage properties.
     *
     * @returns {{filesLoaded: {}, filesFailed: {}, loadedIds: Array, waitQueues: Array}|*}
     */
    InternalStorage.prototype.all = function() {

        return this.internal;
    };



    /**
     *
     * @param key {String}
     * @param type {String|Number}
     * @returns {*}
     */
    InternalStorage.prototype.get = function(key, type) {


    };



    /**
     *
     * @param key {String}
     * @param type {String}
     * @param value {*}
     */
    InternalStorage.prototype.put = function(key, type, value) {

        switch(key)
        {
            case 'loadedIds':
            case 'waitQueues':

                this.internal[key] = convertArguments(this.internal[key], type);

                break;

            //case 'filesLoaded':
            //case 'filesFailed':
            default:

                if (!this.internal[key]) {

                    this.internal[key] = {};
                }

                this.internal[key][type] = convertArguments(this.internal[key][type], [].slice.call(arguments, 2));

                break;
        }
    };



    /**
     * Reset properties
     * @param key {String}
     * @param value {*}
     */
    InternalStorage.prototype.reset = function(key, value) {


    };