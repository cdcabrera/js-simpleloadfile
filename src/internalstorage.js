
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

        var ret = this.internal[key];

        switch(type)
        {
            //case 'update':
            //case 'wait':
            //case 'success':
            //case 'error':
            default:

                if (ret && ret[type]) {

                    ret = ret[type];

                } else {

                    ret = undefined;
                }

                break;
        }

        return ret || null;
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

                this.internal[key] = convertArguments(this.internal[key] || [], type);

                break;

            //case 'filesLoaded':
            //case 'filesFailed':
            default:

                if (!this.internal[key]) {

                    this.internal[key] = {};
                }

                this.internal[key][type] = convertArguments(this.internal[key][type] || [], value);

                break;
        }

        return this;
    };



    /**
     * Reset properties
     * @param key {String}
     * @param value {*}
     */
    InternalStorage.prototype.reset = function(key, value) {

        return this;
    };