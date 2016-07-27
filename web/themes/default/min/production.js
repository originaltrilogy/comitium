window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return"pfx"!=b||e}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),E(e,b,c))}var k,u,y,d="2.8.3",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,m=({}.toString,"Webkit Moz O ms"),n=m.split(" "),o=m.toLowerCase().split(" "),p={},s=[],t=s.slice,v=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))for(;d--;)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},w=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b)&&c(b).matches||!1;var d;return v("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d="absolute"==(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle).position}),d},x={}.hasOwnProperty;y=B(x,"undefined")||B(x.call,"undefined")?function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")}:function(a,b){return x.call(a,b)},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if("function"!=typeof c)throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.flexbox=function(){return F("flexWrap")},p.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},p.canvastext=function(){return!!e.canvas&&!!B(b.createElement("canvas").getContext("2d").fillText,"function")},p.cssanimations=function(){return F("animationName")},p.csstransforms=function(){return!!F("transform")},p.csstransitions=function(){return F("transition")};for(var G in p)y(p,G)&&(u=G.toLowerCase(),e[u]=p[G](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if("object"==typeof a)for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{if(a=a.toLowerCase(),e[a]!==c)return e;b="function"==typeof b?b():b,"undefined"!=typeof f&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function l(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function m(){var a=s.elements;return"string"==typeof a?a.split(" "):a}function n(a){var b=j[a[h]];return b||(b={},i++,a[h]=i,j[i]=b),b}function o(a,c,d){if(c||(c=b),k)return c.createElement(a);d||(d=n(c));var g;return g=d.cache[a]?d.cache[a].cloneNode():f.test(a)?(d.cache[a]=d.createElem(a)).cloneNode():d.createElem(a),!g.canHaveChildren||e.test(a)||g.tagUrn?g:d.frag.appendChild(g)}function p(a,c){if(a||(a=b),k)return a.createDocumentFragment();c=c||n(a);for(var d=c.frag.cloneNode(),e=0,f=m(),g=f.length;e<g;e++)d.createElement(f[e]);return d}function q(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return s.shivMethods?o(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(s,b.frag)}function r(a){a||(a=b);var c=n(a);return s.shivCSS&&!g&&!c.hasCSS&&(c.hasCSS=!!l(a,"article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}")),k||q(a,c),a}var g,k,c="3.7.0",d=a.html5||{},e=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,f=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,h="_html5shiv",i=0,j={};!function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",g="hidden"in a,k=1==a.childNodes.length||function(){b.createElement("a");var a=b.createDocumentFragment();return"undefined"==typeof a.cloneNode||"undefined"==typeof a.createDocumentFragment||"undefined"==typeof a.createElement}()}catch(c){g=!0,k=!0}}();var s={elements:d.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:c,shivCSS:d.shivCSS!==!1,supportsUnknownElements:k,shivMethods:d.shivMethods!==!1,type:"default",shivDocument:r,createElement:o,createDocumentFragment:p};a.html5=s,r(b)}(this,b),e._version=d,e._domPrefixes=o,e._cssomPrefixes=n,e.mq=w,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=v,g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+s.join(" "):""),e}(this,this.document),Modernizr.addTest("emoji",function(){if(!Modernizr.canvastext)return!1;var a=document.createElement("canvas"),b=a.getContext("2d");return b.textBaseline="top",b.font="32px Arial",b.fillText("😃",0,0),0!==b.getImageData(16,16,1,1).data[0]}),window.matchMedia=window.matchMedia||function(a){"use strict";var c,d=a.documentElement,e=d.firstElementChild||d.firstChild,f=a.createElement("body"),g=a.createElement("div");return g.id="mq-test-1",g.style.cssText="position:absolute;top:-100em",f.style.background="none",f.appendChild(g),function(a){return g.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',d.insertBefore(f,e),c=42===g.offsetWidth,d.removeChild(f),{matches:c,media:a}}}(document),function(a){"use strict";function x(){u(!0)}var b={};if(a.respond=b,b.update=function(){},b.mediaQueriesSupported=a.matchMedia&&a.matchMedia("only all").matches,!b.mediaQueriesSupported){var q,r,t,c=a.document,d=c.documentElement,e=[],f=[],g=[],h={},i=30,j=c.getElementsByTagName("head")[0]||d,k=c.getElementsByTagName("base")[0],l=j.getElementsByTagName("link"),m=[],n=function(){for(var b=0;l.length>b;b++){var c=l[b],d=c.href,e=c.media,f=c.rel&&"stylesheet"===c.rel.toLowerCase();d&&f&&!h[d]&&(c.styleSheet&&c.styleSheet.rawCssText?(p(c.styleSheet.rawCssText,d,e),h[d]=!0):(!/^([a-zA-Z:]*\/\/)/.test(d)&&!k||d.replace(RegExp.$1,"").split("/")[0]===a.location.host)&&m.push({href:d,media:e}))}o()},o=function(){if(m.length){var b=m.shift();v(b.href,function(c){p(c,b.href,b.media),h[b.href]=!0,a.setTimeout(function(){o()},0)})}},p=function(a,b,c){var d=a.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),g=d&&d.length||0;b=b.substring(0,b.lastIndexOf("/"));var h=function(a){return a.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+b+"$2$3")},i=!g&&c;b.length&&(b+="/"),i&&(g=1);for(var j=0;g>j;j++){var k,l,m,n;i?(k=c,f.push(h(a))):(k=d[j].match(/@media *([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,f.push(RegExp.$2&&h(RegExp.$2))),m=k.split(","),n=m.length;for(var o=0;n>o;o++)l=m[o],e.push({media:l.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/)&&RegExp.$2||"all",rules:f.length-1,hasquery:l.indexOf("(")>-1,minw:l.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:l.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}u()},s=function(){var a,b=c.createElement("div"),e=c.body,f=!1;return b.style.cssText="position:absolute;font-size:1em;width:1em",e||(e=f=c.createElement("body"),e.style.background="none"),e.appendChild(b),d.insertBefore(e,d.firstChild),a=b.offsetWidth,f?d.removeChild(e):e.removeChild(b),a=t=parseFloat(a)},u=function(b){var h="clientWidth",k=d[h],m="CSS1Compat"===c.compatMode&&k||c.body[h]||k,n={},o=l[l.length-1],p=(new Date).getTime();if(b&&q&&i>p-q)return a.clearTimeout(r),void(r=a.setTimeout(u,i));q=p;for(var v in e)if(e.hasOwnProperty(v)){var w=e[v],x=w.minw,y=w.maxw,z=null===x,A=null===y,B="em";x&&(x=parseFloat(x)*(x.indexOf(B)>-1?t||s():1)),y&&(y=parseFloat(y)*(y.indexOf(B)>-1?t||s():1)),w.hasquery&&(z&&A||!(z||m>=x)||!(A||y>=m))||(n[w.media]||(n[w.media]=[]),n[w.media].push(f[w.rules]))}for(var C in g)g.hasOwnProperty(C)&&g[C]&&g[C].parentNode===j&&j.removeChild(g[C]);for(var D in n)if(n.hasOwnProperty(D)){var E=c.createElement("style"),F=n[D].join("\n");E.type="text/css",E.media=D,j.insertBefore(E,o.nextSibling),E.styleSheet?E.styleSheet.cssText=F:E.appendChild(c.createTextNode(F)),g.push(E)}},v=function(a,b){var c=w();c&&(c.open("GET",a,!0),c.onreadystatechange=function(){4!==c.readyState||200!==c.status&&304!==c.status||b(c.responseText)},4!==c.readyState&&c.send(null))},w=function(){var b=!1;try{b=new a.XMLHttpRequest}catch(c){b=new a.ActiveXObject("Microsoft.XMLHTTP")}return function(){return b}}();n(),b.update=n,a.addEventListener?a.addEventListener("resize",x,!1):a.attachEvent&&a.attachEvent("onresize",x)}}(this),window.CF={params:{device:{hiRes:!0,relativeSize:"small"}},boundEvents:{internalLinks:!1}},CF.immediate=function(Modernizr,CF){"use strict";var methods={init:function(){methods.responsiveModeSet()},responsiveModeSet:function(){var html=document.querySelector("html");Modernizr.mq("only screen and (min-width: 720px)")?CF.params.device.relativeSize="x-large":Modernizr.mq("only screen and (min-width: 600px)")?CF.params.device.relativeSize="large":Modernizr.mq("only screen and (min-width: 500px)")&&(CF.params.device.relativeSize="medium"),html.setAttribute("data-relative-size",CF.params.device.relativeSize),html.classList?(html.classList.remove("small"),html.classList.remove("medium"),html.classList.remove("large"),html.classList.remove("x-large"),html.classList.add(CF.params.device.relativeSize)):html.className=html.className.replace(new RegExp("(^|\\b)"+html.split(" ").join("|")+"(\\b|$)","gi")," ")+" "+CF.params.device.relativeSize}};return{init:methods.init,responsiveModeSet:methods.responsiveModeSet}}(Modernizr,CF),CF.immediate.init(),CF.discussion=function(Modernizr,CF){"use strict";var methods={init:function(){}};return{init:methods.init}}(Modernizr,CF),CF.discussions=function(Modernizr,CF){"use strict";var methods={init:function(){}};return{init:methods.init}}(Modernizr,CF),CF.global=function(Modernizr,CF){"use strict";var methods={init:function(){var accountNavTimer,menuIcon,body=document.querySelector("body"),bodyOffset=0,header=document.querySelector("body > header"),main=document.querySelector("main"),accountNav=header.querySelector("nav ul.account");body.className="floating-header",main.style.paddingTop=header.getBoundingClientRect().height-1+"px",window.addEventListener("scroll",function(e){bodyOffset>body.getBoundingClientRect().top&&Math.abs(body.getBoundingClientRect().top)>header.getBoundingClientRect().height&&!methods.hasClass(body,"floating-header-hidden")?(methods.removeClass(body,"floating-header-active"),body.className+=" floating-header-hidden"):body.getBoundingClientRect().top>bodyOffset&&(methods.removeClass(body,"floating-header-hidden"),methods.hasClass(body,"floating-header-active")||(body.className+=" floating-header-active")),0===body.getBoundingClientRect().top&&(body.className="floating-header"),bodyOffset=body.getBoundingClientRect().top}),(Modernizr.csstransitions&&"small"===CF.params.device.relativeSize||"medium"===CF.params.device.relativeSize)&&(menuIcon=document.createElement("div"),menuIcon.className="main-menu-icon",menuIcon.appendChild(document.createTextNode("Menu")),header.appendChild(menuIcon),methods.menu({menu:"header nav",trigger:"header .main-menu-icon",position:"left"})),"large"!==CF.params.device.relativeSize&&"x-large"!==CF.params.device.relativeSize||(accountNav.addEventListener("mouseleave",function(e){accountNavTimer=setTimeout(function(){methods.removeClass(accountNav,"active")},500)},!1),accountNav.addEventListener("mouseover",function(e){accountNavTimer&&clearTimeout(accountNavTimer)}),methods.hasClass(header,"authenticated")&&(header.querySelector("a.account").addEventListener("click",function(e){methods.hasClass(accountNav,"active")?methods.removeClass(accountNav,"active"):accountNav.className+=" active",e.preventDefault()}),window.addEventListener("scroll",function(e){methods.hasClass(accountNav,"active")&&methods.removeClass(accountNav,"active")}))),methods.viewportResizeCheck("responsiveModeSet",CF.immediate.responsiveModeSet),methods.viewportResizeCheck("frameworkReinit",CF.global.init)},menu:function(args){var menu,body=document.querySelector("body"),trigger=document.querySelector(args.trigger);trigger.addEventListener("click",function(){var source=document.querySelector(args.menu),menuShadow=document.createElement("div");menu=source.cloneNode(!0),body.appendChild(menu),menuShadow.className="menu-shadow",body.appendChild(menuShadow),args.keepClass===!1?menu.className="slide-menu "+args.position:menu.className+=" slide-menu "+args.position,methods.hasClass(body,"menu-open")?(methods.removeClass(body,"menu-open"),methods.removeClass(menu,"open"),body.className+=" menu-closing",setTimeout(function(){methods.removeClass(body,"menu-closing")},200)):(body.className+=" menu-opening",setTimeout(function(){methods.removeClass(body,"menu-opening"),body.className+=" menu-open",menu.className+=" open"},200)),menuShadow.addEventListener("click",function(){methods.removeClass(body,"menu-open"),methods.removeClass(menu,"open"),body.className+=" menu-closing",setTimeout(function(){methods.removeClass(body,"menu-closing"),body.removeChild(menuShadow),null!==menu.parentNode&&body.removeChild(menu)},200)},!1)},!1)},hasClass:function(element,className){return element.classList?element.classList.contains(className):new RegExp("(^| )"+className+"( |$)","gi").test(element.className)},removeClass:function(element,className){element.classList?element.classList.remove(className):element.className=element.className.replace(new RegExp("(^|\\b)"+className.split(" ").join("|")+"(\\b|$)","gi")," ")},toggleClass:function(element,className){methods.hasClass(element,className)?methods.removeClass(element,className):element.className+=" "+className},ajaxFormBinding:function(options){var form=document.querySelector(options.formSelector),format=options.format||"json",type=options.type||"direct";form.addEventListener("submit",function(e){var data,request=new XMLHttpRequest,formData=new FormData(form);e.preventDefault(),request.open("POST",form.action+"/format/"+format+"/type/"+type,!0),request.setRequestHeader("X-Requested-With","XMLHttpRequest"),request.send(formData),request.onreadystatechange=function(){console.log("readyState: "+request.readyState),console.log("status: "+request.status)},request.onload=function(){request.status>=200&&request.status<400&&(data=JSON.parse(request.responseText),console.log(data))},request.onerror=function(){}}),form.addEventListener("click",function(e){for(var input=document.createElement("input"),previousActions=form.querySelectorAll('input[type="hidden"].submit-surrogate'),i=0;i<previousActions.length;i++)form.removeChild(previousActions[i]);e.target.type&&"submit"===e.target.type.toLowerCase()&&(input.name=e.target.name,input.type="hidden",input.value=e.target.value,input.className="submit-surrogate",form.appendChild(input))})},viewportResizeCheck:function(namespace,callback){var windowWidth=document.body.clientWidth,delay=0;window.addEventListener("resize",function(e){clearTimeout(delay),delay=setTimeout(function(){document.body.clientWidth!==windowWidth&&(windowWidth=document.body.clientWidth,callback())},500)})}};return{init:methods.init,menu:methods.menu,hasClass:methods.hasClass,removeClass:methods.removeClass,ajaxFormBinding:methods.ajaxFormBinding}}(Modernizr,CF),CF.index=function(Modernizr,CF){"use strict";var methods={init:function(){}};return{init:methods.init}}(Modernizr,CF),CF.init=function(){"use strict";var body=document.getElementsByTagName("body")[0],controller=body.getAttribute("data-controller"),action=body.getAttribute("data-action"),view=body.getAttribute("data-view");CF.global.init(),CF[controller]&&(CF[controller].init(),CF[controller][action]&&"function"==typeof CF[controller][action]&&(CF[controller][action](),CF[controller][action][view]&&CF[controller][action][view]()))},document.onreadystatechange=function(){"use strict";"interactive"===document.readyState&&CF.init()},CF.topic=function(Modernizr,CF){"use strict";var actions,methods;return actions={handler:function(){var form=document.querySelector("#quick-reply-form");form&&!CF.global.hasClass(form.parentNode,"quote")&&methods.postContent()},start:function(){methods.postContent()},reply:function(){var form=document.querySelector("#topic-reply-form");form&&!CF.global.hasClass(form.parentNode,"quote")&&methods.postContent()}},methods={init:function(){},postContent:function(){var postContent=document.getElementById("post-content"),postContentText=postContent?postContent.value:"";postContent&&(postContent.addEventListener("focus",function(e){postContent.value===postContentText&&(postContent.value="")}),postContent.addEventListener("blur",function(e){""===postContent.value&&(postContent.value=postContentText)}))}},{init:methods.init,handler:actions.handler,start:actions.start,startPrivate:actions.start,startAnnouncement:actions.start,reply:actions.reply}}(Modernizr,CF),CF.announcement=CF.topic;
//# sourceMappingURL=production.js.map