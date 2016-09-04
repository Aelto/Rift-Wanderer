/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _app = __webpack_require__(1);

	var _app2 = _interopRequireDefault(_app);

	var _config = __webpack_require__(11);

	var Config = _interopRequireWildcard(_config);

	var _locker = __webpack_require__(25);

	var locker = _interopRequireWildcard(_locker);

	var _cachemanager = __webpack_require__(26);

	var cacheManager = _interopRequireWildcard(_cachemanager);

	var _api = __webpack_require__(28);

	var api = _interopRequireWildcard(_api);

	var _spectator = __webpack_require__(29);

	var spectator = _interopRequireWildcard(_spectator);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//import Vue from '../lib/vue.js'
	var ipc = __webpack_require__(30).ipcRenderer;

	window.api = api;

	// Vue.js manipulation
	var data = {
	    global: {
	        summonername: Config.getSummonerName(),
	        apiKey: Config.getApiKey(),
	        gameVersion: Config.getGameVersion(),
	        gameData: {},

	        // app state
	        loadingScreenVisible: false,
	        searchingGame: false
	    }
	    // NOTE: app functions are not stored in the global object
	};
	window.data = data;

	// Riot API & electron manipulation
	{
	    (function () {

	        // we set the interval in milliseconds at which the app will check
	        // if the summoner is in a game or not
	        var gameCheckInterval = 2000;

	        // we store the id of the timeout created when we check every X seconds
	        // it is used to cancel the 'waitForGame' function for example
	        var timeoutId = null;

	        // this is a event function, it is triggered when the user clicks
	        // the button to start searching for the game
	        // all it does is regularely check if the summoner is in a game
	        // and if yes: start call the spectateGame function
	        var waitForGame = data.global.waitForGame = function () {

	            if (!locker.setState('waitForGame', 'idle')) throw new Error('Could not search for a game, the app is not ready yet.');

	            // we clear any timeout
	            // in case there are two instances running at the same time
	            cancelWaitForGame();

	            // we lock the interface from any user interaction
	            // (uses vue.js events)
	            data.global.searchingGame = true;

	            spectator.isSummonerInGame(data.global.apiKey, data.global.summonername).then(spectateGame, function (error, customMessage) {

	                // we go back to idle state, if the 'waitForGame'
	                // is still running, the state will be updated automatically
	                locker.setState('idle', 'waitForGame');

	                console.log(customMessage);

	                // TODO: look for any error message
	                // if the summonername doesn't exist for example
	                if (customMessage === 'summonerNotFound') {

	                    data.global.searchingGame = false;

	                    throw new Erro('No summoner was found with the name ' + data.global.summonername);
	                } else if (customMessage === 'gameNotFound') {

	                    // the user is not in a game, we wait for 2seconds
	                    // before we try again, it prevents a restriction on riot API
	                    timeoutId = setTimeout(waitForGame, gameCheckInterval);
	                } else {

	                    data.global.searchingGame = false;

	                    throw new Error('An unknown error occured, returning to idle state' + error);
	                }
	            });
	        };

	        var cancelWaitForGame = data.cancelWaitForGame = function () {

	            // clears any timeouts
	            clearTimeout(timeoutId);
	            // and set it to null to tell there is no timeout running
	            timeoutId = null;
	        };

	        var spectateGame = function spectateGame(unformatedData) {

	            console.log('found game');

	            if (!locker.setState('getGameData', 'waitForGame')) throw new Error('A game was found, the data were downloaded. But the app\' state doesn\'t match with what is happening');
	            // we know the user is in a game
	            // all we have to do now is
	            //  > get the summoner's ID and its game ID
	            //  > find the data and download it
	            //    (uhm... actually the 2 first steps are done when looking if the summoner
	            //    is in a game or not, because the only way to check that is to download
	            //    the current game data)
	            //  > map and filter the data into something readable
	            //  > use the data to update the dom
	            //  > show the dom with amazing animations !
	            // we'll then rely on the loadingScreen events

	            // we get readable data from something filled with useless data for us
	            var formatedData = spectator.formateGameData(unformatedData);

	            // we call a function which adds more data into 'formatedData'
	            // by fetching it in the riot API, it returns the 'full' data we need
	            spectator.getCurrentGameRankedStats(data.global.apiKey, formatedData).then(function (fullData) {
	                // now that we have the full data,
	                // we let the vue.js black magic happen :)

	                if (!locker.setState('showLoadingScreen', 'getGameData')) throw new Error('');

	                data.global.loadingScreenVisible = true;

	                Object.keys(fullData).forEach(function (key) {
	                    data.global.gameData[key] = fullData[key];
	                });

	                ipc.send('appFocus');
	                ipc.send('appMaximize');
	            });
	        };

	        var leaveLoadingScreen = data.global.leaveLoadingScreen = function () {

	            if (!locker.setState('idle', 'showLoadingScreen')) throw new Error('Could not leave loading screen');

	            data.global.loadingScreenVisible = false;

	            ipc.send('appUnmaximize');

	            data.global.searchingGame = false;
	        };

	        var cacheHasUpdated = function cacheHasUpdated(successfullyLeftState) {

	            console.log('Rift Wanderer now uses the same version as Riot\'s client');

	            // we receive the boolean returned by the locker.unlockState
	            // if the boolean is set to 'false' it means two operations
	            // occured in the same time and it is not supposed to
	            if (!successfullyLeftState) throw new Error('Unsuccessfully left \'cacheUpdates\' state\nNow pausing the App.');

	            // loads the cache files into memory for faster access
	            cacheManager.loadCacheJson();

	            // the app has done all the necessary setup,
	            // we now wait for the user activity
	            locker.setState('idle');
	        };

	        if (locker.setState('cacheUpdates', 'null')) {
	            // we'll be checking for any updates available for the cache
	            // it happens when the app has in the cache the data from an old patch of the game
	            cacheManager.isAppCacheUpdated(data.global.apiKey, data.global.gameVersion)
	            // if the app does not uses the same version as the Riot client, update cache files
	            .then(null, function () {
	                return cacheManager.updateAllJsonFile(data.global.apiKey);
	            })
	            // we update the in-memory client's version
	            .then(function () {
	                return data.global.gameVersion = Config.getGameVersion();
	            })
	            // leave the 'cacheUpdates' state
	            .then(function () {
	                return locker.unlockState('cacheUpdates');
	            })
	            // continue...
	            .then(cacheHasUpdated);
	        } else throw new Error(' Looks like there is a problem with the app and its architecture ');
	    })();
	}

	var appVue = new Vue({
	    el: '#app-wrapper',
	    components: { app: _app2.default },
	    data: data
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(2)
	__vue_script__ = __webpack_require__(6)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\home\\views\\app.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(24)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-35d42eb0/app.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(3);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-35d42eb0&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./app.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-35d42eb0&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./app.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n#global[_v-35d42eb0] {\n    width: 100vw;\n    height: 100vh;\n}\n\n.loadingscreen-enter[_v-35d42eb0] {\n    opacity: 0;\n    -webkit-transform: scale(0.6);\n            transform: scale(0.6);\n}\n\n.loadingscreen-enter-active[_v-35d42eb0], .loadingscreen-leave-active[_v-35d42eb0] {\n    -webkit-transform: scale(0.8);\n            transform: scale(0.8);\n}\n\n", ""]);

	// exports


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function () {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function (modules, mediaQuery) {
			if (typeof modules === "string") modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if (typeof id === "number") alreadyImportedModules[id] = true;
			}
			for (i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if (mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if (mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if (media) {
			styleElement.setAttribute("media", media);
		}

		if (sourceMap) {
			// https://developer.chrome.com/devtools/docs/javascript-debugging
			// this makes source maps inside style tags work properly in Chrome
			css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */';
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _home = __webpack_require__(7);

	var _home2 = _interopRequireDefault(_home);

	var _loading = __webpack_require__(14);

	var _loading2 = _interopRequireDefault(_loading);

	var _apikeymodal = __webpack_require__(19);

	var _apikeymodal2 = _interopRequireDefault(_apikeymodal);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = {
	    components: {
	        'comp-home-page': _home2.default,
	        'comp-loading-screen': _loading2.default,
	        'comp-require-apikey': _apikeymodal2.default
	    },
	    props: {
	        global: {
	            type: Object,
	            default: function _default() {
	                return {};
	            }
	        }
	    },
	    methods: {
	        isApiKeyInvalid: function isApiKeyInvalid() {

	            return this.global.apiKey === '';
	        }
	    }
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(8)
	__vue_script__ = __webpack_require__(10)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\home\\views\\home.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(13)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-5db0f968/home.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(9);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-5db0f968&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./home.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-5db0f968&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./home.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.newsummonername-enter[_v-5db0f968], .newsummonername-leave-active[_v-5db0f968] {\n    opacity: 0;\n    max-width: 0%!important;\n}\n", ""]);

	// exports


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _config = __webpack_require__(11);

	exports.default = {
	    props: {
	        global: {
	            type: Object,
	            default: function _default() {
	                return {};
	            }
	        }
	    },
	    methods: {
	        toggleChangeNameInputVisibility: function toggleChangeNameInputVisibility() {

	            this.changeNameInputVisible = !this.changeNameInputVisible;

	            if (this.changeNameInputVisible) {
	                document.querySelector('.edit-button').style.minHeight = '100%';
	                document.querySelector('.launch-game-button').style.opacity = '0.3';
	            } else {
	                document.querySelector('.edit-button').style.minHeight = '0%';
	                document.querySelector('.launch-game-button').style.opacity = '1';
	            }
	        },
	        setNewSummonerName: function setNewSummonerName() {
	            this.toggleChangeNameInputVisibility();

	            var newName = this.newSummonerName;

	            if (newName === '' || newName === this.global.summonername) return false;

	            this.global.summonername = newName;
	            this.newSummonerName = '';

	            (0, _config.setSummonerName)(newName);
	        }
	    },
	    data: function data() {
	        return {
	            changeNameInputVisible: false,
	            newSummonerName: ''
	        };
	    }
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	var fs = __webpack_require__(12);

	var configPath = exports.configPath = __dirname + '/../app-data/config.json';

	// GET
	var getConfig = exports.getConfig = function getConfig() {
	    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
	};

	var getSummonerName = exports.getSummonerName = function getSummonerName() {
	    return getConfig().summonerName || '';
	};
	var getApiKey = exports.getApiKey = function getApiKey() {
	    return getConfig().apiKey || '';
	};
	var getGameVersion = exports.getGameVersion = function getGameVersion() {
	    return getConfig().gameVersion || '';
	};
	var getLastGameId = exports.getLastGameId = function getLastGameId() {
	    return getConfig().lastGameId || -1;
	};

	// SET
	var setConfig = exports.setConfig = function setConfig(newConfig) {
	    return fs.writeFileSync(configPath, JSON.stringify(newConfig, null, '\t'));
	};

	var _setConfigKey = exports._setConfigKey = function _setConfigKey(key, value) {
	    var config = getConfig();
	    config[key] = value;

	    setConfig(config);
	};
	var setSummonerName = exports.setSummonerName = function setSummonerName(newSummonerName) {
	    return _setConfigKey('summonerName', newSummonerName);
	};
	var setApiKey = exports.setApiKey = function setApiKey(newApiKey) {
	    return _setConfigKey('apiKey', newApiKey);
	};
	var setGameVersion = exports.setGameVersion = function setGameVersion(newGameVersion) {
	    return _setConfigKey('gameVersion', newGameVersion);
	};
	var setLastGameId = exports.setLastGameId = function setLastGameId(newLastGameId) {
	    return _setConfigKey('lastGameId', newLastGameId);
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = "\n<div id=\"home-page\" class=\"home-page\" _v-5db0f968=\"\">\n    \n    <div class=\"edit-button\" v-on:click=\"toggleChangeNameInputVisibility()\" _v-5db0f968=\"\">\n        change summoner name\n    </div>\n\n    <transition name=\"newsummonername\" _v-5db0f968=\"\">\n        <input class=\"new-summoner-name\" placeholder=\"\" v-model=\"newSummonerName\" v-if=\"changeNameInputVisible\" v-on:keypress.enter=\"setNewSummonerName()\" _v-5db0f968=\"\">\n    </transition>\n    \n\n    <div class=\"launch-game-button summoner-name\" v-bind:class=\"[global.searchingGame ? 'active' : '']\" v-on:click=\"global.waitForGame()\" _v-5db0f968=\"\">\n        {{ global.summonername }}\n    </div>\n\n    <div class=\"app-state\" v-bind:text-content=\"'appState'\" _v-5db0f968=\"\">\n    </div>\n\n</div>\n";

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(15)
	__vue_script__ = __webpack_require__(17)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\home\\views\\loading.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(18)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-10b87ac3/loading.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(16);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./loading.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./loading.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

	// exports


/***/ },
/* 17 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    props: {
	        global: {
	            type: Object,
	            default: function _default() {
	                return {};
	            }
	        }
	    },
	    methods: {
	        getDescription: function getDescription(rune) {
	            var value = parseFloat(rune.description);
	            var runeDescription = rune.description.replace(value, (value * rune.count * 10 | 0) / 10);

	            return runeDescription;
	        }
	    }
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "\n<div id='loading-screen' class='loading-screen'\n    v-on:click=\"global.leaveLoadingScreen()\">\n\n    <video var='loadingVideo' class='vid' autoplay='autoplay' loop>\n        <source src='../assets/img/loading-screen.webm'>\n    </video>\n    <audio var='loadingMusic' src='../assets/audio/loading-audio.mp3' volume='0.2'></audio>\n\n    <div var='loadingContent' class=\"loading-content\">\n        <div var='firstLine' class='line'>\n            <div var='loadingGameMode' class='game-mode'> {{ global.gameMode }} </div>\n            <div var='loadingMapName' class='map-name'> {{ global.mapName }} </div>\n        </div>\n        <div var='teamContainer' class=\"team-container\">\n            <div var='blueTeamDisplay' tilt='container' class=\"team-display first-team\">\n\n                <!-- champion-case -->\n                <div class=\"champion-case front\"\n                    v-for=\"championCase of global.gameData.team1\">\n\n                    <div class=\"champion-image-holder\">\n                        <img var='championImage' class=\"champion-image\"\n                            :src=\"championCase.championSplash\">\n                    </div>\n\n                    <div var='informations' class=\"informations\">\n                        <div \n                            v-for='runeType of championCase.runesRecap'\n                            :class=\"getDescription(runeType)\">\n                            {{ getDescription(runeType) }}\n                        </div>\n                    </div>\n\n                    <div class=\"spells-container\">\n                        <div class=\"spell\">\n                            <img var='spell1Image' class='spell-image'\n                                :src=\"championCase.spell1Splash\">\n                        </div>\n                        <div class=\"spell\">\n                            <img var='spell2Image' class='spell-image'\n                                :src=\"championCase.spell2Splash\">\n                        </div>\n                    </div>\n\n                    <div class=\"champion-name\"> {{ championCase.championInfo.name }} </div>\n                    <div class=\"player-name\"> {{ championCase.summonerName }} </div>\n\n                    <div class=\"league\">\n                        <img var='leagueImage'\n                            :src=\" `../assets/img/${championCase.soloQueueStats.tier}_badge.png` \">\n                        <div class=\"division\"> {{ championCase.soloQueueStats.tier !== \"MASTER\" && championCase.soloQueueStats.tier !== \"CHALLENGER\" ? championCase.soloQueueStats.entries[0].division : '' }} </div>\n                        <div class=\"win-number\"> {{ championCase.soloQueueStats.entries[0].wins }} </div>\n                        <div class=\"lose-number\"> {{ championCase.soloQueueStats.entries[0].losses }} </div>\n                    </div>\n\n                </div>\n\n            </div>\n            <div var='redTeamDisplay' tilt='container' class=\"team-display second-team\">\n\n                <div class=\"champion-case front\"\n                    v-for=\"championCase of global.gameData.team2\">\n\n                    <div class=\"champion-image-holder\">\n                        <img var='championImage' class=\"champion-image\"\n                            :src=\"championCase.championSplash\">\n                    </div>\n\n                    <div var='informations' class=\"informations\">\n                        <div \n                            v-for='runeType of championCase.runesRecap'\n                            :class=\"getDescription(runeType)\">\n                            {{ getDescription(runeType) }}\n                        </div>\n                    </div>\n\n                    <div class=\"spells-container\">\n                        <div class=\"spell\">\n                            <img var='spell1Image' class='spell-image'\n                                :src=\"championCase.spell1Splash\">\n                        </div>\n                        <div class=\"spell\">\n                            <img var='spell2Image' class='spell-image'\n                                :src=\"championCase.spell2Splash\">\n                        </div>\n                    </div>\n\n                    <div class=\"champion-name\"> {{ championCase.championInfo.name }} </div>\n                    <div class=\"player-name\"> {{ championCase.summonerName }} </div>\n\n                    <div class=\"league\">\n                        <img var='leagueImage'\n                            :src=\" `../assets/img/${championCase.soloQueueStats.tier}_badge.png` \">\n                        <div class=\"division\"> {{ championCase.soloQueueStats.tier !== \"MASTER\" && championCase.soloQueueStats.tier !== \"CHALLENGER\" ? championCase.soloQueueStats.entries[0].division : '' }} </div>\n                        <div class=\"win-number\"> {{ championCase.soloQueueStats.entries[0].wins }} </div>\n                        <div class=\"lose-number\"> {{ championCase.soloQueueStats.entries[0].losses }} </div>\n                    </div>\n\n                </div>\n\n            </div>\n        </div>\n\n    </div>\n\n</div>\n";

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __vue_script__, __vue_template__
	__webpack_require__(20)
	__vue_script__ = __webpack_require__(22)
	if (__vue_script__ &&
	    __vue_script__.__esModule &&
	    Object.keys(__vue_script__).length > 1) {
	  console.warn("[vue-loader] src\\home\\views\\apikeymodal.vue: named exports in *.vue files are ignored.")}
	__vue_template__ = __webpack_require__(23)
	module.exports = __vue_script__ || {}
	if (module.exports.__esModule) module.exports = module.exports.default
	if (__vue_template__) {
	(typeof module.exports === "function" ? (module.exports.options || (module.exports.options = {})) : module.exports).template = __vue_template__
	}
	if (false) {(function () {  module.hot.accept()
	  var hotAPI = require("vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  var id = "_v-dce0b862/apikeymodal.vue"
	  if (!module.hot.data) {
	    hotAPI.createRecord(id, module.exports)
	  } else {
	    hotAPI.update(id, module.exports, __vue_template__)
	  }
	})()}

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(21);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(5)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-dce0b862&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./apikeymodal.vue", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/vue-loader/lib/style-rewriter.js?id=_v-dce0b862&scoped=true!./../../../node_modules/vue-loader/lib/selector.js?type=style&index=0!./apikeymodal.vue");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(4)();
	// imports


	// module
	exports.push([module.id, "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n", ""]);

	// exports


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _config = __webpack_require__(11);

	exports.default = {
	    props: {
	        global: {
	            type: Object,
	            default: function _default() {
	                return {};
	            }
	        }
	    },
	    data: function data() {
	        return {
	            newApiKey: ''
	        };
	    },
	    methods: {
	        setNewApiKey: function setNewApiKey() {
	            var newApiKey = this.newApiKey;

	            if (newApiKey === '') return;

	            this.newApiKey = '';
	            this.global.apiKey = newApiKey;
	            (0, _config.setApiKey)(newApiKey);
	        }
	    }
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "\n<div id=\"apiKey-input\" class=\"apiKey-input\" _v-dce0b862=\"\">\n\n    <div _v-dce0b862=\"\"> The API Key you're using is invalid or inexistant </div>\n    \n    <input placeholder=\"enter your api key here\" v-model=\"newApiKey\" v-on:keypress.enter=\"setNewApiKey()\" _v-dce0b862=\"\">\n\n</div>\n";

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = "\n<div id=\"global\" _v-35d42eb0=\"\">\n\n    <comp-home-page :global=\"global\" _v-35d42eb0=\"\">\n    </comp-home-page>\n\n    <transition name=\"loadingscreen\" _v-35d42eb0=\"\">\n        <comp-loading-screen v-if=\"global.loadingScreenVisible\" :global=\"global\" _v-35d42eb0=\"\">\n        </comp-loading-screen>\n    </transition>\n\n    <comp-require-apikey :global=\"global\" v-if=\" isApiKeyInvalid() \" _v-35d42eb0=\"\">\n\n    </comp-require-apikey>\n\n</div>\n";

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var currentState = 'null';

	var getState = exports.getState = function getState() {
	    return currentState;
	};

	var unlockState = exports.unlockState = function unlockState(state) {
	    if (currentState === state || currentState === 'null') {
	        currentState = 'null';
	        return true;
	    }
	    return false;
	};

	var setState = exports.setState = function setState(state, oldState) {
	    if (unlockState(oldState)) {
	        currentState = state;

	        return true;
	    }
	    return false;
	};

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.updateAllJsonFile = exports.updateJsonChampionId = exports.updateJsonSpellId = exports.updateJsonRuneId = exports.getChampionInfoFromId = exports.getChampionInfoFromName = exports.getRunesInfoFromId = exports.getSpellInfoFromId = exports.isSummonerInCache = exports.getCachedSummonersList = exports.getCachedSummoners = exports.addSummonerInCache = exports.loadCacheJson = exports.isAppCacheUpdated = exports.cacheChampionsFile = exports.cacheSpellsFile = exports.cacheRunesFile = exports.cacheSummonersFile = exports.cacheFolderPath = exports.getCacheFile = undefined;

	var _riotInformations = __webpack_require__(27);

	var _api = __webpack_require__(28);

	var api = _interopRequireWildcard(_api);

	var _config = __webpack_require__(11);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var fs = __webpack_require__(12);

	var cacheFiles = {};

	var getCacheFile = exports.getCacheFile = function getCacheFile() {
	    return cacheFiles;
	};

	var cacheFolderPath = exports.cacheFolderPath = __dirname + '/../app-data/cache';
	var cacheSummonersFile = exports.cacheSummonersFile = cacheFolderPath + '/summoners_cache.json';
	var cacheRunesFile = exports.cacheRunesFile = cacheFolderPath + '/runes_cache.json'; // this files is downloaded from the servers
	var cacheSpellsFile = exports.cacheSpellsFile = cacheFolderPath + '/spells_cache.json'; // this one too
	var cacheChampionsFile = exports.cacheChampionsFile = cacheFolderPath + '/champions_cache.json'; // this one too

	var isAppCacheUpdated = exports.isAppCacheUpdated = function isAppCacheUpdated(apiKey, gameVersion) {
	    return new Promise(function (resolve, reject) {

	        api.getGameLiveVersion(apiKey).then(JSON.parse).then(function (data) {
	            if (gameVersion !== data.v) return reject(data);
	            return resolve(data.v);
	        });
	    });
	};

	/** -----------------------------------------------
	 * this function initializes the cache files
	 * and put them into memory to avoid disk accesses
	 * and also get a better read speed
	 */

	var loadCacheJson = exports.loadCacheJson = function loadCacheJson() {

	    fs.readdirSync(cacheFolderPath).forEach(function (file) {
	        // get the file's content
	        var content = fs.readFileSync(cacheFolderPath + '/' + file, 'utf8');

	        if (!content.length) return;

	        cacheFiles[file.replace('.json', '')] = JSON.parse(content);
	    });
	};

	/** -------------------------------------------------------------------
	 * everything below this comment will be utilities to help cache usage
	 * such as getting a list of the cached summoners 
	 * or even getting a rune informations from its ID
	 */

	// Setters
	var addSummonerInCache = exports.addSummonerInCache = function addSummonerInCache(name, data) {
	    name = name.toLowerCase().split(' ').join('');

	    var content = JSON.parse(fs.readFileSync(cacheSummonersFile, 'utf8'));
	    content.summoners[name] = data;

	    fs.writeFileSync(cacheSummonersFile, JSON.stringify(content, null, '\t'));
	};

	// Getters

	// the cachedSummoners functions don't use the memory storage for a faster acces
	// because these data are updated frequently and are only read a few times
	var getCachedSummoners = exports.getCachedSummoners = function getCachedSummoners() {
	    return JSON.parse(fs.readFileSync(cacheSummonersFile, 'utf8')).summoners;
	};

	var getCachedSummonersList = exports.getCachedSummonersList = function getCachedSummonersList() {
	    return Object.keys(getCachedSummoners());
	};

	var isSummonerInCache = exports.isSummonerInCache = function isSummonerInCache(name) {
	    return getCachedSummonersList().filter(function (n) {
	        return name.toLowerCase() === n;
	    }).length > 0;
	};

	var getSpellInfoFromId = exports.getSpellInfoFromId = function getSpellInfoFromId(id) {
	    return cacheFiles.spells_cache.data[id];
	};

	var getRunesInfoFromId = exports.getRunesInfoFromId = function getRunesInfoFromId(id) {
	    return cacheFiles.runes_cache.data[id];
	};

	var getChampionInfoFromName = exports.getChampionInfoFromName = function getChampionInfoFromName(name) {
	    return cacheFiles.champions_cache.data[Object.keys(cacheFiles.champions_cache.data).filter(function (key) {
	        return cacheFiles.champions_cache.data[key].name.includes(name);
	    })[0]];
	};

	var getChampionInfoFromId = exports.getChampionInfoFromId = function getChampionInfoFromId(id) {
	    return cacheFiles.champions_cache.data[id];
	};

	/** ------------------------------------------------------------------
	 * everything below this comment will control the app's cache updates
	 * it will take the json from the riot's API and then write it down
	 * in .json files on the local disk to avoid wasting bandwitch each game
	 */

	var updateJsonRuneId = exports.updateJsonRuneId = function updateJsonRuneId(apiKey) {
	    var url = 'https://global.api.pvp.net/api/lol/static-data/' + _riotInformations.gameServer + '/v1.2/rune?runeListData=all&api_key=' + apiKey;

	    console.log('updating: Rune');
	    return api.sendRequest(url).then(function (received) {
	        received = JSON.stringify(JSON.parse(received), null, '\t');

	        fs.writeFileSync(cacheRunesFile, received);
	    });
	};

	var updateJsonSpellId = exports.updateJsonSpellId = function updateJsonSpellId(apiKey) {
	    var url = 'https://global.api.pvp.net/api/lol/static-data/' + _riotInformations.gameServer + '/v1.2/summoner-spell?dataById=true&spellData=all&api_key=' + apiKey;

	    console.log('updating: Spells');
	    return api.sendRequest(url).then(function (received) {
	        received = JSON.stringify(JSON.parse(received), null, '\t');

	        fs.writeFileSync(cacheSpellsFile, received);
	    });
	};

	var updateJsonChampionId = exports.updateJsonChampionId = function updateJsonChampionId(apiKey) {
	    var url = 'https://global.api.pvp.net/api/lol/static-data/' + _riotInformations.gameServer + '/v1.2/champion?dataById=true&champData=all&api_key=' + apiKey;

	    console.log('updating: Champion');
	    return api.sendRequest(url).then(function (received) {
	        received = JSON.stringify(JSON.parse(received), null, '\t');

	        fs.writeFileSync(cacheChampionsFile, received);
	    });
	};

	var updateAllJsonFile = exports.updateAllJsonFile = function updateAllJsonFile(apiKey) {
	    console.log('updating cache');
	    return Promise.all([updateJsonSpellId(apiKey), updateJsonRuneId(apiKey), updateJsonChampionId(apiKey)]).then(function () {

	        return api.getGameLiveVersion(apiKey).then(JSON.parse).then(function (data) {

	            (0, _config.setGameVersion)(data.v);

	            return data.v;
	        });
	    });
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var gameServer = exports.gameServer = "euw";

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getRankedStatsFromSummonersIds = exports.getCurrentGameFromSummonerId = exports.getSummonersInfo = exports.getGameLiveVersion = exports.sendRequest = undefined;

	var _riotInformations = __webpack_require__(27);

	var sendRequest = exports.sendRequest = function sendRequest(url) {

	    return new Promise(function (resolve, reject) {
	        var req = new XMLHttpRequest();
	        req.open("GET", url, true);

	        req.onload = function () {
	            if (req.status == 200) resolve(req.responseText, url);else reject(req.responseText, url);
	        };

	        req.send();
	    });
	};

	var getGameLiveVersion = exports.getGameLiveVersion = function getGameLiveVersion(apiKey) {
	    var url = 'https://global.api.pvp.net/api/lol/static-data/' + _riotInformations.gameServer + '/v1.2/realm?api_key=' + apiKey;

	    return sendRequest(url);
	};

	var getSummonersInfo = exports.getSummonersInfo = function getSummonersInfo(apiKey, names) {
	    var url = 'https://' + _riotInformations.gameServer + '.api.pvp.net/api/lol/' + _riotInformations.gameServer + '/v1.4/summoner/by-name/' + names.join(', ') + '?api_key=' + apiKey;

	    return sendRequest(url);
	};

	var getCurrentGameFromSummonerId = exports.getCurrentGameFromSummonerId = function getCurrentGameFromSummonerId(apiKey, id) {
	    var url = 'https://' + _riotInformations.gameServer + '.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/' + _riotInformations.gameServer.toUpperCase() + '1/' + id + '?api_key=' + apiKey;

	    return sendRequest(url);
	};

	var getRankedStatsFromSummonersIds = exports.getRankedStatsFromSummonersIds = function getRankedStatsFromSummonersIds(apiKey, ids) {
	    var url = 'https://' + _riotInformations.gameServer + '.api.pvp.net/api/lol/' + _riotInformations.gameServer + '/v2.5/league/by-summoner/' + ids.join(', ') + '/entry?api_key=' + apiKey;

	    return sendRequest(url);
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.getCurrentGameRankedStats = exports.formateGameData = exports.getSummonerGameData = exports.getSummonerData = exports.isSummonerInGame = undefined;

	var _api = __webpack_require__(28);

	var api = _interopRequireWildcard(_api);

	var _cachemanager = __webpack_require__(26);

	var cacheManager = _interopRequireWildcard(_cachemanager);

	var _riotInformations = __webpack_require__(27);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var isSummonerInGame = exports.isSummonerInGame = function isSummonerInGame(apiKey, summonerName) {
	    return new Promise(function (resolve, reject) {

	        // TODO: use a sort of cache to store the last game's data
	        // it can be useful if the user decides to check for infos
	        // multiples times in the game, it can save bandwidth
	        getSummonerData(apiKey, summonerName.toLowerCase()).then(function (summonerData) {
	            return getSummonerGameData(apiKey, summonerData);
	        }, function (err) {
	            return reject(err, 'summonerNotFound');
	        }).then(resolve, function (err) {
	            return reject(err, 'gameNotFound');
	        });
	    });
	};

	var getSummonerData = exports.getSummonerData = function getSummonerData(apiKey, summonerName) {
	    return new Promise(function (resolve, reject) {

	        console.log('fetching...');

	        // we'll look if the summoner is in the cache or not
	        // we don't have to send a request to the riot API 
	        // it can also save bandwidth (like <1kb !)
	        if (cacheManager.isSummonerInCache(summonerName)) {
	            // the user was found in the cache
	            // we retrieve the string and parse it
	            resolve(JSON.parse(cacheManager.getCachedSummoners()[summonerName])[summonerName]);
	        } else {

	            // the user was NOT found in the cache
	            // we have to search for the data
	            // then add it to cache cache once found (if found)
	            api.getSummonersInfo(apiKey, [summonerName]).then(function (data) {
	                // the summoner was found in the riot API

	                // we add the data to the cache
	                cacheManager.addSummonerInCache(summonerName, data);

	                // we continue...
	                resolve(JSON.parse(data)[summonerName.toLowerCase()]);
	            }, function (errorMessage) {
	                // the user was not found if the riot API
	                // we continue and pass the error message
	                reject(errorMessage);
	            });
	        }
	    });
	};

	var getSummonerGameData = exports.getSummonerGameData = function getSummonerGameData(apiKey, summonerData) {
	    return new Promise(function (resolve, reject) {

	        api.getCurrentGameFromSummonerId(apiKey, summonerData.id)
	        // if no data could be retrieved, we pass the error and move on
	        .then(function (data) {
	            return JSON.parse(data);
	        }, reject).then(resolve);
	    });
	};

	var formateGameData = exports.formateGameData = function formateGameData(data) {
	    data.gameMap = data.mapId === 11 ? 'summoner\'s rift' : 'not summoner\'s rift';

	    data.gameMode = data.gameQueueConfigId === 410 ? 'RANKED' : 'NORMAL';

	    data.team1 = [];
	    data.team2 = [];
	    data.summonerIdList = [];

	    data.participants.map(function (player) {
	        player.spell1Info = cacheManager.getSpellInfoFromId(player.spell1Id);
	        player.spell1Splash = 'http://ddragon.leagueoflegends.com/cdn/6.5.1/img/spell/' + player.spell1Info.key + '.png';

	        player.spell2Info = cacheManager.getSpellInfoFromId(player.spell2Id);
	        player.spell2Splash = 'http://ddragon.leagueoflegends.com/cdn/6.5.1/img/spell/' + player.spell2Info.key + '.png';

	        player.championInfo = cacheManager.getChampionInfoFromId(player.championId);

	        var name = player.championInfo.key;
	        player.championSplash = 'http://ddragon.leagueoflegends.com/cdn/img/champion/loading/' + name + '_0.jpg';

	        if (!player.soloQueueStats) player.soloQueueStats = {
	            entries: [{ wins: 0, losses: 0 }],
	            tier: 'UNRANKED'
	        };

	        player.runesRecap = [];
	        player.runes.forEach(function (rune) {
	            var obj = cacheManager.getRunesInfoFromId(rune.runeId);
	            obj.count = rune.count;

	            player.runesRecap.push(obj);
	        });

	        if (player.teamId === 100) data.team1.push(player);else data.team2.push(player);

	        data.summonerIdList.push(player.summonerId);

	        return player;
	    });

	    data.bannedChampions.map(function (ban) {
	        ban.championInfo = cacheManager.getChampionInfoFromId(ban.championId);

	        return ban;
	    });

	    return data;
	};

	var getCurrentGameRankedStats = exports.getCurrentGameRankedStats = function getCurrentGameRankedStats(apiKey, gameData) {
	    console.log(gameData);
	    return api.getRankedStatsFromSummonersIds(apiKey, gameData.summonerIdList).then(function (stats) {
	        return JSON.parse(stats);
	    }).then(function (stats) {

	        // here we insert directly into the game data
	        // more informations we just fetched
	        gameData.participants.map(function (player) {
	            var playerStats = stats[player.summonerId];
	            if (!playerStats) return player;

	            player.rankedStats = playerStats;

	            var soloQ = playerStats.filter(function (queue) {
	                return queue.queue === 'RANKED_SOLO_5x5';
	            })[0];

	            player.soloQueueStats = soloQ;

	            return player;
	        });

	        return gameData;
	    });
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	module.exports = require("electron");

/***/ }
/******/ ]);