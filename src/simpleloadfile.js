

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

        },0);


        return {

            update: function (callback) {

                return this;
            },

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (callback) {

                return this;
            },

            error: function (callback) {

                return this;
            },

            wait: function () {

                return this;
            }
        };
    }