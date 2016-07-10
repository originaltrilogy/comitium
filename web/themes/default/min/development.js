/* Modernizr 2.8.3 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-mq-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-emoji-load
 */
;



window.Modernizr = (function( window, document, undefined ) {

    var version = '2.8.3',

    Modernizr = {},

    enableClasses = true,

    docElement = document.documentElement,

    mod = 'modernizr',
    modElem = document.createElement(mod),
    mStyle = modElem.style,

    inputElem  = document.createElement('input')  ,

    smile = ':)',

    toString = {}.toString,

    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



    omPrefixes = 'Webkit Moz O ms',

    cssomPrefixes = omPrefixes.split(' '),

    domPrefixes = omPrefixes.toLowerCase().split(' '),

    ns = {'svg': 'http://www.w3.org/2000/svg'},

    tests = {},
    inputs = {},
    attrs = {},

    classes = [],

    slice = classes.slice,

    featureName,


    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

      var style, ret, node, docOverflow,
          div = document.createElement('div'),
                body = document.body,
                fakeBody = body || document.createElement('body');

      if ( parseInt(nodes, 10) ) {
                      while ( nodes-- ) {
              node = document.createElement('div');
              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
              div.appendChild(node);
          }
      }

                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
      div.id = mod;
          (body ? div : fakeBody).innerHTML += style;
      fakeBody.appendChild(div);
      if ( !body ) {
                fakeBody.style.background = '';
                fakeBody.style.overflow = 'hidden';
          docOverflow = docElement.style.overflow;
          docElement.style.overflow = 'hidden';
          docElement.appendChild(fakeBody);
      }

      ret = callback(div, rule);
        if ( !body ) {
          fakeBody.parentNode.removeChild(fakeBody);
          docElement.style.overflow = docOverflow;
      } else {
          div.parentNode.removeChild(div);
      }

      return !!ret;

    },

    testMediaQuery = function( mq ) {

      var matchMedia = window.matchMedia || window.msMatchMedia;
      if ( matchMedia ) {
        return matchMedia(mq) && matchMedia(mq).matches || false;
      }

      var bool;

      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
        bool = (window.getComputedStyle ?
                  getComputedStyle(node, null) :
                  node.currentStyle)['position'] == 'absolute';
      });

      return bool;

     },


    isEventSupported = (function() {

      var TAGNAMES = {
        'select': 'input', 'change': 'input',
        'submit': 'form', 'reset': 'form',
        'error': 'img', 'load': 'img', 'abort': 'img'
      };

      function isEventSupported( eventName, element ) {

        element = element || document.createElement(TAGNAMES[eventName] || 'div');
        eventName = 'on' + eventName;

            var isSupported = eventName in element;

        if ( !isSupported ) {
                if ( !element.setAttribute ) {
            element = document.createElement('div');
          }
          if ( element.setAttribute && element.removeAttribute ) {
            element.setAttribute(eventName, '');
            isSupported = is(element[eventName], 'function');

                    if ( !is(element[eventName], 'undefined') ) {
              element[eventName] = undefined;
            }
            element.removeAttribute(eventName);
          }
        }

        element = null;
        return isSupported;
      }
      return isEventSupported;
    })(),


    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
      hasOwnProp = function (object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function (object, property) {
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }


    if (!Function.prototype.bind) {
      Function.prototype.bind = function bind(that) {

        var target = this;

        if (typeof target != "function") {
            throw new TypeError();
        }

        var args = slice.call(arguments, 1),
            bound = function () {

            if (this instanceof bound) {

              var F = function(){};
              F.prototype = target.prototype;
              var self = new F();

              var result = target.apply(
                  self,
                  args.concat(slice.call(arguments))
              );
              if (Object(result) === result) {
                  return result;
              }
              return self;

            } else {

              return target.apply(
                  that,
                  args.concat(slice.call(arguments))
              );

            }

        };

        return bound;
      };
    }

    function setCss( str ) {
        mStyle.cssText = str;
    }

    function setCssAll( str1, str2 ) {
        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
    }

    function is( obj, type ) {
        return typeof obj === type;
    }

    function contains( str, substr ) {
        return !!~('' + str).indexOf(substr);
    }

    function testProps( props, prefixed ) {
        for ( var i in props ) {
            var prop = props[i];
            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
                return prefixed == 'pfx' ? prop : true;
            }
        }
        return false;
    }

    function testDOMProps( props, obj, elem ) {
        for ( var i in props ) {
            var item = obj[props[i]];
            if ( item !== undefined) {

                            if (elem === false) return props[i];

                            if (is(item, 'function')){
                                return item.bind(elem || obj);
                }

                            return item;
            }
        }
        return false;
    }

    function testPropsAll( prop, prefixed, elem ) {

        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

            if(is(prefixed, "string") || is(prefixed, "undefined")) {
          return testProps(props, prefixed);

            } else {
          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
          return testDOMProps(props, prefixed, elem);
        }
    }    tests['flexbox'] = function() {
      return testPropsAll('flexWrap');
    };    tests['canvas'] = function() {
        var elem = document.createElement('canvas');
        return !!(elem.getContext && elem.getContext('2d'));
    };

    tests['canvastext'] = function() {
        return !!(Modernizr['canvas'] && is(document.createElement('canvas').getContext('2d').fillText, 'function'));
    };



    tests['webgl'] = function() {
        return !!window.WebGLRenderingContext;
    };


    tests['touch'] = function() {
        var bool;

        if(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
          bool = true;
        } else {
          injectElementWithStyles(['@media (',prefixes.join('touch-enabled),('),mod,')','{#modernizr{top:9px;position:absolute}}'].join(''), function( node ) {
            bool = node.offsetTop === 9;
          });
        }

        return bool;
    };



    tests['geolocation'] = function() {
        return 'geolocation' in navigator;
    };


    tests['postmessage'] = function() {
      return !!window.postMessage;
    };


    tests['websqldatabase'] = function() {
      return !!window.openDatabase;
    };

    tests['indexedDB'] = function() {
      return !!testPropsAll("indexedDB", window);
    };

    tests['hashchange'] = function() {
      return isEventSupported('hashchange', window) && (document.documentMode === undefined || document.documentMode > 7);
    };

    tests['history'] = function() {
      return !!(window.history && history.pushState);
    };

    tests['draganddrop'] = function() {
        var div = document.createElement('div');
        return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
    };

    tests['websockets'] = function() {
        return 'WebSocket' in window || 'MozWebSocket' in window;
    };


    tests['rgba'] = function() {
        setCss('background-color:rgba(150,255,150,.5)');

        return contains(mStyle.backgroundColor, 'rgba');
    };

    tests['hsla'] = function() {
            setCss('background-color:hsla(120,40%,100%,.5)');

        return contains(mStyle.backgroundColor, 'rgba') || contains(mStyle.backgroundColor, 'hsla');
    };

    tests['multiplebgs'] = function() {
                setCss('background:url(https://),url(https://),red url(https://)');

            return (/(url\s*\(.*?){3}/).test(mStyle.background);
    };    tests['backgroundsize'] = function() {
        return testPropsAll('backgroundSize');
    };

    tests['borderimage'] = function() {
        return testPropsAll('borderImage');
    };



    tests['borderradius'] = function() {
        return testPropsAll('borderRadius');
    };

    tests['boxshadow'] = function() {
        return testPropsAll('boxShadow');
    };

    tests['textshadow'] = function() {
        return document.createElement('div').style.textShadow === '';
    };


    tests['opacity'] = function() {
                setCssAll('opacity:.55');

                    return (/^0.55$/).test(mStyle.opacity);
    };


    tests['cssanimations'] = function() {
        return testPropsAll('animationName');
    };


    tests['csscolumns'] = function() {
        return testPropsAll('columnCount');
    };


    tests['cssgradients'] = function() {
        var str1 = 'background-image:',
            str2 = 'gradient(linear,left top,right bottom,from(#9f9),to(white));',
            str3 = 'linear-gradient(left top,#9f9, white);';

        setCss(
                       (str1 + '-webkit- '.split(' ').join(str2 + str1) +
                       prefixes.join(str3 + str1)).slice(0, -str1.length)
        );

        return contains(mStyle.backgroundImage, 'gradient');
    };


    tests['cssreflections'] = function() {
        return testPropsAll('boxReflect');
    };


    tests['csstransforms'] = function() {
        return !!testPropsAll('transform');
    };


    tests['csstransforms3d'] = function() {

        var ret = !!testPropsAll('perspective');

                        if ( ret && 'webkitPerspective' in docElement.style ) {

                      injectElementWithStyles('@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}', function( node, rule ) {
            ret = node.offsetLeft === 9 && node.offsetHeight === 3;
          });
        }
        return ret;
    };


    tests['csstransitions'] = function() {
        return testPropsAll('transition');
    };



    tests['fontface'] = function() {
        var bool;

        injectElementWithStyles('@font-face {font-family:"font";src:url("https://")}', function( node, rule ) {
          var style = document.getElementById('smodernizr'),
              sheet = style.sheet || style.styleSheet,
              cssText = sheet ? (sheet.cssRules && sheet.cssRules[0] ? sheet.cssRules[0].cssText : sheet.cssText || '') : '';

          bool = /src/i.test(cssText) && cssText.indexOf(rule.split(' ')[0]) === 0;
        });

        return bool;
    };

    tests['generatedcontent'] = function() {
        var bool;

        injectElementWithStyles(['#',mod,'{font:0/0 a}#',mod,':after{content:"',smile,'";visibility:hidden;font:3px/1 a}'].join(''), function( node ) {
          bool = node.offsetHeight >= 3;
        });

        return bool;
    };
    tests['video'] = function() {
        var elem = document.createElement('video'),
            bool = false;

            try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('video/ogg; codecs="theora"')      .replace(/^no$/,'');

                            bool.h264 = elem.canPlayType('video/mp4; codecs="avc1.42E01E"') .replace(/^no$/,'');

                bool.webm = elem.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,'');
            }

        } catch(e) { }

        return bool;
    };

    tests['audio'] = function() {
        var elem = document.createElement('audio'),
            bool = false;

        try {
            if ( bool = !!elem.canPlayType ) {
                bool      = new Boolean(bool);
                bool.ogg  = elem.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,'');
                bool.mp3  = elem.canPlayType('audio/mpeg;')               .replace(/^no$/,'');

                                                    bool.wav  = elem.canPlayType('audio/wav; codecs="1"')     .replace(/^no$/,'');
                bool.m4a  = ( elem.canPlayType('audio/x-m4a;')            ||
                              elem.canPlayType('audio/aac;'))             .replace(/^no$/,'');
            }
        } catch(e) { }

        return bool;
    };


    tests['localstorage'] = function() {
        try {
            localStorage.setItem(mod, mod);
            localStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };

    tests['sessionstorage'] = function() {
        try {
            sessionStorage.setItem(mod, mod);
            sessionStorage.removeItem(mod);
            return true;
        } catch(e) {
            return false;
        }
    };


    tests['webworkers'] = function() {
        return !!window.Worker;
    };


    tests['applicationcache'] = function() {
        return !!window.applicationCache;
    };


    tests['svg'] = function() {
        return !!document.createElementNS && !!document.createElementNS(ns.svg, 'svg').createSVGRect;
    };

    tests['inlinesvg'] = function() {
      var div = document.createElement('div');
      div.innerHTML = '<svg/>';
      return (div.firstChild && div.firstChild.namespaceURI) == ns.svg;
    };

    tests['smil'] = function() {
        return !!document.createElementNS && /SVGAnimate/.test(toString.call(document.createElementNS(ns.svg, 'animate')));
    };


    tests['svgclippaths'] = function() {
        return !!document.createElementNS && /SVGClipPath/.test(toString.call(document.createElementNS(ns.svg, 'clipPath')));
    };

    function webforms() {
                                            Modernizr['input'] = (function( props ) {
            for ( var i = 0, len = props.length; i < len; i++ ) {
                attrs[ props[i] ] = !!(props[i] in inputElem);
            }
            if (attrs.list){
                                  attrs.list = !!(document.createElement('datalist') && window.HTMLDataListElement);
            }
            return attrs;
        })('autocomplete autofocus list placeholder max min multiple pattern required step'.split(' '));
                            Modernizr['inputtypes'] = (function(props) {

            for ( var i = 0, bool, inputElemType, defaultView, len = props.length; i < len; i++ ) {

                inputElem.setAttribute('type', inputElemType = props[i]);
                bool = inputElem.type !== 'text';

                                                    if ( bool ) {

                    inputElem.value         = smile;
                    inputElem.style.cssText = 'position:absolute;visibility:hidden;';

                    if ( /^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined ) {

                      docElement.appendChild(inputElem);
                      defaultView = document.defaultView;

                                        bool =  defaultView.getComputedStyle &&
                              defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
                                                                                  (inputElem.offsetHeight !== 0);

                      docElement.removeChild(inputElem);

                    } else if ( /^(search|tel)$/.test(inputElemType) ){
                                                                                    } else if ( /^(url|email)$/.test(inputElemType) ) {
                                        bool = inputElem.checkValidity && inputElem.checkValidity() === false;

                    } else {
                                        bool = inputElem.value != smile;
                    }
                }

                inputs[ props[i] ] = !!bool;
            }
            return inputs;
        })('search tel url email datetime date month week time datetime-local number range color'.split(' '));
        }
    for ( var feature in tests ) {
        if ( hasOwnProp(tests, feature) ) {
                                    featureName  = feature.toLowerCase();
            Modernizr[featureName] = tests[feature]();

            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
        }
    }

    Modernizr.input || webforms();


     Modernizr.addTest = function ( feature, test ) {
       if ( typeof feature == 'object' ) {
         for ( var key in feature ) {
           if ( hasOwnProp( feature, key ) ) {
             Modernizr.addTest( key, feature[ key ] );
           }
         }
       } else {

         feature = feature.toLowerCase();

         if ( Modernizr[feature] !== undefined ) {
                                              return Modernizr;
         }

         test = typeof test == 'function' ? test() : test;

         if (typeof enableClasses !== "undefined" && enableClasses) {
           docElement.className += ' ' + (test ? '' : 'no-') + feature;
         }
         Modernizr[feature] = test;

       }

       return Modernizr;
     };


    setCss('');
    modElem = inputElem = null;

    ;(function(window, document) {
                var version = '3.7.0';

            var options = window.html5 || {};

            var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

            var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

            var supportsHtml5Styles;

            var expando = '_html5shiv';

            var expanID = 0;

            var expandoData = {};

            var supportsUnknownElements;

        (function() {
          try {
            var a = document.createElement('a');
            a.innerHTML = '<xyz></xyz>';
                    supportsHtml5Styles = ('hidden' in a);

            supportsUnknownElements = a.childNodes.length == 1 || (function() {
                        (document.createElement)('a');
              var frag = document.createDocumentFragment();
              return (
                typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
              );
            }());
          } catch(e) {
                    supportsHtml5Styles = true;
            supportsUnknownElements = true;
          }

        }());

            function addStyleSheet(ownerDocument, cssText) {
          var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

          p.innerHTML = 'x<style>' + cssText + '</style>';
          return parent.insertBefore(p.lastChild, parent.firstChild);
        }

            function getElements() {
          var elements = html5.elements;
          return typeof elements == 'string' ? elements.split(' ') : elements;
        }

            function getExpandoData(ownerDocument) {
          var data = expandoData[ownerDocument[expando]];
          if (!data) {
            data = {};
            expanID++;
            ownerDocument[expando] = expanID;
            expandoData[expanID] = data;
          }
          return data;
        }

            function createElement(nodeName, ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createElement(nodeName);
          }
          if (!data) {
            data = getExpandoData(ownerDocument);
          }
          var node;

          if (data.cache[nodeName]) {
            node = data.cache[nodeName].cloneNode();
          } else if (saveClones.test(nodeName)) {
            node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
          } else {
            node = data.createElem(nodeName);
          }

                                                    return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
        }

            function createDocumentFragment(ownerDocument, data){
          if (!ownerDocument) {
            ownerDocument = document;
          }
          if(supportsUnknownElements){
            return ownerDocument.createDocumentFragment();
          }
          data = data || getExpandoData(ownerDocument);
          var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
          for(;i<l;i++){
            clone.createElement(elems[i]);
          }
          return clone;
        }

            function shivMethods(ownerDocument, data) {
          if (!data.cache) {
            data.cache = {};
            data.createElem = ownerDocument.createElement;
            data.createFrag = ownerDocument.createDocumentFragment;
            data.frag = data.createFrag();
          }


          ownerDocument.createElement = function(nodeName) {
                    if (!html5.shivMethods) {
              return data.createElem(nodeName);
            }
            return createElement(nodeName, ownerDocument, data);
          };

          ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                          'var n=f.cloneNode(),c=n.createElement;' +
                                                          'h.shivMethods&&(' +
                                                                                                                getElements().join().replace(/[\w\-]+/g, function(nodeName) {
            data.createElem(nodeName);
            data.frag.createElement(nodeName);
            return 'c("' + nodeName + '")';
          }) +
            ');return n}'
                                                         )(html5, data.frag);
        }

            function shivDocument(ownerDocument) {
          if (!ownerDocument) {
            ownerDocument = document;
          }
          var data = getExpandoData(ownerDocument);

          if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
            data.hasCSS = !!addStyleSheet(ownerDocument,
                                                                                'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                                                                    'mark{background:#FF0;color:#000}' +
                                                                                    'template{display:none}'
                                         );
          }
          if (!supportsUnknownElements) {
            shivMethods(ownerDocument, data);
          }
          return ownerDocument;
        }

            var html5 = {

                'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video',

                'version': version,

                'shivCSS': (options.shivCSS !== false),

                'supportsUnknownElements': supportsUnknownElements,

                'shivMethods': (options.shivMethods !== false),

                'type': 'default',

                'shivDocument': shivDocument,

                createElement: createElement,

                createDocumentFragment: createDocumentFragment
        };

            window.html5 = html5;

            shivDocument(document);

    }(this, document));

    Modernizr._version      = version;

    Modernizr._prefixes     = prefixes;
    Modernizr._domPrefixes  = domPrefixes;
    Modernizr._cssomPrefixes  = cssomPrefixes;

    Modernizr.mq            = testMediaQuery;

    Modernizr.hasEvent      = isEventSupported;

    Modernizr.testProp      = function(prop){
        return testProps([prop]);
    };

    Modernizr.testAllProps  = testPropsAll;


    Modernizr.testStyles    = injectElementWithStyles;
    Modernizr.prefixed      = function(prop, obj, elem){
      if(!obj) {
        return testPropsAll(prop, 'pfx');
      } else {
            return testPropsAll(prop, obj, elem);
      }
    };


    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

                                                    (enableClasses ? ' js ' + classes.join(' ') : '');

    return Modernizr;

})(this, this.document);
/*yepnope1.5.4|WTFPL*/
(function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}})(this,document);
Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0));};
// Requires a Modernizr build with `canvastext` included
// http://www.modernizr.com/download/#-canvas-canvastext
Modernizr.addTest('emoji', function() {
  if (!Modernizr.canvastext) return false;
  var node = document.createElement('canvas'),
      ctx = node.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '32px Arial';
  ctx.fillText('\ud83d\ude03', 0, 0); // "smiling face with open mouth" emoji
  return ctx.getImageData(16, 16, 1, 1).data[0] !== 0;
});;

