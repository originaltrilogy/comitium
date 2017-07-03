window.Modernizr=function(e,t,n){function r(e){h.cssText=e}function a(e,t){return typeof e===t}function o(e,t){return!!~(""+e).indexOf(t)}function i(e,t){for(var r in e){var a=e[r];if(!o(a,"-")&&h[a]!==n)return"pfx"!=t||a}return!1}function c(e,t,r){for(var o in e){var i=t[e[o]];if(i!==n)return!1===r?e[o]:a(i,"function")?i.bind(r||t):i}return!1}function s(e,t,n){var r=e.charAt(0).toUpperCase()+e.slice(1),o=(e+" "+g.join(r+" ")+r).split(" ");return a(t,"string")||a(t,"undefined")?i(o,t):(o=(e+" "+y.join(r+" ")+r).split(" "),c(o,t,n))}var l,u,d={},f=t.documentElement,m="modernizr",p=t.createElement(m),h=p.style,v="Webkit Moz O ms",g=v.split(" "),y=v.toLowerCase().split(" "),E={},C=[],b=C.slice,x=function(e,n,r,a){var o,i,c,s,l=t.createElement("div"),u=t.body,d=u||t.createElement("body");if(parseInt(r,10))for(;r--;)c=t.createElement("div"),c.id=a?a[r]:m+(r+1),l.appendChild(c);return o=["&#173;",'<style id="s',m,'">',e,"</style>"].join(""),l.id=m,(u?l:d).innerHTML+=o,d.appendChild(l),u||(d.style.background="",d.style.overflow="hidden",s=f.style.overflow,f.style.overflow="hidden",f.appendChild(d)),i=n(l,e),u?l.parentNode.removeChild(l):(d.parentNode.removeChild(d),f.style.overflow=s),!!i},w={}.hasOwnProperty;u=a(w,"undefined")||a(w.call,"undefined")?function(e,t){return t in e&&a(e.constructor.prototype[t],"undefined")}:function(e,t){return w.call(e,t)},Function.prototype.bind||(Function.prototype.bind=function(e){var t=this;if("function"!=typeof t)throw new TypeError;var n=b.call(arguments,1),r=function(){if(this instanceof r){var a=function(){};a.prototype=t.prototype;var o=new a,i=t.apply(o,n.concat(b.call(arguments)));return Object(i)===i?i:o}return t.apply(e,n.concat(b.call(arguments)))};return r}),E.flexbox=function(){return s("flexWrap")},E.canvas=function(){var e=t.createElement("canvas");return!!e.getContext&&!!e.getContext("2d")},E.canvastext=function(){return!!d.canvas&&!!a(t.createElement("canvas").getContext("2d").fillText,"function")},E.cssanimations=function(){return s("animationName")},E.csstransforms=function(){return!!s("transform")},E.csstransitions=function(){return s("transition")};for(var M in E)u(E,M)&&(l=M.toLowerCase(),d[l]=E[M](),C.push((d[l]?"":"no-")+l));return d.addTest=function(e,t){if("object"==typeof e)for(var r in e)u(e,r)&&d.addTest(r,e[r]);else{if(e=e.toLowerCase(),d[e]!==n)return d;t="function"==typeof t?t():t,f.className+=" "+(t?"":"no-")+e,d[e]=t}return d},r(""),p=null,function(e,t){function n(e,t){var n=e.createElement("p"),r=e.getElementsByTagName("head")[0]||e.documentElement;return n.innerHTML="x<style>"+t+"</style>",r.insertBefore(n.lastChild,r.firstChild)}function r(){var e=v.elements;return"string"==typeof e?e.split(" "):e}function a(e){var t=h[e[m]];return t||(t={},p++,e[m]=p,h[p]=t),t}function o(e,n,r){if(n||(n=t),l)return n.createElement(e);r||(r=a(n));var o;return!(o=r.cache[e]?r.cache[e].cloneNode():f.test(e)?(r.cache[e]=r.createElem(e)).cloneNode():r.createElem(e)).canHaveChildren||d.test(e)||o.tagUrn?o:r.frag.appendChild(o)}function i(e,t){t.cache||(t.cache={},t.createElem=e.createElement,t.createFrag=e.createDocumentFragment,t.frag=t.createFrag()),e.createElement=function(n){return v.shivMethods?o(n,e,t):t.createElem(n)},e.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+r().join().replace(/[\w\-]+/g,function(e){return t.createElem(e),t.frag.createElement(e),'c("'+e+'")'})+");return n}")(v,t.frag)}function c(e){e||(e=t);var r=a(e);return v.shivCSS&&!s&&!r.hasCSS&&(r.hasCSS=!!n(e,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),l||i(e,r),e}var s,l,u=e.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,m="_html5shiv",p=0,h={};!function(){try{var e=t.createElement("a");e.innerHTML="<xyz></xyz>",s="hidden"in e,l=1==e.childNodes.length||function(){t.createElement("a");var e=t.createDocumentFragment();return void 0===e.cloneNode||void 0===e.createDocumentFragment||void 0===e.createElement}()}catch(e){s=!0,l=!0}}();var v={elements:u.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==u.shivCSS,supportsUnknownElements:l,shivMethods:!1!==u.shivMethods,type:"default",shivDocument:c,createElement:o,createDocumentFragment:function(e,n){if(e||(e=t),l)return e.createDocumentFragment();for(var o=(n=n||a(e)).frag.cloneNode(),i=0,c=r(),s=c.length;i<s;i++)o.createElement(c[i]);return o}};e.html5=v,c(t)}(this,t),d._version="2.8.3",d._domPrefixes=y,d._cssomPrefixes=g,d.mq=function(t){var n=e.matchMedia||e.msMatchMedia;if(n)return n(t)&&n(t).matches||!1;var r;return x("@media "+t+" { #"+m+" { position: absolute; } }",function(t){r="absolute"==(e.getComputedStyle?getComputedStyle(t,null):t.currentStyle).position}),r},d.testProp=function(e){return i([e])},d.testAllProps=s,d.testStyles=x,f.className=f.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+" js "+C.join(" "),d}(this,this.document),Modernizr.addTest("emoji",function(){if(!Modernizr.canvastext)return!1;var e=document.createElement("canvas").getContext("2d");return e.textBaseline="top",e.font="32px Arial",e.fillText("😃",0,0),0!==e.getImageData(16,16,1,1).data[0]});
window.matchMedia=window.matchMedia||function(e){"use strict";var t,n=e.documentElement,a=n.firstElementChild||n.firstChild,s=e.createElement("body"),i=e.createElement("div");return i.id="mq-test-1",i.style.cssText="position:absolute;top:-100em",s.style.background="none",s.appendChild(i),function(e){return i.innerHTML='&shy;<style media="'+e+'"> #mq-test-1 { width: 42px; }</style>',n.insertBefore(s,a),t=42===i.offsetWidth,n.removeChild(s),{matches:t,media:e}}}(document),function(e){"use strict";function t(){E(!0)}var n={};if(e.respond=n,n.update=function(){},n.mediaQueriesSupported=e.matchMedia&&e.matchMedia("only all").matches,!n.mediaQueriesSupported){var a,s,i,r=e.document,o=r.documentElement,l=[],d=[],m=[],h={},u=r.getElementsByTagName("head")[0]||o,c=r.getElementsByTagName("base")[0],p=u.getElementsByTagName("link"),f=[],y=function(){for(var t=0;p.length>t;t++){var n=p[t],a=n.href,s=n.media,i=n.rel&&"stylesheet"===n.rel.toLowerCase();a&&i&&!h[a]&&(n.styleSheet&&n.styleSheet.rawCssText?(g(n.styleSheet.rawCssText,a,s),h[a]=!0):(!/^([a-zA-Z:]*\/\/)/.test(a)&&!c||a.replace(RegExp.$1,"").split("/")[0]===e.location.host)&&f.push({href:a,media:s}))}v()},v=function(){if(f.length){var t=f.shift();w(t.href,function(n){g(n,t.href,t.media),h[t.href]=!0,e.setTimeout(function(){v()},0)})}},g=function(e,t,n){var a=e.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),s=a&&a.length||0;t=t.substring(0,t.lastIndexOf("/"));var i=function(e){return e.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+t+"$2$3")},r=!s&&n;t.length&&(t+="/"),r&&(s=1);for(var o=0;s>o;o++){var m,h,u,c;r?(m=n,d.push(i(e))):(m=a[o].match(/@media *([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,d.push(RegExp.$2&&i(RegExp.$2))),c=(u=m.split(",")).length;for(var p=0;c>p;p++)h=u[p],l.push({media:h.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/)&&RegExp.$2||"all",rules:d.length-1,hasquery:h.indexOf("(")>-1,minw:h.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:h.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}E()},x=function(){var e,t=r.createElement("div"),n=r.body,a=!1;return t.style.cssText="position:absolute;font-size:1em;width:1em",n||(n=a=r.createElement("body"),n.style.background="none"),n.appendChild(t),o.insertBefore(n,o.firstChild),e=t.offsetWidth,a?o.removeChild(n):n.removeChild(t),e=i=parseFloat(e)},E=function(t){var n="clientWidth",h=o[n],c="CSS1Compat"===r.compatMode&&h||r.body[n]||h,f={},y=p[p.length-1],v=(new Date).getTime();if(t&&a&&30>v-a)return e.clearTimeout(s),void(s=e.setTimeout(E,30));a=v;for(var g in l)if(l.hasOwnProperty(g)){var w=l[g],T=w.minw,C=w.maxw,S=null===T,$=null===C;T&&(T=parseFloat(T)*(T.indexOf("em")>-1?i||x():1)),C&&(C=parseFloat(C)*(C.indexOf("em")>-1?i||x():1)),w.hasquery&&(S&&$||!(S||c>=T)||!($||C>=c))||(f[w.media]||(f[w.media]=[]),f[w.media].push(d[w.rules]))}for(var b in m)m.hasOwnProperty(b)&&m[b]&&m[b].parentNode===u&&u.removeChild(m[b]);for(var R in f)if(f.hasOwnProperty(R)){var M=r.createElement("style"),O=f[R].join("\n");M.type="text/css",M.media=R,u.insertBefore(M,y.nextSibling),M.styleSheet?M.styleSheet.cssText=O:M.appendChild(r.createTextNode(O)),m.push(M)}},w=function(e,t){var n=T();n&&(n.open("GET",e,!0),n.onreadystatechange=function(){4!==n.readyState||200!==n.status&&304!==n.status||t(n.responseText)},4!==n.readyState&&n.send(null))},T=function(){var t=!1;try{t=new e.XMLHttpRequest}catch(n){t=new e.ActiveXObject("Microsoft.XMLHTTP")}return function(){return t}}();y(),n.update=y,e.addEventListener?e.addEventListener("resize",t,!1):e.attachEvent&&e.attachEvent("onresize",t)}}(this);
window.CF={params:{device:{hiRes:!0,relativeSize:"small"}},boundEvents:{internalLinks:!1}},CF.immediate=function(e,i){"use strict";var a={init:function(){a.responsiveModeSet()},responsiveModeSet:function(){var a=document.querySelector("html");e.mq("only screen and (min-width: 720px)")?i.params.device.relativeSize="x-large":e.mq("only screen and (min-width: 600px)")?i.params.device.relativeSize="large":e.mq("only screen and (min-width: 500px)")&&(i.params.device.relativeSize="medium"),a.setAttribute("data-relative-size",i.params.device.relativeSize),a.classList?(a.classList.remove("small"),a.classList.remove("medium"),a.classList.remove("large"),a.classList.remove("x-large"),a.classList.add(i.params.device.relativeSize)):a.className=a.className.replace(new RegExp("(^|\\b)"+a.split(" ").join("|")+"(\\b|$)","gi")," ")+" "+i.params.device.relativeSize}};return{init:a.init,responsiveModeSet:a.responsiveModeSet}}(Modernizr,CF),CF.immediate.init();
CF.discussion=function(i,n){"use strict";return{init:{init:function(){}}.init}}(Modernizr,CF);
CF.discussions=function(i,n){"use strict";return{init:{init:function(){}}.init}}(Modernizr,CF);
CF.global=function(e,t){"use strict";var n={init:function(){var a,s,o=document.querySelector("body"),i=0,l=document.querySelector("body > header"),c=document.querySelector("main"),r=l.querySelector("nav ul.account");o.className="floating-header",c.style.paddingTop=l.getBoundingClientRect().height-1+"px",window.addEventListener("scroll",function(e){i>o.getBoundingClientRect().top&&Math.abs(o.getBoundingClientRect().top)>l.getBoundingClientRect().height&&!n.hasClass(o,"floating-header-hidden")?(n.removeClass(o,"floating-header-active"),o.className+=" floating-header-hidden"):o.getBoundingClientRect().top>i&&(n.removeClass(o,"floating-header-hidden"),n.hasClass(o,"floating-header-active")||(o.className+=" floating-header-active")),0===o.getBoundingClientRect().top&&(o.className="floating-header"),i=o.getBoundingClientRect().top}),(e.csstransitions&&"small"===t.params.device.relativeSize||"medium"===t.params.device.relativeSize)&&((s=document.createElement("div")).className="main-menu-icon",s.appendChild(document.createTextNode("Menu")),l.appendChild(s),n.menu({menu:"header nav",trigger:"header .main-menu-icon",position:"left"})),"large"!==t.params.device.relativeSize&&"x-large"!==t.params.device.relativeSize||(r.addEventListener("mouseleave",function(e){a=setTimeout(function(){n.removeClass(r,"active")},500)},!1),r.addEventListener("mouseover",function(e){a&&clearTimeout(a)}),n.hasClass(l,"authenticated")&&(l.querySelector("a.account").addEventListener("click",function(e){n.hasClass(r,"active")?n.removeClass(r,"active"):r.className+=" active",e.preventDefault()}),window.addEventListener("scroll",function(e){n.hasClass(r,"active")&&n.removeClass(r,"active")}))),n.viewportResizeCheck("responsiveModeSet",t.immediate.responsiveModeSet),n.viewportResizeCheck("frameworkReinit",t.global.init)},collapseQuotes:function(){for(var e=document.body.querySelectorAll("section.content > blockquote"),t=0;t<e.length;t++)e[t].querySelector("blockquote")&&function(e){var t=document.createElement("a");t.setAttribute("href","#"),t.classList.add("expand"),t.innerHTML="Expand",t.addEventListener("click",function(n){n.preventDefault(),e.classList.toggle("expanded"),"Expand"===t.innerHTML?t.innerHTML="Collapse":t.innerHTML="Expand"}),e.classList.add("nested"),e.appendChild(t)}(e[t])},menu:function(e){var t,a=document.querySelector("body");document.querySelector(e.trigger).addEventListener("click",function(){var s=document.querySelector(e.menu),o=document.createElement("div");t=s.cloneNode(!0),a.appendChild(t),o.className="menu-shadow",a.appendChild(o),!1===e.keepClass?t.className="slide-menu "+e.position:t.className+=" slide-menu "+e.position,n.hasClass(a,"menu-open")?(n.removeClass(a,"menu-open"),n.removeClass(t,"open"),a.className+=" menu-closing",setTimeout(function(){n.removeClass(a,"menu-closing")},200)):(a.className+=" menu-opening",setTimeout(function(){n.removeClass(a,"menu-opening"),a.className+=" menu-open",t.className+=" open"},200)),o.addEventListener("click",function(){n.removeClass(a,"menu-open"),n.removeClass(t,"open"),a.className+=" menu-closing",setTimeout(function(){n.removeClass(a,"menu-closing"),a.removeChild(o),null!==t.parentNode&&a.removeChild(t)},200)},!1)},!1)},hasClass:function(e,t){return e.classList?e.classList.contains(t):new RegExp("(^| )"+t+"( |$)","gi").test(e.className)},removeClass:function(e,t){e.classList?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)"+t.split(" ").join("|")+"(\\b|$)","gi")," ")},toggleClass:function(e,t){n.hasClass(e,t)?n.removeClass(e,t):e.className+=" "+t},ajaxFormBinding:function(e){var t=document.querySelector(e.formSelector),n=e.format||"json",a=e.type||"direct";t.addEventListener("submit",function(e){var s,o=new XMLHttpRequest,i=new FormData(t);e.preventDefault(),o.open("POST",t.action+"/format/"+n+"/type/"+a,!0),o.setRequestHeader("X-Requested-With","XMLHttpRequest"),o.send(i),o.onreadystatechange=function(){console.log("readyState: "+o.readyState),console.log("status: "+o.status)},o.onload=function(){o.status>=200&&o.status<400&&(s=JSON.parse(o.responseText),console.log(s))},o.onerror=function(){}}),t.addEventListener("click",function(e){for(var n=document.createElement("input"),a=t.querySelectorAll('input[type="hidden"].submit-surrogate'),s=0;s<a.length;s++)t.removeChild(a[s]);e.target.type&&"submit"===e.target.type.toLowerCase()&&(n.name=e.target.name,n.type="hidden",n.value=e.target.value,n.className="submit-surrogate",t.appendChild(n))})},viewportResizeCheck:function(e,t){var n=document.body.clientWidth,a=0;window.addEventListener("resize",function(e){clearTimeout(a),a=setTimeout(function(){document.body.clientWidth!==n&&(n=document.body.clientWidth,t())},500)})}};return{collapseQuotes:n.collapseQuotes,init:n.init,menu:n.menu,hasClass:n.hasClass,removeClass:n.removeClass,ajaxFormBinding:n.ajaxFormBinding}}(Modernizr,CF);
CF.index=function(i,n){"use strict";return{init:{init:function(){}}.init}}(Modernizr,CF);
CF.init=function(){"use strict";var t=document.getElementsByTagName("body")[0],e=t.getAttribute("data-controller"),i=t.getAttribute("data-action"),n=t.getAttribute("data-view");CF.global.init(),CF[e]&&(CF[e].init(),CF[e][i]&&"function"==typeof CF[e][i]&&(CF[e][i](),CF[e][i][n]&&CF[e][i][n]()))},document.onreadystatechange=function(){"use strict";"interactive"===document.readyState&&CF.init()};
CF.post=function(i,t){"use strict";return{init:{init:function(){t.global.collapseQuotes()}}.init}}(Modernizr,CF);
CF.topic=function(e,t){"use strict";var n,o;return n={handler:function(){var e,n=document.querySelector("#quick-reply-form");n&&!t.global.hasClass(n.parentNode,"quote")&&o.postContent(),"x-large"===t.params.device.relativeSize&&((e=document.createElement("div")).setAttribute("id","mask"),document.body.appendChild(e),document.querySelectorAll("section.posts article.post section.content.post p > img, section.posts article.post section.content.post > img").forEach(function(t,n,o){var a=document.createElement("span"),s=document.createElement("span"),c=t.parentNode,i=t.getAttribute("src");a.classList.add("zoom"),s.classList.add("zoom-image"),a.appendChild(s),c.appendChild(a),c.insertBefore(a,t),s.appendChild(t),s.addEventListener("click",function(t){e.innerHTML='<div id="mask-close"></div><img src="'+i+'"><a class="open-tab" href="'+i+'" target="_blank">'+i+"</a>",document.body.classList.remove("floating-header-active"),document.body.classList.add("floating-header-hidden"),document.querySelector("html").classList.add("mask-enabled"),e.classList.add("enabled"),e.querySelector("#mask-close").addEventListener("click",function(t){e.classList.add("closing"),document.querySelector("html").classList.remove("mask-enabled"),setTimeout(function(){e.classList.remove("closing","enabled"),e.innerHTML=""},200)})})}))},start:function(){o.postContent()},reply:function(){var e=document.querySelector("#topic-reply-form");e&&!t.global.hasClass(e.parentNode,"quote")&&o.postContent()}},o={init:function(){t.global.collapseQuotes()},postContent:function(){var e=document.getElementById("post-content"),t=e?e.value:"";e&&(e.addEventListener("focus",function(n){e.value===t&&(e.value="")}),e.addEventListener("blur",function(n){""===e.value&&(e.value=t)}))}},{init:o.init,handler:n.handler,start:n.start,startPrivate:n.start,startAnnouncement:n.start,reply:n.reply}}(Modernizr,CF),CF.announcement=CF.topic;
CF.user=function(i,n){"use strict";return{init:{init:function(){n.global.collapseQuotes()}}.init}}(Modernizr,CF);
//# sourceMappingURL=debug.js.map
