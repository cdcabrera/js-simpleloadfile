
    /**
     * Basic object extend.
     *
     * @param to {Object} destination object
     * @param from {Object} update object
     * @returns {Object}
     */
    function extend(to, from) {

        return (function _extend(arrayObjs) {

            var newObj = {},
                currentObj,
                key;

            var isObj = function (v) {

                return (v !== undefined && v !== null && v.constructor == Object);
            };

            while (arrayObjs.length > 0) {

                currentObj = arrayObjs.shift();

                if (isObj(currentObj)) {

                    for (key in currentObj) {

                        if (currentObj.hasOwnProperty(key)) {

                            if (isObj(currentObj[key])) {

                                newObj[key] = _extend([(newObj[key] || {}), currentObj[key]]);

                            } else {

                                newObj[key] = currentObj[key];
                            }
                        }
                    }
                }
            }

            return newObj;

        })(Array.prototype.slice.call(arguments, 0));
    }