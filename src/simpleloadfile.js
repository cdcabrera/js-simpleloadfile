
    /**
     * Expose the resource loader globally.
     *
     * @param settings {Object}
     * @returns {SimpleLoadFile}
     */
    window.simpleLoadFile = function(settings) {

        var defaultSettings = {
            id:         (1e5 * Math.random()),
            timeout:    10000,
            files:      []
        };

        if (Object.prototype.toString.call(settings) == '[object Object]') {

            settings = extend(defaultSettings, settings);

        } else {

            settings = defaultSettings;
            settings.files = [].slice.call(arguments);
        }

        return new SimpleLoadFile(settings);
    };



    /**
     * Load JS & CSS files.
     *
     * @param settings {{data: Object, id: Number, timeout: Number, files: Array}}
     * @returns {{update: Function, complete: Function, success: Function, error: Function, wait: Function}}
     * @constructor
     */
    function SimpleLoadFile(settings) {

        this.settings           = settings;
        this.internalStorage    = new InternalStorage();

        setTimeout(function(){




        },0);
    }



    /**
     *
     * @param callback {Function}
     * @returns {SimpleLoadFile}
     */
    SimpleLoadFile.prototype.update = function (callback) {

        this.internalStorage.put(this.settings.id, 'update', callback);
        return this;
    };



    /**
     *
     * @param success {Function}
     * @param error {Function}
     * @returns {SimpleLoadFile}
     */
    SimpleLoadFile.prototype.complete = function (success, error) {

        this.success(success);
        this.error(error);
        return this;
    };



    /**
     *
     * @param callback {Function}
     * @returns {SimpleLoadFile}
     */
    SimpleLoadFile.prototype.success = function (callback) {

        this.internalStorage.put(this.settings.id, 'success', callback);
        return this;
    };



    /**
     *
     * @param callback {Function}
     * @returns {SimpleLoadFile}
     */
    SimpleLoadFile.prototype.error = function (callback) {

        this.internalStorage.put(this.settings.id, 'error', callback);
        return this;
    };



    /**
     *
     * @returns {SimpleLoadFile}
     */
    SimpleLoadFile.prototype.wait = function () {

        this.internalStorage.put(this.settings.id, 'wait', [].slice.call(arguments));
        return this;
    };