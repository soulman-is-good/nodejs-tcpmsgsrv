"use strict";

/**
 * Class constructor
 */
var _constructor_ = function () {
  this.initialize.apply(this, arguments);
};

_constructor_.prototype.initialize = function (options) {
};

_constructor_.extend = function (obj) {
  obj = obj || {};
  var _class = _constructor_.clone();
  for (var i in obj) {
    _class.prototype[i] = obj[i];
  }

  return _class;
};

_constructor_.clone = function () {
  var temp,
      _this = this;

  temp = eval("(function(){ return " + _this.toString() + "}());");

  function extend(dest, src) {
		function get_prop(key) {
			return function(){
				return src[key];
			};
		}
    function prohibit(i) {
      throw new Error("You can not access property `" + i + "` directly");
    }
    if(src.prototype && Object.keys(src.prototype).length > 0) {
      dest.prototype = extend(dest.prototype || {}, src.prototype);
    }
    for(var i in src) {
      if(Array.isArray(src[i])) {
        dest[i] = src[i].slice(0);
      } else {
        dest[i] = src[i];
      }
			if(i.indexOf('__') === 0) {
				dest.__defineGetter(i, prohibit);
				dest.__defineSetter(i, prohibit);
				dest.__defineGetter(i.substr(2), get_prop(i));
				dest.__defineSetter(i.substr(2), prohibit);
			}
    }
    return dest;
  }

  temp = extend(temp, _this);
  return temp;
};


module.exports = _constructor_;
