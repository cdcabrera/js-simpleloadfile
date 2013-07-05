<h1>JS.Simple Load File</h1>
<p>
    Experimental bit of JS to load scripts in a scoped manner. Included a simple CSS file loading method as well.
</p>

<h2>How it works</h2>
<p>
    This API independent method uses the appended script element to the document header process. As pretty much all front-end
    developers know this enables you to load a JS file cross domain.
    The difference between the current way of handling script appending and this method is that this method attempts to return
    the newly loaded script in a scoped manner through the optional callback.
</p>
<p>
    It works by comparing a pre-window object with a post-window object reference. This method has
    potential for race conditions with scripts loaded through different methods. However, in testing and personal
    projects I've yet to experience this. It could also be pointed out that if you use this method for all of your
    script loading the aforementioned concern isn't really one because of the built in sequence loading and timeout
    the method provides, maybe.
</p>

<h2>Known Issues</h2>
<p>
    The only issue that's popped up has to do with setting a breakpoint/debugger call in Firebug, within the callbacks, for
    dynamically loaded CSS files in versions of Firefox that support "onload" and "onerror" when applied to link elements.
    I did fix/bypass the problem and it could have been entirely on Firebug in this case, but then again maybe not.
</p>


<h2>Browser compatibility</h2>
<p>
    Works in Firefox, Chrome, Opera, Safari, and IE 9+. IE 7-8 and other unsupported/older browsers simply receive a globally
    loaded script and "contextfail" message in the callbacks.
</p>

<h2>License</h2>
<p>
    My aspect is released under the <a href="http://opensource.org/licenses/mit-license.php">MIT License</a>.
</p>

<p>
    I did reference aspects of the jQuery 1.8 API ajaxTransport "cross domain" method for handling script
    loading. However, alterations were made based on the way IE loves to fire readystate and onload.
    jQuery is copyrighted Copyright 2005, 2013 jQuery Foundation, Inc. and other contributors. And jQuery is
    licensed under the <a href="http://opensource.org/licenses/mit-license.php">MIT License</a>.
</p>
