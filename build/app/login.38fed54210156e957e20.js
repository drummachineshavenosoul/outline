(window.webpackJsonp=window.webpackJsonp||[]).push([["login"],{"1EJ0":function(e,t,n){"use strict";var r=n("vOnD").default.p.withConfig({displayName:"Notice",componentId:"sc-1qon07p-0"})(["background:",";color:",";padding:10px 12px;border-radius:4px;position:relative;"],(function(e){return e.theme.sidebarBackground}),(function(e){return e.theme.sidebarText}));t.a=r},"8lVk":function(e,t,n){"use strict";n.d(t,"b",(function(){return y})),n.d(t,"a",(function(){return b}));n("ma9I"),n("+2oP"),n("3KgV");var r,o,i,a=n("2vnA"),l=n("TyAF"),c=n("q1tI"),u=n("s2m+"),s=n("vOnD"),f=n("ewKk"),p=n("bgvO");function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(e){return typeof e}:function _typeof(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function _objectWithoutProperties(e,t){if(null==e)return{};var n,r,o=function _objectWithoutPropertiesLoose(e,t){if(null==e)return{};var n,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}function _initializerDefineProperty(e,t,n,r){n&&Object.defineProperty(e,t,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(r):void 0})}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function _setPrototypeOf(e,t){return e.__proto__=t,e})(e,t)}function _createSuper(e){var t=function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function _createSuperInternal(){var n,r=_getPrototypeOf(e);if(t){var o=_getPrototypeOf(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return _possibleConstructorReturn(this,n)}}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?_assertThisInitialized(e):t}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function _getPrototypeOf(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function _templateObject(){var e=function _taggedTemplateLiteral(e,t){t||(t=e.slice(0));return Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}(["\n    font-size: 16px;\n  "]);return _templateObject=function _templateObject(){return e},e}var m=s.default.textarea.withConfig({displayName:"Input__RealTextarea",componentId:"sc-1aytx6f-0"})(["border:0;flex:1;padding:8px 12px 8px ",";outline:none;background:none;color:",";&:disabled,&::placeholder{color:",";}"],(function(e){return e.hasIcon?"8px":"12px"}),(function(e){return e.theme.text}),(function(e){return e.theme.placeholder})),d=s.default.input.withConfig({displayName:"Input__RealInput",componentId:"sc-1aytx6f-1"})(["border:0;flex:1;padding:8px 12px 8px ",";outline:none;background:none;color:",";height:30px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;&:disabled,&::placeholder{color:",";}&::-webkit-search-cancel-button{-webkit-appearance:none;}",";"],(function(e){return e.hasIcon?"8px":"12px"}),(function(e){return e.theme.text}),(function(e){return e.theme.placeholder}),Object(f.a)("mobile","tablet")(_templateObject())),h=s.default.div.withConfig({displayName:"Input__Wrapper",componentId:"sc-1aytx6f-2"})(["flex:",";width:",";max-width:",";min-height:",";max-height:",";"],(function(e){return e.flex?"1":"0"}),(function(e){return e.short?"49%":"auto"}),(function(e){return e.short?"350px":"100%"}),(function(e){var t=e.minHeight;return t?"".concat(t,"px"):"0"}),(function(e){var t=e.maxHeight;return t?"".concat(t,"px"):"initial"})),g=s.default.span.withConfig({displayName:"Input__IconWrapper",componentId:"sc-1aytx6f-3"})(["position:relative;left:4px;width:24px;height:24px;"]),y=Object(s.default)(p.a).withConfig({displayName:"Input__Outline",componentId:"sc-1aytx6f-4"})(["flex:1;margin:",";color:inherit;border-width:1px;border-style:solid;border-color:",";border-radius:4px;font-weight:normal;align-items:center;overflow:hidden;"],(function(e){return void 0!==e.margin?e.margin:"0 0 16px"}),(function(e){return e.hasError?e.theme.danger:e.focused?e.theme.inputBorderFocused:e.theme.inputBorder})),b=s.default.div.withConfig({displayName:"Input__LabelText",componentId:"sc-1aytx6f-5"})(["font-weight:500;padding-bottom:4px;display:inline-block;"]),v=Object(l.d)((o=function(e){!function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}(Input,e);var t=_createSuper(Input);function Input(){var e,n;_classCallCheck(this,Input);for(var r=arguments.length,o=new Array(r),a=0;a<r;a++)o[a]=arguments[a];return _possibleConstructorReturn(n,(e=n=t.call.apply(t,[this].concat(o)),_initializerDefineProperty(n,"focused",i,_assertThisInitialized(n)),n.handleBlur=function(e){n.focused=!1,n.props.onBlur&&n.props.onBlur(e)},n.handleFocus=function(e){n.focused=!0,n.props.onFocus&&n.props.onFocus(e)},e))}return function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}(Input,[{key:"focus",value:function focus(){this.input&&this.input.focus()}},{key:"render",value:function render(){var e=this,t=this.props,n=t.type,r=void 0===n?"text":n,o=t.icon,i=t.label,a=t.margin,l=t.className,s=t.short,f=t.flex,p=t.labelHidden,v=(t.onFocus,t.onBlur,_objectWithoutProperties(t,["type","icon","label","margin","className","short","flex","labelHidden","onFocus","onBlur"])),w="textarea"===r?m:d,_=c.createElement(b,null,i);return c.createElement(h,{className:l,short:s,flex:f},c.createElement("label",null,i&&(p?c.createElement(u.a,null,_):_),c.createElement(y,{focused:this.focused,margin:a},o&&c.createElement(g,null,o),c.createElement(w,_extends({ref:function ref(t){return e.input=t},onBlur:this.handleBlur,onFocus:this.handleFocus,type:"textarea"===r?void 0:r,hasIcon:!!o},v)))))}}]),Input}(c.Component),i=function _applyDecoratedDescriptor(e,t,n,r,o){var i={};return Object.keys(r).forEach((function(e){i[e]=r[e]})),i.enumerable=!!i.enumerable,i.configurable=!!i.configurable,("value"in i||i.initializer)&&(i.writable=!0),i=n.slice().reverse().reduce((function(n,r){return r(e,t,n)||n}),i),o&&void 0!==i.initializer&&(i.value=i.initializer?i.initializer.call(o):void 0,i.initializer=void 0),void 0===i.initializer&&(Object.defineProperty(e,t,i),i=null),i}(o.prototype,"focused",[a.p],{configurable:!0,enumerable:!0,writable:!0,initializer:function initializer(){return!1}}),r=o))||r;t.c=v},AT40:function(e,t,n){"use strict";n.d(t,"b",(function(){return detectLanguage})),n.d(t,"a",(function(){return changeLanguage}));n("ma9I"),n("rB9j"),n("UxlC"),n("EnZy");function _slicedToArray(e,t){return function _arrayWithHoles(e){if(Array.isArray(e))return e}(e)||function _iterableToArrayLimit(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,l=e[Symbol.iterator]();!(r=(a=l.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e}finally{try{r||null==l.return||l.return()}finally{if(o)throw i}}return n}(e,t)||function _unsupportedIterableToArray(e,t){if(!e)return;if("string"==typeof e)return _arrayLikeToArray(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(e,t)}(e,t)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function detectLanguage(){var e=_slicedToArray(navigator.language.split("-"),2),t=e[0],n=(e[1]||t).toUpperCase();return"".concat(t,"_").concat(n)}function changeLanguage(e,t){e&&t.language!==e&&t.changeLanguage(e.replace("_","-"))}},G3hQ:function(e,t,n){"use strict";n.d(t,"a",(function(){return useQuery}));n("4mDm"),n("07d7"),n("rB9j"),n("PKPk"),n("hByQ"),n("3bBZ"),n("Kz25");var r=n("Ty5D");function useQuery(){return new URLSearchParams(Object(r.i)().search)}},Lkrs:function(e,t,n){"use strict";n("yyme");var r=n("q1tI");t.a=function OutlineLogo(e){var t=e.size,n=void 0===t?32:t,o=e.fill,i=void 0===o?"#333":o,a=e.className;return r.createElement("svg",{fill:i,width:n,height:n,viewBox:"0 0 64 64",xmlns:"http://www.w3.org/2000/svg",className:a},r.createElement("path",{d:"M32,57.6 L32,59.1606101 C32,61.3697491 30.209139,63.1606101 28,63.1606101 C27.3130526,63.1606101 26.6376816,62.9836959 26.038955,62.6469122 L2.03895504,49.1469122 C0.779447116,48.438439 -4.3614532e-15,47.1057033 -7.10542736e-15,45.6606101 L-7.10542736e-15,18.3393899 C-7.28240024e-15,16.8942967 0.779447116,15.561561 2.03895504,14.8530878 L26.038955,1.35308779 C27.9643866,0.270032565 30.4032469,0.952913469 31.4863021,2.87834498 C31.8230858,3.47707155 32,4.15244252 32,4.83938994 L32,6.4 L34.8506085,5.54481746 C36.9665799,4.91002604 39.1965137,6.11075966 39.8313051,8.22673106 C39.9431692,8.59961116 40,8.98682435 40,9.3761226 L40,11 L43.5038611,10.5620174 C45.6959408,10.2880074 47.6951015,11.8429102 47.9691115,14.0349899 C47.9896839,14.1995692 48,14.3652688 48,14.5311289 L48,49.4688711 C48,51.6780101 46.209139,53.4688711 44,53.4688711 C43.8341399,53.4688711 43.6684404,53.458555 43.5038611,53.4379826 L40,53 L40,54.6238774 C40,56.8330164 38.209139,58.6238774 36,58.6238774 C35.6107017,58.6238774 35.2234886,58.5670466 34.8506085,58.4551825 L32,57.6 Z M32,53.4238774 L36,54.6238774 L36,9.3761226 L32,10.5761226 L32,53.4238774 Z M40,15.0311289 L40,48.9688711 L44,49.4688711 L44,14.5311289 L40,15.0311289 Z M5.32907052e-15,44.4688711 L5.32907052e-15,19.5311289 L3.55271368e-15,44.4688711 Z M4,18.3393899 L4,45.6606101 L28,59.1606101 L28,4.83938994 L4,18.3393899 Z M8,21 L12,19 L12,45 L8,43 L8,21 Z"}))}},XvPW:function(e,t,n){"use strict";var r=n("vOnD").default.h1.withConfig({displayName:"Heading",componentId:"sc-1i9g1j0-0"})(["display:flex;align-items:center;"," svg{margin-top:4px;margin-left:-6px;margin-right:2px;align-self:flex-start;flex-shrink:0;}"],(function(e){return e.centered?"text-align: center;":""}));t.a=r},qn6K:function(e,t,n){"use strict";n.r(t);n("4mDm"),n("2B1R"),n("sMBO"),n("wfmh"),n("tkto"),n("07d7"),n("3bBZ");var r=n("J2m7"),o=n.n(r),i=n("TyAF"),a=n("tsqv"),l=n("q1tI"),c=n("9Koi"),u=n("3k8n"),s=n("Ty5D"),f=n("55Ip"),p=n("vOnD"),m=n("GdW1"),d=n("eJ2A"),h=Object(p.default)(d.b).withConfig({displayName:"ButtonLarge",componentId:"sc-1pi3olf-0"})(["height:40px;","{padding:4px 16px;}"],d.a),g=n("Obxi"),y=n("bgvO"),b=n("XvPW"),v=n("ml7e"),w=n("Lkrs"),_=n("xiXg"),C=n("uprV"),x=n("AT40"),E=n("1EJ0");function AlertNotice(e){var t=e.children;return l.createElement(E.a,{muted:!0},l.createElement("svg",{width:"16",height:"16",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",style:{position:"relative",top:"2px",marginRight:"4px"}},l.createElement("path",{d:"M15.6676 11.5372L10.0155 1.14735C9.10744 -0.381434 6.89378 -0.383465 5.98447 1.14735L0.332715 11.5372C-0.595598 13.0994 0.528309 15.0776 2.34778 15.0776H13.652C15.47 15.0776 16.5959 13.101 15.6676 11.5372ZM8 13.2026C7.48319 13.2026 7.0625 12.7819 7.0625 12.2651C7.0625 11.7483 7.48319 11.3276 8 11.3276C8.51681 11.3276 8.9375 11.7483 8.9375 12.2651C8.9375 12.7819 8.51681 13.2026 8 13.2026ZM8.9375 9.45257C8.9375 9.96938 8.51681 10.3901 8 10.3901C7.48319 10.3901 7.0625 9.96938 7.0625 9.45257V4.76507C7.0625 4.24826 7.48319 3.82757 8 3.82757C8.51681 3.82757 8.9375 4.24826 8.9375 4.76507V9.45257Z",fill:"currentColor"}))," ",t)}var O=n("G3hQ");function Notices(){var e=Object(O.a)(),t=e.get("notice"),n=e.get("description");return l.createElement(l.Fragment,null,"google-hd"===t&&l.createElement(AlertNotice,null,"Sorry, Google sign in cannot be used with a personal email. Please try signing in with your Google Workspace account."),"maximum-teams"===t&&l.createElement(AlertNotice,null,"The team you authenticated with is not authorized on this installation. Try another?"),"hd-not-allowed"===t&&l.createElement(AlertNotice,null,"Sorry, your Google apps domain is not allowed. Please try again with an allowed team domain."),"email-auth-required"===t&&l.createElement(AlertNotice,null,"Your account uses email sign-in, please sign-in with email to continue."),"email-auth-ratelimit"===t&&l.createElement(AlertNotice,null,"An email sign-in link was recently sent, please check your inbox or try again in a few minutes."),"auth-error"===t&&(n?l.createElement(AlertNotice,null,n):l.createElement(AlertNotice,null,"Authentication failed – we were unable to sign you in at this time. Please try again.")),"expired-token"===t&&l.createElement(AlertNotice,null,"Sorry, it looks like that sign-in link is no longer valid, please try requesting another."),"suspended"===t&&l.createElement(AlertNotice,null,"Your Outline account has been suspended. To re-activate your account, please contact a team admin."),"authentication-provider-disabled"===t&&l.createElement(AlertNotice,null,"Authentication failed – this login method was disabled by a team admin."))}n("ma9I"),n("NBAS"),n("ls82");var L=n("LCzB");n("yyme");var k=function GoogleLogo(e){var t=e.size,n=void 0===t?34:t,r=e.fill,o=void 0===r?"#FFF":r,i=e.className;return l.createElement("svg",{fill:o,width:n,height:n,viewBox:"0 0 34 34",xmlns:"http://www.w3.org/2000/svg",className:i},l.createElement("g",null,l.createElement("path",{d:"M32.6162791,13.9090909 L16.8837209,13.9090909 L16.8837209,20.4772727 L25.9395349,20.4772727 C25.0953488,24.65 21.5651163,27.0454545 16.8837209,27.0454545 C11.3581395,27.0454545 6.90697674,22.5636364 6.90697674,17 C6.90697674,11.4363636 11.3581395,6.95454545 16.8837209,6.95454545 C19.2627907,6.95454545 21.4116279,7.80454545 23.1,9.19545455 L28.0116279,4.25 C25.0186047,1.62272727 21.1813953,0 16.8837209,0 C7.52093023,0 0,7.57272727 0,17 C0,26.4272727 7.52093023,34 16.8837209,34 C25.3255814,34 33,27.8181818 33,17 C33,15.9954545 32.8465116,14.9136364 32.6162791,13.9090909 Z"})))};var I=function MicrosoftLogo(e){var t=e.size,n=void 0===t?34:t,r=e.fill,o=void 0===r?"#FFF":r,i=e.className;return l.createElement("svg",{fill:o,width:n,height:n,viewBox:"0 0 34 34",xmlns:"http://www.w3.org/2000/svg",className:i},l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M18.0002 1H33.9998C33.9998 5.8172 34.0007 10.6344 33.9988 15.4516C28.6666 15.4508 23.3334 15.4516 18.0012 15.4516C17.9993 10.6344 18.0002 5.8172 18.0002 1Z"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M18.0009 17.5173C23.3333 17.5155 28.6667 17.5164 34 17.5164V33H18C18.0009 27.8388 17.9991 22.6776 18.0009 17.5173V17.5173Z"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M0 1H16L15.9988 15.4516H0V1Z"}),l.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M0 17.5161C5.3332 17.5179 10.6664 17.5155 15.9996 17.5179C16.0005 22.6789 15.9996 27.839 15.9996 33H0V17.5161Z"}))};var P=function SlackLogo(e){var t=e.size,n=void 0===t?34:t,r=e.fill,o=void 0===r?"#FFF":r,i=e.className;return l.createElement("svg",{fill:o,width:n,height:n,viewBox:"0 0 34 34",xmlns:"http://www.w3.org/2000/svg",className:i},l.createElement("g",{stroke:"none",strokeWidth:"1",fillRule:"evenodd"},l.createElement("g",{transform:"translate(0.000000, 17.822581)"},l.createElement("path",{d:"M7.23870968,3.61935484 C7.23870968,5.56612903 5.6483871,7.15645161 3.7016129,7.15645161 C1.75483871,7.15645161 0.164516129,5.56612903 0.164516129,3.61935484 C0.164516129,1.67258065 1.75483871,0.0822580645 3.7016129,0.0822580645 L7.23870968,0.0822580645 L7.23870968,3.61935484 Z"}),l.createElement("path",{d:"M9.02096774,3.61935484 C9.02096774,1.67258065 10.6112903,0.0822580645 12.5580645,0.0822580645 C14.5048387,0.0822580645 16.0951613,1.67258065 16.0951613,3.61935484 L16.0951613,12.4758065 C16.0951613,14.4225806 14.5048387,16.0129032 12.5580645,16.0129032 C10.6112903,16.0129032 9.02096774,14.4225806 9.02096774,12.4758065 C9.02096774,12.4758065 9.02096774,3.61935484 9.02096774,3.61935484 Z"})),l.createElement("g",null,l.createElement("path",{d:"M12.5580645,7.23870968 C10.6112903,7.23870968 9.02096774,5.6483871 9.02096774,3.7016129 C9.02096774,1.75483871 10.6112903,0.164516129 12.5580645,0.164516129 C14.5048387,0.164516129 16.0951613,1.75483871 16.0951613,3.7016129 L16.0951613,7.23870968 L12.5580645,7.23870968 Z"}),l.createElement("path",{d:"M12.5580645,9.02096774 C14.5048387,9.02096774 16.0951613,10.6112903 16.0951613,12.5580645 C16.0951613,14.5048387 14.5048387,16.0951613 12.5580645,16.0951613 L3.7016129,16.0951613 C1.75483871,16.0951613 0.164516129,14.5048387 0.164516129,12.5580645 C0.164516129,10.6112903 1.75483871,9.02096774 3.7016129,9.02096774 C3.7016129,9.02096774 12.5580645,9.02096774 12.5580645,9.02096774 Z"})),l.createElement("g",{transform:"translate(17.822581, 0.000000)"},l.createElement("path",{d:"M8.93870968,12.5580645 C8.93870968,10.6112903 10.5290323,9.02096774 12.4758065,9.02096774 C14.4225806,9.02096774 16.0129032,10.6112903 16.0129032,12.5580645 C16.0129032,14.5048387 14.4225806,16.0951613 12.4758065,16.0951613 L8.93870968,16.0951613 L8.93870968,12.5580645 Z"}),l.createElement("path",{d:"M7.15645161,12.5580645 C7.15645161,14.5048387 5.56612903,16.0951613 3.61935484,16.0951613 C1.67258065,16.0951613 0.0822580645,14.5048387 0.0822580645,12.5580645 L0.0822580645,3.7016129 C0.0822580645,1.75483871 1.67258065,0.164516129 3.61935484,0.164516129 C5.56612903,0.164516129 7.15645161,1.75483871 7.15645161,3.7016129 L7.15645161,12.5580645 Z"})),l.createElement("g",{transform:"translate(17.822581, 17.822581)"},l.createElement("path",{d:"M3.61935484,8.93870968 C5.56612903,8.93870968 7.15645161,10.5290323 7.15645161,12.4758065 C7.15645161,14.4225806 5.56612903,16.0129032 3.61935484,16.0129032 C1.67258065,16.0129032 0.0822580645,14.4225806 0.0822580645,12.4758065 L0.0822580645,8.93870968 L3.61935484,8.93870968 Z"}),l.createElement("path",{d:"M3.61935484,7.15645161 C1.67258065,7.15645161 0.0822580645,5.56612903 0.0822580645,3.61935484 C0.0822580645,1.67258065 1.67258065,0.0822580645 3.61935484,0.0822580645 L12.4758065,0.0822580645 C14.4225806,0.0822580645 16.0129032,1.67258065 16.0129032,3.61935484 C16.0129032,5.56612903 14.4225806,7.15645161 12.4758065,7.15645161 L3.61935484,7.15645161 Z"}))))};var j=p.default.div.withConfig({displayName:"AuthLogo__Logo",componentId:"sc-1v38win-0"})(["display:flex;align-items:center;justify-content:center;width:24px;height:24px;"]),S=function AuthLogo(e){var t=e.providerName,n=e.size,r=void 0===n?16:n;switch(t){case"slack":return l.createElement(j,null,l.createElement(P,{size:r}));case"google":return l.createElement(j,null,l.createElement(k,{size:r}));case"azure":return l.createElement(j,null,l.createElement(I,{size:r}));default:return null}},N=n("8lVk"),A=Object(p.default)(N.c).withConfig({displayName:"InputLarge",componentId:"pm8exi-0"})(["height:38px;flex-grow:1;margin-right:8px;input{height:38px;}"]),T=n("szKb");function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function _typeof(e){return typeof e}:function _typeof(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function asyncGeneratorStep(e,t,n,r,o,i,a){try{var l=e[i](a),c=l.value}catch(e){return void n(e)}l.done?t(c):Promise.resolve(c).then(r,o)}function _asyncToGenerator(e){return function(){var t=this,n=arguments;return new Promise((function(r,o){var i=e.apply(t,n);function _next(e){asyncGeneratorStep(i,r,o,_next,_throw,"next",e)}function _throw(e){asyncGeneratorStep(i,r,o,_next,_throw,"throw",e)}_next(void 0)}))}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function _setPrototypeOf(e,t){return(_setPrototypeOf=Object.setPrototypeOf||function _setPrototypeOf(e,t){return e.__proto__=t,e})(e,t)}function _createSuper(e){var t=function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function _createSuperInternal(){var n,r=_getPrototypeOf(e);if(t){var o=_getPrototypeOf(this).constructor;n=Reflect.construct(r,arguments,o)}else n=r.apply(this,arguments);return _possibleConstructorReturn(this,n)}}function _possibleConstructorReturn(e,t){return!t||"object"!==_typeof(t)&&"function"!=typeof t?function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function _getPrototypeOf(e){return(_getPrototypeOf=Object.setPrototypeOf?Object.getPrototypeOf:function _getPrototypeOf(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}var R=function(e){!function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&_setPrototypeOf(e,t)}(Provider,e);var t=_createSuper(Provider);function Provider(){var e,n;_classCallCheck(this,Provider);for(var r=arguments.length,o=new Array(r),i=0;i<r;i++)o[i]=arguments[i];return _possibleConstructorReturn(n,(e=n=t.call.apply(t,[this].concat(o)),n.state={showEmailSignin:!1,isSubmitting:!1,email:""},n.handleChangeEmail=function(e){n.setState({email:e.target.value})},n.handleSubmitEmail=function(){var e=_asyncToGenerator(regeneratorRuntime.mark((function _callee(e){var t;return regeneratorRuntime.wrap((function _callee$(r){for(;;)switch(r.prev=r.next){case 0:if(e.preventDefault(),!n.state.showEmailSignin||!n.state.email){r.next=13;break}return n.setState({isSubmitting:!0}),r.prev=3,r.next=6,T.a.post(e.currentTarget.action,{email:n.state.email});case 6:(t=r.sent).redirect?window.location.href=t.redirect:n.props.onEmailSuccess(n.state.email);case 8:return r.prev=8,n.setState({isSubmitting:!1}),r.finish(8);case 11:r.next=14;break;case 13:n.setState({showEmailSignin:!0});case 14:case"end":return r.stop()}}),_callee,null,[[3,,8,11]])})));return function(t){return e.apply(this,arguments)}}(),e))}return function _createClass(e,t,n){return t&&_defineProperties(e.prototype,t),n&&_defineProperties(e,n),e}(Provider,[{key:"render",value:function render(){var e=this.props,t=e.isCreate,n=e.id,r=e.name,o=e.authUrl,i=e.t;return"email"===n?t?null:l.createElement(z,{key:"email"},l.createElement(B,{method:"POST",action:"/auth/email",onSubmit:this.handleSubmitEmail},this.state.showEmailSignin?l.createElement(l.Fragment,null,l.createElement(A,{type:"email",name:"email",placeholder:"me@domain.com",value:this.state.email,onChange:this.handleChangeEmail,disabled:this.state.isSubmitting,autoFocus:!0,required:!0,short:!0}),l.createElement(h,{type:"submit",disabled:this.state.isSubmitting},i("Sign In")," →")):l.createElement(h,{type:"submit",icon:l.createElement(a.EmailIcon,null),fullwidth:!0},i("Continue with Email")))):l.createElement(z,{key:n},l.createElement(h,{onClick:function onClick(){return window.location.href=o},icon:l.createElement(S,{providerName:n}),fullwidth:!0},i("Continue with {{ authProviderName }}",{authProviderName:r})))}}]),Provider}(l.Component),z=p.default.div.withConfig({displayName:"Provider__Wrapper",componentId:"sc-1wq6g5c-0"})(["margin-bottom:1em;width:100%;"]),B=p.default.form.withConfig({displayName:"Provider__Form",componentId:"sc-1wq6g5c-1"})(["width:100%;display:flex;justify-content:space-between;"]),M=Object(L.a)()(R),F=n("1fUH"),Z=n("AfkI");function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e}).apply(this,arguments)}function _slicedToArray(e,t){return function _arrayWithHoles(e){if(Array.isArray(e))return e}(e)||function _iterableToArrayLimit(e,t){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var n=[],r=!0,o=!1,i=void 0;try{for(var a,l=e[Symbol.iterator]();!(r=(a=l.next()).done)&&(n.push(a.value),!t||n.length!==t);r=!0);}catch(e){o=!0,i=e}finally{try{r||null==l.return||l.return()}finally{if(o)throw i}}return n}(e,t)||function _unsupportedIterableToArray(e,t){if(!e)return;if("string"==typeof e)return _arrayLikeToArray(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return _arrayLikeToArray(e,t)}(e,t)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var D=Object(p.default)(a.EmailIcon).withConfig({displayName:"Login__CheckEmailIcon",componentId:"pacxt2-0"})(["margin-bottom:-1.5em;"]),G=Object(p.default)(g.a).withConfig({displayName:"Login__Background",componentId:"pacxt2-1"})(["width:100vw;height:100vh;background:",";display:flex;"],(function(e){return e.theme.background})),H=p.default.div.withConfig({displayName:"Login__Logo",componentId:"pacxt2-2"})(["margin-bottom:-1.5em;height:38px;"]),W=Object(p.default)(v.a).withConfig({displayName:"Login__GetStarted",componentId:"pacxt2-3"})(["text-align:center;margin-top:-12px;"]),V=Object(p.default)(v.a).withConfig({displayName:"Login__Note",componentId:"pacxt2-4"})(["text-align:center;font-size:14px;em{font-style:normal;font-weight:500;}"]),q=p.default.a.withConfig({displayName:"Login__Back",componentId:"pacxt2-5"})(["display:flex;align-items:center;color:inherit;padding:32px;font-weight:500;position:absolute;svg{transition:transform 100ms ease-in-out;}&:hover{svg{transform:translateX(-4px);}}"]),U=p.default.hr.withConfig({displayName:"Login__Or",componentId:"pacxt2-6"})(['margin:1em 0;position:relative;width:100%;&:after{content:"Or";display:block;position:absolute;left:50%;transform:translate3d(-50%,-50%,0);text-transform:uppercase;font-size:11px;color:',";background:",";border-radius:2px;padding:0 4px;}"],(function(e){return e.theme.textSecondary}),(function(e){return e.theme.background})),J=Object(p.default)(y.a).withConfig({displayName:"Login__Centered",componentId:"pacxt2-7"})(["user-select:none;width:90vw;height:100%;max-width:320px;margin:0 auto;"]);t.default=Object(i.d)((function Login(e){var t=e.location,n=Object(O.a)(),r=Object(c.a)(),i=r.t,p=r.i18n,d=Object(Z.a)().auth,g=d.config,y=_slicedToArray(l.useState(""),2),v=y[0],E=y[1],L="/create"===t.pathname,k=l.useCallback((function(){E("")}),[]),I=l.useCallback((function(e){E(e)}),[]);if(l.useEffect((function(){d.fetchConfig()}),[d]),l.useEffect((function(){Object(x.a)(Object(x.b)(),p)}),[p]),l.useEffect((function(){var e=Object.fromEntries(n.entries());Object.keys(e).length&&!n.get("notice")&&Object(m.c)("signupQueryParams",JSON.stringify(e))}),[n]),d.authenticated)return l.createElement(s.b,{to:"/home"});if(!g)return null;var P=g.providers.length>1,j=o()(g.providers,(function(e){return e.id===d.lastSignedIn&&!L})),S="hosted"===F.a.DEPLOYMENT&&(g.hostname?l.createElement(q,{href:F.a.URL},l.createElement(a.BackIcon,{color:"currentColor"})," ",i("Back to home")):l.createElement(q,{href:"https://www.getoutline.com"},l.createElement(a.BackIcon,{color:"currentColor"})," ",i("Back to website")));return v?l.createElement(G,null,S,l.createElement(J,{align:"center",justify:"center",column:!0,auto:!0},l.createElement(_.a,{title:"Check your email"}),l.createElement(D,{size:38,color:"currentColor"}),l.createElement(b.a,{centered:!0},i("Check your email")),l.createElement(V,null,l.createElement(u.a,{defaults:"A magic sign-in link has been sent to the email <em>{{ emailLinkSentTo }}</em>, no password needed.",values:{emailLinkSentTo:v},components:{em:l.createElement("em",null)}})),l.createElement("br",null),l.createElement(h,{onClick:k,fullwidth:!0,neutral:!0},i("Back to login")))):l.createElement(G,null,S,l.createElement(J,{align:"center",justify:"center",column:!0,auto:!0},l.createElement(_.a,{title:"Login"}),l.createElement(H,null,F.a.TEAM_LOGO&&"hosted"!==F.a.DEPLOYMENT?l.createElement(C.a,{src:F.a.TEAM_LOGO}):l.createElement(w.a,{size:38,fill:"currentColor"})),L?l.createElement(l.Fragment,null,l.createElement(b.a,{centered:!0},i("Create an account")),l.createElement(W,null,i("Get started by choosing a sign-in method for your new team below…"))):l.createElement(b.a,{centered:!0},i("Login to {{ authProviderName }}",{authProviderName:g.name||"Outline"})),l.createElement(Notices,null),j&&l.createElement(l.Fragment,{key:j.id},l.createElement(M,_extends({isCreate:L,onEmailSuccess:I},j)),P&&l.createElement(l.Fragment,null,l.createElement(V,null,i("You signed in with {{ authProviderName }} last time.",{authProviderName:j.name})),l.createElement(U,null))),g.providers.map((function(e){return j&&e.id===j.id?null:l.createElement(M,_extends({key:e.id,isCreate:L,onEmailSuccess:I},e))})),L&&l.createElement(V,null,l.createElement(u.a,null,"Already have an account? Go to ",l.createElement(f.a,{to:"/"},"login"),"."))))}))},uprV:function(e,t,n){"use strict";var r=n("vOnD").default.img.withConfig({displayName:"TeamLogo",componentId:"sc-4l5u7s-0"})(["width:",";height:",";border-radius:4px;background:",";border:1px solid ",";overflow:hidden;flex-shrink:0;"],(function(e){return e.width?"".concat(e.width,"px"):e.size||"auto"}),(function(e){return e.height?"".concat(e.height,"px"):e.size||"38px"}),(function(e){return e.theme.background}),(function(e){return e.theme.divider}));t.a=r},wfmh:function(e,t,n){var r=n("I+eb"),o=n("ImZN"),i=n("hBjN");r({target:"Object",stat:!0},{fromEntries:function fromEntries(e){var t={};return o(e,(function(e,n){i(t,e,n)}),{AS_ENTRIES:!0}),t}})},yyme:function(e,t,n){var r=n("I+eb"),o=n("gdVl"),i=n("RNIs");r({target:"Array",proto:!0},{fill:o}),i("fill")}}]);
//# sourceMappingURL=login.38fed54210156e957e20.js.map