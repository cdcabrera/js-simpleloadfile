/*
 * SimpleLoadFile/ResourceLoad Method
 * Copyright 2014, CDCabrera, menotyou.com
 * licensed under MIT license, http://opensource.org/licenses/mit-license.php
 *
 * Aspects of the event creation were utilized from jQuery's ajaxTransport
 * jQuery is licensed under the MIT license, http://en.wikipedia.org/wiki/MIT_License
 */
/*
 settings in the form of any array of objects, string arguments, or object arguments.
 1. if you decide to use string(s) just enter the file path/URL

 2. if you decide to use objects the format is:

    {
    id:         {string} unique identifier used in conjunction with "wait"
    wait:       {string|array} a string, or array of strings, that trigger based on the aformentioned string IDs
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
     * Load JS and CSS files.
     * @returns {Expose}
     */
    window.resourceLoad = function () {

        var _parent     = this,
            _settings   = { timeout:10000, files:convertArguments.apply(null, arguments)},
            _id;

        resetObjData();

        setTimeout(function(){

            new Initialize(_settings.files);
        },0);

        /**
         * Internally initialize, separate context.
         * @param files
         * @constructor
         */
        function Initialize (files) {

            this.setup(files);
        }

        /**
         * Standardize file input(s) for loading.
         * @param files
         */
        Initialize.prototype.setup = function (files) {

            files = (Object.prototype.toString.call(files) == '[object Array]') ? files : [{file: files}];

            var setupQueue  = [],
                timeout     = _settings.timeout,
                dataWait    = getObjData('wait');

            for (var i = 0; i < files.length; i++) {

                var tempObj = {},
                    file    = ( typeof files[i] === 'string' ) ? {file: files[i]} : files[i];

                tempObj.id      = (file.id) ? file.id : null;
                tempObj.wait    = (file.wait) ? file.wait : null;
                tempObj.cache   = (file.cache === undefined || file.cache) ? true : false;
                tempObj.file    = (typeof file.file === 'string') ? file.file.replace(/\s+$/, '') : '';
                tempObj.type    = (file.type) ? file.type.toLowerCase() : ((/\.js.*$/i).test(file.file)) ? 'js' : 'css';
                tempObj.success = (file.success) ? file.success : null;
                tempObj.error   = (file.error) ? file.error : null;
                tempObj.timeout = (file.timeout) ? file.timeout : timeout;

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

            this.checkQueue(setupQueue);
        };

        /**
         * Process the "wait" for files by checking against already loaded files.
         * @param files
         */
        Initialize.prototype.checkQueue = function (files) {

            if (!_parent.filesLoaded) {

                _parent.filesLoaded = {};
                _parent.displayFilesLoaded = [];
            }

            if (!_parent.filesToLoad) {

                _parent.filesToLoad = [];
            }

            files = this.checkFilesToLoad(files);


            if (!files.length) {

                this.processEvent(null, {type: 'waiting'}, [{error:null}]);
                return;
            }

            if (files[0].wait) {

                _parent.filesToLoad.push(files[0]);
                files.shift();
                this.checkQueue(files);

            } else {

                _parent.filesLoaded[files[0].id] = files[0].file;
                _parent.displayFilesLoaded.push({id:files[0].id, file:files[0].file});
                this.loadFiles(files);
            }
        };

        /**
         * Compare loaded files against waiting files, then place into load queue.
         * @param files
         * @returns {Array}
         */
        Initialize.prototype.checkFilesToLoad = function (files) {

            var wait;

            for (var i=0; i<_parent.filesToLoad.length; i++) {

                wait = false;

                for (var k=0; k<_parent.filesToLoad[i].wait.length; k++) {

                    if (!(_parent.filesToLoad[i].wait[k] in _parent.filesLoaded)) {

                        wait = true;
                        break;

                    } else {

                        _parent.filesToLoad[i].wait.splice(k,1);
                    }
                }

                if (!wait) {

                    _parent.filesToLoad[i].wait = null;
                    files.push(_parent.filesToLoad[i]);
                    _parent.filesToLoad.splice(i, 1);
                }
            }

            return files;
        };

        /**
         * Start loading files.
         * @param files
         */
        Initialize.prototype.loadFiles = function (files) {

            var selfContext = this,
                file        = files[0],
                element     = (file.type === 'js') ? document.createElement('script') : document.createElement('link'),
                head        = (document.head || document.getElementsByTagName('head')[0] || document.documentElement),
                timeout     = setTimeout(function () { element.onload({type: 'timeout'}); }, file.timeout),
                fallback    = false;

            if (file.defer && file.type === 'js') {

                element.defer = true;
            }

            switch (file.type) {
                case 'js':
                    element.async = true;
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
                        selfContext.processEvent(self, type, files);
                    }, 0);
                };

            } else if (element.readyState) {

                // sets a window.onerror event once. attempts to rewrite the event in the case of an override.
                setWindowError();

                element.onload = element.onreadystatechange = function (type) {

                    if (!(this.readyState) || /loaded|complete/.test(this.readyState)) {

                        clearTimeout(timeout);

                        this.onload = this.onreadystatechange = null;

                        var emulatedType = (type && type.type)? type : {type: 'contextfail'};

                        if (file.type === 'js') {

                            var winError = getObjData('winError');

                            // IE8 script debugger appears to deactivate window.onerror, error detection fails.
                            debugger;

                            if (winError && winError.file === this.src) {

                                emulatedType.type = 'error';
                            }
                        }

                        // for js files a pattern
                        // CORRECTION in testing... this only applies to "cached" files
                        // local files fire 'loaded', alt domain files fire 'completed'
                        /*if (file.type === 'js') {

                         if (/loaded/.test(this.readyState) && !/^(http|\/\/)/.test(file.file) || /complete/.test(this.readyState) && /^(http|\/\/)/.test(file.file)) {

                         emulatedType.type = 'load';
                         } else {

                         emulatedType.type = 'error';

                         //try {
                         //throw new Error('NetworkError: 404 Not Found - '+file.file);
                         //} catch (e) {
                         //if (console) {
                         //console.log(e.message);
                         //}
                         //}
                         }
                         }*/
                        selfContext.processEvent(this, emulatedType, files, true);
                    }
                };

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

                selfContext.processEvent(element, {type: 'contextfail'}, files);
            }
        };

        /**
         * Process load and error events for a file, then start the process over for the next.
         * @param domContext
         * @param type
         * @param files
         * @param ie
         */
        Initialize.prototype.processEvent = function (domContext, type, files, ie) {

            var file            = files.shift(),
                isError         = (type && (type.type === 'error' || type.type === 'timeout')),
                callback        = (isError) ? file.error : file.success,
                returnData      = [type.type, (file.file||null), (_parent.filesToLoad.slice(0)||null)],
                globalError     = getObjData('error'),
                globalSuccess   = getObjData('success'),
                globalUpdate    = (_parent.update && _parent.update.length)? _parent.update : null;

            // might be an issue with removing the script and older IE
            if (domContext && domContext.parentNode && file.type === 'js' && !ie) {

                domContext.parentNode.removeChild(domContext);
            }

            files = this.checkFilesToLoad(files);

            if (callback) {

                callback.apply(domContext, returnData);
            }

            if (globalUpdate) {

                for (var i=0; i<globalUpdate.length; i++) {

                    globalUpdate[i].apply(_parent, returnData);
                }
            }

            if (type.type === 'waiting') {

                return;
            }

            if (isError) {

                if (globalError) {

                    globalError.apply(_parent, returnData);
                }

                return;
            }

            if (files.length) {

                this.checkQueue(files);
            } else {

                if (globalSuccess) {

                    globalSuccess.apply(globalSuccess, returnData);
                }
            }
        };

        /**
         * IE8 helper for determining script errors onload.
         */
        function setWindowError () {

            if (window.onerror && '__data__' in window.onerror) {

                return;
            }

            var winEvent = (window.onerror)? window.onerror : function(){};

            window.onerror = function (message, file, line) {

                setObjData('winError', {message:message, file:file, line:line});
                winEvent.apply(this, arguments);
            };

            // an attempt to detect if onerror was overwritten
            window.onerror.__data__ = true;
        }

        /**
         * Get initialized data.
         * @param key
         * @returns {*|null}
         */
        function getObjData (key) {

            var data = null;

            if (_parent.__data__[_id] && _parent.__data__[_id][key]) {

                data = _parent.__data__[_id][key]
            }

            return data;
        }

        /**
         * Store initialized data.
         * @param key
         * @param value
         */
        function setObjData (key, value) {

            _parent.__data__[_id][key] = value;
        }

        /**
         * Initialize/Reset stored data.
         */
        function resetObjData () {

            _id = 1e5 * Math.random();
            _parent.__data__ = (_parent.__data__ || {});
            _parent.__data__[_id] = {};
        }

        /**
         * Convert arguments into an array.
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
         * Exposed methods.
         * @type {{files: Array, update: Function, complete: Function, success: Function, error: Function, wait: Function}}
         */
        return {

            files: _parent.displayFilesLoaded,

            update: function (callback) {

                if (!_parent.update) {

                    _parent.update = [];
                }

                _parent.update.push(callback);
                return this;
            },

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (success) {

                setObjData('success', success);
                return this;
            },

            error: function (error) {

                setObjData('error', error);
                return this;
            },

            wait: function () {

                setObjData('wait', convertArguments.apply(this, arguments));
                return this;
            }
        };
    };

})(this);