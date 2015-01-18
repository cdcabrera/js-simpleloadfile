#JS.Simple Load File or ResourceLoad

A resource loader for JS and CSS files.

##The NEW...

Updated to provide a group of chained methods, and a loaded property. This includes a success, error, and a wait que.



###How it works

Basic setup...

```javascript

resourceLoad('http://code.jquery.com/jquery-1.11.2.min.js');
```

Slightly more advanced... adding an ID.

```javascript

resourceLoad({
        id:'jQuery',
        file:'http://code.jquery.com/jquery-1.11.2.min.js'
    })
    .success(function(a,b,c){
        console.log(arguments);
    })
    .error(function(a,b,c){
        console.log(arguments);
    });
```


Going crazy... creating 2 instances of resource load, the second with a "wait"

```javascript

var resources = [
    '//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css',
    {
        id:'jQuery',
        file:'http://code.jquery.com/jquery-1.11.2.min.js',
        success: function(a,b,c) {
            // file specific success callback
            console.log(arguments);
        }
    }
];

resourceLoad(resources)
        .update(function (a,b,c) {
            console.log(arguments);
        })
        .success(function(a,b,c){
            console.log(arguments);
        })
        .error(function(a,b,c){
            console.log(arguments);
        });


resourceLoad('//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js')
        .wait('jQuery');
```


###Known Issues

In testing IE8 there appeared a 5% failure rate on a battery of rapid refresh test loading. However, other
factors could have played a role, as the failure appeared inconsistently.

The technique used to determine whether IE8 is firing an error or a load event for JS files is based on local and
cross domain locations. Where "load" is fired on local files and "complete" is fired on cross domain files. Whether
this is consistent remains to be seen, but this is still a potential failure point.


###Browser Compatibility

Works in Firefox, Chrome, Opera, Safari, and IE 8+. On certain aspects IE 8 and other unsupported/older browsers
simply receive a globally loaded script and "contextfail" message within callback parameters.






##The Original Load File was...

An experimental bit of JS to load scripts in a scoped manner. Included a simple CSS file loading method as well.


###How it worked

This API independent method uses the appended script element to the document header process. As pretty much all front-end
developers know this enables you to load a JS file cross domain.
The difference between the current way of handling script appending and this method is that this method attempts to return
the newly loaded script in a scoped manner through the optional callback.


It works by comparing a pre-window object with a post-window object reference. This method has
potential for race conditions with scripts loaded through different methods. However, in testing and personal
projects I've yet to experience this. It could also be pointed out that if you use this method for all of your
script loading the aforementioned concern isn't really one because of the built in sequence loading and timeout
the method provides, maybe.


###Known Issues

The only issue that's popped up has to do with setting a breakpoint/debugger call in Firebug, within the callbacks, for
dynamically loaded CSS files in versions of Firefox that support "onload" and "onerror" when applied to link elements.
I did fix/bypass the problem and it could have been entirely on Firebug in this case, but then again maybe not.



###Browser Compatibility

Works in Firefox, Chrome, Opera, Safari, and IE 9+. IE 7-8 and other unsupported/older browsers simply receive a globally
loaded script and "contextfail" message in the callbacks.


##License

My aspect is released under the <a href="http://en.wikipedia.org/wiki/MIT_License">MIT License</a>.

I did reference aspects of the jQuery 1.8 API ajaxTransport "cross domain" method for handling script
loading. However, alterations were made based on the way IE loves to fire readystate and onload.
jQuery is copyrighted Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors. And jQuery is
licensed under the <a href="http://en.wikipedia.org/wiki/MIT_License">MIT License</a>.
