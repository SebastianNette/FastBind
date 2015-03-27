Function.prototype.bind = (function()
{
    // original bind
    var bind = Function.prototype.bind;

    // function stack
    var fnStack = [];
    
    var regexp = /,/g;

    // counts the parameters of the function
    var countArgs = function (str)
    {
        str = str.substring( str.indexOf("(") + 1, str.indexOf(")") );
        return !str ? 0 : (1 + (str.length - str.replace(regexp, '').length));
    };

    // lets ust make sure that this counts the parameters correctly
    var test = (function () {
        try {
            return countArgs((function (a,b){}).toString()) === 2;
        } catch(e) {
            return false;
        }
    })();

    // get the userAgent or empty string if in node
    var ua = (typeof module !== 'undefined' && module.exports) ? "" : navigator.userAgent;

    // IE's bind is faster than this bind, so use it instead
    if(!test || /MSIE (\d+\.\d+);/.test(ua) || !!ua.match(/Trident.*rv[ :]*11\./))
    {
        return bind || function (ctx)
        {
            var self = this;
            return function ()
            {
                var args = Array.prototype.slice.call(arguments);
                return self.apply(ctx || null, args);
            };
        };
    }

    // fn factory
    var factory = [

        // [0] -> no callee check
        [
            // [0][0] -> no callee check, args
            [
                "return function(c,$1) {",
                "   var f = this;",
                "   return function($3) {",
                "       return f.call(c,$1$2);",
                "   };",
                "};"
            ].join("\n"),

            // [0][1] -> no callee check, no args
            [
                "return function(c) {",
                "   var f = this;",
                "   return function($3) {",
                "       return f.call(c$2);",
                "   };",
                "};"
            ].join("\n")
        ],

        // [1] -> callee check
        [
            // [1][0] -> callee check, args
            [
                "return function(c,$1) {",
                "   var f = this;",
                "   return function($3) {",
                "       if(arguments.callee.length !== arguments.length) {",
                "           var args = Array.prototype.slice.call(arguments);",
                "               args.unshift($1);",
                "           return f.apply(c,args);",
                "       }",
                "       return f.call(c,$1$2);", 
                "   };",
                "};"
            ].join("\n"),

            // [1][1] -> callee check, no args
            [
                "return function(c) {",
                "   var f = this;",
                "   return function($3) {",
                "       if(arguments.callee.length !== arguments.length) {",
                "           return f.apply(c,arguments);",
                "       }",
                "       return f.call(c$2);",
                "   };",
                "};"
            ].join("\n")
        ]
    ];
    
    // actual bind
    return function ()
    {
        var numArgs = arguments.length;
        
        // no arguments -> useless, return function
        if( !numArgs ) {
            return this;
        }

        // fn to string
        var str = this.toString();

        // if the function has either native code or arguments in it, we will check the callee
        var c = ((str.indexOf("native code") !== -1 || str.indexOf("arguments") !== -1)) ? 1 : 0;

        // yea.. the callee length arguments length comparison takes too long, lets just use native for now
        if( c && bind ) {
            return bind.apply(this, arguments);
        }
        
        // count number of parameters
        var n = countArgs(str);
        var k = numArgs - 1;
        
        // get fn for arguments length
        fnStack[c] = fnStack[c] || [];
        fnStack[c][k] = fnStack[c][k] || [];
        
        // create function in stack if not exist
        if(!fnStack[c][k][n] || typeof fnStack[c][k][n] !== 'function')
        {            
            var args = "", params = "", fn;
            for(var i = n+k; i > 0; i--)
            {
                if(i <= k) {
                    args += ",a" + i;
                } else {
                    params += ",p" + i;
                }
            }
            
            // fn factory...
            if( k > 0 ) {
                fn = factory[c][0];
                fn = fn.replace(/\$1/g, args.substring(1));
                fn = fn.replace('$2', params).replace('$3', params.substring(1));
            } else {
                fn = factory[c][1];
                fn = fn.replace('$2', params).replace('$3', params.substring(1));
            }
            
            fnStack[c][k][n] = new Function(fn)();
        }
                
        // return bound fn
        return fnStack[c][k][n].apply(this, arguments);
    };
})();
