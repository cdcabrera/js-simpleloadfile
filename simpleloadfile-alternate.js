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

        /**
         * Expose methods and property.
         * @param files
         * @returns {Expose}
         * @constructor
         */
        function Expose (files) {

            this.files = _parent.displayFilesLoaded;

            setTimeout(function(){
                new Initialize(files);
            },0);

            return this;
        }

        /**
         * Internally initialize, separate context.
         * @param files
         * @constructor
         */
        function Initialize (files) {

            setObjData('scripts', 0);

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

            if (file.defer) {

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

                element.onload = element.onreadystatechange = function (type) {

                    if (!(this.readyState) || /loaded|complete/.test(this.readyState)) {

                        clearTimeout(timeout);

                        this.onload = this.onreadystatechange = null;

                        var passedType = {type: 'contextfail'};

                        // for js files a pattern
                        // in testing... local files fire 'loaded', alt domain files fire 'completed'
                        if (file.type === 'js') {

                            if (/loaded/.test(this.readyState) && !/^http/.test(file.file) || /complete/.test(this.readyState) && /^http/.test(file.file)) {

                                passedType.type = 'load';
                            } else {

                                passedType.type = 'error';
                                /*
                                 try {
                                 throw new Error('NetworkError: 404 Not Found - '+file.file);
                                 } catch (e) {

                                 if (console) {

                                 console.log(e.message);
                                 }
                                 }*/
                            }
                        }

                        selfContext.processEvent(this, passedType, files, true);
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
         * @type {{update: Function, complete: Function, success: Function, error: Function, wait: Function}}
         */
        Expose.prototype = {

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

        return new Expose(_settings.files);
    };

})(this);