Function.prototype.bind = (function()
{
    // function stack
    var fnStack = [];
    
    var regexp = /,/g;
    var countArgs = function (str) {
        str = str.substring(str.indexOf("(")+1, str.indexOf(")"));
        return !str ? 0 : (1 + (str.length - str.replace(regexp, '').length));
    };

    // toString test
    var test = (function () { try { return countArgs((function (a,b){}).toString()) === 2; } catch(e) { return false; } })();

    // ua check
    var ua = (typeof module !== 'undefined' && module.exports) ? "" : navigator.userAgent;

    // IE's bind is faster than this bind, so use it instead
    if(!test || /MSIE (\d+\.\d+);/.test(ua) || !!ua.match(/Trident.*rv[ :]*11\./))
    {
        return Function.prototype.bind || function (ctx) {
            var self = this;
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return self.apply(ctx || null, args);
            };
        };
    }
    
    // actual bind
    return function (ctx)
    {
        var m = arguments.length;
        
        // no arguments -> useless, return function
        if(!m) return this;
        
        var args;
        
        // more than 1 argument -> apply
        if(m > 1) args = Array.prototype.slice.call(arguments);

        // fn to string
        var str = this.toString();

        // more tests
        var callee = ((str.indexOf("native code") !== -1 || str.indexOf("arguments") !== -1)) ? 1 : 0;
        
        // count number of parameters
        var n = countArgs(str);
        var k = m - 1;
        
        // get fn for arguments length
        fnStack[callee] = fnStack[callee] || [];
        fnStack[callee][k] = fnStack[callee][k] || [];
        
        // create function in stack if not exist
        if(!fnStack[callee][k][n] || typeof fnStack[callee][k][n] !== 'function')
        {            
            var _args = "", _params = "";
            for(var i = n+k; i > 0; i--)
            {
                if(i <= k) {
                    _args += ",a" + i;
                } else {
                    _params += ",p" + i;
                }
            }
            
            // fn factory...
            fnStack[callee][k][n] = new Function("return function(f,c"+_args+"){return function("+_params.substring(1)+"){"+(callee ? ("if(arguments.callee.length!==arguments.length){"+(_args?("var a=Array.prototype.slice.call(arguments);a.unshift("+_args.substring(1)+");return f.apply(c,a);"):"return f.apply(c,Array.prototype.slice.call(arguments));")+"}else{"):"return f.call(c"+_args+_params+");") + (callee?"}":"")+"};};")();
        }
                
        // return bound fn
        if(args) {
            args.unshift(this);
            return fnStack[callee][k][n].apply(null, args);
        }
        return fnStack[callee][k][n](this, ctx || null);
    };
})();
