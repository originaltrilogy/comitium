/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-flexboxlegacy-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-mq-cssclasses-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function D(a){j.cssText=a}function E(a,b){return D(n.join(a+";")+(b||""))}function F(a,b){return typeof a===b}function G(a,b){return!!~(""+a).indexOf(b)}function H(a,b){for(var d in a){var e=a[d];if(!G(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function I(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:F(f,"function")?f.bind(d||b):f}return!1}function J(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return F(b,"string")||F(b,"undefined")?H(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),I(e,b,c))}function K(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)u[c[d]]=c[d]in k;return u.list&&(u.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),u}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),t[a[d]]=!!e;return t}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.8.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={svg:"http://www.w3.org/2000/svg"},s={},t={},u={},v=[],w=v.slice,x,y=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},z=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b)&&c(b).matches||!1;var d;return y("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},A=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=F(e[d],"function"),F(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),B={}.hasOwnProperty,C;!F(B,"undefined")&&!F(B.call,"undefined")?C=function(a,b){return B.call(a,b)}:C=function(a,b){return b in a&&F(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=w.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(w.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(w.call(arguments)))};return e}),s.flexbox=function(){return J("flexWrap")},s.flexboxlegacy=function(){return J("boxDirection")},s.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},s.canvastext=function(){return!!e.canvas&&!!F(b.createElement("canvas").getContext("2d").fillText,"function")},s.webgl=function(){return!!a.WebGLRenderingContext},s.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:y(["@media (",n.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},s.geolocation=function(){return"geolocation"in navigator},s.postmessage=function(){return!!a.postMessage},s.websqldatabase=function(){return!!a.openDatabase},s.indexedDB=function(){return!!J("indexedDB",a)},s.hashchange=function(){return A("hashchange",a)&&(b.documentMode===c||b.documentMode>7)},s.history=function(){return!!a.history&&!!history.pushState},s.draganddrop=function(){var a=b.createElement("div");return"draggable"in a||"ondragstart"in a&&"ondrop"in a},s.websockets=function(){return"WebSocket"in a||"MozWebSocket"in a},s.rgba=function(){return D("background-color:rgba(150,255,150,.5)"),G(j.backgroundColor,"rgba")},s.hsla=function(){return D("background-color:hsla(120,40%,100%,.5)"),G(j.backgroundColor,"rgba")||G(j.backgroundColor,"hsla")},s.multiplebgs=function(){return D("background:url(https://),url(https://),red url(https://)"),/(url\s*\(.*?){3}/.test(j.background)},s.backgroundsize=function(){return J("backgroundSize")},s.borderimage=function(){return J("borderImage")},s.borderradius=function(){return J("borderRadius")},s.boxshadow=function(){return J("boxShadow")},s.textshadow=function(){return b.createElement("div").style.textShadow===""},s.opacity=function(){return E("opacity:.55"),/^0.55$/.test(j.opacity)},s.cssanimations=function(){return J("animationName")},s.csscolumns=function(){return J("columnCount")},s.cssgradients=function(){var a="background-image:",b="gradient(linear,left top,right bottom,from(#9f9),to(white));",c="linear-gradient(left top,#9f9, white);";return D((a+"-webkit- ".split(" ").join(b+a)+n.join(c+a)).slice(0,-a.length)),G(j.backgroundImage,"gradient")},s.cssreflections=function(){return J("boxReflect")},s.csstransforms=function(){return!!J("transform")},s.csstransforms3d=function(){var a=!!J("perspective");return a&&"webkitPerspective"in g.style&&y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},s.csstransitions=function(){return J("transition")},s.fontface=function(){var a;return y('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},s.generatedcontent=function(){var a;return y(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a},s.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},s.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c},s.localstorage=function(){try{return localStorage.setItem(h,h),localStorage.removeItem(h),!0}catch(a){return!1}},s.sessionstorage=function(){try{return sessionStorage.setItem(h,h),sessionStorage.removeItem(h),!0}catch(a){return!1}},s.webworkers=function(){return!!a.Worker},s.applicationcache=function(){return!!a.applicationCache},s.svg=function(){return!!b.createElementNS&&!!b.createElementNS(r.svg,"svg").createSVGRect},s.inlinesvg=function(){var a=b.createElement("div");return a.innerHTML="<svg/>",(a.firstChild&&a.firstChild.namespaceURI)==r.svg},s.smil=function(){return!!b.createElementNS&&/SVGAnimate/.test(m.call(b.createElementNS(r.svg,"animate")))},s.svgclippaths=function(){return!!b.createElementNS&&/SVGClipPath/.test(m.call(b.createElementNS(r.svg,"clipPath")))};for(var L in s)C(s,L)&&(x=L.toLowerCase(),e[x]=s[L](),v.push((e[x]?"":"no-")+x));return e.input||K(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)C(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},D(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return typeof a=="string"?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){c||(c=b);if(k)return c.createElement(a);d||(d=n(c));var g;return d.cache[a]?g=d.cache[a].cloneNode():f.test(a)?g=(d.cache[a]=d.createElem(a)).cloneNode():g=d.createElem(a),g.canHaveChildren&&!e.test(a)&&!g.tagUrn?d.frag.appendChild(g):g}function p(a,c){a||(a=b);if(k)return a.createDocumentFragment();c=c||n(a);var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,g,h="_html5shiv",i=0,j={},k;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){g=!0,k=!0}})();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.mq=z,e.hasEvent=A,e.testProp=function(a){return H([a])},e.testAllProps=J,e.testStyles=y,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+v.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
window.matchMedia=window.matchMedia||function(a){"use strict";var c,d=a.documentElement,e=d.firstElementChild||d.firstChild,f=a.createElement("body"),g=a.createElement("div");return g.id="mq-test-1",g.style.cssText="position:absolute;top:-100em",f.style.background="none",f.appendChild(g),function(a){return g.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',d.insertBefore(f,e),c=42===g.offsetWidth,d.removeChild(f),{matches:c,media:a}}}(document);

/*! Respond.js v1.1.0: min/max-width media query polyfill. (c) Scott Jehl. MIT/GPLv2 Lic. j.mp/respondjs  */
(function(a){"use strict";function x(){u(!0)}var b={};if(a.respond=b,b.update=function(){},b.mediaQueriesSupported=a.matchMedia&&a.matchMedia("only all").matches,!b.mediaQueriesSupported){var q,r,t,c=a.document,d=c.documentElement,e=[],f=[],g=[],h={},i=30,j=c.getElementsByTagName("head")[0]||d,k=c.getElementsByTagName("base")[0],l=j.getElementsByTagName("link"),m=[],n=function(){for(var b=0;l.length>b;b++){var c=l[b],d=c.href,e=c.media,f=c.rel&&"stylesheet"===c.rel.toLowerCase();d&&f&&!h[d]&&(c.styleSheet&&c.styleSheet.rawCssText?(p(c.styleSheet.rawCssText,d,e),h[d]=!0):(!/^([a-zA-Z:]*\/\/)/.test(d)&&!k||d.replace(RegExp.$1,"").split("/")[0]===a.location.host)&&m.push({href:d,media:e}))}o()},o=function(){if(m.length){var b=m.shift();v(b.href,function(c){p(c,b.href,b.media),h[b.href]=!0,a.setTimeout(function(){o()},0)})}},p=function(a,b,c){var d=a.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),g=d&&d.length||0;b=b.substring(0,b.lastIndexOf("/"));var h=function(a){return a.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+b+"$2$3")},i=!g&&c;b.length&&(b+="/"),i&&(g=1);for(var j=0;g>j;j++){var k,l,m,n;i?(k=c,f.push(h(a))):(k=d[j].match(/@media *([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,f.push(RegExp.$2&&h(RegExp.$2))),m=k.split(","),n=m.length;for(var o=0;n>o;o++)l=m[o],e.push({media:l.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/)&&RegExp.$2||"all",rules:f.length-1,hasquery:l.indexOf("(")>-1,minw:l.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:l.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}u()},s=function(){var a,b=c.createElement("div"),e=c.body,f=!1;return b.style.cssText="position:absolute;font-size:1em;width:1em",e||(e=f=c.createElement("body"),e.style.background="none"),e.appendChild(b),d.insertBefore(e,d.firstChild),a=b.offsetWidth,f?d.removeChild(e):e.removeChild(b),a=t=parseFloat(a)},u=function(b){var h="clientWidth",k=d[h],m="CSS1Compat"===c.compatMode&&k||c.body[h]||k,n={},o=l[l.length-1],p=(new Date).getTime();if(b&&q&&i>p-q)return a.clearTimeout(r),r=a.setTimeout(u,i),void 0;q=p;for(var v in e)if(e.hasOwnProperty(v)){var w=e[v],x=w.minw,y=w.maxw,z=null===x,A=null===y,B="em";x&&(x=parseFloat(x)*(x.indexOf(B)>-1?t||s():1)),y&&(y=parseFloat(y)*(y.indexOf(B)>-1?t||s():1)),w.hasquery&&(z&&A||!(z||m>=x)||!(A||y>=m))||(n[w.media]||(n[w.media]=[]),n[w.media].push(f[w.rules]))}for(var C in g)g.hasOwnProperty(C)&&g[C]&&g[C].parentNode===j&&j.removeChild(g[C]);for(var D in n)if(n.hasOwnProperty(D)){var E=c.createElement("style"),F=n[D].join("\n");E.type="text/css",E.media=D,j.insertBefore(E,o.nextSibling),E.styleSheet?E.styleSheet.cssText=F:E.appendChild(c.createTextNode(F)),g.push(E)}},v=function(a,b){var c=w();c&&(c.open("GET",a,!0),c.onreadystatechange=function(){4!==c.readyState||200!==c.status&&304!==c.status||b(c.responseText)},4!==c.readyState&&c.send(null))},w=function(){var b=!1;try{b=new a.XMLHttpRequest}catch(c){b=new a.ActiveXObject("Microsoft.XMLHTTP")}return function(){return b}}();n(),b.update=n,a.addEventListener?a.addEventListener("resize",x,!1):a.attachEvent&&a.attachEvent("onresize",x)}})(this);

window.CF = {
  params: {
    device: {
      hiRes: true
    }
  },
  boundEvents: {
    internalLinks: false
  }
};

CF.immediate = ( function (Modernizr, CF) {
  'use strict';

  var methods = {

    init: function () {
      methods.responsiveModeSet();
      // methods.hiResCheck();
    },

    responsiveModeSet: function () {
      var html = document.querySelector('html');
      // var windowWidth = $(window).width();
      if ( Modernizr.mq('only screen and (min-width: 960px)') ) {
        CF.params.device.relativeSize = 'x-large';
      } else if ( Modernizr.mq('only screen and (min-width: 768px)') ) {
        CF.params.device.relativeSize = 'large';
      } else if ( Modernizr.mq('only screen and (min-width: 500px)') ) {
        CF.params.device.relativeSize = 'medium';
      } else {
        CF.params.device.relativeSize = 'small';
      }
      html.setAttribute('data-relative-size', CF.params.device.relativeSize);
      if ( html.classList ) {
        html.classList.remove('small');
        html.classList.remove('medium');
        html.classList.remove('large');
        html.classList.remove('x-large');
        html.classList.add(CF.params.device.relativeSize);
      } else {
        html.className = html.className.replace(new RegExp('(^|\\b)' + html.split(' ').join('|') + '(\\b|$)', 'gi'), ' ') + ' ' + CF.params.device.relativeSize;
      }
      // if ( !Modernizr.mq('only all') ) {
      //   $.ajax({
      //     url: 'app/skins/default/source/js/lib/respond.min.js',
      //     data: 'script'
      //   });
      // }
    }//,
  //
  //  hiResCheck: function () {
  //    // Check for high resolution displays and provide CSS/JS hooks for them
  //    if ( Modernizr.mq('(min-resolution: 192dpi), (-webkit-min-device-pixel-ratio: 2), (min--moz-device-pixel-ratio: 2), (-o-min-device-pixel-ratio: 2/1), (min-device-pixel-ratio: 2), (min-resolution: 2dppx)') ) {
  //      $('html').addClass('hi-res');
  //      CF.params.device.hiRes = true;
  //    }
  //  }
  //
  };

  //  Public methods
  return {
    init: methods.init,
    responsiveModeSet: methods.responsiveModeSet
  };

})(Modernizr, CF);

CF.immediate.init();

CF.discussion = ( function (Modernizr, CF) {
  'use strict';
  var methods = {

      init: function () {
        
      }

    };

  //  Public methods
  return {
    init: methods.init
  };

})(Modernizr, CF);

CF.discussions = ( function (Modernizr, CF) {
  'use strict';

  var methods = {

      init: function () {
        
      }

    };

  //  Public methods
  return {
    init: methods.init
  };

})(Modernizr, CF);

CF.global = ( function (Modernizr, CF) {
  'use strict';
  var methods = {

    init: function () {
      if ( CF.params.device.relativeSize !== 'x-large' ) {
        var header = document.querySelector('header'),
            menuIcon = document.createElement('div');

        menuIcon.setAttribute('id', 'menu-icon');
        menuIcon.appendChild(document.createTextNode('Menu'));
        header.appendChild(menuIcon);

        methods.menu({
          menu: 'header nav',
          trigger: '#menu-icon',
          position: 'left'
        });
      }

      methods.viewportResizeCheck('responsiveModeSet', CF.immediate.responsiveModeSet);
      // methods.viewportResizeCheck('frameworkReinit', CF.global.init);
      // methods.bindInternalLinks();
    },

    menu: function (args) {
      var body = document.querySelector('body'),
          menu,
          menuShadow = document.querySelector('#menu-shadow') || document.createElement('div'),
          trigger = document.querySelector(args.trigger);

      menuShadow.setAttribute('id', 'menu-shadow');
      body.insertBefore(menuShadow, body.children[0]);

      trigger.addEventListener('click', function () {
        var source = document.querySelector(args.menu);
        
        menu = source.cloneNode(true);

        body.insertBefore(menu, body.children[0]);

        if ( args.keepClass === false ) {
          menu.className = 'slide-menu ' + args.position;
        } else {
          menu.className += ' slide-menu ' + args.position;
        }

        if ( methods.hasClass(body, 'menu-open') ) {
          methods.removeClass(body, 'menu-open');
          methods.removeClass(menu, 'open');
          body.className += ' menu-closing';
          setTimeout( function () {
            methods.removeClass(body, 'menu-closing');
          }, 200);
        } else {
          body.className += ' menu-opening';
          setTimeout( function () {
            methods.removeClass(body, 'menu-opening');
            body.className += ' menu-open';
            menu.className += ' open';
          }, 200);
        }
      }, false);

      menuShadow.addEventListener('click', function () {
        methods.removeClass(body, 'menu-open');
        methods.removeClass(menu, 'open');
        body.className += ' menu-closing';
        setTimeout( function () {
          methods.removeClass(body, 'menu-closing');
          if ( menu.parentNode !== null ) {
            body.removeChild(menu);
          }
        }, 200);
      }, false);
    },

    hasClass: function (element, className) {
      if ( element.classList ) {
        return element.classList.contains(className);
      } else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
      }
    },

    removeClass: function (element, className) {
      if ( element.classList ) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    },

    ajaxFormBinding: function(options) {
      var form = document.querySelector(options.formSelector),
          format = options.format || 'json',
          type = options.type || 'direct';

      form.addEventListener('submit', function (e) {
        var request = new XMLHttpRequest(),
            formData = new FormData(form),
            data;

        e.preventDefault();

        request.open('POST', form.action + '/format/' + format + '/type/' + type, true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        // request.setRequestHeader('Content-Type', 'application/json');
        request.send(formData);

        request.onreadystatechange = function () {
          console.log('readyState: ' + request.readyState);
          console.log('status: ' + request.status);
        };

        request.onload = function () {
          if ( request.status >= 200 && request.status < 400 ) {
            data = JSON.parse(request.responseText);
            console.log(data);
          } else {
            // We reached our target server, but it returned an error
          }
        };

        request.onerror = function () {
          // There was a connection error of some sort
        };
      });

      // Some browsers don't include the submit button's value when form.submit() is
      // called. This function creates a click listener that duplicates a form's submit
      // button as a hidden field so its name/value can be included in AJAX POSTs,
      // allowing different processing based on different submit buttons.
      form.addEventListener('click', function (e) {
        var input = document.createElement('input'),
            previousActions = form.querySelectorAll('input[type="hidden"].submit-surrogate');

        for ( var i = 0; i < previousActions.length; i++ ) {
          form.removeChild(previousActions[i]);
        }

        if ( e.target.type && e.target.type.toLowerCase() === 'submit' ) {
          input.name = e.target.name;
          input.type = 'hidden';
          input.value = e.target.value;
          input.className = 'submit-surrogate';

          form.appendChild(input);
        }
      });
    },

    // hrefParser: function (historyUrl) {
    //  var newContentUrl = historyUrl + '/type/ajax/',
    //    newContentUrl = newContentUrl.replace(/\/\//, '/'),
    //    newBodyID = historyUrl.replace(/^[\/]?([A-Za-z0-9-_]+)\/.*/, '$1'),
    //    parsedHref = {};
    //  if ( historyUrl === '/' ) {
    //    newContentUrl = historyUrl;
    //    newBodyID = 'index';
    //  }
    //  parsedHref = {
    //    historyUrl: historyUrl,
    //    newContentUrl: newContentUrl,
    //    newBodyID: newBodyID
    //  };
    //  return parsedHref;
    // },
    //
    // bindInternalLinks: function () {
    //  if ( Modernizr.history && !CF.boundEvents.internalLinks ) {
    //    window.addEventListener('popstate', function (e) {
    //      var parsedHref = methods.hrefParser(location.pathname);
    //      // If it's the first request, don't do anything. If an ajax request has been fired previously, run updateContent to handle the back button
    //      if ( $('body').hasClass('pushed') ) {
    //        methods.updateContent('pop', parsedHref.historyUrl, parsedHref.newContentUrl, parsedHref.newBodyID);
    //      }
    //    });
    //    $('body').on('click.updateContent', 'a:nCF([href^="http"],[href^="tel"],[href^="app/"],[href^="index/frameworkReinit/true/"])', function (e) {
    //      var parsedHref = methods.hrefParser($(this).attr('href'));
    //      e.preventDefault();
    //      methods.updateContent('push', parsedHref.historyUrl, parsedHref.newContentUrl, parsedHref.newBodyID);
    //      //  BONUS: Write destroy methods for all CF.namespaces so bound events and changes to the DOM can be cleaned up easily on new page loads
    //    });
    //    CF.boundEvents.internalLinks = true;
    //  }
    // },
    //
    // updateContent: function (historyEvent, historyUrl, newContentUrl, newBodyID) {
    //  $('body').addClass('transitioning');
    //  $('html, body').scrollTop(0);
    //  // Append the loading indicator when transitioning to new content, but only if the response isn't received
    //  // within a brief delay window
    //  setTimeout( function () {
    //    if ( $('body').hasClass('transitioning') && !$('body').hasClass('loaded') ) {
    //      $('#primary-content-wrap').append('<span class="loading-indicator"></span>');
    //    }
    //  }, 250);
    //  $.ajax({
    //    url: newContentUrl,
    //    dataType: 'html',
    //    success: function (data) {
    //      var newContent = $(data),
    //        contentObject = newBodyID.replace(/-/, '');
    //      // Uncomment the timeout to simulate a 3-second delay in the response
  //        // setTimeout( function () {
    //      $('body').attr('id', newBodyID);
    //      $('body').attr('class', newBodyID + ' view-' + newBodyID + ' show-default do-default action-default type-default transitioning');
    //      $('title').html(newContent.filter('title').html());
    //      $('meta[name="description"]').attr('content', newContent.filter('meta[name="description"]').attr('content'));
    //      $('meta[name="keywords"]').attr('content', newContent.filter('meta[name="keywords"]').attr('content'));
    //      $('#primary-content').html(newContent.find('#primary-content').html());
    //      if ( typeof CF[contentObject] !== 'undefined' ) {
    //        CF[contentObject].init();
    //      }
    //      $('body').addClass('loaded pushed');
    //      $('#primary-content-wrap > span.loading-indicator').remove();
    //      // 150ms delay matches the CSS transition
    //      setTimeout( function () {
    //        // Second attempt to remove the loading indicator just in case it appears between the response and the delay set above
    //        $('#primary-content-wrap > span.loading-indicator').remove();
    //        $('body').removeClass('transitioning');
    //        $('body').removeClass('loaded');
    //      }, 150);
    //      if ( historyEvent === 'push' ) {
    //        history.pushState(newBodyID,newBodyID,historyUrl);
    //      }
  //        // }, 3000);
    //    }
    //  });
    // },
    //
    // preload: function (elements) {
    //
    //  var methods = {
    //
    //    init: function () {
    //      var $preload = '';
    //      $('body').append('<div id="preload" style="position: absolute; left: -1000em; width: 1px; height: 1px;"></div>');
    //      $preload = $('#preload');
    //      return $preload;
    //    },
    //
    //    image: function (elements) {
    //      var elementsArray = elements.split(','),
    //        $preload = $('#preload');
    //      if ( !$preload.length ) {
    //        $preload = methods.init();
    //      }
    //      for ( var i = 0; i < elementsArray.length; i++ ) {
    //        $preload.append('<img src="' + elementsArray[i] + '" />');
    //      }
    //      $preload.remove();
    //    }
    //
    //  };
    //
    //  methods.image(elements);
    //
    // },
    //
    viewportResizeCheck: function (namespace, callback) {
      var windowWidth = document.body.clientWidth,
          delay = 0;
      //  If the browser is resized, check the viewport size after a slight delay and run the
      //  provided callback function.
      window.addEventListener('resize', function (e) {
        clearTimeout(delay);
        delay = setTimeout( function () {
          if ( document.body.clientWidth !== windowWidth ) {
            windowWidth = document.body.clientWidth;
            callback();
          }
        }, 500);
      });
     // $(window).on('resize.' + namespace, function (e) {
     //   clearTimeout(delayCheckViewport);
     //   delayCheckViewport = setTimeout( function () {
     //     if ( $(window).width() !== windowWidth ) {
     //       windowWidth = $(window).width();
     //       callback();
     //     }
     //   }, 500);
     // });
    },
    //
    // responsiveImages: function (selector, cleanup) {
    //  var path = '',
    //    size = '';
    //  if ( typeof selector === 'undefined' ) {
    //    selector = 'body';
    //  }
    //  if ( typeof cleanup === 'undefined' ) {
    //    cleanup = true;
    //  }
    //  if ( CF.params.device.hiRes ) {
    //    size = '-2x';
    //  }
    //  if ( cleanup ) {
    //    $('a.responsive, img.responsive').remove();
    //  }
    //  $(selector + ' noscript').each( function () {
    //    var sizes = [],
    //      respond = false,
    //      className = 'responsive';
    //    if ( typeof $(this).attr('data-image') !== 'undefined' ) {
    //      if ( $(this).attr('data-sizes') ) {
    //        sizes = $(this).attr('data-sizes').split(' ');
    //        for ( var i = 0; i < sizes.length; i++ ) {
    //          if ( sizes[i] === CF.params.device.relativeSize ) {
    //            respond = true;
    //            break;
    //          }
    //        }
    //      } else {
    //        respond = true;
    //      }
    //      if ( respond ) {
    //        path = $(this).attr('data-image').replace(/-small.|-medium.|-large.|-x-large./, '-' + CF.params.device.relativeSize + size + '.');
    //        if ( $(this).attr('class') ) {
    //          className = className + ' ' + $(this).attr('class');
    //        }
    //        if ( typeof $(this).attr('data-anchor') !== 'undefined' ) {
    //          $(this).after('<a class="' + className + '" href="' + $(this).attr('data-anchor') + '"><img class="' + className + '" src="' + path + '" /></a>');
    //        } else {
    //          $(this).after('<img class="' + className + '" src="' + path + '" />');
    //        }
    //      }
    //    }
    //  });
    // }

  };

  //  Public methods
  return {
    init: methods.init,
    menu: methods.menu,
    hasClass: methods.hasClass,
    removeClass: methods.removeClass,
    ajaxFormBinding: methods.ajaxFormBinding
    // preload: methods.preload,
    // viewportResizeCheck: methods.viewportResizeCheck
  };

}(Modernizr, CF));

CF.index = ( function (Modernizr, CF) {
  'use strict';
  
  var methods = {

      init: function () {
        console.log('CF.index.init()');
      }

    };

  //  Public methods
  return {
    init: methods.init
  };

})(Modernizr, CF);

CF.init = function () {
  'use strict';

  var body = document.getElementsByTagName('body')[0],
      controller = body.getAttribute('data-controller'),
      action = body.getAttribute('data-action'),
      view = body.getAttribute('data-view');

  CF.global.init();

  if ( CF[controller] ) {
    CF[controller].init();

    if ( CF[controller][action] && typeof CF[controller][action] === 'function' ) {
      CF[controller][action]();

      if ( CF[controller][action][view] ) {
        CF[controller][action][view]();
      }
    }
  }
};

document.onreadystatechange = function () {
  'use strict';

  if ( document.readyState === 'interactive' ) {
    CF.init();
  }
};

CF.topic = ( function (Modernizr, CF) {
  'use strict';

	var actions = {

      handler: function () {
        // if ( document.querySelectorAll('main nav.topic.actions li').length > 2 ) {
        //   methods.topicMenu();
        // }
        var form = document.querySelector('#quick-reply-form');

        if ( form && !CF.global.hasClass(form.parentNode, 'quote') ) {
          methods.postContent();
        }
      },

      start: function () {
        // CF.global.ajaxFormBinding({
        //   formSelector: '#topic-write-form'
        // });
        methods.postContent();
      },

      reply: function () {
        // CF.global.ajaxFormBinding({
        //   formSelector: '#topic-reply-form'
        // });
        var form = document.querySelector('#topic-reply-form');

        if ( form && !CF.global.hasClass(form.parentNode, 'quote') ) {
          methods.postContent();
        }
      }

		},

    methods = {

			init: function () {
        // methods.postContent();
			},

      // topicMenu: function () {
      //   var menu = document.querySelector('main nav.topic.actions ul'),
      //       moreButton = document.createElement('li'),
      //       moreAnchor = document.createElement('a');

      //   moreButton.className = 'more';
      //   moreButton.appendChild(moreAnchor);
      //   moreAnchor.appendChild(document.createTextNode('More...'));
      //   menu.appendChild(moreButton);

      //   CF.global.menu({
      //     menu: 'main nav.topic.actions',
      //     trigger: 'main nav.topic.actions li.more a',
      //     position: 'right',
      //     clone: true,
      //     keepClass: false
      //   });

      // },

      postContent: function () {
        var postContent = document.getElementById('post-content'),
            postContentText = postContent ? postContent.value : '';

        if ( postContent ) {
          postContent.addEventListener('focus', function (e) {
            if ( postContent.value === postContentText ) {
              postContent.value = '';
            }
          });
          postContent.addEventListener('blur', function (e) {
            if ( postContent.value === '' ) {
              postContent.value = postContentText;
            }
          });
        }
      }

    };

	//	Public methods
	return {
		init: methods.init,
    handler: actions.handler,
    start: actions.start,
    startPrivate: actions.start,
    startAnnouncement: actions.start,
    reply: actions.reply
	};

})(Modernizr, CF);


// For now, the announcement library is the same as the topic library
CF.announcement = CF.topic;
