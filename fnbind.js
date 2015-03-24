Function.prototype.bind = (function()
{
    // function stack
    var fnStack = [
        function (fn,ctx) { return function () { fn.call(ctx); } },
        function (fn,ctx) { return function (a) { fn.call(ctx,a); } },
        function (fn,ctx) { return function (a,b) { fn.call(ctx,a,b); } },
        function (fn,ctx) { return function (a,b,c) { fn.call(ctx,a,b,c); } },
        function (fn,ctx) { return function (a,b,c,d) { fn.call(ctx,a,b,c,d); } },
        function (fn,ctx) { return function (a,b,c,d,e) { fn.call(ctx,a,b,c,d,e); } },
        function (fn,ctx) { return function (a,b,c,d,e,f) { fn.call(ctx,a,b,c,d,e,f); } }
    ];
    
    var regexp = /,/g;
    var countArgs = function (fn) {
        var str = fn.toString();
            str = str.substring(str.indexOf("(")+1, str.indexOf(")"));
        return !str ? 0 : (1 + (str.length - str.replace(regexp, '').length));
    };

    // toString test
    var test = (function () { try { return countArgs(function (a,b){}) === 2; } catch(e) { return false; } })();
        
    // original bind
    var bind = Function.prototype.bind || function (ctx) {
        var self = this;
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return self.apply(ctx || null, args);
        };
    };
    
    // actual bind
    return function (ctx)
    {
        // if toString failed, use regular bind
        if(!test)
        {
            return bind.call(this, ctx);
        }
        
        // count number of parameters
        var n = countArgs(this);
        
        // create function in stack if not exist
        if(!fnStack[n] || typeof fnStack[n] !== 'function')
        {
            var args = [];
            for(var i = 0; i < n; i++)
            {
                args.push("v"+i);
            }
            
            var params = args.join(",");
            
            // takes fn & context as parameters, returns a bound function that is using .call() instead of slicing arguments and calling .apply()
            fnStack[n] = new Function("return function(fn, ctx) { return function(" + params + ") { fn.call(ctx" + (params ? ", " + params : "") + "); }; };")();
        }
        
        // return bound fn
        return fnStack[n](this, ctx || null);
    };
})();
