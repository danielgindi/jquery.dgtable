/*!
 * jquery.dgtable 0.5.28
 * git://github.com/danielgindi/jquery.dgtable.git
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) :
	typeof define === 'function' && define.amd ? define(['jquery'], factory) :
	(global = global || self, global.DGTable = factory(global.jQuery));
}(this, (function (jQuery) { 'use strict';

	jQuery = jQuery && Object.prototype.hasOwnProperty.call(jQuery, 'default') ? jQuery['default'] : jQuery;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.4',
	  mode:  'global',
	  copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (engineUserAgent) {
	  match = engineUserAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = engineUserAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var engineV8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return engineV8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

	// We can't use this feature detection in V8 since it causes
	// deoptimization and serious performance degradation
	// https://github.com/zloirock/core-js/issues/679
	var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
	  var array = [];
	  array[IS_CONCAT_SPREADABLE] = false;
	  return array.concat()[0] !== array;
	});

	var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

	var isConcatSpreadable = function (O) {
	  if (!isObject(O)) return false;
	  var spreadable = O[IS_CONCAT_SPREADABLE];
	  return spreadable !== undefined ? !!spreadable : isArray(O);
	};

	var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

	// `Array.prototype.concat` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.concat
	// with adding support of @@isConcatSpreadable and @@species
	_export({ target: 'Array', proto: true, forced: FORCED }, {
	  concat: function concat(arg) { // eslint-disable-line no-unused-vars
	    var O = toObject(this);
	    var A = arraySpeciesCreate(O, 0);
	    var n = 0;
	    var i, k, length, len, E;
	    for (i = -1, length = arguments.length; i < length; i++) {
	      E = i === -1 ? O : arguments[i];
	      if (isConcatSpreadable(E)) {
	        len = toLength(E.length);
	        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
	      } else {
	        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
	        createProperty(A, n++, E);
	      }
	    }
	    A.length = n;
	    return A;
	  }
	});

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) { throw it; };

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;

	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = { length: -1 };

	    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
	    else O[1] = 1;

	    method.call(O, argument0, argument1);
	  });
	};

	var $filter = arrayIteration.filter;



	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
	// Edge 14- issue
	var USES_TO_LENGTH = arrayMethodUsesToLength('filter');

	// `Array.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var $find = arrayIteration.find;



	var FIND = 'find';
	var SKIPS_HOLES = true;

	var USES_TO_LENGTH$1 = arrayMethodUsesToLength(FIND);

	// Shouldn't skip holes
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

	// `Array.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.find
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES || !USES_TO_LENGTH$1 }, {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND);

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $indexOf = arrayIncludes.indexOf;



	var nativeIndexOf = [].indexOf;

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var STRICT_METHOD = arrayMethodIsStrict('indexOf');
	var USES_TO_LENGTH$2 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });

	// `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || !STRICT_METHOD || !USES_TO_LENGTH$2 }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var defineProperty$1 = objectDefineProperty.f;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('slice');
	var USES_TO_LENGTH$3 = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

	var SPECIES$2 = wellKnownSymbol('species');
	var nativeSlice = [].slice;
	var max$1 = Math.max;

	// `Array.prototype.slice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.slice
	// fallback for not array-like ES3 strings and DOM objects
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$3 }, {
	  slice: function slice(start, end) {
	    var O = toIndexedObject(this);
	    var length = toLength(O.length);
	    var k = toAbsoluteIndex(start, length);
	    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
	    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
	    var Constructor, result, n;
	    if (isArray(O)) {
	      Constructor = O.constructor;
	      // cross-realm fallback
	      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
	        Constructor = undefined;
	      } else if (isObject(Constructor)) {
	        Constructor = Constructor[SPECIES$2];
	        if (Constructor === null) Constructor = undefined;
	      }
	      if (Constructor === Array || Constructor === undefined) {
	        return nativeSlice.call(O, k, fin);
	      }
	    }
	    result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
	    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
	    result.length = n;
	    return result;
	  }
	});

	var test = [];
	var nativeSort = test.sort;

	// IE8-
	var FAILS_ON_UNDEFINED = fails(function () {
	  test.sort(undefined);
	});
	// V8 bug
	var FAILS_ON_NULL = fails(function () {
	  test.sort(null);
	});
	// Old WebKit
	var STRICT_METHOD$1 = arrayMethodIsStrict('sort');

	var FORCED$1 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$1;

	// `Array.prototype.sort` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.sort
	_export({ target: 'Array', proto: true, forced: FORCED$1 }, {
	  sort: function sort(comparefn) {
	    return comparefn === undefined
	      ? nativeSort.call(toObject(this))
	      : nativeSort.call(toObject(this), aFunction$1(comparefn));
	  }
	});

	var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('splice');
	var USES_TO_LENGTH$4 = arrayMethodUsesToLength('splice', { ACCESSORS: true, 0: 0, 1: 2 });

	var max$2 = Math.max;
	var min$2 = Math.min;
	var MAX_SAFE_INTEGER$1 = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

	// `Array.prototype.splice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$4 }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = toLength(O.length);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$2(max$2(toInteger(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER$1) {
	      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
	    }
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    O.length = len - actualDeleteCount + insertCount;
	    return A;
	  }
	});

	var defineProperty$2 = objectDefineProperty.f;

	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name
	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$2(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test$1 = {};

	test$1[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test$1) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
	// so we use an intermediate function.
	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$2 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$2(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$2(true)
	};

	var charAt = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$1 = internalState.set;
	var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$1(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$1(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	// TODO: Remove from `core-js@4` since it's moved to entry points







	var SPECIES$3 = wellKnownSymbol('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	var REPLACE = wellKnownSymbol('replace');
	// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
	var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
	  if (/./[REPLACE]) {
	    return /./[REPLACE]('a', '$0') === '';
	  }
	  return false;
	})();

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$3] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(
	      REPLACE_SUPPORTS_NAMED_GROUPS &&
	      REPLACE_KEEPS_$0 &&
	      !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    )) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, {
	      REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
	      REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
	    });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];

	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var SPECIES$4 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var charAt$1 = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt$1(S, index).length : 1);
	};

	// `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var arrayPush = [].push;
	var min$3 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$3(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  if (CollectionPrototype) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
	    } catch (error) {
	      CollectionPrototype[ITERATOR$2] = ArrayValues;
	    }
	    if (!CollectionPrototype[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG$3, COLLECTION_NAME);
	    }
	    if (domIterables[COLLECTION_NAME]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var ITERATOR$3 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$3]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var nativeAssign = Object.assign;
	var defineProperty$3 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$3({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$3(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var ITERATOR$4 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$4] === it);
	};

	var ITERATOR$5 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$5]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	// `Array.from` method implementation
	// https://tc39.github.io/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  if (mapping) mapfn = functionBindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$1 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
	  delta += floor$1(delta / numPoints);
	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$1(delta / baseMinusTMin);
	  }
	  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        for (var k = base; /* no condition */; k += base) {
	          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$1(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }
	  return output.join('');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }
	  return encoded.join('.');
	};

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`





















	var $fetch = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$6 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$2 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find = /[!'()~]|%20/g;

	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$2(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

	  setInternalState$2(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () { /* empty */ },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) throw TypeError('Expected sequence with length 2');
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({ key: key, value: init[key] + '' });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);
	      else index++;
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) entries.push({ key: key, value: val });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    // Array#sort is not stable in some engines
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = functionBindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	redefine(URLSearchParamsPrototype, ITERATOR$6, URLSearchParamsPrototype.entries);

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674
	if (!nativeUrl && typeof $fetch == 'function' && typeof Headers == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input /* , init */) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`











	var codeAt = stringMultibyte.codeAt;





	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$3 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$2 = Math.floor;
	var pow = Math.pow;

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+\-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
	// eslint-disable-next-line no-control-regex
	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;
	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result;
	  // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);
	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }
	    url.host = result;
	  } else {
	    input = stringPunycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;
	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }
	    numbers.push(number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index == partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = numbers.pop();
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// eslint-disable-next-line max-statements
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (char()) {
	    if (pieceIndex == 8) return;
	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }
	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (char()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!DIGIT.test(char())) return;
	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece == 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }
	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$2(host / 256);
	    } return result.join('.');
	  // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0))
	    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
	    string.length == 2 ||
	    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;
	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	// eslint-disable-next-line max-statements
	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');

	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];
	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (
	            (isSpecial(url) != has(specialSchemes, buffer)) ||
	            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
	            (url.scheme == 'file' && !url.host)
	          )) return;
	          url.scheme = buffer;
	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }
	          buffer = '';
	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case NO_SCHEME:
	        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }
	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        } break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;
	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        } break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        } break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        } break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);
	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];
	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }
	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;
	            else url.username += encodedCodePoints;
	          }
	          buffer = '';
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;
	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;
	          else if (char == ']') seenBracket = false;
	          buffer += char;
	        } break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url)) ||
	          stateOverride
	        ) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
	            buffer = '';
	          }
	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;
	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;
	        else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }
	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        } break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }
	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
	          else url.host = base.host;
	        }
	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          } continue;
	        } else buffer += char;
	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        } break;

	      case PATH:
	        if (
	          char == EOF || char == '/' ||
	          (char == '\\' && isSpecial(url)) ||
	          (!stateOverride && (char == '?' || char == '#'))
	        ) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }
	            url.path.push(buffer);
	          }
	          buffer = '';
	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }
	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        } break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';
	          else if (char == '#') url.query += '%23';
	          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$3(that, { type: 'URL' });
	  var baseState, failure;
	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
	    else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }
	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);
	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };
	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';
	  if (host !== null) {
	    output += '//';
	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }
	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';
	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? ''
	    : port === null ? serializeHost(host)
	    : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return { get: getter, set: setter, configurable: true, enumerable: true };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;
	      else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);
	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);
	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }
	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  });
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');

	_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
	  URL: URLConstructor
	});

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
	    _typeof = function (obj) {
	      return typeof obj;
	    };
	  } else {
	    _typeof = function (obj) {
	      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	    };
	  }

	  return _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  return Constructor;
	}

	function _unsupportedIterableToArray(o, minLen) {
	  if (!o) return;
	  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
	  var n = Object.prototype.toString.call(o).slice(8, -1);
	  if (n === "Object" && o.constructor) n = o.constructor.name;
	  if (n === "Map" || n === "Set") return Array.from(n);
	  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
	}

	function _arrayLikeToArray(arr, len) {
	  if (len == null || len > arr.length) len = arr.length;

	  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

	  return arr2;
	}

	function _createForOfIteratorHelper(o) {
	  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
	    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) {
	      var i = 0;

	      var F = function () {};

	      return {
	        s: F,
	        n: function () {
	          if (i >= o.length) return {
	            done: true
	          };
	          return {
	            done: false,
	            value: o[i++]
	          };
	        },
	        e: function (e) {
	          throw e;
	        },
	        f: F
	      };
	    }

	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }

	  var it,
	      normalCompletion = true,
	      didErr = false,
	      err;
	  return {
	    s: function () {
	      it = o[Symbol.iterator]();
	    },
	    n: function () {
	      var step = it.next();
	      normalCompletion = step.done;
	      return step;
	    },
	    e: function (e) {
	      didErr = true;
	      err = e;
	    },
	    f: function () {
	      try {
	        if (!normalCompletion && it.return != null) it.return();
	      } finally {
	        if (didErr) throw err;
	      }
	    }
	  };
	}

	var max$3 = Math.max;
	var min$4 = Math.min;
	var floor$3 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// @@replace logic
	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = reason.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE;
	  var REPLACE_KEEPS_$0 = reason.REPLACE_KEEPS_$0;
	  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

	  return [
	    // `String.prototype.replace` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return replacer !== undefined
	        ? replacer.call(searchValue, O, replaceValue)
	        : nativeReplace.call(String(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	    function (regexp, replaceValue) {
	      if (
	        (!REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE && REPLACE_KEEPS_$0) ||
	        (typeof replaceValue === 'string' && replaceValue.indexOf(UNSAFE_SUBSTITUTE) === -1)
	      ) {
	        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	        if (res.done) return res.value;
	      }

	      var rx = anObject(regexp);
	      var S = String(this);

	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regexpExecAbstract(rx, S);
	        if (result === null) break;

	        results.push(result);
	        if (!global) break;

	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = String(result[0]);
	        var position = max$3(min$4(toInteger(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];

	  // https://tc39.github.io/ecma262/#sec-getsubstitution
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default: // \d\d?
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$3(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var indexOf$1 = Array.prototype.indexOf;

	var includes = function includes(array, item) {
	  return indexOf$1.call(array, item) >= 0;
	};

	var find$1 = function find(array, predicate) {
	  for (var i = 0, len = array.length; i >= 0 && i < len; i += 1) {
	    if (predicate(array[i], i, array))
	    return array[i];
	  }
	};

	var htmlEncode = function htmlEncode(text) {
	  return text.replace(/&/g, "&amp;").
	  replace(/</g, "&lt;").
	  replace(/>/g, "&gt;").
	  replace(/'/g, "&#39;").
	  replace(/"/g, "&quot;").
	  replace(/\n/g, '<br />');
	};

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	_export({ target: 'Object', stat: true, forced: Object.assign !== objectAssign }, {
	  assign: objectAssign
	});

	function RowCollection() {

	  // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
	  // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
	  var collection = [];

	  // Synthetically set the 'prototype'
	  Object.assign(collection, RowCollection.prototype);

	  // Call initializer
	  collection.initialize.apply(collection, arguments);

	  return collection;
	}

	// Inherit Array
	RowCollection.prototype = [];

	RowCollection.prototype.initialize = function (options) {

	  options = options || {};

	  /** @field {string} sortColumn */
	  this.sortColumn = options.sortColumn == null ? [] : options.sortColumn;
	};

	/**
	    * @param {Object|Object[]} rows - row or array of rows to add to this collection
	    * @param {number?} at - position to insert rows at
	    */
	RowCollection.prototype.add = function (rows, at) {
	  var isArray = 'splice' in rows && 'length' in rows,i,len;
	  if (isArray) {
	    if (at) {
	      for (i = 0, len = rows.length; i < len; i++) {
	        this.splice(at++, 0, rows[i]);
	      }
	    } else {
	      for (i = 0, len = rows.length; i < len; i++) {
	        this.push(rows[i]);
	      }
	    }
	  } else {
	    if (at) {
	      this.splice(at, 0, rows);
	    } else {
	      this.push(rows);
	    }
	  }
	};

	/**
	    * @param {Object|Object[]=} rows Row or array of rows to add to this collection
	    */
	RowCollection.prototype.reset = function (rows) {
	  this.length = 0;
	  if (rows) {
	    this.add(rows);
	  }
	};

	/**
	    * @param {Function} filterFunc - Filtering function
	    * @param {Object|null} args? - Options to pass to the function
	    * @returns {RowCollection} success result
	    */
	RowCollection.prototype.filteredCollection = function (filterFunc, args) {
	  if (filterFunc && args) {
	    var rows = new RowCollection({ sortColumn: this.sortColumn });

	    for (var i = 0, len = this.length, row; i < len; i++) {
	      row = this[i];
	      if (filterFunc(row, args)) {
	        row['__i'] = i;
	        rows.push(row);
	      }
	    }
	    return rows;
	  } else {
	    return null;
	  }
	};

	/**
	    * @type {Function|null|undefined}
	    */
	RowCollection.prototype.onComparatorRequired = null;

	/**
	                                                      * @type {Function|null|undefined}
	                                                      */
	RowCollection.prototype.onSort = null;

	var nativeSort$1 = RowCollection.prototype.sort;

	function getDefaultComparator(column, descending) {
	  var columnName = column.column;
	  var comparePath = column.comparePath || columnName;
	  if (typeof comparePath === 'string') {
	    comparePath = comparePath.split('.');
	  }
	  var pathLength = comparePath.length,
	  hasPath = pathLength > 1,
	  i;

	  var lessVal = descending ? 1 : -1,moreVal = descending ? -1 : 1;
	  return function (leftRow, rightRow) {
	    var leftVal = leftRow[comparePath[0]],
	    rightVal = rightRow[comparePath[0]];
	    if (hasPath) {
	      for (i = 1; i < pathLength; i++) {
	        leftVal = leftVal && leftVal[comparePath[i]];
	        rightVal = rightVal && rightVal[comparePath[i]];
	      }
	    }
	    if (leftVal === rightVal) return 0;
	    if (leftVal == null) return lessVal;
	    if (leftVal < rightVal) return lessVal;
	    return moreVal;
	  };
	}

	/**
	   * @param {Boolean=false} silent
	   * @returns {RowCollection} self
	   */
	RowCollection.prototype.sort = function (silent) {
	  if (this.sortColumn.length) {
	    var comparators = [],i,comparator;

	    for (i = 0; i < this.sortColumn.length; i++) {
	      comparator = null;
	      if (this.onComparatorRequired) {
	        comparator = this.onComparatorRequired(this.sortColumn[i].column, this.sortColumn[i].descending);
	      }
	      if (!comparator) {
	        comparator = getDefaultComparator(this.sortColumn[i], this.sortColumn[i].descending);
	      }
	      comparators.push(comparator.bind(this));
	    }

	    if (comparators.length === 1) {
	      nativeSort$1.call(this, comparators[0]);
	    } else {
	      var len = comparators.length,
	      value;

	      comparator = function comparator(leftRow, rightRow) {
	        for (i = 0; i < len; i++) {
	          value = comparators[i](leftRow, rightRow);
	          if (value !== 0) {
	            return value;
	          }
	        }
	        return value;
	      };

	      nativeSort$1.call(this, comparator);
	    }

	    if (!silent) {
	      if (this.onSort) {
	        this.onSort();
	      }
	    }
	  }
	  return this;
	};

	function ColumnCollection() {

	  // Instantiate an Array. Seems like the `.length = ` of an inherited Array does not work well.
	  // I will not use the IFRAME solution either in fear of memory leaks, and we're supporting large datasets...
	  var collection = [];

	  // Synthetically set the 'prototype'
	  Object.assign(collection, ColumnCollection.prototype);

	  // Call initializer
	  collection.initialize.apply(collection, arguments);

	  return collection;
	}

	// Inherit Array
	ColumnCollection.prototype = [];

	ColumnCollection.prototype.initialize = function () {

	};

	/**
	    * Get the column by this name
	    * @param {String} column column name
	    * @returns {Object} the column object
	    */
	ColumnCollection.prototype.get = function (column) {
	  for (var i = 0, len = this.length; i < len; i++) {
	    if (this[i].name == column) {
	      return this[i];
	    }
	  }
	  return null;
	};

	/**
	    * Get the index of the column by this name
	    * @param {String} column column name
	    * @returns {int} the index of this column
	    */
	ColumnCollection.prototype.indexOf = function (column) {
	  for (var i = 0, len = this.length; i < len; i++) {
	    if (this[i].name == column) {
	      return i;
	    }
	  }
	  return -1;
	};

	/**
	    * Get the column by the specified order
	    * @param {Number} order the column's order
	    * @returns {Object} the column object
	    */
	ColumnCollection.prototype.getByOrder = function (order) {
	  for (var i = 0, len = this.length; i < len; i++) {
	    if (this[i].order == order) {
	      return this[i];
	    }
	  }
	  return null;
	};

	/**
	    * Normalize order
	    * @returns {ColumnCollection} self
	    */
	ColumnCollection.prototype.normalizeOrder = function () {
	  var ordered = [],i;
	  for (i = 0; i < this.length; i++) {
	    ordered.push(this[i]);
	  }
	  ordered.sort(function (col1, col2) {return col1.order < col2.order ? -1 : col1.order > col2.order ? 1 : 0;});
	  for (i = 0; i < ordered.length; i++) {
	    ordered[i].order = i;
	  }
	  return this;
	};

	/**
	    * Get the array of visible columns, order by the order property
	    * @returns {Array<Object>} ordered array of visible columns
	    */
	ColumnCollection.prototype.getVisibleColumns = function () {
	  var visible = [];
	  for (var i = 0, column; i < this.length; i++) {
	    column = this[i];
	    if (column.visible) {
	      visible.push(column);
	    }
	  }
	  visible.sort(function (col1, col2) {return col1.order < col2.order ? -1 : col1.order > col2.order ? 1 : 0;});
	  return visible;
	};

	/**
	    * @returns {int} maximum order currently in the array
	    */
	ColumnCollection.prototype.getMaxOrder = function () {
	  var order = 0;
	  for (var i = 0, column; i < this.length; i++) {
	    column = this[i];
	    if (column.order > order) {
	      order = column.order;
	    }
	  }
	  return order;
	};

	/**
	    * Move a column to a new spot in the collection
	    * @param {Object} src the column to move
	    * @param {Object} dest the destination column
	    * @returns {ColumnCollection} self
	    */
	ColumnCollection.prototype.moveColumn = function (src, dest) {
	  if (src && dest) {
	    var srcOrder = src.order,destOrder = dest.order,i,col;
	    if (srcOrder < destOrder) {
	      for (i = srcOrder + 1; i <= destOrder; i++) {
	        col = this.getByOrder(i);
	        col.order--;
	      }
	    } else {
	      for (i = srcOrder - 1; i >= destOrder; i--) {
	        col = this.getByOrder(i);
	        col.order++;
	      }
	    }
	    src.order = destOrder;
	  }
	  return this;
	};

	/* eslint-env browser */

	var $ = jQuery;

	var hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle;

	var jQuerySupportsFractions = $ && $.fn.jquery >= '3';

	var cssExpands = {
	  'width': [
	  'Left',
	  'Right',
	  'Width'],

	  'height': [
	  'Top',
	  'Bottom',
	  'Height'] };



	var sizeKeys = ['width', 'height'];

	var CssUtil = {};

	var generateSizeFunction = function generateSizeFunction(key, cssExpand, inner, outer) {

	  return function () {
	    var el = arguments[0];
	    var value = arguments[1];

	    if (el && !(el instanceof Element) && 'length' in el) {
	      el = el[0];
	    }

	    if (!el) {
	      return null;
	    }

	    var style = hasComputedStyle ? document.defaultView.getComputedStyle(el) : el.currentStyle;
	    var isBoxing = style['boxSizing'] === 'border-box';
	    var size, border, padding;
	    var includeMargins = outer && arguments[2] === true || arguments[1] === true;

	    if (isBoxing || outer || inner) {
	      border = parseFloat(style['border' + cssExpand[0] + 'Width'] || 0) +
	      parseFloat(style['border' + cssExpand[1] + 'Width'] || 0);

	      padding = parseFloat(style['padding' + cssExpand[0]] || 0) +
	      parseFloat(style['padding' + cssExpand[1]] || 0);
	    }

	    var margin = includeMargins ?
	    parseFloat(style['margin' + cssExpand[0]] || 0) +
	    parseFloat(style['margin' + cssExpand[1]] || 0) : 0;

	    if (value == undefined) {
	      size = parseFloat(style[key]);

	      if (isBoxing) {

	        if (padding + border > size) {
	          size = padding + border;
	        }

	        if (outer) {
	          if (includeMargins) {
	            size += margin;
	          }
	        } else
	        if (inner) {
	          size -= border;
	        } else
	        {
	          size -= padding + border;
	        }

	      } else {

	        if (outer) {
	          size += padding + border;

	          if (includeMargins) {
	            size += margin;
	          }
	        } else
	        if (inner) {
	          size += padding;
	        }

	      }

	      return size;
	    } else {
	      value = value || 0;
	      size = value;

	      if (isBoxing) {

	        if (outer) {
	          if (includeMargins) {
	            size -= margin;
	          }
	        } else
	        if (inner) {
	          size += border;
	        } else
	        {
	          size += padding + border;
	        }

	      } else {

	        if (outer) {
	          size -= padding + border;

	          if (includeMargins) {
	            size -= margin;
	          }
	        } else
	        if (inner) {
	          size -= padding;
	        }

	        if (size < 0) {
	          size = 0;
	        }
	      }

	      el.style[key] = size + 'px';

	      return value;
	    }
	  };
	};

	var generatejQueryFunction = function generatejQueryFunction(key) {
	  return function () {
	    var collection = arguments[0];
	    if (!$.isArray(collection) && !(collection instanceof $)) {
	      collection = [collection];
	    }

	    var ret = $.fn[key].apply(collection, Array.prototype.slice.call(arguments, 1));

	    if (arguments.length > 1) {
	      return this;
	    }

	    return ret;
	  };
	};

	for (var i = 0; i < sizeKeys.length; i++) {
	  var key = sizeKeys[i];
	  var cssExpand = cssExpands[key];

	  if (jQuerySupportsFractions) {

	    CssUtil[key] = generatejQueryFunction(key);
	    CssUtil['inner' + cssExpand[2]] = generatejQueryFunction('inner' + cssExpand[2]);
	    CssUtil['outer' + cssExpand[2]] = generatejQueryFunction('outer' + cssExpand[2]);

	  } else {

	    CssUtil[key] = generateSizeFunction(key, cssExpand, false, false);
	    CssUtil['inner' + cssExpand[2]] = generateSizeFunction(key, cssExpand, true, false);
	    CssUtil['outer' + cssExpand[2]] = generateSizeFunction(key, cssExpand, false, true);

	  }
	}

	// Remove that huge function from memory
	generateSizeFunction = null;

	var TO_STRING = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = nativeToString.name != TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	/* eslint-env browser */
	function isChildOf(child, parent) {
	  while ((child = child.parentNode) && child !== parent) {}
	  return !!child;
	}var

	SelectionHelper = /*#__PURE__*/function () {function SelectionHelper() {_classCallCheck(this, SelectionHelper);}_createClass(SelectionHelper, null, [{ key: "saveSelection", value: function saveSelection(

	    el) {
	      var range = window.getSelection().getRangeAt(0);

	      if (el !== range.commonAncestorContainer && !isChildOf(range.commonAncestorContainer, el))
	      return null;

	      var preSelectionRange = range.cloneRange();
	      preSelectionRange.selectNodeContents(el);
	      preSelectionRange.setEnd(range.startContainer, range.startOffset);
	      var start = preSelectionRange.toString().length;

	      return {
	        start: start,
	        end: start + range.toString().length };

	    } }, { key: "restoreSelection", value: function restoreSelection(

	    el, savedSel) {
	      var charIndex = 0;
	      var nodeStack = [el],node,foundStart = false,stop = false;
	      var range = document.createRange();
	      range.setStart(el, 0);
	      range.collapse(true);

	      while (!stop && (node = nodeStack.pop())) {
	        if (node.nodeType == 3) {
	          var nextCharIndex = charIndex + node.length;
	          if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
	            range.setStart(node, savedSel.start - charIndex);
	            foundStart = true;
	          }
	          if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
	            range.setEnd(node, savedSel.end - charIndex);
	            stop = true;
	          }
	          charIndex = nextCharIndex;
	        } else {
	          var i = node.childNodes.length;
	          while (i--) {
	            nodeStack.push(node.childNodes[i]);
	          }
	        }
	      }

	      var sel = window.getSelection();
	      sel.removeAllRanges();
	      sel.addRange(range);
	    } }]);return SelectionHelper;}();

	var rtlScrollType;

	var detectRtlScrollType = function detectRtlScrollType() {
	  var definer = document.createElement('div');
	  definer.dir = 'rtl';
	  Object.assign(definer.style, {
	    direction: 'rtl',
	    fontSize: '14px',
	    width: '1px',
	    height: '1px',
	    position: 'absolute',
	    top: '-1000px',
	    overflow: 'scroll' });

	  definer.textContent = 'A';
	  document.body.appendChild(definer);

	  var type = 'reverse';

	  if (definer.scrollLeft > 0) {
	    type = 'default';
	  } else {
	    definer.scrollLeft = 1;
	    if (definer.scrollLeft === 0) {
	      type = 'negative';
	    }
	  }

	  definer.parentNode.removeChild(definer);

	  return type;
	};var

	ScrollHelper = /*#__PURE__*/function () {function ScrollHelper() {_classCallCheck(this, ScrollHelper);}_createClass(ScrollHelper, null, [{ key: "normalizeScrollLeft",

	    /**
	                                                                                                                                                                        * @param {HTMLElement} el
	                                                                                                                                                                        * @param {boolean|undefined} [rtl]
	                                                                                                                                                                        * @returns {number}
	                                                                                                                                                                        */value: function normalizeScrollLeft(
	    el, rtl) {
	      if (rtl === undefined) {
	        rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
	      }

	      if (rtl === true && rtlScrollType === undefined) {
	        rtlScrollType = detectRtlScrollType();
	      }

	      if (rtl) {
	        switch (rtlScrollType) {
	          case 'negative':
	            return el.scrollLeft + el.scrollWidth - el.clientWidth;

	          case 'reverse':
	            return el.scrollWidth - el.scrollLeft - el.clientWidth;

	          default:
	            return el.scrollLeft;}

	      } else {
	        return el.scrollLeft;
	      }
	    }

	    /**
	       * @param {HTMLElement} el
	       * @param {boolean|undefined} [rtl]
	       * @param {number} value
	       * @returns {number}
	       */ }, { key: "denormalizeScrollLeft", value: function denormalizeScrollLeft(
	    el, rtl, value) {
	      if (rtl === undefined) {
	        rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
	      }

	      if (rtl === true && rtlScrollType === undefined) {
	        rtlScrollType = detectRtlScrollType();
	      }

	      if (rtl) {
	        switch (rtlScrollType) {
	          case 'negative':
	            return value + el.scrollWidth - el.clientWidth;

	          case 'reverse':
	            return el.scrollWidth - value - el.clientWidth;

	          default:
	            return value;}

	      } else {
	        return value;
	      }
	    } }, { key: "scrollLeftNormalized", value: function scrollLeftNormalized(

	    el, x) {
	      if (x === undefined) {
	        return ScrollHelper.normalizeScrollLeft(el, undefined);
	      } else {
	        el.scrollLeft = ScrollHelper.denormalizeScrollLeft(el, undefined, x);
	      }
	    }

	    /**
	       * @param {HTMLElement} el
	       * @param {boolean|undefined} [rtl]
	       * @returns {number}
	       */ }, { key: "normalizeScrollHorz", value: function normalizeScrollHorz(
	    el, rtl) {
	      if (rtl === undefined) {
	        rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
	      }
	      if (rtl) {
	        return el.scrollWidth - el.clientWidth - ScrollHelper.normalizeScrollLeft(el, rtl);
	      } else {
	        return ScrollHelper.normalizeScrollLeft(el, rtl);
	      }
	    }

	    /**
	       * @param {HTMLElement} el
	       * @param {boolean|undefined} [rtl]
	       * @param {number} value
	       * @returns {number}
	       */ }, { key: "denormalizeScrollHorz", value: function denormalizeScrollHorz(
	    el, rtl, value) {
	      if (rtl === undefined) {
	        rtl = document.defaultView.getComputedStyle(el, null).direction === 'rtl';
	      }

	      if (rtl) {
	        return ScrollHelper.denormalizeScrollLeft(el, rtl, el.scrollWidth - el.clientWidth - value);
	      } else {
	        return ScrollHelper.denormalizeScrollLeft(el, rtl, value);
	      }
	    }

	    /**
	       * @param {HTMLElement} el
	       * @param {number|undefined} [x]
	       * @returns {number|undefined}
	       */ }, { key: "scrollHorzNormalized", value: function scrollHorzNormalized(
	    el, x) {
	      if (x === undefined) {
	        return ScrollHelper.normalizeScrollHorz(el);
	      } else {
	        el.scrollLeft = ScrollHelper.denormalizeScrollHorz(el, undefined, x);
	      }
	    } }]);return ScrollHelper;}();

	function ByColumnFilter(row, args) {

	  var column = args.column;
	  var keyword = args.keyword == null ? '' : args.keyword.toString();

	  if (!keyword || !column) return true;

	  var actualVal = row[column];
	  if (actualVal == null) {
	    return false;
	  }

	  actualVal = actualVal.toString();

	  if (!args.caseSensitive) {
	    actualVal = actualVal.toLowerCase();
	    keyword = keyword.toLowerCase();
	  }

	  return actualVal.indexOf(keyword) !== -1;
	}

	/* eslint-env browser */

	var nativeIndexOf$1 = Array.prototype.indexOf;
	var $$1 = jQuery;

	var userAgent = navigator.userAgent;
	var ieVersion = userAgent.indexOf('MSIE ') != -1 ? parseFloat(userAgent.substr(userAgent.indexOf('MSIE ') + 5)) : null;
	var hasIeDragAndDropBug = ieVersion && ieVersion < 10;
	var createElement = document.createElement.bind(document);
	var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

	function webkitRenderBugfix(el) {
	  // BUGFIX: WebKit has a bug where it does not relayout, and this affects us because scrollbars 
	  //   are still calculated even though they are not there yet. This is the last resort.
	  var oldDisplay = el.style.display;
	  el.style.display = 'none';
	  //noinspection BadExpressionStatementJS
	  el.offsetHeight; // No need to store this anywhere, the reference is enough
	  el.style.display = oldDisplay;
	  return el;
	}

	function relativizeElement($el) {
	  if (!includes(['relative', 'absolute', 'fixed'], $el.css('position'))) {
	    $el.css('position', 'relative');
	  }
	}

	/** @class DGTable */
	var DGTable = function DGTable() {
	  if (!(this instanceof DGTable)) {
	    // Allow constructing without `new`
	    return new (Function.prototype.bind.apply(
	    DGTable,
	    [DGTable].concat(Array.prototype.slice.call(arguments, 0))))();
	  }

	  this.initialize.apply(this, arguments);
	};

	/**
	    * @public
	    * @expose
	    * @type {string}
	    */
	DGTable.VERSION = '@@VERSION';

	/**
	                                * @public
	                                * @expose
	                                * @type {string}
	                                */
	DGTable.prototype.VERSION = DGTable.VERSION;

	/**
	                                              * @constructs
	                                              * @param {DGTable.Options?} options - initialization options
	                                              * @returns {DGTable}
	                                              */
	DGTable.prototype.initialize = function (options) {
	  var that = this;

	  options = options || {};

	  /**
	                            * @private
	                            * @type {DGTable.Options}
	                            * */
	  var o = that.o = {};

	  /**
	                        * @private
	                        * This is for encapsulating private data */
	  var p = that.p = {};

	  /** This is for encapsulating event callback */
	  p.events = {};

	  /**
	                  * @public
	                  * @expose
	                  * */
	  that.el = options.el && options.el instanceof Element ? options.el : document.createElement('div');

	  /**
	                                                                                                       * @public
	                                                                                                       * @expose
	                                                                                                       * */
	  var $el = that.$el = $$1(that.el);

	  if (that.el !== options.el) {
	    $el.addClass(options.className || 'dgtable-wrapper');
	  }

	  // Set control data
	  $el.
	  data('control', that).
	  data('dgtable', that);

	  // For jQuery.UI or jquery.removeevent
	  $el.on('remove', function () {
	    that.destroy();
	  });

	  p.onMouseMoveResizeAreaBound = this._onMouseMoveResizeArea.bind(this);
	  p.onEndDragColumnHeaderBound = this._onEndDragColumnHeader.bind(this);
	  p.onTableScrolledHorizontallyBound = this._onTableScrolledHorizontally.bind(this);

	  this.$el.on('dragend', p.onEndDragColumnHeaderBound);

	  /**
	                                                         * @private
	                                                         * @field {Boolean} _tableSkeletonNeedsRendering */
	  p.tableSkeletonNeedsRendering = true;

	  /**
	                                         * @private
	                                         * @field {Boolean} virtualTable */
	  o.virtualTable = options.virtualTable === undefined ? true : !!options.virtualTable;

	  /**
	                                                                                        * @private
	                                                                                        * @field {Number} rowsBufferSize */
	  o.rowsBufferSize = options.rowsBufferSize || 3;

	  /**
	                                                   * @private
	                                                   * @field {Number} minColumnWidth */
	  o.minColumnWidth = Math.max(options.minColumnWidth || 35, 0);

	  /**
	                                                                 * @private
	                                                                 * @field {Number} resizeAreaWidth */
	  o.resizeAreaWidth = options.resizeAreaWidth || 8;

	  /**
	                                                     * @private
	                                                     * @field {Boolean} resizableColumns */
	  o.resizableColumns = options.resizableColumns === undefined ? true : !!options.resizableColumns;

	  /**
	                                                                                                    * @private
	                                                                                                    * @field {Boolean} movableColumns */
	  o.movableColumns = options.movableColumns === undefined ? true : !!options.movableColumns;

	  /**
	                                                                                              * @private
	                                                                                              * @field {Number} sortableColumns */
	  o.sortableColumns = options.sortableColumns === undefined ? 1 : parseInt(options.sortableColumns, 10) || 1;

	  /**
	                                                                                                               * @private
	                                                                                                               * @field {Boolean} adjustColumnWidthForSortArrow */
	  o.adjustColumnWidthForSortArrow = options.adjustColumnWidthForSortArrow === undefined ? true : !!options.adjustColumnWidthForSortArrow;

	  /**
	                                                                                                                                           * @private
	                                                                                                                                           * @field {Boolean} convertColumnWidthsToRelative */
	  o.convertColumnWidthsToRelative = options.convertColumnWidthsToRelative === undefined ? false : !!options.convertColumnWidthsToRelative;

	  /**
	                                                                                                                                            * @private
	                                                                                                                                            * @field {Boolean} autoFillTableWidth */
	  o.autoFillTableWidth = options.autoFillTableWidth === undefined ? false : !!options.autoFillTableWidth;

	  /**
	                                                                                                           * @private
	                                                                                                           * @field {String} cellClasses */
	  o.cellClasses = options.cellClasses === undefined ? '' : options.cellClasses;

	  /**
	                                                                                 * @private
	                                                                                 * @field {String} resizerClassName */
	  o.resizerClassName = options.resizerClassName === undefined ? 'dgtable-resize' : options.resizerClassName;

	  /**
	                                                                                                              * @private
	                                                                                                              * @field {String} tableClassName */
	  o.tableClassName = options.tableClassName === undefined ? 'dgtable' : options.tableClassName;

	  /**
	                                                                                                 * @private
	                                                                                                 * @field {Boolean} allowCellPreview */
	  o.allowCellPreview = options.allowCellPreview === undefined ? true : options.allowCellPreview;

	  /**
	                                                                                                  * @private
	                                                                                                  * @field {Boolean} allowHeaderCellPreview */
	  o.allowHeaderCellPreview = options.allowHeaderCellPreview === undefined ? true : options.allowHeaderCellPreview;

	  /**
	                                                                                                                    * @private
	                                                                                                                    * @field {String} cellPreviewClassName */
	  o.cellPreviewClassName = options.cellPreviewClassName === undefined ? 'dgtable-cell-preview' : options.cellPreviewClassName;

	  /**
	                                                                                                                                * @private
	                                                                                                                                * @field {Boolean} cellPreviewAutoBackground */
	  o.cellPreviewAutoBackground = options.cellPreviewAutoBackground === undefined ? true : options.cellPreviewAutoBackground;

	  /**
	                                                                                                                             * @private
	                                                                                                                             * @field {Function(String,Boolean)Function(a,b)Boolean} onComparatorRequired */
	  o.onComparatorRequired = options.onComparatorRequired === undefined ? null : options.onComparatorRequired;
	  if (!o.onComparatorRequired && typeof options['comparatorCallback'] === 'function') {
	    o.onComparatorRequired = options['comparatorCallback'];
	  }

	  /**
	     * @private
	     * @field {Boolean} width */
	  o.width = options.width === undefined ? DGTable.Width.NONE : options.width;

	  /**
	                                                                               * @private
	                                                                               * @field {Boolean} relativeWidthGrowsToFillWidth */
	  o.relativeWidthGrowsToFillWidth = options.relativeWidthGrowsToFillWidth === undefined ? true : !!options.relativeWidthGrowsToFillWidth;

	  /**
	                                                                                                                                           * @private
	                                                                                                                                           * @field {Boolean} relativeWidthShrinksToFillWidth */
	  o.relativeWidthShrinksToFillWidth = options.relativeWidthShrinksToFillWidth === undefined ? false : !!options.relativeWidthShrinksToFillWidth;

	  this.setCellFormatter(options.cellFormatter);
	  this.setHeaderCellFormatter(options.headerCellFormatter);
	  this.setFilter(options.filter);

	  /** @private
	                                   * @field {Number} height */
	  o.height = options.height;

	  // Prepare columns
	  that.setColumns(options.columns || [], false);

	  // Set sorting columns
	  var sortColumns = [];

	  if (options.sortColumn) {

	    var tmpSortColumns = options.sortColumn;

	    if (tmpSortColumns && _typeof(tmpSortColumns) !== 'object') {
	      tmpSortColumns = [tmpSortColumns];
	    }

	    if (tmpSortColumns instanceof Array ||
	    _typeof(tmpSortColumns) === 'object') {

	      for (var i = 0, len = tmpSortColumns.length; i < len; i++) {
	        var sortColumn = tmpSortColumns[i];
	        if (typeof sortColumn === 'string') {
	          sortColumn = { column: sortColumn, descending: false };
	        }
	        var col = p.columns.get(sortColumn.column);
	        sortColumns.push({
	          column: sortColumn.column,
	          comparePath: col.comparePath || col.dataPath,
	          descending: sortColumn.descending });

	      }
	    }
	  }

	  /** @field {RowCollection} _rows */
	  p.rows = new RowCollection({ sortColumn: sortColumns });
	  p.rows.onComparatorRequired = function (column, descending) {
	    if (o.onComparatorRequired) {
	      return o.onComparatorRequired(column, descending);
	    }
	  };

	  /** @private
	      * @field {RowCollection} _filteredRows */
	  p.filteredRows = null;

	  /*
	                          Setup hover mechanism.
	                          We need this to be high performance, as there may be MANY cells to call this on, on creation and destruction.
	                          Using native events to spare the overhead of jQuery's event binding, and even just the creation of the jQuery collection object.
	                          */

	  /**
	                              * @param {MouseEvent} evt
	                              * @this {HTMLElement}
	                              * */
	  var hoverMouseOverHandler = function hoverMouseOverHandler(evt) {
	    evt = evt || event;
	    var relatedTarget = evt.fromElement || evt.relatedTarget;
	    if (relatedTarget == this || $$1.contains(this, relatedTarget)) return;
	    if (this['__previewCell'] && (relatedTarget == this['__previewCell'] || $$1.contains(this['__previewCell'], relatedTarget))) return;
	    that._cellMouseOverEvent.call(that, this);
	  };

	  /**
	      * @param {MouseEvent} evt
	      * @this {HTMLElement}
	      * */
	  var hoverMouseOutHandler = function hoverMouseOutHandler(evt) {
	    evt = evt || event;
	    var relatedTarget = evt.toElement || evt.relatedTarget;
	    if (relatedTarget == this || $$1.contains(this, relatedTarget)) return;
	    if (this['__previewCell'] && (relatedTarget == this['__previewCell'] || $$1.contains(this['__previewCell'], relatedTarget))) return;
	    that._cellMouseOutEvent.call(that, this);
	  };

	  if ('addEventListener' in window) {

	    /**
	                                      * @param {HTMLElement} el cell or header-cell
	                                      * */
	    p._bindCellHoverIn = function (el) {
	      if (!el['__hoverIn']) {
	        el.addEventListener('mouseover', el['__hoverIn'] = hoverMouseOverHandler.bind(el));
	      }
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * */
	    p._unbindCellHoverIn = function (el) {
	      if (el['__hoverIn']) {
	        el.removeEventListener('mouseover', el['__hoverIn']);
	        el['__hoverIn'] = null;
	      }
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * @returns {DGTable} self
	        * */
	    p._bindCellHoverOut = function (el) {
	      if (!el['__hoverOut']) {
	        el.addEventListener('mouseout', el['__hoverOut'] = hoverMouseOutHandler.bind(el['__cell'] || el));
	      }
	      return this;
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * @returns {DGTable} self
	        * */
	    p._unbindCellHoverOut = function (el) {
	      if (el['__hoverOut']) {
	        el.removeEventListener('mouseout', el['__hoverOut']);
	        el['__hoverOut'] = null;
	      }
	      return this;
	    };

	  } else {

	    /**
	           * @param {HTMLElement} el cell or header-cell
	           * */
	    p._bindCellHoverIn = function (el) {
	      if (!el['__hoverIn']) {
	        el.attachEvent('mouseover', el['__hoverIn'] = hoverMouseOverHandler.bind(el));
	      }
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * */
	    p._unbindCellHoverIn = function (el) {
	      if (el['__hoverIn']) {
	        el.detachEvent('mouseover', el['__hoverIn']);
	        el['__hoverIn'] = null;
	      }
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * */
	    p._bindCellHoverOut = function (el) {
	      if (!el['__hoverOut']) {
	        el.attachEvent('mouseout', el['__hoverOut'] = hoverMouseOutHandler.bind(el['__cell'] || el));
	      }
	    };

	    /**
	        * @param {HTMLElement} el cell or header-cell
	        * @returns {DGTable} self
	        * */
	    p._unbindCellHoverOut = function (el) {
	      if (el['__hoverOut']) {
	        el.detachEvent('mouseout', el['__hoverOut']);
	        el['__hoverOut'] = null;
	      }
	      return this;
	    };

	  }
	};

	/**
	    * Add an event listener
	    * @public
	    * @expose
	    * @param {String} eventName
	    * @param {Function} callback
	    * @returns {DGTable}
	    */
	DGTable.prototype.on = function (eventName, callback) {
	  var that = this,events = that.p.events;

	  if (typeof callback !== 'function')
	  return that;

	  if (!hasOwnProperty$1.call(events, eventName))
	  events[eventName] = [];

	  events[eventName].push({
	    cb: callback,
	    once: false });


	  return that;
	};

	/**
	    * Add an event listener for a one shot
	    * @public
	    * @expose
	    * @param {String} eventName
	    * @param {Function} callback
	    * @returns {DGTable}
	    */
	DGTable.prototype.once = function (eventName, callback) {
	  var that = this,events = that.p.events;

	  if (typeof callback !== 'function')
	  return that;

	  if (!hasOwnProperty$1.call(events, eventName))
	  events[eventName] = [];

	  events[eventName].push({
	    cb: callback,
	    once: true });


	  return that;
	};

	/**
	    * Remove an event listener
	    * @public
	    * @expose
	    * @param {String} eventName
	    * @param {Function} callback
	    * @returns {DGTable}
	    */
	DGTable.prototype.off = function (eventName, callback) {
	  var events = this.p.events;

	  if (!hasOwnProperty$1.call(events, eventName))
	  return this;

	  var callbacks = events[eventName];
	  for (var i = 0; i < callbacks.length; i++) {
	    var item = callbacks[i];
	    if (callback && item.cb !== callback) continue;
	    callbacks.splice(i--, 1);
	  }

	  return this;
	};

	DGTable.prototype.trigger = function (eventName) {
	  var events = this.p.events;

	  if (hasOwnProperty$1.call(events, eventName)) {
	    var callbacks = events[eventName];
	    for (var i = 0; i < callbacks.length; i++) {
	      var item = callbacks[i];
	      if (item.once) {
	        callbacks.splice(i--, 1);
	      }
	      item.cb.apply(this, Array.prototype.slice.call(arguments, 1));
	    }
	  }

	  return this;
	};

	/**
	    * Detect column width mode
	    * @private
	    * @param {Number|String} width
	    * @param {Number} minWidth
	    * @returns {Object} parsed width
	    */
	DGTable.prototype._parseColumnWidth = function (width, minWidth) {

	  var widthSize = Math.max(0, parseFloat(width)),
	  widthMode = ColumnWidthMode.AUTO; // Default

	  if (widthSize > 0) {
	    // Well, it's sure is not AUTO, as we have a value

	    if (width == widthSize + '%') {
	      // It's a percentage!

	      widthMode = ColumnWidthMode.RELATIVE;
	      widthSize /= 100;
	    } else if (widthSize > 0 && widthSize < 1) {
	      // It's a decimal value, as a relative value!

	      widthMode = ColumnWidthMode.RELATIVE;
	    } else {
	      // It's an absolute size!

	      if (widthSize < minWidth) {
	        widthSize = minWidth;
	      }
	      widthMode = ColumnWidthMode.ABSOLUTE;
	    }
	  }

	  return { width: widthSize, mode: widthMode };
	};

	/**
	    * @private
	    * @param {COLUMN_OPTIONS} columnData
	    */
	DGTable.prototype._initColumnFromData = function (columnData) {

	  var parsedWidth = this._parseColumnWidth(columnData.width, columnData.ignoreMin ? 0 : this.o.minColumnWidth);

	  var col = {
	    name: columnData.name,
	    label: columnData.label === undefined ? columnData.name : columnData.label,
	    width: parsedWidth.width,
	    widthMode: parsedWidth.mode,
	    resizable: columnData.resizable === undefined ? true : columnData.resizable,
	    sortable: columnData.sortable === undefined ? true : columnData.sortable,
	    movable: columnData.movable === undefined ? true : columnData.movable,
	    visible: columnData.visible === undefined ? true : columnData.visible,
	    cellClasses: columnData.cellClasses === undefined ? this.o.cellClasses : columnData.cellClasses,
	    ignoreMin: columnData.ignoreMin === undefined ? false : !!columnData.ignoreMin };


	  col.dataPath = columnData.dataPath === undefined ? col.name : columnData.dataPath;
	  col.comparePath = columnData.comparePath === undefined ? col.dataPath : columnData.comparePath;

	  if (typeof col.dataPath === 'string') {
	    col.dataPath = col.dataPath.split('.');
	  }
	  if (typeof col.comparePath === 'string') {
	    col.comparePath = col.comparePath.split('.');
	  }

	  return col;
	};

	/**
	    * Destroy, releasing all memory, events and DOM elements
	    * @public
	    * @expose
	    */
	DGTable.prototype.close = DGTable.prototype.remove = DGTable.prototype.destroy = function () {

	  var that = this,
	  p = that.p || {},
	  $el = that.$el;

	  if (that.__removed) {
	    return that;
	  }

	  if (p.$resizer) {
	    p.$resizer.remove();
	    p.$resizer = null;
	  }

	  if (p.$tbody) {
	    var trs = p.$tbody[0].childNodes;
	    for (var i = 0, len = trs.length; i < len; i++) {
	      that.trigger('rowdestroy', trs[i]);
	    }
	  }

	  // Using quotes for __super__ because Google Closure Compiler has a bug...

	  this._destroyHeaderCells()._unbindCellEventsForTable();
	  if (p.$table) {
	    p.$table.empty();
	  }
	  if (p.$tbody) {
	    p.$tbody.empty();
	  }

	  if (p.workerListeners) {
	    for (var j = 0; j < p.workerListeners.length; j++) {
	      var worker = p.workerListeners[j];
	      worker.worker.removeEventListener('message', worker.listener, false);
	    }
	    p.workerListeners.length = 0;
	  }

	  p.rows.length = p.columns.length = 0;

	  if (p._deferredRender) {
	    clearTimeout(p._deferredRender);
	  }

	  // Cleanup
	  for (var prop in that) {
	    if (hasOwnProperty$1.call(that, prop)) {
	      that[prop] = null;
	    }
	  }

	  that.__removed = true;

	  if ($el) {
	    $el.remove();
	  }

	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._unbindCellEventsForTable = function () {
	  var p = this.p;

	  if (p.headerRow) {
	    for (var i = 0, rows = p.headerRow.childNodes, rowCount = rows.length; i < rowCount; i++) {
	      var rowToClean = rows[i];
	      for (var j = 0, cells = rowToClean.childNodes, cellCount = cells.length; j < cellCount; j++) {
	        p._unbindCellHoverIn(cells[j]);
	      }
	    }
	  }

	  if (p.tbody) {
	    for (var _i = 0, _rows = p.tbody.childNodes, _rowCount = _rows.length; _i < _rowCount; _i++) {
	      this._unbindCellEventsForRow(_rows[_i]);
	    }
	  }

	  return this;
	};

	/**
	    * @private
	    * @param {HTMLElement} rowToClean
	    * @returns {DGTable} self
	    */
	DGTable.prototype._unbindCellEventsForRow = function (rowToClean) {
	  var p = this.p;
	  for (var i = 0, cells = rowToClean.childNodes, cellCount = cells.length; i < cellCount; i++) {
	    p._unbindCellHoverIn(cells[i]);
	  }
	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.render = function () {var _this = this;
	  var o = this.o,p = this.p;

	  if (!this.el.offsetParent) {
	    if (!p._deferredRender) {
	      p._deferredRender = setTimeout(function () {
	        p._deferredRender = null;
	        if (!_this.__removed && _this.el.offsetParent) {
	          _this.render();
	        }
	      });
	    }

	    return this;
	  }

	  var renderedRows, rowCount;

	  if (p.tableSkeletonNeedsRendering === true) {
	    p.tableSkeletonNeedsRendering = false;

	    if (o.width == DGTable.Width.AUTO) {
	      // We need to do this to return to the specified widths instead. The arrows added to the column widths...
	      this._clearSortArrows();
	    }

	    var lastScrollTop = p.table ? p.table.scrollTop : NaN,
	    lastScrollLeft = p.table ? ScrollHelper.scrollLeftNormalized(p.table) : NaN;

	    this._renderSkeletonBase().
	    _renderSkeletonBody().
	    tableWidthChanged(true, false) // Take this chance to calculate required column widths
	    ._renderSkeletonHeaderCells();

	    if (!o.virtualTable) {
	      var rows = p.filteredRows || p.rows;
	      rowCount = rows.length;
	      renderedRows = this.renderRows(0, rowCount - 1);
	      p.$tbody.html('').append(renderedRows);
	    }

	    this._updateLastCellWidthFromScrollbar(true);

	    this._updateTableWidth(true);

	    // Show sort arrows
	    for (var i = 0; i < p.rows.sortColumn.length; i++) {
	      this._showSortArrow(p.rows.sortColumn[i].column, p.rows.sortColumn[i].descending);
	    }
	    if (o.adjustColumnWidthForSortArrow && p.rows.sortColumn.length) {
	      this.tableWidthChanged(true);
	    } else if (!o.virtualTable) {
	      this.tableWidthChanged();
	    }

	    if (!isNaN(lastScrollTop))
	    p.table.scrollTop = lastScrollTop;

	    if (!isNaN(lastScrollLeft)) {
	      ScrollHelper.scrollLeftNormalized(p.table, lastScrollLeft);
	      ScrollHelper.scrollLeftNormalized(p.header, lastScrollLeft);
	    }

	    this.trigger('renderskeleton');

	    if (o.virtualTable) {
	      p.$table.on('scroll', this._onVirtualTableScrolled.bind(this));
	      this.render();
	    }

	  } else if (o.virtualTable) {
	    rowCount = (p.filteredRows || p.rows).length;
	    var scrollTop = p.table.scrollTop;
	    var firstVisible = Math.floor((scrollTop - p.virtualRowHeightFirst) / p.virtualRowHeight) + 1 - o.rowsBufferSize;
	    var lastVisible = Math.ceil((scrollTop - p.virtualRowHeightFirst + p.visibleHeight) / p.virtualRowHeight) + o.rowsBufferSize;
	    if (firstVisible < 0) firstVisible = 0;
	    if (lastVisible >= rowCount) {
	      lastVisible = rowCount - 1;
	    }

	    var oldFirstVisible = -1,oldLastVisible = -1;
	    var tbodyChildNodes = p.tbody.childNodes;
	    if (tbodyChildNodes.length) {
	      oldFirstVisible = tbodyChildNodes[0]['rowIndex'];
	      oldLastVisible = tbodyChildNodes[tbodyChildNodes.length - 1]['rowIndex'];
	    }

	    var countToRemove;

	    if (oldFirstVisible !== -1 && oldFirstVisible < firstVisible) {
	      countToRemove = Math.min(oldLastVisible + 1, firstVisible) - oldFirstVisible;
	      for (var _i2 = 0; _i2 < countToRemove; _i2++) {
	        this.trigger('rowdestroy', tbodyChildNodes[0]);
	        this._unbindCellEventsForRow(tbodyChildNodes[0]);
	        p.tbody.removeChild(tbodyChildNodes[0]);
	      }
	      oldFirstVisible += countToRemove;
	      if (oldFirstVisible > oldLastVisible) {
	        oldFirstVisible = oldLastVisible = -1;
	      }
	    } else if (oldLastVisible !== -1 && oldLastVisible > lastVisible) {
	      countToRemove = oldLastVisible - Math.max(oldFirstVisible - 1, lastVisible);
	      for (var _i3 = 0; _i3 < countToRemove; _i3++) {
	        this.trigger('rowdestroy', tbodyChildNodes[tbodyChildNodes.length - 1]);
	        this._unbindCellEventsForRow(tbodyChildNodes[tbodyChildNodes.length - 1]);
	        p.tbody.removeChild(tbodyChildNodes[tbodyChildNodes.length - 1]);
	      }
	      if (oldLastVisible < oldFirstVisible) {
	        oldFirstVisible = oldLastVisible = -1;
	      }
	    }

	    if (firstVisible < oldFirstVisible) {
	      renderedRows = this.renderRows(firstVisible, Math.min(lastVisible, oldFirstVisible - 1));
	      p.$tbody.prepend(renderedRows);
	    }
	    if (lastVisible > oldLastVisible || oldLastVisible === -1) {
	      renderedRows = this.renderRows(oldLastVisible === -1 ? firstVisible : oldLastVisible + 1, lastVisible);
	      p.$tbody.append(renderedRows);
	    }
	  }
	  this.trigger('render');
	  return this;
	};

	/**
	    * Forces a full render of the table
	    * @public
	    * @expose
	    * @param {Boolean=true} render - Should render now?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.clearAndRender = function (render) {
	  var p = this.p;

	  p.tableSkeletonNeedsRendering = true;

	  if (render === undefined || render) {
	    this.render();
	  }

	  return this;
	};

	/**
	    * Render rows
	    * @private
	    * @param {Number} first first row to render
	    * @param {Number} last last row to render
	    * @returns {DocumentFragment} fragment containing all rendered rows
	    */
	DGTable.prototype.renderRows = function (first, last) {
	  var o = this.o,p = this.p;

	  var tableClassName = o.tableClassName,
	  rowClassName = tableClassName + '-row',
	  cellClassName = tableClassName + '-cell',
	  rows = p.filteredRows || p.rows,
	  isDataFiltered = !!p.filteredRows,
	  allowCellPreview = o.allowCellPreview,
	  visibleColumns = p.visibleColumns,
	  isVirtual = o.virtualTable,
	  virtualRowHeightFirst = p.virtualRowHeightFirst,
	  virtualRowHeight = p.virtualRowHeight,
	  top,
	  physicalRowIndex;

	  var colCount = visibleColumns.length;
	  for (var colIndex = 0, column; colIndex < colCount; colIndex++) {
	    column = visibleColumns[colIndex];
	    column._finalWidth = column.actualWidthConsideringScrollbarWidth || column.actualWidth;
	  }

	  var bodyFragment = document.createDocumentFragment();

	  var isRtl = this._isTableRtl(),
	  virtualRowXAttr = isRtl ? 'right' : 'left';

	  for (var i = first, rowCount = rows.length;
	  i < rowCount && i <= last;
	  i++) {

	    var rowData = rows[i];
	    physicalRowIndex = isDataFiltered ? rowData['__i'] : i;

	    var row = createElement('div');
	    row.className = rowClassName;
	    row['rowIndex'] = i;
	    row['physicalRowIndex'] = physicalRowIndex;

	    for (var _colIndex = 0; _colIndex < colCount; _colIndex++) {
	      var _column = visibleColumns[_colIndex];
	      var cell = createElement('div');
	      cell['columnName'] = _column.name;
	      cell.setAttribute('data-column', _column.name);
	      cell.className = cellClassName;
	      cell.style.width = _column._finalWidth + 'px';
	      if (_column.cellClasses) cell.className += ' ' + _column.cellClasses;
	      if (allowCellPreview) {
	        p._bindCellHoverIn(cell);
	      }

	      var cellInner = cell.appendChild(createElement('div'));
	      cellInner.innerHTML = this._getHtmlForCell(rowData, _column);

	      row.appendChild(cell);
	    }

	    if (isVirtual) {
	      top = i > 0 ? virtualRowHeightFirst + (i - 1) * virtualRowHeight : 0;
	      row.style.position = 'absolute';
	      row.style[virtualRowXAttr] = 0;
	      row.style.top = top + 'px';
	    }

	    bodyFragment.appendChild(row);

	    this.trigger('rowcreate', i, physicalRowIndex, row, rowData);
	  }

	  return bodyFragment;
	};

	/**
	    * Calculate virtual table height for scrollbar
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._calculateVirtualHeight = function () {
	  var p = this.p;

	  if (p.tbody) {
	    var rowCount = (p.filteredRows || p.rows).length;
	    var height = p.virtualRowHeight * rowCount;
	    if (rowCount) {
	      height += p.virtualRowHeightFirst - p.virtualRowHeight;
	      height += p.virtualRowHeightLast - p.virtualRowHeight;
	    }
	    // At least 1 pixel - to show scrollers correctly.
	    if (height < 1) {
	      height = 1;
	    }
	    p.tbody.style.height = height + 'px';
	  }
	  return this;
	};

	/**
	    * Calculate the size required for the table body width (which is the row's width)
	    * @private
	    * @returns {Number} calculated width
	    */
	DGTable.prototype._calculateTbodyWidth = function () {
	  var p = this.p;

	  var tableClassName = this.o.tableClassName,
	  rowClassName = tableClassName + '-row',
	  cellClassName = tableClassName + '-cell',
	  visibleColumns = p.visibleColumns,
	  colCount = visibleColumns.length,
	  cell,
	  cellInner,
	  colIndex,
	  column;

	  var $row = $$1('<div>').addClass(rowClassName).css('float', 'left');
	  var sumActualWidth = 0;

	  for (colIndex = 0; colIndex < colCount; colIndex++) {
	    column = visibleColumns[colIndex];
	    cell = createElement('div');
	    cell.className = cellClassName;
	    cell.style.width = column.actualWidth + 'px';
	    if (column.cellClasses) cell.className += ' ' + column.cellClasses;
	    cellInner = cell.appendChild(createElement('div'));
	    $row.append(cell);
	    sumActualWidth += column.actualWidth;
	  }

	  var $thisWrapper = $$1('<div>').
	  addClass(this.el.className).
	  css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', 'float': 'left', width: '1px', overflow: 'hidden' }).
	  append(
	  $$1('<div>').addClass(tableClassName).append(
	  $$1('<div>').addClass(tableClassName + '-body').css('width', sumActualWidth + 10000).append(
	  $row)));




	  $thisWrapper.appendTo(document.body);

	  var fractionTest = $$1('<div style="border:1.5px solid #000;width:0;height:0;position:absolute;left:0;top:-9999px">').appendTo(document.body);
	  var hasFractions = parseFloat(fractionTest.css('border-width'));
	  hasFractions = Math.round(hasFractions) != hasFractions;
	  fractionTest.remove();

	  var width = CssUtil.outerWidth($row);
	  width -= p.scrollbarWidth || 0;

	  if (hasFractions) {
	    width++;
	  }

	  $thisWrapper.remove();
	  return width;
	};

	/**
	    * Sets the columns of the table
	    * @public
	    * @expose
	    * @param {COLUMN_OPTIONS[]} columns - Column definitions array
	    * @param {Boolean=true} render - Should render now?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setColumns = function (columns, render) {
	  var p = this.p;

	  columns = columns || [];

	  var normalizedCols = new ColumnCollection();
	  for (var i = 0, order = 0; i < columns.length; i++) {

	    var columnData = columns[i];
	    var normalizedColumn = this._initColumnFromData(columnData);

	    if (columnData.order !== undefined) {
	      if (columnData.order > order) {
	        order = columnData.order + 1;
	      }
	      normalizedColumn.order = columnData.order;
	    } else {
	      normalizedColumn.order = order++;
	    }

	    normalizedCols.push(normalizedColumn);
	  }
	  normalizedCols.normalizeOrder();

	  p.columns = normalizedCols;
	  p.visibleColumns = normalizedCols.getVisibleColumns();

	  this._ensureVisibleColumns().clearAndRender(render);

	  return this;
	};

	/**
	    * Add a column to the table
	    * @public
	    * @expose
	    * @param {COLUMN_OPTIONS} columnData column properties
	    * @param {String|Number} [before=-1] column name or order to be inserted before
	    * @param {Boolean=true} render - Should render now?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.addColumn = function (columnData, before, render) {
	  var p = this.p;
	  var columns = p.columns;

	  if (columnData && !columns.get(columnData.name)) {
	    var beforeColumn = null;
	    if (before !== undefined) {
	      beforeColumn = columns.get(before) || columns.getByOrder(before);
	    }

	    var column = this._initColumnFromData(columnData);
	    column.order = beforeColumn ? beforeColumn.order : columns.getMaxOrder() + 1;

	    for (var i = columns.getMaxOrder(), to = column.order; i >= to; i--) {
	      var col = columns.getByOrder(i);
	      if (col) {
	        col.order++;
	      }
	    }

	    columns.push(column);
	    columns.normalizeOrder();

	    p.visibleColumns = columns.getVisibleColumns();
	    this._ensureVisibleColumns().clearAndRender(render);

	    this.trigger('addcolumn', column.name);
	  }
	  return this;
	};

	/**
	    * Remove a column from the table
	    * @public
	    * @expose
	    * @param {String} column column name
	    * @param {Boolean=true} render - Should render now?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.removeColumn = function (column, render) {
	  var p = this.p;
	  var columns = p.columns;

	  var colIdx = columns.indexOf(column);
	  if (colIdx > -1) {
	    columns.splice(colIdx, 1);
	    columns.normalizeOrder();

	    p.visibleColumns = columns.getVisibleColumns();
	    this._ensureVisibleColumns().clearAndRender(render);

	    this.trigger('removecolumn', column);
	  }
	  return this;
	};

	/**
	    * Sets a new cell formatter.
	    * @public
	    * @expose
	    * @param {function(value: *, columnName: String, row: Object):String|null} [formatter=null] - The cell formatter. Should return an HTML.
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setCellFormatter = function (formatter) {
	  /**
	                                                            * @private
	                                                            * @field {Function} cellFormatter */
	  this.o.cellFormatter = formatter || function (val) {
	    return typeof val === 'string' ? htmlEncode(val) : val;
	  };

	  return this;
	};

	/**
	    * Sets a new header cell formatter.
	    * @public
	    * @expose
	    * @param {function(label: String, columnName: String):String|null} [formatter=null] - The cell formatter. Should return an HTML.
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setHeaderCellFormatter = function (formatter) {
	  /**
	                                                                  * @private
	                                                                  * @field {Function} headerCellFormatter */
	  this.o.headerCellFormatter = formatter || function (val) {
	    return typeof val === 'string' ? htmlEncode(val) : val;
	  };

	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @param {function(row:Object,args:Object):Boolean|null} [filterFunc=null] - The filter function to work with filters. Default is a by-colum filter.
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setFilter = function (filterFunc) {
	  /** @private
	                                                      * @field {Function} filter */
	  this.o.filter = filterFunc;
	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @param {Object|null} args - Options to pass to the filter function
	    * @returns {DGTable} self
	    */
	DGTable.prototype.filter = function (args) {
	  var p = this.p;

	  var filterFunc = this.o.filter || ByColumnFilter;

	  // Deprecated use of older by-column filter
	  if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
	    args = {
	      column: arguments[0],
	      keyword: arguments[1],
	      caseSensitive: arguments[2] };

	  }

	  var hadFilter = !!p.filteredRows;
	  if (p.filteredRows) {
	    p.filteredRows = null; // Allow releasing array memory now
	  }

	  // Shallow-clone the args, as the filter function may want to modify it for keeping state
	  p.filterArgs = _typeof(args) === 'object' && !Array.isArray(args) ? $$1.extend({}, args) : args;
	  p.filteredRows = p.rows.filteredCollection(filterFunc, p.filterArgs);

	  if (hadFilter || p.filteredRows) {
	    this.clearAndRender();
	    this.trigger('filter', args);
	  }

	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._refilter = function () {
	  var p = this.p;

	  if (p.filteredRows && p.filterArgs) {
	    var filterFunc = this.o.filter || ByColumnFilter;
	    p.filteredRows = p.rows.filteredCollection(filterFunc, p.filterArgs);
	  }
	  return this;
	};

	/**
	    * Set a new label to a column
	    * @public
	    * @expose
	    * @param {String} column Name of the column
	    * @param {String} label New label for the column
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setColumnLabel = function (column, label) {
	  var p = this.p;

	  var col = p.columns.get(column);
	  if (col) {
	    col.label = label === undefined ? col.name : label;

	    if (col.element) {
	      for (var i = 0; i < col.element[0].firstChild.childNodes.length; i++) {
	        var node = col.element[0].firstChild.childNodes[i];
	        if (node.nodeType === 3) {
	          node.textContent = col.label;
	          break;
	        }
	      }
	    }
	  }
	  return this;
	};

	/**
	    * Move a column to a new position
	    * @public
	    * @expose
	    * @param {String|Number} src Name or position of the column to be moved
	    * @param {String|Number} dest Name of the column currently in the desired position, or the position itself
	    * @returns {DGTable} self
	    */
	DGTable.prototype.moveColumn = function (src, dest) {
	  var o = this.o,p = this.p;

	  var columns = p.columns,
	  col,destCol;

	  if (typeof src === 'string') {
	    col = columns.get(src);
	  } else if (typeof src === 'number') {
	    col = p.visibleColumns[src];
	  }
	  if (typeof dest === 'string') {
	    destCol = columns.get(dest);
	  } else if (typeof dest === 'number') {
	    destCol = p.visibleColumns[dest];
	  }

	  if (col && destCol && src !== dest) {
	    var srcOrder = col.order,destOrder = destCol.order;

	    p.visibleColumns = columns.moveColumn(col, destCol).getVisibleColumns();
	    this._ensureVisibleColumns();

	    if (o.virtualTable) {
	      this.clearAndRender().
	      _updateLastCellWidthFromScrollbar(true);
	    } else {
	      var headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell');
	      var beforePos = srcOrder < destOrder ? destOrder + 1 : destOrder,
	      fromPos = srcOrder;
	      headerCell[0].parentNode.insertBefore(headerCell[fromPos], headerCell[beforePos]);

	      var srcWidth = p.visibleColumns[srcOrder];
	      srcWidth = (srcWidth.actualWidthConsideringScrollbarWidth || srcWidth.actualWidth) + 'px';
	      var destWidth = p.visibleColumns[destOrder];
	      destWidth = (destWidth.actualWidthConsideringScrollbarWidth || destWidth.actualWidth) + 'px';

	      var tbodyChildren = p.$tbody[0].childNodes;
	      for (var i = 0, count = tbodyChildren.length; i < count; i++) {
	        var row = tbodyChildren[i];
	        if (row.nodeType !== 1) continue;
	        row.insertBefore(row.childNodes[fromPos], row.childNodes[beforePos]);
	        row.childNodes[destOrder].firstChild.style.width = destWidth;
	        row.childNodes[srcOrder].firstChild.style.width = srcWidth;
	      }
	    }

	    this.trigger('movecolumn', col.name, srcOrder, destOrder);
	  }
	  return this;
	};

	/**
	    * Sort the table
	    * @public
	    * @expose
	    * @param {String?} column Name of the column to sort on (or null to remove sort arrow)
	    * @param {Boolean=} descending Sort in descending order
	    * @param {Boolean} [add=false] Should this sort be on top of the existing sort? (For multiple column sort)
	    * @returns {DGTable} self
	    */
	DGTable.prototype.sort = function (column, descending, add) {
	  var o = this.o,p = this.p;

	  var columns = p.columns,
	  col = columns.get(column);

	  var currentSort = p.rows.sortColumn;

	  if (col) {

	    if (currentSort.length && currentSort[currentSort.length - 1].column == column) {
	      // Recognize current descending mode, if currently sorting by this column
	      descending = descending === undefined ? !currentSort[currentSort.length - 1].descending : descending;
	    }

	    if (add) {// Add the sort to current sort stack

	      for (var i = 0; i < currentSort.length; i++) {
	        if (currentSort[i].column == col.name) {
	          if (i < currentSort.length - 1) {
	            currentSort.length = 0;
	          } else {
	            currentSort.splice(currentSort.length - 1, 1);
	          }
	          break;
	        }
	      }
	      if (o.sortableColumns > 0 /* allow manual sort when disabled */ && currentSort.length >= o.sortableColumns || currentSort.length >= p.visibleColumns.length) {
	        currentSort.length = 0;
	      }

	    } else {// Sort only by this column
	      currentSort.length = 0;
	    }

	    // Default to ascending
	    descending = descending === undefined ? false : descending;

	    // Set the required column in the front of the stack
	    currentSort.push({
	      column: col.name,
	      comparePath: col.comparePath || col.dataPath,
	      descending: !!descending });

	  } else {
	    currentSort.length = 0;
	  }

	  this._clearSortArrows();

	  for (var _i4 = 0; _i4 < currentSort.length; _i4++) {
	    this._showSortArrow(currentSort[_i4].column, currentSort[_i4].descending);
	  }

	  if (o.adjustColumnWidthForSortArrow && !o._tableSkeletonNeedsRendering) {
	    this.tableWidthChanged(true);
	  }

	  if (o.virtualTable) {
	    while (p.tbody && p.tbody.firstChild) {
	      this.trigger('rowdestroy', p.tbody.firstChild);
	      this._unbindCellEventsForRow(p.tbody.firstChild);
	      p.tbody.removeChild(p.tbody.firstChild);
	    }
	  } else {
	    p.tableSkeletonNeedsRendering = true;
	  }

	  p.rows.sortColumn = currentSort;

	  if (currentSort.length) {
	    p.rows.sort(!!p.filteredRows);
	    if (p.filteredRows) {
	      p.filteredRows.sort(!!p.filteredRows);
	    }
	  }

	  // Build output for event, with option names that will survive compilers
	  var sorts = [];
	  for (var _i5 = 0; _i5 < currentSort.length; _i5++) {
	    sorts.push({ 'column': currentSort[_i5].column, 'descending': currentSort[_i5].descending });
	  }
	  this.trigger('sort', sorts);

	  return this;
	};

	/**
	    * Re-sort the table using current sort specifiers
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.resort = function () {
	  var p = this.p;
	  var columns = p.columns;

	  var currentSort = p.rows.sortColumn;
	  if (currentSort.length) {

	    for (var i = 0; i < currentSort.length; i++) {
	      if (!columns.get(currentSort[i].column)) {
	        currentSort.splice(i--, 1);
	      }
	    }

	    p.rows.sortColumn = currentSort;
	    if (currentSort.length) {
	      p.rows.sort(!!p.filteredRows);
	      if (p.filteredRows) {
	        p.filteredRows.sort(!!p.filteredRows);
	      }
	    }

	    // Build output for event, with option names that will survive compilers
	    var sorts = [];
	    for (var _i6 = 0; _i6 < currentSort.length; _i6++) {
	      sorts.push({ 'column': currentSort[_i6].column, 'descending': currentSort[_i6].descending });
	    }
	    this.trigger('sort', sorts);
	  }


	  return this;
	};

	/**
	    * Make sure there's at least one column visible
	    * @private
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype._ensureVisibleColumns = function () {
	  var p = this.p;

	  if (p.visibleColumns.length === 0 && p.columns.length) {
	    p.columns[0].visible = true;
	    p.visibleColumns.push(p.columns[0]);
	    this.trigger('showcolumn', p.columns[0].name);
	  }
	  return this;
	};

	/**
	    * Show or hide a column
	    * @public
	    * @expose
	    * @param {String} column Unique column name
	    * @param {Boolean} visible New visibility mode for the column
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setColumnVisible = function (column, visible) {
	  var p = this.p;

	  var col = p.columns.get(column);

	  //noinspection PointlessBooleanExpressionJS
	  visible = !!visible;

	  if (col && !!col.visible != visible) {
	    col.visible = visible;
	    p.visibleColumns = p.columns.getVisibleColumns();
	    this.trigger(visible ? 'showcolumn' : 'hidecolumn', column);
	    this._ensureVisibleColumns();
	    this.clearAndRender();
	  }
	  return this;
	};

	/**
	    * Get the visibility mode of a column
	    * @public
	    * @expose
	    * @returns {Boolean} true if visible
	    */
	DGTable.prototype.isColumnVisible = function (column) {
	  var p = this.p;
	  var col = p.columns.get(column);
	  if (col) {
	    return col.visible;
	  }
	  return false;
	};

	/**
	    * Globally set the minimum column width
	    * @public
	    * @expose
	    * @param {Number} minColumnWidth Minimum column width
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setMinColumnWidth = function (minColumnWidth) {
	  var o = this.o;
	  minColumnWidth = Math.max(minColumnWidth, 0);
	  if (o.minColumnWidth != minColumnWidth) {
	    o.minColumnWidth = minColumnWidth;
	    this.tableWidthChanged(true);
	  }
	  return this;
	};

	/**
	    * Get the current minimum column width
	    * @public
	    * @expose
	    * @returns {Number} Minimum column width
	    */
	DGTable.prototype.getMinColumnWidth = function () {
	  return this.o.minColumnWidth;
	};

	/**
	    * Set the limit on concurrent columns sorted
	    * @public
	    * @expose
	    * @param {Number} sortableColumns How many sortable columns to allow?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setSortableColumns = function (sortableColumns) {
	  var p = this.p,o = this.o;
	  if (o.sortableColumns != sortableColumns) {
	    o.sortableColumns = sortableColumns;
	    if (p.$table) {
	      var headerCell = p.$headerRow.find('>div.' + o.tableClassName + '-header-cell');
	      for (var i = 0; i < headerCell.length; i++) {
	        $$1(headerCell[0])[o.sortableColumns > 0 && p.visibleColumns[i].sortable ? 'addClass' : 'removeClass']('sortable');
	      }
	    }
	  }
	  return this;
	};

	/**
	    * Get the limit on concurrent columns sorted
	    * @public
	    * @expose
	    * @returns {Number} How many sortable columns are allowed?
	    */
	DGTable.prototype.getSortableColumns = function () {
	  return this.o.sortableColumns;
	};

	/**
	    * @public
	    * @expose
	    * @param {Boolean?} movableColumns=true are the columns movable?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setMovableColumns = function (movableColumns) {
	  var o = this.o;
	  //noinspection PointlessBooleanExpressionJS
	  movableColumns = movableColumns === undefined ? true : !!movableColumns;
	  if (o.movableColumns != movableColumns) {
	    o.movableColumns = movableColumns;
	  }
	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @returns {Boolean} are the columns movable?
	    */
	DGTable.prototype.getMovableColumns = function () {
	  return this.o.movableColumns;
	};

	/**
	    * @public
	    * @expose
	    * @param {Boolean} resizableColumns=true are the columns resizable?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setResizableColumns = function (resizableColumns) {
	  var o = this.o;
	  //noinspection PointlessBooleanExpressionJS
	  resizableColumns = resizableColumns === undefined ? true : !!resizableColumns;
	  if (o.resizableColumns != resizableColumns) {
	    o.resizableColumns = resizableColumns;
	  }
	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @returns {Boolean} are the columns resizable?
	    */
	DGTable.prototype.getResizableColumns = function () {
	  return this.o.resizableColumns;
	};

	/**
	    * @public
	    * @expose
	    * @param {{function(string,boolean):{function(a:*,b:*):boolean}}} comparatorCallback a callback function that returns the comparator for a specific column
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setComparatorCallback = function (comparatorCallback) {
	  var o = this.o;
	  if (o.onComparatorRequired != comparatorCallback) {
	    o.onComparatorRequired = comparatorCallback;
	  }
	  return this;
	};

	/**
	    * Set a new width to a column
	    * @public
	    * @expose
	    * @param {String} column name of the column to resize
	    * @param {Number|String} width new column as pixels, or relative size (0.5, 50%)
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setColumnWidth = function (column, width) {

	  var p = this.p;

	  var col = p.columns.get(column);

	  var parsedWidth = this._parseColumnWidth(width, col.ignoreMin ? 0 : this.o.minColumnWidth);

	  if (col) {
	    var oldWidth = this._serializeColumnWidth(col);

	    col.width = parsedWidth.width;
	    col.widthMode = parsedWidth.mode;

	    var newWidth = this._serializeColumnWidth(col);

	    if (oldWidth != newWidth) {
	      this.tableWidthChanged(true); // Calculate actual sizes
	    }

	    this.trigger('columnwidth', col.name, oldWidth, newWidth);
	  }
	  return this;
	};

	/**
	    * @public
	    * @expose
	    * @param {String} column name of the column
	    * @returns {String|null} the serialized width of the specified column, or null if column not found
	    */
	DGTable.prototype.getColumnWidth = function (column) {
	  var p = this.p;

	  var col = p.columns.get(column);
	  if (col) {
	    return this._serializeColumnWidth(col);
	  }
	  return null;
	};

	/**
	    * @public
	    * @expose
	    * @param {String} column name of the column
	    * @returns {SERIALIZED_COLUMN|null} configuration for all columns
	    */
	DGTable.prototype.getColumnConfig = function (column) {
	  var p = this.p;
	  var col = p.columns.get(column);
	  if (col) {
	    return {
	      'order': col.order,
	      'width': this._serializeColumnWidth(col),
	      'visible': col.visible,
	      'label': col.label };

	  }
	  return null;
	};

	/**
	    * Returns a config object for the columns, to allow saving configurations for next time...
	    * @public
	    * @expose
	    * @returns {Object} configuration for all columns
	    */
	DGTable.prototype.getColumnsConfig = function () {
	  var p = this.p;

	  var config = {};
	  for (var i = 0; i < p.columns.length; i++) {
	    config[p.columns[i].name] = this.getColumnConfig(p.columns[i].name);
	  }
	  return config;
	};

	/**
	    * Returns an array of the currently sorted columns
	    * @public
	    * @expose
	    * @returns {Array.<SERIALIZED_COLUMN_SORT>} configuration for all columns
	    */
	DGTable.prototype.getSortedColumns = function () {
	  var p = this.p;

	  var sorted = [];
	  for (var i = 0; i < p.rows.sortColumn.length; i++) {
	    var sort = p.rows.sortColumn[i];
	    sorted.push({ column: sort.column, descending: sort.descending });
	  }
	  return sorted;
	};

	/**
	    * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
	    * @public
	    * @expose
	    * @param {Number} row - index of the row
	    * @param {String} columnName - name of the column
	    * @returns {String} HTML string for the specified cell
	    */
	DGTable.prototype.getHtmlForCell = function (row, columnName) {
	  var p = this.p;

	  if (row < 0 || row > p.rows.length - 1) return null;
	  var column = p.columns.get(columnName);
	  if (!column) return null;
	  var rowData = p.rows[row];

	  return this._getHtmlForCell(rowData, column);
	};

	/**
	    * Returns the HTML string for a specific cell. Can be used externally for special cases (i.e. when setting a fresh HTML in the cell preview through the callback).
	    * @public
	    * @expose
	    * @param {Object} rowData - row data
	    * @param {Object} column - column data
	    * @returns {String} HTML string for the specified cell
	    */
	DGTable.prototype._getHtmlForCell = function (rowData, column) {
	  var dataPath = column.dataPath;
	  var colValue = rowData[dataPath[0]];
	  for (var dataPathIndex = 1; dataPathIndex < dataPath.length; dataPathIndex++) {
	    if (colValue == null) break;
	    colValue = colValue && colValue[dataPath[dataPathIndex]];
	  }

	  var content = this.o.cellFormatter(colValue, column.name, rowData);
	  if (content === undefined) {
	    content = '';
	  }

	  return content;
	};

	/**
	    * Returns the y pos of a row by index
	    * @public
	    * @expose
	    * @param {Number} rowIndex - index of the row
	    * @returns {Number|null} Y pos
	    */
	DGTable.prototype.getRowYPos = function (rowIndex) {
	  var p = this.p;

	  if (this.o.virtualTable) {
	    return rowIndex > 0 ? p.virtualRowHeightFirst + (rowIndex - 1) * p.virtualRowHeight : 0;
	  } else {
	    var row = p.tbody.childNodes[rowIndex];
	    return row ? row.offsetTop : null;
	  }
	};

	/**
	    * Returns the row data for a specific row
	    * @public
	    * @expose
	    * @param {Number} row index of the row
	    * @returns {Object} Row data
	    */
	DGTable.prototype.getDataForRow = function (row) {
	  var p = this.p;

	  if (row < 0 || row > p.rows.length - 1) return null;
	  return p.rows[row];
	};

	/**
	    * Gets the number of rows
	    * @public
	    * @expose
	    * @returns {Number} Row count
	    */
	DGTable.prototype.getRowCount = function () {
	  var p = this.p;
	  return p.rows ? p.rows.length : 0;
	};

	/**
	    * Returns the physical row index for specific row
	    * @public
	    * @expose
	    * @param {Object} rowData - Row data to find
	    * @returns {Number} Row index
	    */
	DGTable.prototype.getIndexForRow = function (rowData) {
	  var p = this.p;
	  return p.rows.indexOf(rowData);
	};

	/**
	    * Gets the number of filtered rows
	    * @public
	    * @expose
	    * @returns {Number} Filtered row count
	    */
	DGTable.prototype.getFilteredRowCount = function () {
	  var p = this.p;
	  return (p.filteredRows || p.rows).length;
	};

	/**
	    * Returns the filtered row index for specific row
	    * @public
	    * @expose
	    * @param {Object} rowData - Row data to find
	    * @returns {Number} Row index
	    */
	DGTable.prototype.getIndexForFilteredRow = function (rowData) {
	  var p = this.p;
	  return (p.filteredRows || p.rows).indexOf(rowData);
	};

	/**
	    * Returns the row data for a specific row
	    * @public
	    * @expose
	    * @param {Number} row index of the filtered row
	    * @returns {Object} Row data
	    */
	DGTable.prototype.getDataForFilteredRow = function (row) {
	  var p = this.p;
	  if (row < 0 || row > (p.filteredRows || p.rows).length - 1) return null;
	  return (p.filteredRows || p.rows)[row];
	};

	/**
	    * Returns DOM element of the header row
	    * @public
	    * @expose
	    * @returns {Element} Row element
	    */
	DGTable.prototype.getHeaderRowElement = function () {
	  return this.p.headerRow;
	};

	/**
	    * @private
	    * @param {Element} el
	    * @returns {Number} width
	    */
	DGTable.prototype._horizontalPadding = function (el) {
	  return (parseFloat($$1.css(el, 'padding-left')) || 0) + (
	  parseFloat($$1.css(el, 'padding-right')) || 0);
	};

	/**
	    * @private
	    * @param {Element} el
	    * @returns {Number} width
	    */
	DGTable.prototype._horizontalBorderWidth = function (el) {
	  return (parseFloat($$1.css(el, 'border-left')) || 0) + (
	  parseFloat($$1.css(el, 'border-right')) || 0);
	};

	/**
	    * @private
	    * @returns {Number} width
	    */
	DGTable.prototype._calculateWidthAvailableForColumns = function () {
	  var o = this.o,p = this.p;

	  // Changing display mode briefly, to prevent taking in account the  parent's scrollbar width when we are the cause for it
	  var oldDisplay, lastScrollTop, lastScrollLeft;
	  if (p.$table) {
	    lastScrollTop = p.table ? p.table.scrollTop : 0;
	    lastScrollLeft = p.table ? p.table.scrollLeft : 0;

	    if (o.virtualTable) {
	      oldDisplay = p.$table[0].style.display;
	      p.$table[0].style.display = 'none';
	    }
	  }

	  var detectedWidth = CssUtil.width(this.$el);

	  if (p.$table) {
	    if (o.virtualTable) {
	      p.$table[0].style.display = oldDisplay;
	    }

	    p.table.scrollTop = lastScrollTop;
	    p.table.scrollLeft = lastScrollLeft;
	    p.header.scrollLeft = lastScrollLeft;
	  }

	  var tableClassName = o.tableClassName;

	  var $thisWrapper = $$1('<div>').addClass(this.el.className).css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px' });
	  var $header = $$1('<div>').addClass(tableClassName + '-header').appendTo($thisWrapper);
	  var $headerRow = $$1('<div>').addClass(tableClassName + '-header-row').appendTo($header);
	  for (var i = 0; i < p.visibleColumns.length; i++) {
	    $headerRow.append($$1('<div><div></div></div>').addClass(tableClassName + '-header-cell').addClass(p.visibleColumns[i].cellClasses || ''));
	  }
	  $thisWrapper.appendTo(document.body);

	  detectedWidth -= this._horizontalBorderWidth($headerRow[0]);

	  var $cells = $headerRow.find('>div.' + tableClassName + '-header-cell');
	  for (var _i7 = 0; _i7 < $cells.length; _i7++) {
	    var $cell = $$1($cells[_i7]);

	    var isBoxing = $cell.css('boxSizing') === 'border-box';
	    if (!isBoxing) {
	      detectedWidth -=
	      (parseFloat($cell.css('border-right-width')) || 0) + (
	      parseFloat($cell.css('border-left-width')) || 0) +
	      this._horizontalPadding($cell[0]); // CELL's padding
	    }
	  }

	  if ($thisWrapper) {
	    $thisWrapper.remove();
	  }

	  return Math.max(0, detectedWidth);
	};

	/**
	    * Notify the table that its width has changed
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.tableWidthChanged = function () {

	  var getTextWidth = function getTextWidth(text) {
	    var tableClassName = this.o.tableClassName;

	    var $cell,$tableWrapper = $$1('<div>').addClass(this.$el).append(
	    $$1('<div>').addClass(tableClassName + '-header').append(
	    $$1('<div>').addClass(tableClassName + '-header-row').append(
	    $cell = $$1('<div>').addClass(tableClassName + '-header-cell').append(
	    $$1('<div>').text(text))))).



	    css({ 'position': 'absolute', top: '-9999px', 'visibility': 'hidden' });
	    $tableWrapper.appendTo(document.body);

	    var width = CssUtil.width($cell);

	    $tableWrapper.remove();

	    return width;
	  };

	  var lastDetectedWidth = null;

	  /**
	                                 * @public
	                                 * @expose
	                                 * @param {Boolean} [forceUpdate=false]
	                                 * @param {Boolean} [renderColumns=true]
	                                 * @returns {DGTable} self
	                                 */
	  return function (forceUpdate, renderColumns) {

	    var that = this,
	    o = that.o,
	    p = that.p,
	    detectedWidth = this._calculateWidthAvailableForColumns(),
	    sizeLeft = detectedWidth,
	    relatives = 0;

	    renderColumns = renderColumns === undefined || renderColumns;

	    var tableWidthBeforeCalculations = 0;

	    if (!p.tbody) {
	      renderColumns = false;
	    }

	    if (renderColumns) {
	      tableWidthBeforeCalculations = parseFloat(p.tbody.style.minWidth) || 0;
	    }

	    if (sizeLeft != lastDetectedWidth || forceUpdate) {
	      lastDetectedWidth = detectedWidth;

	      var absWidthTotal = 0,changedColumnIndexes = [],totalRelativePercentage = 0;

	      for (var i = 0; i < p.columns.length; i++) {
	        p.columns[i].actualWidthConsideringScrollbarWidth = null;
	      }

	      for (var _i8 = 0; _i8 < p.visibleColumns.length; _i8++) {
	        var col = p.visibleColumns[_i8];
	        if (col.widthMode === ColumnWidthMode.ABSOLUTE) {
	          var width = col.width;
	          width += col.arrowProposedWidth || 0; // Sort-arrow width
	          if (!col.ignoreMin && width < o.minColumnWidth) {
	            width = o.minColumnWidth;
	          }
	          sizeLeft -= width;
	          absWidthTotal += width;

	          // Update actualWidth
	          if (width !== col.actualWidth) {
	            col.actualWidth = width;
	            changedColumnIndexes.push(_i8);
	          }
	        } else if (col.widthMode === ColumnWidthMode.AUTO) {
	          var _width = getTextWidth.call(this, col.label) + 20;
	          _width += col.arrowProposedWidth || 0; // Sort-arrow width
	          if (!col.ignoreMin && _width < o.minColumnWidth) {
	            _width = o.minColumnWidth;
	          }
	          sizeLeft -= _width;
	          absWidthTotal += _width;

	          // Update actualWidth
	          if (_width !== col.actualWidth) {
	            col.actualWidth = _width;
	            if (!o.convertColumnWidthsToRelative) {
	              changedColumnIndexes.push(_i8);
	            }
	          }
	        } else if (col.widthMode === ColumnWidthMode.RELATIVE) {
	          totalRelativePercentage += col.width;
	          relatives++;
	        }
	      }

	      // Normalize relative sizes if needed
	      if (o.convertColumnWidthsToRelative) {
	        for (var _i9 = 0; _i9 < p.visibleColumns.length; _i9++) {
	          var _col = p.visibleColumns[_i9];
	          if (_col.widthMode === ColumnWidthMode.AUTO) {
	            _col.widthMode = ColumnWidthMode.RELATIVE;
	            sizeLeft += _col.actualWidth;
	            _col.width = _col.actualWidth / absWidthTotal;
	            totalRelativePercentage += _col.width;
	            relatives++;
	          }
	        }
	      }

	      // Normalize relative sizes if needed
	      if (relatives && (totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth ||
	      totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth)) {
	        for (var _i10 = 0; _i10 < p.visibleColumns.length; _i10++) {
	          var _col2 = p.visibleColumns[_i10];
	          if (_col2.widthMode === ColumnWidthMode.RELATIVE) {
	            _col2.width /= totalRelativePercentage;
	          }
	        }
	      }

	      var sizeLeftForRelative = Math.max(0, sizeLeft); // Use this as the space to take the relative widths out of
	      if (sizeLeftForRelative === 0) {
	        sizeLeftForRelative = p.table.clientWidth;
	      }

	      var minColumnWidthRelative = o.minColumnWidth / sizeLeftForRelative;
	      if (isNaN(minColumnWidthRelative)) {
	        minColumnWidthRelative = 0;
	      }
	      if (minColumnWidthRelative > 0) {
	        var extraRelative = 0,delta;

	        // First pass - make sure they are all constrained to the minimum width
	        for (var _i11 = 0; _i11 < p.visibleColumns.length; _i11++) {
	          var _col3 = p.visibleColumns[_i11];
	          if (_col3.widthMode === ColumnWidthMode.RELATIVE) {
	            if (!_col3.ignoreMin && _col3.width < minColumnWidthRelative) {
	              extraRelative += minColumnWidthRelative - _col3.width;
	              _col3.width = minColumnWidthRelative;
	            }
	          }
	        }

	        // Second pass - try to take the extra width out of the other columns to compensate
	        for (var _i12 = 0; _i12 < p.visibleColumns.length; _i12++) {
	          var _col4 = p.visibleColumns[_i12];
	          if (_col4.widthMode === ColumnWidthMode.RELATIVE) {
	            if (!_col4.ignoreMin && _col4.width > minColumnWidthRelative) {
	              if (extraRelative > 0) {
	                delta = Math.min(extraRelative, _col4.width - minColumnWidthRelative);
	                _col4.width -= delta;
	                extraRelative -= delta;
	              }
	            }
	          }
	        }
	      }

	      // Try to fill width
	      if (o.autoFillTableWidth && sizeLeft > 0) {
	        var nonResizableTotal = 0;
	        var sizeLeftToFill = sizeLeft;

	        for (var _i13 = 0; _i13 < p.visibleColumns.length; _i13++) {
	          var _col5 = p.visibleColumns[_i13];
	          if (!_col5.resizable && _col5.widthMode === ColumnWidthMode.ABSOLUTE)
	          nonResizableTotal += _col5.width;

	          if (_col5.widthMode === ColumnWidthMode.RELATIVE)
	          sizeLeftToFill -= Math.round(sizeLeftForRelative * _col5.width);
	        }

	        var conv = (detectedWidth - nonResizableTotal) / (detectedWidth - sizeLeftToFill - nonResizableTotal) || NaN;
	        for (var _i14 = 0; _i14 < p.visibleColumns.length && sizeLeftToFill > 0; _i14++) {
	          var _col6 = p.visibleColumns[_i14];
	          if (!_col6.resizable && _col6.widthMode === ColumnWidthMode.ABSOLUTE)
	          continue;

	          if (_col6.widthMode === ColumnWidthMode.RELATIVE) {
	            _col6.width *= conv;
	          } else {
	            var _width2 = _col6.actualWidth * conv;
	            if (_col6.actualWidth !== _width2) {
	              _col6.actualWidth = _width2;
	              if (changedColumnIndexes.indexOf(_i14) === -1)
	              changedColumnIndexes.push(_i14);
	            }
	          }
	        }
	      }

	      // Materialize relative sizes
	      for (var _i15 = 0; _i15 < p.visibleColumns.length; _i15++) {
	        var _col7 = p.visibleColumns[_i15];
	        if (_col7.widthMode === ColumnWidthMode.RELATIVE) {
	          var _width3 = Math.round(sizeLeftForRelative * _col7.width);
	          sizeLeft -= _width3;
	          relatives--;

	          // Take care of rounding errors
	          if (relatives === 0 && sizeLeft === 1) {// Take care of rounding errors
	            _width3++;
	            sizeLeft--;
	          }
	          if (sizeLeft === -1) {
	            _width3--;
	            sizeLeft++;
	          }

	          // Update actualWidth
	          if (_width3 !== _col7.actualWidth) {
	            _col7.actualWidth = _width3;
	            changedColumnIndexes.push(_i15);
	          }
	        }
	      }

	      if (p.visibleColumns.length) {
	        // (There should always be at least 1 column visible, but just in case)
	        p.visibleColumns[p.visibleColumns.length - 1].actualWidthConsideringScrollbarWidth =
	        p.visibleColumns[p.visibleColumns.length - 1].actualWidth - (p.scrollbarWidth || 0);
	      }

	      if (renderColumns) {
	        var tableWidth = this._calculateTbodyWidth();

	        if (tableWidthBeforeCalculations < tableWidth) {
	          this._updateTableWidth(false);
	        }

	        for (var _i16 = 0; _i16 < changedColumnIndexes.length; _i16++) {
	          this._resizeColumnElements(changedColumnIndexes[_i16]);
	        }

	        if (tableWidthBeforeCalculations > tableWidth) {
	          this._updateTableWidth(false);
	        }
	      }
	    }

	    return this;
	  };
	}();

	/**
	      * Notify the table that its height has changed
	      * @public
	      * @expose
	      * @returns {DGTable} self
	      */
	DGTable.prototype.tableHeightChanged = function () {
	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (!p.$table) {
	    return that;
	  }

	  var height = CssUtil.innerHeight(that.$el) - (
	  parseFloat(p.$table.css('border-top-width')) || 0) // Subtract top border of inner element
	  - (parseFloat(p.$table.css('border-bottom-width')) || 0); // Subtract bottom border of inner element

	  if (height != o.height) {

	    o.height = height;

	    if (p.tbody) {
	      // At least 1 pixel - to show scrollers correctly.
	      p.tbody.style.height = Math.max(o.height - CssUtil.outerHeight(p.$headerRow), 1) + 'px';
	    }

	    if (o.virtualTable) {
	      that.clearAndRender();
	    }
	  }

	  return that;
	};

	/**
	    * Add rows to the table
	    * @public
	    * @expose
	    * @param {Object[]} data - array of rows to add to the table
	    * @param {Number} [at=-1] - where to add the rows at
	    * @param {Boolean} [resort=false] - should resort all rows?
	    * @param {Boolean} [render=true]
	    * @returns {DGTable} self
	    */
	DGTable.prototype.addRows = function (data, at, resort, render) {
	  var that = this,
	  p = that.p;

	  if (typeof at === 'boolean') {
	    render = resort;
	    resort = at;
	    at = -1;
	  }

	  if (typeof at !== 'number')
	  at = -1;

	  if (at < 0 || at > p.rows.length)
	  at = p.rows.length;

	  render = render === undefined ? true : !!render;

	  if (data) {
	    p.rows.add(data, at);

	    if (p.filteredRows || resort && p.rows.sortColumn.length) {

	      if (resort && p.rows.sortColumn.length) {
	        this.resort();
	      } else {
	        this._refilter();
	      }

	      p.tableSkeletonNeedsRendering = true;

	      if (render) {
	        // Render the skeleton with all rows from scratch
	        this.render();
	      }

	    } else if (render) {
	      var childNodes = p.tbody.childNodes;

	      if (that.o.virtualTable) {

	        while (p.tbody.firstChild) {
	          this.trigger('rowdestroy', p.tbody.firstChild);
	          this._unbindCellEventsForRow(p.tbody.firstChild);
	          p.tbody.removeChild(p.tbody.firstChild);
	        }

	        this._calculateVirtualHeight() // Calculate virtual height
	        ._updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height
	        .render().
	        _updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar

	      } else if (p.$tbody) {

	        var firstRow = at,
	        lastRow = at + data.length - 1;

	        var renderedRows = that.renderRows(firstRow, lastRow);
	        p.tbody.insertBefore(renderedRows, childNodes[at] || null);

	        for (var i = lastRow + 1; i < childNodes.length; i++) {
	          var row = childNodes[i];
	          row['rowIndex'] += data.length;
	          row['physicalRowIndex'] += data.length;
	        }

	        this.render().
	        _updateLastCellWidthFromScrollbar() // Detect vertical scrollbar height, and update existing last cells
	        ._updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar

	      }
	    }

	    this.trigger('addrows', data.length, false);
	  }
	  return this;
	};

	/**
	    * Removes a row from the table
	    * @public
	    * @expose
	    * @param {Number} physicalRowIndex - index
	    * @param {Number} count - how many rows to remove
	    * @param {Boolean=true} render
	    * @returns {DGTable} self
	    */
	DGTable.prototype.removeRows = function (physicalRowIndex, count, render) {
	  var that = this,
	  p = that.p;

	  if (typeof count !== 'number' || count <= 0) return this;

	  if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

	  p.rows.splice(physicalRowIndex, count);
	  render = render === undefined ? true : !!render;

	  if (p.filteredRows) {

	    this._refilter();

	    p.tableSkeletonNeedsRendering = true;

	    if (render) {
	      // Render the skeleton with all rows from scratch
	      this.render();
	    }

	  } else if (render) {

	    var childNodes = p.tbody.childNodes;

	    if (this.o.virtualTable) {

	      while (p.tbody.firstChild) {
	        this.trigger('rowdestroy', p.tbody.firstChild);
	        this._unbindCellEventsForRow(p.tbody.firstChild);
	        p.tbody.removeChild(p.tbody.firstChild);
	      }

	      this._calculateVirtualHeight().
	      _updateLastCellWidthFromScrollbar().
	      render().
	      _updateTableWidth(false); // Update table width to suit the required width considering vertical scrollbar


	    } else {

	      var lastRowIndex = physicalRowIndex + count - 1;

	      for (var i = 0; i < childNodes.length; i++) {
	        var row = childNodes[i];
	        var index = row['physicalRowIndex'];

	        if (index >= physicalRowIndex) {
	          if (index <= lastRowIndex) {
	            this.trigger('rowdestroy', row);
	            this._unbindCellEventsForRow(row);
	            p.tbody.removeChild(row);
	            i--;
	          } else {
	            row['physicalRowIndex'] -= count;
	          }
	        } else {
	          row['rowIndex'] = i;
	        }
	      }

	      this.render().
	      _updateLastCellWidthFromScrollbar().
	      _updateTableWidth(true); // Update table width to suit the required width considering vertical scrollbar

	    }
	  }

	  return this;
	};

	/**
	    * Removes a row from the table
	    * @public
	    * @expose
	    * @param {Number} physicalRowIndex - index
	    * @param {Boolean=true} render
	    * @returns {DGTable} self
	    */
	DGTable.prototype.removeRow = function (physicalRowIndex, render) {
	  return this.removeRows(physicalRowIndex, 1, render);
	};

	/**
	    * Refreshes the row specified
	    * @public
	    * @expose
	    * @param {Number} physicalRowIndex index
	    * @returns {DGTable} self
	    */
	DGTable.prototype.refreshRow = function (physicalRowIndex) {
	  var that = this,
	  p = that.p;

	  if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return this;

	  // Find out if the row is in the rendered dataset
	  var rowIndex = -1;
	  if (p.filteredRows && (rowIndex = p.filteredRows.indexOf(p.rows[physicalRowIndex])) === -1) return this;

	  if (rowIndex === -1) {
	    rowIndex = physicalRowIndex;
	  }

	  var childNodes = p.tbody.childNodes;

	  if (this.o.virtualTable) {
	    // Now make sure that the row actually rendered, as this is a virtual table
	    var isRowVisible = false;
	    var i = 0;

	    for (; i < childNodes.length; i++) {
	      if (childNodes[i]['physicalRowIndex'] === physicalRowIndex) {
	        isRowVisible = true;
	        this.trigger('rowdestroy', childNodes[i]);
	        this._unbindCellEventsForRow(childNodes[i]);
	        p.tbody.removeChild(childNodes[i]);
	        break;
	      }
	    }

	    if (isRowVisible) {
	      var renderedRow = this.renderRows(rowIndex, rowIndex);
	      p.tbody.insertBefore(renderedRow, childNodes[i] || null);
	    }
	  } else {
	    this.trigger('rowdestroy', childNodes[rowIndex]);
	    this._unbindCellEventsForRow(childNodes[rowIndex]);
	    p.tbody.removeChild(childNodes[rowIndex]);
	    var _renderedRow = this.renderRows(rowIndex, rowIndex);
	    p.tbody.insertBefore(_renderedRow, childNodes[rowIndex] || null);
	  }

	  return this;
	};

	/**
	    * Get the DOM element for the specified row, if it exists
	    * @public
	    * @expose
	    * @param {Number} physicalRowIndex index
	    * @returns {Element?} row or null
	    */
	DGTable.prototype.getRowElement = function (physicalRowIndex) {
	  var that = this,
	  p = that.p;

	  if (physicalRowIndex < 0 || physicalRowIndex > p.rows.length - 1) return null;

	  // Find out if the row is in the rendered dataset
	  var rowIndex = -1;
	  if (p.filteredRows && (rowIndex = p.filteredRows.indexOf(p.rows[physicalRowIndex])) === -1) return this;

	  if (rowIndex === -1) {
	    rowIndex = physicalRowIndex;
	  }

	  var childNodes = p.tbody.childNodes;

	  if (this.o.virtualTable) {
	    // Now make sure that the row actually rendered, as this is a virtual table
	    for (var i = 0; i < childNodes.length; i++) {
	      if (childNodes[i]['physicalRowIndex'] === physicalRowIndex) {
	        return childNodes[i];
	      }
	    }
	  } else {
	    return childNodes[rowIndex];
	  }

	  return null;
	};

	/**
	    * Refreshes all virtual rows
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.refreshAllVirtualRows = function () {

	  var p = this.p;

	  if (this.o.virtualTable) {
	    // Now make sure that the row actually rendered, as this is a virtual table
	    var rowsToRender = [];
	    var childNodes = p.tbody.childNodes;

	    for (var i = 0, rowCount = childNodes.length; i < rowCount; i++) {
	      rowsToRender.push(childNodes[i]['physicalRowIndex']);
	      this.trigger('rowdestroy', childNodes[i]);
	      this._unbindCellEventsForRow(childNodes[i]);
	      p.tbody.removeChild(childNodes[i]);
	      i--;
	      rowCount--;
	    }

	    for (var _i17 = 0; _i17 < rowsToRender.length; _i17++) {
	      var renderedRow = this.renderRows(rowsToRender[_i17], rowsToRender[_i17]);
	      p.tbody.appendChild(renderedRow);
	    }
	  }

	  return this;
	};

	/**
	    * Replace the whole dataset
	    * @public
	    * @expose
	    * @param {Object[]} data array of rows to add to the table
	    * @param {Boolean} [resort=false] should resort all rows?
	    * @returns {DGTable} self
	    */
	DGTable.prototype.setRows = function (data, resort) {
	  var that = this,
	  p = that.p;

	  // this.scrollTop = this.$el.find('.table').scrollTop();
	  p.rows.reset(data);

	  if (resort && p.rows.sortColumn.length) {
	    this.resort();
	  } else {
	    this._refilter();
	  }

	  this.clearAndRender().trigger('addrows', data.length, true);

	  return this;
	};

	/**
	    * Creates a URL representing the data in the specified element.
	    * This uses the Blob or BlobBuilder of the modern browsers.
	    * The url can be used for a Web Worker.
	    * @public
	    * @expose
	    * @param {string} id Id of the element containing your data
	    * @returns {String|null} the url, or null if not supported
	    */
	DGTable.prototype.getUrlForElementContent = function (id) {
	  var blob,
	  el = document.getElementById(id);
	  if (el) {
	    var data = el.textContent;
	    if (typeof Blob === 'function') {
	      blob = new Blob([data]);
	    } else {
	      var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MozBlobBuilder || global.MSBlobBuilder;
	      if (!BlobBuilder) {
	        return null;
	      }
	      var builder = new BlobBuilder();
	      builder.append(data);
	      blob = builder.getBlob();
	    }
	    return (global.URL || global.webkitURL).createObjectURL(blob);
	  }
	  return null;
	};

	/**
	    * @public
	    * @expose
	    * @returns {Boolean} A value indicating whether Web Workers are supported
	    */
	DGTable.prototype.isWorkerSupported = function () {
	  return global['Worker'] instanceof Function;
	};

	/**
	    * Creates a Web Worker for updating the table.
	    * @public
	    * @expose
	    * @param {string} url Url to the script for the Web Worker
	    * @param {Boolean=true} start if true, starts the Worker immediately
	    * @returns {Worker?} the Web Worker, or null if not supported
	    */
	DGTable.prototype.createWebWorker = function (url, start, resort) {
	  if (this.isWorkerSupported()) {
	    var that = this,
	    p = that.p;

	    var worker = new Worker(url);
	    var listener = function listener(evt) {
	      if (evt.data.append) {
	        that.addRows(evt.data.rows, resort);
	      } else {
	        that.setRows(evt.data.rows, resort);
	      }
	    };
	    worker.addEventListener('message', listener, false);
	    if (!p.workerListeners) {
	      p.workerListeners = [];
	    }
	    p.workerListeners.push({ worker: worker, listener: listener });
	    if (start || start === undefined) {
	      worker.postMessage(null);
	    }
	    return worker;
	  }
	  return null;
	};

	/**
	    * Unbinds a Web Worker from the table, stopping updates.
	    * @public
	    * @expose
	    * @param {Worker} worker the Web Worker
	    * @returns {DGTable} self
	    */
	DGTable.prototype.unbindWebWorker = function (worker) {
	  var that = this,
	  p = that.p;

	  if (p.workerListeners) {
	    for (var j = 0; j < p.workerListeners.length; j++) {
	      if (p.workerListeners[j].worker == worker) {
	        worker.removeEventListener('message', p.workerListeners[j].listener, false);
	        p.workerListeners.splice(j, 1);
	        j--;
	      }
	    }
	  }

	  return this;
	};

	/**
	    * A synonym for hideCellPreview()
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.abortCellPreview = function () {
	  this.hideCellPreview();
	  return this;
	};

	/**
	    * Cancel a resize in progress
	    * @expose
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype.cancelColumnResize = function () {
	  var p = this.p;

	  if (p.$resizer) {
	    p.$resizer.remove();
	    p.$resizer = null;
	    $$1(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound).
	    off('mouseup.dgtable', p.onEndDragColumnHeaderBound);
	  }

	  return this;
	};

	/**
	    * @param {jQuery_Event} event
	    */
	DGTable.prototype._onVirtualTableScrolled = function (_event) {
	  this.render();
	};

	/**
	    * @param {jQuery_Event} event
	    */
	DGTable.prototype._onTableScrolledHorizontally = function (_event) {
	  var p = this.p;

	  p.header.scrollLeft = p.table.scrollLeft;
	};

	/**previousElementSibling
	    * Reverse-calculate the column to resize from mouse position
	    * @private
	    * @param {jQuery_Event} e jQuery mouse event
	    * @returns {String} name of the column which the mouse is over, or null if the mouse is not in resize position
	    */
	DGTable.prototype._getColumnByResizePosition = function (e) {

	  var that = this,
	  o = that.o,
	  rtl = this._isTableRtl();

	  var $headerCell = $$1(e.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName),
	  headerCell = $headerCell[0];
	  if (headerCell['__cell']) {
	    headerCell = headerCell['__cell'];
	    $headerCell = $$1(headerCell);
	  }

	  var previousElementSibling = $headerCell[0].previousSibling;
	  while (previousElementSibling && previousElementSibling.nodeType != 1) {
	    previousElementSibling = previousElementSibling.previousSibling;
	  }

	  var firstCol = !previousElementSibling;

	  var mouseX = ((e.pageX != null ? e.pageX : e.originalEvent.pageX) || e.originalEvent.clientX) - $headerCell.offset().left;

	  if (rtl) {
	    if (!firstCol && CssUtil.outerWidth($headerCell) - mouseX <= o.resizeAreaWidth / 2) {
	      return previousElementSibling['columnName'];
	    } else if (mouseX <= o.resizeAreaWidth / 2) {
	      return headerCell['columnName'];
	    }
	  } else {
	    if (!firstCol && mouseX <= o.resizeAreaWidth / 2) {
	      return previousElementSibling['columnName'];
	    } else if (CssUtil.outerWidth($headerCell) - mouseX <= o.resizeAreaWidth / 2) {
	      return headerCell['columnName'];
	    }
	  }

	  return null;
	};

	/**
	    * @param {jQuery_Event} event
	    */
	DGTable.prototype._onTouchStartColumnHeader = function (event) {var _this2 = this;
	  var p = this.p;

	  if (p.currentTouchId) return;

	  var startTouch = event.originalEvent.changedTouches[0];
	  p.currentTouchId = startTouch.identifier;

	  var $eventTarget = $$1(event.currentTarget);

	  var startPos = { x: startTouch.pageX, y: startTouch.pageY },
	  currentPos = startPos,
	  distanceTreshold = 9;

	  var tapAndHoldTimeout;

	  var unbind = function unbind() {
	    p.currentTouchId = null;
	    $eventTarget.off('touchend').off('touchcancel');
	    clearTimeout(tapAndHoldTimeout);
	  };

	  var fakeEvent = function fakeEvent(name) {
	    var fakeEvent = $$1.Event(name);
	    var extendObjects = Array.prototype.slice.call(arguments, 1);
	    $$1.each(['target', 'clientX', 'clientY', 'offsetX', 'offsetY', 'screenX', 'screenY', 'pageX', 'pageY', 'which'],
	    function () {
	      fakeEvent[this] = event[this];
	      for (var i = 0; i < extendObjects.length; i++) {
	        if (extendObjects[i][this] != null) {
	          fakeEvent[this] = extendObjects[i][this];
	        }
	      }
	    });
	    return fakeEvent;
	  };

	  $eventTarget.trigger(fakeEvent('mousedown', event.originalEvent.changedTouches[0], { 'which': 1 }));

	  tapAndHoldTimeout = setTimeout(function () {
	    unbind();

	    // Prevent simulated mouse events after touchend
	    $eventTarget.
	    one('touchend', function (event) {
	      event.preventDefault();
	      $eventTarget.off('touchend').off('touchcancel');
	    }).
	    one('touchcancel', function (_event) {
	      $eventTarget.off('touchend').off('touchcancel');
	    });

	    var distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

	    if (distanceTravelled < distanceTreshold) {
	      _this2.cancelColumnResize();
	      $eventTarget.trigger(fakeEvent('mouseup', event.originalEvent.changedTouches[0], { 'which': 3 }));
	    }

	  }, 500);

	  $eventTarget.
	  on('touchend', function (event) {
	    var touch = find$1(event.originalEvent.changedTouches, function (touch) {return touch.identifier === p.currentTouchId;});
	    if (!touch) return;

	    unbind();

	    event.preventDefault(); // Prevent simulated mouse events

	    currentPos = { x: touch.pageX, y: touch.pageY };
	    var distanceTravelled = Math.sqrt(Math.pow(Math.abs(currentPos.x - startPos.x), 2) + Math.pow(Math.abs(currentPos.y - startPos.y), 2));

	    if (distanceTravelled < distanceTreshold || p.$resizer) {
	      $eventTarget.trigger(fakeEvent('mouseup', touch, { 'which': 1 }));
	      $eventTarget.trigger(fakeEvent('click', touch, { 'which': 1 }));
	    }

	  }).
	  on('touchcancel', function () {
	    unbind();
	  }).
	  on('touchmove', function (event) {
	    var touch = find$1(event.originalEvent.changedTouches, function (touch) {return touch.identifier === p.currentTouchId;});
	    if (!touch) return;

	    // Keep track of current position, so we know if we need to cancel the tap-and-hold
	    currentPos = { x: touch.pageX, y: touch.pageY };

	    if (p.$resizer) {
	      event.preventDefault();

	      $eventTarget.trigger(fakeEvent('mousemove', touch));
	    }
	  });
	};

	/**
	    * @param {jQuery_Event} e event
	    */
	DGTable.prototype._onMouseDownColumnHeader = function (event) {
	  if (event.which !== 1) return this; // Only treat left-clicks

	  var that = this,
	  o = that.o,
	  p = that.p,
	  col = this._getColumnByResizePosition(event);

	  if (col) {
	    var column = p.columns.get(col);
	    if (!o.resizableColumns || !column || !column.resizable) {
	      return false;
	    }

	    var rtl = this._isTableRtl();

	    if (p.$resizer) {
	      $$1(p.$resizer).remove();
	    }
	    p.$resizer = $$1('<div></div>').
	    addClass(o.resizerClassName).
	    css({
	      'position': 'absolute',
	      'display': 'block',
	      'z-index': -1,
	      'visibility': 'hidden',
	      'width': '2px',
	      'background': '#000',
	      'opacity': 0.7 }).

	    appendTo(this.$el);

	    var selectedHeaderCell = column.element,
	    commonAncestor = p.$resizer.parent();

	    var posCol = selectedHeaderCell.offset(),
	    posRelative = commonAncestor.offset();
	    if (ieVersion === 8) {
	      posCol = selectedHeaderCell.offset(); // IE8 bug, first time it receives zeros...
	    }
	    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	    posRelative.top += parseFloat(commonAncestor.css('border-top-width')) || 0;
	    posCol.left -= posRelative.left;
	    posCol.top -= posRelative.top;
	    posCol.top -= parseFloat(selectedHeaderCell.css('border-top-width')) || 0;
	    var resizerWidth = CssUtil.outerWidth(p.$resizer);
	    if (rtl) {
	      posCol.left -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
	      posCol.left -= Math.ceil(resizerWidth / 2);
	    } else {
	      posCol.left += CssUtil.outerWidth(selectedHeaderCell);
	      posCol.left += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
	      posCol.left -= Math.ceil(resizerWidth / 2);
	    }

	    p.$resizer.
	    css({
	      'z-index': '10',
	      'visibility': 'visible',
	      'left': posCol.left,
	      'top': posCol.top,
	      'height': CssUtil.height(this.$el) })[
	    0]['columnName'] = selectedHeaderCell[0]['columnName'];

	    try {p.$resizer[0].style.zIndex = '';}
	    catch (ignored) {/* we're ok with this */}

	    $$1(document).on('mousemove.dgtable', p.onMouseMoveResizeAreaBound);
	    $$1(document).on('mouseup.dgtable', p.onEndDragColumnHeaderBound);

	    event.preventDefault();
	  }
	};

	/**
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onMouseMoveColumnHeader = function (event) {

	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (o.resizableColumns) {
	    var col = this._getColumnByResizePosition(event);
	    var headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
	    if (!col || !p.columns.get(col).resizable) {
	      headerCell.style.cursor = '';
	    } else {
	      headerCell.style.cursor = 'e-resize';
	    }
	  }
	};

	/**
	    * @param {jQuery_Event} event
	    */
	DGTable.prototype._onMouseUpColumnHeader = function (event) {
	  if (event.which === 3) {
	    var o = this.o;
	    var $headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	    var bounds = $headerCell.offset();
	    bounds['width'] = CssUtil.outerWidth($headerCell);
	    bounds['height'] = CssUtil.outerHeight($headerCell);
	    this.trigger('headercontextmenu', $headerCell[0]['columnName'], event.pageX, event.pageY, bounds);
	  }
	  return this;
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onMouseLeaveColumnHeader = function (event) {
	  var o = this.o;
	  var headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
	  headerCell.style.cursor = '';
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onClickColumnHeader = function (event) {
	  if (!this._getColumnByResizePosition(event)) {

	    var that = this,
	    o = that.o,
	    p = that.p;

	    var headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName)[0];
	    if (o.sortableColumns) {
	      var column = p.columns.get(headerCell['columnName']);
	      if (column && column.sortable) {
	        this.sort(headerCell['columnName'], undefined, true).render();
	      }
	    }
	  }
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onStartDragColumnHeader = function (event) {

	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (o.movableColumns) {

	    var $headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	    var column = p.columns.get($headerCell[0]['columnName']);
	    if (column && column.movable) {
	      $headerCell[0].style.opacity = 0.35;
	      p.dragId = Math.random() * 0x9999999; // Recognize this ID on drop
	      event.originalEvent.dataTransfer.setData('text', JSON.stringify({ dragId: p.dragId, column: column.name }));
	    } else {
	      event.preventDefault();
	    }

	  } else {

	    event.preventDefault();

	  }

	  return undefined;
	};

	/**
	    * @private
	    * @param {MouseEvent} event event
	    */
	DGTable.prototype._onMouseMoveResizeArea = function (event) {

	  var that = this,
	  p = that.p;

	  var column = p.columns.get(p.$resizer[0]['columnName']);
	  var rtl = this._isTableRtl();

	  var selectedHeaderCell = column.element,
	  commonAncestor = p.$resizer.parent();
	  var posCol = selectedHeaderCell.offset(),posRelative = commonAncestor.offset();
	  posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	  posCol.left -= posRelative.left;
	  var resizerWidth = CssUtil.outerWidth(p.$resizer);

	  var isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box';

	  var actualX = event.pageX - posRelative.left;
	  var minX = posCol.left;

	  minX -= Math.ceil(resizerWidth / 2);

	  if (rtl) {
	    minX += CssUtil.outerWidth(selectedHeaderCell);
	    minX -= column.ignoreMin ? 0 : this.o.minColumnWidth;

	    if (!isBoxing) {
	      minX -= Math.ceil((parseFloat(selectedHeaderCell.css('border-left-width')) || 0) / 2);
	      minX -= this._horizontalPadding(selectedHeaderCell[0]);
	    }

	    if (actualX > minX) {
	      actualX = minX;
	    }
	  } else {
	    minX += column.ignoreMin ? 0 : this.o.minColumnWidth;

	    if (!isBoxing) {
	      minX += Math.ceil((parseFloat(selectedHeaderCell.css('border-right-width')) || 0) / 2);
	      minX += this._horizontalPadding(selectedHeaderCell[0]);
	    }

	    if (actualX < minX) {
	      actualX = minX;
	    }
	  }

	  p.$resizer.css('left', actualX + 'px');
	};

	/**
	    * @private
	    * @param {Event} event event
	    */
	DGTable.prototype._onEndDragColumnHeader = function (event) {

	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (!p.$resizer) {
	    event.target.style.opacity = null;
	  } else {
	    $$1(document).off('mousemove.dgtable', p.onMouseMoveResizeAreaBound).
	    off('mouseup.dgtable', p.onEndDragColumnHeaderBound);

	    var column = p.columns.get(p.$resizer[0]['columnName']);
	    var rtl = this._isTableRtl();

	    var selectedHeaderCell = column.element,
	    commonAncestor = p.$resizer.parent();
	    var posCol = selectedHeaderCell.offset(),posRelative = commonAncestor.offset();
	    posRelative.left += parseFloat(commonAncestor.css('border-left-width')) || 0;
	    posCol.left -= posRelative.left;
	    var resizerWidth = CssUtil.outerWidth(p.$resizer);

	    var isBoxing = selectedHeaderCell.css('box-sizing') === 'border-box';

	    var actualX = event.pageX - posRelative.left;
	    var baseX = posCol.left,minX = posCol.left;
	    var width = 0;

	    baseX -= Math.ceil(resizerWidth / 2);

	    if (rtl) {

	      if (!isBoxing) {
	        actualX += this._horizontalPadding(selectedHeaderCell[0]);
	        actualX += parseFloat(selectedHeaderCell.css('border-left-width')) || 0;
	        actualX += parseFloat(selectedHeaderCell.css('border-right-width')) || 0;
	      }

	      baseX += CssUtil.outerWidth(selectedHeaderCell);

	      minX = baseX - (column.ignoreMin ? 0 : this.o.minColumnWidth);
	      if (actualX > minX) {
	        actualX = minX;
	      }

	      width = baseX - actualX;
	    } else {

	      if (!isBoxing) {
	        actualX -= this._horizontalPadding(selectedHeaderCell[0]);
	        actualX -= parseFloat(selectedHeaderCell.css('border-left-width')) || 0;
	        actualX -= parseFloat(selectedHeaderCell.css('border-right-width')) || 0;
	      }

	      minX = baseX + (column.ignoreMin ? 0 : this.o.minColumnWidth);
	      if (actualX < minX) {
	        actualX = minX;
	      }

	      width = actualX - baseX;
	    }

	    p.$resizer.remove();
	    p.$resizer = null;

	    var sizeToSet = width;

	    if (column.widthMode === ColumnWidthMode.RELATIVE) {
	      var detectedWidth = this._calculateWidthAvailableForColumns();

	      var sizeLeft = detectedWidth;
	      //sizeLeft -= p.table.offsetWidth - p.table.clientWidth;

	      var totalRelativePercentage = 0;
	      var relatives = 0;

	      for (var i = 0; i < p.visibleColumns.length; i++) {
	        var col = p.visibleColumns[i];
	        if (col.name === column.name) continue;

	        if (col.widthMode == ColumnWidthMode.RELATIVE) {
	          totalRelativePercentage += col.width;
	          relatives++;
	        } else {
	          sizeLeft -= col.actualWidth;
	        }
	      }

	      sizeLeft = Math.max(1, sizeLeft);
	      sizeToSet = width / sizeLeft;

	      if (relatives > 0) {
	        // When there's more than one relative overall,
	        //   we can do relative enlarging/shrinking.
	        // Otherwise, we can end up having a 0 width.

	        var unNormalizedSizeToSet = sizeToSet / ((1 - sizeToSet) / totalRelativePercentage);

	        totalRelativePercentage += sizeToSet;

	        // Account for relative widths scaling later
	        if (totalRelativePercentage < 1 && o.relativeWidthGrowsToFillWidth ||
	        totalRelativePercentage > 1 && o.relativeWidthShrinksToFillWidth) {
	          sizeToSet = unNormalizedSizeToSet;
	        }
	      }

	      sizeToSet *= 100;
	      sizeToSet += '%';
	    }

	    this.setColumnWidth(column.name, sizeToSet);
	  }
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onDragEnterColumnHeader = function (event) {
	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (o.movableColumns) {
	    var dataTransferred = event.originalEvent.dataTransfer.getData('text');
	    if (dataTransferred) {
	      dataTransferred = JSON.parse(dataTransferred);
	    } else
	    {
	      dataTransferred = null; // WebKit does not provide the dataTransfer on dragenter?..
	    }

	    var $headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	    if (!dataTransferred ||
	    p.dragId == dataTransferred.dragId && $headerCell['columnName'] !== dataTransferred.column) {

	      var column = p.columns.get($headerCell[0]['columnName']);
	      if (column && (column.movable || column != p.visibleColumns[0])) {
	        $$1($headerCell).addClass('drag-over');
	      }
	    }
	  }
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onDragOverColumnHeader = function (event) {
	  event.preventDefault();
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onDragLeaveColumnHeader = function (event) {
	  var o = this.o;
	  var $headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	  if (!$$1($headerCell[0].firstChild).
	  has(event.originalEvent.relatedTarget).length) {
	    $headerCell.removeClass('drag-over');
	  }
	};

	/**
	    * @private
	    * @param {jQuery_Event} event event
	    */
	DGTable.prototype._onDropColumnHeader = function (event) {
	  event.preventDefault();

	  var that = this,
	  o = that.o,
	  p = that.p;

	  var dataTransferred = JSON.parse(event.originalEvent.dataTransfer.getData('text'));
	  var $headerCell = $$1(event.target).closest('div.' + o.tableClassName + '-header-cell,div.' + o.cellPreviewClassName);
	  if (o.movableColumns && dataTransferred.dragId == p.dragId) {
	    var srcColName = dataTransferred.column,
	    destColName = $headerCell[0]['columnName'],
	    srcCol = p.columns.get(srcColName),
	    destCol = p.columns.get(destColName);
	    if (srcCol && destCol && srcCol.movable && (destCol.movable || destCol != p.visibleColumns[0])) {
	      this.moveColumn(srcColName, destColName);
	    }
	  }
	  $$1($headerCell).removeClass('drag-over');
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._clearSortArrows = function () {

	  var that = this,
	  p = that.p;

	  if (p.$table) {
	    var tableClassName = this.o.tableClassName;
	    var sortedColumns = p.$headerRow.find('>div.' + tableClassName + '-header-cell.sorted');
	    var arrows = sortedColumns.find('>div>.sort-arrow');var _iterator = _createForOfIteratorHelper(
	    arrows),_step;try {for (_iterator.s(); !(_step = _iterator.n()).done;) {var arrow = _step.value;
	        var col = p.columns.get(arrow.parentNode.parentNode['columnName']);
	        if (col) {
	          col.arrowProposedWidth = 0;
	        }
	      }} catch (err) {_iterator.e(err);} finally {_iterator.f();}
	    arrows.remove();
	    sortedColumns.removeClass('sorted').removeClass('desc');
	  }
	  return this;
	};

	/**
	    * @private
	    * @param {String} column the name of the sort column
	    * @param {Boolean} descending table is sorted descending
	    * @returns {DGTable} self
	    */
	DGTable.prototype._showSortArrow = function (column, descending) {

	  var that = this,
	  p = that.p;

	  var col = p.columns.get(column);
	  if (!col) return false;

	  var arrow = createElement('span');
	  arrow.className = 'sort-arrow';

	  if (col.element) {
	    col.element.addClass(descending ? 'sorted desc' : 'sorted');
	    col.element[0].firstChild.insertBefore(arrow, col.element[0].firstChild.firstChild);
	  }

	  if (col.widthMode != ColumnWidthMode.RELATIVE && this.o.adjustColumnWidthForSortArrow) {
	    col.arrowProposedWidth = arrow.scrollWidth + (parseFloat($$1(arrow).css('margin-right')) || 0) + (parseFloat($$1(arrow).css('margin-left')) || 0);
	  }

	  return this;
	};

	/**
	    * @private
	    * @param {Number} cellIndex index of the column in the DOM
	    * @returns {DGTable} self
	    */
	DGTable.prototype._resizeColumnElements = function (cellIndex) {

	  var that = this,
	  p = that.p;

	  var headerCells = p.$headerRow.find('div.' + this.o.tableClassName + '-header-cell');
	  var col = p.columns.get(headerCells[cellIndex]['columnName']);

	  if (col) {
	    headerCells[cellIndex].style.width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';

	    var width = (col.actualWidthConsideringScrollbarWidth || col.actualWidth) + 'px';
	    var tbodyChildren = p.$tbody[0].childNodes;
	    for (var i = 0, count = tbodyChildren.length; i < count; i++) {
	      var headerRow = tbodyChildren[i];
	      if (headerRow.nodeType !== 1) continue;
	      headerRow.childNodes[cellIndex].style.width = width;
	    }
	  }

	  return this;
	};

	/**
	    * @returns {DGTable} self
	    * */
	DGTable.prototype._destroyHeaderCells = function () {

	  var that = this,
	  o = that.o,
	  p = that.p;

	  if (p.$headerRow) {
	    this.trigger('headerrowdestroy', p.headerRow);
	    p.$headerRow.find('div.' + o.tableClassName + '-header-cell').remove();
	    p.$headerRow = null;
	    p.headerRow = null;
	  }
	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._renderSkeletonBase = function () {
	  var that = this,
	  p = that.p,
	  o = that.o;

	  // Clean up old elements

	  if (p.$table && o.virtualTable) {
	    p.$table.remove();
	    if (p.$tbody) {
	      var rows = p.$tbody[0].childNodes;
	      for (var i = 0, len = rows.length; i < len; i++) {
	        that.trigger('rowdestroy', rows[i]);
	        that._unbindCellEventsForRow(rows[i]);
	      }
	    }
	    p.$table = p.table = p.$tbody = p.tbody = null;
	  }

	  that._destroyHeaderCells();
	  p.currentTouchId = null;
	  if (p.$header) {
	    p.$header.remove();
	  }

	  // Create new base elements
	  var tableClassName = o.tableClassName,
	  header = createElement('div'),
	  $header = $$1(header),
	  headerRow = createElement('div'),
	  $headerRow = $$1(headerRow);

	  header.className = tableClassName + '-header';
	  headerRow.className = tableClassName + '-header-row';

	  p.$header = $header;
	  p.header = header;
	  p.$headerRow = $headerRow;
	  p.headerRow = headerRow;
	  $headerRow.appendTo(p.$header);
	  $header.prependTo(this.$el);

	  relativizeElement(that.$el);

	  if (o.width == DGTable.Width.SCROLL) {
	    this.el.style.overflow = 'hidden';
	  } else {
	    this.el.style.overflow = '';
	  }

	  if (!o.height && o.virtualTable) {
	    o.height = CssUtil.innerHeight(this.$el);
	  }

	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._renderSkeletonHeaderCells = function () {
	  var that = this,
	  p = that.p,
	  o = that.o;

	  var allowCellPreview = o.allowCellPreview,
	  allowHeaderCellPreview = o.allowHeaderCellPreview;

	  var tableClassName = o.tableClassName,
	  headerCellClassName = tableClassName + '-header-cell',
	  header = p.header,
	  $header = p.$header,
	  headerRow = p.headerRow,
	  $headerRow = p.$headerRow;

	  var ieDragDropHandler;
	  if (hasIeDragAndDropBug) {
	    ieDragDropHandler = function ieDragDropHandler(evt) {
	      evt.preventDefault();
	      this.dragDrop();
	      return false;
	    };
	  }

	  var preventDefault = function preventDefault(event) {event.preventDefault();};

	  // Create header cells
	  for (var i = 0; i < p.visibleColumns.length; i++) {
	    var column = p.visibleColumns[i];
	    if (column.visible) {
	      var cell = createElement('div');
	      var $cell = $$1(cell);
	      cell.draggable = true;
	      cell.className = headerCellClassName;
	      cell.style.width = column.actualWidth + 'px';
	      if (o.sortableColumns && column.sortable) {
	        cell.className += ' sortable';
	      }
	      cell['columnName'] = column.name;
	      cell.setAttribute('data-column', column.name);

	      var cellInside = createElement('div');
	      cellInside.innerHTML = o.headerCellFormatter(column.label, column.name);
	      cell.appendChild(cellInside);
	      if (allowCellPreview && allowHeaderCellPreview) {
	        p._bindCellHoverIn(cell);
	      }
	      headerRow.appendChild(cell);

	      p.visibleColumns[i].element = $cell;

	      $cell.on('mousedown.dgtable', that._onMouseDownColumnHeader.bind(that)).
	      on('mousemove.dgtable', that._onMouseMoveColumnHeader.bind(that)).
	      on('mouseup.dgtable', that._onMouseUpColumnHeader.bind(that)).
	      on('mouseleave.dgtable', that._onMouseLeaveColumnHeader.bind(that)).
	      on('touchstart.dgtable', that._onTouchStartColumnHeader.bind(that)).
	      on('dragstart.dgtable', that._onStartDragColumnHeader.bind(that)).
	      on('click.dgtable', that._onClickColumnHeader.bind(that)).
	      on('contextmenu.dgtable', preventDefault);
	      $$1(cellInside).
	      on('dragenter.dgtable', that._onDragEnterColumnHeader.bind(that)).
	      on('dragover.dgtable', that._onDragOverColumnHeader.bind(that)).
	      on('dragleave.dgtable', that._onDragLeaveColumnHeader.bind(that)).
	      on('drop.dgtable', that._onDropColumnHeader.bind(that));

	      if (hasIeDragAndDropBug) {
	        $cell.on('selectstart.dgtable', ieDragDropHandler.bind(cell));
	      }

	      // Disable these to allow our own context menu events without interruption
	      $cell.css({ '-webkit-touch-callout': 'none', '-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', '-o-user-select': 'none', 'user-select': 'none' });
	    }
	  }

	  this.trigger('headerrowcreate', headerRow);

	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._renderSkeletonBody = function () {
	  var that = this,
	  p = that.p,
	  o = that.o;

	  var tableClassName = o.tableClassName;

	  // Calculate virtual row heights
	  if (o.virtualTable && !p.virtualRowHeight) {
	    var createDummyRow = function createDummyRow() {
	      var row = createElement('div'),
	      cell = row.appendChild(createElement('div')),
	      cellInner = cell.appendChild(createElement('div'));
	      row.className = tableClassName + '-row';
	      cell.className = tableClassName + '-cell';
	      cellInner.innerHTML = '0';
	      row.style.visibility = 'hidden';
	      row.style.position = 'absolute';
	      return row;
	    };

	    var $dummyTbody,$dummyWrapper = $$1('<div>').
	    addClass(that.el.className).
	    css({ 'z-index': -1, 'position': 'absolute', left: '0', top: '-9999px', width: '1px', overflow: 'hidden' }).
	    append(
	    $$1('<div>').addClass(tableClassName).append(
	    $dummyTbody = $$1('<div>').addClass(tableClassName + '-body').css('width', 99999)));



	    $dummyWrapper.appendTo(document.body);

	    var row1 = createDummyRow(),row2 = createDummyRow(),row3 = createDummyRow();
	    $dummyTbody.append(row1, row2, row3);

	    p.virtualRowHeightFirst = CssUtil.outerHeight(row1);
	    p.virtualRowHeight = CssUtil.outerHeight(row2);
	    p.virtualRowHeightLast = CssUtil.outerHeight(row3);

	    p.virtualRowHeightMin = Math.min(Math.min(p.virtualRowHeightFirst, p.virtualRowHeight), p.virtualRowHeightLast);
	    p.virtualRowHeightMax = Math.max(Math.max(p.virtualRowHeightFirst, p.virtualRowHeight), p.virtualRowHeightLast);

	    $dummyWrapper.remove();
	  }

	  // Create inner table and tbody
	  if (!p.$table) {

	    var fragment = document.createDocumentFragment();

	    // Create the inner table element
	    var table = createElement('div');
	    var $table = $$1(table);
	    table.className = tableClassName;

	    if (o.virtualTable) {
	      table.className += ' virtual';
	    }

	    var tableHeight = o.height - CssUtil.outerHeight(p.$headerRow);
	    if ($table.css('box-sizing') !== 'border-box') {
	      tableHeight -= parseFloat($table.css('border-top-width')) || 0;
	      tableHeight -= parseFloat($table.css('border-bottom-width')) || 0;
	      tableHeight -= parseFloat($table.css('padding-top')) || 0;
	      tableHeight -= parseFloat($table.css('padding-bottom')) || 0;
	    }
	    p.visibleHeight = tableHeight;
	    table.style.height = o.height ? tableHeight + 'px' : 'auto';
	    table.style.display = 'block';
	    table.style.overflowY = 'auto';
	    table.style.overflowX = o.width == DGTable.Width.SCROLL ? 'auto' : 'hidden';
	    fragment.appendChild(table);

	    // Create the "tbody" element
	    var tbody = createElement('div');
	    var $tbody = $$1(tbody);
	    tbody.className = o.tableClassName + '-body';
	    p.table = table;
	    p.tbody = tbody;
	    p.$table = $table;
	    p.$tbody = $tbody;

	    if (o.virtualTable) {
	      p.virtualVisibleRows = Math.ceil(p.visibleHeight / p.virtualRowHeightMin);
	    }

	    that._calculateVirtualHeight();

	    relativizeElement($tbody);
	    relativizeElement($table);

	    table.appendChild(tbody);
	    that.el.appendChild(fragment);
	  }

	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    * @deprecated
	    */
	DGTable.prototype._renderSkeleton = function () {
	  return this;
	};

	/**
	    * @private
	    * @returns {DGTable} self
	    */
	DGTable.prototype._updateLastCellWidthFromScrollbar = function (force) {

	  var p = this.p;

	  // Calculate scrollbar's width and reduce from lat column's width
	  var scrollbarWidth = p.table.offsetWidth - p.table.clientWidth;
	  if (scrollbarWidth != p.scrollbarWidth || force) {
	    p.scrollbarWidth = scrollbarWidth;
	    for (var i = 0; i < p.columns.length; i++) {
	      p.columns[i].actualWidthConsideringScrollbarWidth = null;
	    }

	    if (p.scrollbarWidth > 0 && p.visibleColumns.length > 0) {
	      // (There should always be at least 1 column visible, but just in case)
	      var lastColIndex = p.visibleColumns.length - 1;

	      p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth = p.visibleColumns[lastColIndex].actualWidth - p.scrollbarWidth;
	      var lastColWidth = p.visibleColumns[lastColIndex].actualWidthConsideringScrollbarWidth + 'px';
	      var tbodyChildren = p.tbody.childNodes;
	      for (var _i18 = 0, count = tbodyChildren.length; _i18 < count; _i18++) {
	        var row = tbodyChildren[_i18];
	        if (row.nodeType !== 1) continue;
	        row.childNodes[lastColIndex].style.width = lastColWidth;
	      }

	      p.headerRow.childNodes[lastColIndex].style.width = lastColWidth;
	    }
	  }
	  return this;
	};

	/**
	    * Explicitly set the width of the table based on the sum of the column widths
	    * @private
	    * @param {boolean} parentSizeMayHaveChanged Parent size may have changed, treat rendering accordingly
	    * @returns {DGTable} self
	    */
	DGTable.prototype._updateTableWidth = function (parentSizeMayHaveChanged) {
	  var o = this.o,p = this.p;
	  var width = this._calculateTbodyWidth();

	  p.tbody.style.minWidth = width + 'px';
	  p.headerRow.style.minWidth = width + (p.scrollbarWidth || 0) + 'px';

	  p.$table.off('scroll', p.onTableScrolledHorizontallyBound);

	  if (o.width == DGTable.Width.AUTO) {
	    // Update wrapper element's size to fully contain the table body

	    CssUtil.width(p.$table, CssUtil.outerWidth(p.$tbody));
	    CssUtil.width(this.$el, CssUtil.outerWidth(p.$table));

	  } else if (o.width == DGTable.Width.SCROLL) {

	    if (parentSizeMayHaveChanged) {
	      var lastScrollTop = p.table ? p.table.scrollTop : 0,
	      lastScrollLeft = p.table ? p.table.scrollLeft : 0;

	      // BUGFIX: Relayout before recording the widths
	      webkitRenderBugfix(this.el);

	      p.table.scrollTop = lastScrollTop;
	      p.table.scrollLeft = lastScrollLeft;
	      p.header.scrollLeft = lastScrollLeft;
	    }

	    p.$table.on('scroll', p.onTableScrolledHorizontallyBound);
	  }

	  return this;
	};

	/**
	    * @private
	    * @returns {Boolean}
	    */
	DGTable.prototype._isTableRtl = function () {
	  return this.p.$table.css('direction') === 'rtl';
	};

	/**
	    * @private
	    * @param {Object} column column object
	    * @returns {String}
	    */
	DGTable.prototype._serializeColumnWidth = function (column) {
	  return column.widthMode === ColumnWidthMode.AUTO ? 'auto' :
	  column.widthMode === ColumnWidthMode.RELATIVE ? column.width * 100 + '%' :
	  column.width;
	};

	/**
	    * @private
	    * @param {HTMLElement} el
	    */
	DGTable.prototype._cellMouseOverEvent = function (el) {var _this3 = this;
	  var o = this.o,p = this.p;

	  var elInner = el.firstChild;

	  if (elInner.scrollWidth - elInner.clientWidth > 1 ||
	  elInner.scrollHeight - elInner.clientHeight > 1) {

	    this.hideCellPreview();
	    p.abortCellPreview = false;

	    var $el = $$1(el),$elInner = $$1(elInner);
	    var previewCell = createElement('div'),$previewCell = $$1(previewCell);
	    previewCell.innerHTML = el.innerHTML;
	    previewCell.className = o.cellPreviewClassName;

	    var isHeaderCell = $el.hasClass(o.tableClassName + '-header-cell');
	    if (isHeaderCell) {
	      previewCell.className += ' header';
	      if ($el.hasClass('sortable')) {
	        previewCell.className += ' sortable';
	      }

	      previewCell.draggable = true;

	      $$1(previewCell).on('mousedown', this._onMouseDownColumnHeader.bind(this)).
	      on('mousemove', this._onMouseMoveColumnHeader.bind(this)).
	      on('mouseup', this._onMouseUpColumnHeader.bind(this)).
	      on('mouseleave', this._onMouseLeaveColumnHeader.bind(this)).
	      on('touchstart', this._onTouchStartColumnHeader.bind(this)).
	      on('dragstart', this._onStartDragColumnHeader.bind(this)).
	      on('click', this._onClickColumnHeader.bind(this)).
	      on('contextmenu.dgtable', function (event) {event.preventDefault();});
	      $$1(previewCell.firstChild).
	      on('dragenter', this._onDragEnterColumnHeader.bind(this)).
	      on('dragover', this._onDragOverColumnHeader.bind(this)).
	      on('dragleave', this._onDragLeaveColumnHeader.bind(this)).
	      on('drop', this._onDropColumnHeader.bind(this));

	      if (hasIeDragAndDropBug) {
	        $$1(previewCell).on('selectstart', function (evt) {
	          evt.preventDefault();
	          this.dragDrop();
	          return false;
	        }.bind(previewCell));
	      }
	    }

	    var paddingL = parseFloat($el.css('padding-left')) || 0,
	    paddingR = parseFloat($el.css('padding-right')) || 0,
	    paddingT = parseFloat($el.css('padding-top')) || 0,
	    paddingB = parseFloat($el.css('padding-bottom')) || 0;

	    var requiredWidth = elInner.scrollWidth + (el.clientWidth - elInner.offsetWidth);

	    var borderBox = $el.css('box-sizing') === 'border-box';
	    if (borderBox) {
	      $previewCell.css('box-sizing', 'border-box');
	    } else {
	      requiredWidth -= paddingL + paddingR;
	      $previewCell.css('margin-top', parseFloat($$1(el).css('border-top-width')) || 0);
	    }

	    if (!p.transparentBgColor1) {
	      // Detect browser's transparent spec
	      var tempDiv = document.createElement('div');
	      tempDiv.style.backgroundColor = 'transparent';
	      p.transparentBgColor1 = $$1(tempDiv).css('background-color');
	      tempDiv.style.backgroundColor = 'rgba(0,0,0,0)';
	      p.transparentBgColor2 = $$1(tempDiv).css('background-color');
	    }

	    var css = {
	      'box-sizing': borderBox ? 'border-box' : 'content-box',
	      'width': requiredWidth,
	      'min-height': CssUtil.height($el),
	      'padding-left': paddingL,
	      'padding-right': paddingR,
	      'padding-top': paddingT,
	      'padding-bottom': paddingB,
	      'overflow': 'hidden',
	      'position': 'absolute',
	      'z-index': '-1',
	      'left': '0',
	      'top': '0',
	      'cursor': 'default' };


	    if (css) {
	      var bgColor = $$1(el).css('background-color');
	      if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
	        bgColor = $$1(el.parentNode).css('background-color');
	      }
	      if (bgColor === p.transparentBgColor1 || bgColor === p.transparentBgColor2) {
	        bgColor = '#fff';
	      }
	      css['background-color'] = bgColor;
	    }

	    $previewCell.css(css);

	    this.el.appendChild(previewCell);

	    $$1(previewCell.firstChild).css({
	      'direction': $elInner.css('direction'),
	      'white-space': $elInner.css('white-space') });


	    if (isHeaderCell) {
	      // Disable these to allow our own context menu events without interruption
	      $previewCell.css({
	        '-webkit-touch-callout': 'none',
	        '-webkit-user-select': 'none',
	        '-moz-user-select': 'none',
	        '-ms-user-select': 'none',
	        '-o-user-select': 'none',
	        'user-select': 'none' });

	    }

	    previewCell['rowIndex'] = el.parentNode['rowIndex'];
	    var physicalRowIndex = previewCell['physicalRowIndex'] = el.parentNode['physicalRowIndex'];
	    previewCell['columnName'] = p.visibleColumns[nativeIndexOf$1.call(el.parentNode.childNodes, el)].name;

	    try {
	      var selection = SelectionHelper.saveSelection(el);
	      if (selection)
	      SelectionHelper.restoreSelection(previewCell, selection);
	    } catch (ignored) {/* we're ok with this */}

	    this.trigger(
	    'cellpreview',
	    previewCell.firstChild,
	    physicalRowIndex == null ? null : physicalRowIndex,
	    previewCell['columnName'],
	    physicalRowIndex == null ? null : p.rows[physicalRowIndex],
	    el);


	    if (p.abortCellPreview) {
	      $previewCell.remove();
	      return;
	    }

	    var $parent = this.$el;
	    var $scrollParent = $parent[0] === window ? $$1(document) : $parent;

	    var offset = $el.offset();
	    var parentOffset = $parent.offset();
	    var rtl = $el.css('float') === 'right';
	    var prop = rtl ? 'right' : 'left';

	    // Handle RTL, go from the other side
	    if (rtl) {
	      var windowWidth = $$1(window).width();
	      offset.right = windowWidth - (offset.left + CssUtil.outerWidth($el));
	      parentOffset.right = windowWidth - (parentOffset.left + CssUtil.outerWidth($parent));
	    }

	    // If the parent has borders, then it would offset the offset...
	    offset.left -= parseFloat($parent.css('border-left-width')) || 0;
	    offset.right -= parseFloat($parent.css('border-right-width')) || 0;
	    offset.top -= parseFloat($parent.css('border-top-width')) || 0;

	    // Handle border widths of the element being offset
	    offset[prop] += parseFloat($$1(el).css('border-' + prop + '-width')) || 0;
	    offset.top += parseFloat($$1(el).css('border-top-width')) || parseFloat($$1(el).css('border-bottom-width')) || 0;

	    // Subtract offsets to get offset relative to parent
	    offset.left -= parentOffset.left;
	    offset.right -= parentOffset.right;
	    offset.top -= parentOffset.top;

	    // Constrain horizontally
	    var minHorz = 0,
	    maxHorz = $parent - CssUtil.outerWidth($previewCell);
	    offset[prop] = offset[prop] < minHorz ?
	    minHorz :
	    offset[prop] > maxHorz ? maxHorz : offset[prop];

	    // Constrain vertically
	    var totalHeight = CssUtil.outerHeight($el);
	    var maxTop = $scrollParent.scrollTop() + CssUtil.innerHeight($parent) - totalHeight;
	    if (offset.top > maxTop) {
	      offset.top = Math.max(0, maxTop);
	    }

	    // Apply css to preview cell
	    var previewCss = {
	      top: offset.top,
	      'z-index': 9999 };

	    previewCss[prop] = offset[prop];

	    $previewCell.css(previewCss);

	    previewCell['__cell'] = el;
	    p.$cellPreviewCell = $previewCell;
	    el['__previewCell'] = previewCell;

	    p._bindCellHoverOut(el);
	    p._bindCellHoverOut(previewCell);

	    $previewCell.on('mousewheel', function (event) {
	      var originalEvent = event.originalEvent;
	      var xy = originalEvent.wheelDelta || -originalEvent.detail,
	      x = originalEvent.wheelDeltaX || (originalEvent.axis == 1 ? xy : 0),
	      y = originalEvent.wheelDeltaY || (originalEvent.axis == 2 ? xy : 0);

	      if (xy) {
	        _this3.hideCellPreview();
	      }

	      if (y && p.table.scrollHeight > p.table.clientHeight) {
	        var scrollTop = y * -1 + p.$table.scrollTop();
	        p.$table.scrollTop(scrollTop);
	      }

	      if (x && p.table.scrollWidth > p.table.clientWidth) {
	        var scrollLeft = x * -1 + p.$table.scrollLeft();
	        p.$table.scrollLeft(scrollLeft);
	      }
	    });
	  }
	};

	/**
	    * @private
	    * @param {HTMLElement} el
	    */
	DGTable.prototype._cellMouseOutEvent = function (_el) {
	  this.hideCellPreview();
	};

	/**
	    * Hides the current cell preview,
	    * or prevents the one that is currently trying to show (in the 'cellpreview' event)
	    * @public
	    * @expose
	    * @returns {DGTable} self
	    */
	DGTable.prototype.hideCellPreview = function () {
	  var p = this.p;

	  if (p.$cellPreviewCell) {
	    var previewCell = p.$cellPreviewCell[0];
	    var origCell = previewCell['__cell'];
	    var selection;

	    try {
	      selection = SelectionHelper.saveSelection(previewCell);
	    } catch (ignored) {/* we're ok with this */}

	    p.$cellPreviewCell.remove();
	    p._unbindCellHoverOut(origCell);
	    p._unbindCellHoverOut(previewCell);

	    try {
	      if (selection)
	      SelectionHelper.restoreSelection(origCell, selection);
	    } catch (ignored) {/* we're ok with this */}

	    this.trigger('cellpreviewdestroy', previewCell.firstChild, previewCell['physicalRowIndex'], previewCell['columnName'], origCell);

	    origCell['__previewCell'] = null;
	    previewCell['__cell'] = null;

	    p.$cellPreviewCell = null;
	    p.abortCellPreview = false;
	  } else {
	    p.abortCellPreview = true;
	  }

	  return this;
	};

	// It's a shame the Google Closure Compiler does not support exposing a nested @param

	/**
	 * @typedef {Object} SERIALIZED_COLUMN
	 * @property {Number|null|undefined} [order=0]
	 * @property {String|null|undefined} [width='auto']
	 * @property {Boolean|null|undefined} [visible=true]
	 * */

	/**
	       * @typedef {Object} SERIALIZED_COLUMN_SORT
	       * @property {String|null|undefined} [column='']
	       * @property {Boolean|null|undefined} [descending=false]
	       * */

	/**
	             * @enum {ColumnWidthMode|number|undefined}
	             * @const
	             * @typedef {ColumnWidthMode}
	             */
	var ColumnWidthMode = {
	  /** @const*/AUTO: 0,
	  /** @const*/ABSOLUTE: 1,
	  /** @const*/RELATIVE: 2 };


	/**
	                              * @enum {DGTable.Width|String|undefined}
	                              * @const
	                              * @typedef {DGTable.Width}
	                              */
	DGTable.Width = {
	  /** @const*/NONE: 'none',
	  /** @const*/AUTO: 'auto',
	  /** @const*/SCROLL: 'scroll' };


	/**
	                                   * @expose
	                                   * @typedef {Object} COLUMN_SORT_OPTIONS
	                                   * @property {String|null|undefined} column
	                                   * @property {Boolean|null|undefined} [descending=false]
	                                   * */

	/**
	                                         * @expose
	                                         * @typedef {Object} COLUMN_OPTIONS
	                                         * @property {String|null|undefined} width
	                                         * @property {String|null|undefined} name
	                                         * @property {String|null|undefined} label
	                                         * @property {String|null|undefined} dataPath - defaults to `name`
	                                         * @property {String|null|undefined} comparePath - defaults to `dataPath`
	                                         * @property {Number|String|null|undefined} comparePath
	                                         * @property {Boolean|null|undefined} [resizable=true]
	                                         * @property {Boolean|null|undefined} [movable=true]
	                                         * @property {Boolean|null|undefined} [sortable=true]
	                                         * @property {Boolean|null|undefined} [visible=true]
	                                         * @property {String|null|undefined} [cellClasses]
	                                         * @property {Boolean|null|undefined} [ignoreMin=false]
	                                         * */

	/**
	                                               * @typedef {Object} DGTable.Options
	                                               * @property {COLUMN_OPTIONS[]} [columns]
	                                               * @property {Number} [height]
	                                               * @property {DGTable.Width} [width]
	                                               * @property {Boolean|null|undefined} [virtualTable=true]
	                                               * @property {Boolean|null|undefined} [resizableColumns=true]
	                                               * @property {Boolean|null|undefined} [movableColumns=true]
	                                               * @property {Number|null|undefined} [sortableColumns=1]
	                                               * @property {Boolean|null|undefined} [adjustColumnWidthForSortArrow=true]
	                                               * @property {Boolean|null|undefined} [relativeWidthGrowsToFillWidth=true]
	                                               * @property {Boolean|null|undefined} [relativeWidthShrinksToFillWidth=false]
	                                               * @property {Boolean|null|undefined} [convertColumnWidthsToRelative=false]
	                                               * @property {Boolean|null|undefined} [autoFillTableWidth=false]
	                                               * @property {String|null|undefined} [cellClasses]
	                                               * @property {String|String[]|COLUMN_SORT_OPTIONS|COLUMN_SORT_OPTIONS[]} [sortColumn]
	                                               * @property {Function|null|undefined} [cellFormatter=null]
	                                               * @property {Function|null|undefined} [headerCellFormatter=null]
	                                               * @property {Number|null|undefined} [rowsBufferSize=10]
	                                               * @property {Number|null|undefined} [minColumnWidth=35]
	                                               * @property {Number|null|undefined} [resizeAreaWidth=8]
	                                               * @property {{function(string,boolean):{function(a:*,b:*):boolean}}} [onComparatorRequired]
	                                               * @property {String|null|undefined} [resizerClassName=undefined]
	                                               * @property {String|null|undefined} [tableClassName=undefined]
	                                               * @property {Boolean|null|undefined} [allowCellPreview=true]
	                                               * @property {Boolean|null|undefined} [allowHeaderCellPreview=true]
	                                               * @property {String|null|undefined} [cellPreviewClassName=undefined]
	                                               * @property {Boolean|null|undefined} [cellPreviewAutoBackground=true]
	                                               * @property {Element|null|undefined} [el=undefined]
	                                               * @property {String|null|undefined} [className=undefined]
	                                               * @property {Function|null|undefined} [filter=undefined]
	                                               * */

	/**
	                                                     * @typedef {{
	                                                         *  currentTarget: Element,
	                                                         *  data: Object.<string, *>,
	                                                         *  delegateTarget: Element,
	                                                         *  isDefaultPrevented: Boolean,
	                                                         *  isImmediatePropagationStopped: Boolean,
	                                                         *  isPropagationStopped: Boolean,
	                                                         *  namespace: string,
	                                                         *  originalEvent: MouseEvent|TouchEvent|Event,
	                                                         *  pageX: Number,
	                                                         *  pageY: Number,
	                                                         *  preventDefault: Function,
	                                                         *  props: Object.<string, *>,
	                                                         *  relatedTarget: Element,
	                                                         *  result: *,
	                                                         *  stopImmediatePropagation: Function,
	                                                         *  stopPropagation: Function,
	                                                         *  target: Element,
	                                                         *  timeStamp: Number,
	                                                         *  type: string,
	                                                         *  which: Number
	                                                         * }} jQuery_Event
	                                                     * */

	if (!$$1.controls) {
	  $$1.controls = {};
	}

	$$1.controls.dgtable = DGTable;

	return DGTable;

})));

//# sourceMappingURL=jquery.dgtable.umd.js.map