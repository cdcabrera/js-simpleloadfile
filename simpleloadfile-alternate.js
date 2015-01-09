(function(window, undefined) {

    'use strict';

    window.resourceLoad = (function (window, undefined){

        var _settings = {
            timeout: 10000
        };


        function Initialize ( context, files ) {

            this.exposeContext = context;
            this.setup(files);
        }


        Initialize.prototype.setup = function ( files ) {

            files = (Object.prototype.toString.call(files) == '[object Array]')? files : [{file:files}];

            var setupQue= [],
                timeout = _settings.timeout;

            for (var i=0; i<files.length; i++) {

                var tempObj = {},
                    file    = ( typeof files[i] === 'string' )? {file:files[i]} : files[i];

                tempObj.cache = (file.cache === undefined || file.cache)? true : false;
                tempObj.file = (typeof file.file === 'string')? file.file.replace(/\s+$/,'') : '';
                tempObj.type = (file.type)? file.type.toLowerCase() : ((/\.js.*$/i).test(file.file))? 'js': 'css';
                tempObj.success = (file.success)? file.success : null;
                tempObj.error = (file.error)? file.error : null;
                tempObj.timeout = (file.timeout)? file.timeout : timeout;

                if ( !tempObj.cache ) {
                    tempObj.file += '{0}resourceLoad={1}'.replace('{0}',((/\?.*\=/).test(tempObj.file)?'&':'?')).replace('{1}', (1e5*Math.random()));
                }

                setupQue.push(tempObj);
            }

            this.que( setupQue );
        };


        Initialize.prototype.que = function ( files ) {

            this.loadFiles( files );
        };


        Initialize.prototype.loadFiles = function ( files ) {

            var selfContext = this,
                file        = files[0],
                element     = (file.type === 'js')? document.createElement('script') : document.createElement('link'),
                head        = (document.head || document.getElementsByTagName('head')[0] || document.documentElement),
                timeout     = setTimeout(function(){ element.onload( {type:'timeout'} ); }, file.timeout),
                fallback    = false;

            switch ( file.type )
            {
                case 'js':
                    element.async = true;
                    element.src = file.file;
                    break;

                case 'css':
                    element.rel = 'stylesheet';
                    element.href = file.file;
                    break;
            }


            if ( 'hasOwnProperty' in element && 'onload' in element ) {

                element.onerror = element.onload = function (type) {

                    clearTimeout(timeout);

                    this.onerror = this.onload = null;

                    var self = this;

                    setTimeout(function (){ selfContext.processEvent(self, type, files); },0);
                };

            } else if ( element.readyState ) {

                element.onload = element.onreadystatechange = function (type) {

                    if( !(this.readyState) || /loaded|complete/.test( this.readyState ) ) {

                        clearTimeout(timeout);

                        this.onload = this.onreadystatechange = null;

                        selfContext.processEvent(this, {type:'contextfail'}, files);
                    }
                };

            } else {

                clearTimeout(timeout);
                fallback = true;
            }


            switch ( file.type )
            {
                case 'js':
                    head.insertBefore(element, head.firstChild);
                    break;

                default:
                    head.appendChild(element);
                    break;
            }


            if ( fallback ) {

                selfContext.processEvent(element, {type:'contextfail'}, files);
            }

        };



        Initialize.prototype.processEvent = function ( domContext, type, files ) {

            var file        = files.shift(),
                isError     = (type && (type.type === 'error' || type.type === 'timeout')),
                callback    = (isError)? file.error : file.success;

            if ( domContext.parentNode && file.type === 'js' ) {

                domContext.parentNode.removeChild( domContext );
            }

            if ( callback ) {
                
                callback.call(domContext, type.type, file.file);
            }

            if ( isError && this.exposeContext.error ) {

                this.exposeContext.error.call(this.exposeContext, type.type);
                return;
            }

            if ( files.length ) {

                this.que( files );

            } else {

                if( this.exposeContext.success ) {

                    this.exposeContext.success.call(this.exposeContext, type.type);
                }
            }
        };



        return {

            load: function (files) {

                new Initialize(this, files);
                return this;
            },

            complete: function (success, error) {

                this.success = function() { success.apply(this, arguments) };
                this.error = function() { error.apply(this, arguments) };
                return this;
            },

            success: function (success) {

                this.success = function() { success.apply(this, arguments) };
                return this;
            },

            error: function (error) {

                this.error = function() { error.apply(this, arguments) };
                return this;
            }
        };

    })(this);

})(this);