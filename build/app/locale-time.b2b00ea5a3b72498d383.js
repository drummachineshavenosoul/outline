(window.webpackJsonp=window.webpackJsonp||[]).push([["locale-time"],{fGJq:function(e,r,t){"use strict";t.r(r);t("TeQF"),t("rB9j"),t("UxlC"),t("FZtP");var n=t("7xvl"),a=t("sWYD"),o=t("iSMj"),i=t("P15I"),u=t("1UYf"),c=t("1oZ7"),l=t("1IEi"),f=t("YBtx"),s=t("JfDc"),y=t("q12y"),p=t("4Bjl"),d=t("pMJh"),m=t("o7FV"),h=t("jcCW"),_=t("rVOZ"),b=t("q1tI"),v=t("H+FO"),T=t("AfkI");function _slicedToArray(e,r){return function _arrayWithHoles(e){if(Array.isArray(e))return e}(e)||function _iterableToArrayLimit(e,r){if("undefined"==typeof Symbol||!(Symbol.iterator in Object(e)))return;var t=[],n=!0,a=!1,o=void 0;try{for(var i,u=e[Symbol.iterator]();!(n=(i=u.next()).done)&&(t.push(i.value),!r||t.length!==r);n=!0);}catch(e){a=!0,o=e}finally{try{n||null==u.return||u.return()}finally{if(a)throw o}}return t}(e,r)||function _unsupportedIterableToArray(e,r){if(!e)return;if("string"==typeof e)return _arrayLikeToArray(e,r);var t=Object.prototype.toString.call(e).slice(8,-1);"Object"===t&&e.constructor&&(t=e.constructor.name);if("Map"===t||"Set"===t)return Array.from(e);if("Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t))return _arrayLikeToArray(e,r)}(e,r)||function _nonIterableRest(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function _arrayLikeToArray(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,n=new Array(r);t<r;t++)n[t]=e[t];return n}var A={en_US:o.a,de_DE:i.a,es_ES:u.a,fa_IR:c.a,fr_FR:l.a,it_IT:f.a,ja_JP:s.a,ko_KR:y.a,pt_BR:p.a,pt_PT:d.a,zh_CN:m.a,zh_TW:h.a,ru_RU:_.a},j=[];setInterval((function(){j.forEach((function(e){return e()}))}),6e4);r.default=function LocaleTime(e){var r=e.addSuffix,t=e.children,o=e.dateTime,i=e.shorten,u=e.tooltipDelay,c=function useUserLocale(){var e=Object(T.a)().auth;if(e.user&&e.user.language)return e.user.language}(),l=_slicedToArray(b.useState(0),2),f=(l[0],l[1]),s=b.useRef();b.useEffect((function(){return s.current=function eachMinute(e){return j.push(e),function(){j=j.filter((function(r){return r!==e}))}}((function(){f((function(e){return++e}))})),function(){s.current&&s.current()}}),[]);var y=Object(n.a)(Date.parse(o),{addSuffix:r,locale:c?A[c]:void 0});return i&&(y=y.replace("about","").replace("less than a minute ago","just now").replace("minute","min")),b.createElement(v.a,{tooltip:Object(a.a)(Date.parse(o),"MMMM do, yyyy h:mm a"),delay:u,placement:"bottom"},b.createElement("time",{dateTime:o},t||y))}}}]);
//# sourceMappingURL=locale-time.b2b00ea5a3b72498d383.js.map