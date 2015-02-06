/*
 * SimpleLoadFile/ResourceLoad Method
 * Copyright 2014, CDCabrera, menotyou.com
 * licensed under MIT license, http://en.wikipedia.org/wiki/MIT_License
 *
 * Aspects of the event creation were utilized from jQuery's ajaxTransport
 * jQuery is licensed under the MIT license, http://en.wikipedia.org/wiki/MIT_License
 *
 * The main aspect of the IE8 css event.type is pulled from Pete Otaqui's
 * Gist on CSS File Loading, https://gist.github.com/pete-otaqui/3912307
 *
 * Similar concept, and method name in the returned "wait" as LABjs.
 * LABjs is licensed under the MIT license, http://en.wikipedia.org/wiki/MIT_License
 */
/*
 settings in the form of any array of objects, string or object arguments.
 1. if you decide to use string(s) just enter the file path/URL

 2. if you decide to use objects the following options are available, all are optional except for "file":

    {
    id:         {string} unique identifier used in conjunction with "wait"
    wait:       {string|array} a string, or array of strings, that trigger based on the aforementioned string IDs
    cache:      {boolean} cache the file or not
    file:       {string} the file path/URL to load
    type:       {string} string in the form of "css" or "js". if left off it'll simply look for file extensions, not the most reliable method
    success:    {Function} per file success callback
    error:      {Function} per file error callback
    timeout:    {int} per file timeout in milliseconds. defaults to 10 seconds. fires the error handler if available.
    }
 */