/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
window.matchMedia=window.matchMedia||function(a){"use strict";var c,d=a.documentElement,e=d.firstElementChild||d.firstChild,f=a.createElement("body"),g=a.createElement("div");return g.id="mq-test-1",g.style.cssText="position:absolute;top:-100em",f.style.background="none",f.appendChild(g),function(a){return g.innerHTML='&shy;<style media="'+a+'"> #mq-test-1 { width: 42px; }</style>',d.insertBefore(f,e),c=42===g.offsetWidth,d.removeChild(f),{matches:c,media:a}}}(document);

/*! Respond.js v1.1.0: min/max-width media query polyfill. (c) Scott Jehl. MIT/GPLv2 Lic. j.mp/respondjs  */
(function(a){"use strict";function x(){u(!0)}var b={};if(a.respond=b,b.update=function(){},b.mediaQueriesSupported=a.matchMedia&&a.matchMedia("only all").matches,!b.mediaQueriesSupported){var q,r,t,c=a.document,d=c.documentElement,e=[],f=[],g=[],h={},i=30,j=c.getElementsByTagName("head")[0]||d,k=c.getElementsByTagName("base")[0],l=j.getElementsByTagName("link"),m=[],n=function(){for(var b=0;l.length>b;b++){var c=l[b],d=c.href,e=c.media,f=c.rel&&"stylesheet"===c.rel.toLowerCase();d&&f&&!h[d]&&(c.styleSheet&&c.styleSheet.rawCssText?(p(c.styleSheet.rawCssText,d,e),h[d]=!0):(!/^([a-zA-Z:]*\/\/)/.test(d)&&!k||d.replace(RegExp.$1,"").split("/")[0]===a.location.host)&&m.push({href:d,media:e}))}o()},o=function(){if(m.length){var b=m.shift();v(b.href,function(c){p(c,b.href,b.media),h[b.href]=!0,a.setTimeout(function(){o()},0)})}},p=function(a,b,c){var d=a.match(/@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi),g=d&&d.length||0;b=b.substring(0,b.lastIndexOf("/"));var h=function(a){return a.replace(/(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,"$1"+b+"$2$3")},i=!g&&c;b.length&&(b+="/"),i&&(g=1);for(var j=0;g>j;j++){var k,l,m,n;i?(k=c,f.push(h(a))):(k=d[j].match(/@media *([^\{]+)\{([\S\s]+?)$/)&&RegExp.$1,f.push(RegExp.$2&&h(RegExp.$2))),m=k.split(","),n=m.length;for(var o=0;n>o;o++)l=m[o],e.push({media:l.split("(")[0].match(/(only\s+)?([a-zA-Z]+)\s?/)&&RegExp.$2||"all",rules:f.length-1,hasquery:l.indexOf("(")>-1,minw:l.match(/\(\s*min\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||""),maxw:l.match(/\(\s*max\-width\s*:\s*(\s*[0-9\.]+)(px|em)\s*\)/)&&parseFloat(RegExp.$1)+(RegExp.$2||"")})}u()},s=function(){var a,b=c.createElement("div"),e=c.body,f=!1;return b.style.cssText="position:absolute;font-size:1em;width:1em",e||(e=f=c.createElement("body"),e.style.background="none"),e.appendChild(b),d.insertBefore(e,d.firstChild),a=b.offsetWidth,f?d.removeChild(e):e.removeChild(b),a=t=parseFloat(a)},u=function(b){var h="clientWidth",k=d[h],m="CSS1Compat"===c.compatMode&&k||c.body[h]||k,n={},o=l[l.length-1],p=(new Date).getTime();if(b&&q&&i>p-q)return a.clearTimeout(r),r=a.setTimeout(u,i),void 0;q=p;for(var v in e)if(e.hasOwnProperty(v)){var w=e[v],x=w.minw,y=w.maxw,z=null===x,A=null===y,B="em";x&&(x=parseFloat(x)*(x.indexOf(B)>-1?t||s():1)),y&&(y=parseFloat(y)*(y.indexOf(B)>-1?t||s():1)),w.hasquery&&(z&&A||!(z||m>=x)||!(A||y>=m))||(n[w.media]||(n[w.media]=[]),n[w.media].push(f[w.rules]))}for(var C in g)g.hasOwnProperty(C)&&g[C]&&g[C].parentNode===j&&j.removeChild(g[C]);for(var D in n)if(n.hasOwnProperty(D)){var E=c.createElement("style"),F=n[D].join("\n");E.type="text/css",E.media=D,j.insertBefore(E,o.nextSibling),E.styleSheet?E.styleSheet.cssText=F:E.appendChild(c.createTextNode(F)),g.push(E)}},v=function(a,b){var c=w();c&&(c.open("GET",a,!0),c.onreadystatechange=function(){4!==c.readyState||200!==c.status&&304!==c.status||b(c.responseText)},4!==c.readyState&&c.send(null))},w=function(){var b=!1;try{b=new a.XMLHttpRequest}catch(c){b=new a.ActiveXObject("Microsoft.XMLHTTP")}return function(){return b}}();n(),b.update=n,a.addEventListener?a.addEventListener("resize",x,!1):a.attachEvent&&a.attachEvent("onresize",x)}})(this);

window.CF = {
  params: {
    device: {
      hiRes: true,
      relativeSize: 'small'
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
      if ( Modernizr.mq('only screen and (min-width: 720px)') ) {
        CF.params.device.relativeSize = 'x-large';
      } else if ( Modernizr.mq('only screen and (min-width: 600px)') ) {
        CF.params.device.relativeSize = 'large';
      } else if ( Modernizr.mq('only screen and (min-width: 500px)') ) {
        CF.params.device.relativeSize = 'medium';
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
      var body = document.querySelector('body'),
          bodyOffset = 0,
          header = document.querySelector('body > header'),
          main = document.querySelector('main'),
          accountNav = header.querySelector('nav ul.account'),
          accountNavTimer,
          menuIcon;

      body.className = 'floating-header';
      // Weird artifact in Chrome causes the padding to be an extra pixel too tall, so subtract 1px
      main.style.paddingTop = ( header.getBoundingClientRect().height - 1 ) + 'px';

      window.addEventListener('scroll', function (e) {
        if ( bodyOffset > body.getBoundingClientRect().top && Math.abs(body.getBoundingClientRect().top) > header.getBoundingClientRect().height && !methods.hasClass(body, 'floating-header-hidden') ) {
          methods.removeClass(body, 'floating-header-active');
          body.className += ' floating-header-hidden';
        } else if ( body.getBoundingClientRect().top > bodyOffset ) {
          methods.removeClass(body, 'floating-header-hidden');
          if ( !methods.hasClass(body, 'floating-header-active') ) {
            body.className += ' floating-header-active';
          }
        }

        if ( body.getBoundingClientRect().top === 0 ) {
          body.className = 'floating-header';
        }

        bodyOffset = body.getBoundingClientRect().top;
      });

      if ( Modernizr.csstransitions && CF.params.device.relativeSize === 'small' || CF.params.device.relativeSize === 'medium' ) {
        menuIcon = document.createElement('div');

        menuIcon.className = 'main-menu-icon';
        menuIcon.appendChild(document.createTextNode('Menu'));
        header.appendChild(menuIcon);

        methods.menu({
          menu: 'header nav',
          trigger: 'header .main-menu-icon',
          position: 'left'
        });
      }

      if ( CF.params.device.relativeSize === 'large' || CF.params.device.relativeSize === 'x-large' ) {
        accountNav.addEventListener('mouseleave', function (e) {
          accountNavTimer = setTimeout( function () {
            methods.removeClass(accountNav, 'active');
          }, 500);
        }, false);

        accountNav.addEventListener('mouseover', function (e) {
          if ( accountNavTimer ) {
            clearTimeout(accountNavTimer);
          }
        });

        if ( methods.hasClass(header, 'authenticated') ) {
          header.querySelector('a.account').addEventListener('click', function (e) {
            if ( methods.hasClass(accountNav, 'active') ) {
              methods.removeClass(accountNav, 'active');
            } else {
              accountNav.className += ' active';
            }
            e.preventDefault();
          });

          window.addEventListener('scroll', function (e) {
            if ( methods.hasClass(accountNav, 'active') ) {
              methods.removeClass(accountNav, 'active');
            }
          });
        }
      }

      methods.viewportResizeCheck('responsiveModeSet', CF.immediate.responsiveModeSet);
      methods.viewportResizeCheck('frameworkReinit', CF.global.init);
      // methods.bindInternalLinks();
    },

    menu: function (args) {
      var body = document.querySelector('body'),
          menu,
          trigger = document.querySelector(args.trigger);

      trigger.addEventListener('click', function () {
        var source = document.querySelector(args.menu),
            menuShadow = document.createElement('div');

        menu = source.cloneNode(true);
        body.appendChild(menu);
        menuShadow.className = 'menu-shadow';
        body.appendChild(menuShadow);

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

        menuShadow.addEventListener('click', function () {
          methods.removeClass(body, 'menu-open');
          methods.removeClass(menu, 'open');
          body.className += ' menu-closing';
          setTimeout( function () {
            methods.removeClass(body, 'menu-closing');
            body.removeChild(menuShadow);
            if ( menu.parentNode !== null ) {
              body.removeChild(menu);
            }
          }, 200);
        }, false);
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

    toggleClass: function (element, className) {
      if ( methods.hasClass(element, className) ) {
        methods.removeClass(element, className);
      } else {
        element.className += ' ' + className;
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
        // console.log('CF.index.init()');
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

  var actions, methods;

	actions = {

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

	};

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
