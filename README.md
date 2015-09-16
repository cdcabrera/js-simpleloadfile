#JS.Simple Load File or Resource Load

A resource loader for JS and CSS files.

##The NEW...

Updated to provide a group of chained methods, and a loaded property. This includes a success, error, a
global update, and a wait que.



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


Going crazy... creating 2 instances of resource load, the first with a "wait" for another
resource loader that fires the ID "jQuery".

```javascript

resourceLoad('//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js')
        .wait('jQuery');

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

```


###Known Issues

~~Using a combination of CSS and JS files within the same resource loader appears to cause a slight
rearrangement of load order. In testing it appears that the CSS files are the ones out of order.
Continuing to look for a patch on this one...~~ As of 20150206 this appears to be a non-issue with
the latest patch.

~~In testing IE8 there appeared a 5% failure rate on a battery of rapid reloads. However, other
factors could have played a role since the failure appeared inconsistently.~~ As of 20150206 this
appears to be a non-issue with the latest patch.

Currently, none.


###Browser Compatibility

Works in Firefox, Chrome, Opera, Safari, and IE 8+.

IE8 doesn't play well with events on script and link tags. For JS files IE8 returns 3 event types with this
plugin: "load", "error", and "timeout". The "error" event is a workaround based on a window.event
handler that runs parallel to the "onreadystatechange" event.

The original loader supported IE7, this time around I bypassed that testing. IE7 and other unsupported/untested/older
browsers may work correctly, but they also have the potential to fire the incorporated fallback and simply receive a
loaded file and "contextfail" message within callback parameters.


###License

My aspect is released under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).

I did reference aspects of the jQuery 1.8 API ajaxTransport "cross domain" method for handling script
loading. However, alterations were made based on the way IE loves to fire readystate and onload.
jQuery is copyrighted Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors. And jQuery is
licensed under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).

Utilized an aspect of [Pete Otaqui's](https://github.com/pete-otaqui) [Gist on CSS File Loading](https://gist.github.com/pete-otaqui/3912307)
to apply event types for CSS loads in IE8.

It happened that I used a similar concept, and method name when utilizing "wait" as
[LABjs](https://github.com/getify/LABjs). LABjs is licensed under the
[MIT License](http://en.wikipedia.org/wiki/MIT_License).