(function(window, undefined) {

    'use strict';
    
    /**
     * Store data for queues.
     * @type {{filesLoaded: {}, filesFailed: {}, waitQueues: Array}}
     */
    var resourceLoaderData = { filesLoaded:{}, filesFailed:{}, waitQueues:[], ieError:null };

    /**
     * Load JS and CSS files.
     * @returns {{files: Array, update: Function, complete: Function, success: Function, error: Function, wait: Function}}
     */
    window.resourceLoad = function () {

        var _settings = {
            data:       resourceLoaderData,
            id:         (1e5 * Math.random()),
            timeout:    10000,
            files:      convertArguments.apply(null, arguments)
        };

        /**
         * Global instance storage and track loaded files.
         */
        _settings.data[_settings.id] = {
            length:_settings.files.length
        };

        /**
         * Rock and or Roll... useless comment.
         */
        setTimeout(function(){

            setupFiles(_settings.files);
        },0);

        /**
         * Process files into a consistent format, an array of objects.
         * @param files {Array}
         */
        function setupFiles (files) {

            files = (Object.prototype.toString.call(files) == '[object Array]') ? files : [{file: files}];

            var setupQueue  = [],
                globalId    = _settings.id,
                timeout     = _settings.timeout,
                dataWait    = getObjData(globalId, 'wait');

            for (var i = 0; i < files.length; i++) {

                var tempObj = {},
                    file    = ( typeof files[i] === 'string' ) ? {file: files[i]} : files[i];

                tempObj.globalId= globalId;
                tempObj.id      = (file.id) ? file.id : null;
                tempObj.wait    = (file.wait) ? file.wait : [];
                tempObj.cache   = (file.cache === undefined || file.cache) ? true : false;
                tempObj.file    = (typeof file.file === 'string') ? file.file.replace(/\s+$/, '') : null;
                tempObj.type    = (file.type) ? file.type.toLowerCase() : ((/\.js.*$/i).test(file.file)) ? 'js' : 'css';
                tempObj.success = (file.success) ? file.success : null;
                tempObj.error   = (file.error) ? file.error : null;
                tempObj.timeout = (file.timeout) ? file.timeout : timeout;

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

            checkQueue(setupQueue);
        }

        /**
         * Add files to wait queue or continue with loading.
         * @param files {Array}
         */
        function checkQueue (files) {

            if (!files.length) {

                return;
            }

            if (files[0].wait.length) {

                setWaitQueue(files[0]);

                processEvent(null, {type: 'waiting'}, [files[0]]);

                files.shift();

                checkQueue(files);

            } else {

                loadFiles(files);
            }
        }

        /**
         * Load a file.
         * @param files {Array}
         */
        function loadFiles (files) {

            var file        = files[0],
                id          = file.type+'-'+(1e5 * Math.random()),
                element     = (file.type === 'js') ? document.createElement('script') : document.createElement('link'),
                head        = (document.head || document.getElementsByTagName('head')[0] || document.documentElement),
                timeout     = setTimeout(function () { element.onload({type: 'timeout'}); }, file.timeout),
                fallback    = false;

            element.id = id;

            switch (file.type) {
                case 'js':

                    if (!file.defer) {

                        element.async = true;
                    }

                    element.src = file.file;
                    break;

                case 'css':
                    element.rel = 'stylesheet';
                    element.href = file.file;
                    break;
            }

            if ('hasOwnProperty' in element && 'onload' in element) {

                element.onerror = element.onload = function (type) {

                    clearTimeout(timeout);

                    this.onerror = this.onload = null;

                    var self = this;

                    setTimeout(function () {
                        processEvent(self, type, files);
                    }, 0);
                };

            } else if (element.readyState) {

                setIeEvents(files, file, id, element, timeout);

            } else {

                clearTimeout(timeout);
                fallback = true;
            }

            switch (file.type) {

                case 'js':
                    head.insertBefore(element, head.firstChild);
                    break;

                default:
                    head.appendChild(element);
                    break;
            }

            if (fallback) {

                processEvent(element, {type: 'contextfail'}, files);
            }
        }

        /**
         * IE8 load and error event handlers.
         * @param files {Array}
         * @param file {Object}
         * @param id {string}
         * @param element {*}
         * @param timeout {*}
         */
        function setIeEvents (files, file, id, element, timeout) {

            setIeWindowError(file.globalId);

            element.onload = element.onreadystatechange = function (type) {

                if (!(this.readyState) || /loaded|complete/.test(this.readyState)) {

                    clearTimeout(timeout);

                    this.onload = this.onreadystatechange = null;

                    var emulatedType    = (type && type.type)? type : {type: 'contextfail'},
                        winError        = null,
                        cssLength       = 0,
                        cssCurrent      = null;

                    if (emulatedType.type === 'contextfail') {

                        if (file.type === 'js') {

                            emulatedType.type = 'load';
                            winError = _settings.data.ieError;

                            if (winError && winError.file === this.src) {

                                emulatedType.type = 'error';
                            }

                            // IE8 dev tools script debugger, when running, appears to deactivate window.onerror, error detection fails.
                            debugger;

                        } else {

                            emulatedType.type = 'error';

                            //-- https://gist.github.com/pete-otaqui/3912307
                            cssLength = document.styleSheets.length;

                            try {

                                while ( cssLength-- ) {

                                    cssCurrent = document.styleSheets[cssLength];

                                    if ( cssCurrent.id === id ) {

                                        if (cssCurrent.cssText !== '') {

                                            emulatedType.type = 'load';
                                        }

                                        break;
                                    }
                                }

                            } catch (e) {}
                        }
                    }

                    processEvent(this, emulatedType, files, true);
                }
            };
        }

        /**
         * IE8 helper for determining script errors "onload".
         * @param globalId {string}
         */
        function setIeWindowError (globalId) {

            if (window.onerror && window.onerror.__data__) {

                return;
            }

            var winEvent = (window.onerror)? window.onerror : function(){};

            window.onerror = function (message, file, line) {

                _settings.data.ieError = {message:message, file:file, line:line};
                winEvent.apply(this, arguments);
            };

            // an attempt to detect if onerror was overwritten
            window.onerror.__data__ = true;
        }

        /**
         * Process load, error, & timeout events, then start the process over for the next file.
         * @param domContext {*}
         * @param type {Object}
         * @param files {Array}
         * @param ie {boolean}
         */
        function processEvent (domContext, type, files, ie) {

            var file            = files.shift(),
                globalId        = file.globalId,
                isError         = (type && (type.type === 'error' || type.type === 'timeout')),
                callback        = (isError) ? file.error : file.success,
                returnProperties= [type.type, (file.file||null), (file||null)],
                arrUpdates      = getObjData(file.globalId, 'update'),
                arrSuccess      = getObjData(file.globalId, 'success'),
                arrError        = getObjData(file.globalId, 'error');

            if (domContext && domContext.parentNode && file.type === 'js' && !ie) {

                domContext.parentNode.removeChild(domContext);
            }

            applyCallbacks(arrUpdates, returnProperties);

            if (type.type === 'waiting') {

                return;
            }

            registerFileSuccess(isError, file);

            if (callback) {

                callback.apply(domContext, returnProperties);
            }

            if (isError) {

                applyCallbacks(arrError, {success:_settings.data.filesLoaded[globalId], error:_settings.data.filesFailed[globalId]});

                return;

            } else {

                // track number of files loaded per queue
                _settings.data[globalId].length -= 1;

                updateWaitQueue(file.id);
            }

            if (files.length) {

                checkQueue(files);

            } else {

                if (_settings.data[globalId].length <= 0) {

                    applyCallbacks(arrSuccess, {success:_settings.data.filesLoaded[globalId], error:_settings.data.filesFailed[globalId]});
                }

                files = getWaitQueue();

                if (files.length) {

                    checkQueue(files);
                }
            }
        }

        /**
         * Cycle and fire callbacks.
         * @param callbacks
         * @param data
         */
        function applyCallbacks (callbacks, data) {

            if (callbacks) {

                callbacks = convertArguments(callbacks);
                data = convertArguments(data);

                for (var i=0; i<callbacks.length; i++) {

                    callbacks[i].apply(null, data);
                }
            }
        }

        /**
         * Did a file load? Then apply to appropriate queue.
         * @param isError {boolean}
         * @param file {object}
         */
        function registerFileSuccess (isError, file) {

            var id = file.globalId;

            if (isError) {

                if (!_settings.data.filesFailed[id]) {

                    _settings.data.filesFailed[id] = [];
                }

                _settings.data.filesFailed[id].push(file);

            } else {

                if (!_settings.data.filesLoaded[id]) {

                    _settings.data.filesLoaded[id] = [];
                }

                _settings.data.filesLoaded[id].push(file);
            }
        }

        /**
         * Store files in the global wait queue.
         * @param file
         */
        function setWaitQueue (file) {

            _settings.data.waitQueues.push(file);
        }

        /**
         * Remove and return files that are ready to load from the global wait queue.
         * @returns {Array}
         */
        function getWaitQueue () {

            var waitQueue   = _settings.data.waitQueues,
                getQueue    = [],
                updatedQueue= [];

            for (var i=0; i<waitQueue.length; i++) {

                if (!waitQueue[i].wait.length) {

                    getQueue.push(waitQueue[i]);
                } else {

                    updatedQueue.push(waitQueue[i]);
                }
            }

            _settings.data.waitQueues = updatedQueue;

            return getQueue;
        }

        /**
         * Update wait queue files with the latest loaded ID.
         * @param fileLoadedId
         */
        function updateWaitQueue (fileLoadedId) {

            var waitQueues = _settings.data.waitQueues;

            for (var i=0; i<waitQueues.length; i++) {

                for (var k=0; k<waitQueues[i].wait.length; k++) {

                    if (fileLoadedId === waitQueues[i].wait[k]) {

                        waitQueues[i].wait.splice(k,1);
                    }
                }
            }
        }

        /**
         * Get from instance storage
         * @param id {string}
         * @param key {string}
         * @returns {*}
         */
        function getObjData (id, key) {

            var setData = _settings.data[id],
                retData = null;

            if (setData && setData[key]) {

                retData = setData[key]
            }

            return retData;
        }

        /**
         * Set facet through instance storage.
         * @param id {string}
         * @param key {string}
         * @param value {*}
         */
        function setObjData (id, key, value) {

            _settings.data[id][key] = value;
        }

        /**
         * Convert arguments to array.
         * @returns {Array}
         */
        function convertArguments () {

            var args        = Array.prototype.slice.call(arguments),
                returnArray = [];

            while (args.length) {

                var temp = args.shift();

                if ( Object.prototype.toString.call(temp) === "[object Array]" ) {

                    returnArray = returnArray.concat(temp);
                } else if (temp) {

                    returnArray.push(temp);
                }
            }

            return returnArray;
        }

        /**
         * Process returned callbacks from the provided methods.
         * @param id {string}
         * @param key {string}
         * @param callback {function}
         */
        function processCallbacks (id, key, callback) {

            var value = getObjData(key);

            if (!value) {

                value = [];
            }

            value = convertArguments(value, callback);

            setObjData(id, key, value);
        }

        /**
         * Expose methods.
         */
        return {

            update: function (callback) {

                processCallbacks(_settings.id, 'update', callback);
                return this;
            },

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (success) {

                processCallbacks(_settings.id, 'success', success);
                return this;
            },

            error: function (error) {

                processCallbacks(_settings.id, 'error', error);
                return this;
            },

            wait: function () {

                processCallbacks(_settings.id, 'wait', Array.prototype.slice.call(arguments));
                return this;
            }
        };
    };

})(this);