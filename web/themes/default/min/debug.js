window.Modernizr=function(r,d,i){var e,o,a,c={},f=d.documentElement,p="modernizr",t=d.createElement(p),l=t.style,s=d.createElement("input"),u=":)",n={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),h="Webkit Moz O ms",g=h.split(" "),v=h.toLowerCase().split(" "),y="http://www.w3.org/2000/svg",b={},E={},x={},w=[],S=w.slice,C=function(e,t,n,r){var o,a,i,c,l=d.createElement("div"),s=d.body,u=s||d.createElement("body");if(parseInt(n,10))for(;n--;)(i=d.createElement("div")).id=r?r[n]:p+(n+1),l.appendChild(i);return o=["&#173;",'<style id="s',p,'">',e,"</style>"].join(""),l.id=p,(s?l:u).innerHTML+=o,u.appendChild(l),s||(u.style.background="",u.style.overflow="hidden",c=f.style.overflow,f.style.overflow="hidden",f.appendChild(u)),a=t(l,e),s?l.parentNode.removeChild(l):(u.parentNode.removeChild(u),f.style.overflow=c),!!a},k=(a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"},function(e,t){t=t||d.createElement(a[e]||"div");var n=(e="on"+e)in t;return n||(t.setAttribute||(t=d.createElement("div")),t.setAttribute&&t.removeAttribute&&(t.setAttribute(e,""),n=M(t[e],"function"),M(t[e],"undefined")||(t[e]=i),t.removeAttribute(e))),t=null,n}),T={}.hasOwnProperty;function j(e){l.cssText=e}function M(e,t){return typeof e===t}function N(e,t){return!!~(""+e).indexOf(t)}function P(e,t){for(var n in e){var r=e[n];if(!N(r,"-")&&l[r]!==i)return"pfx"!=t||r}return!1}function A(e,t,n){var r=e.charAt(0).toUpperCase()+e.slice(1),o=(e+" "+g.join(r+" ")+r).split(" ");return M(t,"string")||M(t,"undefined")?P(o,t):function(e,t,n){for(var r in e){var o=t[e[r]];if(o!==i)return!1===n?e[r]:M(o,"function")?o.bind(n||t):o}return!1}(o=(e+" "+v.join(r+" ")+r).split(" "),t,n)}for(var z in o=M(T,"undefined")||M(T.call,"undefined")?function(e,t){return t in e&&M(e.constructor.prototype[t],"undefined")}:function(e,t){return T.call(e,t)},Function.prototype.bind||(Function.prototype.bind=function(r){var o=this;if("function"!=typeof o)throw new TypeError;var a=S.call(arguments,1),i=function(){if(this instanceof i){var e=function(){};e.prototype=o.prototype;var t=new e,n=o.apply(t,a.concat(S.call(arguments)));return Object(n)===n?n:t}return o.apply(r,a.concat(S.call(arguments)))};return i}),b.flexbox=function(){return A("flexWrap")},b.canvas=function(){var e=d.createElement("canvas");return!(!e.getContext||!e.getContext("2d"))},b.canvastext=function(){return!(!c.canvas||!M(d.createElement("canvas").getContext("2d").fillText,"function"))},b.webgl=function(){return!!r.WebGLRenderingContext},b.touch=function(){var t;return"ontouchstart"in r||r.DocumentTouch&&d instanceof DocumentTouch?t=!0:C(["@media (",m.join("touch-enabled),("),p,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(e){t=9===e.offsetTop}),t},b.geolocation=function(){return"geolocation"in navigator},b.postmessage=function(){return!!r.postMessage},b.websqldatabase=function(){return!!r.openDatabase},b.indexedDB=function(){return!!A("indexedDB",r)},b.hashchange=function(){return k("hashchange",r)&&(d.documentMode===i||7<d.documentMode)},b.history=function(){return!(!r.history||!history.pushState)},b.draganddrop=function(){var e=d.createElement("div");return"draggable"in e||"ondragstart"in e&&"ondrop"in e},b.websockets=function(){return"WebSocket"in r||"MozWebSocket"in r},b.rgba=function(){return j("background-color:rgba(150,255,150,.5)"),N(l.backgroundColor,"rgba")},b.hsla=function(){return j("background-color:hsla(120,40%,100%,.5)"),N(l.backgroundColor,"rgba")||N(l.backgroundColor,"hsla")},b.multiplebgs=function(){return j("background:url(https://),url(https://),red url(https://)"),/(url\s*\(.*?){3}/.test(l.background)},b.backgroundsize=function(){return A("backgroundSize")},b.borderimage=function(){return A("borderImage")},b.borderradius=function(){return A("borderRadius")},b.boxshadow=function(){return A("boxShadow")},b.textshadow=function(){return""===d.createElement("div").style.textShadow},b.opacity=function(){var e,t;return e="opacity:.55",j(m.join(e+";")+(t||"")),/^0.55$/.test(l.opacity)},b.cssanimations=function(){return A("animationName")},b.csscolumns=function(){return A("columnCount")},b.cssgradients=function(){var e="background-image:";return j((e+"-webkit- ".split(" ").join("gradient(linear,left top,right bottom,from(#9f9),to(white));"+e)+m.join("linear-gradient(left top,#9f9, white);"+e)).slice(0,-e.length)),N(l.backgroundImage,"gradient")},b.cssreflections=function(){return A("boxReflect")},b.csstransforms=function(){return!!A("transform")},b.csstransforms3d=function(){var n=!!A("perspective");return n&&"webkitPerspective"in f.style&&C("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(e,t){n=9===e.offsetLeft&&3===e.offsetHeight}),n},b.csstransitions=function(){return A("transition")},b.fontface=function(){var a;return C('@font-face {font-family:"font";src:url("https://")}',function(e,t){var n=d.getElementById("smodernizr"),r=n.sheet||n.styleSheet,o=r?r.cssRules&&r.cssRules[0]?r.cssRules[0].cssText:r.cssText||"":"";a=/src/i.test(o)&&0===o.indexOf(t.split(" ")[0])}),a},b.generatedcontent=function(){var t;return C(["#",p,"{font:0/0 a}#",p,':after{content:"',u,'";visibility:hidden;font:3px/1 a}'].join(""),function(e){t=3<=e.offsetHeight}),t},b.video=function(){var e=d.createElement("video"),t=!1;try{(t=!!e.canPlayType)&&((t=new Boolean(t)).ogg=e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),t.h264=e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),t.webm=e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,""))}catch(e){}return t},b.audio=function(){var e=d.createElement("audio"),t=!1;try{(t=!!e.canPlayType)&&((t=new Boolean(t)).ogg=e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),t.mp3=e.canPlayType("audio/mpeg;").replace(/^no$/,""),t.wav=e.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),t.m4a=(e.canPlayType("audio/x-m4a;")||e.canPlayType("audio/aac;")).replace(/^no$/,""))}catch(e){}return t},b.localstorage=function(){try{return localStorage.setItem(p,p),localStorage.removeItem(p),!0}catch(e){return!1}},b.sessionstorage=function(){try{return sessionStorage.setItem(p,p),sessionStorage.removeItem(p),!0}catch(e){return!1}},b.webworkers=function(){return!!r.Worker},b.applicationcache=function(){return!!r.applicationCache},b.svg=function(){return!!d.createElementNS&&!!d.createElementNS(y,"svg").createSVGRect},b.inlinesvg=function(){var e=d.createElement("div");return e.innerHTML="<svg/>",(e.firstChild&&e.firstChild.namespaceURI)==y},b.smil=function(){return!!d.createElementNS&&/SVGAnimate/.test(n.call(d.createElementNS(y,"animate")))},b.svgclippaths=function(){return!!d.createElementNS&&/SVGClipPath/.test(n.call(d.createElementNS(y,"clipPath")))},b)o(b,z)&&(e=z.toLowerCase(),c[e]=b[z](),w.push((c[e]?"":"no-")+e));return c.input||(c.input=function(e){for(var t=0,n=e.length;t<n;t++)x[e[t]]=!!(e[t]in s);return x.list&&(x.list=!(!d.createElement("datalist")||!r.HTMLDataListElement)),x}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),c.inputtypes=function(e){for(var t,n,r,o=0,a=e.length;o<a;o++)s.setAttribute("type",n=e[o]),(t="text"!==s.type)&&(s.value=u,s.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(n)&&s.style.WebkitAppearance!==i?(f.appendChild(s),t=(r=d.defaultView).getComputedStyle&&"textfield"!==r.getComputedStyle(s,null).WebkitAppearance&&0!==s.offsetHeight,f.removeChild(s)):/^(search|tel)$/.test(n)||(t=/^(url|email)$/.test(n)?s.checkValidity&&!1===s.checkValidity():s.value!=u)),E[e[o]]=!!t;return E}("search tel url email datetime date month week time datetime-local number range color".split(" "))),c.addTest=function(e,t){if("object"==typeof e)for(var n in e)o(e,n)&&c.addTest(n,e[n]);else{if(e=e.toLowerCase(),c[e]!==i)return c;t="function"==typeof t?t():t,f.className+=" "+(t?"":"no-")+e,c[e]=t}return c},j(""),t=s=null,function(e,l){var s,u,t=e.html5||{},o=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,a=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,n="_html5shiv",r=0,i={};function d(){var e=m.elements;return"string"==typeof e?e.split(" "):e}function f(e){var t=i[e[n]];return t||(t={},r++,e[n]=r,i[r]=t),t}function p(e,t,n){return t||(t=l),u?t.createElement(e):(n||(n=f(t)),!(r=n.cache[e]?n.cache[e].cloneNode():a.test(e)?(n.cache[e]=n.createElem(e)).cloneNode():n.createElem(e)).canHaveChildren||o.test(e)||r.tagUrn?r:n.frag.appendChild(r));var r}function c(e){e||(e=l);var t,n,r,o,a,i,c=f(e);return!m.shivCSS||s||c.hasCSS||(c.hasCSS=(n="article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}",r=(t=e).createElement("p"),o=t.getElementsByTagName("head")[0]||t.documentElement,r.innerHTML="x<style>"+n+"</style>",!!o.insertBefore(r.lastChild,o.firstChild))),u||(a=e,(i=c).cache||(i.cache={},i.createElem=a.createElement,i.createFrag=a.createDocumentFragment,i.frag=i.createFrag()),a.createElement=function(e){return m.shivMethods?p(e,a,i):i.createElem(e)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+d().join().replace(/[\w\-]+/g,function(e){return i.createElem(e),i.frag.createElement(e),'c("'+e+'")'})+");return n}")(m,i.frag)),e}!function(){try{var e=l.createElement("a");e.innerHTML="<xyz></xyz>",s="hidden"in e,u=1==e.childNodes.length||function(){l.createElement("a");var e=l.createDocumentFragment();return void 0===e.cloneNode||void 0===e.createDocumentFragment||void 0===e.createElement}()}catch(e){u=s=!0}}();var m={elements:t.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==t.shivCSS,supportsUnknownElements:u,shivMethods:!1!==t.shivMethods,type:"default",shivDocument:c,createElement:p,createDocumentFragment:function(e,t){if(e||(e=l),u)return e.createDocumentFragment();for(var n=(t=t||f(e)).frag.cloneNode(),r=0,o=d(),a=o.length;r<a;r++)n.createElement(o[r]);return n}};e.html5=m,c(l)}(this,d),c._version="2.8.3",c._prefixes=m,c._domPrefixes=v,c._cssomPrefixes=g,c.mq=function(e){var t,n=r.matchMedia||r.msMatchMedia;return n?n(e)&&n(e).matches||!1:(C("@media "+e+" { #"+p+" { position: absolute; } }",function(e){t="absolute"==(r.getComputedStyle?getComputedStyle(e,null):e.currentStyle).position}),t)},c.hasEvent=k,c.testProp=function(e){return P([e])},c.testAllProps=A,c.testStyles=C,c.prefixed=function(e,t,n){return t?A(e,t,n):A(e,"pfx")},f.className=f.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+" js "+w.join(" "),c}(this,this.document),function(e,f,c){function d(e){return"[object Function]"==o.call(e)}function p(e){return"string"==typeof e}function m(){}function h(e){return!e||"loaded"==e||"complete"==e||"uninitialized"==e}function g(){var e=E.shift();x=1,e?e.t?y(function(){("c"==e.t?v.injectCss:v.injectJs)(e.s,0,e.a,e.x,e.e,1)},0):(e(),g()):x=0}function t(e,t,n,r,o){return x=0,t=t||"j",p(e)?function(n,r,e,t,o,a,i){function c(e){if(!s&&h(l.readyState)&&(d.r=s=1,!x&&g(),l.onload=l.onreadystatechange=null,e))for(var t in"img"!=n&&y(function(){S.removeChild(l)},50),T[r])T[r].hasOwnProperty(t)&&T[r][t].onload()}i=i||v.errorTimeout;var l=f.createElement(n),s=0,u=0,d={t:e,s:r,e:o,a:a,x:i};1===T[r]&&(u=1,T[r]=[]),"object"==n?l.data=r:(l.src=r,l.type=n),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){c.call(this,u)},E.splice(t,0,d),"img"!=n&&(u||2===T[r]?(S.insertBefore(l,w?null:b),y(c,i)):T[r].push(l))}("c"==t?s:i,e,t,this.i++,n,r,o):(E.splice(this.i++,0,e),1==E.length&&g()),this}function l(){var e=v;return e.loader={load:t,i:0},e}var n,v,r=f.documentElement,y=e.setTimeout,b=f.getElementsByTagName("script")[0],o={}.toString,E=[],x=0,a="MozAppearance"in r.style,w=a&&!!f.createRange().compareNode,S=w?r:b.parentNode,i=(r=e.opera&&"[object Opera]"==o.call(e.opera),r=!!f.attachEvent&&!r,a?"object":r?"script":"img"),s=r?"script":i,C=Array.isArray||function(e){return"[object Array]"==o.call(e)},k=[],T={},j={timeout:function(e,t){return t.length&&(e.timeout=t[0]),e}};(v=function(e){function u(e,t,n,r,o){var a=function(e){e=e.split("!");var t,n,r,o=k.length,a=e.pop(),i=e.length;for(a={url:a,origUrl:a,prefixes:e},n=0;n<i;n++)r=e[n].split("="),(t=j[r.shift()])&&(a=t(a,r));for(n=0;n<o;n++)a=k[n](a);return a}(e),i=a.autoCallback;a.url.split(".").pop().split("?").shift(),a.bypass||(t&&(t=d(t)?t:t[e]||t[r]||t[e.split("/").pop().split("?")[0]]),a.instead?a.instead(e,t,n,r,o):(T[a.url]?a.noexec=!0:T[a.url]=1,n.load(a.url,a.forceCSS||!a.forceJS&&"css"==a.url.split(".").pop().split("?").shift()?"c":c,a.noexec,a.attrs,a.timeout),(d(t)||d(i))&&n.load(function(){l(),t&&t(a.origUrl,o,r),i&&i(a.origUrl,o,r),T[a.url]=2})))}function t(e,t){function n(n,e){if(n){if(p(n))e||(c=function(){var e=[].slice.call(arguments);l.apply(this,e),s()}),u(n,c,t,0,a);else if(Object(n)===n)for(o in r=function(){var e,t=0;for(e in n)n.hasOwnProperty(e)&&t++;return t}(),n)n.hasOwnProperty(o)&&(!e&&!--r&&(d(c)?c=function(){var e=[].slice.call(arguments);l.apply(this,e),s()}:c[o]=function(t){return function(){var e=[].slice.call(arguments);t&&t.apply(this,e),s()}}(l[o])),u(n[o],c,t,o,a))}else!e&&s()}var r,o,a=!!e.test,i=e.load||e.both,c=e.callback||m,l=c,s=e.complete||m;n(a?e.yep:e.nope,!!i),i&&n(i)}var n,r,o=this.yepnope.loader;if(p(e))u(e,0,o,0);else if(C(e))for(n=0;n<e.length;n++)p(r=e[n])?u(r,0,o,0):C(r)?v(r):Object(r)===r&&t(r,o);else Object(e)===e&&t(e,o)}).addPrefix=function(e,t){j[e]=t},v.addFilter=function(e){k.push(e)},v.errorTimeout=1e4,null==f.readyState&&f.addEventListener&&(f.readyState="loading",f.addEventListener("DOMContentLoaded",n=function(){f.removeEventListener("DOMContentLoaded",n,0),f.readyState="complete"},0)),e.yepnope=l(),e.yepnope.executeStack=g,e.yepnope.injectJs=function(e,t,n,r,o,a){var i,c,l=f.createElement("script");r=r||v.errorTimeout;for(c in l.src=e,n)l.setAttribute(c,n[c]);t=a?g:t||m,l.onreadystatechange=l.onload=function(){!i&&h(l.readyState)&&(i=1,t(),l.onload=l.onreadystatechange=null)},y(function(){i||t(i=1)},r),o?l.onload():b.parentNode.insertBefore(l,b)},e.yepnope.injectCss=function(e,t,n,r,o,a){var i;r=f.createElement("link"),t=a?g:t||m;for(i in r.href=e,r.rel="stylesheet",r.type="text/css",n)r.setAttribute(i,n[i]);o||(b.parentNode.insertBefore(r,b),y(t,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))},Modernizr.addTest("emoji",function(){if(!Modernizr.canvastext)return!1;var e=document.createElement("canvas").getContext("2d");return e.textBaseline="top",e.font="32px Arial",e.fillText("😃",0,0),0!==e.getImageData(16,16,1,1).data[0]});
window.matchMedia=window.matchMedia||function(e){"use strict";var t,n=e.documentElement,a=n.firstElementChild||n.firstChild,s=e.createElement("body"),i=e.createElement("div");return i.id="mq-test-1",i.style.cssText="position:absolute;top:-100em",s.style.background="none",s.appendChild(i),function(e){return i.innerHTML='&shy;<style media="'+e+'"> #mq-test-1 { width: 42px; }</style>',n.insertBefore(s,a),t=42===i.offsetWidth,n.removeChild(s),{matches:t,media:e}}}(document),function(v){"use strict";function e(){O(!0)}var t={};if((v.respond=t).update=function(){},t.mediaQueriesSupported=v.matchMedia&&v.matchMedia("only all").matches,!t.mediaQueriesSupported){var g,x,E,w=v.document,T=w.documentElement,C=[],S=[],$=[],i={},b=w.getElementsByTagName("head")[0]||T,r=w.getElementsByTagName("base")[0],R=b.getElementsByTagName("link"),o=[],n=function(){for(var e=0;R.length>e;e++){var t=R[e],n=t.href,a=t.media,s=t.rel&&"stylesheet"===t.rel.toLowerCase();n&&s&&!i[n]&&(t.styleSheet&&t.styleSheet.rawCssText?(d(t.styleSheet.rawCssText,n,a),i[n]=!0):(!/^([a-zA-Z:]*\/\/)/.test(n)&&!r||n.replace(RegExp.$1,"").split("/")[0]===v.location.host)&&o.push({href:n,media:a}))}l()},l=function(){if(o.length){var t=o.shift();a(t.href,function(e){d(e,t.href,t.media),i[t.href]=!0,v.setTimeout(function(){l()},0)})}},d=function(e,t,n){var a=e.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),s=a&&a.length||0,i=function(e){return e.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+t+"$2$3")},r=!s&&n;(t=t.substring(0,t.lastIndexOf("/"))).length&&(t+="/"),r&&(s=1);for(var o=0;o<s;o++){var l,d,m,h;r?(l=n,S.push(i(e))):(l=a[o].match(/@media *([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,S.push(RegExp.$2&&i(RegExp.$2))),h=(m=l.split(",")).length;for(var u=0;u<h;u++)d=m[u],C.push({media:d.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/)&&RegExp.$2||"all",rules:S.length-1,hasquery:-1<d.indexOf("("),minw:d.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:d.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}O()},M=function(){var e,t=w.createElement("div"),n=w.body,a=!1;return t.style.cssText="position:absolute;font-size:1em;width:1em",n||((n=a=w.createElement("body")).style.background="none"),n.appendChild(t),T.insertBefore(n,T.firstChild),e=t.offsetWidth,a?T.removeChild(n):n.removeChild(t),E=parseFloat(e)},O=function(e){var t="clientWidth",n=T[t],a="CSS1Compat"===w.compatMode&&n||w.body[t]||n,s={},i=R[R.length-1],r=(new Date).getTime();if(e&&g&&r-g<30)return v.clearTimeout(x),void(x=v.setTimeout(O,30));for(var o in g=r,C)if(C.hasOwnProperty(o)){var l=C[o],d=l.minw,m=l.maxw,h=null===d,u=null===m;d&&(d=parseFloat(d)*(-1<d.indexOf("em")?E||M():1)),m&&(m=parseFloat(m)*(-1<m.indexOf("em")?E||M():1)),l.hasquery&&(h&&u||!(h||d<=a)||!(u||a<=m))||(s[l.media]||(s[l.media]=[]),s[l.media].push(S[l.rules]))}for(var c in $)$.hasOwnProperty(c)&&$[c]&&$[c].parentNode===b&&b.removeChild($[c]);for(var p in s)if(s.hasOwnProperty(p)){var f=w.createElement("style"),y=s[p].join("\n");f.type="text/css",f.media=p,b.insertBefore(f,i.nextSibling),f.styleSheet?f.styleSheet.cssText=y:f.appendChild(w.createTextNode(y)),$.push(f)}},a=function(e,t){var n=s();n&&(n.open("GET",e,!0),n.onreadystatechange=function(){4!==n.readyState||200!==n.status&&304!==n.status||t(n.responseText)},4!==n.readyState&&n.send(null))},s=function(){var t=!1;try{t=new v.XMLHttpRequest}catch(e){t=new v.ActiveXObject("Microsoft.XMLHTTP")}return function(){return t}}();n(),t.update=n,v.addEventListener?v.addEventListener("resize",e,!1):v.attachEvent&&v.attachEvent("onresize",e)}}(this);
window.CF={params:{device:{hiRes:!0,relativeSize:"small"}},boundEvents:{internalLinks:!1,viewportResize:!1}},CF.immediate=function(i,s){"use strict";var e={init:function(){e.responsiveModeSet()},responsiveModeSet:function(){var e=document.querySelector("html");i.mq("only screen and (min-width: 720px)")?s.params.device.relativeSize="x-large":i.mq("only screen and (min-width: 600px)")?s.params.device.relativeSize="large":i.mq("only screen and (min-width: 500px)")&&(s.params.device.relativeSize="medium"),e.setAttribute("data-relative-size",s.params.device.relativeSize),e.classList?(e.classList.remove("small"),e.classList.remove("medium"),e.classList.remove("large"),e.classList.remove("x-large"),e.classList.add(s.params.device.relativeSize)):e.className=e.className.replace(new RegExp("(^|\\b)"+e.split(" ").join("|")+"(\\b|$)","gi")," ")+" "+s.params.device.relativeSize}};return{init:e.init,responsiveModeSet:e.responsiveModeSet}}(Modernizr,CF),CF.immediate.init();
CF.discussion=function(i,n){"use strict";return{init:function(){}}}(Modernizr,CF);
CF.discussions=function(i,n){"use strict";return{init:function(){}}}(Modernizr,CF);
CF.global=function(e,l){"use strict";var c={init:function(){var t,e,n=document.querySelector("body"),a=0,s=document.querySelector("body > header"),o=document.querySelector("main"),i=s.querySelector("nav ul.account");n.className="floating-header",o.style.paddingTop=s.getBoundingClientRect().height-1+"px",window.addEventListener("scroll",function(e){a>n.getBoundingClientRect().top&&Math.abs(n.getBoundingClientRect().top)>s.getBoundingClientRect().height&&!c.hasClass(n,"floating-header-hidden")?(c.removeClass(n,"floating-header-active"),n.className+=" floating-header-hidden"):n.getBoundingClientRect().top>a&&(c.removeClass(n,"floating-header-hidden"),c.hasClass(n,"floating-header-active")||(n.className+=" floating-header-active")),0===n.getBoundingClientRect().top&&(n.className="floating-header"),a=n.getBoundingClientRect().top}),(e=document.createElement("div")).setAttribute("id","main-menu-icon"),e.appendChild(document.createTextNode("Menu")),s.insertBefore(e,s.querySelector("a.home")),c.menu({menu:"header nav",trigger:"#main-menu-icon",position:"left"}),"large"!==l.params.device.relativeSize&&"x-large"!==l.params.device.relativeSize||(i.addEventListener("mouseleave",function(e){t=setTimeout(function(){c.removeClass(i,"active")},500)},!1),i.addEventListener("mouseover",function(e){t&&clearTimeout(t)}),c.hasClass(s,"authenticated")&&(s.querySelector("a.account").addEventListener("click",function(e){c.hasClass(i,"active")?c.removeClass(i,"active"):i.className+=" active",e.preventDefault()}),window.addEventListener("scroll",function(e){c.hasClass(i,"active")&&c.removeClass(i,"active")}))),c.viewportResizeCheck("responsiveModeSet",l.immediate.responsiveModeSet)},collapseQuotes:function(){for(var e=document.body.querySelectorAll("section.content > blockquote"),t=function(t){var n=document.createElement("a");n.setAttribute("href","#"),n.classList.add("expand"),n.innerHTML="Expand",n.addEventListener("click",function(e){e.preventDefault(),t.classList.toggle("expanded"),"Expand"===n.innerHTML?n.innerHTML="Collapse":n.innerHTML="Expand"}),t.classList.add("nested"),t.appendChild(n)},n=0;n<e.length;n++)e[n].querySelector("blockquote")&&t(e[n])},menu:function(n){var a,s=document.querySelector("body");document.querySelector(n.trigger).addEventListener("click",function(){var e=document.querySelector(n.menu),t=document.createElement("div");a=e.cloneNode(!0),s.appendChild(a),t.className="menu-shadow",s.appendChild(t),!1===n.keepClass?a.className="slide-menu "+n.position:a.className+=" slide-menu "+n.position,c.hasClass(s,"menu-open")?(c.removeClass(s,"menu-open"),c.removeClass(a,"open"),s.className+=" menu-closing",setTimeout(function(){c.removeClass(s,"menu-closing")},200)):(s.className+=" menu-opening",setTimeout(function(){c.removeClass(s,"menu-opening"),s.className+=" menu-open",a.className+=" open"},200)),t.addEventListener("click",function(){c.removeClass(s,"menu-open"),c.removeClass(a,"open"),s.className+=" menu-closing",setTimeout(function(){c.removeClass(s,"menu-closing"),s.removeChild(t),null!==a.parentNode&&s.removeChild(a)},200)},!1)},!1)},hasClass:function(e,t){return e.classList?e.classList.contains(t):new RegExp("(^| )"+t+"( |$)","gi").test(e.className)},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)"+t.split(" ").join("|")+"(\\b|$)","gi")," ")},toggleClass:function(e,t){c.hasClass(e,t)?c.removeClass(e,t):e.className+=" "+t},ajaxFormBinding:function(e){var s=document.querySelector(e.formSelector),o=e.format||"json",i=e.type||"direct";s.addEventListener("submit",function(e){var t,n=new XMLHttpRequest,a=new FormData(s);e.preventDefault(),n.open("POST",s.action+"/format/"+o+"/type/"+i,!0),n.setRequestHeader("X-Requested-With","XMLHttpRequest"),n.send(a),n.onreadystatechange=function(){console.log("readyState: "+n.readyState),console.log("status: "+n.status)},n.onload=function(){200<=n.status&&n.status<400&&(t=JSON.parse(n.responseText),console.log(t))},n.onerror=function(){}}),s.addEventListener("click",function(e){for(var t=document.createElement("input"),n=s.querySelectorAll('input[type="hidden"].submit-surrogate'),a=0;a<n.length;a++)s.removeChild(n[a]);e.target.type&&"submit"===e.target.type.toLowerCase()&&(t.name=e.target.name,t.type="hidden",t.value=e.target.value,t.className="submit-surrogate",s.appendChild(t))})},viewportResizeCheck:function(e,t){var n=document.body.clientWidth,a=0;window.addEventListener("resize",function(e){clearTimeout(a),a=setTimeout(function(){document.body.clientWidth!==n&&(n=document.body.clientWidth,t())},500)})}};return{collapseQuotes:c.collapseQuotes,init:c.init,menu:c.menu,hasClass:c.hasClass,removeClass:c.removeClass,ajaxFormBinding:c.ajaxFormBinding}}(Modernizr,CF);
CF.index=function(n,i){"use strict";return{init:function(){}}}(Modernizr,CF);
CF.init=function(){"use strict";var t=document.getElementsByTagName("body")[0],e=t.getAttribute("data-controller"),i=t.getAttribute("data-action"),n=t.getAttribute("data-view");CF.global.init(),CF[e]&&(CF[e].init(),CF[e][i]&&"function"==typeof CF[e][i]&&(CF[e][i](),CF[e][i][n]&&CF[e][i][n]()))},document.onreadystatechange=function(){"use strict";"interactive"===document.readyState&&CF.init()};
CF.post=function(i,t){"use strict";return{init:{init:function(){t.global.collapseQuotes()}}.init}}(Modernizr,CF);
CF.topic=function(e,t){"use strict";var n,o;return n={handler:function(){var r,e=document.querySelector("#quick-reply-form");e&&!t.global.hasClass(e.parentNode,"quote")&&o.postContent(),"x-large"===t.params.device.relativeSize&&((r=document.createElement("div")).setAttribute("id","mask"),document.body.appendChild(r),document.querySelectorAll("section.posts article.post section.content.post p > img, section.posts article.post section.content.post > img").forEach(function(e,t,n){var o=document.createElement("span"),a=document.createElement("span"),s=e.parentNode,c=e.getAttribute("src");o.classList.add("zoom"),a.classList.add("zoom-image"),o.appendChild(a),s.appendChild(o),s.insertBefore(o,e),a.appendChild(e),a.addEventListener("click",function(e){r.innerHTML='<div id="mask-close"></div><img src="'+c+'"><a class="open-tab" href="'+c+'" target="_blank">'+c+"</a>",document.querySelector("html").classList.add("mask-enabled"),r.classList.add("enabled"),r.querySelector("#mask-close").addEventListener("click",function(e){r.classList.add("closing"),document.querySelector("html").classList.remove("mask-enabled"),setTimeout(function(){r.classList.remove("closing","enabled"),r.innerHTML=""},200)})})}))},start:function(){o.postContent()},reply:function(){var e=document.querySelector("#topic-reply-form");e&&!t.global.hasClass(e.parentNode,"quote")&&o.postContent()}},{init:(o={init:function(){t.global.collapseQuotes()},postContent:function(){var t=document.getElementById("post-content"),n=t?t.value:"";t&&(t.addEventListener("focus",function(e){t.value===n&&(t.value="")}),t.addEventListener("blur",function(e){""===t.value&&(t.value=n)}))}}).init,handler:n.handler,start:n.start,startPrivate:n.start,startAnnouncement:n.start,reply:n.reply}}(Modernizr,CF),CF.announcement=CF.topic;
CF.user=function(i,n){"use strict";return{init:{init:function(){n.global.collapseQuotes()}}.init}}(Modernizr,CF);
//# sourceMappingURL=debug.js.map
