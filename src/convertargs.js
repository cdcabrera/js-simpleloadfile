

    /**
     * Convert arguments to array.
     * @returns {Array}
     */
    function convertArguments() {

        var args        = [].slice.call(arguments),
            returnArray = [],
            tempArg;

        while (args.length) {

            tempArg = args.shift();

            if ( Object.prototype.toString.call(tempArg) === "[object Array]" ) {

                returnArray = returnArray.concat(tempArg);

            } else if (tempArg) {

                returnArray.push(tempArg);
            }
        }

         return returnArray;
    }