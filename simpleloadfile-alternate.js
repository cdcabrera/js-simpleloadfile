(function(window, undefined) {

    'use strict';

    /**
     * Load JS and CSS files.
     * @returns {Expose}
     */
    window.resourceLoad = function () {

        var _parent     = this.resourceLoader,
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

            //var self = this;

            this.files = _parent.displayFilesLoaded;

            setTimeout(function(){
                //new Initialize(self, files);
                new Initialize(files);
            },0);

            return this;
        }

        /**
         * Internally initialize, separate context.
         * @param context
         * @param files
         * @constructor
         */
        //function Initialize (context, files) {
        function Initialize (files) {

            //this.resetObjData();
            //console.log(this);
            //console.log(_parent.prototype);
            //this.exposeContext = context;
            //setObjData('exposeContext', context);
            //return;
            //setObjData('other', window.document.scripts.length);
            //setObjData('scripts', window.document.scripts.length);
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

                /*try {
                 console.log(dataWait+'');
                 console.log(tempObj.file);

                 } catch (e) {

                 debugger;
                 }*/

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

            //alert((files[0]||{file:null}).file+'\n'+(getObjData('error')||'').toString());

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

            if (file.type === 'js') {
                //setObjData('scripts', window.document.scripts.length);
                setObjData('scripts', (getObjData('scripts') + 1));
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
                var bob = file.file;
                /*
                 var testo = document.createElement('link');
                 testo.onreadystatechange = function(a,b,c){

                 var readystateself = this.readyState;
                 var testself = this;
                 var testfile = file.file;
                 debugger;
                 selfContext.processEvent(this, {type: 'contextfail'}, files);
                 };
                 testo.href = file.file;

                 document.getElementsByTagName('HEAD')[0].appendChild(testo);
                 document.getElementsByTagName('HEAD')[0].removeChild(testo);
                 */

                //var testo = new Image();
                /*element.attachEvent('onreadystatechange', function() {

                 var readystateself = this.readyState;
                 var testself = this;
                 var testfile = file.file;
                 debugger;
                 selfContext.processEvent(this, {type: 'contextfail'}, files);
                 });*/
                /*testo.onerror = function(a,b,c) {

                 var readystateself = this.readyState;
                 var testself = this;
                 var testfile = file.file;
                 debugger;

                 selfContext.processEvent(this, {type: 'contextfail'}, files);
                 };*/
                //testo.src = file.file;

                //window.document.attachEvent('onreadystatechange', function() {
                /*window.document.onerror = function(){

                 var readystateself = this.readyState;
                 var testself = this;
                 var testfile = file.file;
                 debugger;

                 };*/

                //element.onpropertychange = function(a,b,c) {
                //var self = this;
                //var file = file.file;
                //debugger;
                //};
                //var test = new Image();
                //element = document.createElement('img');

                //var doimage = document.createElement('span');
                //document.getElementsByTagName('BODY')[0].appendChild(doimage);

                //doimage.innerHTML = '<img src="http://www.bcbsnc.com/assets/global/js/libs/angular/1.2.0/angular.min.js" onreadystatechange="woot.call(this);" onerror="doit.call(this);">';

                //element.attachEvent('onreadystate', function() {
                element.onload = element.onreadystatechange = function (type) {
                    //element.onload = element.ondataavailable = function (type) {
                    //element.onerrorupdate = element.onactivate = function (type) {
                    var elementsrc = element.src;
                    var bobsrc = bob;
                    var filesrc = file.file;
                    var self = this;
                    var srcie = this.getAttribute('src');
                    var src = this.src;
                    //var file = file.file;
                    var read = this.readyState;
                    var testo = this.ie8_attributes;
                    //var test2 = testo.item();
                    //this.onpropertychange = null;

                    var complete1 = (!(this.readyState));
                    var complete2 = (/loaded/.test(this.readyState) && !/^http/.test(srcie));
                    var complete3 = (/complete/.test(this.readyState) && /^http/.test(srcie));



                    //if (!(this.readyState) || /loaded|complete/.test(this.readyState)) {
                    if (!(this.readyState) || /loaded|complete/.test(this.readyState)) {


                        clearTimeout(timeout);

                        this.onload = this.onreadystatechange = null;

                        var passedType = {type: 'contextfail'};

                        //this function () {
                        //alert('activate='+file.file);
                        //};

                        //var sc = window.document.scripts;

                        //var testself = this;
                        //var testfile = file.file;
                        //debugger;
                        if (file.type === 'js') {

                            if (/loaded/.test(this.readyState) && !/^http/.test(file.file) || /complete/.test(this.readyState) && /^http/.test(file.file)) {

                                passedType.type = 'complete';
                            } else {

                                passedType.type = 'error';
                            }
                        }


                        //debugger;

                        selfContext.processEvent(this, passedType, files, true);
                    } //else {

                    //if (/loaded/.test(this.readyState)) {
                    //selfContext.processEvent(this, {type: 'error'}, files, true);
                    //}
                    //}
                    //};
                };

                //document.getElementsByTagName('BODY')[0].appendChild(element);

                //test.onerror = function(){
                //var testo = this;
                //debugger;
                //selfContext.processEvent(this, {type: 'error'}, files, true);
                //};

                //test.src = file.file;

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
                alert('fallback');
                selfContext.processEvent(element, {type: 'contextfail'}, files);
            }
        };

        /**
         * Process load and error events for a file, then start the process over for the next.
         * @param domContext
         * @param type
         * @param files
         * @param checkLength
         */
        Initialize.prototype.processEvent = function (domContext, type, files, checkLength) {

            var file            = files.shift(),
                //isError         = (type && (type.type === 'error' || type.type === 'timeout' || type.type === 'waiting')),
                isError         = (type && (type.type === 'error' || type.type === 'timeout')),
                callback        = (isError) ? file.error : file.success,
                returnData      = [type.type, (file.file||null), (_parent.filesToLoad.slice(0)||null)],
                globalError     = getObjData('error'),
                globalSuccess   = getObjData('success'),
                globalScripts   = getObjData('scripts'),
                globalOther     = getObjData('other'),
                globalUpdate    = (_parent.update && _parent.update.length)? _parent.update : null;
            //globalUpdate    = (_parent.update && _parent.update.callbacks.length)? _parent.update : null;//getObjData('update');

            //exposeContext   = getObjData('exposeContext'),
            //exposeContextErr= getObjData('exposeContextError');
            if(type.type !== 'waiting' && file.type === 'js') {
                //setObjData('other', (getObjData('other') + 1));

                var one = window.document.scripts.length,
                    two = globalScripts,
                    three = getObjData('other'),
                    four = window,
                    five = window.document,
                    six = file.file,
                    seven = domContext.readyState,
                    eight = domContext;

                //debugger;
            }

            if (checkLength && type.type !== 'waiting' && two < one ) {
                //isError = true;
                //callback = file.error;
                //returnData[0] = 'error';
            }

            if (domContext && domContext.parentNode && file.type === 'js') {

                if(type.type !== 'waiting'){
                    setObjData('other', window.document.scripts.length);

                }


                //domContext.parentNode.removeChild(domContext);
            }



            files = this.checkFilesToLoad(files);

            if (callback) {

                //returnData.push(file.file);
                callback.apply(domContext, returnData);
            }

            //if (globalUpdate && globalUpdate.callback) {
            /*if (globalUpdate) {

             if (type.type === 'waiting') {

             returnData.push(_parent.filesToLoad.slice(0));
             }

             //globalUpdate.callback.apply(globalUpdate.context, returnData);

             while (globalUpdate.callbacks.length) {
             globalUpdate.callbacks.shift().apply(globalUpdate.context, returnData);
             }
             }*/

            if (globalUpdate) {

                for (var i=0; i<globalUpdate.length; i++) {

                    globalUpdate[i].apply(_parent, returnData);
                }
            }

            //console.log(_parent.update.slice(0));
            //console.log(returnData);

            if (type.type === 'waiting') {

                return;
            }

            //if (isError && getObjData('errorActive')) {
            //if (isError && getObjData('error')) {
            //console.log('test = '+getObjData('error'));
            //console.log(globalError);
            var testtype = type.type;
            debugger;

            if (isError) {


                if (globalError) {

                    globalError.apply(_parent, returnData);
                }

                //if (globalError && globalError.callback) {

                //globalError.callback.apply(globalError.context, returnData);
                //}

                return;
            }

            //this.exposeContext.error.apply(this.exposeContext, returnData);

            //if (exposeContext) {

            //exposeContext.error.apply(exposeContext, returnData);
            //}


            //   return;
            // }

            if (files.length) {

                this.checkQueue(files);

            } else {

                //if (getObjData('successActive')) {
                //if (globalSuccess && globalSuccess.callback) {
                if (globalSuccess) {

                    globalSuccess.apply(globalSuccess, returnData);
                    //globalSuccess.callback.apply(globalSuccess.context, returnData);
                    //this.exposeContext.success.apply(this.exposeContext, returnData);
                    //exposeContext.success.apply(exposeContext, returnData);
                }
            }
        };

        /**
         * Get initialized data.
         * @param key
         * @returns {*|null}
         */
        function getObjData (key) {

            //return (_parent.__data__[_id] && _parent.__data__[_id][key] || null);
            return (_parent.__data__[_id] && _parent.__data__[_id][key])? _parent.__data__[_id][key] : null;
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
         * @type {{complete: Function, success: Function, error: Function}}
         */
        Expose.prototype = {

            update: function (callback) {

                if (!_parent.update) {

                    _parent.update = [];
                }

                _parent.update.push(callback);
                //_parent.update.push(function(){ callback.apply(this, arguments); });
                return this;
            },

            complete: function (success, error) {

                this.success(success);
                this.error(error);
                return this;
            },

            success: function (success) {

                //this.success = function () {
                //    success.apply(this, arguments);
                //};

                //setObjData('successActive', true);
                //var self = this;
                //setObjData('successActive', {callback:success, context:self});
                setObjData('success', success);
                return this;
            },

            error: function (error) {
                //console.log(error);
                //this.error = function () {
                //    error.apply(this, arguments);
                //};

                //setObjData('errorActive', true);
                //var self = this;
                //setObjData('errorActive', {callback:error, context:self});
                setObjData('error', error);
                return this;
            },

            wait: function () {

                setObjData('wait', convertArguments.apply(this, arguments));
                return this;
            }
        };

        //_parent.__data__ = {};
        //_parent.__data__[_id] = {};

        return new Expose(_settings.files);
    };

})(this);