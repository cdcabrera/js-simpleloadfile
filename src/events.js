

    events = events();


    /**
     * 
     * @returns {{load: Function, next: Function}}
     */
    function events() {

        return {


            /**
             * Load a file.
             * @param files {Array}
             */
            load: function(files) {


                return this;
            },


            /**
             * Process load, error, & timeout events, then start the process over for the next file.
             * @param domContext {Object}
             * @param type {Object}
             * @param files {Array}
             * @param ie {Boolean}
             */
            next: function(domContext, type, files, ie) {


                return this;
            }
        };
    }