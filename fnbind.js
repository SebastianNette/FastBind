Function.prototype.bind = (function()
{
    // function stack
    var fnStack = [];
    
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
        var m = arguments.length;
        
        // no arguments -> useless, return function
        if(!m) return this;
        
        var args;
        
        // more than 1 argument -> apply
        if(m > 1) args = Array.prototype.slice.call(arguments);
        
        // if toString failed, use regular bind
        if(!test) return bind.apply(this, Array.prototype.slice.call(arguments));
        
        // count number of parameters
        var n = countArgs(this);
        var k = m - 1;
        
        // get fn for arguments length
        fnStack[k] = fnStack[k] || [];
        
        // create function in stack if not exist
        if(!fnStack[k][n] || typeof fnStack[k][n] !== 'function')
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
            fnStack[k][n] = new Function("return function(f,c"+_args+"){return function("+_params.substring(1)+"){if(arguments.callee.length!==arguments.length){"+(_args?("var a=Array.prototype.slice.call(arguments); a.unshift("+_args.substring(1)+");return f.apply(c,a);"):"return f.apply(c,Array.prototype.slice.call(arguments));")+"}else{return f.call(c"+_args+_params+");}};};")();
        }
                
        // return bound fn
        if(args) {
            args.unshift(this);
            return fnStack[k][n].apply(null, args);
        }
        return fnStack[k][n](this, ctx || null);
    };
})();
