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

        //_parent.data = {};
        resetData();

        function getData (key) {
            return (_parent.__data__[_id] && _parent.__data__[_id][key] || null);
        }

        function setData (key, value) {
            _parent.__data__[_id][key] = value;
        }

        function resetData () {
            _id = 1e5 * Math.random();
            _parent.__data__ = {};
            _parent.__data__[_id] = {};
        }

        /**
         * Expose methods and property.
         * @param files
         * @returns {Expose}
         * @constructor
         */
        function Expose (files) {
            var self = this;

            this.files = _parent.displayFilesLoaded;

            //new Initialize(this, files);
            setTimeout(function(){
                new Initialize(self, files);
            },0);

            return this;
        }

        /**
         * Internally initialize.
         * @param context
         * @param files
         * @constructor
         */
        function Initialize (context, files) {

            this.exposeContext = context;
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
                dataWait    = getData('wait');

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
                    //tempObj.wait = (Object.prototype.toString.call(tempObj.wait) == '[object Array]') ? tempObj.wait : [tempObj.wait];
                    tempObj.wait = convertArguments(tempObj.wait);
                }

                //console.log(this.exposeContext.wait.args);
                //console.log(this.exposeContext.error.active);
                //if (this.exposeContext.wait.args) {
                console.log(dataWait+'');
                console.log(tempObj.file);
                if( dataWait ) {
                    tempObj.wait = convertArguments(dataWait, tempObj.wait);
                }

                //console.log(this.exposeContext.wait.args);
                //console.log(_parent[_id]);
                //console.log(_parent.data.wait);
                //console.log(getData('wait'));

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
                //var test = _parent.filesToLoad;
                //console.log(window.bcbsncShopper);

                this.processEvent(null, {type: 'waiting'}, [{error:null}]);
                //if (this.exposeContext.error.active && _parent.filesToLoad.length) {
                //    this.exposeContext.error.call(this.exposeContext, 'waiting', test);
                //}

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

                    //var test1 = _parent.filesToLoad[i].wait[k],
                    //    test2 = _parent.filesLoaded;

                    //console.log(test1);
                    //console.log(test2);

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

                        selfContext.processEvent(this, {type: 'contextfail'}, files);
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
         */
        Initialize.prototype.processEvent = function (domContext, type, files) {

            var file        = files.shift(),
                isError     = (type && (type.type === 'error' || type.type === 'timeout' || type.type === 'waiting')),
                callback    = (isError) ? file.error : file.success,
                returnData  = [type.type];

            if (domContext && domContext.parentNode && file.type === 'js') {

                domContext.parentNode.removeChild(domContext);
            }

            //console.log('1.'+(file.file||'no file'));
            //console.log(_parent.filesToLoad.slice(0));

            files = this.checkFilesToLoad(files);

            if (callback) {

                callback.apply(domContext, returnData.push(file.file));
            }

            if (isError && this.exposeContext.error.active) {

                if (type.type === 'waiting') {
                    returnData.push(_parent.filesToLoad.slice(0));
                }

                this.exposeContext.error.apply(this.exposeContext, returnData);
                return;
            }

            //if (files.length || _parent.filesToLoad.length && !files.length) {
            //if (files.length || _parent.filesToLoad.length) {
            if (files.length) {

                this.checkQueue(files);

            } else {

                if (this.exposeContext.success.active) {

                    this.exposeContext.success.apply(this.exposeContext, returnData);
                }
            }
        };

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
         * @type {{complete: Function, success: Function, error: Function}}
         */
        Expose.prototype = {

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (success) {

                this.success = function () {
                    success.apply(this, arguments);
                };
                this.success.active = true;
                return this;
            },

            error: function (error) {

                this.error = function () {
                    error.apply(this, arguments);
                };
                this.error.active = true;
                return this;
            },

            wait: function () {
                //_parent.data.wait = convertArguments.apply(this, arguments);
                setData('wait', convertArguments.apply(this, arguments));
                //_parent.wait = this.wait.args = convertArguments.apply(this, arguments);
                return this;
            }
        };

        return new Expose(_settings.files);
    };

})(this);