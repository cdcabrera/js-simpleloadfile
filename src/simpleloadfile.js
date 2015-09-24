

    /**
     * Expose the resource loader globally.
     * @returns {ResourceLoad}
     */
    window.resourceLoad = function () {

        return new ResourceLoad({
            id:         (1e5 * Math.random()),
            timeout:    10000,
            files:      [].slice.call(arguments)
        });
    };


    /**
     * Load JS & CSS files.
     * @param settings {{data: Object, id: Number, timeout: Number, files: Array}}
     * @returns {{update: Function, complete: Function, success: Function, error: Function, wait: Function}}
     * @constructor
     */
    function ResourceLoad(settings) {


        setTimeout(function(){

            processFiles(settings);

        },0);


        return {

            update: function (callback) {

                internalStorage.put(settings.id, 'update', callback);
                return this;
            },

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (callback) {

                internalStorage.put(settings.id, 'success', callback);
                return this;
            },

            error: function (callback) {

                internalStorage.put(settings.id, 'error', callback);
                return this;
            },

            wait: function () {

                internalStorage.put(settings.id, 'wait', [].slice.call(arguments));
                return this;
            }
        };
    }