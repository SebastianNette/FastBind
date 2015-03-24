Function.prototype.bind = (function()
{
    // function stack
    var fnStack = [];
    
    // actual bind
    return function( context )
    {
        // count number of parameters
        var n = this.toString().split(")")[0].split(",").length;
        
        // create function in stack if not exist
        if(fnStack[n] === undefined)
        {
            var args = [];
            for( var i = 0; i < n; i++ )
            {
                args.push("v"+i);
            }
            
            var params = args.join(",");
            
            // takes fn & context as parameters, returns a bound function that is using .call() instead of slicing arguments and calling .apply()
            fnStack[n] = new Function("return function(fn, context) { return function(" + params + ") { fn.call(context" + (params ? ", " + params : "") + "); }; };")();
        }
        
        // return bound fn
        return fnStack[n](this, context || null);
    };
})();
