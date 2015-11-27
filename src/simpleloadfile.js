
    /**
     * Expose the resource loader globally.
     * @returns {ResourceLoad}
     */
    window.simpleLoadFile = function(settings) {

        return new SimpleLoadFile(settings);
    };



    /**
     * Load JS & CSS files.
     * @param settings {{data: Object, id: Number, timeout: Number, files: Array}}
     * @returns {{update: Function, complete: Function, success: Function, error: Function, wait: Function}}
     * @constructor
     */
    function SimpleLoadFile(settings) {

        setTimeout(function(){


        },0);
    }



    SimpleLoadFile.prototype.update = function (callback) {

        return this;
    };



    SimpleLoadFile.prototype.complete = function (success, error) {

        this.success(success);
        this.error(error);
        return this;
    };



    SimpleLoadFile.prototype.success = function (callback) {

        return this;
    };



    SimpleLoadFile.prototype.error = function (callback) {

        return this;
    };



    SimpleLoadFile.prototype.wait = function () {

        return this;
    };