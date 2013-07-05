/*
* SimpleLoadFile Method
* Copyright 2013, CDCabrera, menotyou.com
* licensed under MIT license, http://opensource.org/licenses/mit-license.php
*
* Aspects of the event creation were utilized from jQuery's ajaxTransport
* jQuery is licensed under the MIT license, http://opensource.org/licenses/mit-license.php
*/
/*
 settings in the form of any array of objects or a single object
 {
 file      : 'string',              //-- string,     your file name and path
 type      : 'css|js',              //-- string,     "css" for css files or "js" for js files - this is optional, if left off it'll simply look for file extensions, not the most reliable method
 global    : boolean,               //-- bool,       only applies to js files and browsers capable of handling the scoping functionality. do you want scoped js loading or do you want global js loading
 cache     : boolean,               //-- bool,       cache the file or not
 success   : function,              //-- function,   success callback
 error     : function,              //-- function,   error callback... only applies to JS loading and browsers capable of handling the scoped functionality
 timeout   : milliseconds           //-- int,        number of milliseconds to timeout the loading - this is optional, defaults to 10 seconds otherwise, fires the "error" callback
 }
*/

(function(window, undefined){
    var lf = window.simpleloadfile = function( _settings )
    {
        if(!_settings)
        {
            return;
        }

        _settings = (Object.prototype.toString.call(_settings) == '[object Array]')? _settings : [_settings];

        var _self   = this,
            _timeout= 10000;

        _que( _settings );

        if( lf.active )
        {
            return;
        }

        lf.active = true;
        lf.current = lf.que.shift();

        _setup(lf.current);

        //-- setup the que
        function _que( settings )
        {
            if( !lf.que )
            {
                lf.que = [];
            }
            for(var i=0; i<settings.length; i++)
            {
                var temp = settings[i];

                if( !temp.qued )
                {
                    temp.qued = true;
                    temp.cache = (temp.cache == undefined || temp.cache)? true : false;
                    temp.file = (typeof temp.file == 'string')? temp.file.replace(/\s+$/,'') : '';
                    temp.type = (temp.type)? temp.type : ((/\.js.*$/i).test(temp.file))? 'js': 'css';
                    temp.global = (temp.global)? true : false;
                    temp.success = (temp.success)? temp.success : null;
                    temp.error = (temp.error)? temp.error : null;
                    temp.timeout = (temp.timeout)? temp.timeout : _timeout;

                    if( !temp.cache )
                    {
                        temp.file += '{0}simpleloadfile={1}'.replace('{0}',((/\?.*\=/).test(temp.file)?'&':'?')).replace('{1}', (10000*Math.random()));
                    }

                    lf.que.push(temp);
                }
            }
        }

        //-- setup elements and events
        function _setup( current )
        {
            var element = (current.type == 'js')? document.createElement('script') : document.createElement('link'),
                head    = (document.head || document.getElementsByTagName('head')[0] || document.documentElement),
                timeout = setTimeout(function(){ element.onload( {type:'timeout'} ); }, _timeout),
                fallback= false;

            if(current.type == 'js')
            {
                element.async = true;
                element.src = current.file;
                current.prewindow = _getproperties(window);
            }
            else
            {
                element.rel = 'stylesheet';
                element.href = current.file;
            }

            if( 'hasOwnProperty' in element && 'onload' in element )
            {
                element.onerror = element.onload = function(type)
                {
                    clearTimeout(timeout);
                    this.onerror = this.onload = null;
                    var self = this;
                    setTimeout(function(){ _process.call(self, type, current); },1); //-- bypass debugger issue
                }
            }
            else if(element.readyState)
            {
                element.onload = element.onreadystatechange = function(type)
                {
                    if( !(this.readyState) || /loaded|complete/.test( this.readyState ) )
                    {
                        clearTimeout(timeout);
                        this.onload = this.onreadystatechange = null;
                        _process.call(this, {type:'contextfail'}, current);
                    }
                };
            }
            else
            {
                clearTimeout(timeout);
                fallback = true;
            }

            if(current.type == 'js')
            {
                head.insertBefore(element, head.firstChild);
            }
            else
            {
                head.appendChild(element);
            }

            if(fallback)
            {
                _process.call(element, {type:'contextfail'}, current);
            }
        }

        //-- process events
        function _process( type, current )
        {
            var callback = (type && (type.type == 'error' || type.type == 'timeout'))? current.error : current.success,
                difference;

            if ( this.parentNode && current.type == 'js' )
            {
                this.parentNode.removeChild( this );
            }

            if(callback)
            {
                difference = (type && type.type == 'load' && current.type == 'js' && current.global === false)? _difference(current) : null;
                callback.call(this, difference, type.type, current.file);
            }

            lf.active = false;

            if(lf.que.length)
            {
                lf.call(_self, lf.que);
            }
        }

        //-- return difference between prev and post window
        function _difference(current)
        {
            var data    = null,
                pre     = current.prewindow,
                post    = _getproperties(window);

            if(post.__length__ > pre.__length__)
            {
                data = {};

                for(var prop in post)
                {
                    if( !(prop in pre) )
                    {
                        if( post[prop] != undefined )
                        {
                            data[prop] = post[prop];
                            window[prop] = undefined; //-- consistently works
                        }
                    }
                }
            }
            return data;
        }

        //-- process properties
        function _getproperties( o )
        {
            var props = {__length__:0};

            if( 'hasOwnProperty' in o )
            {
                for( var prop in o )
                {
                    if( o.hasOwnProperty(prop) )
                    {
                        props[prop] = o[prop];
                        props.__length__ += 1;
                    }
                }
            }
            return props;
        }
    };
})(this);