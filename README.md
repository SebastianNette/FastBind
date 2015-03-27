# FastBind

After several testings, I have noticed that calling bound functions is really slow compared to calling unbound functions.
But it didn't make any sense to me since .call and .apply are pretty close to the speed of calling an unbound function.

To overcome this issue, I have rewritten the way bind() works.

For some perfs, see:
http://jsperf.com/fastbindjs-vs-native-bind

## How it works! ##

There are several tests made to ensure that we get the best binding speed.

1. Internet Explorer treats "new Function" as bad as eval, so we test the useragent and in case of IE, we simply return the native bind and don't attempt to speed things up.
2. If no context is passed to the bind function, we will just return the original function.
3. If the function string contains "arguments" or "native code" we will use the native bind method. (Checking the arguments callee length and comparing it to the arguments length is slightly slower than the native binding)
4. And now the magic: If we do not need to know about the arguments length, then we simply count the number of parameters and arguments, create a new function in our factory (if not already created before), which then blitz calls the original function within the context. This is 96% faster than using the native bind.

This is incredible useful for huge scripts that need to call many bound functions during update calls.
It is also supposed to work in node.js
