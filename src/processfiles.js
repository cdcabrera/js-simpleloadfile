

    /**
     * Process files into a consistent format, an array of objects.
     * @param settings {Object}
     * @returns {Array}
     */
     function processFiles(settings) {

        var setupQueue  = [],
            filesArray  = settings.files,
            globalId    = settings.id,
            timeout     = settings.timeout,
            dataWait    = internalStorage.get(settings.id, 'wait');

        filesArray = (Object.prototype.toString.call(filesArray) == '[object Array]') ? filesArray : [{file: filesArray}];

        for (var i = 0; i < filesArray.length; i++) {

            var tempObj = {},
                file    = ( typeof filesArray[i] === 'string' ) ? {file: filesArray[i]} : filesArray[i];

            tempObj.globalId= globalId;
            tempObj.id      = (file.id) ? file.id : null;
            tempObj.wait    = (file.wait) ? file.wait : [];
            tempObj.cache   = (file.cache === undefined || file.cache) ? true : false;
            tempObj.file    = (typeof file.file === 'string') ? file.file.replace(/\s+$/, '') : null;
            tempObj.type    = (file.type) ? file.type.toLowerCase() : ((/\.js.*$/i).test(file.file)) ? 'js' : 'css';
            tempObj.success = (file.success) ? file.success : null;
            tempObj.error   = (file.error) ? file.error : null;
            tempObj.timeout = (file.timeout) ? file.timeout : timeout || 10000;

            if (!tempObj.file) {

                continue;
            }

            if (!tempObj.id) {

                tempObj.id = tempObj.file;
            }


            if (tempObj.wait) {

                tempObj.wait = convertArguments(tempObj.wait);
            }

            if ( dataWait ) {

                tempObj.wait = convertArguments(dataWait, tempObj.wait);
            }

            if (tempObj.wait && tempObj.wait.length) {

                tempObj.defer = true;
            }

            if (!tempObj.cache) {

                tempObj.file += '{0}resourceLoad={1}'.replace('{0}', ((/\?.*\=/).test(tempObj.file) ? '&' : '?')).replace('{1}', (1e5 * Math.random()));
            }

            setupQueue.push(tempObj);
        }

        return setupQueue;
    }