/*!
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e(require("react")):"function"==typeof define&&define.amd?define(["react"],e):"object"==typeof exports?exports.CKEditor=e(require("react")):t.CKEditor=e(t.React)}(window,function(t){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)r.d(n,o,function(e){return t[e]}.bind(null,o));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=12)}([function(t,e,r){"use strict";var n=r(3),o="object"==typeof self&&self&&self.Object===Object&&self,a=n.a||o||Function("return this")();e.a=a},function(t,e,r){"use strict";(function(t){var n=r(3),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=o&&"object"==typeof t&&t&&!t.nodeType&&t,c=a&&a.exports===o&&n.a.process,i=function(){try{var t=a&&a.require&&a.require("util").types;return t||c&&c.binding&&c.binding("util")}catch(t){}}();e.a=i}).call(this,r(6)(t))},function(t,e,r){t.exports=r(9)()},function(t,e,r){"use strict";(function(t){var r="object"==typeof t&&t&&t.Object===Object&&t;e.a=r}).call(this,r(11))},function(t,e,r){"use strict";(function(t){var n=r(0),o=r(7),a="object"==typeof exports&&exports&&!exports.nodeType&&exports,c=a&&"object"==typeof t&&t&&!t.nodeType&&t,i=c&&c.exports===a?n.a.Buffer:void 0,u=(i?i.isBuffer:void 0)||o.a;e.a=u}).call(this,r(6)(t))},function(e,r){e.exports=t},function(t,e){t.exports=function(t){if(!t.webpackPolyfill){var e=Object.create(t);e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),Object.defineProperty(e,"exports",{enumerable:!0}),e.webpackPolyfill=1}return e}},function(t,e,r){"use strict";e.a=function(){return!1}},function(t,e,r){"use strict";(function(t){var n=r(0),o="object"==typeof exports&&exports&&!exports.nodeType&&exports,a=o&&"object"==typeof t&&t&&!t.nodeType&&t,c=a&&a.exports===o?n.a.Buffer:void 0,i=c?c.allocUnsafe:void 0;e.a=function(t,e){if(e)return t.slice();var r=t.length,n=i?i(r):new t.constructor(r);return t.copy(n),n}}).call(this,r(6)(t))},function(t,e,r){"use strict";var n=r(10);function o(){}function a(){}a.resetWarningCache=o,t.exports=function(){function t(t,e,r,o,a,c){if(c!==n){var i=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw i.name="Invariant Violation",i}}function e(){return t}t.isRequired=t;var r={array:t,bool:t,func:t,number:t,object:t,string:t,symbol:t,any:t,arrayOf:e,element:t,elementType:t,instanceOf:e,node:t,objectOf:e,oneOf:e,oneOfType:e,shape:e,exact:e,checkPropTypes:a,resetWarningCache:o};return r.PropTypes=r,r}},function(t,e,r){"use strict";t.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")()}catch(t){"object"==typeof window&&(r=window)}t.exports=r},function(t,e,r){"use strict";r.r(e);var n=r(5),o=r.n(n),a=r(2),c=r.n(a);var i=function(){this.__data__=[],this.size=0};var u=function(t,e){return t===e||t!=t&&e!=e};var f=function(t,e){for(var r=t.length;r--;)if(u(t[r][0],e))return r;return-1},s=Array.prototype.splice;var p=function(t){var e=this.__data__,r=f(e,t);return!(r<0||(r==e.length-1?e.pop():s.call(e,r,1),--this.size,0))};var l=function(t){var e=this.__data__,r=f(e,t);return r<0?void 0:e[r][1]};var b=function(t){return f(this.__data__,t)>-1};var y=function(t,e){var r=this.__data__,n=f(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};function v(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}v.prototype.clear=i,v.prototype.delete=p,v.prototype.get=l,v.prototype.has=b,v.prototype.set=y;var d=v;var h=function(){this.__data__=new d,this.size=0};var j=function(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r};var _=function(t){return this.__data__.get(t)};var O=function(t){return this.__data__.has(t)},g=r(0),m=g.a.Symbol,w=Object.prototype,x=w.hasOwnProperty,A=w.toString,P=m?m.toStringTag:void 0;var S=function(t){var e=x.call(t,P),r=t[P];try{t[P]=void 0;var n=!0}catch(t){}var o=A.call(t);return n&&(e?t[P]=r:delete t[P]),o},T=Object.prototype.toString;var E=function(t){return T.call(t)},k="[object Null]",I="[object Undefined]",z=m?m.toStringTag:void 0;var F=function(t){return null==t?void 0===t?I:k:z&&z in Object(t)?S(t):E(t)};var M=function(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)},U="[object AsyncFunction]",C="[object Function]",R="[object GeneratorFunction]",B="[object Proxy]";var D=function(t){if(!M(t))return!1;var e=F(t);return e==C||e==R||e==U||e==B},W=g.a["__core-js_shared__"],$=function(){var t=/[^.]+$/.exec(W&&W.keys&&W.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}();var V=function(t){return!!$&&$ in t},q=Function.prototype.toString;var L=function(t){if(null!=t){try{return q.call(t)}catch(t){}try{return t+""}catch(t){}}return""},N=/^\[object .+?Constructor\]$/,G=Function.prototype,H=Object.prototype,K=G.toString,Y=H.hasOwnProperty,J=RegExp("^"+K.call(Y).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Q=function(t){return!(!M(t)||V(t))&&(D(t)?J:N).test(L(t))};var X=function(t,e){return null==t?void 0:t[e]};var Z=function(t,e){var r=X(t,e);return Q(r)?r:void 0},tt=Z(g.a,"Map"),et=Z(Object,"create");var rt=function(){this.__data__=et?et(null):{},this.size=0};var nt=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},ot="__lodash_hash_undefined__",at=Object.prototype.hasOwnProperty;var ct=function(t){var e=this.__data__;if(et){var r=e[t];return r===ot?void 0:r}return at.call(e,t)?e[t]:void 0},it=Object.prototype.hasOwnProperty;var ut=function(t){var e=this.__data__;return et?void 0!==e[t]:it.call(e,t)},ft="__lodash_hash_undefined__";var st=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=et&&void 0===e?ft:e,this};function pt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}pt.prototype.clear=rt,pt.prototype.delete=nt,pt.prototype.get=ct,pt.prototype.has=ut,pt.prototype.set=st;var lt=pt;var bt=function(){this.size=0,this.__data__={hash:new lt,map:new(tt||d),string:new lt}};var yt=function(t){var e=typeof t;return"string"==e||"number"==e||"symbol"==e||"boolean"==e?"__proto__"!==t:null===t};var vt=function(t,e){var r=t.__data__;return yt(e)?r["string"==typeof e?"string":"hash"]:r.map};var dt=function(t){var e=vt(this,t).delete(t);return this.size-=e?1:0,e};var ht=function(t){return vt(this,t).get(t)};var jt=function(t){return vt(this,t).has(t)};var _t=function(t,e){var r=vt(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};function Ot(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}Ot.prototype.clear=bt,Ot.prototype.delete=dt,Ot.prototype.get=ht,Ot.prototype.has=jt,Ot.prototype.set=_t;var gt=Ot,mt=200;var wt=function(t,e){var r=this.__data__;if(r instanceof d){var n=r.__data__;if(!tt||n.length<mt-1)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new gt(n)}return r.set(t,e),this.size=r.size,this};function xt(t){var e=this.__data__=new d(t);this.size=e.size}xt.prototype.clear=h,xt.prototype.delete=j,xt.prototype.get=_,xt.prototype.has=O,xt.prototype.set=wt;var At=xt;var Pt=function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t},St=function(){try{var t=Z(Object,"defineProperty");return t({},"",{}),t}catch(t){}}();var Tt=function(t,e,r){"__proto__"==e&&St?St(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r},Et=Object.prototype.hasOwnProperty;var kt=function(t,e,r){var n=t[e];Et.call(t,e)&&u(n,r)&&(void 0!==r||e in t)||Tt(t,e,r)};var It=function(t,e,r,n){var o=!r;r||(r={});for(var a=-1,c=e.length;++a<c;){var i=e[a],u=n?n(r[i],t[i],i,r,t):void 0;void 0===u&&(u=t[i]),o?Tt(r,i,u):kt(r,i,u)}return r};var zt=function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n};var Ft=function(t){return null!=t&&"object"==typeof t},Mt="[object Arguments]";var Ut=function(t){return Ft(t)&&F(t)==Mt},Ct=Object.prototype,Rt=Ct.hasOwnProperty,Bt=Ct.propertyIsEnumerable,Dt=Ut(function(){return arguments}())?Ut:function(t){return Ft(t)&&Rt.call(t,"callee")&&!Bt.call(t,"callee")},Wt=Array.isArray,$t=r(4),Vt=9007199254740991,qt=/^(?:0|[1-9]\d*)$/;var Lt=function(t,e){var r=typeof t;return!!(e=null==e?Vt:e)&&("number"==r||"symbol"!=r&&qt.test(t))&&t>-1&&t%1==0&&t<e},Nt=9007199254740991;var Gt=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=Nt},Ht={};Ht["[object Float32Array]"]=Ht["[object Float64Array]"]=Ht["[object Int8Array]"]=Ht["[object Int16Array]"]=Ht["[object Int32Array]"]=Ht["[object Uint8Array]"]=Ht["[object Uint8ClampedArray]"]=Ht["[object Uint16Array]"]=Ht["[object Uint32Array]"]=!0,Ht["[object Arguments]"]=Ht["[object Array]"]=Ht["[object ArrayBuffer]"]=Ht["[object Boolean]"]=Ht["[object DataView]"]=Ht["[object Date]"]=Ht["[object Error]"]=Ht["[object Function]"]=Ht["[object Map]"]=Ht["[object Number]"]=Ht["[object Object]"]=Ht["[object RegExp]"]=Ht["[object Set]"]=Ht["[object String]"]=Ht["[object WeakMap]"]=!1;var Kt=function(t){return Ft(t)&&Gt(t.length)&&!!Ht[F(t)]};var Yt=function(t){return function(e){return t(e)}},Jt=r(1),Qt=Jt.a&&Jt.a.isTypedArray,Xt=Qt?Yt(Qt):Kt,Zt=Object.prototype.hasOwnProperty;var te=function(t,e){var r=Wt(t),n=!r&&Dt(t),o=!r&&!n&&Object($t.a)(t),a=!r&&!n&&!o&&Xt(t),c=r||n||o||a,i=c?zt(t.length,String):[],u=i.length;for(var f in t)!e&&!Zt.call(t,f)||c&&("length"==f||o&&("offset"==f||"parent"==f)||a&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||Lt(f,u))||i.push(f);return i},ee=Object.prototype;var re=function(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||ee)};var ne=function(t,e){return function(r){return t(e(r))}},oe=ne(Object.keys,Object),ae=Object.prototype.hasOwnProperty;var ce=function(t){if(!re(t))return oe(t);var e=[];for(var r in Object(t))ae.call(t,r)&&"constructor"!=r&&e.push(r);return e};var ie=function(t){return null!=t&&Gt(t.length)&&!D(t)};var ue=function(t){return ie(t)?te(t):ce(t)};var fe=function(t,e){return t&&It(e,ue(e),t)};var se=function(t){var e=[];if(null!=t)for(var r in Object(t))e.push(r);return e},pe=Object.prototype.hasOwnProperty;var le=function(t){if(!M(t))return se(t);var e=re(t),r=[];for(var n in t)("constructor"!=n||!e&&pe.call(t,n))&&r.push(n);return r};var be=function(t){return ie(t)?te(t,!0):le(t)};var ye=function(t,e){return t&&It(e,be(e),t)},ve=r(8);var de=function(t,e){var r=-1,n=t.length;for(e||(e=Array(n));++r<n;)e[r]=t[r];return e};var he=function(t,e){for(var r=-1,n=null==t?0:t.length,o=0,a=[];++r<n;){var c=t[r];e(c,r,t)&&(a[o++]=c)}return a};var je=function(){return[]},_e=Object.prototype.propertyIsEnumerable,Oe=Object.getOwnPropertySymbols,ge=Oe?function(t){return null==t?[]:(t=Object(t),he(Oe(t),function(e){return _e.call(t,e)}))}:je;var me=function(t,e){return It(t,ge(t),e)};var we=function(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];return t},xe=ne(Object.getPrototypeOf,Object),Ae=Object.getOwnPropertySymbols?function(t){for(var e=[];t;)we(e,ge(t)),t=xe(t);return e}:je;var Pe=function(t,e){return It(t,Ae(t),e)};var Se=function(t,e,r){var n=e(t);return Wt(t)?n:we(n,r(t))};var Te=function(t){return Se(t,ue,ge)};var Ee=function(t){return Se(t,be,Ae)},ke=Z(g.a,"DataView"),Ie=Z(g.a,"Promise"),ze=Z(g.a,"Set"),Fe=Z(g.a,"WeakMap"),Me=L(ke),Ue=L(tt),Ce=L(Ie),Re=L(ze),Be=L(Fe),De=F;(ke&&"[object DataView]"!=De(new ke(new ArrayBuffer(1)))||tt&&"[object Map]"!=De(new tt)||Ie&&"[object Promise]"!=De(Ie.resolve())||ze&&"[object Set]"!=De(new ze)||Fe&&"[object WeakMap]"!=De(new Fe))&&(De=function(t){var e=F(t),r="[object Object]"==e?t.constructor:void 0,n=r?L(r):"";if(n)switch(n){case Me:return"[object DataView]";case Ue:return"[object Map]";case Ce:return"[object Promise]";case Re:return"[object Set]";case Be:return"[object WeakMap]"}return e});var We=De,$e=Object.prototype.hasOwnProperty;var Ve=function(t){var e=t.length,r=new t.constructor(e);return e&&"string"==typeof t[0]&&$e.call(t,"index")&&(r.index=t.index,r.input=t.input),r},qe=g.a.Uint8Array;var Le=function(t){var e=new t.constructor(t.byteLength);return new qe(e).set(new qe(t)),e};var Ne=function(t,e){var r=e?Le(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.byteLength)},Ge=/\w*$/;var He=function(t){var e=new t.constructor(t.source,Ge.exec(t));return e.lastIndex=t.lastIndex,e},Ke=m?m.prototype:void 0,Ye=Ke?Ke.valueOf:void 0;var Je=function(t){return Ye?Object(Ye.call(t)):{}};var Qe=function(t,e){var r=e?Le(t.buffer):t.buffer;return new t.constructor(r,t.byteOffset,t.length)},Xe="[object Boolean]",Ze="[object Date]",tr="[object Map]",er="[object Number]",rr="[object RegExp]",nr="[object Set]",or="[object String]",ar="[object Symbol]",cr="[object ArrayBuffer]",ir="[object DataView]",ur="[object Float32Array]",fr="[object Float64Array]",sr="[object Int8Array]",pr="[object Int16Array]",lr="[object Int32Array]",br="[object Uint8Array]",yr="[object Uint8ClampedArray]",vr="[object Uint16Array]",dr="[object Uint32Array]";var hr=function(t,e,r){var n=t.constructor;switch(e){case cr:return Le(t);case Xe:case Ze:return new n(+t);case ir:return Ne(t,r);case ur:case fr:case sr:case pr:case lr:case br:case yr:case vr:case dr:return Qe(t,r);case tr:return new n;case er:case or:return new n(t);case rr:return He(t);case nr:return new n;case ar:return Je(t)}},jr=Object.create,_r=function(){function t(){}return function(e){if(!M(e))return{};if(jr)return jr(e);t.prototype=e;var r=new t;return t.prototype=void 0,r}}();var Or=function(t){return"function"!=typeof t.constructor||re(t)?{}:_r(xe(t))},gr="[object Map]";var mr=function(t){return Ft(t)&&We(t)==gr},wr=Jt.a&&Jt.a.isMap,xr=wr?Yt(wr):mr,Ar="[object Set]";var Pr=function(t){return Ft(t)&&We(t)==Ar},Sr=Jt.a&&Jt.a.isSet,Tr=Sr?Yt(Sr):Pr,Er=1,kr=2,Ir=4,zr="[object Arguments]",Fr="[object Function]",Mr="[object GeneratorFunction]",Ur="[object Object]",Cr={};Cr[zr]=Cr["[object Array]"]=Cr["[object ArrayBuffer]"]=Cr["[object DataView]"]=Cr["[object Boolean]"]=Cr["[object Date]"]=Cr["[object Float32Array]"]=Cr["[object Float64Array]"]=Cr["[object Int8Array]"]=Cr["[object Int16Array]"]=Cr["[object Int32Array]"]=Cr["[object Map]"]=Cr["[object Number]"]=Cr[Ur]=Cr["[object RegExp]"]=Cr["[object Set]"]=Cr["[object String]"]=Cr["[object Symbol]"]=Cr["[object Uint8Array]"]=Cr["[object Uint8ClampedArray]"]=Cr["[object Uint16Array]"]=Cr["[object Uint32Array]"]=!0,Cr["[object Error]"]=Cr[Fr]=Cr["[object WeakMap]"]=!1;var Rr=function t(e,r,n,o,a,c){var i,u=r&Er,f=r&kr,s=r&Ir;if(n&&(i=a?n(e,o,a,c):n(e)),void 0!==i)return i;if(!M(e))return e;var p=Wt(e);if(p){if(i=Ve(e),!u)return de(e,i)}else{var l=We(e),b=l==Fr||l==Mr;if(Object($t.a)(e))return Object(ve.a)(e,u);if(l==Ur||l==zr||b&&!a){if(i=f||b?{}:Or(e),!u)return f?Pe(e,ye(i,e)):me(e,fe(i,e))}else{if(!Cr[l])return a?e:{};i=hr(e,l,u)}}c||(c=new At);var y=c.get(e);if(y)return y;if(c.set(e,i),Tr(e))return e.forEach(function(o){i.add(t(o,r,n,o,e,c))}),i;if(xr(e))return e.forEach(function(o,a){i.set(a,t(o,r,n,a,e,c))}),i;var v=s?f?Ee:Te:f?keysIn:ue,d=p?void 0:v(e);return Pt(d||e,function(o,a){d&&(o=e[a=o]),kt(i,a,t(o,r,n,a,e,c))}),i},Br=1,Dr=4;var Wr=function(t,e){return Rr(t,Br|Dr,e="function"==typeof e?e:void 0)},$r="[object Object]",Vr=Function.prototype,qr=Object.prototype,Lr=Vr.toString,Nr=qr.hasOwnProperty,Gr=Lr.call(Object);var Hr=function(t){if(!Ft(t)||F(t)!=$r)return!1;var e=xe(t);if(null===e)return!0;var r=Nr.call(e,"constructor")&&e.constructor;return"function"==typeof r&&r instanceof r&&Lr.call(r)==Gr};var Kr=function(t){return Ft(t)&&1===t.nodeType&&!Hr(t)};function Yr(t){return(Yr="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function Jr(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function Qr(t,e){return!e||"object"!==Yr(e)&&"function"!=typeof e?function(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}(t):e}function Xr(t){return(Xr=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function Zr(t,e){return(Zr=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}r.d(e,"default",function(){return tn});var tn=function(t){function e(t){var r;return function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e),(r=Qr(this,Xr(e).call(this,t))).editor=null,r.domContainer=o.a.createRef(),r}return function(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&Zr(t,e)}(e,o.a.Component),function(t,e,r){e&&Jr(t.prototype,e),r&&Jr(t,r)}(e,[{key:"componentDidUpdate",value:function(){this.editor&&"disabled"in this.props&&(this.editor.isReadOnly=this.props.disabled)}},{key:"componentDidMount",value:function(){this._initializeEditor()}},{key:"componentWillUnmount",value:function(){this._destroyEditor()}},{key:"render",value:function(){return o.a.createElement("div",{ref:this.domContainer,dangerouslySetInnerHTML:{__html:this.props.data||""}})}},{key:"_initializeEditor",value:function(){var t=this;this.props.editor.create(this.domContainer.current,function(t){return Wr(t,function(t){if(Hr(t)&&Kr(t.current)&&1===Object.keys(t).length)return t.current})}(this.props.config)).then(function(e){t.editor=e,"disabled"in t.props&&(e.isReadOnly=t.props.disabled),t.props.onInit&&t.props.onInit(e);var r=e.model.document,n=e.editing.view.document;r.on("change:data",function(r){t.props.onChange&&t.props.onChange(r,e)}),n.on("focus",function(r){t.props.onFocus&&t.props.onFocus(r,e)}),n.on("blur",function(r){t.props.onBlur&&t.props.onBlur(r,e)})}).catch(function(t){console.error(t)})}},{key:"_destroyEditor",value:function(){var t=this;this.editor&&this.editor.destroy().then(function(){t.editor=null})}}]),e}();tn.propTypes={editor:c.a.func.isRequired,data:c.a.string,config:c.a.object,onChange:c.a.func,onInit:c.a.func,onFocus:c.a.func,onBlur:c.a.func,disabled:c.a.bool},tn.defaultProps={config:{}}}]).default});
//# sourceMappingURL=ckeditor.js.map