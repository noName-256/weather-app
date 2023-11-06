/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.esm.js":
/*!**************************************************************************!*\
  !*** ./node_modules/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.esm.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ plugin),
/* harmony export */   pan: () => (/* binding */ pan),
/* harmony export */   resetZoom: () => (/* binding */ resetZoom),
/* harmony export */   zoom: () => (/* binding */ zoom),
/* harmony export */   zoomRect: () => (/* binding */ zoomRect),
/* harmony export */   zoomScale: () => (/* binding */ zoomScale)
/* harmony export */ });
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! chart.js/helpers */ "./node_modules/chart.js/helpers/helpers.js");
/*!
* chartjs-plugin-zoom v2.0.1
* undefined
 * (c) 2016-2023 chartjs-plugin-zoom Contributors
 * Released under the MIT License
 */


var getModifierKey = function getModifierKey(opts) {
  return opts && opts.enabled && opts.modifierKey;
};
var keyPressed = function keyPressed(key, event) {
  return key && event[key + 'Key'];
};
var keyNotPressed = function keyNotPressed(key, event) {
  return key && !event[key + 'Key'];
};

/**
 * @param {string|function} mode can be 'x', 'y' or 'xy'
 * @param {string} dir can be 'x' or 'y'
 * @param {import('chart.js').Chart} chart instance of the chart in question
 * @returns {boolean}
 */
function directionEnabled(mode, dir, chart) {
  if (mode === undefined) {
    return true;
  } else if (typeof mode === 'string') {
    return mode.indexOf(dir) !== -1;
  } else if (typeof mode === 'function') {
    return mode({
      chart: chart
    }).indexOf(dir) !== -1;
  }
  return false;
}
function directionsEnabled(mode, chart) {
  if (typeof mode === 'function') {
    mode = mode({
      chart: chart
    });
  }
  if (typeof mode === 'string') {
    return {
      x: mode.indexOf('x') !== -1,
      y: mode.indexOf('y') !== -1
    };
  }
  return {
    x: false,
    y: false
  };
}

/**
 * Debounces calling `fn` for `delay` ms
 * @param {function} fn - Function to call. No arguments are passed.
 * @param {number} delay - Delay in ms. 0 = immediate invocation.
 * @returns {function}
 */
function debounce(fn, delay) {
  var timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
    return delay;
  };
}

/**
 * Checks which axis is under the mouse cursor.
 * @param {{x: number, y: number}} point - the mouse location
 * @param {import('chart.js').Chart} [chart] instance of the chart in question
 * @return {import('chart.js').Scale}
 */
function getScaleUnderPoint(_ref, chart) {
  var x = _ref.x,
    y = _ref.y;
  var scales = chart.scales;
  var scaleIds = Object.keys(scales);
  for (var i = 0; i < scaleIds.length; i++) {
    var scale = scales[scaleIds[i]];
    if (y >= scale.top && y <= scale.bottom && x >= scale.left && x <= scale.right) {
      return scale;
    }
  }
  return null;
}

/**
 * Evaluate the chart's mode, scaleMode, and overScaleMode properties to
 * determine which axes are eligible for scaling.
 * options.overScaleMode can be a function if user want zoom only one scale of many for example.
 * @param options - Zoom or pan options
 * @param {{x: number, y: number}} point - the mouse location
 * @param {import('chart.js').Chart} [chart] instance of the chart in question
 * @return {import('chart.js').Scale[]}
 */
function getEnabledScalesByPoint(options, point, chart) {
  var _ref2 = options || {},
    _ref2$mode = _ref2.mode,
    mode = _ref2$mode === void 0 ? 'xy' : _ref2$mode,
    scaleMode = _ref2.scaleMode,
    overScaleMode = _ref2.overScaleMode;
  var scale = getScaleUnderPoint(point, chart);
  var enabled = directionsEnabled(mode, chart);
  var scaleEnabled = directionsEnabled(scaleMode, chart);

  // Convert deprecated overScaleEnabled to new scaleEnabled.
  if (overScaleMode) {
    var overScaleEnabled = directionsEnabled(overScaleMode, chart);
    for (var _i = 0, _arr = ['x', 'y']; _i < _arr.length; _i++) {
      var axis = _arr[_i];
      if (overScaleEnabled[axis]) {
        scaleEnabled[axis] = enabled[axis];
        enabled[axis] = false;
      }
    }
  }
  if (scale && scaleEnabled[scale.axis]) {
    return [scale];
  }
  var enabledScales = [];
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(chart.scales, function (scaleItem) {
    if (enabled[scaleItem.axis]) {
      enabledScales.push(scaleItem);
    }
  });
  return enabledScales;
}
var chartStates = new WeakMap();
function getState(chart) {
  var state = chartStates.get(chart);
  if (!state) {
    state = {
      originalScaleLimits: {},
      updatedScaleLimits: {},
      handlers: {},
      panDelta: {}
    };
    chartStates.set(chart, state);
  }
  return state;
}
function removeState(chart) {
  chartStates["delete"](chart);
}
function zoomDelta(scale, zoom, center) {
  var range = scale.max - scale.min;
  var newRange = range * (zoom - 1);
  var centerPoint = scale.isHorizontal() ? center.x : center.y;
  // `scale.getValueForPixel()` can return a value less than the `scale.min` or
  // greater than `scale.max` when `centerPoint` is outside chartArea.
  var minPercent = Math.max(0, Math.min(1, (scale.getValueForPixel(centerPoint) - scale.min) / range || 0));
  var maxPercent = 1 - minPercent;
  return {
    min: newRange * minPercent,
    max: newRange * maxPercent
  };
}
function getLimit(state, scale, scaleLimits, prop, fallback) {
  var limit = scaleLimits[prop];
  if (limit === 'original') {
    var original = state.originalScaleLimits[scale.id][prop];
    limit = (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.valueOrDefault)(original.options, original.scale);
  }
  return (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.valueOrDefault)(limit, fallback);
}
function getRange(scale, pixel0, pixel1) {
  var v0 = scale.getValueForPixel(pixel0);
  var v1 = scale.getValueForPixel(pixel1);
  return {
    min: Math.min(v0, v1),
    max: Math.max(v0, v1)
  };
}
function updateRange(scale, _ref3, limits) {
  var min = _ref3.min,
    max = _ref3.max;
  var zoom = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var state = getState(scale.chart);
  var id = scale.id,
    axis = scale.axis,
    scaleOpts = scale.options;
  var scaleLimits = limits && (limits[id] || limits[axis]) || {};
  var _scaleLimits$minRange = scaleLimits.minRange,
    minRange = _scaleLimits$minRange === void 0 ? 0 : _scaleLimits$minRange;
  var minLimit = getLimit(state, scale, scaleLimits, 'min', -Infinity);
  var maxLimit = getLimit(state, scale, scaleLimits, 'max', Infinity);
  var range = zoom ? Math.max(max - min, minRange) : scale.max - scale.min;
  var offset = (range - max + min) / 2;
  min -= offset;
  max += offset;
  if (min < minLimit) {
    min = minLimit;
    max = Math.min(minLimit + range, maxLimit);
  } else if (max > maxLimit) {
    max = maxLimit;
    min = Math.max(maxLimit - range, minLimit);
  }
  scaleOpts.min = min;
  scaleOpts.max = max;
  state.updatedScaleLimits[scale.id] = {
    min: min,
    max: max
  };

  // return true if the scale range is changed
  return scale.parse(min) !== scale.min || scale.parse(max) !== scale.max;
}
function zoomNumericalScale(scale, zoom, center, limits) {
  var delta = zoomDelta(scale, zoom, center);
  var newRange = {
    min: scale.min + delta.min,
    max: scale.max - delta.max
  };
  return updateRange(scale, newRange, limits, true);
}
function zoomRectNumericalScale(scale, from, to, limits) {
  updateRange(scale, getRange(scale, from, to), limits, true);
}
var integerChange = function integerChange(v) {
  return v === 0 || isNaN(v) ? 0 : v < 0 ? Math.min(Math.round(v), -1) : Math.max(Math.round(v), 1);
};
function existCategoryFromMaxZoom(scale) {
  var labels = scale.getLabels();
  var maxIndex = labels.length - 1;
  if (scale.min > 0) {
    scale.min -= 1;
  }
  if (scale.max < maxIndex) {
    scale.max += 1;
  }
}
function zoomCategoryScale(scale, zoom, center, limits) {
  var delta = zoomDelta(scale, zoom, center);
  if (scale.min === scale.max && zoom < 1) {
    existCategoryFromMaxZoom(scale);
  }
  var newRange = {
    min: scale.min + integerChange(delta.min),
    max: scale.max - integerChange(delta.max)
  };
  return updateRange(scale, newRange, limits, true);
}
function scaleLength(scale) {
  return scale.isHorizontal() ? scale.width : scale.height;
}
function panCategoryScale(scale, delta, limits) {
  var labels = scale.getLabels();
  var lastLabelIndex = labels.length - 1;
  var min = scale.min,
    max = scale.max;
  // The visible range. Ticks can be skipped, and thus not reliable.
  var range = Math.max(max - min, 1);
  // How many pixels of delta is required before making a step. stepSize, but limited to max 1/10 of the scale length.
  var stepDelta = Math.round(scaleLength(scale) / Math.max(range, 10));
  var stepSize = Math.round(Math.abs(delta / stepDelta));
  var applied;
  if (delta < -stepDelta) {
    max = Math.min(max + stepSize, lastLabelIndex);
    min = range === 1 ? max : max - range;
    applied = max === lastLabelIndex;
  } else if (delta > stepDelta) {
    min = Math.max(0, min - stepSize);
    max = range === 1 ? min : min + range;
    applied = min === 0;
  }
  return updateRange(scale, {
    min: min,
    max: max
  }, limits) || applied;
}
var OFFSETS = {
  second: 500,
  // 500 ms
  minute: 30 * 1000,
  // 30 s
  hour: 30 * 60 * 1000,
  // 30 m
  day: 12 * 60 * 60 * 1000,
  // 12 h
  week: 3.5 * 24 * 60 * 60 * 1000,
  // 3.5 d
  month: 15 * 24 * 60 * 60 * 1000,
  // 15 d
  quarter: 60 * 24 * 60 * 60 * 1000,
  // 60 d
  year: 182 * 24 * 60 * 60 * 1000 // 182 d
};

function panNumericalScale(scale, delta, limits) {
  var canZoom = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var prevStart = scale.min,
    prevEnd = scale.max,
    options = scale.options;
  var round = options.time && options.time.round;
  var offset = OFFSETS[round] || 0;
  var newMin = scale.getValueForPixel(scale.getPixelForValue(prevStart + offset) - delta);
  var newMax = scale.getValueForPixel(scale.getPixelForValue(prevEnd + offset) - delta);
  var _ref4 = canZoom && limits && limits[scale.axis] || {},
    _ref4$min = _ref4.min,
    minLimit = _ref4$min === void 0 ? -Infinity : _ref4$min,
    _ref4$max = _ref4.max,
    maxLimit = _ref4$max === void 0 ? Infinity : _ref4$max;
  if (isNaN(newMin) || isNaN(newMax) || newMin < minLimit || newMax > maxLimit) {
    // At limit: No change but return true to indicate no need to store the delta.
    // NaN can happen for 0-dimension scales (either because they were configured
    // with min === max or because the chart has 0 plottable area).
    return true;
  }
  return updateRange(scale, {
    min: newMin,
    max: newMax
  }, limits, canZoom);
}
function panNonLinearScale(scale, delta, limits) {
  return panNumericalScale(scale, delta, limits, true);
}
var zoomFunctions = {
  category: zoomCategoryScale,
  "default": zoomNumericalScale
};
var zoomRectFunctions = {
  "default": zoomRectNumericalScale
};
var panFunctions = {
  category: panCategoryScale,
  "default": panNumericalScale,
  logarithmic: panNonLinearScale,
  timeseries: panNonLinearScale
};
function shouldUpdateScaleLimits(scale, originalScaleLimits, updatedScaleLimits) {
  var id = scale.id,
    _scale$options = scale.options,
    min = _scale$options.min,
    max = _scale$options.max;
  if (!originalScaleLimits[id] || !updatedScaleLimits[id]) {
    return true;
  }
  var previous = updatedScaleLimits[id];
  return previous.min !== min || previous.max !== max;
}
function removeMissingScales(limits, scales) {
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(limits, function (opt, key) {
    if (!scales[key]) {
      delete limits[key];
    }
  });
}
function storeOriginalScaleLimits(chart, state) {
  var scales = chart.scales;
  var originalScaleLimits = state.originalScaleLimits,
    updatedScaleLimits = state.updatedScaleLimits;
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(scales, function (scale) {
    if (shouldUpdateScaleLimits(scale, originalScaleLimits, updatedScaleLimits)) {
      originalScaleLimits[scale.id] = {
        min: {
          scale: scale.min,
          options: scale.options.min
        },
        max: {
          scale: scale.max,
          options: scale.options.max
        }
      };
    }
  });
  removeMissingScales(originalScaleLimits, scales);
  removeMissingScales(updatedScaleLimits, scales);
  return originalScaleLimits;
}
function doZoom(scale, amount, center, limits) {
  var fn = zoomFunctions[scale.type] || zoomFunctions["default"];
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(fn, [scale, amount, center, limits]);
}
function doZoomRect(scale, amount, from, to, limits) {
  var fn = zoomRectFunctions[scale.type] || zoomRectFunctions["default"];
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(fn, [scale, amount, from, to, limits]);
}
function getCenter(chart) {
  var ca = chart.chartArea;
  return {
    x: (ca.left + ca.right) / 2,
    y: (ca.top + ca.bottom) / 2
  };
}

/**
 * @param chart The chart instance
 * @param {number | {x?: number, y?: number, focalPoint?: {x: number, y: number}}} amount The zoom percentage or percentages and focal point
 * @param {string} [transition] Which transition mode to use. Defaults to 'none'
 */
function zoom(chart, amount) {
  var transition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'none';
  var _ref5 = typeof amount === 'number' ? {
      x: amount,
      y: amount
    } : amount,
    _ref5$x = _ref5.x,
    x = _ref5$x === void 0 ? 1 : _ref5$x,
    _ref5$y = _ref5.y,
    y = _ref5$y === void 0 ? 1 : _ref5$y,
    _ref5$focalPoint = _ref5.focalPoint,
    focalPoint = _ref5$focalPoint === void 0 ? getCenter(chart) : _ref5$focalPoint;
  var state = getState(chart);
  var _state$options = state.options,
    limits = _state$options.limits,
    zoomOptions = _state$options.zoom;
  storeOriginalScaleLimits(chart, state);
  var xEnabled = x !== 1;
  var yEnabled = y !== 1;
  var enabledScales = getEnabledScalesByPoint(zoomOptions, focalPoint, chart);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(enabledScales || chart.scales, function (scale) {
    if (scale.isHorizontal() && xEnabled) {
      doZoom(scale, x, focalPoint, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoom(scale, y, focalPoint, limits);
    }
  });
  chart.update(transition);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(zoomOptions.onZoom, [{
    chart: chart
  }]);
}
function zoomRect(chart, p0, p1) {
  var transition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
  var state = getState(chart);
  var _state$options2 = state.options,
    limits = _state$options2.limits,
    zoomOptions = _state$options2.zoom;
  var _zoomOptions$mode = zoomOptions.mode,
    mode = _zoomOptions$mode === void 0 ? 'xy' : _zoomOptions$mode;
  storeOriginalScaleLimits(chart, state);
  var xEnabled = directionEnabled(mode, 'x', chart);
  var yEnabled = directionEnabled(mode, 'y', chart);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(chart.scales, function (scale) {
    if (scale.isHorizontal() && xEnabled) {
      doZoomRect(scale, p0.x, p1.x, limits);
    } else if (!scale.isHorizontal() && yEnabled) {
      doZoomRect(scale, p0.y, p1.y, limits);
    }
  });
  chart.update(transition);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(zoomOptions.onZoom, [{
    chart: chart
  }]);
}
function zoomScale(chart, scaleId, range) {
  var transition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
  storeOriginalScaleLimits(chart, getState(chart));
  var scale = chart.scales[scaleId];
  updateRange(scale, range, undefined, true);
  chart.update(transition);
}
function resetZoom(chart) {
  var transition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';
  var state = getState(chart);
  var originalScaleLimits = storeOriginalScaleLimits(chart, state);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(chart.scales, function (scale) {
    var scaleOptions = scale.options;
    if (originalScaleLimits[scale.id]) {
      scaleOptions.min = originalScaleLimits[scale.id].min.options;
      scaleOptions.max = originalScaleLimits[scale.id].max.options;
    } else {
      delete scaleOptions.min;
      delete scaleOptions.max;
    }
  });
  chart.update(transition);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(state.options.zoom.onZoomComplete, [{
    chart: chart
  }]);
}
function getOriginalRange(state, scaleId) {
  var original = state.originalScaleLimits[scaleId];
  if (!original) {
    return;
  }
  var min = original.min,
    max = original.max;
  return (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.valueOrDefault)(max.options, max.scale) - (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.valueOrDefault)(min.options, min.scale);
}
function getZoomLevel(chart) {
  var state = getState(chart);
  var min = 1;
  var max = 1;
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(chart.scales, function (scale) {
    var origRange = getOriginalRange(state, scale.id);
    if (origRange) {
      var level = Math.round(origRange / (scale.max - scale.min) * 100) / 100;
      min = Math.min(min, level);
      max = Math.max(max, level);
    }
  });
  return min < 1 ? min : max;
}
function panScale(scale, delta, limits, state) {
  var panDelta = state.panDelta;
  // Add possible cumulative delta from previous pan attempts where scale did not change
  var storedDelta = panDelta[scale.id] || 0;
  if ((0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.sign)(storedDelta) === (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.sign)(delta)) {
    delta += storedDelta;
  }
  var fn = panFunctions[scale.type] || panFunctions["default"];
  if ((0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(fn, [scale, delta, limits])) {
    // The scale changed, reset cumulative delta
    panDelta[scale.id] = 0;
  } else {
    // The scale did not change, store cumulative delta
    panDelta[scale.id] = delta;
  }
}
function pan(chart, delta, enabledScales) {
  var transition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'none';
  var _ref6 = typeof delta === 'number' ? {
      x: delta,
      y: delta
    } : delta,
    _ref6$x = _ref6.x,
    x = _ref6$x === void 0 ? 0 : _ref6$x,
    _ref6$y = _ref6.y,
    y = _ref6$y === void 0 ? 0 : _ref6$y;
  var state = getState(chart);
  var _state$options3 = state.options,
    panOptions = _state$options3.pan,
    limits = _state$options3.limits;
  var _ref7 = panOptions || {},
    onPan = _ref7.onPan;
  storeOriginalScaleLimits(chart, state);
  var xEnabled = x !== 0;
  var yEnabled = y !== 0;
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.each)(enabledScales || chart.scales, function (scale) {
    if (scale.isHorizontal() && xEnabled) {
      panScale(scale, x, limits, state);
    } else if (!scale.isHorizontal() && yEnabled) {
      panScale(scale, y, limits, state);
    }
  });
  chart.update(transition);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onPan, [{
    chart: chart
  }]);
}
function getInitialScaleBounds(chart) {
  var state = getState(chart);
  storeOriginalScaleLimits(chart, state);
  var scaleBounds = {};
  for (var _i2 = 0, _Object$keys = Object.keys(chart.scales); _i2 < _Object$keys.length; _i2++) {
    var scaleId = _Object$keys[_i2];
    var _ref8 = state.originalScaleLimits[scaleId] || {
        min: {},
        max: {}
      },
      min = _ref8.min,
      max = _ref8.max;
    scaleBounds[scaleId] = {
      min: min.scale,
      max: max.scale
    };
  }
  return scaleBounds;
}
function isZoomedOrPanned(chart) {
  var scaleBounds = getInitialScaleBounds(chart);
  for (var _i3 = 0, _Object$keys2 = Object.keys(chart.scales); _i3 < _Object$keys2.length; _i3++) {
    var scaleId = _Object$keys2[_i3];
    var _scaleBounds$scaleId = scaleBounds[scaleId],
      originalMin = _scaleBounds$scaleId.min,
      originalMax = _scaleBounds$scaleId.max;
    if (originalMin !== undefined && chart.scales[scaleId].min !== originalMin) {
      return true;
    }
    if (originalMax !== undefined && chart.scales[scaleId].max !== originalMax) {
      return true;
    }
  }
  return false;
}
function removeHandler(chart, type) {
  var _getState = getState(chart),
    handlers = _getState.handlers;
  var handler = handlers[type];
  if (handler && handler.target) {
    handler.target.removeEventListener(type, handler);
    delete handlers[type];
  }
}
function addHandler(chart, target, type, handler) {
  var _getState2 = getState(chart),
    handlers = _getState2.handlers,
    options = _getState2.options;
  var oldHandler = handlers[type];
  if (oldHandler && oldHandler.target === target) {
    // already attached
    return;
  }
  removeHandler(chart, type);
  handlers[type] = function (event) {
    return handler(chart, event, options);
  };
  handlers[type].target = target;
  target.addEventListener(type, handlers[type]);
}
function mouseMove(chart, event) {
  var state = getState(chart);
  if (state.dragStart) {
    state.dragging = true;
    state.dragEnd = event;
    chart.update('none');
  }
}
function keyDown(chart, event) {
  var state = getState(chart);
  if (!state.dragStart || event.key !== 'Escape') {
    return;
  }
  removeHandler(chart, 'keydown');
  state.dragging = false;
  state.dragStart = state.dragEnd = null;
  chart.update('none');
}
function zoomStart(chart, event, zoomOptions) {
  var onZoomStart = zoomOptions.onZoomStart,
    onZoomRejected = zoomOptions.onZoomRejected;
  if (onZoomStart) {
    var point = (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.getRelativePosition)(event, chart);
    if ((0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onZoomStart, [{
      chart: chart,
      event: event,
      point: point
    }]) === false) {
      (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onZoomRejected, [{
        chart: chart,
        event: event
      }]);
      return false;
    }
  }
}
function mouseDown(chart, event) {
  var state = getState(chart);
  var _state$options4 = state.options,
    panOptions = _state$options4.pan,
    _state$options4$zoom = _state$options4.zoom,
    zoomOptions = _state$options4$zoom === void 0 ? {} : _state$options4$zoom;
  if (event.button !== 0 || keyPressed(getModifierKey(panOptions), event) || keyNotPressed(getModifierKey(zoomOptions.drag), event)) {
    return (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(zoomOptions.onZoomRejected, [{
      chart: chart,
      event: event
    }]);
  }
  if (zoomStart(chart, event, zoomOptions) === false) {
    return;
  }
  state.dragStart = event;
  addHandler(chart, chart.canvas, 'mousemove', mouseMove);
  addHandler(chart, window.document, 'keydown', keyDown);
}
function computeDragRect(chart, mode, beginPointEvent, endPointEvent) {
  var xEnabled = directionEnabled(mode, 'x', chart);
  var yEnabled = directionEnabled(mode, 'y', chart);
  var _chart$chartArea = chart.chartArea,
    top = _chart$chartArea.top,
    left = _chart$chartArea.left,
    right = _chart$chartArea.right,
    bottom = _chart$chartArea.bottom,
    chartWidth = _chart$chartArea.width,
    chartHeight = _chart$chartArea.height;
  var beginPoint = (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.getRelativePosition)(beginPointEvent, chart);
  var endPoint = (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.getRelativePosition)(endPointEvent, chart);
  if (xEnabled) {
    left = Math.min(beginPoint.x, endPoint.x);
    right = Math.max(beginPoint.x, endPoint.x);
  }
  if (yEnabled) {
    top = Math.min(beginPoint.y, endPoint.y);
    bottom = Math.max(beginPoint.y, endPoint.y);
  }
  var width = right - left;
  var height = bottom - top;
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom,
    width: width,
    height: height,
    zoomX: xEnabled && width ? 1 + (chartWidth - width) / chartWidth : 1,
    zoomY: yEnabled && height ? 1 + (chartHeight - height) / chartHeight : 1
  };
}
function mouseUp(chart, event) {
  var state = getState(chart);
  if (!state.dragStart) {
    return;
  }
  removeHandler(chart, 'mousemove');
  var _state$options$zoom = state.options.zoom,
    mode = _state$options$zoom.mode,
    onZoomComplete = _state$options$zoom.onZoomComplete,
    _state$options$zoom$d = _state$options$zoom.drag.threshold,
    threshold = _state$options$zoom$d === void 0 ? 0 : _state$options$zoom$d;
  var rect = computeDragRect(chart, mode, state.dragStart, event);
  var distanceX = directionEnabled(mode, 'x', chart) ? rect.width : 0;
  var distanceY = directionEnabled(mode, 'y', chart) ? rect.height : 0;
  var distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

  // Remove drag start and end before chart update to stop drawing selected area
  state.dragStart = state.dragEnd = null;
  if (distance <= threshold) {
    state.dragging = false;
    chart.update('none');
    return;
  }
  zoomRect(chart, {
    x: rect.left,
    y: rect.top
  }, {
    x: rect.right,
    y: rect.bottom
  }, 'zoom');
  setTimeout(function () {
    return state.dragging = false;
  }, 500);
  (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onZoomComplete, [{
    chart: chart
  }]);
}
function wheelPreconditions(chart, event, zoomOptions) {
  // Before preventDefault, check if the modifier key required and pressed
  if (keyNotPressed(getModifierKey(zoomOptions.wheel), event)) {
    (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(zoomOptions.onZoomRejected, [{
      chart: chart,
      event: event
    }]);
    return;
  }
  if (zoomStart(chart, event, zoomOptions) === false) {
    return;
  }

  // Prevent the event from triggering the default behavior (e.g. content scrolling).
  if (event.cancelable) {
    event.preventDefault();
  }

  // Firefox always fires the wheel event twice:
  // First without the delta and right after that once with the delta properties.
  if (event.deltaY === undefined) {
    return;
  }
  return true;
}
function wheel(chart, event) {
  var _getState3 = getState(chart),
    onZoomComplete = _getState3.handlers.onZoomComplete,
    zoomOptions = _getState3.options.zoom;
  if (!wheelPreconditions(chart, event, zoomOptions)) {
    return;
  }
  var rect = event.target.getBoundingClientRect();
  var speed = 1 + (event.deltaY >= 0 ? -zoomOptions.wheel.speed : zoomOptions.wheel.speed);
  var amount = {
    x: speed,
    y: speed,
    focalPoint: {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  };
  zoom(chart, amount);
  if (onZoomComplete) {
    onZoomComplete();
  }
}
function addDebouncedHandler(chart, name, handler, delay) {
  if (handler) {
    getState(chart).handlers[name] = debounce(function () {
      return (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(handler, [{
        chart: chart
      }]);
    }, delay);
  }
}
function addListeners(chart, options) {
  var canvas = chart.canvas;
  var _options$zoom = options.zoom,
    wheelOptions = _options$zoom.wheel,
    dragOptions = _options$zoom.drag,
    onZoomComplete = _options$zoom.onZoomComplete;

  // Install listeners. Do this dynamically based on options so that we can turn zoom on and off
  // We also want to make sure listeners aren't always on. E.g. if you're scrolling down a page
  // and the mouse goes over a chart you don't want it intercepted unless the plugin is enabled
  if (wheelOptions.enabled) {
    addHandler(chart, canvas, 'wheel', wheel);
    addDebouncedHandler(chart, 'onZoomComplete', onZoomComplete, 250);
  } else {
    removeHandler(chart, 'wheel');
  }
  if (dragOptions.enabled) {
    addHandler(chart, canvas, 'mousedown', mouseDown);
    addHandler(chart, canvas.ownerDocument, 'mouseup', mouseUp);
  } else {
    removeHandler(chart, 'mousedown');
    removeHandler(chart, 'mousemove');
    removeHandler(chart, 'mouseup');
    removeHandler(chart, 'keydown');
  }
}
function removeListeners(chart) {
  removeHandler(chart, 'mousedown');
  removeHandler(chart, 'mousemove');
  removeHandler(chart, 'mouseup');
  removeHandler(chart, 'wheel');
  removeHandler(chart, 'click');
  removeHandler(chart, 'keydown');
}
function createEnabler(chart, state) {
  return function (recognizer, event) {
    var _state$options5 = state.options,
      panOptions = _state$options5.pan,
      _state$options5$zoom = _state$options5.zoom,
      zoomOptions = _state$options5$zoom === void 0 ? {} : _state$options5$zoom;
    if (!panOptions || !panOptions.enabled) {
      return false;
    }
    var srcEvent = event && event.srcEvent;
    if (!srcEvent) {
      // Sometimes Hammer queries this with a null event.
      return true;
    }
    if (!state.panning && event.pointerType === 'mouse' && (keyNotPressed(getModifierKey(panOptions), srcEvent) || keyPressed(getModifierKey(zoomOptions.drag), srcEvent))) {
      (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(panOptions.onPanRejected, [{
        chart: chart,
        event: event
      }]);
      return false;
    }
    return true;
  };
}
function pinchAxes(p0, p1) {
  // fingers position difference
  var pinchX = Math.abs(p0.clientX - p1.clientX);
  var pinchY = Math.abs(p0.clientY - p1.clientY);

  // diagonal fingers will change both (xy) axes
  var p = pinchX / pinchY;
  var x, y;
  if (p > 0.3 && p < 1.7) {
    x = y = true;
  } else if (pinchX > pinchY) {
    x = true;
  } else {
    y = true;
  }
  return {
    x: x,
    y: y
  };
}
function handlePinch(chart, state, e) {
  if (state.scale) {
    var center = e.center,
      pointers = e.pointers;
    // Hammer reports the total scaling. We need the incremental amount
    var zoomPercent = 1 / state.scale * e.scale;
    var rect = e.target.getBoundingClientRect();
    var pinch = pinchAxes(pointers[0], pointers[1]);
    var mode = state.options.zoom.mode;
    var amount = {
      x: pinch.x && directionEnabled(mode, 'x', chart) ? zoomPercent : 1,
      y: pinch.y && directionEnabled(mode, 'y', chart) ? zoomPercent : 1,
      focalPoint: {
        x: center.x - rect.left,
        y: center.y - rect.top
      }
    };
    zoom(chart, amount);

    // Keep track of overall scale
    state.scale = e.scale;
  }
}
function startPinch(chart, state) {
  if (state.options.zoom.pinch.enabled) {
    state.scale = 1;
  }
}
function endPinch(chart, state, e) {
  if (state.scale) {
    handlePinch(chart, state, e);
    state.scale = null; // reset
    (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(state.options.zoom.onZoomComplete, [{
      chart: chart
    }]);
  }
}
function handlePan(chart, state, e) {
  var delta = state.delta;
  if (delta) {
    state.panning = true;
    pan(chart, {
      x: e.deltaX - delta.x,
      y: e.deltaY - delta.y
    }, state.panScales);
    state.delta = {
      x: e.deltaX,
      y: e.deltaY
    };
  }
}
function startPan(chart, state, event) {
  var _state$options$pan = state.options.pan,
    enabled = _state$options$pan.enabled,
    onPanStart = _state$options$pan.onPanStart,
    onPanRejected = _state$options$pan.onPanRejected;
  if (!enabled) {
    return;
  }
  var rect = event.target.getBoundingClientRect();
  var point = {
    x: event.center.x - rect.left,
    y: event.center.y - rect.top
  };
  if ((0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onPanStart, [{
    chart: chart,
    event: event,
    point: point
  }]) === false) {
    return (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(onPanRejected, [{
      chart: chart,
      event: event
    }]);
  }
  state.panScales = getEnabledScalesByPoint(state.options.pan, point, chart);
  state.delta = {
    x: 0,
    y: 0
  };
  clearTimeout(state.panEndTimeout);
  handlePan(chart, state, event);
}
function endPan(chart, state) {
  state.delta = null;
  if (state.panning) {
    state.panEndTimeout = setTimeout(function () {
      return state.panning = false;
    }, 500);
    (0,chart_js_helpers__WEBPACK_IMPORTED_MODULE_1__.callback)(state.options.pan.onPanComplete, [{
      chart: chart
    }]);
  }
}
var hammers = new WeakMap();
function startHammer(chart, options) {
  var state = getState(chart);
  var canvas = chart.canvas;
  var panOptions = options.pan,
    zoomOptions = options.zoom;
  var mc = new (hammerjs__WEBPACK_IMPORTED_MODULE_0___default().Manager)(canvas);
  if (zoomOptions && zoomOptions.pinch.enabled) {
    mc.add(new (hammerjs__WEBPACK_IMPORTED_MODULE_0___default().Pinch)());
    mc.on('pinchstart', function () {
      return startPinch(chart, state);
    });
    mc.on('pinch', function (e) {
      return handlePinch(chart, state, e);
    });
    mc.on('pinchend', function (e) {
      return endPinch(chart, state, e);
    });
  }
  if (panOptions && panOptions.enabled) {
    mc.add(new (hammerjs__WEBPACK_IMPORTED_MODULE_0___default().Pan)({
      threshold: panOptions.threshold,
      enable: createEnabler(chart, state)
    }));
    mc.on('panstart', function (e) {
      return startPan(chart, state, e);
    });
    mc.on('panmove', function (e) {
      return handlePan(chart, state, e);
    });
    mc.on('panend', function () {
      return endPan(chart, state);
    });
  }
  hammers.set(chart, mc);
}
function stopHammer(chart) {
  var mc = hammers.get(chart);
  if (mc) {
    mc.remove('pinchstart');
    mc.remove('pinch');
    mc.remove('pinchend');
    mc.remove('panstart');
    mc.remove('pan');
    mc.remove('panend');
    mc.destroy();
    hammers["delete"](chart);
  }
}
var version = "2.0.1";
function draw(chart, caller, options) {
  var dragOptions = options.zoom.drag;
  var _getState4 = getState(chart),
    dragStart = _getState4.dragStart,
    dragEnd = _getState4.dragEnd;
  if (dragOptions.drawTime !== caller || !dragEnd) {
    return;
  }
  var _computeDragRect = computeDragRect(chart, options.zoom.mode, dragStart, dragEnd),
    left = _computeDragRect.left,
    top = _computeDragRect.top,
    width = _computeDragRect.width,
    height = _computeDragRect.height;
  var ctx = chart.ctx;
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = dragOptions.backgroundColor || 'rgba(225,225,225,0.3)';
  ctx.fillRect(left, top, width, height);
  if (dragOptions.borderWidth > 0) {
    ctx.lineWidth = dragOptions.borderWidth;
    ctx.strokeStyle = dragOptions.borderColor || 'rgba(225,225,225)';
    ctx.strokeRect(left, top, width, height);
  }
  ctx.restore();
}
var plugin = {
  id: 'zoom',
  version: version,
  defaults: {
    pan: {
      enabled: false,
      mode: 'xy',
      threshold: 10,
      modifierKey: null
    },
    zoom: {
      wheel: {
        enabled: false,
        speed: 0.1,
        modifierKey: null
      },
      drag: {
        enabled: false,
        drawTime: 'beforeDatasetsDraw',
        modifierKey: null
      },
      pinch: {
        enabled: false
      },
      mode: 'xy'
    }
  },
  start: function start(chart, _args, options) {
    var state = getState(chart);
    state.options = options;
    if (Object.prototype.hasOwnProperty.call(options.zoom, 'enabled')) {
      console.warn('The option `zoom.enabled` is no longer supported. Please use `zoom.wheel.enabled`, `zoom.drag.enabled`, or `zoom.pinch.enabled`.');
    }
    if (Object.prototype.hasOwnProperty.call(options.zoom, 'overScaleMode') || Object.prototype.hasOwnProperty.call(options.pan, 'overScaleMode')) {
      console.warn('The option `overScaleMode` is deprecated. Please use `scaleMode` instead (and update `mode` as desired).');
    }
    if ((hammerjs__WEBPACK_IMPORTED_MODULE_0___default())) {
      startHammer(chart, options);
    }
    chart.pan = function (delta, panScales, transition) {
      return pan(chart, delta, panScales, transition);
    };
    chart.zoom = function (args, transition) {
      return zoom(chart, args, transition);
    };
    chart.zoomRect = function (p0, p1, transition) {
      return zoomRect(chart, p0, p1, transition);
    };
    chart.zoomScale = function (id, range, transition) {
      return zoomScale(chart, id, range, transition);
    };
    chart.resetZoom = function (transition) {
      return resetZoom(chart, transition);
    };
    chart.getZoomLevel = function () {
      return getZoomLevel(chart);
    };
    chart.getInitialScaleBounds = function () {
      return getInitialScaleBounds(chart);
    };
    chart.isZoomedOrPanned = function () {
      return isZoomedOrPanned(chart);
    };
  },
  beforeEvent: function beforeEvent(chart) {
    var state = getState(chart);
    if (state.panning || state.dragging) {
      // cancel any event handling while panning or dragging
      return false;
    }
  },
  beforeUpdate: function beforeUpdate(chart, args, options) {
    var state = getState(chart);
    state.options = options;
    addListeners(chart, options);
  },
  beforeDatasetsDraw: function beforeDatasetsDraw(chart, _args, options) {
    draw(chart, 'beforeDatasetsDraw', options);
  },
  afterDatasetsDraw: function afterDatasetsDraw(chart, _args, options) {
    draw(chart, 'afterDatasetsDraw', options);
  },
  beforeDraw: function beforeDraw(chart, _args, options) {
    draw(chart, 'beforeDraw', options);
  },
  afterDraw: function afterDraw(chart, _args, options) {
    draw(chart, 'afterDraw', options);
  },
  stop: function stop(chart) {
    removeListeners(chart);
    if ((hammerjs__WEBPACK_IMPORTED_MODULE_0___default())) {
      stopHammer(chart);
    }
    removeState(chart);
  },
  panFunctions: panFunctions,
  zoomFunctions: zoomFunctions,
  zoomRectFunctions: zoomRectFunctions
};


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url["default"] : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];
  if (!cssMapping) {
    return content;
  }
  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    return [content].concat([sourceMapping]).join("\n");
  }
  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/hammerjs/hammer.js":
/*!*****************************************!*\
  !*** ./node_modules/hammerjs/hammer.js ***!
  \*****************************************/
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function (window, document, exportName, undefined) {
  'use strict';

  var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
  var TEST_ELEMENT = document.createElement('div');
  var TYPE_FUNCTION = 'function';
  var round = Math.round;
  var abs = Math.abs;
  var now = Date.now;

  /**
   * set a timeout with a given scope
   * @param {Function} fn
   * @param {Number} timeout
   * @param {Object} context
   * @returns {number}
   */
  function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
  }

  /**
   * if the argument is an array, we want to execute the fn on each entry
   * if it aint an array we don't want to do a thing.
   * this is used by all the methods that accept a single and array argument.
   * @param {*|Array} arg
   * @param {String} fn
   * @param {Object} [context]
   * @returns {Boolean}
   */
  function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
      each(arg, context[fn], context);
      return true;
    }
    return false;
  }

  /**
   * walk objects and arrays
   * @param {Object} obj
   * @param {Function} iterator
   * @param {Object} context
   */
  function each(obj, iterator, context) {
    var i;
    if (!obj) {
      return;
    }
    if (obj.forEach) {
      obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
      i = 0;
      while (i < obj.length) {
        iterator.call(context, obj[i], i, obj);
        i++;
      }
    } else {
      for (i in obj) {
        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
      }
    }
  }

  /**
   * wrap a method with a deprecation warning and stack trace
   * @param {Function} method
   * @param {String} name
   * @param {String} message
   * @returns {Function} A new function wrapping the supplied method.
   */
  function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function () {
      var e = new Error('get-stack-trace');
      var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';
      var log = window.console && (window.console.warn || window.console.log);
      if (log) {
        log.call(window.console, deprecationMessage, stack);
      }
      return method.apply(this, arguments);
    };
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} target
   * @param {...Object} objects_to_assign
   * @returns {Object} target
   */
  var assign;
  if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output;
    };
  } else {
    assign = Object.assign;
  }

  /**
   * extend object.
   * means that properties in dest will be overwritten by the ones in src.
   * @param {Object} dest
   * @param {Object} src
   * @param {Boolean} [merge=false]
   * @returns {Object} dest
   */
  var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
      if (!merge || merge && dest[keys[i]] === undefined) {
        dest[keys[i]] = src[keys[i]];
      }
      i++;
    }
    return dest;
  }, 'extend', 'Use `assign`.');

  /**
   * merge the values from src in the dest.
   * means that properties that exist in dest will not be overwritten by src
   * @param {Object} dest
   * @param {Object} src
   * @returns {Object} dest
   */
  var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
  }, 'merge', 'Use `assign`.');

  /**
   * simple class inheritance
   * @param {Function} child
   * @param {Function} base
   * @param {Object} [properties]
   */
  function inherit(child, base, properties) {
    var baseP = base.prototype,
      childP;
    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;
    if (properties) {
      assign(childP, properties);
    }
  }

  /**
   * simple function bind
   * @param {Function} fn
   * @param {Object} context
   * @returns {Function}
   */
  function bindFn(fn, context) {
    return function boundFn() {
      return fn.apply(context, arguments);
    };
  }

  /**
   * let a boolean value also be a function that must return a boolean
   * this first item in args will be used as the context
   * @param {Boolean|Function} val
   * @param {Array} [args]
   * @returns {Boolean}
   */
  function boolOrFn(val, args) {
    if (_typeof(val) == TYPE_FUNCTION) {
      return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
  }

  /**
   * use the val2 when val1 is undefined
   * @param {*} val1
   * @param {*} val2
   * @returns {*}
   */
  function ifUndefined(val1, val2) {
    return val1 === undefined ? val2 : val1;
  }

  /**
   * addEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function addEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.addEventListener(type, handler, false);
    });
  }

  /**
   * removeEventListener with multiple events at once
   * @param {EventTarget} target
   * @param {String} types
   * @param {Function} handler
   */
  function removeEventListeners(target, types, handler) {
    each(splitStr(types), function (type) {
      target.removeEventListener(type, handler, false);
    });
  }

  /**
   * find if a node is in the given parent
   * @method hasParent
   * @param {HTMLElement} node
   * @param {HTMLElement} parent
   * @return {Boolean} found
   */
  function hasParent(node, parent) {
    while (node) {
      if (node == parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  /**
   * small indexOf wrapper
   * @param {String} str
   * @param {String} find
   * @returns {Boolean} found
   */
  function inStr(str, find) {
    return str.indexOf(find) > -1;
  }

  /**
   * split string on whitespace
   * @param {String} str
   * @returns {Array} words
   */
  function splitStr(str) {
    return str.trim().split(/\s+/g);
  }

  /**
   * find if a array contains the object using indexOf or a simple polyFill
   * @param {Array} src
   * @param {String} find
   * @param {String} [findByKey]
   * @return {Boolean|Number} false when not found, or the index
   */
  function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
      return src.indexOf(find);
    } else {
      var i = 0;
      while (i < src.length) {
        if (findByKey && src[i][findByKey] == find || !findByKey && src[i] === find) {
          return i;
        }
        i++;
      }
      return -1;
    }
  }

  /**
   * convert array-like objects to real arrays
   * @param {Object} obj
   * @returns {Array}
   */
  function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  /**
   * unique array with objects based on a key (like 'id') or just by the array's value
   * @param {Array} src [{id:1},{id:2},{id:1}]
   * @param {String} [key]
   * @param {Boolean} [sort=False]
   * @returns {Array} [{id:1},{id:2}]
   */
  function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;
    while (i < src.length) {
      var val = key ? src[i][key] : src[i];
      if (inArray(values, val) < 0) {
        results.push(src[i]);
      }
      values[i] = val;
      i++;
    }
    if (sort) {
      if (!key) {
        results = results.sort();
      } else {
        results = results.sort(function sortUniqueArray(a, b) {
          return a[key] > b[key];
        });
      }
    }
    return results;
  }

  /**
   * get the prefixed property
   * @param {Object} obj
   * @param {String} property
   * @returns {String|Undefined} prefixed
   */
  function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);
    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
      prefix = VENDOR_PREFIXES[i];
      prop = prefix ? prefix + camelProp : property;
      if (prop in obj) {
        return prop;
      }
      i++;
    }
    return undefined;
  }

  /**
   * get a unique id
   * @returns {number} uniqueId
   */
  var _uniqueId = 1;
  function uniqueId() {
    return _uniqueId++;
  }

  /**
   * get the window object of an element
   * @param {HTMLElement} element
   * @returns {DocumentView|Window}
   */
  function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return doc.defaultView || doc.parentWindow || window;
  }
  var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
  var SUPPORT_TOUCH = ('ontouchstart' in window);
  var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
  var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
  var INPUT_TYPE_TOUCH = 'touch';
  var INPUT_TYPE_PEN = 'pen';
  var INPUT_TYPE_MOUSE = 'mouse';
  var INPUT_TYPE_KINECT = 'kinect';
  var COMPUTE_INTERVAL = 25;
  var INPUT_START = 1;
  var INPUT_MOVE = 2;
  var INPUT_END = 4;
  var INPUT_CANCEL = 8;
  var DIRECTION_NONE = 1;
  var DIRECTION_LEFT = 2;
  var DIRECTION_RIGHT = 4;
  var DIRECTION_UP = 8;
  var DIRECTION_DOWN = 16;
  var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
  var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
  var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;
  var PROPS_XY = ['x', 'y'];
  var PROPS_CLIENT_XY = ['clientX', 'clientY'];

  /**
   * create new input type manager
   * @param {Manager} manager
   * @param {Function} callback
   * @returns {Input}
   * @constructor
   */
  function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function (ev) {
      if (boolOrFn(manager.options.enable, [manager])) {
        self.handler(ev);
      }
    };
    this.init();
  }
  Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function handler() {},
    /**
     * bind the events
     */
    init: function init() {
      this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },
    /**
     * unbind the events
     */
    destroy: function destroy() {
      this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
      this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
      this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
  };

  /**
   * create new input type manager
   * called by the Manager constructor
   * @param {Hammer} manager
   * @returns {Input}
   */
  function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;
    if (inputClass) {
      Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
      Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
      Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
      Type = MouseInput;
    } else {
      Type = TouchMouseInput;
    }
    return new Type(manager, inputHandler);
  }

  /**
   * handle input events
   * @param {Manager} manager
   * @param {String} eventType
   * @param {Object} input
   */
  function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = eventType & INPUT_START && pointersLen - changedPointersLen === 0;
    var isFinal = eventType & (INPUT_END | INPUT_CANCEL) && pointersLen - changedPointersLen === 0;
    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;
    if (isFirst) {
      manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);
    manager.recognize(input);
    manager.session.prevInput = input;
  }

  /**
   * extend the data with some usable properties like scale, rotate, velocity etc
   * @param {Object} manager
   * @param {Object} input
   */
  function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
      session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
      session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
      session.firstMultiple = false;
    }
    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;
    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;
    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);
    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);
    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = abs(overallVelocity.x) > abs(overallVelocity.y) ? overallVelocity.x : overallVelocity.y;
    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;
    input.maxPointers = !session.prevInput ? input.pointers.length : input.pointers.length > session.prevInput.maxPointers ? input.pointers.length : session.prevInput.maxPointers;
    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
      target = input.srcEvent.target;
    }
    input.target = target;
  }
  function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};
    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
      prevDelta = session.prevDelta = {
        x: prevInput.deltaX || 0,
        y: prevInput.deltaY || 0
      };
      offset = session.offsetDelta = {
        x: center.x,
        y: center.y
      };
    }
    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
  }

  /**
   * velocity is calculated every x ms
   * @param {Object} session
   * @param {Object} input
   */
  function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
      deltaTime = input.timeStamp - last.timeStamp,
      velocity,
      velocityX,
      velocityY,
      direction;
    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
      var deltaX = input.deltaX - last.deltaX;
      var deltaY = input.deltaY - last.deltaY;
      var v = getVelocity(deltaTime, deltaX, deltaY);
      velocityX = v.x;
      velocityY = v.y;
      velocity = abs(v.x) > abs(v.y) ? v.x : v.y;
      direction = getDirection(deltaX, deltaY);
      session.lastInterval = input;
    } else {
      // use latest velocity info if it doesn't overtake a minimum period
      velocity = last.velocity;
      velocityX = last.velocityX;
      velocityY = last.velocityY;
      direction = last.direction;
    }
    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
  }

  /**
   * create a simple clone from the input used for storage of firstInput and firstMultiple
   * @param {Object} input
   * @returns {Object} clonedInputData
   */
  function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
      pointers[i] = {
        clientX: round(input.pointers[i].clientX),
        clientY: round(input.pointers[i].clientY)
      };
      i++;
    }
    return {
      timeStamp: now(),
      pointers: pointers,
      center: getCenter(pointers),
      deltaX: input.deltaX,
      deltaY: input.deltaY
    };
  }

  /**
   * get the center of all the pointers
   * @param {Array} pointers
   * @return {Object} center contains `x` and `y` properties
   */
  function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
      return {
        x: round(pointers[0].clientX),
        y: round(pointers[0].clientY)
      };
    }
    var x = 0,
      y = 0,
      i = 0;
    while (i < pointersLength) {
      x += pointers[i].clientX;
      y += pointers[i].clientY;
      i++;
    }
    return {
      x: round(x / pointersLength),
      y: round(y / pointersLength)
    };
  }

  /**
   * calculate the velocity between two points. unit is in px per ms.
   * @param {Number} deltaTime
   * @param {Number} x
   * @param {Number} y
   * @return {Object} velocity `x` and `y`
   */
  function getVelocity(deltaTime, x, y) {
    return {
      x: x / deltaTime || 0,
      y: y / deltaTime || 0
    };
  }

  /**
   * get the direction between two points
   * @param {Number} x
   * @param {Number} y
   * @return {Number} direction
   */
  function getDirection(x, y) {
    if (x === y) {
      return DIRECTION_NONE;
    }
    if (abs(x) >= abs(y)) {
      return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
  }

  /**
   * calculate the absolute distance between two points
   * @param {Object} p1 {x, y}
   * @param {Object} p2 {x, y}
   * @param {Array} [props] containing x and y keys
   * @return {Number} distance
   */
  function getDistance(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];
    return Math.sqrt(x * x + y * y);
  }

  /**
   * calculate the angle between two coordinates
   * @param {Object} p1
   * @param {Object} p2
   * @param {Array} [props] containing x and y keys
   * @return {Number} angle
   */
  function getAngle(p1, p2, props) {
    if (!props) {
      props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
      y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
  }

  /**
   * calculate the rotation degrees between two pointersets
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} rotation
   */
  function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
  }

  /**
   * calculate the scale factor between two pointersets
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
   * @param {Array} start array of pointers
   * @param {Array} end array of pointers
   * @return {Number} scale
   */
  function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
  }
  var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
  };
  var MOUSE_ELEMENT_EVENTS = 'mousedown';
  var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

  /**
   * Mouse events input
   * @constructor
   * @extends Input
   */
  function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;
    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
  }
  inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
      var eventType = MOUSE_INPUT_MAP[ev.type];

      // on start we want to have the left mouse button down
      if (eventType & INPUT_START && ev.button === 0) {
        this.pressed = true;
      }
      if (eventType & INPUT_MOVE && ev.which !== 1) {
        eventType = INPUT_END;
      }

      // mouse must be down
      if (!this.pressed) {
        return;
      }
      if (eventType & INPUT_END) {
        this.pressed = false;
      }
      this.callback(this.manager, eventType, {
        pointers: [ev],
        changedPointers: [ev],
        pointerType: INPUT_TYPE_MOUSE,
        srcEvent: ev
      });
    }
  });
  var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
  };

  // in IE10 the pointer types is defined as an enum
  var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
  };

  var POINTER_ELEMENT_EVENTS = 'pointerdown';
  var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

  // IE10 has prefixed support, and case-sensitive
  if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
  }

  /**
   * Pointer events input
   * @constructor
   * @extends Input
   */
  function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;
    Input.apply(this, arguments);
    this.store = this.manager.session.pointerEvents = [];
  }
  inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
      var store = this.store;
      var removePointer = false;
      var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
      var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
      var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;
      var isTouch = pointerType == INPUT_TYPE_TOUCH;

      // get index of the event in the store
      var storeIndex = inArray(store, ev.pointerId, 'pointerId');

      // start and mouse must be down
      if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
        if (storeIndex < 0) {
          store.push(ev);
          storeIndex = store.length - 1;
        }
      } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        removePointer = true;
      }

      // it not found, so the pointer hasn't been down (so it's probably a hover)
      if (storeIndex < 0) {
        return;
      }

      // update the event in the store
      store[storeIndex] = ev;
      this.callback(this.manager, eventType, {
        pointers: store,
        changedPointers: [ev],
        pointerType: pointerType,
        srcEvent: ev
      });
      if (removePointer) {
        // remove from the store
        store.splice(storeIndex, 1);
      }
    }
  });
  var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
  var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

  /**
   * Touch events input
   * @constructor
   * @extends Input
   */
  function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;
    Input.apply(this, arguments);
  }
  inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
      var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

      // should we handle the touch events?
      if (type === INPUT_START) {
        this.started = true;
      }
      if (!this.started) {
        return;
      }
      var touches = normalizeSingleTouches.call(this, ev, type);

      // when done, reset the started state
      if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
        this.started = false;
      }
      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);
    if (type & (INPUT_END | INPUT_CANCEL)) {
      all = uniqueArray(all.concat(changed), 'identifier', true);
    }
    return [all, changed];
  }
  var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
  };
  var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

  /**
   * Multi-user touch events input
   * @constructor
   * @extends Input
   */
  function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};
    Input.apply(this, arguments);
  }
  inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
      var type = TOUCH_INPUT_MAP[ev.type];
      var touches = getTouches.call(this, ev, type);
      if (!touches) {
        return;
      }
      this.callback(this.manager, type, {
        pointers: touches[0],
        changedPointers: touches[1],
        pointerType: INPUT_TYPE_TOUCH,
        srcEvent: ev
      });
    }
  });

  /**
   * @this {TouchInput}
   * @param {Object} ev
   * @param {Number} type flag
   * @returns {undefined|Array} [all, changed]
   */
  function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
      targetIds[allTouches[0].identifier] = true;
      return [allTouches, allTouches];
    }
    var i,
      targetTouches,
      changedTouches = toArray(ev.changedTouches),
      changedTargetTouches = [],
      target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function (touch) {
      return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
      i = 0;
      while (i < targetTouches.length) {
        targetIds[targetTouches[i].identifier] = true;
        i++;
      }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
      if (targetIds[changedTouches[i].identifier]) {
        changedTargetTouches.push(changedTouches[i]);
      }

      // cleanup removed touches
      if (type & (INPUT_END | INPUT_CANCEL)) {
        delete targetIds[changedTouches[i].identifier];
      }
      i++;
    }
    if (!changedTargetTouches.length) {
      return;
    }
    return [
    // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
    uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true), changedTargetTouches];
  }

  /**
   * Combined touch and mouse input
   *
   * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
   * This because touch devices also emit mouse events while doing a touch.
   *
   * @constructor
   * @extends Input
   */

  var DEDUP_TIMEOUT = 2500;
  var DEDUP_DISTANCE = 25;
  function TouchMouseInput() {
    Input.apply(this, arguments);
    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);
    this.primaryTouch = null;
    this.lastTouches = [];
  }
  inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
      var isTouch = inputData.pointerType == INPUT_TYPE_TOUCH,
        isMouse = inputData.pointerType == INPUT_TYPE_MOUSE;
      if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
        return;
      }

      // when we're in a touch event, record touches to  de-dupe synthetic mouse event
      if (isTouch) {
        recordTouches.call(this, inputEvent, inputData);
      } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
        return;
      }
      this.callback(manager, inputEvent, inputData);
    },
    /**
     * remove the event listeners
     */
    destroy: function destroy() {
      this.touch.destroy();
      this.mouse.destroy();
    }
  });
  function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
      this.primaryTouch = eventData.changedPointers[0].identifier;
      setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
      setLastTouch.call(this, eventData);
    }
  }
  function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];
    if (touch.identifier === this.primaryTouch) {
      var lastTouch = {
        x: touch.clientX,
        y: touch.clientY
      };
      this.lastTouches.push(lastTouch);
      var lts = this.lastTouches;
      var removeLastTouch = function removeLastTouch() {
        var i = lts.indexOf(lastTouch);
        if (i > -1) {
          lts.splice(i, 1);
        }
      };
      setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
  }
  function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX,
      y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
      var t = this.lastTouches[i];
      var dx = Math.abs(x - t.x),
        dy = Math.abs(y - t.y);
      if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
        return true;
      }
    }
    return false;
  }
  var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
  var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

  // magical touchAction value
  var TOUCH_ACTION_COMPUTE = 'compute';
  var TOUCH_ACTION_AUTO = 'auto';
  var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
  var TOUCH_ACTION_NONE = 'none';
  var TOUCH_ACTION_PAN_X = 'pan-x';
  var TOUCH_ACTION_PAN_Y = 'pan-y';
  var TOUCH_ACTION_MAP = getTouchActionProps();

  /**
   * Touch Action
   * sets the touchAction property or uses the js alternative
   * @param {Manager} manager
   * @param {String} value
   * @constructor
   */
  function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
  }
  TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function set(value) {
      // find out the touch-action by the event handlers
      if (value == TOUCH_ACTION_COMPUTE) {
        value = this.compute();
      }
      if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
        this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
      }
      this.actions = value.toLowerCase().trim();
    },
    /**
     * just re-set the touchAction value
     */
    update: function update() {
      this.set(this.manager.options.touchAction);
    },
    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function compute() {
      var actions = [];
      each(this.manager.recognizers, function (recognizer) {
        if (boolOrFn(recognizer.options.enable, [recognizer])) {
          actions = actions.concat(recognizer.getTouchAction());
        }
      });
      return cleanTouchActions(actions.join(' '));
    },
    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function preventDefaults(input) {
      var srcEvent = input.srcEvent;
      var direction = input.offsetDirection;

      // if the touch action did prevented once this session
      if (this.manager.session.prevented) {
        srcEvent.preventDefault();
        return;
      }
      var actions = this.actions;
      var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
      var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
      var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];
      if (hasNone) {
        //do not prevent defaults if this is a tap gesture

        var isTapPointer = input.pointers.length === 1;
        var isTapMovement = input.distance < 2;
        var isTapTouchTime = input.deltaTime < 250;
        if (isTapPointer && isTapMovement && isTapTouchTime) {
          return;
        }
      }
      if (hasPanX && hasPanY) {
        // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
        return;
      }
      if (hasNone || hasPanY && direction & DIRECTION_HORIZONTAL || hasPanX && direction & DIRECTION_VERTICAL) {
        return this.preventSrc(srcEvent);
      }
    },
    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function preventSrc(srcEvent) {
      this.manager.session.prevented = true;
      srcEvent.preventDefault();
    }
  };

  /**
   * when the touchActions are collected they are not a valid value, so we need to clean things up. *
   * @param {String} actions
   * @returns {*}
   */
  function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
      return TOUCH_ACTION_NONE;
    }
    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
      return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
      return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
      return TOUCH_ACTION_MANIPULATION;
    }
    return TOUCH_ACTION_AUTO;
  }
  function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
      return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function (val) {
      // If css.supports is not supported but there is native touch-action assume it supports
      // all values. This is the case for IE 10 and 11.
      touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
  }

  /**
   * Recognizer flow explained; *
   * All recognizers have the initial state of POSSIBLE when a input session starts.
   * The definition of a input session is from the first input until the last input, with all it's movement in it. *
   * Example session for mouse-input: mousedown -> mousemove -> mouseup
   *
   * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
   * which determines with state it should be.
   *
   * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
   * POSSIBLE to give it another change on the next cycle.
   *
   *               Possible
   *                  |
   *            +-----+---------------+
   *            |                     |
   *      +-----+-----+               |
   *      |           |               |
   *   Failed      Cancelled          |
   *                          +-------+------+
   *                          |              |
   *                      Recognized       Began
   *                                         |
   *                                      Changed
   *                                         |
   *                                  Ended/Recognized
   */
  var STATE_POSSIBLE = 1;
  var STATE_BEGAN = 2;
  var STATE_CHANGED = 4;
  var STATE_ENDED = 8;
  var STATE_RECOGNIZED = STATE_ENDED;
  var STATE_CANCELLED = 16;
  var STATE_FAILED = 32;

  /**
   * Recognizer
   * Every recognizer needs to extend from this class.
   * @constructor
   * @param {Object} options
   */
  function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});
    this.id = uniqueId();
    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);
    this.state = STATE_POSSIBLE;
    this.simultaneous = {};
    this.requireFail = [];
  }
  Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},
    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function set(options) {
      assign(this.options, options);

      // also update the touchAction, in case something changed about the directions/enabled state
      this.manager && this.manager.touchAction.update();
      return this;
    },
    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function recognizeWith(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
        return this;
      }
      var simultaneous = this.simultaneous;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (!simultaneous[otherRecognizer.id]) {
        simultaneous[otherRecognizer.id] = otherRecognizer;
        otherRecognizer.recognizeWith(this);
      }
      return this;
    },
    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function dropRecognizeWith(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
        return this;
      }
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      delete this.simultaneous[otherRecognizer.id];
      return this;
    },
    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function requireFailure(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
        return this;
      }
      var requireFail = this.requireFail;
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      if (inArray(requireFail, otherRecognizer) === -1) {
        requireFail.push(otherRecognizer);
        otherRecognizer.requireFailure(this);
      }
      return this;
    },
    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function dropRequireFailure(otherRecognizer) {
      if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
        return this;
      }
      otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
      var index = inArray(this.requireFail, otherRecognizer);
      if (index > -1) {
        this.requireFail.splice(index, 1);
      }
      return this;
    },
    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function hasRequireFailures() {
      return this.requireFail.length > 0;
    },
    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function canRecognizeWith(otherRecognizer) {
      return !!this.simultaneous[otherRecognizer.id];
    },
    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function emit(input) {
      var self = this;
      var state = this.state;
      function emit(event) {
        self.manager.emit(event, input);
      }

      // 'panstart' and 'panmove'
      if (state < STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }
      emit(self.options.event); // simple 'eventName' events

      if (input.additionalEvent) {
        // additional event(panleft, panright, pinchin, pinchout...)
        emit(input.additionalEvent);
      }

      // panend and pancancel
      if (state >= STATE_ENDED) {
        emit(self.options.event + stateStr(state));
      }
    },
    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function tryEmit(input) {
      if (this.canEmit()) {
        return this.emit(input);
      }
      // it's failing anyway
      this.state = STATE_FAILED;
    },
    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function canEmit() {
      var i = 0;
      while (i < this.requireFail.length) {
        if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
          return false;
        }
        i++;
      }
      return true;
    },
    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function recognize(inputData) {
      // make a new copy of the inputData
      // so we can change the inputData without messing up the other recognizers
      var inputDataClone = assign({}, inputData);

      // is is enabled and allow recognizing?
      if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
        this.reset();
        this.state = STATE_FAILED;
        return;
      }

      // reset when we've reached the end
      if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
        this.state = STATE_POSSIBLE;
      }
      this.state = this.process(inputDataClone);

      // the recognizer has recognized a gesture
      // so trigger an event
      if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
        this.tryEmit(inputDataClone);
      }
    },
    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function process(inputData) {},
    // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function getTouchAction() {},
    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function reset() {}
  };

  /**
   * get a usable string, used as event postfix
   * @param {Const} state
   * @returns {String} state
   */
  function stateStr(state) {
    if (state & STATE_CANCELLED) {
      return 'cancel';
    } else if (state & STATE_ENDED) {
      return 'end';
    } else if (state & STATE_CHANGED) {
      return 'move';
    } else if (state & STATE_BEGAN) {
      return 'start';
    }
    return '';
  }

  /**
   * direction cons to string
   * @param {Const} direction
   * @returns {String}
   */
  function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
      return 'down';
    } else if (direction == DIRECTION_UP) {
      return 'up';
    } else if (direction == DIRECTION_LEFT) {
      return 'left';
    } else if (direction == DIRECTION_RIGHT) {
      return 'right';
    }
    return '';
  }

  /**
   * get a recognizer by name if it is bound to a manager
   * @param {Recognizer|String} otherRecognizer
   * @param {Recognizer} recognizer
   * @returns {Recognizer}
   */
  function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
      return manager.get(otherRecognizer);
    }
    return otherRecognizer;
  }

  /**
   * This recognizer is just used as a base for the simple attribute recognizers.
   * @constructor
   * @extends Recognizer
   */
  function AttrRecognizer() {
    Recognizer.apply(this, arguments);
  }
  inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
      /**
       * @type {Number}
       * @default 1
       */
      pointers: 1
    },
    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function attrTest(input) {
      var optionPointers = this.options.pointers;
      return optionPointers === 0 || input.pointers.length === optionPointers;
    },
    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function process(input) {
      var state = this.state;
      var eventType = input.eventType;
      var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
      var isValid = this.attrTest(input);

      // on cancel input and we've recognized before, return STATE_CANCELLED
      if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
        return state | STATE_CANCELLED;
      } else if (isRecognized || isValid) {
        if (eventType & INPUT_END) {
          return state | STATE_ENDED;
        } else if (!(state & STATE_BEGAN)) {
          return STATE_BEGAN;
        }
        return state | STATE_CHANGED;
      }
      return STATE_FAILED;
    }
  });

  /**
   * Pan
   * Recognized when the pointer is down and moved in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);
    this.pX = null;
    this.pY = null;
  }
  inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
      event: 'pan',
      threshold: 10,
      pointers: 1,
      direction: DIRECTION_ALL
    },
    getTouchAction: function getTouchAction() {
      var direction = this.options.direction;
      var actions = [];
      if (direction & DIRECTION_HORIZONTAL) {
        actions.push(TOUCH_ACTION_PAN_Y);
      }
      if (direction & DIRECTION_VERTICAL) {
        actions.push(TOUCH_ACTION_PAN_X);
      }
      return actions;
    },
    directionTest: function directionTest(input) {
      var options = this.options;
      var hasMoved = true;
      var distance = input.distance;
      var direction = input.direction;
      var x = input.deltaX;
      var y = input.deltaY;

      // lock to axis?
      if (!(direction & options.direction)) {
        if (options.direction & DIRECTION_HORIZONTAL) {
          direction = x === 0 ? DIRECTION_NONE : x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
          hasMoved = x != this.pX;
          distance = Math.abs(input.deltaX);
        } else {
          direction = y === 0 ? DIRECTION_NONE : y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
          hasMoved = y != this.pY;
          distance = Math.abs(input.deltaY);
        }
      }
      input.direction = direction;
      return hasMoved && distance > options.threshold && direction & options.direction;
    },
    attrTest: function attrTest(input) {
      return AttrRecognizer.prototype.attrTest.call(this, input) && (this.state & STATE_BEGAN || !(this.state & STATE_BEGAN) && this.directionTest(input));
    },
    emit: function emit(input) {
      this.pX = input.deltaX;
      this.pY = input.deltaY;
      var direction = directionStr(input.direction);
      if (direction) {
        input.additionalEvent = this.options.event + direction;
      }
      this._super.emit.call(this, input);
    }
  });

  /**
   * Pinch
   * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
   * @constructor
   * @extends AttrRecognizer
   */
  function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'pinch',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function attrTest(input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },
    emit: function emit(input) {
      if (input.scale !== 1) {
        var inOut = input.scale < 1 ? 'in' : 'out';
        input.additionalEvent = this.options.event + inOut;
      }
      this._super.emit.call(this, input);
    }
  });

  /**
   * Press
   * Recognized when the pointer is down for x ms without any movement.
   * @constructor
   * @extends Recognizer
   */
  function PressRecognizer() {
    Recognizer.apply(this, arguments);
    this._timer = null;
    this._input = null;
  }
  inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
      event: 'press',
      pointers: 1,
      time: 251,
      // minimal time of the pointer to be pressed
      threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_AUTO];
    },
    process: function process(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTime = input.deltaTime > options.time;
      this._input = input;

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (!validMovement || !validPointers || input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime) {
        this.reset();
      } else if (input.eventType & INPUT_START) {
        this.reset();
        this._timer = setTimeoutContext(function () {
          this.state = STATE_RECOGNIZED;
          this.tryEmit();
        }, options.time, this);
      } else if (input.eventType & INPUT_END) {
        return STATE_RECOGNIZED;
      }
      return STATE_FAILED;
    },
    reset: function reset() {
      clearTimeout(this._timer);
    },
    emit: function emit(input) {
      if (this.state !== STATE_RECOGNIZED) {
        return;
      }
      if (input && input.eventType & INPUT_END) {
        this.manager.emit(this.options.event + 'up', input);
      } else {
        this._input.timeStamp = now();
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Rotate
   * Recognized when two or more pointer are moving in a circular motion.
   * @constructor
   * @extends AttrRecognizer
   */
  function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
      event: 'rotate',
      threshold: 0,
      pointers: 2
    },
    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_NONE];
    },
    attrTest: function attrTest(input) {
      return this._super.attrTest.call(this, input) && (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
  });

  /**
   * Swipe
   * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
   * @constructor
   * @extends AttrRecognizer
   */
  function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
  }
  inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
      event: 'swipe',
      threshold: 10,
      velocity: 0.3,
      direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
      pointers: 1
    },
    getTouchAction: function getTouchAction() {
      return PanRecognizer.prototype.getTouchAction.call(this);
    },
    attrTest: function attrTest(input) {
      var direction = this.options.direction;
      var velocity;
      if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
        velocity = input.overallVelocity;
      } else if (direction & DIRECTION_HORIZONTAL) {
        velocity = input.overallVelocityX;
      } else if (direction & DIRECTION_VERTICAL) {
        velocity = input.overallVelocityY;
      }
      return this._super.attrTest.call(this, input) && direction & input.offsetDirection && input.distance > this.options.threshold && input.maxPointers == this.options.pointers && abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },
    emit: function emit(input) {
      var direction = directionStr(input.offsetDirection);
      if (direction) {
        this.manager.emit(this.options.event + direction, input);
      }
      this.manager.emit(this.options.event, input);
    }
  });

  /**
   * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
   * between the given interval and position. The delay option can be used to recognize multi-taps without firing
   * a single tap.
   *
   * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
   * multi-taps being recognized.
   * @constructor
   * @extends Recognizer
   */
  function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;
    this._timer = null;
    this._input = null;
    this.count = 0;
  }
  inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
      event: 'tap',
      pointers: 1,
      taps: 1,
      interval: 300,
      // max time between the multi-tap taps
      time: 250,
      // max time of the pointer to be down (like finger on the screen)
      threshold: 9,
      // a minimal movement is ok, but keep it low
      posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function getTouchAction() {
      return [TOUCH_ACTION_MANIPULATION];
    },
    process: function process(input) {
      var options = this.options;
      var validPointers = input.pointers.length === options.pointers;
      var validMovement = input.distance < options.threshold;
      var validTouchTime = input.deltaTime < options.time;
      this.reset();
      if (input.eventType & INPUT_START && this.count === 0) {
        return this.failTimeout();
      }

      // we only allow little movement
      // and we've reached an end event, so a tap is possible
      if (validMovement && validTouchTime && validPointers) {
        if (input.eventType != INPUT_END) {
          return this.failTimeout();
        }
        var validInterval = this.pTime ? input.timeStamp - this.pTime < options.interval : true;
        var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;
        this.pTime = input.timeStamp;
        this.pCenter = input.center;
        if (!validMultiTap || !validInterval) {
          this.count = 1;
        } else {
          this.count += 1;
        }
        this._input = input;

        // if tap count matches we have recognized it,
        // else it has began recognizing...
        var tapCount = this.count % options.taps;
        if (tapCount === 0) {
          // no failing requirements, immediately trigger the tap event
          // or wait as long as the multitap interval to trigger
          if (!this.hasRequireFailures()) {
            return STATE_RECOGNIZED;
          } else {
            this._timer = setTimeoutContext(function () {
              this.state = STATE_RECOGNIZED;
              this.tryEmit();
            }, options.interval, this);
            return STATE_BEGAN;
          }
        }
      }
      return STATE_FAILED;
    },
    failTimeout: function failTimeout() {
      this._timer = setTimeoutContext(function () {
        this.state = STATE_FAILED;
      }, this.options.interval, this);
      return STATE_FAILED;
    },
    reset: function reset() {
      clearTimeout(this._timer);
    },
    emit: function emit() {
      if (this.state == STATE_RECOGNIZED) {
        this._input.tapCount = this.count;
        this.manager.emit(this.options.event, this._input);
      }
    }
  });

  /**
   * Simple way to create a manager with a default set of recognizers.
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
  }

  /**
   * @const {string}
   */
  Hammer.VERSION = '2.0.7';

  /**
   * default settings
   * @namespace
   */
  Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,
    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,
    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,
    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,
    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,
    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
    // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
    [RotateRecognizer, {
      enable: false
    }], [PinchRecognizer, {
      enable: false
    }, ['rotate']], [SwipeRecognizer, {
      direction: DIRECTION_HORIZONTAL
    }], [PanRecognizer, {
      direction: DIRECTION_HORIZONTAL
    }, ['swipe']], [TapRecognizer], [TapRecognizer, {
      event: 'doubletap',
      taps: 2
    }, ['tap']], [PressRecognizer]],
    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
      /**
       * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userSelect: 'none',
      /**
       * Disable the Windows Phone grippers when pressing an element.
       * @type {String}
       * @default 'none'
       */
      touchSelect: 'none',
      /**
       * Disables the default callout shown when you touch and hold a touch target.
       * On iOS, when you touch and hold a touch target such as a link, Safari displays
       * a callout containing information about the link. This property allows you to disable that callout.
       * @type {String}
       * @default 'none'
       */
      touchCallout: 'none',
      /**
       * Specifies whether zooming is enabled. Used by IE10>
       * @type {String}
       * @default 'none'
       */
      contentZooming: 'none',
      /**
       * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
       * @type {String}
       * @default 'none'
       */
      userDrag: 'none',
      /**
       * Overrides the highlight color shown when the user taps a link or a JavaScript
       * clickable element in iOS. This property obeys the alpha value, if specified.
       * @type {String}
       * @default 'rgba(0,0,0,0)'
       */
      tapHighlightColor: 'rgba(0,0,0,0)'
    }
  };
  var STOP = 1;
  var FORCED_STOP = 2;

  /**
   * Manager
   * @param {HTMLElement} element
   * @param {Object} [options]
   * @constructor
   */
  function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});
    this.options.inputTarget = this.options.inputTarget || element;
    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};
    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);
    toggleCssProps(this, true);
    each(this.options.recognizers, function (item) {
      var recognizer = this.add(new item[0](item[1]));
      item[2] && recognizer.recognizeWith(item[2]);
      item[3] && recognizer.requireFailure(item[3]);
    }, this);
  }
  Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function set(options) {
      assign(this.options, options);

      // Options that need a little more setup
      if (options.touchAction) {
        this.touchAction.update();
      }
      if (options.inputTarget) {
        // Clean up existing event listeners and reinitialize
        this.input.destroy();
        this.input.target = options.inputTarget;
        this.input.init();
      }
      return this;
    },
    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function stop(force) {
      this.session.stopped = force ? FORCED_STOP : STOP;
    },
    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function recognize(inputData) {
      var session = this.session;
      if (session.stopped) {
        return;
      }

      // run the touch-action polyfill
      this.touchAction.preventDefaults(inputData);
      var recognizer;
      var recognizers = this.recognizers;

      // this holds the recognizer that is being recognized.
      // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
      // if no recognizer is detecting a thing, it is set to `null`
      var curRecognizer = session.curRecognizer;

      // reset when the last recognizer is recognized
      // or when we're in a new session
      if (!curRecognizer || curRecognizer && curRecognizer.state & STATE_RECOGNIZED) {
        curRecognizer = session.curRecognizer = null;
      }
      var i = 0;
      while (i < recognizers.length) {
        recognizer = recognizers[i];

        // find out if we are allowed try to recognize the input for this one.
        // 1.   allow if the session is NOT forced stopped (see the .stop() method)
        // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
        //      that is being recognized.
        // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
        //      this can be setup with the `recognizeWith()` method on the recognizer.
        if (session.stopped !== FORCED_STOP && (
        // 1
        !curRecognizer || recognizer == curRecognizer ||
        // 2
        recognizer.canRecognizeWith(curRecognizer))) {
          // 3
          recognizer.recognize(inputData);
        } else {
          recognizer.reset();
        }

        // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
        // current active recognizer. but only if we don't already have an active recognizer
        if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
          curRecognizer = session.curRecognizer = recognizer;
        }
        i++;
      }
    },
    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function get(recognizer) {
      if (recognizer instanceof Recognizer) {
        return recognizer;
      }
      var recognizers = this.recognizers;
      for (var i = 0; i < recognizers.length; i++) {
        if (recognizers[i].options.event == recognizer) {
          return recognizers[i];
        }
      }
      return null;
    },
    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function add(recognizer) {
      if (invokeArrayArg(recognizer, 'add', this)) {
        return this;
      }

      // remove existing
      var existing = this.get(recognizer.options.event);
      if (existing) {
        this.remove(existing);
      }
      this.recognizers.push(recognizer);
      recognizer.manager = this;
      this.touchAction.update();
      return recognizer;
    },
    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function remove(recognizer) {
      if (invokeArrayArg(recognizer, 'remove', this)) {
        return this;
      }
      recognizer = this.get(recognizer);

      // let's make sure this recognizer exists
      if (recognizer) {
        var recognizers = this.recognizers;
        var index = inArray(recognizers, recognizer);
        if (index !== -1) {
          recognizers.splice(index, 1);
          this.touchAction.update();
        }
      }
      return this;
    },
    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function on(events, handler) {
      if (events === undefined) {
        return;
      }
      if (handler === undefined) {
        return;
      }
      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
      });
      return this;
    },
    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function off(events, handler) {
      if (events === undefined) {
        return;
      }
      var handlers = this.handlers;
      each(splitStr(events), function (event) {
        if (!handler) {
          delete handlers[event];
        } else {
          handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
        }
      });
      return this;
    },
    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function emit(event, data) {
      // we also want to trigger dom events
      if (this.options.domEvents) {
        triggerDomEvent(event, data);
      }

      // no handlers, so skip it all
      var handlers = this.handlers[event] && this.handlers[event].slice();
      if (!handlers || !handlers.length) {
        return;
      }
      data.type = event;
      data.preventDefault = function () {
        data.srcEvent.preventDefault();
      };
      var i = 0;
      while (i < handlers.length) {
        handlers[i](data);
        i++;
      }
    },
    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function destroy() {
      this.element && toggleCssProps(this, false);
      this.handlers = {};
      this.session = {};
      this.input.destroy();
      this.element = null;
    }
  };

  /**
   * add/remove the css properties as defined in manager.options.cssProps
   * @param {Manager} manager
   * @param {Boolean} add
   */
  function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
      return;
    }
    var prop;
    each(manager.options.cssProps, function (value, name) {
      prop = prefixed(element.style, name);
      if (add) {
        manager.oldCssProps[prop] = element.style[prop];
        element.style[prop] = value;
      } else {
        element.style[prop] = manager.oldCssProps[prop] || '';
      }
    });
    if (!add) {
      manager.oldCssProps = {};
    }
  }

  /**
   * trigger dom event
   * @param {String} event
   * @param {Object} data
   */
  function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
  }
  assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,
    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,
    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,
    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,
    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,
    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,
    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
  });

  // this prevents errors when Hammer is loaded in the presence of an AMD
  //  style loader but by script tag, not by the loader.
  var freeGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}; // jshint ignore:line
  freeGlobal.Hammer = Hammer;
  if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {
      return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {}
})(window, document, 'Hammer');

/***/ }),

/***/ "./src/chart-init.js":
/*!***************************!*\
  !*** ./src/chart-init.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadChart: () => (/* binding */ loadChart)
/* harmony export */ });
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var chart_js_auto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! chart.js/auto */ "./node_modules/chart.js/auto/auto.js");
/* harmony import */ var chartjs_plugin_zoom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! chartjs-plugin-zoom */ "./node_modules/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.esm.js");



var chartElement = document.querySelector("#temperature-chart");
function deviceIsMobile() {
  return window.innerWidth < 650;
}
var weatherData = {
  labels: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
  datasets: [{
    label: "Temperature",
    borderColor: "#c32860" /* line color */,
    pointBorderColor: "#b80043" /* point color */,
    pointBorderWidth: 4,
    borderWidth: 4,
    pointHoverBorderWidth: 8,
    data: [],
    lineTension: 0.45
  }, {
    label: "Feels like",
    borderColor: "#2880c3" /* line color */,
    pointBorderColor: "#0068b8" /* point color */,
    pointBorderWidth: 4,
    borderWidth: 4,
    pointHoverBorderWidth: 8,
    data: [],
    lineTension: 0.45
  }]
};
var chartOptions = {
  scales: {
    x: {
      /* make x scale limited in size */
      min: 0,
      max: 6,
      ticks: {
        font: {
          weight: "600"
        }
      }
    },
    y: {
      min: 0,
      max: 30,
      ticks: {
        stepSize: 5,
        font: {
          weight: "600"
        }
      }
    }
  },
  layout: {
    padding: 10
  },
  plugins: {
    zoom: {
      /* plugin for making chart "scrollable", meaning you can pan it */
      pan: {
        enabled: true,
        mode: "x"
      }
    },
    tooltip: {
      /* tooltip sytling */
      titleFont: {
        weight: "700",
        size: 12
      },
      bodyFont: {
        weight: "600",
        size: 15
      },
      displayColors: false,
      bodyFontSize: 20,
      callbacks: {
        label: function label(context) {
          return context.dataset.data[context.dataIndex] + "°";
        }
      }
    },
    legend: {
      labels: {
        font: {
          family: "'Ubuntu', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          size: 12
        }
      }
    }
  },
  responsive: deviceIsMobile()
};
function initChart() {
  /* hide chart and create it's default options
  whenever we want to load a new one, we just change
  the settings and data that we need and update the chart*/
  window.tempChart = new chart_js_auto__WEBPACK_IMPORTED_MODULE_1__["default"](chartElement, {
    type: "line",
    data: weatherData,
    options: chartOptions
  });
  chart_js_auto__WEBPACK_IMPORTED_MODULE_1__["default"].register(chartjs_plugin_zoom__WEBPACK_IMPORTED_MODULE_2__["default"]);
  chartElement.style.display = "none";
  /* 
      -> tempChart
         -> config
            -> _config
               -> data
                  -> datasets
                  -> labels
               -> options
                  -> plugins
                  -> scales
                  -> layout
  */
}

function roundToMultipleOf5(number) {
  return Math.floor(number / 5) * 5;
}
function loadChart(tempsByHour, feelsLikeByHour) {
  var startingHour = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var showInCelsius = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
  /* define the data and options we update */
  var data = tempChart.config._config.data;
  var options = tempChart.config._config.options;
  /* if no data is found hide chart and abort*/
  if (tempsByHour === undefined || !tempsByHour.length || !feelsLikeByHour.length) {
    chartElement.style.display = "none";
    return;
  }
  /* get line and point color for the chart from body css variables */
  var body = document.querySelector("body");
  var chartLineColor1 = getComputedStyle(body).getPropertyValue("--chart-line-color1");
  var chartPointColor1 = getComputedStyle(body).getPropertyValue("--chart-point-color1");
  var chartLineColor2 = getComputedStyle(body).getPropertyValue("--chart-line-color2");
  var chartPointColor2 = getComputedStyle(body).getPropertyValue("--chart-point-color2");
  /* set labels */
  if (showInCelsius) {
    data.datasets[0].label = "Temperature (°C)";
    data.datasets[1].label = "Feels like (°C)";
    options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.data[context.dataIndex] + "°C";
    };
  } else {
    data.datasets[0].label = "Temperature (°F)";
    data.datasets[1].label = "Feels like (°F)";
    options.plugins.tooltip.callbacks.label = function (context) {
      return context.dataset.data[context.dataIndex] + "°F";
    };
  }
  /* set weather data and chart colors */
  data.datasets[0].data = tempsByHour;
  data.datasets[0].borderColor = chartLineColor1;
  data.datasets[0].pointBorderColor = chartPointColor1;
  data.datasets[1].data = feelsLikeByHour;
  data.datasets[1].borderColor = chartLineColor2;
  data.datasets[1].pointBorderColor = chartPointColor2;

  /* set x and y axis min and max */
  var numberOfHoursDisplayed = 6;
  if (startingHour < 19) {
    options.scales.x.min = startingHour;
    options.scales.x.max = startingHour + numberOfHoursDisplayed - 1;
  } else {
    options.scales.x.min = 23 - numberOfHoursDisplayed;
    options.scales.x.max = 23;
  }
  options.scales.y.min = roundToMultipleOf5(Math.min.apply(Math, tempsByHour.concat(feelsLikeByHour)) - 5);
  options.scales.y.max = roundToMultipleOf5(Math.max.apply(Math, tempsByHour.concat(feelsLikeByHour)) + 5);
  /* show chart */
  tempChart.update("none");
  chartElement.style.display = "block";
}
initChart();

/***/ }),

/***/ "./src/data-load.js":
/*!**************************!*\
  !*** ./src/data-load.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadData: () => (/* binding */ loadData),
/* harmony export */   storeData: () => (/* binding */ storeData)
/* harmony export */ });
/* harmony import */ var _chart_init__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chart-init */ "./src/chart-init.js");
/* harmony import */ var _assets_images_cloud_question_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/images/cloud-question.svg */ "./src/assets/images/cloud-question.svg");
/* uses data from weather api and loads it into the DOM */


var lastData, lastDayLoaded;
function temperatureSystemIsInCelsius() {
  /* returns true if temperatures should be
     shown in celsius, false for farenheit */
  var metricRadioButton = document.querySelector(".metric-imperial-toggle .metric input");
  return metricRadioButton.checked;
}
function loadGeneralInfo(data, showInCelsius) {
  var temperatureElement = document.querySelector(".general-info .temperature-info");
  var weatherInfoElement = document.querySelector(".general-info .weather-info");
  var feelslikeTemperature = Math.round(data.current[showInCelsius ? "feelslike_c" : "feelslike_f"]);
  temperatureElement.textContent = "".concat(feelslikeTemperature, "\xB0");
  weatherInfoElement.textContent = data.current.condition.text;
}
function loadLocation(data) {
  var locationElement = document.querySelector(".location");
  locationElement.textContent = data.location.name;
}
function loadSpecificDayForecast(dayElement, temperatureText, weatherIconURL, weatherIconAlt) {
  /* dayElement should be either the element for today, tomorrow or overmorrow */
  var dayTemperature = dayElement.querySelector(".temperature");
  var dayWeatherIcon = dayElement.querySelector("img.weather-icon");
  dayTemperature.textContent = temperatureText;
  dayWeatherIcon.src = weatherIconURL;
  dayWeatherIcon.alt = weatherIconAlt;
}
function loadAllDaysForecast(data, showInCelsius) {
  var todayElement = document.querySelector(".three-day-forecast .today");
  var tomorrowElement = document.querySelector(".three-day-forecast .tomorrow");
  var overmorrowElement = document.querySelector(".three-day-forecast .overmorrow");
  var days = data.forecast.forecastday;
  days.forEach(function (forecastday, index) {
    var element;
    switch (index) {
      case 0:
        element = todayElement;
        break;
      case 1:
        element = tomorrowElement;
        break;
      case 2:
        element = overmorrowElement;
        break;
      default:
        throw new Error("More than 3 days forecast?");
    }
    var temperature;
    if (showInCelsius) temperature = forecastday.day.avgtemp_c;else temperature = forecastday.day.avgtemp_f;
    var temperatureText = "".concat(temperature, "\xB0").concat(showInCelsius ? "C" : "F");
    var weatherIconURL = "https:".concat(forecastday.day.condition.icon);
    /* for some reason the api does not 
    include the https: so we add it manually */
    var weatherIconAlt = forecastday.day.condition.text;
    loadSpecificDayForecast(element, temperatureText, weatherIconURL, weatherIconAlt);
  });
}
function loadAllHoursForecast(data, dayIndex, showInCelsius) {
  /* hours data is the hours branch of the specific 
    day the user is asking for(today by default) */
  var hoursData = data.forecast.forecastday[dayIndex].hour;
  var hourlyForecast = document.querySelector(".hourly-forecast");
  hoursData.forEach(function (hour, index) {
    var hourElement = hourlyForecast.querySelector(".hour-".concat(index));
    var temperatureElement = hourElement.querySelector(".temperature");
    var weatherIcon = hourElement.querySelector(".weather-icon");
    temperatureElement.textContent = "".concat(showInCelsius ? hour.temp_c : hour.temp_f, "\xB0").concat(showInCelsius ? "C" : "F");
    weatherIcon.src = "https:".concat(hour.condition.icon);
    weatherIcon.alt = hour.condition.text;
  });
}
function scrollToHour(hour) {
  var hourlyForecast = document.querySelector(".hourly-forecast");
  hourlyForecast.scrollTo({
    top: 0,
    left: hour * 75
  });
}
function loadUnknownLocation(showInCelsius) {
  /* declarations for all data elements in the DOM */
  var generalInfoTemperatureElement = document.querySelector(".general-info .temperature-info");
  var generalInfoWeatherInfoElement = document.querySelector(".general-info .weather-info");
  var locationElement = document.querySelector(".location");
  var todayElement = document.querySelector(".three-day-forecast .today");
  var todayTemperatureElement = todayElement.querySelector(".temperature");
  var todayWeatherIconElement = todayElement.querySelector(".weather-icon");
  var tomorrowElement = document.querySelector(".three-day-forecast .tomorrow");
  var tomorrowTemperatureElement = tomorrowElement.querySelector(".temperature");
  var tomorrowWeatherIconElement = tomorrowElement.querySelector(".weather-icon");
  var overmorrowElement = document.querySelector(".three-day-forecast .overmorrow");
  var overmorrowTemperatureElement = overmorrowElement.querySelector(".temperature");
  var overmorrowWeatherIconElement = overmorrowElement.querySelector(".weather-icon");
  var hoursElements = document.querySelectorAll(".hourly-forecast .hour");
  var usefulInfoCardElements = document.querySelectorAll(".useful-info .card");

  /* actually changing the data elements in the DOM */
  generalInfoTemperatureElement.textContent = "...°";
  generalInfoWeatherInfoElement.textContent = "Unknown";
  locationElement.textContent = "unknown location";
  todayTemperatureElement.textContent = "?\xB0".concat(showInCelsius ? "C" : "F");
  todayWeatherIconElement.src = _assets_images_cloud_question_svg__WEBPACK_IMPORTED_MODULE_1__;
  todayWeatherIconElement.alt = "unknown weather";
  tomorrowTemperatureElement.textContent = "?\xB0".concat(showInCelsius ? "C" : "F");
  tomorrowWeatherIconElement.src = _assets_images_cloud_question_svg__WEBPACK_IMPORTED_MODULE_1__;
  tomorrowWeatherIconElement.alt = "unknown weather";
  overmorrowTemperatureElement.textContent = "?\xB0".concat(showInCelsius ? "C" : "F");
  overmorrowWeatherIconElement.src = _assets_images_cloud_question_svg__WEBPACK_IMPORTED_MODULE_1__;
  overmorrowWeatherIconElement.alt = "unknown weather";
  (0,_chart_init__WEBPACK_IMPORTED_MODULE_0__.loadChart)();
  hoursElements.forEach(function (hourElement) {
    var hourTemperatureElement = hourElement.querySelector(".temperature");
    var hourWeathherIconElement = hourElement.querySelector(".weather-icon");
    hourTemperatureElement.textContent = "?\xB0".concat(showInCelsius ? "C" : "F");
    hourWeathherIconElement.src = _assets_images_cloud_question_svg__WEBPACK_IMPORTED_MODULE_1__;
    hourWeathherIconElement.alt = "unknown weather";
  });
  usefulInfoCardElements.forEach(function (cardElement) {
    var cardElementInfo = cardElement.querySelector(".info");
    cardElementInfo.textContent = "?";
  });
}
function locationSeededRNG(latitude, longitude, min, max) {
  /* assigns random number for each location 
  between min and max using latitude and longitude */
  max = Math.floor(max);
  min = Math.floor(min);
  var location = Math.abs(latitude * longitude * 10000);
  var x = Math.sin(location) * 10000;
  return Math.abs(Math.floor(x)) % (max - min + 1) + min;
}
function loadColorPreset(colorPresetNumber) {
  var body = document.querySelector("body");
  body.classList.remove("color-preset-1");
  body.classList.remove("color-preset-2");
  body.classList.remove("color-preset-3");
  body.classList.add("color-preset-".concat(colorPresetNumber));
}
function loadUsefulInfo(data, showInCelsius) {
  /* we will assume that if temps are in celsius then 
  the rest of the stuff is also in the metric system*/
  /* declarations for all data elements in the DOM */
  var humidityElementInfo = document.querySelector(".humidity .info");
  var feelsLikeElementInfo = document.querySelector(".feels-like .info");
  var windSpeedElementInfo = document.querySelector(".wind-speed .info");
  var windDirectionElementInfo = document.querySelector(".wind-direction .info");
  var uvIndexElementInfo = document.querySelector(".uv-index .info");
  var cloudCoverElementInfo = document.querySelector(".cloud-cover .info");
  var visibility = document.querySelector(".visibility .info");
  var chanceOfRainElementInfo = document.querySelector(".rain-chance .info");

  /* actually changing the data elements in the DOM */
  humidityElementInfo.textContent = "".concat(data.current.humidity, "%");
  feelsLikeElementInfo.textContent = "".concat(data.current[showInCelsius ? "feelslike_c" : "feelslike_f"], "\xB0").concat(showInCelsius ? "C" : "F");
  windSpeedElementInfo.textContent = "".concat(data.current[showInCelsius ? "wind_kph" : "wind_mph"]).concat(showInCelsius ? "km/h" : "mph");
  windDirectionElementInfo.textContent = data.current.wind_dir;
  var uvIndex = +data.current.uv;
  if (uvIndex <= 2) uvIndexElementInfo.textContent = "Low";else if (uvIndex <= 5) uvIndexElementInfo.textContent = "Moderate";else if (uvIndex <= 7) uvIndexElementInfo.textContent = "High";else if (uvIndex <= 10) uvIndexElementInfo.textContent = "Very high";else uvIndexElementInfo.textContent = "Extreme";
  cloudCoverElementInfo.textContent = "".concat(data.current.cloud, "%");
  visibility.textContent = "".concat(data.current[showInCelsius ? "vis_km" : "vis_miles"]).concat(showInCelsius ? "km" : "miles");
  chanceOfRainElementInfo.textContent = "".concat(data.forecast.forecastday[0].day.daily_chance_of_rain, "%");
}
function loadRealData(data, showInCelsius, chartAndHoursDay) {
  /* chartAndHoursDay represents the day for which 
  the chart and hours tab show the temps:
  0 - today
  1 - tomorrow
  2 - overmorrow 
  */
  var currentHour = chartAndHoursDay === 0 ? +data.current.last_updated.slice(-5, -3) : 0;
  /* for tomorrow and overmorrow, the hours displayed start at 0 */
  var tempsByHour = [],
    feelsLikeByHour = [];
  data.forecast.forecastday[chartAndHoursDay].hour.forEach(function (hour) {
    if (showInCelsius) {
      tempsByHour.push(hour.temp_c);
      feelsLikeByHour.push(hour.feelslike_c);
    } else {
      tempsByHour.push(hour.temp_f);
      feelsLikeByHour.push(hour.feelslike_f);
    }
  });
  loadColorPreset(locationSeededRNG(data.location.lat, data.location.lon, 1, 3));
  loadGeneralInfo(data, showInCelsius);
  loadLocation(data, showInCelsius);
  loadAllDaysForecast(data, showInCelsius);
  (0,_chart_init__WEBPACK_IMPORTED_MODULE_0__.loadChart)(tempsByHour, feelsLikeByHour, currentHour, showInCelsius);
  loadAllHoursForecast(data, chartAndHoursDay, showInCelsius);
  scrollToHour(currentHour);
  loadUsefulInfo(data, showInCelsius);
  lastDayLoaded = chartAndHoursDay;
}
function addDaysListeners() {
  /* adds listeners so that if you click on a specific 
  day it shows the charts and temps for that day */
  var todayElement = document.querySelector(".today"),
    tomorrowElement = document.querySelector(".tomorrow"),
    overmorrowElement = document.querySelector(".overmorrow");
  todayElement.addEventListener("click", function (event) {
    var showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined) loadRealData(lastData, showInCelsius, 0);
  });
  tomorrowElement.addEventListener("click", function (event) {
    var showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined) loadRealData(lastData, showInCelsius, 1);
  });
  overmorrowElement.addEventListener("click", function (event) {
    var showInCelsius = temperatureSystemIsInCelsius();
    if (typeof lastData !== "undefined" && lastData.error === undefined) loadRealData(lastData, showInCelsius, 2);
  });
}
function addMetricImperialToggleListeners() {
  /* declare metric and imperial DOM elements */
  var metricLabel = document.querySelector(".metric-imperial-toggle .metric");
  var metricRadioButton = metricLabel.querySelector("input");
  var imperialLabel = document.querySelector(".metric-imperial-toggle .imperial");
  var imperialRadioButton = imperialLabel.querySelector("input");

  /* add listeners for them that add or remove class 
  checked to the label and reload the data with the 
  other measurement system on change */
  metricRadioButton.addEventListener("change", function () {
    if (metricRadioButton.checked) {
      imperialLabel.classList.remove("checked");
      metricLabel.classList.add("checked");
      if (typeof lastData !== "undefined" && lastData.error === undefined) loadRealData(lastData, true, lastDayLoaded);
    }
  });
  imperialRadioButton.addEventListener("change", function () {
    if (imperialRadioButton.checked) {
      metricLabel.classList.remove("checked");
      imperialLabel.classList.add("checked");
      if (typeof lastData !== "undefined" && lastData.error === undefined) loadRealData(lastData, false, lastDayLoaded);
    }
  });
}
function loadData(data) {
  var showInCelsius = temperatureSystemIsInCelsius();
  if (typeof data.error !== "undefined") {
    if (data.error.code === 1006) /* location not found error code */
      loadUnknownLocation(showInCelsius);else if (data.error.code) /* unknown error */
      throw new Error("Odd weather api error");
  } else loadRealData(data, showInCelsius, 0);
  lastData = data;
}
function storeData() {
  return {
    lastData: lastData,
    showInCelsius: temperatureSystemIsInCelsius()
  };
}
addDaysListeners();
addMetricImperialToggleListeners();

/***/ }),

/***/ "./src/data-storage.js":
/*!*****************************!*\
  !*** ./src/data-storage.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addLocalStorage: () => (/* binding */ addLocalStorage)
/* harmony export */ });
/* harmony import */ var _data_load__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data-load */ "./src/data-load.js");

function storeAllData() {
  var allData = (0,_data_load__WEBPACK_IMPORTED_MODULE_0__.storeData)();
  localStorage.setItem("lastData", JSON.stringify(allData.lastData));
  localStorage.setItem("showInCelsius", allData.showInCelsius);
}
function loadAllData() {
  var lastData = JSON.parse(localStorage.getItem("lastData")),
    showInCelsius = localStorage.getItem("showInCelsius");
  if (showInCelsius === "false") {
    /* the toggle itself is remembered but the .checked class isn't */
    var metricLabel = document.querySelector(".metric-imperial-toggle label.metric");
    console.log(1);
    var imperialLabel = document.querySelector(".metric-imperial-toggle label.imperial");
    metricLabel.classList.remove("checked");
    imperialLabel.classList.add("checked");
  }
  if (typeof lastData !== "undefined") setTimeout(function () {
    (0,_data_load__WEBPACK_IMPORTED_MODULE_0__.loadData)(lastData, 0);
  }, 10); /* for some reason sometimes chart does not load unless i do this */
}

function addLocalStorage() {
  window.addEventListener("beforeunload", storeAllData);
  window.addEventListener("load", loadAllData);
}

/***/ }),

/***/ "./src/search.js":
/*!***********************!*\
  !*** ./src/search.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addSearchListeners: () => (/* binding */ addSearchListeners)
/* harmony export */ });
/* harmony import */ var _data_load__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./data-load */ "./src/data-load.js");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var searchInput = document.querySelector("input.search");
var searchIcon = document.querySelector(".search-bar .search-icon");
function search(_x) {
  return _search.apply(this, arguments);
}
function _search() {
  _search = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(value) {
    var response, data;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return fetch("https://api.weatherapi.com/v1/forecast.json?key=79d8d8857bb04a6ca2c170633231207&q=".concat(value, "&days=3"));
        case 2:
          response = _context.sent;
          _context.next = 5;
          return response.json();
        case 5:
          data = _context.sent;
          (0,_data_load__WEBPACK_IMPORTED_MODULE_0__.loadData)(data);
        case 7:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _search.apply(this, arguments);
}
function addSearchListeners() {
  searchInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter" && searchInput.value !== "") search(searchInput.value);
  });
  searchIcon.addEventListener("click", function (event) {
    if (searchInput.value !== "") search(searchInput.value);
  });
}

/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/style.scss":
/*!************************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/style.scss ***!
  \************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/images/backgrounds/red.jpg */ "./src/assets/images/backgrounds/red.jpg"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_1___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/images/backgrounds/blue.jpg */ "./src/assets/images/backgrounds/blue.jpg"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_2___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/images/backgrounds/green.jpg */ "./src/assets/images/backgrounds/green.jpg"), __webpack_require__.b);
var ___CSS_LOADER_URL_IMPORT_3___ = new URL(/* asset import */ __webpack_require__(/*! ../assets/images/wave.svg */ "./src/assets/images/wave.svg"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
var ___CSS_LOADER_URL_REPLACEMENT_1___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_1___);
var ___CSS_LOADER_URL_REPLACEMENT_2___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_2___);
var ___CSS_LOADER_URL_REPLACEMENT_3___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_3___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, "body {\n  margin: 0;\n  padding: 0;\n  color: #212529; /* new black */\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n  --chart-line-color1: #c32860;\n  --chart-point-color1: #b80043;\n  --chart-line-color2: #2880c3;\n  --chart-point-color2: #0068b8;\n}\nbody.color-preset-1 {\n  --background-src: url(" + ___CSS_LOADER_URL_REPLACEMENT_0___ + ");\n  --location-color: #7e1234;\n  --hourly-forecast-background: #7e12341a;\n}\nbody.color-preset-2 {\n  --background-src: url(" + ___CSS_LOADER_URL_REPLACEMENT_1___ + ");\n  --location-color: hsl(240, 75%, 28%);\n  --hourly-forecast-background: #005e9921;\n}\nbody.color-preset-3 {\n  --background-src: url(" + ___CSS_LOADER_URL_REPLACEMENT_2___ + ");\n  --location-color: hsl(157, 80%, 20%);\n  --hourly-forecast-background: #05990021;\n}\n\ninput {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\n\nh1 {\n  font-size: clamp(2vw, 1.5rem, 12vw);\n  font-weight: 600;\n}\n\n.background {\n  position: fixed;\n  width: 100vw;\n  height: 100vh;\n  top: 0;\n  left: 0;\n  background-image: var(--background-src);\n  background-position: bottom;\n  background-repeat: no-repeat;\n  background-size: cover;\n  z-index: -2;\n}\n\n.general-info {\n  position: fixed;\n  top: min(150px, 20vh);\n  z-index: -1;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0px;\n  width: 100vw;\n  color: #e0e0e0;\n}\n.general-info .temperature-info {\n  font-size: 5rem;\n  font-weight: 300;\n  letter-spacing: -2px;\n  /* this before is added to center the number \n  without taking the degree symbol into account */\n  margin-left: 23px;\n}\n.general-info .weather-info {\n  font-size: 1.4rem;\n  font-weight: normal;\n  text-align: center;\n}\n.general-info .search-bar {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: 10px;\n  width: min(70vw, 200px);\n  height: 25px;\n  margin-top: 30px;\n  padding: 2px 10px 2px 10px;\n  border-radius: 12px;\n  border: 3px solid #f3f4f5;\n  outline: none;\n  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);\n  background-color: rgba(255, 255, 255, 0.5);\n  transition: all 0.1s ease-out;\n}\n.general-info .search-bar:hover, .general-info .search-bar:focus-within {\n  background-color: #f3f3f3;\n}\n.general-info .search-bar .search {\n  box-sizing: border-box;\n  background-color: transparent;\n  border: none;\n  outline: none;\n  height: 90%;\n  width: 50%;\n  flex: 1;\n}\n.general-info .search-bar .search-icon {\n  height: 17px;\n  color: #212529;\n}\n\n.scroll-content {\n  background-color: transparent;\n  margin-top: calc(100vh - 200px);\n}\n.scroll-content .waves {\n  height: 100px;\n  background-image: url(" + ___CSS_LOADER_URL_REPLACEMENT_3___ + ");\n  background-size: cover;\n}\n\n.extra-info {\n  background-color: #f3f4f5;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n}\n.extra-info .location {\n  margin-bottom: 20px;\n  text-transform: capitalize;\n  text-align: center;\n  font-size: min(2.5rem, 15vw);\n  font-weight: normal;\n  letter-spacing: 1px;\n  color: var(--location-color);\n  opacity: 0.8;\n}\n\n.three-day-forecast {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  width: 100vw;\n  margin-top: 20px;\n  margin-bottom: 10px;\n}\n.three-day-forecast .day {\n  box-sizing: border-box;\n  padding: 0px 20px 0px 20px;\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  gap: min(15px, 4vw);\n  font-size: clamp(3vw, 1.2rem, 8vw);\n  font-weight: 600;\n}\n.three-day-forecast .day .day-text {\n  margin-right: auto;\n}\n.three-day-forecast .day .weather-icon {\n  height: 2.5rem;\n}\n\n.hourly-forecast-container {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n}\n\n.hourly-forecast {\n  overflow: scroll;\n  box-sizing: border-box;\n  margin-top: 10px;\n  padding: 20px;\n  border-radius: 20px;\n  display: flex;\n  flex-direction: row;\n  gap: 30px;\n  font-weight: 600;\n  background-color: var(--hourly-forecast-background);\n}\n.hourly-forecast .hour {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 10px;\n  width: min(45px, 20vw);\n  flex: 0 0 auto;\n}\n.hourly-forecast .weather-icon {\n  height: 2.5rem;\n}\n\n.useful-info {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n}\n.useful-info .cards-container {\n  width: 100%;\n  border-radius: 20px;\n  background-color: rgba(33, 37, 41, 0.1);\n  display: flex;\n  flex-direction: row;\n  flex-wrap: wrap;\n  justify-content: center;\n  overflow: hidden;\n}\n.useful-info .cards-container .card {\n  box-sizing: border-box;\n  width: clamp(70px, 20vw, 100px);\n  padding: 10px;\n  border: 1px solid white;\n  aspect-ratio: 2/3;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: space-evenly;\n  flex: 1 1 0;\n  font-size: clamp(2.5vw, 0.8rem, 10vw);\n}\n.useful-info .cards-container .card .icon {\n  height: 30%;\n}\n.useful-info .cards-container .card .description {\n  text-align: center;\n  font-weight: 600;\n}\n.useful-info .cards-container .card .info {\n  font-weight: 500;\n}\n\n.metric-imperial-toggle {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n}\n.metric-imperial-toggle .checkbox-container {\n  width: 100%;\n  display: flex;\n  flex-direction: row;\n  gap: 40px;\n}\n.metric-imperial-toggle .checkbox-container label {\n  background-color: #f1f1f1;\n  box-sizing: border-box;\n  width: 150px;\n  height: 50px;\n  padding: 10px;\n  display: flex;\n  align-items: center;\n  flex-direction: row;\n  gap: 10px;\n  transition: box-shadow 0.2s ease-out;\n  border: 1px solid rgba(33, 37, 41, 0.2235294118);\n  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);\n}\n.metric-imperial-toggle .checkbox-container label:hover {\n  box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.2);\n  cursor: pointer;\n}\n.metric-imperial-toggle .checkbox-container label.checked {\n  border: 1px solid #212529;\n}\n\n@media (max-width: 180px) or ((min-width: 450px) and (max-width: 650px)) {\n  .useful-info .cards-container {\n    flex-wrap: nowrap;\n    justify-content: start;\n    overflow: scroll;\n  }\n}\n@media (max-width: 250px) {\n  .three-day-forecast .day .weather-icon {\n    display: none;\n  }\n}\n@media (max-width: 350px) {\n  canvas#temperature-chart {\n    display: none !important;\n  }\n}\n@media (min-width: 650px) {\n  h1 {\n    margin-top: 5px;\n  }\n  .general-info {\n    top: 50px;\n  }\n  .general-info .temperature-info {\n    font-size: 7rem;\n  }\n  .general-info .weather-info {\n    font-size: 1.6rem;\n  }\n  .general-info .search-bar {\n    width: 300px;\n    height: 30px;\n  }\n  .general-info input {\n    font-size: 1rem;\n  }\n  .scroll-content {\n    margin-top: 300px;\n  }\n  .scroll-content .waves {\n    display: none;\n  }\n  .extra-info {\n    background-color: transparent;\n    display: grid;\n    box-sizing: border-box;\n    width: 100vw;\n    height: calc(100vh - 300px);\n    padding: 20px;\n    grid-template-columns: 1fr 1fr 1fr 1fr;\n    grid-template-rows: 1fr 1fr 1fr 1fr;\n    gap: 20px;\n    grid-template-areas: \"location location chart chart chart\" \"daily daily chart chart chart\" \"info info hourly hourly hourly\" \"info info toggle toggle toggle\";\n  }\n  .extra-info > * {\n    box-sizing: border-box !important;\n    width: 100% !important;\n    height: 100% !important;\n    border-radius: 20px !important;\n    margin: 0 !important;\n    opacity: 1 !important;\n    background-color: rgba(255, 255, 255, 0.8) !important;\n  }\n  .extra-info .location {\n    grid-area: location;\n    padding: 20px 30px 20px 30px;\n    border-radius: 20px;\n    color: var(--location-color);\n    font-size: clamp(2rem, 2.5vw, 2.5rem);\n    display: grid;\n    place-items: center center;\n  }\n  .extra-info .three-day-forecast {\n    grid-area: daily;\n    padding: 20px 10px 20px 10px;\n    color: #212529;\n    justify-content: space-evenly;\n  }\n  .extra-info .three-day-forecast .day {\n    gap: max(10px, 1.2vw);\n    font-size: min(3vw, 1.9rem);\n    font-weight: 500;\n  }\n  .extra-info #temperature-chart {\n    grid-area: chart;\n  }\n  .extra-info .hourly-forecast-container {\n    grid-area: hourly;\n  }\n  .extra-info .useful-info {\n    grid-area: info;\n    display: flex;\n    flex-direction: column;\n  }\n  .extra-info .useful-info h1 {\n    flex: 1 1 auto;\n  }\n  .extra-info .useful-info .cards-container {\n    display: grid;\n    flex: 1 1 auto;\n    grid-template-rows: 1fr 1fr;\n    grid-template-columns: 1fr 1fr 1fr 1fr;\n    place-items: stretch;\n    background-color: rgba(33, 37, 41, 0);\n    border: 1px solid white;\n    box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.2);\n  }\n  .extra-info .useful-info .cards-container .card {\n    overflow: hidden;\n    box-sizing: border-box;\n    font-size: 1rem;\n    width: 100%;\n    height: 100%;\n    aspect-ratio: auto;\n  }\n  .extra-info .useful-info .cards-container .card .description {\n    font-size: min(1.9vw, 1rem);\n  }\n  .extra-info .useful-info .cards-container .card .info {\n    font-size: min(1.9vw, 1rem);\n  }\n  .extra-info .metric-imperial-toggle {\n    grid-area: toggle;\n    display: grid;\n    place-items: center left;\n  }\n  .extra-info .metric-imperial-toggle h1 {\n    margin-bottom: 20px;\n  }\n  .extra-info .metric-imperial-toggle .checkbox-container {\n    width: min(100%, 500px);\n    height: 70px;\n    gap: 30px;\n    overflow: hidden;\n  }\n  .extra-info .metric-imperial-toggle label {\n    flex: 1 1 0;\n    height: 60px;\n    font-size: 1.1rem;\n  }\n  .extra-info .metric-imperial-toggle label.checked {\n    border: 2px solid #212529;\n  }\n}", "",{"version":3,"sources":["webpack://./src/styles/style.scss"],"names":[],"mappings":"AAAA;EACE,SAAA;EACA,UAAA;EACA,cAAA,EAAA,cAAA;EAEA,mJAAA;EAEA,4BAAA;EACA,6BAAA;EACA,4BAAA;EACA,6BAAA;AADF;AAEE;EACE,yDAAA;EAKA,yBAAA;EACA,uCAAA;AAJJ;AAME;EACE,yDAAA;EACA,oCAAA;EACA,uCAAA;AAJJ;AAME;EACE,yDAAA;EACA,oCAAA;EACA,uCAAA;AAJJ;;AAOA;EACE,mJAAA;AAJF;;AAOA;EACE,mCAAA;EACA,gBAAA;AAJF;;AAMA;EACE,eAAA;EACA,YAAA;EACA,aAAA;EACA,MAAA;EACA,OAAA;EAEA,uCAAA;EACA,2BAAA;EACA,4BAAA;EACA,sBAAA;EAEA,WAAA;AALF;;AAOA;EACE,eAAA;EACA,qBAAA;EACA,WAAA;EAEA,aAAA;EACA,sBAAA;EACA,mBAAA;EACA,QAAA;EAEA,YAAA;EAEA,cAAA;AAPF;AASE;EACE,eAAA;EACA,gBAAA;EACA,oBAAA;EACA;iDAAA;EAEA,iBAAA;AAPJ;AASE;EACE,iBAAA;EACA,mBAAA;EACA,kBAAA;AAPJ;AASE;EACE,aAAA;EACA,mBAAA;EACA,mBAAA;EACA,SAAA;EAEA,uBAAA;EACA,YAAA;EACA,gBAAA;EACA,0BAAA;EAEA,mBAAA;EACA,yBAAA;EACA,aAAA;EACA,mFAAA;EAEA,0CAAA;EACA,6BAAA;AAVJ;AAWI;EAEE,yBAAA;AAVN;AAYI;EACE,sBAAA;EACA,6BAAA;EACA,YAAA;EACA,aAAA;EACA,WAAA;EACA,UAAA;EACA,OAAA;AAVN;AAYI;EACE,YAAA;EACA,cAAA;AAVN;;AAcA;EACE,6BAAA;EACA,+BAAA;AAXF;AAYE;EACE,aAAA;EACA,yDAAA;EACA,sBAAA;AAVJ;;AAaA;EACE,yBAAA;EACA,aAAA;EACA,sBAAA;EACA,mBAAA;AAVF;AAYE;EACE,mBAAA;EAEA,0BAAA;EACA,kBAAA;EACA,4BAAA;EACA,mBAAA;EACA,mBAAA;EAEA,4BAAA;EACA,YAAA;AAZJ;;AAeA;EACE,aAAA;EACA,sBAAA;EACA,SAAA;EAEA,YAAA;EACA,gBAAA;EACA,mBAAA;AAbF;AAcE;EACE,sBAAA;EACA,0BAAA;EAEA,aAAA;EACA,mBAAA;EACA,mBAAA;EACA,mBAAA;EAEA,kCAAA;EACA,gBAAA;AAdJ;AAeI;EACE,kBAAA;AAbN;AAeI;EACE,cAAA;AAbN;;AAiBA;EACE,sBAAA;EACA,YAAA;EACA,aAAA;AAdF;;AAgBA;EACE,gBAAA;EACA,sBAAA;EACA,gBAAA;EACA,aAAA;EACA,mBAAA;EACA,aAAA;EACA,mBAAA;EACA,SAAA;EACA,gBAAA;EAEA,mDAAA;AAdF;AAeE;EACE,aAAA;EACA,sBAAA;EACA,mBAAA;EACA,SAAA;EACA,sBAAA;EACA,cAAA;AAbJ;AAeE;EACE,cAAA;AAbJ;;AAgBA;EACE,sBAAA;EACA,YAAA;EACA,aAAA;AAbF;AAcE;EACE,WAAA;EACA,mBAAA;EACA,uCAAA;EAEA,aAAA;EACA,mBAAA;EACA,eAAA;EACA,uBAAA;EACA,gBAAA;AAbJ;AAeI;EACE,sBAAA;EACA,+BAAA;EACA,aAAA;EACA,uBAAA;EACA,iBAAA;EAEA,aAAA;EACA,sBAAA;EACA,mBAAA;EACA,6BAAA;EACA,WAAA;EACA,qCAAA;AAdN;AAeM;EACE,WAAA;AAbR;AAeM;EACE,kBAAA;EACA,gBAAA;AAbR;AAeM;EACE,gBAAA;AAbR;;AAkBA;EACE,sBAAA;EACA,YAAA;EACA,aAAA;AAfF;AAgBE;EACE,WAAA;EACA,aAAA;EACA,mBAAA;EACA,SAAA;AAdJ;AAeI;EACE,yBAAA;EACA,sBAAA;EACA,YAAA;EACA,YAAA;EACA,aAAA;EACA,aAAA;EACA,mBAAA;EACA,mBAAA;EACA,SAAA;EAEA,oCAAA;EAEA,gDAAA;EACA,0CAAA;AAfN;AAgBM;EACE,2CAAA;EACA,eAAA;AAdR;AAgBM;EACE,yBAAA;AAdR;;AAmBA;EACE;IACE,iBAAA;IACA,sBAAA;IACA,gBAAA;EAhBF;AACF;AAkBA;EACE;IACE,aAAA;EAhBF;AACF;AAkBA;EACE;IACE,wBAAA;EAhBF;AACF;AAkBA;EACE;IACE,eAAA;EAhBF;EAkBA;IACE,SAAA;EAhBF;EAiBE;IACE,eAAA;EAfJ;EAiBE;IACE,iBAAA;EAfJ;EAiBE;IACE,YAAA;IACA,YAAA;EAfJ;EAiBE;IACE,eAAA;EAfJ;EAkBA;IACE,iBAAA;EAhBF;EAiBE;IACE,aAAA;EAfJ;EAkBA;IACE,6BAAA;IACA,aAAA;IACA,sBAAA;IACA,YAAA;IACA,2BAAA;IACA,aAAA;IACA,sCAAA;IACA,mCAAA;IACA,SAAA;IACA,4JACE;EAjBJ;EAqBE;IACE,iCAAA;IACA,sBAAA;IACA,uBAAA;IACA,8BAAA;IACA,oBAAA;IACA,qBAAA;IACA,qDAAA;EAnBJ;EAqBE;IACE,mBAAA;IACA,4BAAA;IACA,mBAAA;IACA,4BAAA;IACA,qCAAA;IACA,aAAA;IACA,0BAAA;EAnBJ;EAqBE;IACE,gBAAA;IACA,4BAAA;IACA,cAAA;IACA,6BAAA;EAnBJ;EAoBI;IACE,qBAAA;IACA,2BAAA;IACA,gBAAA;EAlBN;EAqBE;IACE,gBAAA;EAnBJ;EAqBE;IACE,iBAAA;EAnBJ;EAqBE;IACE,eAAA;IACA,aAAA;IACA,sBAAA;EAnBJ;EAoBI;IACE,cAAA;EAlBN;EAoBI;IACE,aAAA;IACA,cAAA;IACA,2BAAA;IACA,sCAAA;IACA,oBAAA;IACA,qCAAA;IACA,uBAAA;IACA,2CAAA;EAlBN;EAmBM;IACE,gBAAA;IACA,sBAAA;IACA,eAAA;IACA,WAAA;IACA,YAAA;IACA,kBAAA;EAjBR;EAkBQ;IACE,2BAAA;EAhBV;EAkBQ;IACE,2BAAA;EAhBV;EAqBE;IACE,iBAAA;IACA,aAAA;IACA,wBAAA;EAnBJ;EAoBI;IACE,mBAAA;EAlBN;EAoBI;IACE,uBAAA;IACA,YAAA;IACA,SAAA;IACA,gBAAA;EAlBN;EAoBI;IACE,WAAA;IACA,YAAA;IACA,iBAAA;EAlBN;EAmBM;IACE,yBAAA;EAjBR;AACF","sourcesContent":["body {\n  margin: 0;\n  padding: 0;\n  color: #212529; /* new black */\n\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto,\n    Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n  --chart-line-color1: #c32860;\n  --chart-point-color1: #b80043;\n  --chart-line-color2: #2880c3;\n  --chart-point-color2: #0068b8;\n  &.color-preset-1 {\n    --background-src: url(../assets/images/backgrounds/red.jpg);\n    // --color1: #291129;\n    // --color2: #2f1524;\n    // --color3: #7e1234;\n    // --color4: #a01c35;\n    --location-color: #7e1234;\n    --hourly-forecast-background: #7e12341a;\n  }\n  &.color-preset-2 {\n    --background-src: url(../assets/images/backgrounds/blue.jpg);\n    --location-color: hsl(240, 75%, 28%);\n    --hourly-forecast-background: #005e9921;\n  }\n  &.color-preset-3 {\n    --background-src: url(../assets/images/backgrounds/green.jpg);\n    --location-color: hsl(157, 80%, 20%);\n    --hourly-forecast-background: #05990021;\n  }\n}\ninput {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto,\n    Oxygen, Ubuntu, Cantarell, \"Open Sans\", \"Helvetica Neue\", sans-serif;\n}\nh1 {\n  font-size: clamp(2vw, 1.5rem, 12vw);\n  font-weight: 600;\n}\n.background {\n  position: fixed;\n  width: 100vw;\n  height: 100vh;\n  top: 0;\n  left: 0;\n\n  background-image: var(--background-src);\n  background-position: bottom;\n  background-repeat: no-repeat;\n  background-size: cover;\n\n  z-index: -2;\n}\n.general-info {\n  position: fixed;\n  top: min(150px, 20vh);\n  z-index: -1;\n\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 0px;\n\n  width: 100vw;\n\n  color: #e0e0e0;\n\n  .temperature-info {\n    font-size: 5rem;\n    font-weight: 300;\n    letter-spacing: -2px;\n    /* this before is added to center the number \n    without taking the degree symbol into account */\n    margin-left: 23px;\n  }\n  .weather-info {\n    font-size: 1.4rem;\n    font-weight: normal;\n    text-align: center;\n  }\n  .search-bar {\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    gap: 10px;\n\n    width: min(70vw, 200px);\n    height: 25px;\n    margin-top: 30px;\n    padding: 2px 10px 2px 10px;\n\n    border-radius: 12px;\n    border: 3px solid #f3f4f5;\n    outline: none;\n    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),\n      0 8px 10px -6px rgb(0 0 0 / 0.1);\n    background-color: rgba(255, 255, 255, 0.5);\n    transition: all 0.1s ease-out;\n    &:hover,\n    &:focus-within {\n      background-color: #f3f3f3;\n    }\n    .search {\n      box-sizing: border-box;\n      background-color: transparent;\n      border: none;\n      outline: none;\n      height: 90%;\n      width: 50%;\n      flex: 1;\n    }\n    .search-icon {\n      height: 17px;\n      color: #212529;\n    }\n  }\n}\n.scroll-content {\n  background-color: transparent;\n  margin-top: calc(100vh - 200px);\n  .waves {\n    height: 100px;\n    background-image: url(../assets/images/wave.svg);\n    background-size: cover;\n  }\n}\n.extra-info {\n  background-color: #f3f4f5;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n\n  .location {\n    margin-bottom: 20px;\n\n    text-transform: capitalize;\n    text-align: center;\n    font-size: min(2.5rem, 15vw);\n    font-weight: normal;\n    letter-spacing: 1px;\n\n    color: var(--location-color);\n    opacity: 0.8;\n  }\n}\n.three-day-forecast {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n\n  width: 100vw;\n  margin-top: 20px;\n  margin-bottom: 10px;\n  .day {\n    box-sizing: border-box;\n    padding: 0px 20px 0px 20px;\n\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    gap: min(15px, 4vw);\n\n    font-size: clamp(3vw, 1.2rem, 8vw);\n    font-weight: 600;\n    .day-text {\n      margin-right: auto;\n    }\n    .weather-icon {\n      height: 2.5rem;\n    }\n  }\n}\n.hourly-forecast-container {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n}\n.hourly-forecast {\n  overflow: scroll;\n  box-sizing: border-box;\n  margin-top: 10px;\n  padding: 20px;\n  border-radius: 20px;\n  display: flex;\n  flex-direction: row;\n  gap: 30px;\n  font-weight: 600;\n\n  background-color: var(--hourly-forecast-background);\n  .hour {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    gap: 10px;\n    width: min(45px, 20vw);\n    flex: 0 0 auto;\n  }\n  .weather-icon {\n    height: 2.5rem;\n  }\n}\n.useful-info {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n  .cards-container {\n    width: 100%;\n    border-radius: 20px;\n    background-color: rgba(#212529, 0.1);\n\n    display: flex;\n    flex-direction: row;\n    flex-wrap: wrap;\n    justify-content: center;\n    overflow: hidden;\n\n    .card {\n      box-sizing: border-box;\n      width: clamp(70px, 20vw, 100px);\n      padding: 10px;\n      border: 1px solid white;\n      aspect-ratio: 2/3;\n\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: space-evenly;\n      flex: 1 1 0;\n      font-size: clamp(2.5vw, 0.8rem, 10vw);\n      .icon {\n        height: 30%;\n      }\n      .description {\n        text-align: center;\n        font-weight: 600;\n      }\n      .info {\n        font-weight: 500;\n      }\n    }\n  }\n}\n.metric-imperial-toggle {\n  box-sizing: border-box;\n  width: 100vw;\n  padding: 20px;\n  .checkbox-container {\n    width: 100%;\n    display: flex;\n    flex-direction: row;\n    gap: 40px;\n    label {\n      background-color: #f1f1f1;\n      box-sizing: border-box;\n      width: 150px;\n      height: 50px;\n      padding: 10px;\n      display: flex;\n      align-items: center;\n      flex-direction: row;\n      gap: 10px;\n\n      transition: box-shadow 0.2s ease-out;\n\n      border: 1px solid #21252939;\n      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2);\n      &:hover {\n        box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.2);\n        cursor: pointer;\n      }\n      &.checked {\n        border: 1px solid #212529;\n      }\n    }\n  }\n}\n@media (max-width: 180px) or ((min-width: 450px) and (max-width: 650px)) {\n  .useful-info .cards-container {\n    flex-wrap: nowrap;\n    justify-content: start;\n    overflow: scroll;\n  }\n}\n@media (max-width: 250px) {\n  .three-day-forecast .day .weather-icon {\n    display: none;\n  }\n}\n@media (max-width: 350px) {\n  canvas#temperature-chart {\n    display: none !important ;\n  }\n}\n@media (min-width: 650px) {\n  h1 {\n    margin-top: 5px;\n  }\n  .general-info {\n    top: 50px;\n    .temperature-info {\n      font-size: 7rem;\n    }\n    .weather-info {\n      font-size: 1.6rem;\n    }\n    .search-bar {\n      width: 300px;\n      height: 30px;\n    }\n    input {\n      font-size: 1rem;\n    }\n  }\n  .scroll-content {\n    margin-top: 300px;\n    .waves {\n      display: none;\n    }\n  }\n  .extra-info {\n    background-color: transparent;\n    display: grid;\n    box-sizing: border-box;\n    width: 100vw;\n    height: calc(100vh - 300px);\n    padding: 20px;\n    grid-template-columns: 1fr 1fr 1fr 1fr;\n    grid-template-rows: 1fr 1fr 1fr 1fr;\n    gap: 20px;\n    grid-template-areas:\n      \"location location chart chart chart\"\n      \"daily daily chart chart chart\"\n      \"info info hourly hourly hourly\"\n      \"info info toggle toggle toggle\";\n    & > * {\n      box-sizing: border-box !important;\n      width: 100% !important;\n      height: 100% !important;\n      border-radius: 20px !important;\n      margin: 0 !important;\n      opacity: 1 !important;\n      background-color: rgba(#fff, 0.8) !important;\n    }\n    .location {\n      grid-area: location;\n      padding: 20px 30px 20px 30px;\n      border-radius: 20px;\n      color: var(--location-color);\n      font-size: clamp(2rem, 2.5vw, 2.5rem);\n      display: grid;\n      place-items: center center;\n    }\n    .three-day-forecast {\n      grid-area: daily;\n      padding: 20px 10px 20px 10px;\n      color: #212529;\n      justify-content: space-evenly;\n      .day {\n        gap: max(10px, 1.2vw);\n        font-size: min(3vw, 1.9rem);\n        font-weight: 500;\n      }\n    }\n    #temperature-chart {\n      grid-area: chart;\n    }\n    .hourly-forecast-container {\n      grid-area: hourly;\n    }\n    .useful-info {\n      grid-area: info;\n      display: flex;\n      flex-direction: column;\n      h1 {\n        flex: 1 1 auto;\n      }\n      .cards-container {\n        display: grid;\n        flex: 1 1 auto;\n        grid-template-rows: 1fr 1fr;\n        grid-template-columns: 1fr 1fr 1fr 1fr;\n        place-items: stretch;\n        background-color: rgba(#212529, 0);\n        border: 1px solid white;\n        box-shadow: 0 8px 12px 0 rgba(0, 0, 0, 0.2);\n        .card {\n          overflow: hidden;\n          box-sizing: border-box;\n          font-size: 1rem;\n          width: 100%;\n          height: 100%;\n          aspect-ratio: auto;\n          .description {\n            font-size: min(1.9vw, 1rem);\n          }\n          .info {\n            font-size: min(1.9vw, 1rem);\n          }\n        }\n      }\n    }\n    .metric-imperial-toggle {\n      grid-area: toggle;\n      display: grid;\n      place-items: center left;\n      h1 {\n        margin-bottom: 20px;\n      }\n      .checkbox-container {\n        width: min(100%, 500px);\n        height: 70px;\n        gap: 30px;\n        overflow: hidden;\n      }\n      label {\n        flex: 1 1 0;\n        height: 60px;\n        font-size: 1.1rem;\n        &.checked {\n          border: 2px solid #212529;\n        }\n      }\n    }\n  }\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/styles/style.scss":
/*!*******************************!*\
  !*** ./src/styles/style.scss ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../../node_modules/css-loader/dist/cjs.js!../../node_modules/sass-loader/dist/cjs.js!./style.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/styles/style.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_style_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {

"use strict";


var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";


var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {

"use strict";


/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ "./src/assets/images/backgrounds/blue.jpg":
/*!************************************************!*\
  !*** ./src/assets/images/backgrounds/blue.jpg ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "blue.jpg";

/***/ }),

/***/ "./src/assets/images/backgrounds/green.jpg":
/*!*************************************************!*\
  !*** ./src/assets/images/backgrounds/green.jpg ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "green.jpg";

/***/ }),

/***/ "./src/assets/images/backgrounds/red.jpg":
/*!***********************************************!*\
  !*** ./src/assets/images/backgrounds/red.jpg ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "red.jpg";

/***/ }),

/***/ "./src/assets/images/cloud-question.svg":
/*!**********************************************!*\
  !*** ./src/assets/images/cloud-question.svg ***!
  \**********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "cloud-question.svg";

/***/ }),

/***/ "./src/assets/images/wave.svg":
/*!************************************!*\
  !*** ./src/assets/images/wave.svg ***!
  \************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "wave.svg";

/***/ }),

/***/ "./node_modules/@kurkle/color/dist/color.esm.js":
/*!******************************************************!*\
  !*** ./node_modules/@kurkle/color/dist/color.esm.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Color: () => (/* binding */ Color),
/* harmony export */   b2n: () => (/* binding */ b2n),
/* harmony export */   b2p: () => (/* binding */ b2p),
/* harmony export */   "default": () => (/* binding */ index_esm),
/* harmony export */   hexParse: () => (/* binding */ hexParse),
/* harmony export */   hexString: () => (/* binding */ _hexString),
/* harmony export */   hsl2rgb: () => (/* binding */ hsl2rgb),
/* harmony export */   hslString: () => (/* binding */ _hslString),
/* harmony export */   hsv2rgb: () => (/* binding */ hsv2rgb),
/* harmony export */   hueParse: () => (/* binding */ hueParse),
/* harmony export */   hwb2rgb: () => (/* binding */ hwb2rgb),
/* harmony export */   lim: () => (/* binding */ lim),
/* harmony export */   n2b: () => (/* binding */ n2b),
/* harmony export */   n2p: () => (/* binding */ n2p),
/* harmony export */   nameParse: () => (/* binding */ nameParse),
/* harmony export */   p2b: () => (/* binding */ p2b),
/* harmony export */   rgb2hsl: () => (/* binding */ rgb2hsl),
/* harmony export */   rgbParse: () => (/* binding */ rgbParse),
/* harmony export */   rgbString: () => (/* binding */ _rgbString),
/* harmony export */   rotate: () => (/* binding */ _rotate),
/* harmony export */   round: () => (/* binding */ round)
/* harmony export */ });
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */
function round(v) {
  return v + 0.5 | 0;
}
var lim = function lim(v, l, h) {
  return Math.max(Math.min(v, h), l);
};
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
function b2p(v) {
  return lim(round(v / 2.55), 0, 100);
}
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}
var map$1 = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  a: 10,
  b: 11,
  c: 12,
  d: 13,
  e: 14,
  f: 15
};
var hex = _toConsumableArray('0123456789ABCDEF');
var h1 = function h1(b) {
  return hex[b & 0xF];
};
var h2 = function h2(b) {
  return hex[(b & 0xF0) >> 4] + hex[b & 0xF];
};
var eq = function eq(b) {
  return (b & 0xF0) >> 4 === (b & 0xF);
};
var isShort = function isShort(v) {
  return eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
};
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === '#') {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
var alpha = function alpha(a, f) {
  return a < 255 ? f(a) : '';
};
function _hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v ? '#' + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f) : undefined;
}
var HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
  var a = s * Math.min(l, 1 - l);
  var f = function f(n) {
    var k = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return [f(0), f(8), f(4)];
}
function hsv2rgbn(h, s, v) {
  var f = function f(n) {
    var k = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  };
  return [f(5), f(3), f(1)];
}
function hwb2rgbn(h, w, b) {
  var rgb = hsl2rgbn(h, 1, 0.5);
  var i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
function hueValue(r, g, b, d, max) {
  if (r === max) {
    return (g - b) / d + (g < b ? 6 : 0);
  }
  if (g === max) {
    return (b - r) / d + 2;
  }
  return (r - g) / d + 4;
}
function rgb2hsl(v) {
  var range = 255;
  var r = v.r / range;
  var g = v.g / range;
  var b = v.b / range;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var l = (max + min) / 2;
  var h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r, g, b, d, max);
    h = h * 60 + 0.5;
  }
  return [h | 0, s || 0, l];
}
function calln(f, a, b, c) {
  return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
}
function hsl2rgb(h, s, l) {
  return calln(hsl2rgbn, h, s, l);
}
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
function hsv2rgb(h, s, v) {
  return calln(hsv2rgbn, h, s, v);
}
function hue(h) {
  return (h % 360 + 360) % 360;
}
function hueParse(str) {
  var m = HUE_RE.exec(str);
  var a = 255;
  var v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  var h = hue(+m[2]);
  var p1 = +m[3] / 100;
  var p2 = +m[4] / 100;
  if (m[1] === 'hwb') {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === 'hsv') {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a: a
  };
}
function _rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
function _hslString(v) {
  if (!v) {
    return;
  }
  var a = rgb2hsl(v);
  var h = a[0];
  var s = n2p(a[1]);
  var l = n2p(a[2]);
  return v.a < 255 ? "hsla(".concat(h, ", ").concat(s, "%, ").concat(l, "%, ").concat(b2n(v.a), ")") : "hsl(".concat(h, ", ").concat(s, "%, ").concat(l, "%)");
}
var map = {
  x: 'dark',
  Z: 'light',
  Y: 're',
  X: 'blu',
  W: 'gr',
  V: 'medium',
  U: 'slate',
  A: 'ee',
  T: 'ol',
  S: 'or',
  B: 'ra',
  C: 'lateg',
  D: 'ights',
  R: 'in',
  Q: 'turquois',
  E: 'hi',
  P: 'ro',
  O: 'al',
  N: 'le',
  M: 'de',
  L: 'yello',
  F: 'en',
  K: 'ch',
  G: 'arks',
  H: 'ea',
  I: 'ightg',
  J: 'wh'
};
var names$1 = {
  OiceXe: 'f0f8ff',
  antiquewEte: 'faebd7',
  aqua: 'ffff',
  aquamarRe: '7fffd4',
  azuY: 'f0ffff',
  beige: 'f5f5dc',
  bisque: 'ffe4c4',
  black: '0',
  blanKedOmond: 'ffebcd',
  Xe: 'ff',
  XeviTet: '8a2be2',
  bPwn: 'a52a2a',
  burlywood: 'deb887',
  caMtXe: '5f9ea0',
  KartYuse: '7fff00',
  KocTate: 'd2691e',
  cSO: 'ff7f50',
  cSnflowerXe: '6495ed',
  cSnsilk: 'fff8dc',
  crimson: 'dc143c',
  cyan: 'ffff',
  xXe: '8b',
  xcyan: '8b8b',
  xgTMnPd: 'b8860b',
  xWay: 'a9a9a9',
  xgYF: '6400',
  xgYy: 'a9a9a9',
  xkhaki: 'bdb76b',
  xmagFta: '8b008b',
  xTivegYF: '556b2f',
  xSange: 'ff8c00',
  xScEd: '9932cc',
  xYd: '8b0000',
  xsOmon: 'e9967a',
  xsHgYF: '8fbc8f',
  xUXe: '483d8b',
  xUWay: '2f4f4f',
  xUgYy: '2f4f4f',
  xQe: 'ced1',
  xviTet: '9400d3',
  dAppRk: 'ff1493',
  dApskyXe: 'bfff',
  dimWay: '696969',
  dimgYy: '696969',
  dodgerXe: '1e90ff',
  fiYbrick: 'b22222',
  flSOwEte: 'fffaf0',
  foYstWAn: '228b22',
  fuKsia: 'ff00ff',
  gaRsbSo: 'dcdcdc',
  ghostwEte: 'f8f8ff',
  gTd: 'ffd700',
  gTMnPd: 'daa520',
  Way: '808080',
  gYF: '8000',
  gYFLw: 'adff2f',
  gYy: '808080',
  honeyMw: 'f0fff0',
  hotpRk: 'ff69b4',
  RdianYd: 'cd5c5c',
  Rdigo: '4b0082',
  ivSy: 'fffff0',
  khaki: 'f0e68c',
  lavFMr: 'e6e6fa',
  lavFMrXsh: 'fff0f5',
  lawngYF: '7cfc00',
  NmoncEffon: 'fffacd',
  ZXe: 'add8e6',
  ZcSO: 'f08080',
  Zcyan: 'e0ffff',
  ZgTMnPdLw: 'fafad2',
  ZWay: 'd3d3d3',
  ZgYF: '90ee90',
  ZgYy: 'd3d3d3',
  ZpRk: 'ffb6c1',
  ZsOmon: 'ffa07a',
  ZsHgYF: '20b2aa',
  ZskyXe: '87cefa',
  ZUWay: '778899',
  ZUgYy: '778899',
  ZstAlXe: 'b0c4de',
  ZLw: 'ffffe0',
  lime: 'ff00',
  limegYF: '32cd32',
  lRF: 'faf0e6',
  magFta: 'ff00ff',
  maPon: '800000',
  VaquamarRe: '66cdaa',
  VXe: 'cd',
  VScEd: 'ba55d3',
  VpurpN: '9370db',
  VsHgYF: '3cb371',
  VUXe: '7b68ee',
  VsprRggYF: 'fa9a',
  VQe: '48d1cc',
  VviTetYd: 'c71585',
  midnightXe: '191970',
  mRtcYam: 'f5fffa',
  mistyPse: 'ffe4e1',
  moccasR: 'ffe4b5',
  navajowEte: 'ffdead',
  navy: '80',
  Tdlace: 'fdf5e6',
  Tive: '808000',
  TivedBb: '6b8e23',
  Sange: 'ffa500',
  SangeYd: 'ff4500',
  ScEd: 'da70d6',
  pOegTMnPd: 'eee8aa',
  pOegYF: '98fb98',
  pOeQe: 'afeeee',
  pOeviTetYd: 'db7093',
  papayawEp: 'ffefd5',
  pHKpuff: 'ffdab9',
  peru: 'cd853f',
  pRk: 'ffc0cb',
  plum: 'dda0dd',
  powMrXe: 'b0e0e6',
  purpN: '800080',
  YbeccapurpN: '663399',
  Yd: 'ff0000',
  Psybrown: 'bc8f8f',
  PyOXe: '4169e1',
  saddNbPwn: '8b4513',
  sOmon: 'fa8072',
  sandybPwn: 'f4a460',
  sHgYF: '2e8b57',
  sHshell: 'fff5ee',
  siFna: 'a0522d',
  silver: 'c0c0c0',
  skyXe: '87ceeb',
  UXe: '6a5acd',
  UWay: '708090',
  UgYy: '708090',
  snow: 'fffafa',
  sprRggYF: 'ff7f',
  stAlXe: '4682b4',
  tan: 'd2b48c',
  teO: '8080',
  tEstN: 'd8bfd8',
  tomato: 'ff6347',
  Qe: '40e0d0',
  viTet: 'ee82ee',
  JHt: 'f5deb3',
  wEte: 'ffffff',
  wEtesmoke: 'f5f5f5',
  Lw: 'ffff00',
  LwgYF: '9acd32'
};
function unpack() {
  var unpacked = {};
  var keys = Object.keys(names$1);
  var tkeys = Object.keys(map);
  var i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map[k]);
    }
    k = parseInt(names$1[ok], 16);
    unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
  }
  return unpacked;
}
var names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  var a = names[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}
var RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  var m = RGB_RE.exec(str);
  var a = 255;
  var r, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    var v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r = +m[1];
  g = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r: r,
    g: g,
    b: b,
    a: a
  };
}
function _rgbString(v) {
  return v && (v.a < 255 ? "rgba(".concat(v.r, ", ").concat(v.g, ", ").concat(v.b, ", ").concat(b2n(v.a), ")") : "rgb(".concat(v.r, ", ").concat(v.g, ", ").concat(v.b, ")"));
}
var to = function to(v) {
  return v <= 0.0031308 ? v * 12.92 : Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055;
};
var from = function from(v) {
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
function _interpolate(rgb1, rgb2, t) {
  var r = from(b2n(rgb1.r));
  var g = from(b2n(rgb1.g));
  var b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
    g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))),
    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
    a: rgb1.a + t * (rgb2.a - rgb1.a)
  };
}
function modHSL(v, i, ratio) {
  if (v) {
    var tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
function clone(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
function fromObject(input) {
  var v = {
    r: 0,
    g: 0,
    b: 0,
    a: 255
  };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = {
        r: input[0],
        g: input[1],
        b: input[2],
        a: 255
      };
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone(input, {
      r: 0,
      g: 0,
      b: 0,
      a: 1
    });
    v.a = n2b(v.a);
  }
  return v;
}
function functionParse(str) {
  if (str.charAt(0) === 'r') {
    return rgbParse(str);
  }
  return hueParse(str);
}
var Color = /*#__PURE__*/function () {
  function Color(input) {
    _classCallCheck(this, Color);
    if (input instanceof Color) {
      return input;
    }
    var type = _typeof(input);
    var v;
    if (type === 'object') {
      v = fromObject(input);
    } else if (type === 'string') {
      v = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v;
    this._valid = !!v;
  }
  _createClass(Color, [{
    key: "valid",
    get: function get() {
      return this._valid;
    }
  }, {
    key: "rgb",
    get: function get() {
      var v = clone(this._rgb);
      if (v) {
        v.a = b2n(v.a);
      }
      return v;
    },
    set: function set(obj) {
      this._rgb = fromObject(obj);
    }
  }, {
    key: "rgbString",
    value: function rgbString() {
      return this._valid ? _rgbString(this._rgb) : undefined;
    }
  }, {
    key: "hexString",
    value: function hexString() {
      return this._valid ? _hexString(this._rgb) : undefined;
    }
  }, {
    key: "hslString",
    value: function hslString() {
      return this._valid ? _hslString(this._rgb) : undefined;
    }
  }, {
    key: "mix",
    value: function mix(color, weight) {
      if (color) {
        var c1 = this.rgb;
        var c2 = color.rgb;
        var w2;
        var p = weight === w2 ? 0.5 : weight;
        var w = 2 * p - 1;
        var a = c1.a - c2.a;
        var w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
        w2 = 1 - w1;
        c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5;
        c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5;
        c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5;
        c1.a = p * c1.a + (1 - p) * c2.a;
        this.rgb = c1;
      }
      return this;
    }
  }, {
    key: "interpolate",
    value: function interpolate(color, t) {
      if (color) {
        this._rgb = _interpolate(this._rgb, color._rgb, t);
      }
      return this;
    }
  }, {
    key: "clone",
    value: function clone() {
      return new Color(this.rgb);
    }
  }, {
    key: "alpha",
    value: function alpha(a) {
      this._rgb.a = n2b(a);
      return this;
    }
  }, {
    key: "clearer",
    value: function clearer(ratio) {
      var rgb = this._rgb;
      rgb.a *= 1 - ratio;
      return this;
    }
  }, {
    key: "greyscale",
    value: function greyscale() {
      var rgb = this._rgb;
      var val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
      rgb.r = rgb.g = rgb.b = val;
      return this;
    }
  }, {
    key: "opaquer",
    value: function opaquer(ratio) {
      var rgb = this._rgb;
      rgb.a *= 1 + ratio;
      return this;
    }
  }, {
    key: "negate",
    value: function negate() {
      var v = this._rgb;
      v.r = 255 - v.r;
      v.g = 255 - v.g;
      v.b = 255 - v.b;
      return this;
    }
  }, {
    key: "lighten",
    value: function lighten(ratio) {
      modHSL(this._rgb, 2, ratio);
      return this;
    }
  }, {
    key: "darken",
    value: function darken(ratio) {
      modHSL(this._rgb, 2, -ratio);
      return this;
    }
  }, {
    key: "saturate",
    value: function saturate(ratio) {
      modHSL(this._rgb, 1, ratio);
      return this;
    }
  }, {
    key: "desaturate",
    value: function desaturate(ratio) {
      modHSL(this._rgb, 1, -ratio);
      return this;
    }
  }, {
    key: "rotate",
    value: function rotate(deg) {
      _rotate(this._rgb, deg);
      return this;
    }
  }]);
  return Color;
}();
function index_esm(input) {
  return new Color(input);
}


/***/ }),

/***/ "./node_modules/chart.js/auto/auto.js":
/*!********************************************!*\
  !*** ./node_modules/chart.js/auto/auto.js ***!
  \********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Animation),
/* harmony export */   Animations: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Animations),
/* harmony export */   ArcElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.ArcElement),
/* harmony export */   BarController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BarController),
/* harmony export */   BarElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BarElement),
/* harmony export */   BasePlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BasePlatform),
/* harmony export */   BasicPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BasicPlatform),
/* harmony export */   BubbleController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.BubbleController),
/* harmony export */   CategoryScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.CategoryScale),
/* harmony export */   Chart: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart),
/* harmony export */   Colors: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Colors),
/* harmony export */   DatasetController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DatasetController),
/* harmony export */   Decimation: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Decimation),
/* harmony export */   DomPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DomPlatform),
/* harmony export */   DoughnutController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.DoughnutController),
/* harmony export */   Element: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Element),
/* harmony export */   Filler: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Filler),
/* harmony export */   Interaction: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Interaction),
/* harmony export */   Legend: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Legend),
/* harmony export */   LineController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LineController),
/* harmony export */   LineElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LineElement),
/* harmony export */   LinearScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LinearScale),
/* harmony export */   LogarithmicScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.LogarithmicScale),
/* harmony export */   PieController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PieController),
/* harmony export */   PointElement: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PointElement),
/* harmony export */   PolarAreaController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.PolarAreaController),
/* harmony export */   RadarController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.RadarController),
/* harmony export */   RadialLinearScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.RadialLinearScale),
/* harmony export */   Scale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Scale),
/* harmony export */   ScatterController: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.ScatterController),
/* harmony export */   SubTitle: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.SubTitle),
/* harmony export */   Ticks: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Ticks),
/* harmony export */   TimeScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.TimeScale),
/* harmony export */   TimeSeriesScale: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.TimeSeriesScale),
/* harmony export */   Title: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Title),
/* harmony export */   Tooltip: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Tooltip),
/* harmony export */   _adapters: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__._adapters),
/* harmony export */   _detectPlatform: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__._detectPlatform),
/* harmony export */   animator: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.animator),
/* harmony export */   controllers: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.controllers),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   defaults: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.defaults),
/* harmony export */   elements: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.elements),
/* harmony export */   layouts: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.layouts),
/* harmony export */   plugins: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.plugins),
/* harmony export */   registerables: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registerables),
/* harmony export */   registry: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registry),
/* harmony export */   scales: () => (/* reexport safe */ _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.scales)
/* harmony export */ });
/* harmony import */ var _dist_chart_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dist/chart.js */ "./node_modules/chart.js/dist/chart.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart.register.apply(_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart, _toConsumableArray(_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.registerables));

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_dist_chart_js__WEBPACK_IMPORTED_MODULE_0__.Chart);

/***/ }),

/***/ "./node_modules/chart.js/dist/chart.js":
/*!*********************************************!*\
  !*** ./node_modules/chart.js/dist/chart.js ***!
  \*********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Animation: () => (/* binding */ Animation),
/* harmony export */   Animations: () => (/* binding */ Animations),
/* harmony export */   ArcElement: () => (/* binding */ ArcElement),
/* harmony export */   BarController: () => (/* binding */ BarController),
/* harmony export */   BarElement: () => (/* binding */ BarElement),
/* harmony export */   BasePlatform: () => (/* binding */ BasePlatform),
/* harmony export */   BasicPlatform: () => (/* binding */ BasicPlatform),
/* harmony export */   BubbleController: () => (/* binding */ BubbleController),
/* harmony export */   CategoryScale: () => (/* binding */ CategoryScale),
/* harmony export */   Chart: () => (/* binding */ Chart),
/* harmony export */   Colors: () => (/* binding */ plugin_colors),
/* harmony export */   DatasetController: () => (/* binding */ DatasetController),
/* harmony export */   Decimation: () => (/* binding */ plugin_decimation),
/* harmony export */   DomPlatform: () => (/* binding */ DomPlatform),
/* harmony export */   DoughnutController: () => (/* binding */ DoughnutController),
/* harmony export */   Element: () => (/* binding */ Element),
/* harmony export */   Filler: () => (/* binding */ index),
/* harmony export */   Interaction: () => (/* binding */ Interaction),
/* harmony export */   Legend: () => (/* binding */ plugin_legend),
/* harmony export */   LineController: () => (/* binding */ LineController),
/* harmony export */   LineElement: () => (/* binding */ LineElement),
/* harmony export */   LinearScale: () => (/* binding */ LinearScale),
/* harmony export */   LogarithmicScale: () => (/* binding */ LogarithmicScale),
/* harmony export */   PieController: () => (/* binding */ PieController),
/* harmony export */   PointElement: () => (/* binding */ PointElement),
/* harmony export */   PolarAreaController: () => (/* binding */ PolarAreaController),
/* harmony export */   RadarController: () => (/* binding */ RadarController),
/* harmony export */   RadialLinearScale: () => (/* binding */ RadialLinearScale),
/* harmony export */   Scale: () => (/* binding */ Scale),
/* harmony export */   ScatterController: () => (/* binding */ ScatterController),
/* harmony export */   SubTitle: () => (/* binding */ plugin_subtitle),
/* harmony export */   Ticks: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL),
/* harmony export */   TimeScale: () => (/* binding */ TimeScale),
/* harmony export */   TimeSeriesScale: () => (/* binding */ TimeSeriesScale),
/* harmony export */   Title: () => (/* binding */ plugin_title),
/* harmony export */   Tooltip: () => (/* binding */ plugin_tooltip),
/* harmony export */   _adapters: () => (/* binding */ adapters),
/* harmony export */   _detectPlatform: () => (/* binding */ _detectPlatform),
/* harmony export */   animator: () => (/* binding */ animator),
/* harmony export */   controllers: () => (/* binding */ controllers),
/* harmony export */   defaults: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d),
/* harmony export */   elements: () => (/* binding */ elements),
/* harmony export */   layouts: () => (/* binding */ layouts),
/* harmony export */   plugins: () => (/* binding */ plugins),
/* harmony export */   registerables: () => (/* binding */ registerables),
/* harmony export */   registry: () => (/* binding */ registry),
/* harmony export */   scales: () => (/* binding */ scales)
/* harmony export */ });
/* harmony import */ var _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/helpers.segment.js */ "./node_modules/chart.js/dist/chunks/helpers.segment.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _get() { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get.bind(); } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(arguments.length < 3 ? target : receiver); } return desc.value; }; } return _get.apply(this, arguments); }
function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0); } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i["return"] && (_r = _i["return"](), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e2) { throw _e2; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e3) { didErr = true; err = _e3; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
/*!
 * Chart.js v4.4.0
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */


var Animator = /*#__PURE__*/function () {
  function Animator() {
    _classCallCheck(this, Animator);
    this._request = null;
    this._charts = new Map();
    this._running = false;
    this._lastDate = undefined;
  }
  _createClass(Animator, [{
    key: "_notify",
    value: function _notify(chart, anims, date, type) {
      var callbacks = anims.listeners[type];
      var numSteps = anims.duration;
      callbacks.forEach(function (fn) {
        return fn({
          chart: chart,
          initial: anims.initial,
          numSteps: numSteps,
          currentStep: Math.min(date - anims.start, numSteps)
        });
      });
    }
  }, {
    key: "_refresh",
    value: function _refresh() {
      var _this = this;
      if (this._request) {
        return;
      }
      this._running = true;
      this._request = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.r.call(window, function () {
        _this._update();
        _this._request = null;
        if (_this._running) {
          _this._refresh();
        }
      });
    }
  }, {
    key: "_update",
    value: function _update() {
      var _this2 = this;
      var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
      var remaining = 0;
      this._charts.forEach(function (anims, chart) {
        if (!anims.running || !anims.items.length) {
          return;
        }
        var items = anims.items;
        var i = items.length - 1;
        var draw = false;
        var item;
        for (; i >= 0; --i) {
          item = items[i];
          if (item._active) {
            if (item._total > anims.duration) {
              anims.duration = item._total;
            }
            item.tick(date);
            draw = true;
          } else {
            items[i] = items[items.length - 1];
            items.pop();
          }
        }
        if (draw) {
          chart.draw();
          _this2._notify(chart, anims, date, 'progress');
        }
        if (!items.length) {
          anims.running = false;
          _this2._notify(chart, anims, date, 'complete');
          anims.initial = false;
        }
        remaining += items.length;
      });
      this._lastDate = date;
      if (remaining === 0) {
        this._running = false;
      }
    }
  }, {
    key: "_getAnims",
    value: function _getAnims(chart) {
      var charts = this._charts;
      var anims = charts.get(chart);
      if (!anims) {
        anims = {
          running: false,
          initial: true,
          items: [],
          listeners: {
            complete: [],
            progress: []
          }
        };
        charts.set(chart, anims);
      }
      return anims;
    }
  }, {
    key: "listen",
    value: function listen(chart, event, cb) {
      this._getAnims(chart).listeners[event].push(cb);
    }
  }, {
    key: "add",
    value: function add(chart, items) {
      var _this$_getAnims$items;
      if (!items || !items.length) {
        return;
      }
      (_this$_getAnims$items = this._getAnims(chart).items).push.apply(_this$_getAnims$items, _toConsumableArray(items));
    }
  }, {
    key: "has",
    value: function has(chart) {
      return this._getAnims(chart).items.length > 0;
    }
  }, {
    key: "start",
    value: function start(chart) {
      var anims = this._charts.get(chart);
      if (!anims) {
        return;
      }
      anims.running = true;
      anims.start = Date.now();
      anims.duration = anims.items.reduce(function (acc, cur) {
        return Math.max(acc, cur._duration);
      }, 0);
      this._refresh();
    }
  }, {
    key: "running",
    value: function running(chart) {
      if (!this._running) {
        return false;
      }
      var anims = this._charts.get(chart);
      if (!anims || !anims.running || !anims.items.length) {
        return false;
      }
      return true;
    }
  }, {
    key: "stop",
    value: function stop(chart) {
      var anims = this._charts.get(chart);
      if (!anims || !anims.items.length) {
        return;
      }
      var items = anims.items;
      var i = items.length - 1;
      for (; i >= 0; --i) {
        items[i].cancel();
      }
      anims.items = [];
      this._notify(chart, anims, Date.now(), 'complete');
    }
  }, {
    key: "remove",
    value: function remove(chart) {
      return this._charts["delete"](chart);
    }
  }]);
  return Animator;
}();
var animator = /* #__PURE__ */new Animator();
var transparent = 'transparent';
var interpolators = {
  "boolean": function boolean(from, to, factor) {
    return factor > 0.5 ? to : from;
  },
  color: function color(from, to, factor) {
    var c0 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.c)(from || transparent);
    var c1 = c0.valid && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.c)(to || transparent);
    return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to;
  },
  number: function number(from, to, factor) {
    return from + (to - from) * factor;
  }
};
var Animation = /*#__PURE__*/function () {
  function Animation(cfg, target, prop, to) {
    _classCallCheck(this, Animation);
    var currentValue = target[prop];
    to = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([cfg.to, to, currentValue, cfg.from]);
    var from = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([cfg.from, currentValue, to]);
    this._active = true;
    this._fn = cfg.fn || interpolators[cfg.type || _typeof(from)];
    this._easing = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.e[cfg.easing] || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.e.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from;
    this._to = to;
    this._promises = undefined;
  }
  _createClass(Animation, [{
    key: "active",
    value: function active() {
      return this._active;
    }
  }, {
    key: "update",
    value: function update(cfg, to, date) {
      if (this._active) {
        this._notify(false);
        var currentValue = this._target[this._prop];
        var elapsed = date - this._start;
        var remain = this._duration - elapsed;
        this._start = date;
        this._duration = Math.floor(Math.max(remain, cfg.duration));
        this._total += elapsed;
        this._loop = !!cfg.loop;
        this._to = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([cfg.to, to, currentValue, cfg.from]);
        this._from = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([cfg.from, currentValue, to]);
      }
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this._active) {
        this.tick(Date.now());
        this._active = false;
        this._notify(false);
      }
    }
  }, {
    key: "tick",
    value: function tick(date) {
      var elapsed = date - this._start;
      var duration = this._duration;
      var prop = this._prop;
      var from = this._from;
      var loop = this._loop;
      var to = this._to;
      var factor;
      this._active = from !== to && (loop || elapsed < duration);
      if (!this._active) {
        this._target[prop] = to;
        this._notify(true);
        return;
      }
      if (elapsed < 0) {
        this._target[prop] = from;
        return;
      }
      factor = elapsed / duration % 2;
      factor = loop && factor > 1 ? 2 - factor : factor;
      factor = this._easing(Math.min(1, Math.max(0, factor)));
      this._target[prop] = this._fn(from, to, factor);
    }
  }, {
    key: "wait",
    value: function wait() {
      var promises = this._promises || (this._promises = []);
      return new Promise(function (res, rej) {
        promises.push({
          res: res,
          rej: rej
        });
      });
    }
  }, {
    key: "_notify",
    value: function _notify(resolved) {
      var method = resolved ? 'res' : 'rej';
      var promises = this._promises || [];
      for (var i = 0; i < promises.length; i++) {
        promises[i][method]();
      }
    }
  }]);
  return Animation;
}();
var Animations = /*#__PURE__*/function () {
  function Animations(chart, config) {
    _classCallCheck(this, Animations);
    this._chart = chart;
    this._properties = new Map();
    this.configure(config);
  }
  _createClass(Animations, [{
    key: "configure",
    value: function configure(config) {
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(config)) {
        return;
      }
      var animationOptions = Object.keys(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.animation);
      var animatedProps = this._properties;
      Object.getOwnPropertyNames(config).forEach(function (key) {
        var cfg = config[key];
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(cfg)) {
          return;
        }
        var resolved = {};
        for (var _i = 0, _animationOptions = animationOptions; _i < _animationOptions.length; _i++) {
          var option = _animationOptions[_i];
          resolved[option] = cfg[option];
        }
        ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(cfg.properties) && cfg.properties || [key]).forEach(function (prop) {
          if (prop === key || !animatedProps.has(prop)) {
            animatedProps.set(prop, resolved);
          }
        });
      });
    }
  }, {
    key: "_animateOptions",
    value: function _animateOptions(target, values) {
      var newOptions = values.options;
      var options = resolveTargetOptions(target, newOptions);
      if (!options) {
        return [];
      }
      var animations = this._createAnimations(options, newOptions);
      if (newOptions.$shared) {
        awaitAll(target.options.$animations, newOptions).then(function () {
          target.options = newOptions;
        }, function () {});
      }
      return animations;
    }
  }, {
    key: "_createAnimations",
    value: function _createAnimations(target, values) {
      var animatedProps = this._properties;
      var animations = [];
      var running = target.$animations || (target.$animations = {});
      var props = Object.keys(values);
      var date = Date.now();
      var i;
      for (i = props.length - 1; i >= 0; --i) {
        var prop = props[i];
        if (prop.charAt(0) === '$') {
          continue;
        }
        if (prop === 'options') {
          animations.push.apply(animations, _toConsumableArray(this._animateOptions(target, values)));
          continue;
        }
        var value = values[prop];
        var animation = running[prop];
        var cfg = animatedProps.get(prop);
        if (animation) {
          if (cfg && animation.active()) {
            animation.update(cfg, value, date);
            continue;
          } else {
            animation.cancel();
          }
        }
        if (!cfg || !cfg.duration) {
          target[prop] = value;
          continue;
        }
        running[prop] = animation = new Animation(cfg, target, prop, value);
        animations.push(animation);
      }
      return animations;
    }
  }, {
    key: "update",
    value: function update(target, values) {
      if (this._properties.size === 0) {
        Object.assign(target, values);
        return;
      }
      var animations = this._createAnimations(target, values);
      if (animations.length) {
        animator.add(this._chart, animations);
        return true;
      }
    }
  }]);
  return Animations;
}();
function awaitAll(animations, properties) {
  var running = [];
  var keys = Object.keys(properties);
  for (var i = 0; i < keys.length; i++) {
    var anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  var options = target.options;
  if (!options) {
    target.options = newOptions;
    return;
  }
  if (options.$shared) {
    target.options = options = Object.assign({}, options, {
      $shared: false,
      $animations: {}
    });
  }
  return options;
}
function scaleClip(scale, allowedOverflow) {
  var opts = scale && scale.options || {};
  var reverse = opts.reverse;
  var min = opts.min === undefined ? allowedOverflow : 0;
  var max = opts.max === undefined ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  var x = scaleClip(xScale, allowedOverflow);
  var y = scaleClip(yScale, allowedOverflow);
  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}
function toClip(value) {
  var t, r, b, l;
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }
  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    disabled: value === false
  };
}
function getSortedDatasetIndices(chart, filterVisible) {
  var keys = [];
  var metasets = chart._getSortedDatasetMetas(filterVisible);
  var i, ilen;
  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}
function _applyStack(stack, value, dsIndex) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var keys = stack.keys;
  var singleMode = options.mode === 'single';
  var i, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      if (options.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(otherValue) && (singleMode || value === 0 || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(value) === (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(otherValue))) {
      value += otherValue;
    }
  }
  return value;
}
function convertObjectDataToArray(data) {
  var keys = Object.keys(data);
  var adata = new Array(keys.length);
  var i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      x: key,
      y: data[key]
    };
  }
  return adata;
}
function isStacked(scale, meta) {
  var stacked = scale && scale.options.stacked;
  return stacked || stacked === undefined && meta.stack !== undefined;
}
function getStackKey(indexScale, valueScale, meta) {
  return "".concat(indexScale.id, ".").concat(valueScale.id, ".").concat(meta.stack || meta.type);
}
function getUserBounds(scale) {
  var _scale$getUserBounds = scale.getUserBounds(),
    min = _scale$getUserBounds.min,
    max = _scale$getUserBounds.max,
    minDefined = _scale$getUserBounds.minDefined,
    maxDefined = _scale$getUserBounds.maxDefined;
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
function getOrCreateStack(stacks, stackKey, indexValue) {
  var subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
function getLastIndexInStack(stack, vScale, positive, type) {
  var _iterator = _createForOfIteratorHelper(vScale.getMatchingVisibleMetas(type).reverse()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var meta = _step.value;
      var value = stack[meta.index];
      if (positive && value > 0 || !positive && value < 0) {
        return meta.index;
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return null;
}
function updateStacks(controller, parsed) {
  var chart = controller.chart,
    meta = controller._cachedMeta;
  var stacks = chart._stacks || (chart._stacks = {});
  var iScale = meta.iScale,
    vScale = meta.vScale,
    datasetIndex = meta.index;
  var iAxis = iScale.axis;
  var vAxis = vScale.axis;
  var key = getStackKey(iScale, vScale, meta);
  var ilen = parsed.length;
  var stack;
  for (var i = 0; i < ilen; ++i) {
    var item = parsed[i];
    var _index = item[iAxis],
      value = item[vAxis];
    var itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, _index);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
    var visualValues = stack._visualValues || (stack._visualValues = {});
    visualValues[datasetIndex] = value;
  }
}
function getFirstScaleId(chart, axis) {
  var scales = chart.scales;
  return Object.keys(scales).filter(function (key) {
    return scales[key].axis === axis;
  }).shift();
}
function createDatasetContext(parent, index) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    active: false,
    dataset: undefined,
    datasetIndex: index,
    index: index,
    mode: 'default',
    type: 'dataset'
  });
}
function createDataContext(parent, index, element) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    active: false,
    dataIndex: index,
    parsed: undefined,
    raw: undefined,
    element: element,
    index: index,
    mode: 'default',
    type: 'data'
  });
}
function clearStacks(meta, items) {
  var datasetIndex = meta.controller.index;
  var axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  var _iterator2 = _createForOfIteratorHelper(items),
    _step2;
  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var parsed = _step2.value;
      var stacks = parsed._stacks;
      if (!stacks || stacks[axis] === undefined || stacks[axis][datasetIndex] === undefined) {
        return;
      }
      delete stacks[axis][datasetIndex];
      if (stacks[axis]._visualValues !== undefined && stacks[axis]._visualValues[datasetIndex] !== undefined) {
        delete stacks[axis]._visualValues[datasetIndex];
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
}
var isDirectUpdateMode = function isDirectUpdateMode(mode) {
  return mode === 'reset' || mode === 'none';
};
var cloneIfNotShared = function cloneIfNotShared(cached, shared) {
  return shared ? cached : Object.assign({}, cached);
};
var createStack = function createStack(canStack, meta, chart) {
  return canStack && !meta.hidden && meta._stacked && {
    keys: getSortedDatasetIndices(chart, true),
    values: null
  };
};
var DatasetController = /*#__PURE__*/function () {
  function DatasetController(chart, datasetIndex) {
    _classCallCheck(this, DatasetController);
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = undefined;
    this._parsing = false;
    this._data = undefined;
    this._objectData = undefined;
    this._sharedOptions = undefined;
    this._drawStart = undefined;
    this._drawCount = undefined;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = undefined;
    this._syncList = [];
    this.datasetElementType = (this instanceof DatasetController ? this.constructor : void 0).datasetElementType;
    this.dataElementType = (this instanceof DatasetController ? this.constructor : void 0).dataElementType;
    this.initialize();
  }
  _createClass(DatasetController, [{
    key: "initialize",
    value: function initialize() {
      var meta = this._cachedMeta;
      this.configure();
      this.linkScales();
      meta._stacked = isStacked(meta.vScale, meta);
      this.addElements();
      if (this.options.fill && !this.chart.isPluginEnabled('filler')) {
        console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
      }
    }
  }, {
    key: "updateIndex",
    value: function updateIndex(datasetIndex) {
      if (this.index !== datasetIndex) {
        clearStacks(this._cachedMeta);
      }
      this.index = datasetIndex;
    }
  }, {
    key: "linkScales",
    value: function linkScales() {
      var chart = this.chart;
      var meta = this._cachedMeta;
      var dataset = this.getDataset();
      var chooseId = function chooseId(axis, x, y, r) {
        return axis === 'x' ? x : axis === 'r' ? r : y;
      };
      var xid = meta.xAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.xAxisID, getFirstScaleId(chart, 'x'));
      var yid = meta.yAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.yAxisID, getFirstScaleId(chart, 'y'));
      var rid = meta.rAxisID = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(dataset.rAxisID, getFirstScaleId(chart, 'r'));
      var indexAxis = meta.indexAxis;
      var iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
      var vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
      meta.xScale = this.getScaleForId(xid);
      meta.yScale = this.getScaleForId(yid);
      meta.rScale = this.getScaleForId(rid);
      meta.iScale = this.getScaleForId(iid);
      meta.vScale = this.getScaleForId(vid);
    }
  }, {
    key: "getDataset",
    value: function getDataset() {
      return this.chart.data.datasets[this.index];
    }
  }, {
    key: "getMeta",
    value: function getMeta() {
      return this.chart.getDatasetMeta(this.index);
    }
  }, {
    key: "getScaleForId",
    value: function getScaleForId(scaleID) {
      return this.chart.scales[scaleID];
    }
  }, {
    key: "_getOtherScale",
    value: function _getOtherScale(scale) {
      var meta = this._cachedMeta;
      return scale === meta.iScale ? meta.vScale : meta.iScale;
    }
  }, {
    key: "reset",
    value: function reset() {
      this._update('reset');
    }
  }, {
    key: "_destroy",
    value: function _destroy() {
      var meta = this._cachedMeta;
      if (this._data) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.u)(this._data, this);
      }
      if (meta._stacked) {
        clearStacks(meta);
      }
    }
  }, {
    key: "_dataCheck",
    value: function _dataCheck() {
      var dataset = this.getDataset();
      var data = dataset.data || (dataset.data = []);
      var _data = this._data;
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data)) {
        this._data = convertObjectDataToArray(data);
      } else if (_data !== data) {
        if (_data) {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.u)(_data, this);
          var meta = this._cachedMeta;
          clearStacks(meta);
          meta._parsed = [];
        }
        if (data && Object.isExtensible(data)) {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.l)(data, this);
        }
        this._syncList = [];
        this._data = data;
      }
    }
  }, {
    key: "addElements",
    value: function addElements() {
      var meta = this._cachedMeta;
      this._dataCheck();
      if (this.datasetElementType) {
        meta.dataset = new this.datasetElementType();
      }
    }
  }, {
    key: "buildOrUpdateElements",
    value: function buildOrUpdateElements(resetNewElements) {
      var meta = this._cachedMeta;
      var dataset = this.getDataset();
      var stackChanged = false;
      this._dataCheck();
      var oldStacked = meta._stacked;
      meta._stacked = isStacked(meta.vScale, meta);
      if (meta.stack !== dataset.stack) {
        stackChanged = true;
        clearStacks(meta);
        meta.stack = dataset.stack;
      }
      this._resyncElements(resetNewElements);
      if (stackChanged || oldStacked !== meta._stacked) {
        updateStacks(this, meta._parsed);
      }
    }
  }, {
    key: "configure",
    value: function configure() {
      var config = this.chart.config;
      var scopeKeys = config.datasetScopeKeys(this._type);
      var scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
      this.options = config.createResolver(scopes, this.getContext());
      this._parsing = this.options.parsing;
      this._cachedDataOpts = {};
    }
  }, {
    key: "parse",
    value: function parse(start, count) {
      var meta = this._cachedMeta,
        data = this._data;
      var iScale = meta.iScale,
        _stacked = meta._stacked;
      var iAxis = iScale.axis;
      var sorted = start === 0 && count === data.length ? true : meta._sorted;
      var prev = start > 0 && meta._parsed[start - 1];
      var i, cur, parsed;
      if (this._parsing === false) {
        meta._parsed = data;
        meta._sorted = true;
        parsed = data;
      } else {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(data[start])) {
          parsed = this.parseArrayData(meta, data, start, count);
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data[start])) {
          parsed = this.parseObjectData(meta, data, start, count);
        } else {
          parsed = this.parsePrimitiveData(meta, data, start, count);
        }
        var isNotInOrderComparedToPrev = function isNotInOrderComparedToPrev() {
          return cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
        };
        for (i = 0; i < count; ++i) {
          meta._parsed[i + start] = cur = parsed[i];
          if (sorted) {
            if (isNotInOrderComparedToPrev()) {
              sorted = false;
            }
            prev = cur;
          }
        }
        meta._sorted = sorted;
      }
      if (_stacked) {
        updateStacks(this, parsed);
      }
    }
  }, {
    key: "parsePrimitiveData",
    value: function parsePrimitiveData(meta, data, start, count) {
      var iScale = meta.iScale,
        vScale = meta.vScale;
      var iAxis = iScale.axis;
      var vAxis = vScale.axis;
      var labels = iScale.getLabels();
      var singleScale = iScale === vScale;
      var parsed = new Array(count);
      var i, ilen, index;
      for (i = 0, ilen = count; i < ilen; ++i) {
        var _parsed$i;
        index = i + start;
        parsed[i] = (_parsed$i = {}, _defineProperty(_parsed$i, iAxis, singleScale || iScale.parse(labels[index], index)), _defineProperty(_parsed$i, vAxis, vScale.parse(data[index], index)), _parsed$i);
      }
      return parsed;
    }
  }, {
    key: "parseArrayData",
    value: function parseArrayData(meta, data, start, count) {
      var xScale = meta.xScale,
        yScale = meta.yScale;
      var parsed = new Array(count);
      var i, ilen, index, item;
      for (i = 0, ilen = count; i < ilen; ++i) {
        index = i + start;
        item = data[index];
        parsed[i] = {
          x: xScale.parse(item[0], index),
          y: yScale.parse(item[1], index)
        };
      }
      return parsed;
    }
  }, {
    key: "parseObjectData",
    value: function parseObjectData(meta, data, start, count) {
      var xScale = meta.xScale,
        yScale = meta.yScale;
      var _this$_parsing = this._parsing,
        _this$_parsing$xAxisK = _this$_parsing.xAxisKey,
        xAxisKey = _this$_parsing$xAxisK === void 0 ? 'x' : _this$_parsing$xAxisK,
        _this$_parsing$yAxisK = _this$_parsing.yAxisKey,
        yAxisKey = _this$_parsing$yAxisK === void 0 ? 'y' : _this$_parsing$yAxisK;
      var parsed = new Array(count);
      var i, ilen, index, item;
      for (i = 0, ilen = count; i < ilen; ++i) {
        index = i + start;
        item = data[index];
        parsed[i] = {
          x: xScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(item, xAxisKey), index),
          y: yScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(item, yAxisKey), index)
        };
      }
      return parsed;
    }
  }, {
    key: "getParsed",
    value: function getParsed(index) {
      return this._cachedMeta._parsed[index];
    }
  }, {
    key: "getDataElement",
    value: function getDataElement(index) {
      return this._cachedMeta.data[index];
    }
  }, {
    key: "applyStack",
    value: function applyStack(scale, parsed, mode) {
      var chart = this.chart;
      var meta = this._cachedMeta;
      var value = parsed[scale.axis];
      var stack = {
        keys: getSortedDatasetIndices(chart, true),
        values: parsed._stacks[scale.axis]._visualValues
      };
      return _applyStack(stack, value, meta.index, {
        mode: mode
      });
    }
  }, {
    key: "updateRangeFromParsed",
    value: function updateRangeFromParsed(range, scale, parsed, stack) {
      var parsedValue = parsed[scale.axis];
      var value = parsedValue === null ? NaN : parsedValue;
      var values = stack && parsed._stacks[scale.axis];
      if (stack && values) {
        stack.values = values;
        value = _applyStack(stack, parsedValue, this._cachedMeta.index);
      }
      range.min = Math.min(range.min, value);
      range.max = Math.max(range.max, value);
    }
  }, {
    key: "getMinMax",
    value: function getMinMax(scale, canStack) {
      var meta = this._cachedMeta;
      var _parsed = meta._parsed;
      var sorted = meta._sorted && scale === meta.iScale;
      var ilen = _parsed.length;
      var otherScale = this._getOtherScale(scale);
      var stack = createStack(canStack, meta, this.chart);
      var range = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY
      };
      var _getUserBounds = getUserBounds(otherScale),
        otherMin = _getUserBounds.min,
        otherMax = _getUserBounds.max;
      var i, parsed;
      function _skip() {
        parsed = _parsed[i];
        var otherValue = parsed[otherScale.axis];
        return !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
      }
      for (i = 0; i < ilen; ++i) {
        if (_skip()) {
          continue;
        }
        this.updateRangeFromParsed(range, scale, parsed, stack);
        if (sorted) {
          break;
        }
      }
      if (sorted) {
        for (i = ilen - 1; i >= 0; --i) {
          if (_skip()) {
            continue;
          }
          this.updateRangeFromParsed(range, scale, parsed, stack);
          break;
        }
      }
      return range;
    }
  }, {
    key: "getAllParsedValues",
    value: function getAllParsedValues(scale) {
      var parsed = this._cachedMeta._parsed;
      var values = [];
      var i, ilen, value;
      for (i = 0, ilen = parsed.length; i < ilen; ++i) {
        value = parsed[i][scale.axis];
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value)) {
          values.push(value);
        }
      }
      return values;
    }
  }, {
    key: "getMaxOverflow",
    value: function getMaxOverflow() {
      return false;
    }
  }, {
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var iScale = meta.iScale;
      var vScale = meta.vScale;
      var parsed = this.getParsed(index);
      return {
        label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
        value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
      };
    }
  }, {
    key: "_update",
    value: function _update(mode) {
      var meta = this._cachedMeta;
      this.update(mode || 'default');
      meta._clip = toClip((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
    }
  }, {
    key: "update",
    value: function update(mode) {}
  }, {
    key: "draw",
    value: function draw() {
      var ctx = this._ctx;
      var chart = this.chart;
      var meta = this._cachedMeta;
      var elements = meta.data || [];
      var area = chart.chartArea;
      var active = [];
      var start = this._drawStart || 0;
      var count = this._drawCount || elements.length - start;
      var drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
      var i;
      if (meta.dataset) {
        meta.dataset.draw(ctx, area, start, count);
      }
      for (i = start; i < start + count; ++i) {
        var element = elements[i];
        if (element.hidden) {
          continue;
        }
        if (element.active && drawActiveElementsOnTop) {
          active.push(element);
        } else {
          element.draw(ctx, area);
        }
      }
      for (i = 0; i < active.length; ++i) {
        active[i].draw(ctx, area);
      }
    }
  }, {
    key: "getStyle",
    value: function getStyle(index, active) {
      var mode = active ? 'active' : 'default';
      return index === undefined && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode);
    }
  }, {
    key: "getContext",
    value: function getContext(index, active, mode) {
      var dataset = this.getDataset();
      var context;
      if (index >= 0 && index < this._cachedMeta.data.length) {
        var element = this._cachedMeta.data[index];
        context = element.$context || (element.$context = createDataContext(this.getContext(), index, element));
        context.parsed = this.getParsed(index);
        context.raw = dataset.data[index];
        context.index = context.dataIndex = index;
      } else {
        context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
        context.dataset = dataset;
        context.index = context.datasetIndex = this.index;
      }
      context.active = !!active;
      context.mode = mode;
      return context;
    }
  }, {
    key: "resolveDatasetElementOptions",
    value: function resolveDatasetElementOptions(mode) {
      return this._resolveElementOptions(this.datasetElementType.id, mode);
    }
  }, {
    key: "resolveDataElementOptions",
    value: function resolveDataElementOptions(index, mode) {
      return this._resolveElementOptions(this.dataElementType.id, mode, index);
    }
  }, {
    key: "_resolveElementOptions",
    value: function _resolveElementOptions(elementType) {
      var _this3 = this;
      var mode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'default';
      var index = arguments.length > 2 ? arguments[2] : undefined;
      var active = mode === 'active';
      var cache = this._cachedDataOpts;
      var cacheKey = elementType + '-' + mode;
      var cached = cache[cacheKey];
      var sharing = this.enableOptionSharing && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(index);
      if (cached) {
        return cloneIfNotShared(cached, sharing);
      }
      var config = this.chart.config;
      var scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
      var prefixes = active ? ["".concat(elementType, "Hover"), 'hover', elementType, ''] : [elementType, ''];
      var scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
      var names = Object.keys(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.elements[elementType]);
      var context = function context() {
        return _this3.getContext(index, active, mode);
      };
      var values = config.resolveNamedOptions(scopes, names, context, prefixes);
      if (values.$shared) {
        values.$shared = sharing;
        cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
      }
      return values;
    }
  }, {
    key: "_resolveAnimations",
    value: function _resolveAnimations(index, transition, active) {
      var chart = this.chart;
      var cache = this._cachedDataOpts;
      var cacheKey = "animation-".concat(transition);
      var cached = cache[cacheKey];
      if (cached) {
        return cached;
      }
      var options;
      if (chart.options.animation !== false) {
        var config = this.chart.config;
        var scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
        var scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
        options = config.createResolver(scopes, this.getContext(index, active, transition));
      }
      var animations = new Animations(chart, options && options.animations);
      if (options && options._cacheable) {
        cache[cacheKey] = Object.freeze(animations);
      }
      return animations;
    }
  }, {
    key: "getSharedOptions",
    value: function getSharedOptions(options) {
      if (!options.$shared) {
        return;
      }
      return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
    }
  }, {
    key: "includeOptions",
    value: function includeOptions(mode, sharedOptions) {
      return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
    }
  }, {
    key: "_getSharedOptions",
    value: function _getSharedOptions(start, mode) {
      var firstOpts = this.resolveDataElementOptions(start, mode);
      var previouslySharedOptions = this._sharedOptions;
      var sharedOptions = this.getSharedOptions(firstOpts);
      var includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
      this.updateSharedOptions(sharedOptions, mode, firstOpts);
      return {
        sharedOptions: sharedOptions,
        includeOptions: includeOptions
      };
    }
  }, {
    key: "updateElement",
    value: function updateElement(element, index, properties, mode) {
      if (isDirectUpdateMode(mode)) {
        Object.assign(element, properties);
      } else {
        this._resolveAnimations(index, mode).update(element, properties);
      }
    }
  }, {
    key: "updateSharedOptions",
    value: function updateSharedOptions(sharedOptions, mode, newOptions) {
      if (sharedOptions && !isDirectUpdateMode(mode)) {
        this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions);
      }
    }
  }, {
    key: "_setStyle",
    value: function _setStyle(element, index, mode, active) {
      element.active = active;
      var options = this.getStyle(index, active);
      this._resolveAnimations(index, mode, active).update(element, {
        options: !active && this.getSharedOptions(options) || options
      });
    }
  }, {
    key: "removeHoverStyle",
    value: function removeHoverStyle(element, datasetIndex, index) {
      this._setStyle(element, index, 'active', false);
    }
  }, {
    key: "setHoverStyle",
    value: function setHoverStyle(element, datasetIndex, index) {
      this._setStyle(element, index, 'active', true);
    }
  }, {
    key: "_removeDatasetHoverStyle",
    value: function _removeDatasetHoverStyle() {
      var element = this._cachedMeta.dataset;
      if (element) {
        this._setStyle(element, undefined, 'active', false);
      }
    }
  }, {
    key: "_setDatasetHoverStyle",
    value: function _setDatasetHoverStyle() {
      var element = this._cachedMeta.dataset;
      if (element) {
        this._setStyle(element, undefined, 'active', true);
      }
    }
  }, {
    key: "_resyncElements",
    value: function _resyncElements(resetNewElements) {
      var data = this._data;
      var elements = this._cachedMeta.data;
      var _iterator3 = _createForOfIteratorHelper(this._syncList),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _step3$value = _slicedToArray(_step3.value, 3),
            method = _step3$value[0],
            arg1 = _step3$value[1],
            arg2 = _step3$value[2];
          this[method](arg1, arg2);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this._syncList = [];
      var numMeta = elements.length;
      var numData = data.length;
      var count = Math.min(numData, numMeta);
      if (count) {
        this.parse(0, count);
      }
      if (numData > numMeta) {
        this._insertElements(numMeta, numData - numMeta, resetNewElements);
      } else if (numData < numMeta) {
        this._removeElements(numData, numMeta - numData);
      }
    }
  }, {
    key: "_insertElements",
    value: function _insertElements(start, count) {
      var resetNewElements = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var meta = this._cachedMeta;
      var data = meta.data;
      var end = start + count;
      var i;
      var move = function move(arr) {
        arr.length += count;
        for (i = arr.length - 1; i >= end; i--) {
          arr[i] = arr[i - count];
        }
      };
      move(data);
      for (i = start; i < end; ++i) {
        data[i] = new this.dataElementType();
      }
      if (this._parsing) {
        move(meta._parsed);
      }
      this.parse(start, count);
      if (resetNewElements) {
        this.updateElements(data, start, count, 'reset');
      }
    }
  }, {
    key: "updateElements",
    value: function updateElements(element, start, count, mode) {}
  }, {
    key: "_removeElements",
    value: function _removeElements(start, count) {
      var meta = this._cachedMeta;
      if (this._parsing) {
        var removed = meta._parsed.splice(start, count);
        if (meta._stacked) {
          clearStacks(meta, removed);
        }
      }
      meta.data.splice(start, count);
    }
  }, {
    key: "_sync",
    value: function _sync(args) {
      if (this._parsing) {
        this._syncList.push(args);
      } else {
        var _args2 = _slicedToArray(args, 3),
          method = _args2[0],
          arg1 = _args2[1],
          arg2 = _args2[2];
        this[method](arg1, arg2);
      }
      this.chart._dataChanges.push([this.index].concat(_toConsumableArray(args)));
    }
  }, {
    key: "_onDataPush",
    value: function _onDataPush() {
      var count = arguments.length;
      this._sync(['_insertElements', this.getDataset().data.length - count, count]);
    }
  }, {
    key: "_onDataPop",
    value: function _onDataPop() {
      this._sync(['_removeElements', this._cachedMeta.data.length - 1, 1]);
    }
  }, {
    key: "_onDataShift",
    value: function _onDataShift() {
      this._sync(['_removeElements', 0, 1]);
    }
  }, {
    key: "_onDataSplice",
    value: function _onDataSplice(start, count) {
      if (count) {
        this._sync(['_removeElements', start, count]);
      }
      var newCount = arguments.length - 2;
      if (newCount) {
        this._sync(['_insertElements', start, newCount]);
      }
    }
  }, {
    key: "_onDataUnshift",
    value: function _onDataUnshift() {
      this._sync(['_insertElements', 0, arguments.length]);
    }
  }]);
  return DatasetController;
}();
_defineProperty(DatasetController, "defaults", {});
_defineProperty(DatasetController, "datasetElementType", null);
_defineProperty(DatasetController, "dataElementType", null);
function getAllScaleValues(scale, type) {
  if (!scale._cache.$bar) {
    var visibleMetas = scale.getMatchingVisibleMetas(type);
    var values = [];
    for (var i = 0, ilen = visibleMetas.length; i < ilen; i++) {
      values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
    }
    scale._cache.$bar = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__._)(values.sort(function (a, b) {
      return a - b;
    }));
  }
  return scale._cache.$bar;
}
function computeMinSampleSize(meta) {
  var scale = meta.iScale;
  var values = getAllScaleValues(scale, meta.type);
  var min = scale._length;
  var i, ilen, curr, prev;
  var updateMinAndPrev = function updateMinAndPrev() {
    if (curr === 32767 || curr === -32768) {
      return;
    }
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(prev)) {
      min = Math.min(min, Math.abs(curr - prev) || min);
    }
    prev = curr;
  };
  for (i = 0, ilen = values.length; i < ilen; ++i) {
    curr = scale.getPixelForValue(values[i]);
    updateMinAndPrev();
  }
  prev = undefined;
  for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
    curr = scale.getPixelForTick(i);
    updateMinAndPrev();
  }
  return min;
}
function computeFitCategoryTraits(index, ruler, options, stackCount) {
  var thickness = options.barThickness;
  var size, ratio;
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(thickness)) {
    size = ruler.min * options.categoryPercentage;
    ratio = options.barPercentage;
  } else {
    size = thickness * stackCount;
    ratio = 1;
  }
  return {
    chunk: size / stackCount,
    ratio: ratio,
    start: ruler.pixels[index] - size / 2
  };
}
function computeFlexCategoryTraits(index, ruler, options, stackCount) {
  var pixels = ruler.pixels;
  var curr = pixels[index];
  var prev = index > 0 ? pixels[index - 1] : null;
  var next = index < pixels.length - 1 ? pixels[index + 1] : null;
  var percent = options.categoryPercentage;
  if (prev === null) {
    prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
  }
  if (next === null) {
    next = curr + curr - prev;
  }
  var start = curr - (curr - Math.min(prev, next)) / 2 * percent;
  var size = Math.abs(next - prev) / 2 * percent;
  return {
    chunk: size / stackCount,
    ratio: options.barPercentage,
    start: start
  };
}
function parseFloatBar(entry, item, vScale, i) {
  var startValue = vScale.parse(entry[0], i);
  var endValue = vScale.parse(entry[1], i);
  var min = Math.min(startValue, endValue);
  var max = Math.max(startValue, endValue);
  var barStart = min;
  var barEnd = max;
  if (Math.abs(min) > Math.abs(max)) {
    barStart = max;
    barEnd = min;
  }
  item[vScale.axis] = barEnd;
  item._custom = {
    barStart: barStart,
    barEnd: barEnd,
    start: startValue,
    end: endValue,
    min: min,
    max: max
  };
}
function parseValue(entry, item, vScale, i) {
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(entry)) {
    parseFloatBar(entry, item, vScale, i);
  } else {
    item[vScale.axis] = vScale.parse(entry, i);
  }
  return item;
}
function parseArrayOrPrimitive(meta, data, start, count) {
  var iScale = meta.iScale;
  var vScale = meta.vScale;
  var labels = iScale.getLabels();
  var singleScale = iScale === vScale;
  var parsed = [];
  var i, ilen, item, entry;
  for (i = start, ilen = start + count; i < ilen; ++i) {
    entry = data[i];
    item = {};
    item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
    parsed.push(parseValue(entry, item, vScale, i));
  }
  return parsed;
}
function isFloatBar(custom) {
  return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
}
function barSign(size, vScale, actualBase) {
  if (size !== 0) {
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(size);
  }
  return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
function borderProps(properties) {
  var reverse, start, end, top, bottom;
  if (properties.horizontal) {
    reverse = properties.base > properties.x;
    start = 'left';
    end = 'right';
  } else {
    reverse = properties.base < properties.y;
    start = 'bottom';
    end = 'top';
  }
  if (reverse) {
    top = 'end';
    bottom = 'start';
  } else {
    top = 'start';
    bottom = 'end';
  }
  return {
    start: start,
    end: end,
    reverse: reverse,
    top: top,
    bottom: bottom
  };
}
function setBorderSkipped(properties, options, stack, index) {
  var edge = options.borderSkipped;
  var res = {};
  if (!edge) {
    properties.borderSkipped = res;
    return;
  }
  if (edge === true) {
    properties.borderSkipped = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
    return;
  }
  var _borderProps = borderProps(properties),
    start = _borderProps.start,
    end = _borderProps.end,
    reverse = _borderProps.reverse,
    top = _borderProps.top,
    bottom = _borderProps.bottom;
  if (edge === 'middle' && stack) {
    properties.enableBorderRadius = true;
    if ((stack._top || 0) === index) {
      edge = top;
    } else if ((stack._bottom || 0) === index) {
      edge = bottom;
    } else {
      res[parseEdge(bottom, start, end, reverse)] = true;
      edge = top;
    }
  }
  res[parseEdge(edge, start, end, reverse)] = true;
  properties.borderSkipped = res;
}
function parseEdge(edge, a, b, reverse) {
  if (reverse) {
    edge = swap(edge, a, b);
    edge = startEnd(edge, b, a);
  } else {
    edge = startEnd(edge, a, b);
  }
  return edge;
}
function swap(orig, v1, v2) {
  return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
function startEnd(v, start, end) {
  return v === 'start' ? start : v === 'end' ? end : v;
}
function setInflateAmount(properties, _ref, ratio) {
  var inflateAmount = _ref.inflateAmount;
  properties.inflateAmount = inflateAmount === 'auto' ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
var BarController = /*#__PURE__*/function (_DatasetController) {
  _inherits(BarController, _DatasetController);
  var _super = _createSuper(BarController);
  function BarController() {
    _classCallCheck(this, BarController);
    return _super.apply(this, arguments);
  }
  _createClass(BarController, [{
    key: "parsePrimitiveData",
    value: function parsePrimitiveData(meta, data, start, count) {
      return parseArrayOrPrimitive(meta, data, start, count);
    }
  }, {
    key: "parseArrayData",
    value: function parseArrayData(meta, data, start, count) {
      return parseArrayOrPrimitive(meta, data, start, count);
    }
  }, {
    key: "parseObjectData",
    value: function parseObjectData(meta, data, start, count) {
      var iScale = meta.iScale,
        vScale = meta.vScale;
      var _this$_parsing2 = this._parsing,
        _this$_parsing2$xAxis = _this$_parsing2.xAxisKey,
        xAxisKey = _this$_parsing2$xAxis === void 0 ? 'x' : _this$_parsing2$xAxis,
        _this$_parsing2$yAxis = _this$_parsing2.yAxisKey,
        yAxisKey = _this$_parsing2$yAxis === void 0 ? 'y' : _this$_parsing2$yAxis;
      var iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey;
      var vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey;
      var parsed = [];
      var i, ilen, item, obj;
      for (i = start, ilen = start + count; i < ilen; ++i) {
        obj = data[i];
        item = {};
        item[iScale.axis] = iScale.parse((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, iAxisKey), i);
        parsed.push(parseValue((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, vAxisKey), item, vScale, i));
      }
      return parsed;
    }
  }, {
    key: "updateRangeFromParsed",
    value: function updateRangeFromParsed(range, scale, parsed, stack) {
      _get(_getPrototypeOf(BarController.prototype), "updateRangeFromParsed", this).call(this, range, scale, parsed, stack);
      var custom = parsed._custom;
      if (custom && scale === this._cachedMeta.vScale) {
        range.min = Math.min(range.min, custom.min);
        range.max = Math.max(range.max, custom.max);
      }
    }
  }, {
    key: "getMaxOverflow",
    value: function getMaxOverflow() {
      return 0;
    }
  }, {
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var iScale = meta.iScale,
        vScale = meta.vScale;
      var parsed = this.getParsed(index);
      var custom = parsed._custom;
      var value = isFloatBar(custom) ? '[' + custom.start + ', ' + custom.end + ']' : '' + vScale.getLabelForValue(parsed[vScale.axis]);
      return {
        label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
        value: value
      };
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this.enableOptionSharing = true;
      _get(_getPrototypeOf(BarController.prototype), "initialize", this).call(this);
      var meta = this._cachedMeta;
      meta.stack = this.getDataset().stack;
    }
  }, {
    key: "update",
    value: function update(mode) {
      var meta = this._cachedMeta;
      this.updateElements(meta.data, 0, meta.data.length, mode);
    }
  }, {
    key: "updateElements",
    value: function updateElements(bars, start, count, mode) {
      var reset = mode === 'reset';
      var index = this.index,
        vScale = this._cachedMeta.vScale;
      var base = vScale.getBasePixel();
      var horizontal = vScale.isHorizontal();
      var ruler = this._getRuler();
      var _this$_getSharedOptio = this._getSharedOptions(start, mode),
        sharedOptions = _this$_getSharedOptio.sharedOptions,
        includeOptions = _this$_getSharedOptio.includeOptions;
      for (var i = start; i < start + count; i++) {
        var parsed = this.getParsed(i);
        var vpixels = reset || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vScale.axis]) ? {
          base: base,
          head: base
        } : this._calculateBarValuePixels(i);
        var ipixels = this._calculateBarIndexPixels(i, ruler);
        var stack = (parsed._stacks || {})[vScale.axis];
        var properties = {
          horizontal: horizontal,
          base: vpixels.base,
          enableBorderRadius: !stack || isFloatBar(parsed._custom) || index === stack._top || index === stack._bottom,
          x: horizontal ? vpixels.head : ipixels.center,
          y: horizontal ? ipixels.center : vpixels.head,
          height: horizontal ? ipixels.size : Math.abs(vpixels.size),
          width: horizontal ? Math.abs(vpixels.size) : ipixels.size
        };
        if (includeOptions) {
          properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? 'active' : mode);
        }
        var options = properties.options || bars[i].options;
        setBorderSkipped(properties, options, stack, index);
        setInflateAmount(properties, options, ruler.ratio);
        this.updateElement(bars[i], i, properties, mode);
      }
    }
  }, {
    key: "_getStacks",
    value: function _getStacks(last, dataIndex) {
      var iScale = this._cachedMeta.iScale;
      var metasets = iScale.getMatchingVisibleMetas(this._type).filter(function (meta) {
        return meta.controller.options.grouped;
      });
      var stacked = iScale.options.stacked;
      var stacks = [];
      var skipNull = function skipNull(meta) {
        var parsed = meta.controller.getParsed(dataIndex);
        var val = parsed && parsed[meta.vScale.axis];
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(val) || isNaN(val)) {
          return true;
        }
      };
      var _iterator4 = _createForOfIteratorHelper(metasets),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var meta = _step4.value;
          if (dataIndex !== undefined && skipNull(meta)) {
            continue;
          }
          if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === undefined && meta.stack === undefined) {
            stacks.push(meta.stack);
          }
          if (meta.index === last) {
            break;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      if (!stacks.length) {
        stacks.push(undefined);
      }
      return stacks;
    }
  }, {
    key: "_getStackCount",
    value: function _getStackCount(index) {
      return this._getStacks(undefined, index).length;
    }
  }, {
    key: "_getStackIndex",
    value: function _getStackIndex(datasetIndex, name, dataIndex) {
      var stacks = this._getStacks(datasetIndex, dataIndex);
      var index = name !== undefined ? stacks.indexOf(name) : -1;
      return index === -1 ? stacks.length - 1 : index;
    }
  }, {
    key: "_getRuler",
    value: function _getRuler() {
      var opts = this.options;
      var meta = this._cachedMeta;
      var iScale = meta.iScale;
      var pixels = [];
      var i, ilen;
      for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
        pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
      }
      var barThickness = opts.barThickness;
      var min = barThickness || computeMinSampleSize(meta);
      return {
        min: min,
        pixels: pixels,
        start: iScale._startPixel,
        end: iScale._endPixel,
        stackCount: this._getStackCount(),
        scale: iScale,
        grouped: opts.grouped,
        ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
      };
    }
  }, {
    key: "_calculateBarValuePixels",
    value: function _calculateBarValuePixels(index) {
      var _this$_cachedMeta = this._cachedMeta,
        vScale = _this$_cachedMeta.vScale,
        _stacked = _this$_cachedMeta._stacked,
        datasetIndex = _this$_cachedMeta.index,
        _this$options = this.options,
        baseValue = _this$options.base,
        minBarLength = _this$options.minBarLength;
      var actualBase = baseValue || 0;
      var parsed = this.getParsed(index);
      var custom = parsed._custom;
      var floating = isFloatBar(custom);
      var value = parsed[vScale.axis];
      var start = 0;
      var length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
      var head, size;
      if (length !== value) {
        start = length - value;
        length = value;
      }
      if (floating) {
        value = custom.barStart;
        length = custom.barEnd - custom.barStart;
        if (value !== 0 && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(value) !== (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(custom.barEnd)) {
          start = 0;
        }
        start += value;
      }
      var startValue = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(baseValue) && !floating ? baseValue : start;
      var base = vScale.getPixelForValue(startValue);
      if (this.chart.getDataVisibility(index)) {
        head = vScale.getPixelForValue(start + length);
      } else {
        head = base;
      }
      size = head - base;
      if (Math.abs(size) < minBarLength) {
        size = barSign(size, vScale, actualBase) * minBarLength;
        if (value === actualBase) {
          base -= size / 2;
        }
        var startPixel = vScale.getPixelForDecimal(0);
        var endPixel = vScale.getPixelForDecimal(1);
        var min = Math.min(startPixel, endPixel);
        var max = Math.max(startPixel, endPixel);
        base = Math.max(Math.min(base, max), min);
        head = base + size;
        if (_stacked && !floating) {
          parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
        }
      }
      if (base === vScale.getPixelForValue(actualBase)) {
        var halfGrid = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(size) * vScale.getLineWidthForValue(actualBase) / 2;
        base += halfGrid;
        size -= halfGrid;
      }
      return {
        size: size,
        base: base,
        head: head,
        center: head + size / 2
      };
    }
  }, {
    key: "_calculateBarIndexPixels",
    value: function _calculateBarIndexPixels(index, ruler) {
      var scale = ruler.scale;
      var options = this.options;
      var skipNull = options.skipNull;
      var maxBarThickness = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.maxBarThickness, Infinity);
      var center, size;
      if (ruler.grouped) {
        var stackCount = skipNull ? this._getStackCount(index) : ruler.stackCount;
        var range = options.barThickness === 'flex' ? computeFlexCategoryTraits(index, ruler, options, stackCount) : computeFitCategoryTraits(index, ruler, options, stackCount);
        var stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index : undefined);
        center = range.start + range.chunk * stackIndex + range.chunk / 2;
        size = Math.min(maxBarThickness, range.chunk * range.ratio);
      } else {
        center = scale.getPixelForValue(this.getParsed(index)[scale.axis], index);
        size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
      }
      return {
        base: center - size / 2,
        head: center + size / 2,
        center: center,
        size: size
      };
    }
  }, {
    key: "draw",
    value: function draw() {
      var meta = this._cachedMeta;
      var vScale = meta.vScale;
      var rects = meta.data;
      var ilen = rects.length;
      var i = 0;
      for (; i < ilen; ++i) {
        if (this.getParsed(i)[vScale.axis] !== null) {
          rects[i].draw(this._ctx);
        }
      }
    }
  }]);
  return BarController;
}(DatasetController);
_defineProperty(BarController, "id", 'bar');
_defineProperty(BarController, "defaults", {
  datasetElementType: false,
  dataElementType: 'bar',
  categoryPercentage: 0.8,
  barPercentage: 0.9,
  grouped: true,
  animations: {
    numbers: {
      type: 'number',
      properties: ['x', 'y', 'base', 'width', 'height']
    }
  }
});
_defineProperty(BarController, "overrides", {
  scales: {
    _index_: {
      type: 'category',
      offset: true,
      grid: {
        offset: true
      }
    },
    _value_: {
      type: 'linear',
      beginAtZero: true
    }
  }
});
var BubbleController = /*#__PURE__*/function (_DatasetController2) {
  _inherits(BubbleController, _DatasetController2);
  var _super2 = _createSuper(BubbleController);
  function BubbleController() {
    _classCallCheck(this, BubbleController);
    return _super2.apply(this, arguments);
  }
  _createClass(BubbleController, [{
    key: "initialize",
    value: function initialize() {
      this.enableOptionSharing = true;
      _get(_getPrototypeOf(BubbleController.prototype), "initialize", this).call(this);
    }
  }, {
    key: "parsePrimitiveData",
    value: function parsePrimitiveData(meta, data, start, count) {
      var parsed = _get(_getPrototypeOf(BubbleController.prototype), "parsePrimitiveData", this).call(this, meta, data, start, count);
      for (var i = 0; i < parsed.length; i++) {
        parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
      }
      return parsed;
    }
  }, {
    key: "parseArrayData",
    value: function parseArrayData(meta, data, start, count) {
      var parsed = _get(_getPrototypeOf(BubbleController.prototype), "parseArrayData", this).call(this, meta, data, start, count);
      for (var i = 0; i < parsed.length; i++) {
        var item = data[start + i];
        parsed[i]._custom = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(item[2], this.resolveDataElementOptions(i + start).radius);
      }
      return parsed;
    }
  }, {
    key: "parseObjectData",
    value: function parseObjectData(meta, data, start, count) {
      var parsed = _get(_getPrototypeOf(BubbleController.prototype), "parseObjectData", this).call(this, meta, data, start, count);
      for (var i = 0; i < parsed.length; i++) {
        var item = data[start + i];
        parsed[i]._custom = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
      }
      return parsed;
    }
  }, {
    key: "getMaxOverflow",
    value: function getMaxOverflow() {
      var data = this._cachedMeta.data;
      var max = 0;
      for (var i = data.length - 1; i >= 0; --i) {
        max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
      }
      return max > 0 && max;
    }
  }, {
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var labels = this.chart.data.labels || [];
      var xScale = meta.xScale,
        yScale = meta.yScale;
      var parsed = this.getParsed(index);
      var x = xScale.getLabelForValue(parsed.x);
      var y = yScale.getLabelForValue(parsed.y);
      var r = parsed._custom;
      return {
        label: labels[index] || '',
        value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
      };
    }
  }, {
    key: "update",
    value: function update(mode) {
      var points = this._cachedMeta.data;
      this.updateElements(points, 0, points.length, mode);
    }
  }, {
    key: "updateElements",
    value: function updateElements(points, start, count, mode) {
      var reset = mode === 'reset';
      var _this$_cachedMeta2 = this._cachedMeta,
        iScale = _this$_cachedMeta2.iScale,
        vScale = _this$_cachedMeta2.vScale;
      var _this$_getSharedOptio2 = this._getSharedOptions(start, mode),
        sharedOptions = _this$_getSharedOptio2.sharedOptions,
        includeOptions = _this$_getSharedOptio2.includeOptions;
      var iAxis = iScale.axis;
      var vAxis = vScale.axis;
      for (var i = start; i < start + count; i++) {
        var point = points[i];
        var parsed = !reset && this.getParsed(i);
        var properties = {};
        var iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
        var vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
        properties.skip = isNaN(iPixel) || isNaN(vPixel);
        if (includeOptions) {
          properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
          if (reset) {
            properties.options.radius = 0;
          }
        }
        this.updateElement(point, i, properties, mode);
      }
    }
  }, {
    key: "resolveDataElementOptions",
    value: function resolveDataElementOptions(index, mode) {
      var parsed = this.getParsed(index);
      var values = _get(_getPrototypeOf(BubbleController.prototype), "resolveDataElementOptions", this).call(this, index, mode);
      if (values.$shared) {
        values = Object.assign({}, values, {
          $shared: false
        });
      }
      var radius = values.radius;
      if (mode !== 'active') {
        values.radius = 0;
      }
      values.radius += (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(parsed && parsed._custom, radius);
      return values;
    }
  }]);
  return BubbleController;
}(DatasetController);
_defineProperty(BubbleController, "id", 'bubble');
_defineProperty(BubbleController, "defaults", {
  datasetElementType: false,
  dataElementType: 'point',
  animations: {
    numbers: {
      type: 'number',
      properties: ['x', 'y', 'borderWidth', 'radius']
    }
  }
});
_defineProperty(BubbleController, "overrides", {
  scales: {
    x: {
      type: 'linear'
    },
    y: {
      type: 'linear'
    }
  }
});
function getRatioAndOffset(rotation, circumference, cutout) {
  var ratioX = 1;
  var ratioY = 1;
  var offsetX = 0;
  var offsetY = 0;
  if (circumference < _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T) {
    var startAngle = rotation;
    var endAngle = startAngle + circumference;
    var startX = Math.cos(startAngle);
    var startY = Math.sin(startAngle);
    var endX = Math.cos(endAngle);
    var endY = Math.sin(endAngle);
    var calcMax = function calcMax(angle, a, b) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
    };
    var calcMin = function calcMin(angle, a, b) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
    };
    var maxX = calcMax(0, startX, endX);
    var maxY = calcMax(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startY, endY);
    var minX = calcMin(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P, startX, endX);
    var minY = calcMin(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return {
    ratioX: ratioX,
    ratioY: ratioY,
    offsetX: offsetX,
    offsetY: offsetY
  };
}
var DoughnutController = /*#__PURE__*/function (_DatasetController3) {
  _inherits(DoughnutController, _DatasetController3);
  var _super3 = _createSuper(DoughnutController);
  function DoughnutController(chart, datasetIndex) {
    var _this4;
    _classCallCheck(this, DoughnutController);
    _this4 = _super3.call(this, chart, datasetIndex);
    _this4.enableOptionSharing = true;
    _this4.innerRadius = undefined;
    _this4.outerRadius = undefined;
    _this4.offsetX = undefined;
    _this4.offsetY = undefined;
    return _this4;
  }
  _createClass(DoughnutController, [{
    key: "linkScales",
    value: function linkScales() {}
  }, {
    key: "parse",
    value: function parse(start, count) {
      var data = this.getDataset().data;
      var meta = this._cachedMeta;
      if (this._parsing === false) {
        meta._parsed = data;
      } else {
        var getter = function getter(i) {
          return +data[i];
        };
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(data[start])) {
          var _this$_parsing$key = this._parsing.key,
            key = _this$_parsing$key === void 0 ? 'value' : _this$_parsing$key;
          getter = function getter(i) {
            return +(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(data[i], key);
          };
        }
        var i, ilen;
        for (i = start, ilen = start + count; i < ilen; ++i) {
          meta._parsed[i] = getter(i);
        }
      }
    }
  }, {
    key: "_getRotation",
    value: function _getRotation() {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.rotation - 90);
    }
  }, {
    key: "_getCircumference",
    value: function _getCircumference() {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.circumference);
    }
  }, {
    key: "_getRotationExtents",
    value: function _getRotationExtents() {
      var min = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T;
      var max = -_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T;
      for (var i = 0; i < this.chart.data.datasets.length; ++i) {
        if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
          var controller = this.chart.getDatasetMeta(i).controller;
          var rotation = controller._getRotation();
          var circumference = controller._getCircumference();
          min = Math.min(min, rotation);
          max = Math.max(max, rotation + circumference);
        }
      }
      return {
        rotation: min,
        circumference: max - min
      };
    }
  }, {
    key: "update",
    value: function update(mode) {
      var chart = this.chart;
      var chartArea = chart.chartArea;
      var meta = this._cachedMeta;
      var arcs = meta.data;
      var spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
      var maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
      var cutout = Math.min((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.m)(this.options.cutout, maxSize), 1);
      var chartWeight = this._getRingWeight(this.index);
      var _this$_getRotationExt = this._getRotationExtents(),
        circumference = _this$_getRotationExt.circumference,
        rotation = _this$_getRotationExt.rotation;
      var _getRatioAndOffset = getRatioAndOffset(rotation, circumference, cutout),
        ratioX = _getRatioAndOffset.ratioX,
        ratioY = _getRatioAndOffset.ratioY,
        offsetX = _getRatioAndOffset.offsetX,
        offsetY = _getRatioAndOffset.offsetY;
      var maxWidth = (chartArea.width - spacing) / ratioX;
      var maxHeight = (chartArea.height - spacing) / ratioY;
      var maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
      var outerRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.n)(this.options.radius, maxRadius);
      var innerRadius = Math.max(outerRadius * cutout, 0);
      var radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
      this.offsetX = offsetX * outerRadius;
      this.offsetY = offsetY * outerRadius;
      meta.total = this.calculateTotal();
      this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
      this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
      this.updateElements(arcs, 0, arcs.length, mode);
    }
  }, {
    key: "_circumference",
    value: function _circumference(i, reset) {
      var opts = this.options;
      var meta = this._cachedMeta;
      var circumference = this._getCircumference();
      if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
        return 0;
      }
      return this.calculateCircumference(meta._parsed[i] * circumference / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
    }
  }, {
    key: "updateElements",
    value: function updateElements(arcs, start, count, mode) {
      var reset = mode === 'reset';
      var chart = this.chart;
      var chartArea = chart.chartArea;
      var opts = chart.options;
      var animationOpts = opts.animation;
      var centerX = (chartArea.left + chartArea.right) / 2;
      var centerY = (chartArea.top + chartArea.bottom) / 2;
      var animateScale = reset && animationOpts.animateScale;
      var innerRadius = animateScale ? 0 : this.innerRadius;
      var outerRadius = animateScale ? 0 : this.outerRadius;
      var _this$_getSharedOptio3 = this._getSharedOptions(start, mode),
        sharedOptions = _this$_getSharedOptio3.sharedOptions,
        includeOptions = _this$_getSharedOptio3.includeOptions;
      var startAngle = this._getRotation();
      var i;
      for (i = 0; i < start; ++i) {
        startAngle += this._circumference(i, reset);
      }
      for (i = start; i < start + count; ++i) {
        var circumference = this._circumference(i, reset);
        var arc = arcs[i];
        var properties = {
          x: centerX + this.offsetX,
          y: centerY + this.offsetY,
          startAngle: startAngle,
          endAngle: startAngle + circumference,
          circumference: circumference,
          outerRadius: outerRadius,
          innerRadius: innerRadius
        };
        if (includeOptions) {
          properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode);
        }
        startAngle += circumference;
        this.updateElement(arc, i, properties, mode);
      }
    }
  }, {
    key: "calculateTotal",
    value: function calculateTotal() {
      var meta = this._cachedMeta;
      var metaData = meta.data;
      var total = 0;
      var i;
      for (i = 0; i < metaData.length; i++) {
        var value = meta._parsed[i];
        if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
          total += Math.abs(value);
        }
      }
      return total;
    }
  }, {
    key: "calculateCircumference",
    value: function calculateCircumference(value) {
      var total = this._cachedMeta.total;
      if (total > 0 && !isNaN(value)) {
        return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T * (Math.abs(value) / total);
      }
      return 0;
    }
  }, {
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var chart = this.chart;
      var labels = chart.data.labels || [];
      var value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(meta._parsed[index], chart.options.locale);
      return {
        label: labels[index] || '',
        value: value
      };
    }
  }, {
    key: "getMaxBorderWidth",
    value: function getMaxBorderWidth(arcs) {
      var max = 0;
      var chart = this.chart;
      var i, ilen, meta, controller, options;
      if (!arcs) {
        for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
          if (chart.isDatasetVisible(i)) {
            meta = chart.getDatasetMeta(i);
            arcs = meta.data;
            controller = meta.controller;
            break;
          }
        }
      }
      if (!arcs) {
        return 0;
      }
      for (i = 0, ilen = arcs.length; i < ilen; ++i) {
        options = controller.resolveDataElementOptions(i);
        if (options.borderAlign !== 'inner') {
          max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
        }
      }
      return max;
    }
  }, {
    key: "getMaxOffset",
    value: function getMaxOffset(arcs) {
      var max = 0;
      for (var i = 0, ilen = arcs.length; i < ilen; ++i) {
        var options = this.resolveDataElementOptions(i);
        max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
      }
      return max;
    }
  }, {
    key: "_getRingWeightOffset",
    value: function _getRingWeightOffset(datasetIndex) {
      var ringWeightOffset = 0;
      for (var i = 0; i < datasetIndex; ++i) {
        if (this.chart.isDatasetVisible(i)) {
          ringWeightOffset += this._getRingWeight(i);
        }
      }
      return ringWeightOffset;
    }
  }, {
    key: "_getRingWeight",
    value: function _getRingWeight(datasetIndex) {
      return Math.max((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(this.chart.data.datasets[datasetIndex].weight, 1), 0);
    }
  }, {
    key: "_getVisibleDatasetWeightTotal",
    value: function _getVisibleDatasetWeightTotal() {
      return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
    }
  }]);
  return DoughnutController;
}(DatasetController);
_defineProperty(DoughnutController, "id", 'doughnut');
_defineProperty(DoughnutController, "defaults", {
  datasetElementType: false,
  dataElementType: 'arc',
  animation: {
    animateRotate: true,
    animateScale: false
  },
  animations: {
    numbers: {
      type: 'number',
      properties: ['circumference', 'endAngle', 'innerRadius', 'outerRadius', 'startAngle', 'x', 'y', 'offset', 'borderWidth', 'spacing']
    }
  },
  cutout: '50%',
  rotation: 0,
  circumference: 360,
  radius: '100%',
  spacing: 0,
  indexAxis: 'r'
});
_defineProperty(DoughnutController, "descriptors", {
  _scriptable: function _scriptable(name) {
    return name !== 'spacing';
  },
  _indexable: function _indexable(name) {
    return name !== 'spacing' && !name.startsWith('borderDash') && !name.startsWith('hoverBorderDash');
  }
});
_defineProperty(DoughnutController, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels: function generateLabels(chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            var _chart$legend$options2 = chart.legend.options.labels,
              pointStyle = _chart$legend$options2.pointStyle,
              color = _chart$legend$options2.color;
            return data.labels.map(function (label, i) {
              var meta = chart.getDatasetMeta(0);
              var style = meta.controller.getStyle(i);
              return {
                text: label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                fontColor: color,
                lineWidth: style.borderWidth,
                pointStyle: pointStyle,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
          return [];
        }
      },
      onClick: function onClick(e, legendItem, legend) {
        legend.chart.toggleDataVisibility(legendItem.index);
        legend.chart.update();
      }
    }
  }
});
var LineController = /*#__PURE__*/function (_DatasetController4) {
  _inherits(LineController, _DatasetController4);
  var _super4 = _createSuper(LineController);
  function LineController() {
    _classCallCheck(this, LineController);
    return _super4.apply(this, arguments);
  }
  _createClass(LineController, [{
    key: "initialize",
    value: function initialize() {
      this.enableOptionSharing = true;
      this.supportsDecimation = true;
      _get(_getPrototypeOf(LineController.prototype), "initialize", this).call(this);
    }
  }, {
    key: "update",
    value: function update(mode) {
      var meta = this._cachedMeta;
      var line = meta.dataset,
        _meta$data = meta.data,
        points = _meta$data === void 0 ? [] : _meta$data,
        _dataset = meta._dataset;
      var animationsDisabled = this.chart._animationsDisabled;
      var _getStartAndCountOfVi = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.q)(meta, points, animationsDisabled),
        start = _getStartAndCountOfVi.start,
        count = _getStartAndCountOfVi.count;
      this._drawStart = start;
      this._drawCount = count;
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.w)(meta)) {
        start = 0;
        count = points.length;
      }
      line._chart = this.chart;
      line._datasetIndex = this.index;
      line._decimated = !!_dataset._decimated;
      line.points = points;
      var options = this.resolveDatasetElementOptions(mode);
      if (!this.options.showLine) {
        options.borderWidth = 0;
      }
      options.segment = this.options.segment;
      this.updateElement(line, undefined, {
        animated: !animationsDisabled,
        options: options
      }, mode);
      this.updateElements(points, start, count, mode);
    }
  }, {
    key: "updateElements",
    value: function updateElements(points, start, count, mode) {
      var reset = mode === 'reset';
      var _this$_cachedMeta3 = this._cachedMeta,
        iScale = _this$_cachedMeta3.iScale,
        vScale = _this$_cachedMeta3.vScale,
        _stacked = _this$_cachedMeta3._stacked,
        _dataset = _this$_cachedMeta3._dataset;
      var _this$_getSharedOptio4 = this._getSharedOptions(start, mode),
        sharedOptions = _this$_getSharedOptio4.sharedOptions,
        includeOptions = _this$_getSharedOptio4.includeOptions;
      var iAxis = iScale.axis;
      var vAxis = vScale.axis;
      var _this$options2 = this.options,
        spanGaps = _this$options2.spanGaps,
        segment = _this$options2.segment;
      var maxGapLength = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
      var directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
      var end = start + count;
      var pointsCount = points.length;
      var prevParsed = start > 0 && this.getParsed(start - 1);
      for (var i = 0; i < pointsCount; ++i) {
        var point = points[i];
        var properties = directUpdate ? point : {};
        if (i < start || i >= end) {
          properties.skip = true;
          continue;
        }
        var parsed = this.getParsed(i);
        var nullData = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vAxis]);
        var iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
        var vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
        properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
        properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
        if (segment) {
          properties.parsed = parsed;
          properties.raw = _dataset.data[i];
        }
        if (includeOptions) {
          properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
        }
        if (!directUpdate) {
          this.updateElement(point, i, properties, mode);
        }
        prevParsed = parsed;
      }
    }
  }, {
    key: "getMaxOverflow",
    value: function getMaxOverflow() {
      var meta = this._cachedMeta;
      var dataset = meta.dataset;
      var border = dataset.options && dataset.options.borderWidth || 0;
      var data = meta.data || [];
      if (!data.length) {
        return border;
      }
      var firstPoint = data[0].size(this.resolveDataElementOptions(0));
      var lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
      return Math.max(border, firstPoint, lastPoint) / 2;
    }
  }, {
    key: "draw",
    value: function draw() {
      var meta = this._cachedMeta;
      meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
      _get(_getPrototypeOf(LineController.prototype), "draw", this).call(this);
    }
  }]);
  return LineController;
}(DatasetController);
_defineProperty(LineController, "id", 'line');
_defineProperty(LineController, "defaults", {
  datasetElementType: 'line',
  dataElementType: 'point',
  showLine: true,
  spanGaps: false
});
_defineProperty(LineController, "overrides", {
  scales: {
    _index_: {
      type: 'category'
    },
    _value_: {
      type: 'linear'
    }
  }
});
var PolarAreaController = /*#__PURE__*/function (_DatasetController5) {
  _inherits(PolarAreaController, _DatasetController5);
  var _super5 = _createSuper(PolarAreaController);
  function PolarAreaController(chart, datasetIndex) {
    var _this5;
    _classCallCheck(this, PolarAreaController);
    _this5 = _super5.call(this, chart, datasetIndex);
    _this5.innerRadius = undefined;
    _this5.outerRadius = undefined;
    return _this5;
  }
  _createClass(PolarAreaController, [{
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var chart = this.chart;
      var labels = chart.data.labels || [];
      var value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(meta._parsed[index].r, chart.options.locale);
      return {
        label: labels[index] || '',
        value: value
      };
    }
  }, {
    key: "parseObjectData",
    value: function parseObjectData(meta, data, start, count) {
      return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.y.bind(this)(meta, data, start, count);
    }
  }, {
    key: "update",
    value: function update(mode) {
      var arcs = this._cachedMeta.data;
      this._updateRadius();
      this.updateElements(arcs, 0, arcs.length, mode);
    }
  }, {
    key: "getMinMax",
    value: function getMinMax() {
      var _this6 = this;
      var meta = this._cachedMeta;
      var range = {
        min: Number.POSITIVE_INFINITY,
        max: Number.NEGATIVE_INFINITY
      };
      meta.data.forEach(function (element, index) {
        var parsed = _this6.getParsed(index).r;
        if (!isNaN(parsed) && _this6.chart.getDataVisibility(index)) {
          if (parsed < range.min) {
            range.min = parsed;
          }
          if (parsed > range.max) {
            range.max = parsed;
          }
        }
      });
      return range;
    }
  }, {
    key: "_updateRadius",
    value: function _updateRadius() {
      var chart = this.chart;
      var chartArea = chart.chartArea;
      var opts = chart.options;
      var minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      var outerRadius = Math.max(minSize / 2, 0);
      var innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
      var radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
      this.outerRadius = outerRadius - radiusLength * this.index;
      this.innerRadius = this.outerRadius - radiusLength;
    }
  }, {
    key: "updateElements",
    value: function updateElements(arcs, start, count, mode) {
      var reset = mode === 'reset';
      var chart = this.chart;
      var opts = chart.options;
      var animationOpts = opts.animation;
      var scale = this._cachedMeta.rScale;
      var centerX = scale.xCenter;
      var centerY = scale.yCenter;
      var datasetStartAngle = scale.getIndexAngle(0) - 0.5 * _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P;
      var angle = datasetStartAngle;
      var i;
      var defaultAngle = 360 / this.countVisibleElements();
      for (i = 0; i < start; ++i) {
        angle += this._computeAngle(i, mode, defaultAngle);
      }
      for (i = start; i < start + count; i++) {
        var arc = arcs[i];
        var startAngle = angle;
        var endAngle = angle + this._computeAngle(i, mode, defaultAngle);
        var outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
        angle = endAngle;
        if (reset) {
          if (animationOpts.animateScale) {
            outerRadius = 0;
          }
          if (animationOpts.animateRotate) {
            startAngle = endAngle = datasetStartAngle;
          }
        }
        var properties = {
          x: centerX,
          y: centerY,
          innerRadius: 0,
          outerRadius: outerRadius,
          startAngle: startAngle,
          endAngle: endAngle,
          options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode)
        };
        this.updateElement(arc, i, properties, mode);
      }
    }
  }, {
    key: "countVisibleElements",
    value: function countVisibleElements() {
      var _this7 = this;
      var meta = this._cachedMeta;
      var count = 0;
      meta.data.forEach(function (element, index) {
        if (!isNaN(_this7.getParsed(index).r) && _this7.chart.getDataVisibility(index)) {
          count++;
        }
      });
      return count;
    }
  }, {
    key: "_computeAngle",
    value: function _computeAngle(index, mode, defaultAngle) {
      return this.chart.getDataVisibility(index) ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.resolveDataElementOptions(index, mode).angle || defaultAngle) : 0;
    }
  }]);
  return PolarAreaController;
}(DatasetController);
_defineProperty(PolarAreaController, "id", 'polarArea');
_defineProperty(PolarAreaController, "defaults", {
  dataElementType: 'arc',
  animation: {
    animateRotate: true,
    animateScale: true
  },
  animations: {
    numbers: {
      type: 'number',
      properties: ['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius']
    }
  },
  indexAxis: 'r',
  startAngle: 0
});
_defineProperty(PolarAreaController, "overrides", {
  aspectRatio: 1,
  plugins: {
    legend: {
      labels: {
        generateLabels: function generateLabels(chart) {
          var data = chart.data;
          if (data.labels.length && data.datasets.length) {
            var _chart$legend$options3 = chart.legend.options.labels,
              pointStyle = _chart$legend$options3.pointStyle,
              color = _chart$legend$options3.color;
            return data.labels.map(function (label, i) {
              var meta = chart.getDatasetMeta(0);
              var style = meta.controller.getStyle(i);
              return {
                text: label,
                fillStyle: style.backgroundColor,
                strokeStyle: style.borderColor,
                fontColor: color,
                lineWidth: style.borderWidth,
                pointStyle: pointStyle,
                hidden: !chart.getDataVisibility(i),
                index: i
              };
            });
          }
          return [];
        }
      },
      onClick: function onClick(e, legendItem, legend) {
        legend.chart.toggleDataVisibility(legendItem.index);
        legend.chart.update();
      }
    }
  },
  scales: {
    r: {
      type: 'radialLinear',
      angleLines: {
        display: false
      },
      beginAtZero: true,
      grid: {
        circular: true
      },
      pointLabels: {
        display: false
      },
      startAngle: 0
    }
  }
});
var PieController = /*#__PURE__*/function (_DoughnutController) {
  _inherits(PieController, _DoughnutController);
  var _super6 = _createSuper(PieController);
  function PieController() {
    _classCallCheck(this, PieController);
    return _super6.apply(this, arguments);
  }
  return _createClass(PieController);
}(DoughnutController);
_defineProperty(PieController, "id", 'pie');
_defineProperty(PieController, "defaults", {
  cutout: 0,
  rotation: 0,
  circumference: 360,
  radius: '100%'
});
var RadarController = /*#__PURE__*/function (_DatasetController6) {
  _inherits(RadarController, _DatasetController6);
  var _super7 = _createSuper(RadarController);
  function RadarController() {
    _classCallCheck(this, RadarController);
    return _super7.apply(this, arguments);
  }
  _createClass(RadarController, [{
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var vScale = this._cachedMeta.vScale;
      var parsed = this.getParsed(index);
      return {
        label: vScale.getLabels()[index],
        value: '' + vScale.getLabelForValue(parsed[vScale.axis])
      };
    }
  }, {
    key: "parseObjectData",
    value: function parseObjectData(meta, data, start, count) {
      return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.y.bind(this)(meta, data, start, count);
    }
  }, {
    key: "update",
    value: function update(mode) {
      var meta = this._cachedMeta;
      var line = meta.dataset;
      var points = meta.data || [];
      var labels = meta.iScale.getLabels();
      line.points = points;
      if (mode !== 'resize') {
        var options = this.resolveDatasetElementOptions(mode);
        if (!this.options.showLine) {
          options.borderWidth = 0;
        }
        var properties = {
          _loop: true,
          _fullLoop: labels.length === points.length,
          options: options
        };
        this.updateElement(line, undefined, properties, mode);
      }
      this.updateElements(points, 0, points.length, mode);
    }
  }, {
    key: "updateElements",
    value: function updateElements(points, start, count, mode) {
      var scale = this._cachedMeta.rScale;
      var reset = mode === 'reset';
      for (var i = start; i < start + count; i++) {
        var point = points[i];
        var options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);
        var pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);
        var x = reset ? scale.xCenter : pointPosition.x;
        var y = reset ? scale.yCenter : pointPosition.y;
        var properties = {
          x: x,
          y: y,
          angle: pointPosition.angle,
          skip: isNaN(x) || isNaN(y),
          options: options
        };
        this.updateElement(point, i, properties, mode);
      }
    }
  }]);
  return RadarController;
}(DatasetController);
_defineProperty(RadarController, "id", 'radar');
_defineProperty(RadarController, "defaults", {
  datasetElementType: 'line',
  dataElementType: 'point',
  indexAxis: 'r',
  showLine: true,
  elements: {
    line: {
      fill: 'start'
    }
  }
});
_defineProperty(RadarController, "overrides", {
  aspectRatio: 1,
  scales: {
    r: {
      type: 'radialLinear'
    }
  }
});
var ScatterController = /*#__PURE__*/function (_DatasetController7) {
  _inherits(ScatterController, _DatasetController7);
  var _super8 = _createSuper(ScatterController);
  function ScatterController() {
    _classCallCheck(this, ScatterController);
    return _super8.apply(this, arguments);
  }
  _createClass(ScatterController, [{
    key: "getLabelAndValue",
    value: function getLabelAndValue(index) {
      var meta = this._cachedMeta;
      var labels = this.chart.data.labels || [];
      var xScale = meta.xScale,
        yScale = meta.yScale;
      var parsed = this.getParsed(index);
      var x = xScale.getLabelForValue(parsed.x);
      var y = yScale.getLabelForValue(parsed.y);
      return {
        label: labels[index] || '',
        value: '(' + x + ', ' + y + ')'
      };
    }
  }, {
    key: "update",
    value: function update(mode) {
      var meta = this._cachedMeta;
      var _meta$data2 = meta.data,
        points = _meta$data2 === void 0 ? [] : _meta$data2;
      var animationsDisabled = this.chart._animationsDisabled;
      var _getStartAndCountOfVi2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.q)(meta, points, animationsDisabled),
        start = _getStartAndCountOfVi2.start,
        count = _getStartAndCountOfVi2.count;
      this._drawStart = start;
      this._drawCount = count;
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.w)(meta)) {
        start = 0;
        count = points.length;
      }
      if (this.options.showLine) {
        if (!this.datasetElementType) {
          this.addElements();
        }
        var line = meta.dataset,
          _dataset = meta._dataset;
        line._chart = this.chart;
        line._datasetIndex = this.index;
        line._decimated = !!_dataset._decimated;
        line.points = points;
        var options = this.resolveDatasetElementOptions(mode);
        options.segment = this.options.segment;
        this.updateElement(line, undefined, {
          animated: !animationsDisabled,
          options: options
        }, mode);
      } else if (this.datasetElementType) {
        delete meta.dataset;
        this.datasetElementType = false;
      }
      this.updateElements(points, start, count, mode);
    }
  }, {
    key: "addElements",
    value: function addElements() {
      var showLine = this.options.showLine;
      if (!this.datasetElementType && showLine) {
        this.datasetElementType = this.chart.registry.getElement('line');
      }
      _get(_getPrototypeOf(ScatterController.prototype), "addElements", this).call(this);
    }
  }, {
    key: "updateElements",
    value: function updateElements(points, start, count, mode) {
      var reset = mode === 'reset';
      var _this$_cachedMeta4 = this._cachedMeta,
        iScale = _this$_cachedMeta4.iScale,
        vScale = _this$_cachedMeta4.vScale,
        _stacked = _this$_cachedMeta4._stacked,
        _dataset = _this$_cachedMeta4._dataset;
      var firstOpts = this.resolveDataElementOptions(start, mode);
      var sharedOptions = this.getSharedOptions(firstOpts);
      var includeOptions = this.includeOptions(mode, sharedOptions);
      var iAxis = iScale.axis;
      var vAxis = vScale.axis;
      var _this$options3 = this.options,
        spanGaps = _this$options3.spanGaps,
        segment = _this$options3.segment;
      var maxGapLength = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
      var directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
      var prevParsed = start > 0 && this.getParsed(start - 1);
      for (var i = start; i < start + count; ++i) {
        var point = points[i];
        var parsed = this.getParsed(i);
        var properties = directUpdate ? point : {};
        var nullData = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(parsed[vAxis]);
        var iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
        var vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
        properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
        properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
        if (segment) {
          properties.parsed = parsed;
          properties.raw = _dataset.data[i];
        }
        if (includeOptions) {
          properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
        }
        if (!directUpdate) {
          this.updateElement(point, i, properties, mode);
        }
        prevParsed = parsed;
      }
      this.updateSharedOptions(sharedOptions, mode, firstOpts);
    }
  }, {
    key: "getMaxOverflow",
    value: function getMaxOverflow() {
      var meta = this._cachedMeta;
      var data = meta.data || [];
      if (!this.options.showLine) {
        var max = 0;
        for (var i = data.length - 1; i >= 0; --i) {
          max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
        }
        return max > 0 && max;
      }
      var dataset = meta.dataset;
      var border = dataset.options && dataset.options.borderWidth || 0;
      if (!data.length) {
        return border;
      }
      var firstPoint = data[0].size(this.resolveDataElementOptions(0));
      var lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
      return Math.max(border, firstPoint, lastPoint) / 2;
    }
  }]);
  return ScatterController;
}(DatasetController);
_defineProperty(ScatterController, "id", 'scatter');
_defineProperty(ScatterController, "defaults", {
  datasetElementType: false,
  dataElementType: 'point',
  showLine: false,
  fill: false
});
_defineProperty(ScatterController, "overrides", {
  interaction: {
    mode: 'point'
  },
  scales: {
    x: {
      type: 'linear'
    },
    y: {
      type: 'linear'
    }
  }
});
var controllers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BarController: BarController,
  BubbleController: BubbleController,
  DoughnutController: DoughnutController,
  LineController: LineController,
  PieController: PieController,
  PolarAreaController: PolarAreaController,
  RadarController: RadarController,
  ScatterController: ScatterController
});

/**
 * @namespace Chart._adapters
 * @since 2.8.0
 * @private
 */
function _abstract() {
  throw new Error('This method is not implemented: Check that a complete date adapter is provided.');
}
/**
 * Date adapter (current used by the time scale)
 * @namespace Chart._adapters._date
 * @memberof Chart._adapters
 * @private
 */
var DateAdapterBase = /*#__PURE__*/function () {
  function DateAdapterBase(options) {
    _classCallCheck(this, DateAdapterBase);
    _defineProperty(this, "options", void 0);
    this.options = options || {};
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _createClass(DateAdapterBase, [{
    key: "init",
    value: function init() {}
  }, {
    key: "formats",
    value: function formats() {
      return _abstract();
    }
  }, {
    key: "parse",
    value: function parse() {
      return _abstract();
    }
  }, {
    key: "format",
    value: function format() {
      return _abstract();
    }
  }, {
    key: "add",
    value: function add() {
      return _abstract();
    }
  }, {
    key: "diff",
    value: function diff() {
      return _abstract();
    }
  }, {
    key: "startOf",
    value: function startOf() {
      return _abstract();
    }
  }, {
    key: "endOf",
    value: function endOf() {
      return _abstract();
    }
  }], [{
    key: "override",
    value:
    /**
    * Override default date adapter methods.
    * Accepts type parameter to define options type.
    * @example
    * Chart._adapters._date.override<{myAdapterOption: string}>({
    *   init() {
    *     console.log(this.options.myAdapterOption);
    *   }
    * })
    */
    function override(members) {
      Object.assign(DateAdapterBase.prototype, members);
    }
  }]);
  return DateAdapterBase;
}();
var adapters = {
  _date: DateAdapterBase
};
function binarySearch(metaset, axis, value, intersect) {
  var controller = metaset.controller,
    data = metaset.data,
    _sorted = metaset._sorted;
  var iScale = controller._cachedMeta.iScale;
  if (iScale && axis === iScale.axis && axis !== 'r' && _sorted && data.length) {
    var lookupMethod = iScale._reversePixels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.A : _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B;
    if (!intersect) {
      return lookupMethod(data, axis, value);
    } else if (controller._sharedOptions) {
      var el = data[0];
      var range = typeof el.getRange === 'function' && el.getRange(axis);
      if (range) {
        var start = lookupMethod(data, axis, value - range);
        var end = lookupMethod(data, axis, value + range);
        return {
          lo: start.lo,
          hi: end.hi
        };
      }
    }
  }
  return {
    lo: 0,
    hi: data.length - 1
  };
}
function evaluateInteractionItems(chart, axis, position, handler, intersect) {
  var metasets = chart.getSortedVisibleDatasetMetas();
  var value = position[axis];
  for (var i = 0, ilen = metasets.length; i < ilen; ++i) {
    var _metasets$i = metasets[i],
      _index2 = _metasets$i.index,
      data = _metasets$i.data;
    var _binarySearch = binarySearch(metasets[i], axis, value, intersect),
      lo = _binarySearch.lo,
      hi = _binarySearch.hi;
    for (var j = lo; j <= hi; ++j) {
      var element = data[j];
      if (!element.skip) {
        handler(element, _index2, j);
      }
    }
  }
}
function getDistanceMetricForAxis(axis) {
  var useX = axis.indexOf('x') !== -1;
  var useY = axis.indexOf('y') !== -1;
  return function (pt1, pt2) {
    var deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    var deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
  var items = [];
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }
  var evaluationFunc = function evaluationFunc(element, datasetIndex, index) {
    if (!includeInvisible && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(element, chart.chartArea, 0)) {
      return;
    }
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({
        element: element,
        datasetIndex: datasetIndex,
        index: index
      });
    }
  };
  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}
function getNearestRadialItems(chart, position, axis, useFinalPosition) {
  var items = [];
  function evaluationFunc(element, datasetIndex, index) {
    var _element$getProps = element.getProps(['startAngle', 'endAngle'], useFinalPosition),
      startAngle = _element$getProps.startAngle,
      endAngle = _element$getProps.endAngle;
    var _getAngleFromPoint = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.D)(element, {
        x: position.x,
        y: position.y
      }),
      angle = _getAngleFromPoint.angle;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle)) {
      items.push({
        element: element,
        datasetIndex: datasetIndex,
        index: index
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  var items = [];
  var distanceMetric = getDistanceMetricForAxis(axis);
  var minDistance = Number.POSITIVE_INFINITY;
  function evaluationFunc(element, datasetIndex, index) {
    var inRange = element.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange) {
      return;
    }
    var center = element.getCenterPoint(useFinalPosition);
    var pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange) {
      return;
    }
    var distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [{
        element: element,
        datasetIndex: datasetIndex,
        index: index
      }];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({
        element: element,
        datasetIndex: datasetIndex,
        index: index
      });
    }
  }
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }
  return axis === 'r' && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
  var items = [];
  var rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
  var intersectsItem = false;
  evaluateInteractionItems(chart, axis, position, function (element, datasetIndex, index) {
    if (element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({
        element: element,
        datasetIndex: datasetIndex,
        index: index
      });
      intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
    }
  });
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}
var Interaction = {
  evaluateInteractionItems: evaluateInteractionItems,
  modes: {
    index: function index(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      var axis = options.axis || 'x';
      var includeInvisible = options.includeInvisible || false;
      var items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      var elements = [];
      if (!items.length) {
        return [];
      }
      chart.getSortedVisibleDatasetMetas().forEach(function (meta) {
        var index = items[0].index;
        var element = meta.data[index];
        if (element && !element.skip) {
          elements.push({
            element: element,
            datasetIndex: meta.index,
            index: index
          });
        }
      });
      return elements;
    },
    dataset: function dataset(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      var axis = options.axis || 'xy';
      var includeInvisible = options.includeInvisible || false;
      var items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      if (items.length > 0) {
        var datasetIndex = items[0].datasetIndex;
        var data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (var i = 0; i < data.length; ++i) {
          items.push({
            element: data[i],
            datasetIndex: datasetIndex,
            index: i
          });
        }
      }
      return items;
    },
    point: function point(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      var axis = options.axis || 'xy';
      var includeInvisible = options.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },
    nearest: function nearest(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      var axis = options.axis || 'xy';
      var includeInvisible = options.includeInvisible || false;
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
    },
    x: function x(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      return getAxisItems(chart, position, 'x', options.intersect, useFinalPosition);
    },
    y: function y(chart, e, options, useFinalPosition) {
      var position = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(e, chart);
      return getAxisItems(chart, position, 'y', options.intersect, useFinalPosition);
    }
  }
};
var STATIC_POSITIONS = ['left', 'top', 'right', 'bottom'];
function filterByPosition(array, position) {
  return array.filter(function (v) {
    return v.pos === position;
  });
}
function filterDynamicPositionByAxis(array, axis) {
  return array.filter(function (v) {
    return STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis;
  });
}
function sortByWeight(array, reverse) {
  return array.sort(function (a, b) {
    var v0 = reverse ? b : a;
    var v1 = reverse ? a : b;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
function wrapBoxes(boxes) {
  var layoutBoxes = [];
  var i, ilen, box, pos, stack, stackWeight;
  for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
    box = boxes[i];
    var _box = box;
    pos = _box.position;
    var _box$options = _box.options;
    stack = _box$options.stack;
    var _box$options$stackWei = _box$options.stackWeight;
    stackWeight = _box$options$stackWei === void 0 ? 1 : _box$options$stackWei;
    layoutBoxes.push({
      index: i,
      box: box,
      pos: pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight: stackWeight
    });
  }
  return layoutBoxes;
}
function buildStacks(layouts) {
  var stacks = {};
  var _iterator5 = _createForOfIteratorHelper(layouts),
    _step5;
  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var wrap = _step5.value;
      var stack = wrap.stack,
        pos = wrap.pos,
        stackWeight = wrap.stackWeight;
      if (!stack || !STATIC_POSITIONS.includes(pos)) {
        continue;
      }
      var _stack = stacks[stack] || (stacks[stack] = {
        count: 0,
        placed: 0,
        weight: 0,
        size: 0
      });
      _stack.count++;
      _stack.weight += stackWeight;
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }
  return stacks;
}
function setLayoutDims(layouts, params) {
  var stacks = buildStacks(layouts);
  var vBoxMaxWidth = params.vBoxMaxWidth,
    hBoxMaxHeight = params.hBoxMaxHeight;
  var i, ilen, layout;
  for (i = 0, ilen = layouts.length; i < ilen; ++i) {
    layout = layouts[i];
    var fullSize = layout.box.fullSize;
    var stack = stacks[layout.stack];
    var factor = stack && layout.stackWeight / stack.weight;
    if (layout.horizontal) {
      layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout.height = hBoxMaxHeight;
    } else {
      layout.width = vBoxMaxWidth;
      layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
function buildLayoutBoxes(boxes) {
  var layoutBoxes = wrapBoxes(boxes);
  var fullSize = sortByWeight(layoutBoxes.filter(function (wrap) {
    return wrap.box.fullSize;
  }), true);
  var left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
  var right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
  var top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
  var bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
  var centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
  var centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');
  return {
    fullSize: fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, 'chartArea'),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
  };
}
function getCombinedMax(maxPadding, chartArea, a, b) {
  return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
function updateDims(chartArea, params, layout, stacks) {
  var pos = layout.pos,
    box = layout.box;
  var maxPadding = chartArea.maxPadding;
  if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(pos)) {
    if (layout.size) {
      chartArea[pos] -= layout.size;
    }
    var stack = stacks[layout.stack] || {
      size: 0,
      count: 1
    };
    stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
    layout.size = stack.size / stack.count;
    chartArea[pos] += layout.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  var newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right'));
  var newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom'));
  var widthChanged = newWidth !== chartArea.w;
  var heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout.horizontal ? {
    same: widthChanged,
    other: heightChanged
  } : {
    same: heightChanged,
    other: widthChanged
  };
}
function handleMaxPadding(chartArea) {
  var maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    var change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  chartArea.y += updatePos('top');
  chartArea.x += updatePos('left');
  updatePos('right');
  updatePos('bottom');
}
function getMargins(horizontal, chartArea) {
  var maxPadding = chartArea.maxPadding;
  function marginForPositions(positions) {
    var margin = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    positions.forEach(function (pos) {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  return horizontal ? marginForPositions(['left', 'right']) : marginForPositions(['top', 'bottom']);
}
function fitBoxes(boxes, chartArea, params, stacks) {
  var refitBoxes = [];
  var i, ilen, layout, box, refit, changed;
  for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
    layout = boxes[i];
    box = layout.box;
    box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
    var _updateDims = updateDims(chartArea, params, layout, stacks),
      same = _updateDims.same,
      other = _updateDims.other;
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
function placeBoxes(boxes, chartArea, params, stacks) {
  var userPadding = params.padding;
  var x = chartArea.x,
    y = chartArea.y;
  var _iterator6 = _createForOfIteratorHelper(boxes),
    _step6;
  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var layout = _step6.value;
      var box = layout.box;
      var stack = stacks[layout.stack] || {
        count: 1,
        placed: 0,
        weight: 1
      };
      var weight = layout.stackWeight / stack.weight || 1;
      if (layout.horizontal) {
        var width = chartArea.w * weight;
        var height = stack.size || box.height;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(stack.start)) {
          y = stack.start;
        }
        if (box.fullSize) {
          setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
        } else {
          setBoxDims(box, chartArea.left + stack.placed, y, width, height);
        }
        stack.start = y;
        stack.placed += width;
        y = box.bottom;
      } else {
        var _height = chartArea.h * weight;
        var _width = stack.size || box.width;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(stack.start)) {
          x = stack.start;
        }
        if (box.fullSize) {
          setBoxDims(box, x, userPadding.top, _width, params.outerHeight - userPadding.bottom - userPadding.top);
        } else {
          setBoxDims(box, x, chartArea.top + stack.placed, _width, _height);
        }
        stack.start = x;
        stack.placed += _height;
        x = box.right;
      }
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
  chartArea.x = x;
  chartArea.y = y;
}
var layouts = {
  addBox: function addBox(chart, item) {
    if (!chart.boxes) {
      chart.boxes = [];
    }
    item.fullSize = item.fullSize || false;
    item.position = item.position || 'top';
    item.weight = item.weight || 0;
    item._layers = item._layers || function () {
      return [{
        z: 0,
        draw: function draw(chartArea) {
          item.draw(chartArea);
        }
      }];
    };
    chart.boxes.push(item);
  },
  removeBox: function removeBox(chart, layoutItem) {
    var index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
    if (index !== -1) {
      chart.boxes.splice(index, 1);
    }
  },
  configure: function configure(chart, item, options) {
    item.fullSize = options.fullSize;
    item.position = options.position;
    item.weight = options.weight;
  },
  update: function update(chart, width, height, minPadding) {
    if (!chart) {
      return;
    }
    var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(chart.options.layout.padding);
    var availableWidth = Math.max(width - padding.width, 0);
    var availableHeight = Math.max(height - padding.height, 0);
    var boxes = buildLayoutBoxes(chart.boxes);
    var verticalBoxes = boxes.vertical;
    var horizontalBoxes = boxes.horizontal;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(chart.boxes, function (box) {
      if (typeof box.beforeLayout === 'function') {
        box.beforeLayout();
      }
    });
    var visibleVerticalBoxCount = verticalBoxes.reduce(function (total, wrap) {
      return wrap.box.options && wrap.box.options.display === false ? total : total + 1;
    }, 0) || 1;
    var params = Object.freeze({
      outerWidth: width,
      outerHeight: height,
      padding: padding,
      availableWidth: availableWidth,
      availableHeight: availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
      hBoxMaxHeight: availableHeight / 2
    });
    var maxPadding = Object.assign({}, padding);
    updateMaxPadding(maxPadding, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(minPadding));
    var chartArea = Object.assign({
      maxPadding: maxPadding,
      w: availableWidth,
      h: availableHeight,
      x: padding.left,
      y: padding.top
    }, padding);
    var stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
    fitBoxes(boxes.fullSize, chartArea, params, stacks);
    fitBoxes(verticalBoxes, chartArea, params, stacks);
    if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
      fitBoxes(verticalBoxes, chartArea, params, stacks);
    }
    handleMaxPadding(chartArea);
    placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
    chartArea.x += chartArea.w;
    chartArea.y += chartArea.h;
    placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
    chart.chartArea = {
      left: chartArea.left,
      top: chartArea.top,
      right: chartArea.left + chartArea.w,
      bottom: chartArea.top + chartArea.h,
      height: chartArea.h,
      width: chartArea.w
    };
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(boxes.chartArea, function (layout) {
      var box = layout.box;
      Object.assign(box, chart.chartArea);
      box.update(chartArea.w, chartArea.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
var BasePlatform = /*#__PURE__*/function () {
  function BasePlatform() {
    _classCallCheck(this, BasePlatform);
  }
  _createClass(BasePlatform, [{
    key: "acquireContext",
    value: function acquireContext(canvas, aspectRatio) {}
  }, {
    key: "releaseContext",
    value: function releaseContext(context) {
      return false;
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(chart, type, listener) {}
  }, {
    key: "removeEventListener",
    value: function removeEventListener(chart, type, listener) {}
  }, {
    key: "getDevicePixelRatio",
    value: function getDevicePixelRatio() {
      return 1;
    }
  }, {
    key: "getMaximumSize",
    value: function getMaximumSize(element, width, height, aspectRatio) {
      width = Math.max(0, width || element.width);
      height = height || element.height;
      return {
        width: width,
        height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
      };
    }
  }, {
    key: "isAttached",
    value: function isAttached(canvas) {
      return true;
    }
  }, {
    key: "updateConfig",
    value: function updateConfig(config) {}
  }]);
  return BasePlatform;
}();
var BasicPlatform = /*#__PURE__*/function (_BasePlatform) {
  _inherits(BasicPlatform, _BasePlatform);
  var _super9 = _createSuper(BasicPlatform);
  function BasicPlatform() {
    _classCallCheck(this, BasicPlatform);
    return _super9.apply(this, arguments);
  }
  _createClass(BasicPlatform, [{
    key: "acquireContext",
    value: function acquireContext(item) {
      return item && item.getContext && item.getContext('2d') || null;
    }
  }, {
    key: "updateConfig",
    value: function updateConfig(config) {
      config.options.animation = false;
    }
  }]);
  return BasicPlatform;
}(BasePlatform);
var EXPANDO_KEY = '$chartjs';
var EVENT_TYPES = {
  touchstart: 'mousedown',
  touchmove: 'mousemove',
  touchend: 'mouseup',
  pointerenter: 'mouseenter',
  pointerdown: 'mousedown',
  pointermove: 'mousemove',
  pointerup: 'mouseup',
  pointerleave: 'mouseout',
  pointerout: 'mouseout'
};
var isNullOrEmpty = function isNullOrEmpty(value) {
  return value === null || value === '';
};
function initCanvas(canvas, aspectRatio) {
  var style = canvas.style;
  var renderHeight = canvas.getAttribute('height');
  var renderWidth = canvas.getAttribute('width');
  canvas[EXPANDO_KEY] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || 'block';
  style.boxSizing = style.boxSizing || 'border-box';
  if (isNullOrEmpty(renderWidth)) {
    var displayWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.J)(canvas, 'width');
    if (displayWidth !== undefined) {
      canvas.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas.style.height === '') {
      canvas.height = canvas.width / (aspectRatio || 2);
    } else {
      var displayHeight = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.J)(canvas, 'height');
      if (displayHeight !== undefined) {
        canvas.height = displayHeight;
      }
    }
  }
  return canvas;
}
var eventListenerOptions = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.K ? {
  passive: true
} : false;
function addListener(node, type, listener) {
  node.addEventListener(type, listener, eventListenerOptions);
}
function removeListener(chart, type, listener) {
  chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
function fromNativeEvent(event, chart) {
  var type = EVENT_TYPES[event.type] || event.type;
  var _getRelativePosition = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z)(event, chart),
    x = _getRelativePosition.x,
    y = _getRelativePosition.y;
  return {
    type: type,
    chart: chart,
    "native": event,
    x: x !== undefined ? x : null,
    y: y !== undefined ? y : null
  };
}
function nodeListContains(nodeList, canvas) {
  var _iterator7 = _createForOfIteratorHelper(nodeList),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var node = _step7.value;
      if (node === canvas || node.contains(canvas)) {
        return true;
      }
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
}
function createAttachObserver(chart, type, listener) {
  var canvas = chart.canvas;
  var observer = new MutationObserver(function (entries) {
    var trigger = false;
    var _iterator8 = _createForOfIteratorHelper(entries),
      _step8;
    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var entry = _step8.value;
        trigger = trigger || nodeListContains(entry.addedNodes, canvas);
        trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
function createDetachObserver(chart, type, listener) {
  var canvas = chart.canvas;
  var observer = new MutationObserver(function (entries) {
    var trigger = false;
    var _iterator9 = _createForOfIteratorHelper(entries),
      _step9;
    try {
      for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
        var entry = _step9.value;
        trigger = trigger || nodeListContains(entry.removedNodes, canvas);
        trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
      }
    } catch (err) {
      _iterator9.e(err);
    } finally {
      _iterator9.f();
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
var drpListeningCharts = new Map();
var oldDevicePixelRatio = 0;
function onWindowResize() {
  var dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach(function (resize, chart) {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener('resize', onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts["delete"](chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener('resize', onWindowResize);
  }
}
function createResizeObserver(chart, type, listener) {
  var canvas = chart.canvas;
  var container = canvas && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.I)(canvas);
  if (!container) {
    return;
  }
  var resize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.L)(function (width, height) {
    var w = container.clientWidth;
    listener(width, height);
    if (w < container.clientWidth) {
      listener();
    }
  }, window);
  var observer = new ResizeObserver(function (entries) {
    var entry = entries[0];
    var width = entry.contentRect.width;
    var height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === 'resize') {
    unlistenDevicePixelRatioChanges(chart);
  }
}
function createProxyAndListen(chart, type, listener) {
  var canvas = chart.canvas;
  var proxy = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.L)(function (event) {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart);
  addListener(canvas, type, proxy);
  return proxy;
}
var DomPlatform = /*#__PURE__*/function (_BasePlatform2) {
  _inherits(DomPlatform, _BasePlatform2);
  var _super10 = _createSuper(DomPlatform);
  function DomPlatform() {
    _classCallCheck(this, DomPlatform);
    return _super10.apply(this, arguments);
  }
  _createClass(DomPlatform, [{
    key: "acquireContext",
    value: function acquireContext(canvas, aspectRatio) {
      var context = canvas && canvas.getContext && canvas.getContext('2d');
      if (context && context.canvas === canvas) {
        initCanvas(canvas, aspectRatio);
        return context;
      }
      return null;
    }
  }, {
    key: "releaseContext",
    value: function releaseContext(context) {
      var canvas = context.canvas;
      if (!canvas[EXPANDO_KEY]) {
        return false;
      }
      var initial = canvas[EXPANDO_KEY].initial;
      ['height', 'width'].forEach(function (prop) {
        var value = initial[prop];
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
          canvas.removeAttribute(prop);
        } else {
          canvas.setAttribute(prop, value);
        }
      });
      var style = initial.style || {};
      Object.keys(style).forEach(function (key) {
        canvas.style[key] = style[key];
      });
      canvas.width = canvas.width;
      delete canvas[EXPANDO_KEY];
      return true;
    }
  }, {
    key: "addEventListener",
    value: function addEventListener(chart, type, listener) {
      this.removeEventListener(chart, type);
      var proxies = chart.$proxies || (chart.$proxies = {});
      var handlers = {
        attach: createAttachObserver,
        detach: createDetachObserver,
        resize: createResizeObserver
      };
      var handler = handlers[type] || createProxyAndListen;
      proxies[type] = handler(chart, type, listener);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(chart, type) {
      var proxies = chart.$proxies || (chart.$proxies = {});
      var proxy = proxies[type];
      if (!proxy) {
        return;
      }
      var handlers = {
        attach: releaseObserver,
        detach: releaseObserver,
        resize: releaseObserver
      };
      var handler = handlers[type] || removeListener;
      handler(chart, type, proxy);
      proxies[type] = undefined;
    }
  }, {
    key: "getDevicePixelRatio",
    value: function getDevicePixelRatio() {
      return window.devicePixelRatio;
    }
  }, {
    key: "getMaximumSize",
    value: function getMaximumSize(canvas, width, height, aspectRatio) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.G)(canvas, width, height, aspectRatio);
    }
  }, {
    key: "isAttached",
    value: function isAttached(canvas) {
      var container = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.I)(canvas);
      return !!(container && container.isConnected);
    }
  }]);
  return DomPlatform;
}(BasePlatform);
function _detectPlatform(canvas) {
  if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.M)() || typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
var Element = /*#__PURE__*/function () {
  function Element() {
    _classCallCheck(this, Element);
    _defineProperty(this, "x", void 0);
    _defineProperty(this, "y", void 0);
    _defineProperty(this, "active", false);
    _defineProperty(this, "options", void 0);
    _defineProperty(this, "$animations", void 0);
  }
  _createClass(Element, [{
    key: "tooltipPosition",
    value: function tooltipPosition(useFinalPosition) {
      var _this$getProps = this.getProps(['x', 'y'], useFinalPosition),
        x = _this$getProps.x,
        y = _this$getProps.y;
      return {
        x: x,
        y: y
      };
    }
  }, {
    key: "hasValue",
    value: function hasValue() {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(this.x) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(this.y);
    }
  }, {
    key: "getProps",
    value: function getProps(props, _final) {
      var _this8 = this;
      var anims = this.$animations;
      if (!_final || !anims) {
        // let's not create an object, if not needed
        return this;
      }
      var ret = {};
      props.forEach(function (prop) {
        ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : _this8[prop];
      });
      return ret;
    }
  }]);
  return Element;
}();
_defineProperty(Element, "defaults", {});
_defineProperty(Element, "defaultRoutes", undefined);
function autoSkip(scale, ticks) {
  var tickOpts = scale.options.ticks;
  var determinedMaxTicks = determineMaxTicks(scale);
  var ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
  var majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  var numMajorIndices = majorIndices.length;
  var first = majorIndices[0];
  var last = majorIndices[numMajorIndices - 1];
  var newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  var spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    var i, ilen;
    var avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
      skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
    }
    skip(ticks, newTicks, spacing, last, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
function determineMaxTicks(scale) {
  var offset = scale.options.offset;
  var tickLength = scale._tickSize();
  var maxScale = scale._length / tickLength + (offset ? 0 : 1);
  var maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  var evenMajorSpacing = getEvenSpacing(majorIndices);
  var spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  var factors = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.N)(evenMajorSpacing);
  for (var i = 0, ilen = factors.length - 1; i < ilen; i++) {
    var factor = factors[i];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
function getMajorIndices(ticks) {
  var result = [];
  var i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  var count = 0;
  var next = majorIndices[0];
  var i;
  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  var start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(majorStart, 0);
  var end = Math.min((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(majorEnd, ticks.length), ticks.length);
  var count = 0;
  var length, i, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i = Math.max(start, 0); i < end; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
function getEvenSpacing(arr) {
  var len = arr.length;
  var i, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i = 1; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
var reverseAlign = function reverseAlign(align) {
  return align === 'left' ? 'right' : align === 'right' ? 'left' : align;
};
var offsetFromEdge = function offsetFromEdge(scale, edge, offset) {
  return edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset;
};
var getTicksLimit = function getTicksLimit(ticksLength, maxTicksLimit) {
  return Math.min(maxTicksLimit || ticksLength, ticksLength);
};
function sample(arr, numItems) {
  var result = [];
  var increment = arr.length / numItems;
  var len = arr.length;
  var i = 0;
  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}
function getPixelForGridLine(scale, index, offsetGridLines) {
  var length = scale.ticks.length;
  var validIndex = Math.min(index, length - 1);
  var start = scale._startPixel;
  var end = scale._endPixel;
  var epsilon = 1e-6;
  var lineValue = scale.getPixelForTick(validIndex);
  var offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
    }
    lineValue += validIndex < index ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
function garbageCollect(caches, length) {
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(caches, function (cache) {
    var gc = cache.gc;
    var gcLen = gc.length / 2;
    var i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}
function getTickMarkLength(options) {
  return options.drawTicks ? options.tickLength : 0;
}
function getTitleHeight(options, fallback) {
  if (!options.display) {
    return 0;
  }
  var font = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.font, fallback);
  var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
  var lines = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(options.text) ? options.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
function createScaleContext(parent, scale) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    scale: scale,
    type: 'scale'
  });
}
function createTickContext(parent, index, tick) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    tick: tick,
    index: index,
    type: 'tick'
  });
}
function titleAlign(align, position, reverse) {
  var ret = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(align);
  if (reverse && position !== 'right' || !reverse && position === 'right') {
    ret = reverseAlign(ret);
  }
  return ret;
}
function titleArgs(scale, offset, position, align) {
  var top = scale.top,
    left = scale.left,
    bottom = scale.bottom,
    right = scale.right,
    chart = scale.chart;
  var chartArea = chart.chartArea,
    scales = chart.scales;
  var rotation = 0;
  var maxWidth, titleX, titleY;
  var height = bottom - top;
  var width = right - left;
  if (scale.isHorizontal()) {
    titleX = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, left, right);
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
      var positionAxisID = Object.keys(position)[0];
      var value = position[positionAxisID];
      titleY = scales[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === 'center') {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
      var _positionAxisID = Object.keys(position)[0];
      var _value = position[_positionAxisID];
      titleX = scales[_positionAxisID].getPixelForValue(_value) - width + offset;
    } else if (position === 'center') {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, bottom, top);
    rotation = position === 'left' ? -_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H : _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H;
  }
  return {
    titleX: titleX,
    titleY: titleY,
    maxWidth: maxWidth,
    rotation: rotation
  };
}
var Scale = /*#__PURE__*/function (_Element) {
  _inherits(Scale, _Element);
  var _super11 = _createSuper(Scale);
  function Scale(cfg) {
    var _this9;
    _classCallCheck(this, Scale);
    _this9 = _super11.call(this);
    _this9.id = cfg.id;
    _this9.type = cfg.type;
    _this9.options = undefined;
    _this9.ctx = cfg.ctx;
    _this9.chart = cfg.chart;
    _this9.top = undefined;
    _this9.bottom = undefined;
    _this9.left = undefined;
    _this9.right = undefined;
    _this9.width = undefined;
    _this9.height = undefined;
    _this9._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    _this9.maxWidth = undefined;
    _this9.maxHeight = undefined;
    _this9.paddingTop = undefined;
    _this9.paddingBottom = undefined;
    _this9.paddingLeft = undefined;
    _this9.paddingRight = undefined;
    _this9.axis = undefined;
    _this9.labelRotation = undefined;
    _this9.min = undefined;
    _this9.max = undefined;
    _this9._range = undefined;
    _this9.ticks = [];
    _this9._gridLineItems = null;
    _this9._labelItems = null;
    _this9._labelSizes = null;
    _this9._length = 0;
    _this9._maxLength = 0;
    _this9._longestTextCache = {};
    _this9._startPixel = undefined;
    _this9._endPixel = undefined;
    _this9._reversePixels = false;
    _this9._userMax = undefined;
    _this9._userMin = undefined;
    _this9._suggestedMax = undefined;
    _this9._suggestedMin = undefined;
    _this9._ticksLength = 0;
    _this9._borderValue = 0;
    _this9._cache = {};
    _this9._dataLimitsCached = false;
    _this9.$context = undefined;
    return _this9;
  }
  _createClass(Scale, [{
    key: "init",
    value: function init(options) {
      this.options = options.setContext(this.getContext());
      this.axis = options.axis;
      this._userMin = this.parse(options.min);
      this._userMax = this.parse(options.max);
      this._suggestedMin = this.parse(options.suggestedMin);
      this._suggestedMax = this.parse(options.suggestedMax);
    }
  }, {
    key: "parse",
    value: function parse(raw, index) {
      return raw;
    }
  }, {
    key: "getUserBounds",
    value: function getUserBounds() {
      var _userMin = this._userMin,
        _userMax = this._userMax,
        _suggestedMin = this._suggestedMin,
        _suggestedMax = this._suggestedMax;
      _userMin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMin, Number.POSITIVE_INFINITY);
      _userMax = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMax, Number.NEGATIVE_INFINITY);
      _suggestedMin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_suggestedMin, Number.POSITIVE_INFINITY);
      _suggestedMax = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_suggestedMax, Number.NEGATIVE_INFINITY);
      return {
        min: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMin, _suggestedMin),
        max: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(_userMax, _suggestedMax),
        minDefined: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(_userMin),
        maxDefined: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(_userMax)
      };
    }
  }, {
    key: "getMinMax",
    value: function getMinMax(canStack) {
      var _this$getUserBounds = this.getUserBounds(),
        min = _this$getUserBounds.min,
        max = _this$getUserBounds.max,
        minDefined = _this$getUserBounds.minDefined,
        maxDefined = _this$getUserBounds.maxDefined;
      var range;
      if (minDefined && maxDefined) {
        return {
          min: min,
          max: max
        };
      }
      var metas = this.getMatchingVisibleMetas();
      for (var i = 0, ilen = metas.length; i < ilen; ++i) {
        range = metas[i].controller.getMinMax(this, canStack);
        if (!minDefined) {
          min = Math.min(min, range.min);
        }
        if (!maxDefined) {
          max = Math.max(max, range.max);
        }
      }
      min = maxDefined && min > max ? max : min;
      max = minDefined && min > max ? min : max;
      return {
        min: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(min, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(max, min)),
        max: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(max, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(min, max))
      };
    }
  }, {
    key: "getPadding",
    value: function getPadding() {
      return {
        left: this.paddingLeft || 0,
        top: this.paddingTop || 0,
        right: this.paddingRight || 0,
        bottom: this.paddingBottom || 0
      };
    }
  }, {
    key: "getTicks",
    value: function getTicks() {
      return this.ticks;
    }
  }, {
    key: "getLabels",
    value: function getLabels() {
      var data = this.chart.data;
      return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
    }
  }, {
    key: "getLabelItems",
    value: function getLabelItems() {
      var chartArea = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.chart.chartArea;
      var items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
      return items;
    }
  }, {
    key: "beforeLayout",
    value: function beforeLayout() {
      this._cache = {};
      this._dataLimitsCached = false;
    }
  }, {
    key: "beforeUpdate",
    value: function beforeUpdate() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeUpdate, [this]);
    }
  }, {
    key: "update",
    value: function update(maxWidth, maxHeight, margins) {
      var _this$options4 = this.options,
        beginAtZero = _this$options4.beginAtZero,
        grace = _this$options4.grace,
        tickOpts = _this$options4.ticks;
      var sampleSize = tickOpts.sampleSize;
      this.beforeUpdate();
      this.maxWidth = maxWidth;
      this.maxHeight = maxHeight;
      this._margins = margins = Object.assign({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }, margins);
      this.ticks = null;
      this._labelSizes = null;
      this._gridLineItems = null;
      this._labelItems = null;
      this.beforeSetDimensions();
      this.setDimensions();
      this.afterSetDimensions();
      this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
      if (!this._dataLimitsCached) {
        this.beforeDataLimits();
        this.determineDataLimits();
        this.afterDataLimits();
        this._range = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.R)(this, grace, beginAtZero);
        this._dataLimitsCached = true;
      }
      this.beforeBuildTicks();
      this.ticks = this.buildTicks() || [];
      this.afterBuildTicks();
      var samplingEnabled = sampleSize < this.ticks.length;
      this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
      this.configure();
      this.beforeCalculateLabelRotation();
      this.calculateLabelRotation();
      this.afterCalculateLabelRotation();
      if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
        this.ticks = autoSkip(this, this.ticks);
        this._labelSizes = null;
        this.afterAutoSkip();
      }
      if (samplingEnabled) {
        this._convertTicksToLabels(this.ticks);
      }
      this.beforeFit();
      this.fit();
      this.afterFit();
      this.afterUpdate();
    }
  }, {
    key: "configure",
    value: function configure() {
      var reversePixels = this.options.reverse;
      var startPixel, endPixel;
      if (this.isHorizontal()) {
        startPixel = this.left;
        endPixel = this.right;
      } else {
        startPixel = this.top;
        endPixel = this.bottom;
        reversePixels = !reversePixels;
      }
      this._startPixel = startPixel;
      this._endPixel = endPixel;
      this._reversePixels = reversePixels;
      this._length = endPixel - startPixel;
      this._alignToPixels = this.options.alignToPixels;
    }
  }, {
    key: "afterUpdate",
    value: function afterUpdate() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterUpdate, [this]);
    }
  }, {
    key: "beforeSetDimensions",
    value: function beforeSetDimensions() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeSetDimensions, [this]);
    }
  }, {
    key: "setDimensions",
    value: function setDimensions() {
      if (this.isHorizontal()) {
        this.width = this.maxWidth;
        this.left = 0;
        this.right = this.width;
      } else {
        this.height = this.maxHeight;
        this.top = 0;
        this.bottom = this.height;
      }
      this.paddingLeft = 0;
      this.paddingTop = 0;
      this.paddingRight = 0;
      this.paddingBottom = 0;
    }
  }, {
    key: "afterSetDimensions",
    value: function afterSetDimensions() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterSetDimensions, [this]);
    }
  }, {
    key: "_callHooks",
    value: function _callHooks(name) {
      this.chart.notifyPlugins(name, this.getContext());
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options[name], [this]);
    }
  }, {
    key: "beforeDataLimits",
    value: function beforeDataLimits() {
      this._callHooks('beforeDataLimits');
    }
  }, {
    key: "determineDataLimits",
    value: function determineDataLimits() {}
  }, {
    key: "afterDataLimits",
    value: function afterDataLimits() {
      this._callHooks('afterDataLimits');
    }
  }, {
    key: "beforeBuildTicks",
    value: function beforeBuildTicks() {
      this._callHooks('beforeBuildTicks');
    }
  }, {
    key: "buildTicks",
    value: function buildTicks() {
      return [];
    }
  }, {
    key: "afterBuildTicks",
    value: function afterBuildTicks() {
      this._callHooks('afterBuildTicks');
    }
  }, {
    key: "beforeTickToLabelConversion",
    value: function beforeTickToLabelConversion() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeTickToLabelConversion, [this]);
    }
  }, {
    key: "generateTickLabels",
    value: function generateTickLabels(ticks) {
      var tickOpts = this.options.ticks;
      var i, ilen, tick;
      for (i = 0, ilen = ticks.length; i < ilen; i++) {
        tick = ticks[i];
        tick.label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(tickOpts.callback, [tick.value, i, ticks], this);
      }
    }
  }, {
    key: "afterTickToLabelConversion",
    value: function afterTickToLabelConversion() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterTickToLabelConversion, [this]);
    }
  }, {
    key: "beforeCalculateLabelRotation",
    value: function beforeCalculateLabelRotation() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeCalculateLabelRotation, [this]);
    }
  }, {
    key: "calculateLabelRotation",
    value: function calculateLabelRotation() {
      var options = this.options;
      var tickOpts = options.ticks;
      var numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
      var minRotation = tickOpts.minRotation || 0;
      var maxRotation = tickOpts.maxRotation;
      var labelRotation = minRotation;
      var tickWidth, maxHeight, maxLabelDiagonal;
      if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
        this.labelRotation = minRotation;
        return;
      }
      var labelSizes = this._getLabelSizes();
      var maxLabelWidth = labelSizes.widest.width;
      var maxLabelHeight = labelSizes.highest.height;
      var maxWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(this.chart.width - maxLabelWidth, 0, this.maxWidth);
      tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
      if (maxLabelWidth + 6 > tickWidth) {
        tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
        maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
        maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
        labelRotation = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)(Math.min(Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(maxLabelHeight / maxLabelDiagonal, -1, 1))));
        labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
      }
      this.labelRotation = labelRotation;
    }
  }, {
    key: "afterCalculateLabelRotation",
    value: function afterCalculateLabelRotation() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterCalculateLabelRotation, [this]);
    }
  }, {
    key: "afterAutoSkip",
    value: function afterAutoSkip() {}
  }, {
    key: "beforeFit",
    value: function beforeFit() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.beforeFit, [this]);
    }
  }, {
    key: "fit",
    value: function fit() {
      var minSize = {
        width: 0,
        height: 0
      };
      var chart = this.chart,
        _this$options5 = this.options,
        tickOpts = _this$options5.ticks,
        titleOpts = _this$options5.title,
        gridOpts = _this$options5.grid;
      var display = this._isVisible();
      var isHorizontal = this.isHorizontal();
      if (display) {
        var titleHeight = getTitleHeight(titleOpts, chart.options.font);
        if (isHorizontal) {
          minSize.width = this.maxWidth;
          minSize.height = getTickMarkLength(gridOpts) + titleHeight;
        } else {
          minSize.height = this.maxHeight;
          minSize.width = getTickMarkLength(gridOpts) + titleHeight;
        }
        if (tickOpts.display && this.ticks.length) {
          var _this$_getLabelSizes = this._getLabelSizes(),
            first = _this$_getLabelSizes.first,
            last = _this$_getLabelSizes.last,
            widest = _this$_getLabelSizes.widest,
            highest = _this$_getLabelSizes.highest;
          var tickPadding = tickOpts.padding * 2;
          var angleRadians = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
          var cos = Math.cos(angleRadians);
          var sin = Math.sin(angleRadians);
          if (isHorizontal) {
            var labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
            minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
          } else {
            var labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
            minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
          }
          this._calculatePadding(first, last, sin, cos);
        }
      }
      this._handleMargins();
      if (isHorizontal) {
        this.width = this._length = chart.width - this._margins.left - this._margins.right;
        this.height = minSize.height;
      } else {
        this.width = minSize.width;
        this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
      }
    }
  }, {
    key: "_calculatePadding",
    value: function _calculatePadding(first, last, sin, cos) {
      var _this$options6 = this.options,
        _this$options6$ticks = _this$options6.ticks,
        align = _this$options6$ticks.align,
        padding = _this$options6$ticks.padding,
        position = _this$options6.position;
      var isRotated = this.labelRotation !== 0;
      var labelsBelowTicks = position !== 'top' && this.axis === 'x';
      if (this.isHorizontal()) {
        var offsetLeft = this.getPixelForTick(0) - this.left;
        var offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
        var paddingLeft = 0;
        var paddingRight = 0;
        if (isRotated) {
          if (labelsBelowTicks) {
            paddingLeft = cos * first.width;
            paddingRight = sin * last.height;
          } else {
            paddingLeft = sin * first.height;
            paddingRight = cos * last.width;
          }
        } else if (align === 'start') {
          paddingRight = last.width;
        } else if (align === 'end') {
          paddingLeft = first.width;
        } else if (align !== 'inner') {
          paddingLeft = first.width / 2;
          paddingRight = last.width / 2;
        }
        this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
        this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
      } else {
        var paddingTop = last.height / 2;
        var paddingBottom = first.height / 2;
        if (align === 'start') {
          paddingTop = 0;
          paddingBottom = first.height;
        } else if (align === 'end') {
          paddingTop = last.height;
          paddingBottom = 0;
        }
        this.paddingTop = paddingTop + padding;
        this.paddingBottom = paddingBottom + padding;
      }
    }
  }, {
    key: "_handleMargins",
    value: function _handleMargins() {
      if (this._margins) {
        this._margins.left = Math.max(this.paddingLeft, this._margins.left);
        this._margins.top = Math.max(this.paddingTop, this._margins.top);
        this._margins.right = Math.max(this.paddingRight, this._margins.right);
        this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
      }
    }
  }, {
    key: "afterFit",
    value: function afterFit() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(this.options.afterFit, [this]);
    }
  }, {
    key: "isHorizontal",
    value: function isHorizontal() {
      var _this$options7 = this.options,
        axis = _this$options7.axis,
        position = _this$options7.position;
      return position === 'top' || position === 'bottom' || axis === 'x';
    }
  }, {
    key: "isFullSize",
    value: function isFullSize() {
      return this.options.fullSize;
    }
  }, {
    key: "_convertTicksToLabels",
    value: function _convertTicksToLabels(ticks) {
      this.beforeTickToLabelConversion();
      this.generateTickLabels(ticks);
      var i, ilen;
      for (i = 0, ilen = ticks.length; i < ilen; i++) {
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(ticks[i].label)) {
          ticks.splice(i, 1);
          ilen--;
          i--;
        }
      }
      this.afterTickToLabelConversion();
    }
  }, {
    key: "_getLabelSizes",
    value: function _getLabelSizes() {
      var labelSizes = this._labelSizes;
      if (!labelSizes) {
        var sampleSize = this.options.ticks.sampleSize;
        var ticks = this.ticks;
        if (sampleSize < ticks.length) {
          ticks = sample(ticks, sampleSize);
        }
        this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
      }
      return labelSizes;
    }
  }, {
    key: "_computeLabelSizes",
    value: function _computeLabelSizes(ticks, length, maxTicksLimit) {
      var ctx = this.ctx,
        caches = this._longestTextCache;
      var widths = [];
      var heights = [];
      var increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
      var widestLabelSize = 0;
      var highestLabelSize = 0;
      var i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
      for (i = 0; i < length; i += increment) {
        label = ticks[i].label;
        tickFont = this._resolveTickFontOptions(i);
        ctx.font = fontString = tickFont.string;
        cache = caches[fontString] = caches[fontString] || {
          data: {},
          gc: []
        };
        lineHeight = tickFont.lineHeight;
        width = height = 0;
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(label) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label)) {
          width = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.V)(ctx, cache.data, cache.gc, width, label);
          height = lineHeight;
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label)) {
          for (j = 0, jlen = label.length; j < jlen; ++j) {
            nestedLabel = label[j];
            if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(nestedLabel) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(nestedLabel)) {
              width = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.V)(ctx, cache.data, cache.gc, width, nestedLabel);
              height += lineHeight;
            }
          }
        }
        widths.push(width);
        heights.push(height);
        widestLabelSize = Math.max(width, widestLabelSize);
        highestLabelSize = Math.max(height, highestLabelSize);
      }
      garbageCollect(caches, length);
      var widest = widths.indexOf(widestLabelSize);
      var highest = heights.indexOf(highestLabelSize);
      var valueAt = function valueAt(idx) {
        return {
          width: widths[idx] || 0,
          height: heights[idx] || 0
        };
      };
      return {
        first: valueAt(0),
        last: valueAt(length - 1),
        widest: valueAt(widest),
        highest: valueAt(highest),
        widths: widths,
        heights: heights
      };
    }
  }, {
    key: "getLabelForValue",
    value: function getLabelForValue(value) {
      return value;
    }
  }, {
    key: "getPixelForValue",
    value: function getPixelForValue(value, index) {
      return NaN;
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {}
  }, {
    key: "getPixelForTick",
    value: function getPixelForTick(index) {
      var ticks = this.ticks;
      if (index < 0 || index > ticks.length - 1) {
        return null;
      }
      return this.getPixelForValue(ticks[index].value);
    }
  }, {
    key: "getPixelForDecimal",
    value: function getPixelForDecimal(decimal) {
      if (this._reversePixels) {
        decimal = 1 - decimal;
      }
      var pixel = this._startPixel + decimal * this._length;
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.W)(this._alignToPixels ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(this.chart, pixel, 0) : pixel);
    }
  }, {
    key: "getDecimalForPixel",
    value: function getDecimalForPixel(pixel) {
      var decimal = (pixel - this._startPixel) / this._length;
      return this._reversePixels ? 1 - decimal : decimal;
    }
  }, {
    key: "getBasePixel",
    value: function getBasePixel() {
      return this.getPixelForValue(this.getBaseValue());
    }
  }, {
    key: "getBaseValue",
    value: function getBaseValue() {
      var min = this.min,
        max = this.max;
      return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
    }
  }, {
    key: "getContext",
    value: function getContext(index) {
      var ticks = this.ticks || [];
      if (index >= 0 && index < ticks.length) {
        var tick = ticks[index];
        return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick));
      }
      return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
    }
  }, {
    key: "_tickSize",
    value: function _tickSize() {
      var optionTicks = this.options.ticks;
      var rot = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
      var cos = Math.abs(Math.cos(rot));
      var sin = Math.abs(Math.sin(rot));
      var labelSizes = this._getLabelSizes();
      var padding = optionTicks.autoSkipPadding || 0;
      var w = labelSizes ? labelSizes.widest.width + padding : 0;
      var h = labelSizes ? labelSizes.highest.height + padding : 0;
      return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
    }
  }, {
    key: "_isVisible",
    value: function _isVisible() {
      var display = this.options.display;
      if (display !== 'auto') {
        return !!display;
      }
      return this.getMatchingVisibleMetas().length > 0;
    }
  }, {
    key: "_computeGridLineItems",
    value: function _computeGridLineItems(chartArea) {
      var axis = this.axis;
      var chart = this.chart;
      var options = this.options;
      var grid = options.grid,
        position = options.position,
        border = options.border;
      var offset = grid.offset;
      var isHorizontal = this.isHorizontal();
      var ticks = this.ticks;
      var ticksLength = ticks.length + (offset ? 1 : 0);
      var tl = getTickMarkLength(grid);
      var items = [];
      var borderOpts = border.setContext(this.getContext());
      var axisWidth = borderOpts.display ? borderOpts.width : 0;
      var axisHalfWidth = axisWidth / 2;
      var alignBorderValue = function alignBorderValue(pixel) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, pixel, axisWidth);
      };
      var borderValue, i, lineValue, alignedLineValue;
      var tx1, ty1, tx2, ty2, x1, y1, x2, y2;
      if (position === 'top') {
        borderValue = alignBorderValue(this.bottom);
        ty1 = this.bottom - tl;
        ty2 = borderValue - axisHalfWidth;
        y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
        y2 = chartArea.bottom;
      } else if (position === 'bottom') {
        borderValue = alignBorderValue(this.top);
        y1 = chartArea.top;
        y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
        ty1 = borderValue + axisHalfWidth;
        ty2 = this.top + tl;
      } else if (position === 'left') {
        borderValue = alignBorderValue(this.right);
        tx1 = this.right - tl;
        tx2 = borderValue - axisHalfWidth;
        x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
        x2 = chartArea.right;
      } else if (position === 'right') {
        borderValue = alignBorderValue(this.left);
        x1 = chartArea.left;
        x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
        tx1 = borderValue + axisHalfWidth;
        tx2 = this.left + tl;
      } else if (axis === 'x') {
        if (position === 'center') {
          borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
          var positionAxisID = Object.keys(position)[0];
          var value = position[positionAxisID];
          borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
        }
        y1 = chartArea.top;
        y2 = chartArea.bottom;
        ty1 = borderValue + axisHalfWidth;
        ty2 = ty1 + tl;
      } else if (axis === 'y') {
        if (position === 'center') {
          borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
          var _positionAxisID2 = Object.keys(position)[0];
          var _value2 = position[_positionAxisID2];
          borderValue = alignBorderValue(this.chart.scales[_positionAxisID2].getPixelForValue(_value2));
        }
        tx1 = borderValue - axisHalfWidth;
        tx2 = tx1 - tl;
        x1 = chartArea.left;
        x2 = chartArea.right;
      }
      var limit = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.ticks.maxTicksLimit, ticksLength);
      var step = Math.max(1, Math.ceil(ticksLength / limit));
      for (i = 0; i < ticksLength; i += step) {
        var context = this.getContext(i);
        var optsAtIndex = grid.setContext(context);
        var optsAtIndexBorder = border.setContext(context);
        var lineWidth = optsAtIndex.lineWidth;
        var lineColor = optsAtIndex.color;
        var borderDash = optsAtIndexBorder.dash || [];
        var borderDashOffset = optsAtIndexBorder.dashOffset;
        var tickWidth = optsAtIndex.tickWidth;
        var tickColor = optsAtIndex.tickColor;
        var tickBorderDash = optsAtIndex.tickBorderDash || [];
        var tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
        lineValue = getPixelForGridLine(this, i, offset);
        if (lineValue === undefined) {
          continue;
        }
        alignedLineValue = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, lineValue, lineWidth);
        if (isHorizontal) {
          tx1 = tx2 = x1 = x2 = alignedLineValue;
        } else {
          ty1 = ty2 = y1 = y2 = alignedLineValue;
        }
        items.push({
          tx1: tx1,
          ty1: ty1,
          tx2: tx2,
          ty2: ty2,
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2,
          width: lineWidth,
          color: lineColor,
          borderDash: borderDash,
          borderDashOffset: borderDashOffset,
          tickWidth: tickWidth,
          tickColor: tickColor,
          tickBorderDash: tickBorderDash,
          tickBorderDashOffset: tickBorderDashOffset
        });
      }
      this._ticksLength = ticksLength;
      this._borderValue = borderValue;
      return items;
    }
  }, {
    key: "_computeLabelItems",
    value: function _computeLabelItems(chartArea) {
      var axis = this.axis;
      var options = this.options;
      var position = options.position,
        optionTicks = options.ticks;
      var isHorizontal = this.isHorizontal();
      var ticks = this.ticks;
      var align = optionTicks.align,
        crossAlign = optionTicks.crossAlign,
        padding = optionTicks.padding,
        mirror = optionTicks.mirror;
      var tl = getTickMarkLength(options.grid);
      var tickAndPadding = tl + padding;
      var hTickAndPadding = mirror ? -padding : tickAndPadding;
      var rotation = -(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
      var items = [];
      var i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
      var textBaseline = 'middle';
      if (position === 'top') {
        y = this.bottom - hTickAndPadding;
        textAlign = this._getXAxisLabelAlignment();
      } else if (position === 'bottom') {
        y = this.top + hTickAndPadding;
        textAlign = this._getXAxisLabelAlignment();
      } else if (position === 'left') {
        var ret = this._getYAxisLabelAlignment(tl);
        textAlign = ret.textAlign;
        x = ret.x;
      } else if (position === 'right') {
        var _ret = this._getYAxisLabelAlignment(tl);
        textAlign = _ret.textAlign;
        x = _ret.x;
      } else if (axis === 'x') {
        if (position === 'center') {
          y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
          var positionAxisID = Object.keys(position)[0];
          var value = position[positionAxisID];
          y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
        }
        textAlign = this._getXAxisLabelAlignment();
      } else if (axis === 'y') {
        if (position === 'center') {
          x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
        } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
          var _positionAxisID3 = Object.keys(position)[0];
          var _value3 = position[_positionAxisID3];
          x = this.chart.scales[_positionAxisID3].getPixelForValue(_value3);
        }
        textAlign = this._getYAxisLabelAlignment(tl).textAlign;
      }
      if (axis === 'y') {
        if (align === 'start') {
          textBaseline = 'top';
        } else if (align === 'end') {
          textBaseline = 'bottom';
        }
      }
      var labelSizes = this._getLabelSizes();
      for (i = 0, ilen = ticks.length; i < ilen; ++i) {
        tick = ticks[i];
        label = tick.label;
        var optsAtIndex = optionTicks.setContext(this.getContext(i));
        pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
        font = this._resolveTickFontOptions(i);
        lineHeight = font.lineHeight;
        lineCount = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label) ? label.length : 1;
        var halfCount = lineCount / 2;
        var color = optsAtIndex.color;
        var strokeColor = optsAtIndex.textStrokeColor;
        var strokeWidth = optsAtIndex.textStrokeWidth;
        var tickTextAlign = textAlign;
        if (isHorizontal) {
          x = pixel;
          if (textAlign === 'inner') {
            if (i === ilen - 1) {
              tickTextAlign = !this.options.reverse ? 'right' : 'left';
            } else if (i === 0) {
              tickTextAlign = !this.options.reverse ? 'left' : 'right';
            } else {
              tickTextAlign = 'center';
            }
          }
          if (position === 'top') {
            if (crossAlign === 'near' || rotation !== 0) {
              textOffset = -lineCount * lineHeight + lineHeight / 2;
            } else if (crossAlign === 'center') {
              textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
            } else {
              textOffset = -labelSizes.highest.height + lineHeight / 2;
            }
          } else {
            if (crossAlign === 'near' || rotation !== 0) {
              textOffset = lineHeight / 2;
            } else if (crossAlign === 'center') {
              textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
            } else {
              textOffset = labelSizes.highest.height - lineCount * lineHeight;
            }
          }
          if (mirror) {
            textOffset *= -1;
          }
          if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
            x += lineHeight / 2 * Math.sin(rotation);
          }
        } else {
          y = pixel;
          textOffset = (1 - lineCount) * lineHeight / 2;
        }
        var backdrop = void 0;
        if (optsAtIndex.showLabelBackdrop) {
          var labelPadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(optsAtIndex.backdropPadding);
          var height = labelSizes.heights[i];
          var width = labelSizes.widths[i];
          var top = textOffset - labelPadding.top;
          var left = 0 - labelPadding.left;
          switch (textBaseline) {
            case 'middle':
              top -= height / 2;
              break;
            case 'bottom':
              top -= height;
              break;
          }
          switch (textAlign) {
            case 'center':
              left -= width / 2;
              break;
            case 'right':
              left -= width;
              break;
          }
          backdrop = {
            left: left,
            top: top,
            width: width + labelPadding.width,
            height: height + labelPadding.height,
            color: optsAtIndex.backdropColor
          };
        }
        items.push({
          label: label,
          font: font,
          textOffset: textOffset,
          options: {
            rotation: rotation,
            color: color,
            strokeColor: strokeColor,
            strokeWidth: strokeWidth,
            textAlign: tickTextAlign,
            textBaseline: textBaseline,
            translation: [x, y],
            backdrop: backdrop
          }
        });
      }
      return items;
    }
  }, {
    key: "_getXAxisLabelAlignment",
    value: function _getXAxisLabelAlignment() {
      var _this$options8 = this.options,
        position = _this$options8.position,
        ticks = _this$options8.ticks;
      var rotation = -(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.labelRotation);
      if (rotation) {
        return position === 'top' ? 'left' : 'right';
      }
      var align = 'center';
      if (ticks.align === 'start') {
        align = 'left';
      } else if (ticks.align === 'end') {
        align = 'right';
      } else if (ticks.align === 'inner') {
        align = 'inner';
      }
      return align;
    }
  }, {
    key: "_getYAxisLabelAlignment",
    value: function _getYAxisLabelAlignment(tl) {
      var _this$options9 = this.options,
        position = _this$options9.position,
        _this$options9$ticks = _this$options9.ticks,
        crossAlign = _this$options9$ticks.crossAlign,
        mirror = _this$options9$ticks.mirror,
        padding = _this$options9$ticks.padding;
      var labelSizes = this._getLabelSizes();
      var tickAndPadding = tl + padding;
      var widest = labelSizes.widest.width;
      var textAlign;
      var x;
      if (position === 'left') {
        if (mirror) {
          x = this.right + padding;
          if (crossAlign === 'near') {
            textAlign = 'left';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x += widest / 2;
          } else {
            textAlign = 'right';
            x += widest;
          }
        } else {
          x = this.right - tickAndPadding;
          if (crossAlign === 'near') {
            textAlign = 'right';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x -= widest / 2;
          } else {
            textAlign = 'left';
            x = this.left;
          }
        }
      } else if (position === 'right') {
        if (mirror) {
          x = this.left + padding;
          if (crossAlign === 'near') {
            textAlign = 'right';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x -= widest / 2;
          } else {
            textAlign = 'left';
            x -= widest;
          }
        } else {
          x = this.left + tickAndPadding;
          if (crossAlign === 'near') {
            textAlign = 'left';
          } else if (crossAlign === 'center') {
            textAlign = 'center';
            x += widest / 2;
          } else {
            textAlign = 'right';
            x = this.right;
          }
        }
      } else {
        textAlign = 'right';
      }
      return {
        textAlign: textAlign,
        x: x
      };
    }
  }, {
    key: "_computeLabelArea",
    value: function _computeLabelArea() {
      if (this.options.ticks.mirror) {
        return;
      }
      var chart = this.chart;
      var position = this.options.position;
      if (position === 'left' || position === 'right') {
        return {
          top: 0,
          left: this.left,
          bottom: chart.height,
          right: this.right
        };
      }
      if (position === 'top' || position === 'bottom') {
        return {
          top: this.top,
          left: 0,
          bottom: this.bottom,
          right: chart.width
        };
      }
    }
  }, {
    key: "drawBackground",
    value: function drawBackground() {
      var ctx = this.ctx,
        backgroundColor = this.options.backgroundColor,
        left = this.left,
        top = this.top,
        width = this.width,
        height = this.height;
      if (backgroundColor) {
        ctx.save();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(left, top, width, height);
        ctx.restore();
      }
    }
  }, {
    key: "getLineWidthForValue",
    value: function getLineWidthForValue(value) {
      var grid = this.options.grid;
      if (!this._isVisible() || !grid.display) {
        return 0;
      }
      var ticks = this.ticks;
      var index = ticks.findIndex(function (t) {
        return t.value === value;
      });
      if (index >= 0) {
        var opts = grid.setContext(this.getContext(index));
        return opts.lineWidth;
      }
      return 0;
    }
  }, {
    key: "drawGrid",
    value: function drawGrid(chartArea) {
      var grid = this.options.grid;
      var ctx = this.ctx;
      var items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
      var i, ilen;
      var drawLine = function drawLine(p1, p2, style) {
        if (!style.width || !style.color) {
          return;
        }
        ctx.save();
        ctx.lineWidth = style.width;
        ctx.strokeStyle = style.color;
        ctx.setLineDash(style.borderDash || []);
        ctx.lineDashOffset = style.borderDashOffset;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.restore();
      };
      if (grid.display) {
        for (i = 0, ilen = items.length; i < ilen; ++i) {
          var item = items[i];
          if (grid.drawOnChartArea) {
            drawLine({
              x: item.x1,
              y: item.y1
            }, {
              x: item.x2,
              y: item.y2
            }, item);
          }
          if (grid.drawTicks) {
            drawLine({
              x: item.tx1,
              y: item.ty1
            }, {
              x: item.tx2,
              y: item.ty2
            }, {
              color: item.tickColor,
              width: item.tickWidth,
              borderDash: item.tickBorderDash,
              borderDashOffset: item.tickBorderDashOffset
            });
          }
        }
      }
    }
  }, {
    key: "drawBorder",
    value: function drawBorder() {
      var chart = this.chart,
        ctx = this.ctx,
        _this$options10 = this.options,
        border = _this$options10.border,
        grid = _this$options10.grid;
      var borderOpts = border.setContext(this.getContext());
      var axisWidth = border.display ? borderOpts.width : 0;
      if (!axisWidth) {
        return;
      }
      var lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
      var borderValue = this._borderValue;
      var x1, x2, y1, y2;
      if (this.isHorizontal()) {
        x1 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.left, axisWidth) - axisWidth / 2;
        x2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.right, lastLineWidth) + lastLineWidth / 2;
        y1 = y2 = borderValue;
      } else {
        y1 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.top, axisWidth) - axisWidth / 2;
        y2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X)(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
        x1 = x2 = borderValue;
      }
      ctx.save();
      ctx.lineWidth = borderOpts.width;
      ctx.strokeStyle = borderOpts.color;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  }, {
    key: "drawLabels",
    value: function drawLabels(chartArea) {
      var optionTicks = this.options.ticks;
      if (!optionTicks.display) {
        return;
      }
      var ctx = this.ctx;
      var area = this._computeLabelArea();
      if (area) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, area);
      }
      var items = this.getLabelItems(chartArea);
      var _iterator10 = _createForOfIteratorHelper(items),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var item = _step10.value;
          var renderTextOptions = item.options;
          var tickFont = item.font;
          var label = item.label;
          var y = item.textOffset;
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, label, 0, y, tickFont, renderTextOptions);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
      if (area) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
      }
    }
  }, {
    key: "drawTitle",
    value: function drawTitle() {
      var ctx = this.ctx,
        _this$options11 = this.options,
        position = _this$options11.position,
        title = _this$options11.title,
        reverse = _this$options11.reverse;
      if (!title.display) {
        return;
      }
      var font = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(title.font);
      var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(title.padding);
      var align = title.align;
      var offset = font.lineHeight / 2;
      if (position === 'bottom' || position === 'center' || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(position)) {
        offset += padding.bottom;
        if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(title.text)) {
          offset += font.lineHeight * (title.text.length - 1);
        }
      } else {
        offset += padding.top;
      }
      var _titleArgs = titleArgs(this, offset, position, align),
        titleX = _titleArgs.titleX,
        titleY = _titleArgs.titleY,
        maxWidth = _titleArgs.maxWidth,
        rotation = _titleArgs.rotation;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, title.text, 0, 0, font, {
        color: title.color,
        maxWidth: maxWidth,
        rotation: rotation,
        textAlign: titleAlign(align, position, reverse),
        textBaseline: 'middle',
        translation: [titleX, titleY]
      });
    }
  }, {
    key: "draw",
    value: function draw(chartArea) {
      if (!this._isVisible()) {
        return;
      }
      this.drawBackground();
      this.drawGrid(chartArea);
      this.drawBorder();
      this.drawTitle();
      this.drawLabels(chartArea);
    }
  }, {
    key: "_layers",
    value: function _layers() {
      var _this10 = this;
      var opts = this.options;
      var tz = opts.ticks && opts.ticks.z || 0;
      var gz = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(opts.grid && opts.grid.z, -1);
      var bz = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(opts.border && opts.border.z, 0);
      if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
        return [{
          z: tz,
          draw: function draw(chartArea) {
            _this10.draw(chartArea);
          }
        }];
      }
      return [{
        z: gz,
        draw: function draw(chartArea) {
          _this10.drawBackground();
          _this10.drawGrid(chartArea);
          _this10.drawTitle();
        }
      }, {
        z: bz,
        draw: function draw() {
          _this10.drawBorder();
        }
      }, {
        z: tz,
        draw: function draw(chartArea) {
          _this10.drawLabels(chartArea);
        }
      }];
    }
  }, {
    key: "getMatchingVisibleMetas",
    value: function getMatchingVisibleMetas(type) {
      var metas = this.chart.getSortedVisibleDatasetMetas();
      var axisID = this.axis + 'AxisID';
      var result = [];
      var i, ilen;
      for (i = 0, ilen = metas.length; i < ilen; ++i) {
        var meta = metas[i];
        if (meta[axisID] === this.id && (!type || meta.type === type)) {
          result.push(meta);
        }
      }
      return result;
    }
  }, {
    key: "_resolveTickFontOptions",
    value: function _resolveTickFontOptions(index) {
      var opts = this.options.ticks.setContext(this.getContext(index));
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
    }
  }, {
    key: "_maxDigits",
    value: function _maxDigits() {
      var fontSize = this._resolveTickFontOptions(0).lineHeight;
      return (this.isHorizontal() ? this.width : this.height) / fontSize;
    }
  }]);
  return Scale;
}(Element);
var TypedRegistry = /*#__PURE__*/function () {
  function TypedRegistry(type, scope, override) {
    _classCallCheck(this, TypedRegistry);
    this.type = type;
    this.scope = scope;
    this.override = override;
    this.items = Object.create(null);
  }
  _createClass(TypedRegistry, [{
    key: "isForType",
    value: function isForType(type) {
      return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
    }
  }, {
    key: "register",
    value: function register(item) {
      var proto = Object.getPrototypeOf(item);
      var parentScope;
      if (isIChartComponent(proto)) {
        parentScope = this.register(proto);
      }
      var items = this.items;
      var id = item.id;
      var scope = this.scope + '.' + id;
      if (!id) {
        throw new Error('class does not have id: ' + item);
      }
      if (id in items) {
        return scope;
      }
      items[id] = item;
      registerDefaults(item, scope, parentScope);
      if (this.override) {
        _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.override(item.id, item.overrides);
      }
      return scope;
    }
  }, {
    key: "get",
    value: function get(id) {
      return this.items[id];
    }
  }, {
    key: "unregister",
    value: function unregister(item) {
      var items = this.items;
      var id = item.id;
      var scope = this.scope;
      if (id in items) {
        delete items[id];
      }
      if (scope && id in _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d[scope]) {
        delete _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d[scope][id];
        if (this.override) {
          delete _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[id];
        }
      }
    }
  }]);
  return TypedRegistry;
}();
function registerDefaults(item, scope, parentScope) {
  var itemDefaults = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a4)(Object.create(null), [parentScope ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.get(parentScope) : {}, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.get(scope), item.defaults]);
  _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.describe(scope, item.descriptors);
  }
}
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach(function (property) {
    var propertyParts = property.split('.');
    var sourceName = propertyParts.pop();
    var sourceScope = [scope].concat(propertyParts).join('.');
    var parts = routes[property].split('.');
    var targetName = parts.pop();
    var targetScope = parts.join('.');
    _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.route(sourceScope, sourceName, targetScope, targetName);
  });
}
function isIChartComponent(proto) {
  return 'id' in proto && 'defaults' in proto;
}
var Registry = /*#__PURE__*/function () {
  function Registry() {
    _classCallCheck(this, Registry);
    this.controllers = new TypedRegistry(DatasetController, 'datasets', true);
    this.elements = new TypedRegistry(Element, 'elements');
    this.plugins = new TypedRegistry(Object, 'plugins');
    this.scales = new TypedRegistry(Scale, 'scales');
    this._typedRegistries = [this.controllers, this.scales, this.elements];
  }
  _createClass(Registry, [{
    key: "add",
    value: function add() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      this._each('register', args);
    }
  }, {
    key: "remove",
    value: function remove() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      this._each('unregister', args);
    }
  }, {
    key: "addControllers",
    value: function addControllers() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      this._each('register', args, this.controllers);
    }
  }, {
    key: "addElements",
    value: function addElements() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      this._each('register', args, this.elements);
    }
  }, {
    key: "addPlugins",
    value: function addPlugins() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      this._each('register', args, this.plugins);
    }
  }, {
    key: "addScales",
    value: function addScales() {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }
      this._each('register', args, this.scales);
    }
  }, {
    key: "getController",
    value: function getController(id) {
      return this._get(id, this.controllers, 'controller');
    }
  }, {
    key: "getElement",
    value: function getElement(id) {
      return this._get(id, this.elements, 'element');
    }
  }, {
    key: "getPlugin",
    value: function getPlugin(id) {
      return this._get(id, this.plugins, 'plugin');
    }
  }, {
    key: "getScale",
    value: function getScale(id) {
      return this._get(id, this.scales, 'scale');
    }
  }, {
    key: "removeControllers",
    value: function removeControllers() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      this._each('unregister', args, this.controllers);
    }
  }, {
    key: "removeElements",
    value: function removeElements() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      this._each('unregister', args, this.elements);
    }
  }, {
    key: "removePlugins",
    value: function removePlugins() {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      this._each('unregister', args, this.plugins);
    }
  }, {
    key: "removeScales",
    value: function removeScales() {
      for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
        args[_key10] = arguments[_key10];
      }
      this._each('unregister', args, this.scales);
    }
  }, {
    key: "_each",
    value: function _each(method, args, typedRegistry) {
      var _this11 = this;
      _toConsumableArray(args).forEach(function (arg) {
        var reg = typedRegistry || _this11._getRegistryForType(arg);
        if (typedRegistry || reg.isForType(arg) || reg === _this11.plugins && arg.id) {
          _this11._exec(method, reg, arg);
        } else {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(arg, function (item) {
            var itemReg = typedRegistry || _this11._getRegistryForType(item);
            _this11._exec(method, itemReg, item);
          });
        }
      });
    }
  }, {
    key: "_exec",
    value: function _exec(method, registry, component) {
      var camelMethod = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a5)(method);
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(component['before' + camelMethod], [], component);
      registry[method](component);
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(component['after' + camelMethod], [], component);
    }
  }, {
    key: "_getRegistryForType",
    value: function _getRegistryForType(type) {
      for (var i = 0; i < this._typedRegistries.length; i++) {
        var reg = this._typedRegistries[i];
        if (reg.isForType(type)) {
          return reg;
        }
      }
      return this.plugins;
    }
  }, {
    key: "_get",
    value: function _get(id, typedRegistry, type) {
      var item = typedRegistry.get(id);
      if (item === undefined) {
        throw new Error('"' + id + '" is not a registered ' + type + '.');
      }
      return item;
    }
  }]);
  return Registry;
}();
var registry = /* #__PURE__ */new Registry();
var PluginService = /*#__PURE__*/function () {
  function PluginService() {
    _classCallCheck(this, PluginService);
    this._init = [];
  }
  _createClass(PluginService, [{
    key: "notify",
    value: function notify(chart, hook, args, filter) {
      if (hook === 'beforeInit') {
        this._init = this._createDescriptors(chart, true);
        this._notify(this._init, chart, 'install');
      }
      var descriptors = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
      var result = this._notify(descriptors, chart, hook, args);
      if (hook === 'afterDestroy') {
        this._notify(descriptors, chart, 'stop');
        this._notify(this._init, chart, 'uninstall');
      }
      return result;
    }
  }, {
    key: "_notify",
    value: function _notify(descriptors, chart, hook, args) {
      args = args || {};
      var _iterator11 = _createForOfIteratorHelper(descriptors),
        _step11;
      try {
        for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
          var descriptor = _step11.value;
          var plugin = descriptor.plugin;
          var method = plugin[hook];
          var params = [chart, args, descriptor.options];
          if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(method, params, plugin) === false && args.cancelable) {
            return false;
          }
        }
      } catch (err) {
        _iterator11.e(err);
      } finally {
        _iterator11.f();
      }
      return true;
    }
  }, {
    key: "invalidate",
    value: function invalidate() {
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(this._cache)) {
        this._oldCache = this._cache;
        this._cache = undefined;
      }
    }
  }, {
    key: "_descriptors",
    value: function _descriptors(chart) {
      if (this._cache) {
        return this._cache;
      }
      var descriptors = this._cache = this._createDescriptors(chart);
      this._notifyStateChanges(chart);
      return descriptors;
    }
  }, {
    key: "_createDescriptors",
    value: function _createDescriptors(chart, all) {
      var config = chart && chart.config;
      var options = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(config.options && config.options.plugins, {});
      var plugins = allPlugins(config);
      return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
    }
  }, {
    key: "_notifyStateChanges",
    value: function _notifyStateChanges(chart) {
      var previousDescriptors = this._oldCache || [];
      var descriptors = this._cache;
      var diff = function diff(a, b) {
        return a.filter(function (x) {
          return !b.some(function (y) {
            return x.plugin.id === y.plugin.id;
          });
        });
      };
      this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
      this._notify(diff(descriptors, previousDescriptors), chart, 'start');
    }
  }]);
  return PluginService;
}();
function allPlugins(config) {
  var localIds = {};
  var plugins = [];
  var keys = Object.keys(registry.plugins.items);
  for (var i = 0; i < keys.length; i++) {
    plugins.push(registry.getPlugin(keys[i]));
  }
  var local = config.plugins || [];
  for (var _i2 = 0; _i2 < local.length; _i2++) {
    var plugin = local[_i2];
    if (plugins.indexOf(plugin) === -1) {
      plugins.push(plugin);
      localIds[plugin.id] = true;
    }
  }
  return {
    plugins: plugins,
    localIds: localIds
  };
}
function getOpts(options, all) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}
function createDescriptors(chart, _ref2, options, all) {
  var plugins = _ref2.plugins,
    localIds = _ref2.localIds;
  var result = [];
  var context = chart.getContext();
  var _iterator12 = _createForOfIteratorHelper(plugins),
    _step12;
  try {
    for (_iterator12.s(); !(_step12 = _iterator12.n()).done;) {
      var plugin = _step12.value;
      var id = plugin.id;
      var opts = getOpts(options[id], all);
      if (opts === null) {
        continue;
      }
      result.push({
        plugin: plugin,
        options: pluginOpts(chart.config, {
          plugin: plugin,
          local: localIds[id]
        }, opts, context)
      });
    }
  } catch (err) {
    _iterator12.e(err);
  } finally {
    _iterator12.f();
  }
  return result;
}
function pluginOpts(config, _ref3, opts, context) {
  var plugin = _ref3.plugin,
    local = _ref3.local;
  var keys = config.pluginScopeKeys(plugin);
  var scopes = config.getOptionScopes(opts, keys);
  if (local && plugin.defaults) {
    scopes.push(plugin.defaults);
  }
  return config.createResolver(scopes, context, [''], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
function getIndexAxis(type, options) {
  var datasetDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type] || {};
  var datasetOptions = (options.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
}
function getAxisFromDefaultScaleID(id, indexAxis) {
  var axis = id;
  if (id === '_index_') {
    axis = indexAxis;
  } else if (id === '_value_') {
    axis = indexAxis === 'x' ? 'y' : 'x';
  }
  return axis;
}
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? '_index_' : '_value_';
}
function idMatchesAxis(id) {
  if (id === 'x' || id === 'y' || id === 'r') {
    return id;
  }
}
function axisFromPosition(position) {
  if (position === 'top' || position === 'bottom') {
    return 'x';
  }
  if (position === 'left' || position === 'right') {
    return 'y';
  }
}
function determineAxis(id) {
  if (idMatchesAxis(id)) {
    return id;
  }
  for (var _len11 = arguments.length, scaleOptions = new Array(_len11 > 1 ? _len11 - 1 : 0), _key11 = 1; _key11 < _len11; _key11++) {
    scaleOptions[_key11 - 1] = arguments[_key11];
  }
  for (var _i3 = 0, _scaleOptions = scaleOptions; _i3 < _scaleOptions.length; _i3++) {
    var opts = _scaleOptions[_i3];
    var axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
    if (axis) {
      return axis;
    }
  }
  throw new Error("Cannot determine type of '".concat(id, "' axis. Please provide 'axis' or 'position' option."));
}
function getAxisFromDataset(id, axis, dataset) {
  if (dataset[axis + 'AxisID'] === id) {
    return {
      axis: axis
    };
  }
}
function retrieveAxisFromDatasets(id, config) {
  if (config.data && config.data.datasets) {
    var boundDs = config.data.datasets.filter(function (d) {
      return d.xAxisID === id || d.yAxisID === id;
    });
    if (boundDs.length) {
      return getAxisFromDataset(id, 'x', boundDs[0]) || getAxisFromDataset(id, 'y', boundDs[0]);
    }
  }
  return {};
}
function mergeScaleConfig(config, options) {
  var chartDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[config.type] || {
    scales: {}
  };
  var configScales = options.scales || {};
  var chartIndexAxis = getIndexAxis(config.type, options);
  var scales = Object.create(null);
  Object.keys(configScales).forEach(function (id) {
    var scaleConf = configScales[id];
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(scaleConf)) {
      return console.error("Invalid scale configuration for scale: ".concat(id));
    }
    if (scaleConf._proxy) {
      return console.warn("Ignoring resolver passed as options for scale: ".concat(id));
    }
    var axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scales[scaleConf.type]);
    var defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    var defaultScaleOptions = chartDefaults.scales || {};
    scales[id] = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(Object.create(null), [{
      axis: axis
    }, scaleConf, defaultScaleOptions[axis], defaultScaleOptions[defaultId]]);
  });
  config.data.datasets.forEach(function (dataset) {
    var type = dataset.type || config.type;
    var indexAxis = dataset.indexAxis || getIndexAxis(type, options);
    var datasetDefaults = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {};
    var defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach(function (defaultID) {
      var axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      var id = dataset[axis + 'AxisID'] || axis;
      scales[id] = scales[id] || Object.create(null);
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(scales[id], [{
        axis: axis
      }, configScales[id], defaultScaleOptions[defaultID]]);
    });
  });
  Object.keys(scales).forEach(function (key) {
    var scale = scales[key];
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(scale, [_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scales[scale.type], _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.scale]);
  });
  return scales;
}
function initOptions(config) {
  var options = config.options || (config.options = {});
  options.plugins = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.plugins, {});
  options.scales = mergeScaleConfig(config, options);
}
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
function initConfig(config) {
  config = config || {};
  config.data = initData(config.data);
  initOptions(config);
  return config;
}
var keyCache = new Map();
var keysCached = new Set();
function cachedKeys(cacheKey, generate) {
  var keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
var addIfFound = function addIfFound(set, obj, key) {
  var opts = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f)(obj, key);
  if (opts !== undefined) {
    set.add(opts);
  }
};
var Config = /*#__PURE__*/function () {
  function Config(config) {
    _classCallCheck(this, Config);
    this._config = initConfig(config);
    this._scopeCache = new Map();
    this._resolverCache = new Map();
  }
  _createClass(Config, [{
    key: "platform",
    get: function get() {
      return this._config.platform;
    }
  }, {
    key: "type",
    get: function get() {
      return this._config.type;
    },
    set: function set(type) {
      this._config.type = type;
    }
  }, {
    key: "data",
    get: function get() {
      return this._config.data;
    },
    set: function set(data) {
      this._config.data = initData(data);
    }
  }, {
    key: "options",
    get: function get() {
      return this._config.options;
    },
    set: function set(options) {
      this._config.options = options;
    }
  }, {
    key: "plugins",
    get: function get() {
      return this._config.plugins;
    }
  }, {
    key: "update",
    value: function update() {
      var config = this._config;
      this.clearCache();
      initOptions(config);
    }
  }, {
    key: "clearCache",
    value: function clearCache() {
      this._scopeCache.clear();
      this._resolverCache.clear();
    }
  }, {
    key: "datasetScopeKeys",
    value: function datasetScopeKeys(datasetType) {
      return cachedKeys(datasetType, function () {
        return [["datasets.".concat(datasetType), '']];
      });
    }
  }, {
    key: "datasetAnimationScopeKeys",
    value: function datasetAnimationScopeKeys(datasetType, transition) {
      return cachedKeys("".concat(datasetType, ".transition.").concat(transition), function () {
        return [["datasets.".concat(datasetType, ".transitions.").concat(transition), "transitions.".concat(transition)], ["datasets.".concat(datasetType), '']];
      });
    }
  }, {
    key: "datasetElementScopeKeys",
    value: function datasetElementScopeKeys(datasetType, elementType) {
      return cachedKeys("".concat(datasetType, "-").concat(elementType), function () {
        return [["datasets.".concat(datasetType, ".elements.").concat(elementType), "datasets.".concat(datasetType), "elements.".concat(elementType), '']];
      });
    }
  }, {
    key: "pluginScopeKeys",
    value: function pluginScopeKeys(plugin) {
      var id = plugin.id;
      var type = this.type;
      return cachedKeys("".concat(type, "-plugin-").concat(id), function () {
        return [["plugins.".concat(id)].concat(_toConsumableArray(plugin.additionalOptionScopes || []))];
      });
    }
  }, {
    key: "_cachedScopes",
    value: function _cachedScopes(mainScope, resetCache) {
      var _scopeCache = this._scopeCache;
      var cache = _scopeCache.get(mainScope);
      if (!cache || resetCache) {
        cache = new Map();
        _scopeCache.set(mainScope, cache);
      }
      return cache;
    }
  }, {
    key: "getOptionScopes",
    value: function getOptionScopes(mainScope, keyLists, resetCache) {
      var options = this.options,
        type = this.type;
      var cache = this._cachedScopes(mainScope, resetCache);
      var cached = cache.get(keyLists);
      if (cached) {
        return cached;
      }
      var scopes = new Set();
      keyLists.forEach(function (keys) {
        if (mainScope) {
          scopes.add(mainScope);
          keys.forEach(function (key) {
            return addIfFound(scopes, mainScope, key);
          });
        }
        keys.forEach(function (key) {
          return addIfFound(scopes, options, key);
        });
        keys.forEach(function (key) {
          return addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {}, key);
        });
        keys.forEach(function (key) {
          return addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d, key);
        });
        keys.forEach(function (key) {
          return addIfFound(scopes, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a6, key);
        });
      });
      var array = Array.from(scopes);
      if (array.length === 0) {
        array.push(Object.create(null));
      }
      if (keysCached.has(keyLists)) {
        cache.set(keyLists, array);
      }
      return array;
    }
  }, {
    key: "chartOptionScopes",
    value: function chartOptionScopes() {
      var options = this.options,
        type = this.type;
      return [options, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3[type] || {}, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type] || {}, {
        type: type
      }, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a6];
    }
  }, {
    key: "resolveNamedOptions",
    value: function resolveNamedOptions(scopes, names, context) {
      var prefixes = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [''];
      var result = {
        $shared: true
      };
      var _getResolver = getResolver(this._resolverCache, scopes, prefixes),
        resolver = _getResolver.resolver,
        subPrefixes = _getResolver.subPrefixes;
      var options = resolver;
      if (needContext(resolver, names)) {
        result.$shared = false;
        context = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(context) ? context() : context;
        var subResolver = this.createResolver(scopes, context, subPrefixes);
        options = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a8)(resolver, context, subResolver);
      }
      var _iterator13 = _createForOfIteratorHelper(names),
        _step13;
      try {
        for (_iterator13.s(); !(_step13 = _iterator13.n()).done;) {
          var prop = _step13.value;
          result[prop] = options[prop];
        }
      } catch (err) {
        _iterator13.e(err);
      } finally {
        _iterator13.f();
      }
      return result;
    }
  }, {
    key: "createResolver",
    value: function createResolver(scopes, context) {
      var prefixes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [''];
      var descriptorDefaults = arguments.length > 3 ? arguments[3] : undefined;
      var _getResolver2 = getResolver(this._resolverCache, scopes, prefixes),
        resolver = _getResolver2.resolver;
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(context) ? (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a8)(resolver, context, undefined, descriptorDefaults) : resolver;
    }
  }]);
  return Config;
}();
function getResolver(resolverCache, scopes, prefixes) {
  var cache = resolverCache.get(scopes);
  if (!cache) {
    cache = new Map();
    resolverCache.set(scopes, cache);
  }
  var cacheKey = prefixes.join();
  var cached = cache.get(cacheKey);
  if (!cached) {
    var resolver = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a9)(scopes, prefixes);
    cached = {
      resolver: resolver,
      subPrefixes: prefixes.filter(function (p) {
        return !p.toLowerCase().includes('hover');
      })
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
var hasFunction = function hasFunction(value) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value) && Object.getOwnPropertyNames(value).reduce(function (acc, key) {
    return acc || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(value[key]);
  }, false);
};
function needContext(proxy, names) {
  var _descriptors2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aa)(proxy),
    isScriptable = _descriptors2.isScriptable,
    isIndexable = _descriptors2.isIndexable;
  var _iterator14 = _createForOfIteratorHelper(names),
    _step14;
  try {
    for (_iterator14.s(); !(_step14 = _iterator14.n()).done;) {
      var prop = _step14.value;
      var scriptable = isScriptable(prop);
      var indexable = isIndexable(prop);
      var value = (indexable || scriptable) && proxy[prop];
      if (scriptable && ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(value) || hasFunction(value)) || indexable && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(value)) {
        return true;
      }
    }
  } catch (err) {
    _iterator14.e(err);
  } finally {
    _iterator14.f();
  }
  return false;
}
var version = "4.4.0";
var KNOWN_POSITIONS = ['top', 'bottom', 'left', 'right', 'chartArea'];
function positionIsHorizontal(position, axis) {
  return position === 'top' || position === 'bottom' || KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x';
}
function compare2Level(l1, l2) {
  return function (a, b) {
    return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
  };
}
function onAnimationsComplete(context) {
  var chart = context.chart;
  var animationOptions = chart.options.animation;
  chart.notifyPlugins('afterRender');
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(animationOptions && animationOptions.onComplete, [context], chart);
}
function onAnimationProgress(context) {
  var chart = context.chart;
  var animationOptions = chart.options.animation;
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(animationOptions && animationOptions.onProgress, [context], chart);
}
function getCanvas(item) {
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.M)() && typeof item === 'string') {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
var instances = {};
var getChart = function getChart(key) {
  var canvas = getCanvas(key);
  return Object.values(instances).filter(function (c) {
    return c.canvas === canvas;
  }).pop();
};
function moveNumericKeys(obj, start, move) {
  var keys = Object.keys(obj);
  for (var _i4 = 0, _keys = keys; _i4 < _keys.length; _i4++) {
    var key = _keys[_i4];
    var intKey = +key;
    if (intKey >= start) {
      var value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
function determineLastEvent(e, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e.type === 'mouseout') {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e;
}
function getSizeForArea(scale, chartArea, field) {
  return scale.options.clip ? scale[field] : chartArea[field];
}
function getDatasetArea(meta, chartArea) {
  var xScale = meta.xScale,
    yScale = meta.yScale;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, 'left'),
      right: getSizeForArea(xScale, chartArea, 'right'),
      top: getSizeForArea(yScale, chartArea, 'top'),
      bottom: getSizeForArea(yScale, chartArea, 'bottom')
    };
  }
  return chartArea;
}
var Chart = /*#__PURE__*/function () {
  function Chart(item, userConfig) {
    var _this12 = this;
    _classCallCheck(this, Chart);
    var config = this.config = new Config(userConfig);
    var initialCanvas = getCanvas(item);
    var existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error('Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' + ' must be destroyed before the canvas with ID \'' + existingChart.canvas.id + '\' can be reused.');
    }
    var options = config.createResolver(config.chartOptionScopes(), this.getContext());
    this.platform = new (config.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config);
    var context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
    var canvas = context && context.canvas;
    var height = canvas && canvas.height;
    var width = canvas && canvas.width;
    this.id = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ac)();
    this.ctx = context;
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this._options = options;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = undefined;
    this.boxes = [];
    this.currentDevicePixelRatio = undefined;
    this.chartArea = undefined;
    this._active = [];
    this._lastEvent = undefined;
    this._listeners = {};
    this._responsiveListeners = undefined;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = undefined;
    this.$context = undefined;
    this._doResize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ad)(function (mode) {
      return _this12.update(mode);
    }, options.resizeDelay || 0);
    this._dataChanges = [];
    instances[this.id] = this;
    if (!context || !canvas) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    animator.listen(this, 'complete', onAnimationsComplete);
    animator.listen(this, 'progress', onAnimationProgress);
    this._initialize();
    if (this.attached) {
      this.update();
    }
  }
  _createClass(Chart, [{
    key: "aspectRatio",
    get: function get() {
      var _this$options12 = this.options,
        aspectRatio = _this$options12.aspectRatio,
        maintainAspectRatio = _this$options12.maintainAspectRatio,
        width = this.width,
        height = this.height,
        _aspectRatio = this._aspectRatio;
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(aspectRatio)) {
        return aspectRatio;
      }
      if (maintainAspectRatio && _aspectRatio) {
        return _aspectRatio;
      }
      return height ? width / height : null;
    }
  }, {
    key: "data",
    get: function get() {
      return this.config.data;
    },
    set: function set(data) {
      this.config.data = data;
    }
  }, {
    key: "options",
    get: function get() {
      return this._options;
    },
    set: function set(options) {
      this.config.options = options;
    }
  }, {
    key: "registry",
    get: function get() {
      return registry;
    }
  }, {
    key: "_initialize",
    value: function _initialize() {
      this.notifyPlugins('beforeInit');
      if (this.options.responsive) {
        this.resize();
      } else {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ae)(this, this.options.devicePixelRatio);
      }
      this.bindEvents();
      this.notifyPlugins('afterInit');
      return this;
    }
  }, {
    key: "clear",
    value: function clear() {
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.af)(this.canvas, this.ctx);
      return this;
    }
  }, {
    key: "stop",
    value: function stop() {
      animator.stop(this);
      return this;
    }
  }, {
    key: "resize",
    value: function resize(width, height) {
      if (!animator.running(this)) {
        this._resize(width, height);
      } else {
        this._resizeBeforeDraw = {
          width: width,
          height: height
        };
      }
    }
  }, {
    key: "_resize",
    value: function _resize(width, height) {
      var options = this.options;
      var canvas = this.canvas;
      var aspectRatio = options.maintainAspectRatio && this.aspectRatio;
      var newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
      var newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
      var mode = this.width ? 'resize' : 'attach';
      this.width = newSize.width;
      this.height = newSize.height;
      this._aspectRatio = this.aspectRatio;
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ae)(this, newRatio, true)) {
        return;
      }
      this.notifyPlugins('resize', {
        size: newSize
      });
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onResize, [this, newSize], this);
      if (this.attached) {
        if (this._doResize(mode)) {
          this.render();
        }
      }
    }
  }, {
    key: "ensureScalesHaveIDs",
    value: function ensureScalesHaveIDs() {
      var options = this.options;
      var scalesOptions = options.scales || {};
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(scalesOptions, function (axisOptions, axisID) {
        axisOptions.id = axisID;
      });
    }
  }, {
    key: "buildOrUpdateScales",
    value: function buildOrUpdateScales() {
      var _this13 = this;
      var options = this.options;
      var scaleOpts = options.scales;
      var scales = this.scales;
      var updated = Object.keys(scales).reduce(function (obj, id) {
        obj[id] = false;
        return obj;
      }, {});
      var items = [];
      if (scaleOpts) {
        items = items.concat(Object.keys(scaleOpts).map(function (id) {
          var scaleOptions = scaleOpts[id];
          var axis = determineAxis(id, scaleOptions);
          var isRadial = axis === 'r';
          var isHorizontal = axis === 'x';
          return {
            options: scaleOptions,
            dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
            dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
          };
        }));
      }
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(items, function (item) {
        var scaleOptions = item.options;
        var id = scaleOptions.id;
        var axis = determineAxis(id, scaleOptions);
        var scaleType = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(scaleOptions.type, item.dtype);
        if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
          scaleOptions.position = item.dposition;
        }
        updated[id] = true;
        var scale = null;
        if (id in scales && scales[id].type === scaleType) {
          scale = scales[id];
        } else {
          var scaleClass = registry.getScale(scaleType);
          scale = new scaleClass({
            id: id,
            type: scaleType,
            ctx: _this13.ctx,
            chart: _this13
          });
          scales[scale.id] = scale;
        }
        scale.init(scaleOptions, options);
      });
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(updated, function (hasUpdated, id) {
        if (!hasUpdated) {
          delete scales[id];
        }
      });
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(scales, function (scale) {
        layouts.configure(_this13, scale, scale.options);
        layouts.addBox(_this13, scale);
      });
    }
  }, {
    key: "_updateMetasets",
    value: function _updateMetasets() {
      var metasets = this._metasets;
      var numData = this.data.datasets.length;
      var numMeta = metasets.length;
      metasets.sort(function (a, b) {
        return a.index - b.index;
      });
      if (numMeta > numData) {
        for (var i = numData; i < numMeta; ++i) {
          this._destroyDatasetMeta(i);
        }
        metasets.splice(numData, numMeta - numData);
      }
      this._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
    }
  }, {
    key: "_removeUnreferencedMetasets",
    value: function _removeUnreferencedMetasets() {
      var _this14 = this;
      var metasets = this._metasets,
        datasets = this.data.datasets;
      if (metasets.length > datasets.length) {
        delete this._stacks;
      }
      metasets.forEach(function (meta, index) {
        if (datasets.filter(function (x) {
          return x === meta._dataset;
        }).length === 0) {
          _this14._destroyDatasetMeta(index);
        }
      });
    }
  }, {
    key: "buildOrUpdateControllers",
    value: function buildOrUpdateControllers() {
      var newControllers = [];
      var datasets = this.data.datasets;
      var i, ilen;
      this._removeUnreferencedMetasets();
      for (i = 0, ilen = datasets.length; i < ilen; i++) {
        var dataset = datasets[i];
        var meta = this.getDatasetMeta(i);
        var type = dataset.type || this.config.type;
        if (meta.type && meta.type !== type) {
          this._destroyDatasetMeta(i);
          meta = this.getDatasetMeta(i);
        }
        meta.type = type;
        meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
        meta.order = dataset.order || 0;
        meta.index = i;
        meta.label = '' + dataset.label;
        meta.visible = this.isDatasetVisible(i);
        if (meta.controller) {
          meta.controller.updateIndex(i);
          meta.controller.linkScales();
        } else {
          var ControllerClass = registry.getController(type);
          var _defaults$datasets$ty = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.datasets[type],
            datasetElementType = _defaults$datasets$ty.datasetElementType,
            dataElementType = _defaults$datasets$ty.dataElementType;
          Object.assign(ControllerClass, {
            dataElementType: registry.getElement(dataElementType),
            datasetElementType: datasetElementType && registry.getElement(datasetElementType)
          });
          meta.controller = new ControllerClass(this, i);
          newControllers.push(meta.controller);
        }
      }
      this._updateMetasets();
      return newControllers;
    }
  }, {
    key: "_resetElements",
    value: function _resetElements() {
      var _this15 = this;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.data.datasets, function (dataset, datasetIndex) {
        _this15.getDatasetMeta(datasetIndex).controller.reset();
      }, this);
    }
  }, {
    key: "reset",
    value: function reset() {
      this._resetElements();
      this.notifyPlugins('reset');
    }
  }, {
    key: "update",
    value: function update(mode) {
      var config = this.config;
      config.update();
      var options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
      var animsDisabled = this._animationsDisabled = !options.animation;
      this._updateScales();
      this._checkEventBindings();
      this._updateHiddenIndices();
      this._plugins.invalidate();
      if (this.notifyPlugins('beforeUpdate', {
        mode: mode,
        cancelable: true
      }) === false) {
        return;
      }
      var newControllers = this.buildOrUpdateControllers();
      this.notifyPlugins('beforeElementsUpdate');
      var minPadding = 0;
      for (var i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
        var _this$getDatasetMeta = this.getDatasetMeta(i),
          controller = _this$getDatasetMeta.controller;
        var reset = !animsDisabled && newControllers.indexOf(controller) === -1;
        controller.buildOrUpdateElements(reset);
        minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
      }
      minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
      this._updateLayout(minPadding);
      if (!animsDisabled) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(newControllers, function (controller) {
          controller.reset();
        });
      }
      this._updateDatasets(mode);
      this.notifyPlugins('afterUpdate', {
        mode: mode
      });
      this._layers.sort(compare2Level('z', '_idx'));
      var _active = this._active,
        _lastEvent = this._lastEvent;
      if (_lastEvent) {
        this._eventHandler(_lastEvent, true);
      } else if (_active.length) {
        this._updateHoverStyles(_active, _active, true);
      }
      this.render();
    }
  }, {
    key: "_updateScales",
    value: function _updateScales() {
      var _this16 = this;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.scales, function (scale) {
        layouts.removeBox(_this16, scale);
      });
      this.ensureScalesHaveIDs();
      this.buildOrUpdateScales();
    }
  }, {
    key: "_checkEventBindings",
    value: function _checkEventBindings() {
      var options = this.options;
      var existingEvents = new Set(Object.keys(this._listeners));
      var newEvents = new Set(options.events);
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ag)(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
        this.unbindEvents();
        this.bindEvents();
      }
    }
  }, {
    key: "_updateHiddenIndices",
    value: function _updateHiddenIndices() {
      var _hiddenIndices = this._hiddenIndices;
      var changes = this._getUniformDataChanges() || [];
      var _iterator15 = _createForOfIteratorHelper(changes),
        _step15;
      try {
        for (_iterator15.s(); !(_step15 = _iterator15.n()).done;) {
          var _step15$value = _step15.value,
            method = _step15$value.method,
            start = _step15$value.start,
            count = _step15$value.count;
          var move = method === '_removeElements' ? -count : count;
          moveNumericKeys(_hiddenIndices, start, move);
        }
      } catch (err) {
        _iterator15.e(err);
      } finally {
        _iterator15.f();
      }
    }
  }, {
    key: "_getUniformDataChanges",
    value: function _getUniformDataChanges() {
      var _dataChanges = this._dataChanges;
      if (!_dataChanges || !_dataChanges.length) {
        return;
      }
      this._dataChanges = [];
      var datasetCount = this.data.datasets.length;
      var makeSet = function makeSet(idx) {
        return new Set(_dataChanges.filter(function (c) {
          return c[0] === idx;
        }).map(function (c, i) {
          return i + ',' + c.splice(1).join(',');
        }));
      };
      var changeSet = makeSet(0);
      for (var i = 1; i < datasetCount; i++) {
        if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ag)(changeSet, makeSet(i))) {
          return;
        }
      }
      return Array.from(changeSet).map(function (c) {
        return c.split(',');
      }).map(function (a) {
        return {
          method: a[1],
          start: +a[2],
          count: +a[3]
        };
      });
    }
  }, {
    key: "_updateLayout",
    value: function _updateLayout(minPadding) {
      var _this17 = this;
      if (this.notifyPlugins('beforeLayout', {
        cancelable: true
      }) === false) {
        return;
      }
      layouts.update(this, this.width, this.height, minPadding);
      var area = this.chartArea;
      var noArea = area.width <= 0 || area.height <= 0;
      this._layers = [];
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.boxes, function (box) {
        var _this17$_layers;
        if (noArea && box.position === 'chartArea') {
          return;
        }
        if (box.configure) {
          box.configure();
        }
        (_this17$_layers = _this17._layers).push.apply(_this17$_layers, _toConsumableArray(box._layers()));
      }, this);
      this._layers.forEach(function (item, index) {
        item._idx = index;
      });
      this.notifyPlugins('afterLayout');
    }
  }, {
    key: "_updateDatasets",
    value: function _updateDatasets(mode) {
      if (this.notifyPlugins('beforeDatasetsUpdate', {
        mode: mode,
        cancelable: true
      }) === false) {
        return;
      }
      for (var i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
        this.getDatasetMeta(i).controller.configure();
      }
      for (var _i5 = 0, _ilen = this.data.datasets.length; _i5 < _ilen; ++_i5) {
        this._updateDataset(_i5, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7)(mode) ? mode({
          datasetIndex: _i5
        }) : mode);
      }
      this.notifyPlugins('afterDatasetsUpdate', {
        mode: mode
      });
    }
  }, {
    key: "_updateDataset",
    value: function _updateDataset(index, mode) {
      var meta = this.getDatasetMeta(index);
      var args = {
        meta: meta,
        index: index,
        mode: mode,
        cancelable: true
      };
      if (this.notifyPlugins('beforeDatasetUpdate', args) === false) {
        return;
      }
      meta.controller._update(mode);
      args.cancelable = false;
      this.notifyPlugins('afterDatasetUpdate', args);
    }
  }, {
    key: "render",
    value: function render() {
      if (this.notifyPlugins('beforeRender', {
        cancelable: true
      }) === false) {
        return;
      }
      if (animator.has(this)) {
        if (this.attached && !animator.running(this)) {
          animator.start(this);
        }
      } else {
        this.draw();
        onAnimationsComplete({
          chart: this
        });
      }
    }
  }, {
    key: "draw",
    value: function draw() {
      var i;
      if (this._resizeBeforeDraw) {
        var _this$_resizeBeforeDr = this._resizeBeforeDraw,
          width = _this$_resizeBeforeDr.width,
          height = _this$_resizeBeforeDr.height;
        this._resize(width, height);
        this._resizeBeforeDraw = null;
      }
      this.clear();
      if (this.width <= 0 || this.height <= 0) {
        return;
      }
      if (this.notifyPlugins('beforeDraw', {
        cancelable: true
      }) === false) {
        return;
      }
      var layers = this._layers;
      for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
        layers[i].draw(this.chartArea);
      }
      this._drawDatasets();
      for (; i < layers.length; ++i) {
        layers[i].draw(this.chartArea);
      }
      this.notifyPlugins('afterDraw');
    }
  }, {
    key: "_getSortedDatasetMetas",
    value: function _getSortedDatasetMetas(filterVisible) {
      var metasets = this._sortedMetasets;
      var result = [];
      var i, ilen;
      for (i = 0, ilen = metasets.length; i < ilen; ++i) {
        var meta = metasets[i];
        if (!filterVisible || meta.visible) {
          result.push(meta);
        }
      }
      return result;
    }
  }, {
    key: "getSortedVisibleDatasetMetas",
    value: function getSortedVisibleDatasetMetas() {
      return this._getSortedDatasetMetas(true);
    }
  }, {
    key: "_drawDatasets",
    value: function _drawDatasets() {
      if (this.notifyPlugins('beforeDatasetsDraw', {
        cancelable: true
      }) === false) {
        return;
      }
      var metasets = this.getSortedVisibleDatasetMetas();
      for (var i = metasets.length - 1; i >= 0; --i) {
        this._drawDataset(metasets[i]);
      }
      this.notifyPlugins('afterDatasetsDraw');
    }
  }, {
    key: "_drawDataset",
    value: function _drawDataset(meta) {
      var ctx = this.ctx;
      var clip = meta._clip;
      var useClip = !clip.disabled;
      var area = getDatasetArea(meta, this.chartArea);
      var args = {
        meta: meta,
        index: meta.index,
        cancelable: true
      };
      if (this.notifyPlugins('beforeDatasetDraw', args) === false) {
        return;
      }
      if (useClip) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, {
          left: clip.left === false ? 0 : area.left - clip.left,
          right: clip.right === false ? this.width : area.right + clip.right,
          top: clip.top === false ? 0 : area.top - clip.top,
          bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
        });
      }
      meta.controller.draw();
      if (useClip) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
      }
      args.cancelable = false;
      this.notifyPlugins('afterDatasetDraw', args);
    }
  }, {
    key: "isPointInArea",
    value: function isPointInArea(point) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(point, this.chartArea, this._minPadding);
    }
  }, {
    key: "getElementsAtEventForMode",
    value: function getElementsAtEventForMode(e, mode, options, useFinalPosition) {
      var method = Interaction.modes[mode];
      if (typeof method === 'function') {
        return method(this, e, options, useFinalPosition);
      }
      return [];
    }
  }, {
    key: "getDatasetMeta",
    value: function getDatasetMeta(datasetIndex) {
      var dataset = this.data.datasets[datasetIndex];
      var metasets = this._metasets;
      var meta = metasets.filter(function (x) {
        return x && x._dataset === dataset;
      }).pop();
      if (!meta) {
        meta = {
          type: null,
          data: [],
          dataset: null,
          controller: null,
          hidden: null,
          xAxisID: null,
          yAxisID: null,
          order: dataset && dataset.order || 0,
          index: datasetIndex,
          _dataset: dataset,
          _parsed: [],
          _sorted: false
        };
        metasets.push(meta);
      }
      return meta;
    }
  }, {
    key: "getContext",
    value: function getContext() {
      return this.$context || (this.$context = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(null, {
        chart: this,
        type: 'chart'
      }));
    }
  }, {
    key: "getVisibleDatasetCount",
    value: function getVisibleDatasetCount() {
      return this.getSortedVisibleDatasetMetas().length;
    }
  }, {
    key: "isDatasetVisible",
    value: function isDatasetVisible(datasetIndex) {
      var dataset = this.data.datasets[datasetIndex];
      if (!dataset) {
        return false;
      }
      var meta = this.getDatasetMeta(datasetIndex);
      return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
    }
  }, {
    key: "setDatasetVisibility",
    value: function setDatasetVisibility(datasetIndex, visible) {
      var meta = this.getDatasetMeta(datasetIndex);
      meta.hidden = !visible;
    }
  }, {
    key: "toggleDataVisibility",
    value: function toggleDataVisibility(index) {
      this._hiddenIndices[index] = !this._hiddenIndices[index];
    }
  }, {
    key: "getDataVisibility",
    value: function getDataVisibility(index) {
      return !this._hiddenIndices[index];
    }
  }, {
    key: "_updateVisibility",
    value: function _updateVisibility(datasetIndex, dataIndex, visible) {
      var mode = visible ? 'show' : 'hide';
      var meta = this.getDatasetMeta(datasetIndex);
      var anims = meta.controller._resolveAnimations(undefined, mode);
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h)(dataIndex)) {
        meta.data[dataIndex].hidden = !visible;
        this.update();
      } else {
        this.setDatasetVisibility(datasetIndex, visible);
        anims.update(meta, {
          visible: visible
        });
        this.update(function (ctx) {
          return ctx.datasetIndex === datasetIndex ? mode : undefined;
        });
      }
    }
  }, {
    key: "hide",
    value: function hide(datasetIndex, dataIndex) {
      this._updateVisibility(datasetIndex, dataIndex, false);
    }
  }, {
    key: "show",
    value: function show(datasetIndex, dataIndex) {
      this._updateVisibility(datasetIndex, dataIndex, true);
    }
  }, {
    key: "_destroyDatasetMeta",
    value: function _destroyDatasetMeta(datasetIndex) {
      var meta = this._metasets[datasetIndex];
      if (meta && meta.controller) {
        meta.controller._destroy();
      }
      delete this._metasets[datasetIndex];
    }
  }, {
    key: "_stop",
    value: function _stop() {
      var i, ilen;
      this.stop();
      animator.remove(this);
      for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
        this._destroyDatasetMeta(i);
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.notifyPlugins('beforeDestroy');
      var canvas = this.canvas,
        ctx = this.ctx;
      this._stop();
      this.config.clearCache();
      if (canvas) {
        this.unbindEvents();
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.af)(canvas, ctx);
        this.platform.releaseContext(ctx);
        this.canvas = null;
        this.ctx = null;
      }
      delete instances[this.id];
      this.notifyPlugins('afterDestroy');
    }
  }, {
    key: "toBase64Image",
    value: function toBase64Image() {
      var _this$canvas;
      return (_this$canvas = this.canvas).toDataURL.apply(_this$canvas, arguments);
    }
  }, {
    key: "bindEvents",
    value: function bindEvents() {
      this.bindUserEvents();
      if (this.options.responsive) {
        this.bindResponsiveEvents();
      } else {
        this.attached = true;
      }
    }
  }, {
    key: "bindUserEvents",
    value: function bindUserEvents() {
      var _this18 = this;
      var listeners = this._listeners;
      var platform = this.platform;
      var _add = function _add(type, listener) {
        platform.addEventListener(_this18, type, listener);
        listeners[type] = listener;
      };
      var listener = function listener(e, x, y) {
        e.offsetX = x;
        e.offsetY = y;
        _this18._eventHandler(e);
      };
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.options.events, function (type) {
        return _add(type, listener);
      });
    }
  }, {
    key: "bindResponsiveEvents",
    value: function bindResponsiveEvents() {
      var _this19 = this;
      if (!this._responsiveListeners) {
        this._responsiveListeners = {};
      }
      var listeners = this._responsiveListeners;
      var platform = this.platform;
      var _add = function _add(type, listener) {
        platform.addEventListener(_this19, type, listener);
        listeners[type] = listener;
      };
      var _remove = function _remove(type, listener) {
        if (listeners[type]) {
          platform.removeEventListener(_this19, type, listener);
          delete listeners[type];
        }
      };
      var listener = function listener(width, height) {
        if (_this19.canvas) {
          _this19.resize(width, height);
        }
      };
      var detached;
      var attached = function attached() {
        _remove('attach', attached);
        _this19.attached = true;
        _this19.resize();
        _add('resize', listener);
        _add('detach', detached);
      };
      detached = function detached() {
        _this19.attached = false;
        _remove('resize', listener);
        _this19._stop();
        _this19._resize(0, 0);
        _add('attach', attached);
      };
      if (platform.isAttached(this.canvas)) {
        attached();
      } else {
        detached();
      }
    }
  }, {
    key: "unbindEvents",
    value: function unbindEvents() {
      var _this20 = this;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this._listeners, function (listener, type) {
        _this20.platform.removeEventListener(_this20, type, listener);
      });
      this._listeners = {};
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this._responsiveListeners, function (listener, type) {
        _this20.platform.removeEventListener(_this20, type, listener);
      });
      this._responsiveListeners = undefined;
    }
  }, {
    key: "updateHoverStyle",
    value: function updateHoverStyle(items, mode, enabled) {
      var prefix = enabled ? 'set' : 'remove';
      var meta, item, i, ilen;
      if (mode === 'dataset') {
        meta = this.getDatasetMeta(items[0].datasetIndex);
        meta.controller['_' + prefix + 'DatasetHoverStyle']();
      }
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        item = items[i];
        var controller = item && this.getDatasetMeta(item.datasetIndex).controller;
        if (controller) {
          controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
        }
      }
    }
  }, {
    key: "getActiveElements",
    value: function getActiveElements() {
      return this._active || [];
    }
  }, {
    key: "setActiveElements",
    value: function setActiveElements(activeElements) {
      var _this21 = this;
      var lastActive = this._active || [];
      var active = activeElements.map(function (_ref4) {
        var datasetIndex = _ref4.datasetIndex,
          index = _ref4.index;
        var meta = _this21.getDatasetMeta(datasetIndex);
        if (!meta) {
          throw new Error('No dataset found at index ' + datasetIndex);
        }
        return {
          datasetIndex: datasetIndex,
          element: meta.data[index],
          index: index
        };
      });
      var changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive);
      if (changed) {
        this._active = active;
        this._lastEvent = null;
        this._updateHoverStyles(active, lastActive);
      }
    }
  }, {
    key: "notifyPlugins",
    value: function notifyPlugins(hook, args, filter) {
      return this._plugins.notify(this, hook, args, filter);
    }
  }, {
    key: "isPluginEnabled",
    value: function isPluginEnabled(pluginId) {
      return this._plugins._cache.filter(function (p) {
        return p.plugin.id === pluginId;
      }).length === 1;
    }
  }, {
    key: "_updateHoverStyles",
    value: function _updateHoverStyles(active, lastActive, replay) {
      var hoverOptions = this.options.hover;
      var diff = function diff(a, b) {
        return a.filter(function (x) {
          return !b.some(function (y) {
            return x.datasetIndex === y.datasetIndex && x.index === y.index;
          });
        });
      };
      var deactivated = diff(lastActive, active);
      var activated = replay ? active : diff(active, lastActive);
      if (deactivated.length) {
        this.updateHoverStyle(deactivated, hoverOptions.mode, false);
      }
      if (activated.length && hoverOptions.mode) {
        this.updateHoverStyle(activated, hoverOptions.mode, true);
      }
    }
  }, {
    key: "_eventHandler",
    value: function _eventHandler(e, replay) {
      var _this22 = this;
      var args = {
        event: e,
        replay: replay,
        cancelable: true,
        inChartArea: this.isPointInArea(e)
      };
      var eventFilter = function eventFilter(plugin) {
        return (plugin.options.events || _this22.options.events).includes(e["native"].type);
      };
      if (this.notifyPlugins('beforeEvent', args, eventFilter) === false) {
        return;
      }
      var changed = this._handleEvent(e, replay, args.inChartArea);
      args.cancelable = false;
      this.notifyPlugins('afterEvent', args, eventFilter);
      if (changed || args.changed) {
        this.render();
      }
      return this;
    }
  }, {
    key: "_handleEvent",
    value: function _handleEvent(e, replay, inChartArea) {
      var _this$_active = this._active,
        lastActive = _this$_active === void 0 ? [] : _this$_active,
        options = this.options;
      var useFinalPosition = replay;
      var active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
      var isClick = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ai)(e);
      var lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
      if (inChartArea) {
        this._lastEvent = null;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onHover, [e, active, this], this);
        if (isClick) {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(options.onClick, [e, active, this], this);
        }
      }
      var changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive);
      if (changed || replay) {
        this._active = active;
        this._updateHoverStyles(active, lastActive, replay);
      }
      this._lastEvent = lastEvent;
      return changed;
    }
  }, {
    key: "_getActiveElements",
    value: function _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
      if (e.type === 'mouseout') {
        return [];
      }
      if (!inChartArea) {
        return lastActive;
      }
      var hoverOptions = this.options.hover;
      return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
    }
  }], [{
    key: "register",
    value: function register() {
      registry.add.apply(registry, arguments);
      invalidatePlugins();
    }
  }, {
    key: "unregister",
    value: function unregister() {
      registry.remove.apply(registry, arguments);
      invalidatePlugins();
    }
  }]);
  return Chart;
}();
_defineProperty(Chart, "defaults", _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d);
_defineProperty(Chart, "instances", instances);
_defineProperty(Chart, "overrides", _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a3);
_defineProperty(Chart, "registry", registry);
_defineProperty(Chart, "version", version);
_defineProperty(Chart, "getChart", getChart);
function invalidatePlugins() {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(Chart.instances, function (chart) {
    return chart._plugins.invalidate();
  });
}
function clipArc(ctx, element, endAngle) {
  var startAngle = element.startAngle,
    pixelMargin = element.pixelMargin,
    x = element.x,
    y = element.y,
    outerRadius = element.outerRadius,
    innerRadius = element.innerRadius;
  var angleMargin = pixelMargin / outerRadius;
  // Draw an inner border by clipping the arc and drawing a double-width border
  // Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x, y, pixelMargin, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
  }
  ctx.closePath();
  ctx.clip();
}
function toRadiusCorners(value) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ak)(value, ['outerStart', 'outerEnd', 'innerStart', 'innerEnd']);
}
/**
 * Parse border radius from the provided options
 */
function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
  var o = toRadiusCorners(arc.options.borderRadius);
  var halfThickness = (outerRadius - innerRadius) / 2;
  var innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
  // Outer limits are complicated. We want to compute the available angular distance at
  // a radius of outerRadius - borderRadius because for small angular distances, this term limits.
  // We compute at r = outerRadius - borderRadius because this circle defines the center of the border corners.
  //
  // If the borderRadius is large, that value can become negative.
  // This causes the outer borders to lose their radius entirely, which is rather unexpected. To solve that, if borderRadius > outerRadius
  // we know that the thickness term will dominate and compute the limits at that point
  var computeOuterLimit = function computeOuterLimit(val) {
    var outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(val, 0, Math.min(halfThickness, outerArcLimit));
  };
  return {
    outerStart: computeOuterLimit(o.outerStart),
    outerEnd: computeOuterLimit(o.outerEnd),
    innerStart: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(o.innerStart, 0, innerLimit),
    innerEnd: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(o.innerEnd, 0, innerLimit)
  };
}
/**
 * Convert (r, 𝜃) to (x, y)
 */
function rThetaToXY(r, theta, x, y) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta)
  };
}
/**
 * Path the arc, respecting border radius by separating into left and right halves.
 *
 *   Start      End
 *
 *    1--->a--->2    Outer
 *   /           \
 *   8           3
 *   |           |
 *   |           |
 *   7           4
 *   \           /
 *    6<---b<---5    Inner
 */
function pathArc(ctx, element, offset, spacing, end, circular) {
  var x = element.x,
    y = element.y,
    start = element.startAngle,
    pixelMargin = element.pixelMargin,
    innerR = element.innerRadius;
  var outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  var innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  var spacingOffset = 0;
  var alpha = end - start;
  if (spacing) {
    // When spacing is present, it is the same for all items
    // So we adjust the start and end angle of the arc such that
    // the distance is the same as it would be without the spacing
    var noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    var noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    var avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    var adjustedAngle = avNogSpacingRadius !== 0 ? alpha * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha;
    spacingOffset = (alpha - adjustedAngle) / 2;
  }
  var beta = Math.max(0.001, alpha * outerRadius - offset / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P) / outerRadius;
  var angleOffset = (alpha - beta) / 2;
  var startAngle = start + angleOffset + spacingOffset;
  var endAngle = end - angleOffset - spacingOffset;
  var _parseBorderRadius$ = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle),
    outerStart = _parseBorderRadius$.outerStart,
    outerEnd = _parseBorderRadius$.outerEnd,
    innerStart = _parseBorderRadius$.innerStart,
    innerEnd = _parseBorderRadius$.innerEnd;
  var outerStartAdjustedRadius = outerRadius - outerStart;
  var outerEndAdjustedRadius = outerRadius - outerEnd;
  var outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
  var outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
  var innerStartAdjustedRadius = innerRadius + innerStart;
  var innerEndAdjustedRadius = innerRadius + innerEnd;
  var innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
  var innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
  ctx.beginPath();
  if (circular) {
    // The first arc segments from point 1 to point a to point 2
    var outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
    ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
    ctx.arc(x, y, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
    // The corner segment from point 2 to point 3
    if (outerEnd > 0) {
      var pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
    }
    // The line from point 3 to point 4
    var p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
    ctx.lineTo(p4.x, p4.y);
    // The corner segment from point 4 to point 5
    if (innerEnd > 0) {
      var _pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
      ctx.arc(_pCenter.x, _pCenter.y, innerEnd, endAngle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, innerEndAdjustedAngle + Math.PI);
    }
    // The inner arc from point 5 to point b to point 6
    var innerMidAdjustedAngle = (endAngle - innerEnd / innerRadius + (startAngle + innerStart / innerRadius)) / 2;
    ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
    ctx.arc(x, y, innerRadius, innerMidAdjustedAngle, startAngle + innerStart / innerRadius, true);
    // The corner segment from point 6 to point 7
    if (innerStart > 0) {
      var _pCenter2 = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
      ctx.arc(_pCenter2.x, _pCenter2.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H);
    }
    // The line from point 7 to point 8
    var p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
    ctx.lineTo(p8.x, p8.y);
    // The corner segment from point 8 to point 1
    if (outerStart > 0) {
      var _pCenter3 = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
      ctx.arc(_pCenter3.x, _pCenter3.y, outerStart, startAngle - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H, outerStartAdjustedAngle);
    }
  } else {
    ctx.moveTo(x, y);
    var outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
    var outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerStartX, outerStartY);
    var outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
    var outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerEndX, outerEndY);
  }
  ctx.closePath();
}
function drawArc(ctx, element, offset, spacing, circular) {
  var fullCircles = element.fullCircles,
    startAngle = element.startAngle,
    circumference = element.circumference;
  var endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (var i = 0; i < fullCircles; ++i) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
    }
  }
  pathArc(ctx, element, offset, spacing, endAngle, circular);
  ctx.fill();
  return endAngle;
}
function drawBorder(ctx, element, offset, spacing, circular) {
  var fullCircles = element.fullCircles,
    startAngle = element.startAngle,
    circumference = element.circumference,
    options = element.options;
  var borderWidth = options.borderWidth,
    borderJoinStyle = options.borderJoinStyle,
    borderDash = options.borderDash,
    borderDashOffset = options.borderDashOffset;
  var inner = options.borderAlign === 'inner';
  if (!borderWidth) {
    return;
  }
  ctx.setLineDash(borderDash || []);
  ctx.lineDashOffset = borderDashOffset;
  if (inner) {
    ctx.lineWidth = borderWidth * 2;
    ctx.lineJoin = borderJoinStyle || 'round';
  } else {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = borderJoinStyle || 'bevel';
  }
  var endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (var i = 0; i < fullCircles; ++i) {
      ctx.stroke();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
    }
  }
  if (inner) {
    clipArc(ctx, element, endAngle);
  }
  if (!fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.stroke();
  }
}
var ArcElement = /*#__PURE__*/function (_Element2) {
  _inherits(ArcElement, _Element2);
  var _super12 = _createSuper(ArcElement);
  function ArcElement(cfg) {
    var _this23;
    _classCallCheck(this, ArcElement);
    _this23 = _super12.call(this);
    _defineProperty(_assertThisInitialized(_this23), "circumference", void 0);
    _defineProperty(_assertThisInitialized(_this23), "endAngle", void 0);
    _defineProperty(_assertThisInitialized(_this23), "fullCircles", void 0);
    _defineProperty(_assertThisInitialized(_this23), "innerRadius", void 0);
    _defineProperty(_assertThisInitialized(_this23), "outerRadius", void 0);
    _defineProperty(_assertThisInitialized(_this23), "pixelMargin", void 0);
    _defineProperty(_assertThisInitialized(_this23), "startAngle", void 0);
    _this23.options = undefined;
    _this23.circumference = undefined;
    _this23.startAngle = undefined;
    _this23.endAngle = undefined;
    _this23.innerRadius = undefined;
    _this23.outerRadius = undefined;
    _this23.pixelMargin = 0;
    _this23.fullCircles = 0;
    if (cfg) {
      Object.assign(_assertThisInitialized(_this23), cfg);
    }
    return _this23;
  }
  _createClass(ArcElement, [{
    key: "inRange",
    value: function inRange(chartX, chartY, useFinalPosition) {
      var point = this.getProps(['x', 'y'], useFinalPosition);
      var _getAngleFromPoint2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.D)(point, {
          x: chartX,
          y: chartY
        }),
        angle = _getAngleFromPoint2.angle,
        distance = _getAngleFromPoint2.distance;
      var _this$getProps2 = this.getProps(['startAngle', 'endAngle', 'innerRadius', 'outerRadius', 'circumference'], useFinalPosition),
        startAngle = _this$getProps2.startAngle,
        endAngle = _this$getProps2.endAngle,
        innerRadius = _this$getProps2.innerRadius,
        outerRadius = _this$getProps2.outerRadius,
        circumference = _this$getProps2.circumference;
      var rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
      var _circumference = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(circumference, endAngle - startAngle);
      var betweenAngles = _circumference >= _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p)(angle, startAngle, endAngle);
      var withinRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(distance, innerRadius + rAdjust, outerRadius + rAdjust);
      return betweenAngles && withinRadius;
    }
  }, {
    key: "getCenterPoint",
    value: function getCenterPoint(useFinalPosition) {
      var _this$getProps3 = this.getProps(['x', 'y', 'startAngle', 'endAngle', 'innerRadius', 'outerRadius'], useFinalPosition),
        x = _this$getProps3.x,
        y = _this$getProps3.y,
        startAngle = _this$getProps3.startAngle,
        endAngle = _this$getProps3.endAngle,
        innerRadius = _this$getProps3.innerRadius,
        outerRadius = _this$getProps3.outerRadius;
      var _this$options13 = this.options,
        offset = _this$options13.offset,
        spacing = _this$options13.spacing;
      var halfAngle = (startAngle + endAngle) / 2;
      var halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
      return {
        x: x + Math.cos(halfAngle) * halfRadius,
        y: y + Math.sin(halfAngle) * halfRadius
      };
    }
  }, {
    key: "tooltipPosition",
    value: function tooltipPosition(useFinalPosition) {
      return this.getCenterPoint(useFinalPosition);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var options = this.options,
        circumference = this.circumference;
      var offset = (options.offset || 0) / 4;
      var spacing = (options.spacing || 0) / 2;
      var circular = options.circular;
      this.pixelMargin = options.borderAlign === 'inner' ? 0.33 : 0;
      this.fullCircles = circumference > _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T ? Math.floor(circumference / _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T) : 0;
      if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
        return;
      }
      ctx.save();
      var halfAngle = (this.startAngle + this.endAngle) / 2;
      ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
      var fix = 1 - Math.sin(Math.min(_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P, circumference || 0));
      var radiusOffset = offset * fix;
      ctx.fillStyle = options.backgroundColor;
      ctx.strokeStyle = options.borderColor;
      drawArc(ctx, this, radiusOffset, spacing, circular);
      drawBorder(ctx, this, radiusOffset, spacing, circular);
      ctx.restore();
    }
  }]);
  return ArcElement;
}(Element);
_defineProperty(ArcElement, "id", 'arc');
_defineProperty(ArcElement, "defaults", {
  borderAlign: 'center',
  borderColor: '#fff',
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: undefined,
  borderRadius: 0,
  borderWidth: 2,
  offset: 0,
  spacing: 0,
  angle: undefined,
  circular: true
});
_defineProperty(ArcElement, "defaultRoutes", {
  backgroundColor: 'backgroundColor'
});
_defineProperty(ArcElement, "descriptors", {
  _scriptable: true,
  _indexable: function _indexable(name) {
    return name !== 'borderDash';
  }
});
function setStyle(ctx, options) {
  var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options;
  ctx.lineCap = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderCapStyle, options.borderCapStyle);
  ctx.setLineDash((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderDash, options.borderDash));
  ctx.lineDashOffset = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderDashOffset, options.borderDashOffset);
  ctx.lineJoin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderJoinStyle, options.borderJoinStyle);
  ctx.lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderWidth, options.borderWidth);
  ctx.strokeStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(style.borderColor, options.borderColor);
}
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
function getLineMethod(options) {
  if (options.stepped) {
    return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ar;
  }
  if (options.tension || options.cubicInterpolationMode === 'monotone') {
    return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.as;
  }
  return lineTo;
}
function pathVars(points, segment) {
  var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var count = points.length;
  var _params$start = params.start,
    paramsStart = _params$start === void 0 ? 0 : _params$start,
    _params$end = params.end,
    paramsEnd = _params$end === void 0 ? count - 1 : _params$end;
  var segmentStart = segment.start,
    segmentEnd = segment.end;
  var start = Math.max(paramsStart, segmentStart);
  var end = Math.min(paramsEnd, segmentEnd);
  var outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count: count,
    start: start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
function pathSegment(ctx, line, segment, params) {
  var points = line.points,
    options = line.options;
  var _pathVars = pathVars(points, segment, params),
    count = _pathVars.count,
    start = _pathVars.start,
    loop = _pathVars.loop,
    ilen = _pathVars.ilen;
  var lineMethod = getLineMethod(options);
  var _ref5 = params || {},
    _ref5$move = _ref5.move,
    move = _ref5$move === void 0 ? true : _ref5$move,
    reverse = _ref5.reverse;
  var i, point, prev;
  for (i = 0; i <= ilen; ++i) {
    point = points[(start + (reverse ? ilen - i : i)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    prev = point;
  }
  if (loop) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options.stepped);
  }
  return !!loop;
}
function fastPathSegment(ctx, line, segment, params) {
  var points = line.points;
  var _pathVars2 = pathVars(points, segment, params),
    count = _pathVars2.count,
    start = _pathVars2.start,
    ilen = _pathVars2.ilen;
  var _ref6 = params || {},
    _ref6$move = _ref6.move,
    move = _ref6$move === void 0 ? true : _ref6$move,
    reverse = _ref6.reverse;
  var avgX = 0;
  var countX = 0;
  var i, point, prevX, minY, maxY, lastY;
  var pointIndex = function pointIndex(index) {
    return (start + (reverse ? ilen - index : index)) % count;
  };
  var drawX = function drawX() {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  };
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i = 0; i <= ilen; ++i) {
    point = points[pointIndex(i)];
    if (point.skip) {
      continue;
    }
    var x = point.x;
    var y = point.y;
    var truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
      avgX = (countX * avgX + x) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x, y);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
    }
    lastY = y;
  }
  drawX();
}
function _getSegmentMethod(line) {
  var opts = line.options;
  var borderDash = opts.borderDash && opts.borderDash.length;
  var useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== 'monotone' && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
function _getInterpolationMethod(options) {
  if (options.stepped) {
    return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ao;
  }
  if (options.tension || options.cubicInterpolationMode === 'monotone') {
    return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ap;
  }
  return _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aq;
}
function strokePathWithCache(ctx, line, start, count) {
  var path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
function strokePathDirect(ctx, line, start, count) {
  var segments = line.segments,
    options = line.options;
  var segmentMethod = _getSegmentMethod(line);
  var _iterator16 = _createForOfIteratorHelper(segments),
    _step16;
  try {
    for (_iterator16.s(); !(_step16 = _iterator16.n()).done;) {
      var segment = _step16.value;
      setStyle(ctx, options, segment.style);
      ctx.beginPath();
      if (segmentMethod(ctx, line, segment, {
        start: start,
        end: start + count - 1
      })) {
        ctx.closePath();
      }
      ctx.stroke();
    }
  } catch (err) {
    _iterator16.e(err);
  } finally {
    _iterator16.f();
  }
}
var usePath2D = typeof Path2D === 'function';
function _draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
var LineElement = /*#__PURE__*/function (_Element3) {
  _inherits(LineElement, _Element3);
  var _super13 = _createSuper(LineElement);
  function LineElement(cfg) {
    var _this24;
    _classCallCheck(this, LineElement);
    _this24 = _super13.call(this);
    _this24.animated = true;
    _this24.options = undefined;
    _this24._chart = undefined;
    _this24._loop = undefined;
    _this24._fullLoop = undefined;
    _this24._path = undefined;
    _this24._points = undefined;
    _this24._segments = undefined;
    _this24._decimated = false;
    _this24._pointsUpdated = false;
    _this24._datasetIndex = undefined;
    if (cfg) {
      Object.assign(_assertThisInitialized(_this24), cfg);
    }
    return _this24;
  }
  _createClass(LineElement, [{
    key: "updateControlPoints",
    value: function updateControlPoints(chartArea, indexAxis) {
      var options = this.options;
      if ((options.tension || options.cubicInterpolationMode === 'monotone') && !options.stepped && !this._pointsUpdated) {
        var loop = options.spanGaps ? this._loop : this._fullLoop;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.al)(this._points, options, chartArea, loop, indexAxis);
        this._pointsUpdated = true;
      }
    }
  }, {
    key: "points",
    get: function get() {
      return this._points;
    },
    set: function set(points) {
      this._points = points;
      delete this._segments;
      delete this._path;
      this._pointsUpdated = false;
    }
  }, {
    key: "segments",
    get: function get() {
      return this._segments || (this._segments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.am)(this, this.options.segment));
    }
  }, {
    key: "first",
    value: function first() {
      var segments = this.segments;
      var points = this.points;
      return segments.length && points[segments[0].start];
    }
  }, {
    key: "last",
    value: function last() {
      var segments = this.segments;
      var points = this.points;
      var count = segments.length;
      return count && points[segments[count - 1].end];
    }
  }, {
    key: "interpolate",
    value: function interpolate(point, property) {
      var options = this.options;
      var value = point[property];
      var points = this.points;
      var segments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.an)(this, {
        property: property,
        start: value,
        end: value
      });
      if (!segments.length) {
        return;
      }
      var result = [];
      var _interpolate = _getInterpolationMethod(options);
      var i, ilen;
      for (i = 0, ilen = segments.length; i < ilen; ++i) {
        var _segments$i = segments[i],
          start = _segments$i.start,
          end = _segments$i.end;
        var p1 = points[start];
        var p2 = points[end];
        if (p1 === p2) {
          result.push(p1);
          continue;
        }
        var t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
        var interpolated = _interpolate(p1, p2, t, options.stepped);
        interpolated[property] = point[property];
        result.push(interpolated);
      }
      return result.length === 1 ? result[0] : result;
    }
  }, {
    key: "pathSegment",
    value: function pathSegment(ctx, segment, params) {
      var segmentMethod = _getSegmentMethod(this);
      return segmentMethod(ctx, this, segment, params);
    }
  }, {
    key: "path",
    value: function path(ctx, start, count) {
      var segments = this.segments;
      var segmentMethod = _getSegmentMethod(this);
      var loop = this._loop;
      start = start || 0;
      count = count || this.points.length - start;
      var _iterator17 = _createForOfIteratorHelper(segments),
        _step17;
      try {
        for (_iterator17.s(); !(_step17 = _iterator17.n()).done;) {
          var segment = _step17.value;
          loop &= segmentMethod(ctx, this, segment, {
            start: start,
            end: start + count - 1
          });
        }
      } catch (err) {
        _iterator17.e(err);
      } finally {
        _iterator17.f();
      }
      return !!loop;
    }
  }, {
    key: "draw",
    value: function draw(ctx, chartArea, start, count) {
      var options = this.options || {};
      var points = this.points || [];
      if (points.length && options.borderWidth) {
        ctx.save();
        _draw(ctx, this, start, count);
        ctx.restore();
      }
      if (this.animated) {
        this._pointsUpdated = false;
        this._path = undefined;
      }
    }
  }]);
  return LineElement;
}(Element);
_defineProperty(LineElement, "id", 'line');
_defineProperty(LineElement, "defaults", {
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0,
  borderJoinStyle: 'miter',
  borderWidth: 3,
  capBezierPoints: true,
  cubicInterpolationMode: 'default',
  fill: false,
  spanGaps: false,
  stepped: false,
  tension: 0
});
_defineProperty(LineElement, "defaultRoutes", {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor'
});
_defineProperty(LineElement, "descriptors", {
  _scriptable: true,
  _indexable: function _indexable(name) {
    return name !== 'borderDash' && name !== 'fill';
  }
});
function inRange$1(el, pos, axis, useFinalPosition) {
  var options = el.options;
  var _el$getProps = el.getProps([axis], useFinalPosition),
    value = _el$getProps[axis];
  return Math.abs(pos - value) < options.radius + options.hitRadius;
}
var PointElement = /*#__PURE__*/function (_Element4) {
  _inherits(PointElement, _Element4);
  var _super14 = _createSuper(PointElement);
  function PointElement(cfg) {
    var _this25;
    _classCallCheck(this, PointElement);
    _this25 = _super14.call(this);
    _defineProperty(_assertThisInitialized(_this25), "parsed", void 0);
    _defineProperty(_assertThisInitialized(_this25), "skip", void 0);
    _defineProperty(_assertThisInitialized(_this25), "stop", void 0);
    _this25.options = undefined;
    _this25.parsed = undefined;
    _this25.skip = undefined;
    _this25.stop = undefined;
    if (cfg) {
      Object.assign(_assertThisInitialized(_this25), cfg);
    }
    return _this25;
  }
  _createClass(PointElement, [{
    key: "inRange",
    value: function inRange(mouseX, mouseY, useFinalPosition) {
      var options = this.options;
      var _this$getProps4 = this.getProps(['x', 'y'], useFinalPosition),
        x = _this$getProps4.x,
        y = _this$getProps4.y;
      return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
    }
  }, {
    key: "inXRange",
    value: function inXRange(mouseX, useFinalPosition) {
      return inRange$1(this, mouseX, 'x', useFinalPosition);
    }
  }, {
    key: "inYRange",
    value: function inYRange(mouseY, useFinalPosition) {
      return inRange$1(this, mouseY, 'y', useFinalPosition);
    }
  }, {
    key: "getCenterPoint",
    value: function getCenterPoint(useFinalPosition) {
      var _this$getProps5 = this.getProps(['x', 'y'], useFinalPosition),
        x = _this$getProps5.x,
        y = _this$getProps5.y;
      return {
        x: x,
        y: y
      };
    }
  }, {
    key: "size",
    value: function size(options) {
      options = options || this.options || {};
      var radius = options.radius || 0;
      radius = Math.max(radius, radius && options.hoverRadius || 0);
      var borderWidth = radius && options.borderWidth || 0;
      return (radius + borderWidth) * 2;
    }
  }, {
    key: "draw",
    value: function draw(ctx, area) {
      var options = this.options;
      if (this.skip || options.radius < 0.1 || !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)(this, area, this.size(options) / 2)) {
        return;
      }
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.fillStyle = options.backgroundColor;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, options, this.x, this.y);
    }
  }, {
    key: "getRange",
    value: function getRange() {
      var options = this.options || {};
      // @ts-expect-error Fallbacks should never be hit in practice
      return options.radius + options.hitRadius;
    }
  }]);
  return PointElement;
}(Element);
_defineProperty(PointElement, "id", 'point');
/**
* @type {any}
*/
_defineProperty(PointElement, "defaults", {
  borderWidth: 1,
  hitRadius: 1,
  hoverBorderWidth: 1,
  hoverRadius: 4,
  pointStyle: 'circle',
  radius: 3,
  rotation: 0
});
/**
* @type {any}
*/
_defineProperty(PointElement, "defaultRoutes", {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor'
});
function getBarBounds(bar, useFinalPosition) {
  var _bar$getProps = bar.getProps(['x', 'y', 'base', 'width', 'height'], useFinalPosition),
    x = _bar$getProps.x,
    y = _bar$getProps.y,
    base = _bar$getProps.base,
    width = _bar$getProps.width,
    height = _bar$getProps.height;
  var left, right, top, bottom, half;
  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x, base);
    right = Math.max(x, base);
    top = y - half;
    bottom = y + half;
  } else {
    half = width / 2;
    left = x - half;
    right = x + half;
    top = Math.min(y, base);
    bottom = Math.max(y, base);
  }
  return {
    left: left,
    top: top,
    right: right,
    bottom: bottom
  };
}
function skipOrLimit(skip, value, min, max) {
  return skip ? 0 : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(value, min, max);
}
function parseBorderWidth(bar, maxW, maxH) {
  var value = bar.options.borderWidth;
  var skip = bar.borderSkipped;
  var o = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.av)(value);
  return {
    t: skipOrLimit(skip.top, o.top, 0, maxH),
    r: skipOrLimit(skip.right, o.right, 0, maxW),
    b: skipOrLimit(skip.bottom, o.bottom, 0, maxH),
    l: skipOrLimit(skip.left, o.left, 0, maxW)
  };
}
function parseBorderRadius(bar, maxW, maxH) {
  var _bar$getProps2 = bar.getProps(['enableBorderRadius']),
    enableBorderRadius = _bar$getProps2.enableBorderRadius;
  var value = bar.options.borderRadius;
  var o = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(value);
  var maxR = Math.min(maxW, maxH);
  var skip = bar.borderSkipped;
  var enableBorder = enableBorderRadius || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(value);
  return {
    topLeft: skipOrLimit(!enableBorder || skip.top || skip.left, o.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip.top || skip.right, o.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip.bottom || skip.left, o.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip.bottom || skip.right, o.bottomRight, 0, maxR)
  };
}
function boundingRects(bar) {
  var bounds = getBarBounds(bar);
  var width = bounds.right - bounds.left;
  var height = bounds.bottom - bounds.top;
  var border = parseBorderWidth(bar, width / 2, height / 2);
  var radius = parseBorderRadius(bar, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius: radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
      }
    }
  };
}
function _inRange(bar, x, y, useFinalPosition) {
  var skipX = x === null;
  var skipY = y === null;
  var skipBoth = skipX && skipY;
  var bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
  return bounds && (skipX || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, bounds.left, bounds.right)) && (skipY || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, bounds.top, bounds.bottom));
}
function hasRadius(radius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
function inflateRect(rect, amount) {
  var refRect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var x = rect.x !== refRect.x ? -amount : 0;
  var y = rect.y !== refRect.y ? -amount : 0;
  var w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
  var h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
  return {
    x: rect.x + x,
    y: rect.y + y,
    w: rect.w + w,
    h: rect.h + h,
    radius: rect.radius
  };
}
var BarElement = /*#__PURE__*/function (_Element5) {
  _inherits(BarElement, _Element5);
  var _super15 = _createSuper(BarElement);
  function BarElement(cfg) {
    var _this26;
    _classCallCheck(this, BarElement);
    _this26 = _super15.call(this);
    _this26.options = undefined;
    _this26.horizontal = undefined;
    _this26.base = undefined;
    _this26.width = undefined;
    _this26.height = undefined;
    _this26.inflateAmount = undefined;
    if (cfg) {
      Object.assign(_assertThisInitialized(_this26), cfg);
    }
    return _this26;
  }
  _createClass(BarElement, [{
    key: "draw",
    value: function draw(ctx) {
      var inflateAmount = this.inflateAmount,
        _this$options14 = this.options,
        borderColor = _this$options14.borderColor,
        backgroundColor = _this$options14.backgroundColor;
      var _boundingRects = boundingRects(this),
        inner = _boundingRects.inner,
        outer = _boundingRects.outer;
      var addRectPath = hasRadius(outer.radius) ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au : addNormalRectPath;
      ctx.save();
      if (outer.w !== inner.w || outer.h !== inner.h) {
        ctx.beginPath();
        addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
        ctx.clip();
        addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
        ctx.fillStyle = borderColor;
        ctx.fill('evenodd');
      }
      ctx.beginPath();
      addRectPath(ctx, inflateRect(inner, inflateAmount));
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }, {
    key: "inRange",
    value: function inRange(mouseX, mouseY, useFinalPosition) {
      return _inRange(this, mouseX, mouseY, useFinalPosition);
    }
  }, {
    key: "inXRange",
    value: function inXRange(mouseX, useFinalPosition) {
      return _inRange(this, mouseX, null, useFinalPosition);
    }
  }, {
    key: "inYRange",
    value: function inYRange(mouseY, useFinalPosition) {
      return _inRange(this, null, mouseY, useFinalPosition);
    }
  }, {
    key: "getCenterPoint",
    value: function getCenterPoint(useFinalPosition) {
      var _this$getProps6 = this.getProps(['x', 'y', 'base', 'horizontal'], useFinalPosition),
        x = _this$getProps6.x,
        y = _this$getProps6.y,
        base = _this$getProps6.base,
        horizontal = _this$getProps6.horizontal;
      return {
        x: horizontal ? (x + base) / 2 : x,
        y: horizontal ? y : (y + base) / 2
      };
    }
  }, {
    key: "getRange",
    value: function getRange(axis) {
      return axis === 'x' ? this.width / 2 : this.height / 2;
    }
  }]);
  return BarElement;
}(Element);
_defineProperty(BarElement, "id", 'bar');
_defineProperty(BarElement, "defaults", {
  borderSkipped: 'start',
  borderWidth: 0,
  borderRadius: 0,
  inflateAmount: 'auto',
  pointStyle: undefined
});
_defineProperty(BarElement, "defaultRoutes", {
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor'
});
var elements = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ArcElement: ArcElement,
  BarElement: BarElement,
  LineElement: LineElement,
  PointElement: PointElement
});
var BORDER_COLORS = ['rgb(54, 162, 235)', 'rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(201, 203, 207)' // grey
];
// Border colors with 50% transparency
var BACKGROUND_COLORS = /* #__PURE__ */BORDER_COLORS.map(function (color) {
  return color.replace('rgb(', 'rgba(').replace(')', ', 0.5)');
});
function getBorderColor(i) {
  return BORDER_COLORS[i % BORDER_COLORS.length];
}
function getBackgroundColor(i) {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}
function colorizeDefaultDataset(dataset, i) {
  dataset.borderColor = getBorderColor(i);
  dataset.backgroundColor = getBackgroundColor(i);
  return ++i;
}
function colorizeDoughnutDataset(dataset, i) {
  dataset.backgroundColor = dataset.data.map(function () {
    return getBorderColor(i++);
  });
  return i;
}
function colorizePolarAreaDataset(dataset, i) {
  dataset.backgroundColor = dataset.data.map(function () {
    return getBackgroundColor(i++);
  });
  return i;
}
function getColorizer(chart) {
  var i = 0;
  return function (dataset, datasetIndex) {
    var controller = chart.getDatasetMeta(datasetIndex).controller;
    if (controller instanceof DoughnutController) {
      i = colorizeDoughnutDataset(dataset, i);
    } else if (controller instanceof PolarAreaController) {
      i = colorizePolarAreaDataset(dataset, i);
    } else if (controller) {
      i = colorizeDefaultDataset(dataset, i);
    }
  };
}
function containsColorsDefinitions(descriptors) {
  var k;
  for (k in descriptors) {
    if (descriptors[k].borderColor || descriptors[k].backgroundColor) {
      return true;
    }
  }
  return false;
}
function containsColorsDefinition(descriptor) {
  return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
}
var plugin_colors = {
  id: 'colors',
  defaults: {
    enabled: true,
    forceOverride: false
  },
  beforeLayout: function beforeLayout(chart, _args, options) {
    if (!options.enabled) {
      return;
    }
    var _chart$config = chart.config,
      datasets = _chart$config.data.datasets,
      chartOptions = _chart$config.options;
    var elements = chartOptions.elements;
    if (!options.forceOverride && (containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements && containsColorsDefinitions(elements))) {
      return;
    }
    var colorizer = getColorizer(chart);
    datasets.forEach(colorizer);
  }
};
function lttbDecimation(data, start, count, availableWidth, options) {
  var samples = options.samples || availableWidth;
  if (samples >= count) {
    return data.slice(start, start + count);
  }
  var decimated = [];
  var bucketWidth = (count - 2) / (samples - 2);
  var sampledIndex = 0;
  var endIndex = start + count - 1;
  var a = start;
  var i, maxAreaPoint, maxArea, area, nextA;
  decimated[sampledIndex++] = data[a];
  for (i = 0; i < samples - 2; i++) {
    var avgX = 0;
    var avgY = 0;
    var j = void 0;
    var avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
    var avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
    var avgRangeLength = avgRangeEnd - avgRangeStart;
    for (j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    var rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
    var rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
    var _data$a = data[a],
      pointAx = _data$a.x,
      pointAy = _data$a.y;
    maxArea = area = -1;
    for (j = rangeOffs; j < rangeTo; j++) {
      area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }
    decimated[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }
  decimated[sampledIndex++] = data[endIndex];
  return decimated;
}
function minMaxDecimation(data, start, count, availableWidth) {
  var avgX = 0;
  var countX = 0;
  var i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  var decimated = [];
  var endIndex = start + count - 1;
  var xMin = data[start].x;
  var xMax = data[endIndex].x;
  var dx = xMax - xMin;
  for (i = start; i < start + count; ++i) {
    point = data[i];
    x = (point.x - xMin) / dx * availableWidth;
    y = point.y;
    var truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
        minIndex = i;
      } else if (y > maxY) {
        maxY = y;
        maxIndex = i;
      }
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      var lastIndex = i - 1;
      if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(minIndex) && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(maxIndex)) {
        var intermediateIndex1 = Math.min(minIndex, maxIndex);
        var intermediateIndex2 = Math.max(minIndex, maxIndex);
        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push(_objectSpread(_objectSpread({}, data[intermediateIndex1]), {}, {
            x: avgX
          }));
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push(_objectSpread(_objectSpread({}, data[intermediateIndex2]), {}, {
            x: avgX
          }));
        }
      }
      if (i > 0 && lastIndex !== startIndex) {
        decimated.push(data[lastIndex]);
      }
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
      minIndex = maxIndex = startIndex = i;
    }
  }
  return decimated;
}
function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    var data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, 'data', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: data
    });
  }
}
function cleanDecimatedData(chart) {
  chart.data.datasets.forEach(function (dataset) {
    cleanDecimatedDataset(dataset);
  });
}
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  var pointCount = points.length;
  var start = 0;
  var count;
  var iScale = meta.iScale;
  var _iScale$getUserBounds = iScale.getUserBounds(),
    min = _iScale$getUserBounds.min,
    max = _iScale$getUserBounds.max,
    minDefined = _iScale$getUserBounds.minDefined,
    maxDefined = _iScale$getUserBounds.maxDefined;
  if (minDefined) {
    start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }
  return {
    start: start,
    count: count
  };
}
var plugin_decimation = {
  id: 'decimation',
  defaults: {
    algorithm: 'min-max',
    enabled: false
  },
  beforeElementsUpdate: function beforeElementsUpdate(chart, args, options) {
    if (!options.enabled) {
      cleanDecimatedData(chart);
      return;
    }
    var availableWidth = chart.width;
    chart.data.datasets.forEach(function (dataset, datasetIndex) {
      var _data = dataset._data,
        indexAxis = dataset.indexAxis;
      var meta = chart.getDatasetMeta(datasetIndex);
      var data = _data || dataset.data;
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a)([indexAxis, chart.options.indexAxis]) === 'y') {
        return;
      }
      if (!meta.controller.supportsDecimation) {
        return;
      }
      var xAxis = chart.scales[meta.xAxisID];
      if (xAxis.type !== 'linear' && xAxis.type !== 'time') {
        return;
      }
      if (chart.options.parsing) {
        return;
      }
      var _getStartAndCountOfVi3 = getStartAndCountOfVisiblePointsSimplified(meta, data),
        start = _getStartAndCountOfVi3.start,
        count = _getStartAndCountOfVi3.count;
      var threshold = options.threshold || 4 * availableWidth;
      if (count <= threshold) {
        cleanDecimatedDataset(dataset);
        return;
      }
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(_data)) {
        dataset._data = data;
        delete dataset.data;
        Object.defineProperty(dataset, 'data', {
          configurable: true,
          enumerable: true,
          get: function get() {
            return this._decimated;
          },
          set: function set(d) {
            this._data = d;
          }
        });
      }
      var decimated;
      switch (options.algorithm) {
        case 'lttb':
          decimated = lttbDecimation(data, start, count, availableWidth, options);
          break;
        case 'min-max':
          decimated = minMaxDecimation(data, start, count, availableWidth);
          break;
        default:
          throw new Error("Unsupported decimation algorithm '".concat(options.algorithm, "'"));
      }
      dataset._decimated = decimated;
    });
  },
  destroy: function destroy(chart) {
    cleanDecimatedData(chart);
  }
};
function _segments(line, target, property) {
  var segments = line.segments;
  var points = line.points;
  var tpoints = target.points;
  var parts = [];
  var _iterator18 = _createForOfIteratorHelper(segments),
    _step18;
  try {
    for (_iterator18.s(); !(_step18 = _iterator18.n()).done;) {
      var segment = _step18.value;
      var start = segment.start,
        end = segment.end;
      end = _findSegmentEnd(start, end, points);
      var bounds = _getBounds(property, points[start], points[end], segment.loop);
      if (!target.segments) {
        parts.push({
          source: segment,
          target: bounds,
          start: points[start],
          end: points[end]
        });
        continue;
      }
      var targetSegments = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.an)(target, bounds);
      var _iterator19 = _createForOfIteratorHelper(targetSegments),
        _step19;
      try {
        for (_iterator19.s(); !(_step19 = _iterator19.n()).done;) {
          var tgt = _step19.value;
          var subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
          var fillSources = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ax)(segment, points, subBounds);
          var _iterator20 = _createForOfIteratorHelper(fillSources),
            _step20;
          try {
            for (_iterator20.s(); !(_step20 = _iterator20.n()).done;) {
              var fillSource = _step20.value;
              parts.push({
                source: fillSource,
                target: tgt,
                start: _defineProperty({}, property, _getEdge(bounds, subBounds, 'start', Math.max)),
                end: _defineProperty({}, property, _getEdge(bounds, subBounds, 'end', Math.min))
              });
            }
          } catch (err) {
            _iterator20.e(err);
          } finally {
            _iterator20.f();
          }
        }
      } catch (err) {
        _iterator19.e(err);
      } finally {
        _iterator19.f();
      }
    }
  } catch (err) {
    _iterator18.e(err);
  } finally {
    _iterator18.f();
  }
  return parts;
}
function _getBounds(property, first, last, loop) {
  if (loop) {
    return;
  }
  var start = first[property];
  var end = last[property];
  if (property === 'angle') {
    start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(start);
    end = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(end);
  }
  return {
    property: property,
    start: start,
    end: end
  };
}
function _pointsFromSegments(boundary, line) {
  var _ref7 = boundary || {},
    _ref7$x = _ref7.x,
    x = _ref7$x === void 0 ? null : _ref7$x,
    _ref7$y = _ref7.y,
    y = _ref7$y === void 0 ? null : _ref7$y;
  var linePoints = line.points;
  var points = [];
  line.segments.forEach(function (_ref8) {
    var start = _ref8.start,
      end = _ref8.end;
    end = _findSegmentEnd(start, end, linePoints);
    var first = linePoints[start];
    var last = linePoints[end];
    if (y !== null) {
      points.push({
        x: first.x,
        y: y
      });
      points.push({
        x: last.x,
        y: y
      });
    } else if (x !== null) {
      points.push({
        x: x,
        y: first.y
      });
      points.push({
        x: x,
        y: last.y
      });
    }
  });
  return points;
}
function _findSegmentEnd(start, end, points) {
  for (; end > start; end--) {
    var point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}
function _getEdge(a, b, prop, fn) {
  if (a && b) {
    return fn(a[prop], b[prop]);
  }
  return a ? a[prop] : b ? b[prop] : 0;
}
function _createBoundaryLine(boundary, line) {
  var points = [];
  var _loop = false;
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(boundary)) {
    _loop = true;
    points = boundary;
  } else {
    points = _pointsFromSegments(boundary, line);
  }
  return points.length ? new LineElement({
    points: points,
    options: {
      tension: 0
    },
    _loop: _loop,
    _fullLoop: _loop
  }) : null;
}
function _shouldApplyFill(source) {
  return source && source.fill !== false;
}
function _resolveTarget(sources, index, propagate) {
  var source = sources[index];
  var fill = source.fill;
  var visited = [index];
  var target;
  if (!propagate) {
    return fill;
  }
  while (fill !== false && visited.indexOf(fill) === -1) {
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(fill)) {
      return fill;
    }
    target = sources[fill];
    if (!target) {
      return false;
    }
    if (target.visible) {
      return fill;
    }
    visited.push(fill);
    fill = target.fill;
  }
  return false;
}
function _decodeFill(line, index, count) {
  var fill = parseFillOption(line);
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
    return isNaN(fill.value) ? false : fill;
  }
  var target = parseFloat(fill);
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(target) && Math.floor(target) === target) {
    return decodeTargetIndex(fill[0], index, target, count);
  }
  return ['origin', 'start', 'end', 'stack', 'shape'].indexOf(fill) >= 0 && fill;
}
function decodeTargetIndex(firstCh, index, target, count) {
  if (firstCh === '-' || firstCh === '+') {
    target = index + target;
  }
  if (target === index || target < 0 || target >= count) {
    return false;
  }
  return target;
}
function _getTargetPixel(fill, scale) {
  var pixel = null;
  if (fill === 'start') {
    pixel = scale.bottom;
  } else if (fill === 'end') {
    pixel = scale.top;
  } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
    pixel = scale.getPixelForValue(fill.value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}
function _getTargetValue(fill, scale, startValue) {
  var value;
  if (fill === 'start') {
    value = startValue;
  } else if (fill === 'end') {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(fill)) {
    value = fill.value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}
function parseFillOption(line) {
  var options = line.options;
  var fillOption = options.fill;
  var fill = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(fillOption && fillOption.target, fillOption);
  if (fill === undefined) {
    fill = !!options.backgroundColor;
  }
  if (fill === false || fill === null) {
    return false;
  }
  if (fill === true) {
    return 'origin';
  }
  return fill;
}
function _buildStackLine(source) {
  var scale = source.scale,
    index = source.index,
    line = source.line;
  var points = [];
  var segments = line.segments;
  var sourcePoints = line.points;
  var linesBelow = getLinesBelow(scale, index);
  linesBelow.push(_createBoundaryLine({
    x: null,
    y: scale.bottom
  }, line));
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    for (var j = segment.start; j <= segment.end; j++) {
      addPointsBelow(points, sourcePoints[j], linesBelow);
    }
  }
  return new LineElement({
    points: points,
    options: {}
  });
}
function getLinesBelow(scale, index) {
  var below = [];
  var metas = scale.getMatchingVisibleMetas('line');
  for (var i = 0; i < metas.length; i++) {
    var meta = metas[i];
    if (meta.index === index) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}
function addPointsBelow(points, sourcePoint, linesBelow) {
  var postponed = [];
  for (var j = 0; j < linesBelow.length; j++) {
    var line = linesBelow[j];
    var _findPoint = findPoint(line, sourcePoint, 'x'),
      first = _findPoint.first,
      last = _findPoint.last,
      point = _findPoint.point;
    if (!point || first && last) {
      continue;
    }
    if (first) {
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        break;
      }
    }
  }
  points.push.apply(points, postponed);
}
function findPoint(line, sourcePoint, property) {
  var point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }
  var pointValue = point[property];
  var segments = line.segments;
  var linePoints = line.points;
  var first = false;
  var last = false;
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    var firstValue = linePoints[segment.start][property];
    var lastValue = linePoints[segment.end][property];
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return {
    first: first,
    last: last,
    point: point
  };
}
var simpleArc = /*#__PURE__*/function () {
  function simpleArc(opts) {
    _classCallCheck(this, simpleArc);
    this.x = opts.x;
    this.y = opts.y;
    this.radius = opts.radius;
  }
  _createClass(simpleArc, [{
    key: "pathSegment",
    value: function pathSegment(ctx, bounds, opts) {
      var x = this.x,
        y = this.y,
        radius = this.radius;
      bounds = bounds || {
        start: 0,
        end: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T
      };
      ctx.arc(x, y, radius, bounds.end, bounds.start, true);
      return !opts.bounds;
    }
  }, {
    key: "interpolate",
    value: function interpolate(point) {
      var x = this.x,
        y = this.y,
        radius = this.radius;
      var angle = point.angle;
      return {
        x: x + Math.cos(angle) * radius,
        y: y + Math.sin(angle) * radius,
        angle: angle
      };
    }
  }]);
  return simpleArc;
}();
function _getTarget(source) {
  var chart = source.chart,
    fill = source.fill,
    line = source.line;
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(fill)) {
    return getLineByIndex(chart, fill);
  }
  if (fill === 'stack') {
    return _buildStackLine(source);
  }
  if (fill === 'shape') {
    return true;
  }
  var boundary = computeBoundary(source);
  if (boundary instanceof simpleArc) {
    return boundary;
  }
  return _createBoundaryLine(boundary, line);
}
function getLineByIndex(chart, index) {
  var meta = chart.getDatasetMeta(index);
  var visible = meta && chart.isDatasetVisible(index);
  return visible ? meta.dataset : null;
}
function computeBoundary(source) {
  var scale = source.scale || {};
  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}
function computeLinearBoundary(source) {
  var _source$scale = source.scale,
    scale = _source$scale === void 0 ? {} : _source$scale,
    fill = source.fill;
  var pixel = _getTargetPixel(fill, scale);
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(pixel)) {
    var horizontal = scale.isHorizontal();
    return {
      x: horizontal ? pixel : null,
      y: horizontal ? null : pixel
    };
  }
  return null;
}
function computeCircularBoundary(source) {
  var scale = source.scale,
    fill = source.fill;
  var options = scale.options;
  var length = scale.getLabels().length;
  var start = options.reverse ? scale.max : scale.min;
  var value = _getTargetValue(fill, scale, start);
  var target = [];
  if (options.grid.circular) {
    var center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }
  for (var i = 0; i < length; ++i) {
    target.push(scale.getPointPositionForValue(i, value));
  }
  return target;
}
function _drawfill(ctx, source, area) {
  var target = _getTarget(source);
  var line = source.line,
    scale = source.scale,
    axis = source.axis;
  var lineOpts = line.options;
  var fillOption = lineOpts.fill;
  var color = lineOpts.backgroundColor;
  var _ref9 = fillOption || {},
    _ref9$above = _ref9.above,
    above = _ref9$above === void 0 ? color : _ref9$above,
    _ref9$below = _ref9.below,
    below = _ref9$below === void 0 ? color : _ref9$below;
  if (target && line.points.length) {
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, area);
    doFill(ctx, {
      line: line,
      target: target,
      above: above,
      below: below,
      area: area,
      scale: scale,
      axis: axis
    });
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
  }
}
function doFill(ctx, cfg) {
  var line = cfg.line,
    target = cfg.target,
    above = cfg.above,
    below = cfg.below,
    area = cfg.area,
    scale = cfg.scale;
  var property = line._loop ? 'angle' : cfg.axis;
  ctx.save();
  if (property === 'x' && below !== above) {
    clipVertical(ctx, target, area.top);
    fill(ctx, {
      line: line,
      target: target,
      color: above,
      scale: scale,
      property: property
    });
    ctx.restore();
    ctx.save();
    clipVertical(ctx, target, area.bottom);
  }
  fill(ctx, {
    line: line,
    target: target,
    color: below,
    scale: scale,
    property: property
  });
  ctx.restore();
}
function clipVertical(ctx, target, clipY) {
  var segments = target.segments,
    points = target.points;
  var first = true;
  var lineLoop = false;
  ctx.beginPath();
  var _iterator21 = _createForOfIteratorHelper(segments),
    _step21;
  try {
    for (_iterator21.s(); !(_step21 = _iterator21.n()).done;) {
      var segment = _step21.value;
      var start = segment.start,
        end = segment.end;
      var firstPoint = points[start];
      var lastPoint = points[_findSegmentEnd(start, end, points)];
      if (first) {
        ctx.moveTo(firstPoint.x, firstPoint.y);
        first = false;
      } else {
        ctx.lineTo(firstPoint.x, clipY);
        ctx.lineTo(firstPoint.x, firstPoint.y);
      }
      lineLoop = !!target.pathSegment(ctx, segment, {
        move: lineLoop
      });
      if (lineLoop) {
        ctx.closePath();
      } else {
        ctx.lineTo(lastPoint.x, clipY);
      }
    }
  } catch (err) {
    _iterator21.e(err);
  } finally {
    _iterator21.f();
  }
  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}
function fill(ctx, cfg) {
  var line = cfg.line,
    target = cfg.target,
    property = cfg.property,
    color = cfg.color,
    scale = cfg.scale;
  var segments = _segments(line, target, property);
  var _iterator22 = _createForOfIteratorHelper(segments),
    _step22;
  try {
    for (_iterator22.s(); !(_step22 = _iterator22.n()).done;) {
      var _step22$value = _step22.value,
        src = _step22$value.source,
        tgt = _step22$value.target,
        start = _step22$value.start,
        end = _step22$value.end;
      var _src$style = src.style,
        _src$style2 = _src$style === void 0 ? {} : _src$style,
        _src$style2$backgroun = _src$style2.backgroundColor,
        backgroundColor = _src$style2$backgroun === void 0 ? color : _src$style2$backgroun;
      var notShape = target !== true;
      ctx.save();
      ctx.fillStyle = backgroundColor;
      clipBounds(ctx, scale, notShape && _getBounds(property, start, end));
      ctx.beginPath();
      var lineLoop = !!line.pathSegment(ctx, src);
      var loop = void 0;
      if (notShape) {
        if (lineLoop) {
          ctx.closePath();
        } else {
          interpolatedLineTo(ctx, target, end, property);
        }
        var targetLoop = !!target.pathSegment(ctx, tgt, {
          move: lineLoop,
          reverse: true
        });
        loop = lineLoop && targetLoop;
        if (!loop) {
          interpolatedLineTo(ctx, target, start, property);
        }
      }
      ctx.closePath();
      ctx.fill(loop ? 'evenodd' : 'nonzero');
      ctx.restore();
    }
  } catch (err) {
    _iterator22.e(err);
  } finally {
    _iterator22.f();
  }
}
function clipBounds(ctx, scale, bounds) {
  var _scale$chart$chartAre = scale.chart.chartArea,
    top = _scale$chart$chartAre.top,
    bottom = _scale$chart$chartAre.bottom;
  var _ref10 = bounds || {},
    property = _ref10.property,
    start = _ref10.start,
    end = _ref10.end;
  if (property === 'x') {
    ctx.beginPath();
    ctx.rect(start, top, end - start, bottom - top);
    ctx.clip();
  }
}
function interpolatedLineTo(ctx, target, point, property) {
  var interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
var index = {
  id: 'filler',
  afterDatasetsUpdate: function afterDatasetsUpdate(chart, _args, options) {
    var count = (chart.data.datasets || []).length;
    var sources = [];
    var meta, i, line, source;
    for (i = 0; i < count; ++i) {
      meta = chart.getDatasetMeta(i);
      line = meta.dataset;
      source = null;
      if (line && line.options && line instanceof LineElement) {
        source = {
          visible: chart.isDatasetVisible(i),
          index: i,
          fill: _decodeFill(line, i, count),
          chart: chart,
          axis: meta.controller.options.indexAxis,
          scale: meta.vScale,
          line: line
        };
      }
      meta.$filler = source;
      sources.push(source);
    }
    for (i = 0; i < count; ++i) {
      source = sources[i];
      if (!source || source.fill === false) {
        continue;
      }
      source.fill = _resolveTarget(sources, i, options.propagate);
    }
  },
  beforeDraw: function beforeDraw(chart, _args, options) {
    var draw = options.drawTime === 'beforeDraw';
    var metasets = chart.getSortedVisibleDatasetMetas();
    var area = chart.chartArea;
    for (var i = metasets.length - 1; i >= 0; --i) {
      var source = metasets[i].$filler;
      if (!source) {
        continue;
      }
      source.line.updateControlPoints(area, source.axis);
      if (draw && source.fill) {
        _drawfill(chart.ctx, source, area);
      }
    }
  },
  beforeDatasetsDraw: function beforeDatasetsDraw(chart, _args, options) {
    if (options.drawTime !== 'beforeDatasetsDraw') {
      return;
    }
    var metasets = chart.getSortedVisibleDatasetMetas();
    for (var i = metasets.length - 1; i >= 0; --i) {
      var source = metasets[i].$filler;
      if (_shouldApplyFill(source)) {
        _drawfill(chart.ctx, source, chart.chartArea);
      }
    }
  },
  beforeDatasetDraw: function beforeDatasetDraw(chart, args, options) {
    var source = args.meta.$filler;
    if (!_shouldApplyFill(source) || options.drawTime !== 'beforeDatasetDraw') {
      return;
    }
    _drawfill(chart.ctx, source, chart.chartArea);
  },
  defaults: {
    propagate: true,
    drawTime: 'beforeDatasetDraw'
  }
};
var getBoxSize = function getBoxSize(labelOpts, fontSize) {
  var _labelOpts$boxHeight = labelOpts.boxHeight,
    boxHeight = _labelOpts$boxHeight === void 0 ? fontSize : _labelOpts$boxHeight,
    _labelOpts$boxWidth = labelOpts.boxWidth,
    boxWidth = _labelOpts$boxWidth === void 0 ? fontSize : _labelOpts$boxWidth;
  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
  }
  return {
    boxWidth: boxWidth,
    boxHeight: boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
};
var itemsEqual = function itemsEqual(a, b) {
  return a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;
};
var Legend = /*#__PURE__*/function (_Element6) {
  _inherits(Legend, _Element6);
  var _super16 = _createSuper(Legend);
  function Legend(config) {
    var _this27;
    _classCallCheck(this, Legend);
    _this27 = _super16.call(this);
    _this27._added = false;
    _this27.legendHitBoxes = [];
    _this27._hoveredItem = null;
    _this27.doughnutMode = false;
    _this27.chart = config.chart;
    _this27.options = config.options;
    _this27.ctx = config.ctx;
    _this27.legendItems = undefined;
    _this27.columnSizes = undefined;
    _this27.lineWidths = undefined;
    _this27.maxHeight = undefined;
    _this27.maxWidth = undefined;
    _this27.top = undefined;
    _this27.bottom = undefined;
    _this27.left = undefined;
    _this27.right = undefined;
    _this27.height = undefined;
    _this27.width = undefined;
    _this27._margins = undefined;
    _this27.position = undefined;
    _this27.weight = undefined;
    _this27.fullSize = undefined;
    return _this27;
  }
  _createClass(Legend, [{
    key: "update",
    value: function update(maxWidth, maxHeight, margins) {
      this.maxWidth = maxWidth;
      this.maxHeight = maxHeight;
      this._margins = margins;
      this.setDimensions();
      this.buildLabels();
      this.fit();
    }
  }, {
    key: "setDimensions",
    value: function setDimensions() {
      if (this.isHorizontal()) {
        this.width = this.maxWidth;
        this.left = this._margins.left;
        this.right = this.width;
      } else {
        this.height = this.maxHeight;
        this.top = this._margins.top;
        this.bottom = this.height;
      }
    }
  }, {
    key: "buildLabels",
    value: function buildLabels() {
      var _this28 = this;
      var labelOpts = this.options.labels || {};
      var legendItems = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(labelOpts.generateLabels, [this.chart], this) || [];
      if (labelOpts.filter) {
        legendItems = legendItems.filter(function (item) {
          return labelOpts.filter(item, _this28.chart.data);
        });
      }
      if (labelOpts.sort) {
        legendItems = legendItems.sort(function (a, b) {
          return labelOpts.sort(a, b, _this28.chart.data);
        });
      }
      if (this.options.reverse) {
        legendItems.reverse();
      }
      this.legendItems = legendItems;
    }
  }, {
    key: "fit",
    value: function fit() {
      var options = this.options,
        ctx = this.ctx;
      if (!options.display) {
        this.width = this.height = 0;
        return;
      }
      var labelOpts = options.labels;
      var labelFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(labelOpts.font);
      var fontSize = labelFont.size;
      var titleHeight = this._computeTitleHeight();
      var _getBoxSize = getBoxSize(labelOpts, fontSize),
        boxWidth = _getBoxSize.boxWidth,
        itemHeight = _getBoxSize.itemHeight;
      var width, height;
      ctx.font = labelFont.string;
      if (this.isHorizontal()) {
        width = this.maxWidth;
        height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
      } else {
        height = this.maxHeight;
        width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
      }
      this.width = Math.min(width, options.maxWidth || this.maxWidth);
      this.height = Math.min(height, options.maxHeight || this.maxHeight);
    }
  }, {
    key: "_fitRows",
    value: function _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
      var ctx = this.ctx,
        maxWidth = this.maxWidth,
        padding = this.options.labels.padding;
      var hitboxes = this.legendHitBoxes = [];
      var lineWidths = this.lineWidths = [0];
      var lineHeight = itemHeight + padding;
      var totalHeight = titleHeight;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      var row = -1;
      var top = -lineHeight;
      this.legendItems.forEach(function (legendItem, i) {
        var itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
        if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
          totalHeight += lineHeight;
          lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
          top += lineHeight;
          row++;
        }
        hitboxes[i] = {
          left: 0,
          top: top,
          row: row,
          width: itemWidth,
          height: itemHeight
        };
        lineWidths[lineWidths.length - 1] += itemWidth + padding;
      });
      return totalHeight;
    }
  }, {
    key: "_fitCols",
    value: function _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
      var ctx = this.ctx,
        maxHeight = this.maxHeight,
        padding = this.options.labels.padding;
      var hitboxes = this.legendHitBoxes = [];
      var columnSizes = this.columnSizes = [];
      var heightLimit = maxHeight - titleHeight;
      var totalWidth = padding;
      var currentColWidth = 0;
      var currentColHeight = 0;
      var left = 0;
      var col = 0;
      this.legendItems.forEach(function (legendItem, i) {
        var _calculateItemSize = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight),
          itemWidth = _calculateItemSize.itemWidth,
          itemHeight = _calculateItemSize.itemHeight;
        if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
          totalWidth += currentColWidth + padding;
          columnSizes.push({
            width: currentColWidth,
            height: currentColHeight
          });
          left += currentColWidth + padding;
          col++;
          currentColWidth = currentColHeight = 0;
        }
        hitboxes[i] = {
          left: left,
          top: currentColHeight,
          col: col,
          width: itemWidth,
          height: itemHeight
        };
        currentColWidth = Math.max(currentColWidth, itemWidth);
        currentColHeight += itemHeight + padding;
      });
      totalWidth += currentColWidth;
      columnSizes.push({
        width: currentColWidth,
        height: currentColHeight
      });
      return totalWidth;
    }
  }, {
    key: "adjustHitBoxes",
    value: function adjustHitBoxes() {
      if (!this.options.display) {
        return;
      }
      var titleHeight = this._computeTitleHeight();
      var hitboxes = this.legendHitBoxes,
        _this$options15 = this.options,
        align = _this$options15.align,
        padding = _this$options15.labels.padding,
        rtl = _this$options15.rtl;
      var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(rtl, this.left, this.width);
      if (this.isHorizontal()) {
        var row = 0;
        var left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - this.lineWidths[row]);
        var _iterator23 = _createForOfIteratorHelper(hitboxes),
          _step23;
        try {
          for (_iterator23.s(); !(_step23 = _iterator23.n()).done;) {
            var hitbox = _step23.value;
            if (row !== hitbox.row) {
              row = hitbox.row;
              left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - this.lineWidths[row]);
            }
            hitbox.top += this.top + titleHeight + padding;
            hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
            left += hitbox.width + padding;
          }
        } catch (err) {
          _iterator23.e(err);
        } finally {
          _iterator23.f();
        }
      } else {
        var col = 0;
        var top = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
        var _iterator24 = _createForOfIteratorHelper(hitboxes),
          _step24;
        try {
          for (_iterator24.s(); !(_step24 = _iterator24.n()).done;) {
            var _hitbox = _step24.value;
            if (_hitbox.col !== col) {
              col = _hitbox.col;
              top = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
            }
            _hitbox.top = top;
            _hitbox.left += this.left + padding;
            _hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(_hitbox.left), _hitbox.width);
            top += _hitbox.height + padding;
          }
        } catch (err) {
          _iterator24.e(err);
        } finally {
          _iterator24.f();
        }
      }
    }
  }, {
    key: "isHorizontal",
    value: function isHorizontal() {
      return this.options.position === 'top' || this.options.position === 'bottom';
    }
  }, {
    key: "draw",
    value: function draw() {
      if (this.options.display) {
        var ctx = this.ctx;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y)(ctx, this);
        this._draw();
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$)(ctx);
      }
    }
  }, {
    key: "_draw",
    value: function _draw() {
      var _this29 = this;
      var opts = this.options,
        columnSizes = this.columnSizes,
        lineWidths = this.lineWidths,
        ctx = this.ctx;
      var align = opts.align,
        labelOpts = opts.labels;
      var defaultColor = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.color;
      var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(opts.rtl, this.left, this.width);
      var labelFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(labelOpts.font);
      var padding = labelOpts.padding;
      var fontSize = labelFont.size;
      var halfFontSize = fontSize / 2;
      var cursor;
      this.drawTitle();
      ctx.textAlign = rtlHelper.textAlign('left');
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 0.5;
      ctx.font = labelFont.string;
      var _getBoxSize2 = getBoxSize(labelOpts, fontSize),
        boxWidth = _getBoxSize2.boxWidth,
        boxHeight = _getBoxSize2.boxHeight,
        itemHeight = _getBoxSize2.itemHeight;
      var drawLegendBox = function drawLegendBox(x, y, legendItem) {
        if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
          return;
        }
        ctx.save();
        var lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineWidth, 1);
        ctx.fillStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.fillStyle, defaultColor);
        ctx.lineCap = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineCap, 'butt');
        ctx.lineDashOffset = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineDashOffset, 0);
        ctx.lineJoin = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineJoin, 'miter');
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.strokeStyle, defaultColor);
        ctx.setLineDash((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(legendItem.lineDash, []));
        if (labelOpts.usePointStyle) {
          var drawOptions = {
            radius: boxHeight * Math.SQRT2 / 2,
            pointStyle: legendItem.pointStyle,
            rotation: legendItem.rotation,
            borderWidth: lineWidth
          };
          var centerX = rtlHelper.xPlus(x, boxWidth / 2);
          var centerY = y + halfFontSize;
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aD)(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
        } else {
          var yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
          var xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
          var borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(legendItem.borderRadius);
          ctx.beginPath();
          if (Object.values(borderRadius).some(function (v) {
            return v !== 0;
          })) {
            (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
              x: xBoxLeft,
              y: yBoxTop,
              w: boxWidth,
              h: boxHeight,
              radius: borderRadius
            });
          } else {
            ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
          }
          ctx.fill();
          if (lineWidth !== 0) {
            ctx.stroke();
          }
        }
        ctx.restore();
      };
      var fillText = function fillText(x, y, legendItem) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
          strikethrough: legendItem.hidden,
          textAlign: rtlHelper.textAlign(legendItem.textAlign)
        });
      };
      var isHorizontal = this.isHorizontal();
      var titleHeight = this._computeTitleHeight();
      if (isHorizontal) {
        cursor = {
          x: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.left + padding, this.right - lineWidths[0]),
          y: this.top + padding + titleHeight,
          line: 0
        };
      } else {
        cursor = {
          x: this.left + padding,
          y: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
          line: 0
        };
      }
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aA)(this.ctx, opts.textDirection);
      var lineHeight = itemHeight + padding;
      this.legendItems.forEach(function (legendItem, i) {
        ctx.strokeStyle = legendItem.fontColor;
        ctx.fillStyle = legendItem.fontColor;
        var textWidth = ctx.measureText(legendItem.text).width;
        var textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
        var width = boxWidth + halfFontSize + textWidth;
        var x = cursor.x;
        var y = cursor.y;
        rtlHelper.setWidth(_this29.width);
        if (isHorizontal) {
          if (i > 0 && x + width + padding > _this29.right) {
            y = cursor.y += lineHeight;
            cursor.line++;
            x = cursor.x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, _this29.left + padding, _this29.right - lineWidths[cursor.line]);
          }
        } else if (i > 0 && y + lineHeight > _this29.bottom) {
          x = cursor.x = x + columnSizes[cursor.line].width + padding;
          cursor.line++;
          y = cursor.y = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, _this29.top + titleHeight + padding, _this29.bottom - columnSizes[cursor.line].height);
        }
        var realX = rtlHelper.x(x);
        drawLegendBox(realX, y, legendItem);
        x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aB)(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : _this29.right, opts.rtl);
        fillText(rtlHelper.x(x), y, legendItem);
        if (isHorizontal) {
          cursor.x += width + padding;
        } else if (typeof legendItem.text !== 'string') {
          var fontLineHeight = labelFont.lineHeight;
          cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
        } else {
          cursor.y += lineHeight;
        }
      });
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aC)(this.ctx, opts.textDirection);
    }
  }, {
    key: "drawTitle",
    value: function drawTitle() {
      var opts = this.options;
      var titleOpts = opts.title;
      var titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(titleOpts.font);
      var titlePadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(titleOpts.padding);
      if (!titleOpts.display) {
        return;
      }
      var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(opts.rtl, this.left, this.width);
      var ctx = this.ctx;
      var position = titleOpts.position;
      var halfFontSize = titleFont.size / 2;
      var topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
      var y;
      var left = this.left;
      var maxWidth = this.width;
      if (this.isHorizontal()) {
        maxWidth = Math.max.apply(Math, _toConsumableArray(this.lineWidths));
        y = this.top + topPaddingPlusHalfFontSize;
        left = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(opts.align, left, this.right - maxWidth);
      } else {
        var maxHeight = this.columnSizes.reduce(function (acc, size) {
          return Math.max(acc, size.height);
        }, 0);
        y = topPaddingPlusHalfFontSize + (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
      }
      var x = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(position, left, left + maxWidth);
      ctx.textAlign = rtlHelper.textAlign((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(position));
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = titleOpts.color;
      ctx.fillStyle = titleOpts.color;
      ctx.font = titleFont.string;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, titleOpts.text, x, y, titleFont);
    }
  }, {
    key: "_computeTitleHeight",
    value: function _computeTitleHeight() {
      var titleOpts = this.options.title;
      var titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(titleOpts.font);
      var titlePadding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(titleOpts.padding);
      return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
    }
  }, {
    key: "_getLegendItemAt",
    value: function _getLegendItemAt(x, y) {
      var i, hitBox, lh;
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, this.left, this.right) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, this.top, this.bottom)) {
        lh = this.legendHitBoxes;
        for (i = 0; i < lh.length; ++i) {
          hitBox = lh[i];
          if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(x, hitBox.left, hitBox.left + hitBox.width) && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj)(y, hitBox.top, hitBox.top + hitBox.height)) {
            return this.legendItems[i];
          }
        }
      }
      return null;
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(e) {
      var opts = this.options;
      if (!isListened(e.type, opts)) {
        return;
      }
      var hoveredItem = this._getLegendItemAt(e.x, e.y);
      if (e.type === 'mousemove' || e.type === 'mouseout') {
        var previous = this._hoveredItem;
        var sameItem = itemsEqual(previous, hoveredItem);
        if (previous && !sameItem) {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onLeave, [e, previous, this], this);
        }
        this._hoveredItem = hoveredItem;
        if (hoveredItem && !sameItem) {
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onHover, [e, hoveredItem, this], this);
        }
      } else if (hoveredItem) {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(opts.onClick, [e, hoveredItem, this], this);
      }
    }
  }]);
  return Legend;
}(Element);
function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
  var itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
  var itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
  return {
    itemWidth: itemWidth,
    itemHeight: itemHeight
  };
}
function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
  var legendItemText = legendItem.text;
  if (legendItemText && typeof legendItemText !== 'string') {
    legendItemText = legendItemText.reduce(function (a, b) {
      return a.length > b.length ? a : b;
    });
  }
  return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
}
function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
  var itemHeight = _itemHeight;
  if (typeof legendItem.text !== 'string') {
    itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
  }
  return itemHeight;
}
function calculateLegendItemHeight(legendItem, fontLineHeight) {
  var labelHeight = legendItem.text ? legendItem.text.length : 0;
  return fontLineHeight * labelHeight;
}
function isListened(type, opts) {
  if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === 'click' || type === 'mouseup')) {
    return true;
  }
  return false;
}
var plugin_legend = {
  id: 'legend',
  _element: Legend,
  start: function start(chart, _args, options) {
    var legend = chart.legend = new Legend({
      ctx: chart.ctx,
      options: options,
      chart: chart
    });
    layouts.configure(chart, legend, options);
    layouts.addBox(chart, legend);
  },
  stop: function stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },
  beforeUpdate: function beforeUpdate(chart, _args, options) {
    var legend = chart.legend;
    layouts.configure(chart, legend, options);
    legend.options = options;
  },
  afterUpdate: function afterUpdate(chart) {
    var legend = chart.legend;
    legend.buildLabels();
    legend.adjustHitBoxes();
  },
  afterEvent: function afterEvent(chart, args) {
    if (!args.replay) {
      chart.legend.handleEvent(args.event);
    }
  },
  defaults: {
    display: true,
    position: 'top',
    align: 'center',
    fullSize: true,
    reverse: false,
    weight: 1000,
    onClick: function onClick(e, legendItem, legend) {
      var index = legendItem.datasetIndex;
      var ci = legend.chart;
      if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
      } else {
        ci.show(index);
        legendItem.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: function color(ctx) {
        return ctx.chart.options.color;
      },
      boxWidth: 40,
      padding: 10,
      generateLabels: function generateLabels(chart) {
        var datasets = chart.data.datasets;
        var _chart$legend$options = chart.legend.options.labels,
          usePointStyle = _chart$legend$options.usePointStyle,
          pointStyle = _chart$legend$options.pointStyle,
          textAlign = _chart$legend$options.textAlign,
          color = _chart$legend$options.color,
          useBorderRadius = _chart$legend$options.useBorderRadius,
          borderRadius = _chart$legend$options.borderRadius;
        return chart._getSortedDatasetMetas().map(function (meta) {
          var style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
          var borderWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(style.borderWidth);
          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: pointStyle || style.pointStyle,
            rotation: style.rotation,
            textAlign: textAlign || style.textAlign,
            borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
            datasetIndex: meta.index
          };
        }, this);
      }
    },
    title: {
      color: function color(ctx) {
        return ctx.chart.options.color;
      },
      display: false,
      position: 'center',
      text: ''
    }
  },
  descriptors: {
    _scriptable: function _scriptable(name) {
      return !name.startsWith('on');
    },
    labels: {
      _scriptable: function _scriptable(name) {
        return !['generateLabels', 'filter', 'sort'].includes(name);
      }
    }
  }
};
var Title = /*#__PURE__*/function (_Element7) {
  _inherits(Title, _Element7);
  var _super17 = _createSuper(Title);
  function Title(config) {
    var _this30;
    _classCallCheck(this, Title);
    _this30 = _super17.call(this);
    _this30.chart = config.chart;
    _this30.options = config.options;
    _this30.ctx = config.ctx;
    _this30._padding = undefined;
    _this30.top = undefined;
    _this30.bottom = undefined;
    _this30.left = undefined;
    _this30.right = undefined;
    _this30.width = undefined;
    _this30.height = undefined;
    _this30.position = undefined;
    _this30.weight = undefined;
    _this30.fullSize = undefined;
    return _this30;
  }
  _createClass(Title, [{
    key: "update",
    value: function update(maxWidth, maxHeight) {
      var opts = this.options;
      this.left = 0;
      this.top = 0;
      if (!opts.display) {
        this.width = this.height = this.right = this.bottom = 0;
        return;
      }
      this.width = this.right = maxWidth;
      this.height = this.bottom = maxHeight;
      var lineCount = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(opts.text) ? opts.text.length : 1;
      this._padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(opts.padding);
      var textSize = lineCount * (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font).lineHeight + this._padding.height;
      if (this.isHorizontal()) {
        this.height = textSize;
      } else {
        this.width = textSize;
      }
    }
  }, {
    key: "isHorizontal",
    value: function isHorizontal() {
      var pos = this.options.position;
      return pos === 'top' || pos === 'bottom';
    }
  }, {
    key: "_drawArgs",
    value: function _drawArgs(offset) {
      var top = this.top,
        left = this.left,
        bottom = this.bottom,
        right = this.right,
        options = this.options;
      var align = options.align;
      var rotation = 0;
      var maxWidth, titleX, titleY;
      if (this.isHorizontal()) {
        titleX = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, left, right);
        titleY = top + offset;
        maxWidth = right - left;
      } else {
        if (options.position === 'left') {
          titleX = left + offset;
          titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, bottom, top);
          rotation = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P * -0.5;
        } else {
          titleX = right - offset;
          titleY = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2)(align, top, bottom);
          rotation = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P * 0.5;
        }
        maxWidth = bottom - top;
      }
      return {
        titleX: titleX,
        titleY: titleY,
        maxWidth: maxWidth,
        rotation: rotation
      };
    }
  }, {
    key: "draw",
    value: function draw() {
      var ctx = this.ctx;
      var opts = this.options;
      if (!opts.display) {
        return;
      }
      var fontOpts = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
      var lineHeight = fontOpts.lineHeight;
      var offset = lineHeight / 2 + this._padding.top;
      var _this$_drawArgs = this._drawArgs(offset),
        titleX = _this$_drawArgs.titleX,
        titleY = _this$_drawArgs.titleY,
        maxWidth = _this$_drawArgs.maxWidth,
        rotation = _this$_drawArgs.rotation;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, opts.text, 0, 0, fontOpts, {
        color: opts.color,
        maxWidth: maxWidth,
        rotation: rotation,
        textAlign: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1)(opts.align),
        textBaseline: 'middle',
        translation: [titleX, titleY]
      });
    }
  }]);
  return Title;
}(Element);
function createTitle(chart, titleOpts) {
  var title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart: chart
  });
  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}
var plugin_title = {
  id: 'title',
  _element: Title,
  start: function start(chart, _args, options) {
    createTitle(chart, options);
  },
  stop: function stop(chart) {
    var titleBlock = chart.titleBlock;
    layouts.removeBox(chart, titleBlock);
    delete chart.titleBlock;
  },
  beforeUpdate: function beforeUpdate(chart, _args, options) {
    var title = chart.titleBlock;
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: 'center',
    display: false,
    font: {
      weight: 'bold'
    },
    fullSize: true,
    padding: 10,
    position: 'top',
    text: '',
    weight: 2000
  },
  defaultRoutes: {
    color: 'color'
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
var map = new WeakMap();
var plugin_subtitle = {
  id: 'subtitle',
  start: function start(chart, _args, options) {
    var title = new Title({
      ctx: chart.ctx,
      options: options,
      chart: chart
    });
    layouts.configure(chart, title, options);
    layouts.addBox(chart, title);
    map.set(chart, title);
  },
  stop: function stop(chart) {
    layouts.removeBox(chart, map.get(chart));
    map["delete"](chart);
  },
  beforeUpdate: function beforeUpdate(chart, _args, options) {
    var title = map.get(chart);
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: 'center',
    display: false,
    font: {
      weight: 'normal'
    },
    fullSize: true,
    padding: 0,
    position: 'top',
    text: '',
    weight: 1500
  },
  defaultRoutes: {
    color: 'color'
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
var positioners = {
  average: function average(items) {
    if (!items.length) {
      return false;
    }
    var i, len;
    var x = 0;
    var y = 0;
    var count = 0;
    for (i = 0, len = items.length; i < len; ++i) {
      var el = items[i].element;
      if (el && el.hasValue()) {
        var pos = el.tooltipPosition();
        x += pos.x;
        y += pos.y;
        ++count;
      }
    }
    return {
      x: x / count,
      y: y / count
    };
  },
  nearest: function nearest(items, eventPosition) {
    if (!items.length) {
      return false;
    }
    var x = eventPosition.x;
    var y = eventPosition.y;
    var minDistance = Number.POSITIVE_INFINITY;
    var i, len, nearestElement;
    for (i = 0, len = items.length; i < len; ++i) {
      var el = items[i].element;
      if (el && el.hasValue()) {
        var center = el.getCenterPoint();
        var d = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aE)(eventPosition, center);
        if (d < minDistance) {
          minDistance = d;
          nearestElement = el;
        }
      }
    }
    if (nearestElement) {
      var tp = nearestElement.tooltipPosition();
      x = tp.x;
      y = tp.y;
    }
    return {
      x: x,
      y: y
    };
  }
};
function pushOrConcat(base, toPush) {
  if (toPush) {
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(toPush)) {
      Array.prototype.push.apply(base, toPush);
    } else {
      base.push(toPush);
    }
  }
  return base;
}
function splitNewlines(str) {
  if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
    return str.split('\n');
  }
  return str;
}
function createTooltipItem(chart, item) {
  var element = item.element,
    datasetIndex = item.datasetIndex,
    index = item.index;
  var controller = chart.getDatasetMeta(datasetIndex).controller;
  var _controller$getLabelA = controller.getLabelAndValue(index),
    label = _controller$getLabelA.label,
    value = _controller$getLabelA.value;
  return {
    chart: chart,
    label: label,
    parsed: controller.getParsed(index),
    raw: chart.data.datasets[datasetIndex].data[index],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index,
    datasetIndex: datasetIndex,
    element: element
  };
}
function getTooltipSize(tooltip, options) {
  var ctx = tooltip.chart.ctx;
  var body = tooltip.body,
    footer = tooltip.footer,
    title = tooltip.title;
  var boxWidth = options.boxWidth,
    boxHeight = options.boxHeight;
  var bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
  var titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.titleFont);
  var footerFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.footerFont);
  var titleLineCount = title.length;
  var footerLineCount = footer.length;
  var bodyLineItemCount = body.length;
  var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
  var height = padding.height;
  var width = 0;
  var combinedBodyLength = body.reduce(function (count, bodyItem) {
    return count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length;
  }, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
  }
  if (combinedBodyLength) {
    var bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
  }
  if (footerLineCount) {
    height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
  }
  var widthPadding = 0;
  var maxLineWidth = function maxLineWidth(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  };
  ctx.save();
  ctx.font = titleFont.string;
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.title, maxLineWidth);
  ctx.font = bodyFont.string;
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
  widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(body, function (bodyItem) {
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.before, maxLineWidth);
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.lines, maxLineWidth);
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.after, maxLineWidth);
  });
  widthPadding = 0;
  ctx.font = footerFont.string;
  (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltip.footer, maxLineWidth);
  ctx.restore();
  width += padding.width;
  return {
    width: width,
    height: height
  };
}
function determineYAlign(chart, size) {
  var y = size.y,
    height = size.height;
  if (y < height / 2) {
    return 'top';
  } else if (y > chart.height - height / 2) {
    return 'bottom';
  }
  return 'center';
}
function doesNotFitWithAlign(xAlign, chart, options, size) {
  var x = size.x,
    width = size.width;
  var caret = options.caretSize + options.caretPadding;
  if (xAlign === 'left' && x + width + caret > chart.width) {
    return true;
  }
  if (xAlign === 'right' && x - width - caret < 0) {
    return true;
  }
}
function determineXAlign(chart, options, size, yAlign) {
  var x = size.x,
    width = size.width;
  var chartWidth = chart.width,
    _chart$chartArea = chart.chartArea,
    left = _chart$chartArea.left,
    right = _chart$chartArea.right;
  var xAlign = 'center';
  if (yAlign === 'center') {
    xAlign = x <= (left + right) / 2 ? 'left' : 'right';
  } else if (x <= width / 2) {
    xAlign = 'left';
  } else if (x >= chartWidth - width / 2) {
    xAlign = 'right';
  }
  if (doesNotFitWithAlign(xAlign, chart, options, size)) {
    xAlign = 'center';
  }
  return xAlign;
}
function determineAlignment(chart, options, size) {
  var yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);
  return {
    xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
    yAlign: yAlign
  };
}
function alignX(size, xAlign) {
  var x = size.x,
    width = size.width;
  if (xAlign === 'right') {
    x -= width;
  } else if (xAlign === 'center') {
    x -= width / 2;
  }
  return x;
}
function alignY(size, yAlign, paddingAndSize) {
  var y = size.y,
    height = size.height;
  if (yAlign === 'top') {
    y += paddingAndSize;
  } else if (yAlign === 'bottom') {
    y -= height + paddingAndSize;
  } else {
    y -= height / 2;
  }
  return y;
}
function getBackgroundPoint(options, size, alignment, chart) {
  var caretSize = options.caretSize,
    caretPadding = options.caretPadding,
    cornerRadius = options.cornerRadius;
  var xAlign = alignment.xAlign,
    yAlign = alignment.yAlign;
  var paddingAndSize = caretSize + caretPadding;
  var _toTRBLCorners = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(cornerRadius),
    topLeft = _toTRBLCorners.topLeft,
    topRight = _toTRBLCorners.topRight,
    bottomLeft = _toTRBLCorners.bottomLeft,
    bottomRight = _toTRBLCorners.bottomRight;
  var x = alignX(size, xAlign);
  var y = alignY(size, yAlign, paddingAndSize);
  if (yAlign === 'center') {
    if (xAlign === 'left') {
      x += paddingAndSize;
    } else if (xAlign === 'right') {
      x -= paddingAndSize;
    }
  } else if (xAlign === 'left') {
    x -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === 'right') {
    x += Math.max(topRight, bottomRight) + caretSize;
  }
  return {
    x: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(x, 0, chart.width - size.width),
    y: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(y, 0, chart.height - size.height)
  };
}
function getAlignedX(tooltip, align, options) {
  var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
  return align === 'center' ? tooltip.x + tooltip.width / 2 : align === 'right' ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
function getBeforeAfterBodyLines(callback) {
  return pushOrConcat([], splitNewlines(callback));
}
function createTooltipContext(parent, tooltip, tooltipItems) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    tooltip: tooltip,
    tooltipItems: tooltipItems,
    type: 'tooltip'
  });
}
function overrideCallbacks(callbacks, context) {
  var override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}
var defaultCallbacks = {
  beforeTitle: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  title: function title(tooltipItems) {
    if (tooltipItems.length > 0) {
      var item = tooltipItems[0];
      var labels = item.chart.data.labels;
      var labelCount = labels ? labels.length : 0;
      if (this && this.options && this.options.mode === 'dataset') {
        return item.dataset.label || '';
      } else if (item.label) {
        return item.label;
      } else if (labelCount > 0 && item.dataIndex < labelCount) {
        return labels[item.dataIndex];
      }
    }
    return '';
  },
  afterTitle: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  beforeBody: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  beforeLabel: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  label: function label(tooltipItem) {
    if (this && this.options && this.options.mode === 'dataset') {
      return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
    }
    var label = tooltipItem.dataset.label || '';
    if (label) {
      label += ': ';
    }
    var value = tooltipItem.formattedValue;
    if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
      label += value;
    }
    return label;
  },
  labelColor: function labelColor(tooltipItem) {
    var meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    var options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      borderColor: options.borderColor,
      backgroundColor: options.backgroundColor,
      borderWidth: options.borderWidth,
      borderDash: options.borderDash,
      borderDashOffset: options.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor: function labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle: function labelPointStyle(tooltipItem) {
    var meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    var options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      pointStyle: options.pointStyle,
      rotation: options.rotation
    };
  },
  afterLabel: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  afterBody: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  beforeFooter: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  footer: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF,
  afterFooter: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF
};
function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
  var result = callbacks[name].call(ctx, arg);
  if (typeof result === 'undefined') {
    return defaultCallbacks[name].call(ctx, arg);
  }
  return result;
}
var Tooltip = /*#__PURE__*/function (_Element8) {
  _inherits(Tooltip, _Element8);
  var _super18 = _createSuper(Tooltip);
  function Tooltip(config) {
    var _this31;
    _classCallCheck(this, Tooltip);
    _this31 = _super18.call(this);
    _this31.opacity = 0;
    _this31._active = [];
    _this31._eventPosition = undefined;
    _this31._size = undefined;
    _this31._cachedAnimations = undefined;
    _this31._tooltipItems = [];
    _this31.$animations = undefined;
    _this31.$context = undefined;
    _this31.chart = config.chart;
    _this31.options = config.options;
    _this31.dataPoints = undefined;
    _this31.title = undefined;
    _this31.beforeBody = undefined;
    _this31.body = undefined;
    _this31.afterBody = undefined;
    _this31.footer = undefined;
    _this31.xAlign = undefined;
    _this31.yAlign = undefined;
    _this31.x = undefined;
    _this31.y = undefined;
    _this31.height = undefined;
    _this31.width = undefined;
    _this31.caretX = undefined;
    _this31.caretY = undefined;
    _this31.labelColors = undefined;
    _this31.labelPointStyles = undefined;
    _this31.labelTextColors = undefined;
    return _this31;
  }
  _createClass(Tooltip, [{
    key: "initialize",
    value: function initialize(options) {
      this.options = options;
      this._cachedAnimations = undefined;
      this.$context = undefined;
    }
  }, {
    key: "_resolveAnimations",
    value: function _resolveAnimations() {
      var cached = this._cachedAnimations;
      if (cached) {
        return cached;
      }
      var chart = this.chart;
      var options = this.options.setContext(this.getContext());
      var opts = options.enabled && chart.options.animation && options.animations;
      var animations = new Animations(this.chart, opts);
      if (opts._cacheable) {
        this._cachedAnimations = Object.freeze(animations);
      }
      return animations;
    }
  }, {
    key: "getContext",
    value: function getContext() {
      return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
    }
  }, {
    key: "getTitle",
    value: function getTitle(context, options) {
      var callbacks = options.callbacks;
      var beforeTitle = invokeCallbackWithFallback(callbacks, 'beforeTitle', this, context);
      var title = invokeCallbackWithFallback(callbacks, 'title', this, context);
      var afterTitle = invokeCallbackWithFallback(callbacks, 'afterTitle', this, context);
      var lines = [];
      lines = pushOrConcat(lines, splitNewlines(beforeTitle));
      lines = pushOrConcat(lines, splitNewlines(title));
      lines = pushOrConcat(lines, splitNewlines(afterTitle));
      return lines;
    }
  }, {
    key: "getBeforeBody",
    value: function getBeforeBody(tooltipItems, options) {
      return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'beforeBody', this, tooltipItems));
    }
  }, {
    key: "getBody",
    value: function getBody(tooltipItems, options) {
      var _this32 = this;
      var callbacks = options.callbacks;
      var bodyItems = [];
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltipItems, function (context) {
        var bodyItem = {
          before: [],
          lines: [],
          after: []
        };
        var scoped = overrideCallbacks(callbacks, context);
        pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, 'beforeLabel', _this32, context)));
        pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, 'label', _this32, context));
        pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, 'afterLabel', _this32, context)));
        bodyItems.push(bodyItem);
      });
      return bodyItems;
    }
  }, {
    key: "getAfterBody",
    value: function getAfterBody(tooltipItems, options) {
      return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'afterBody', this, tooltipItems));
    }
  }, {
    key: "getFooter",
    value: function getFooter(tooltipItems, options) {
      var callbacks = options.callbacks;
      var beforeFooter = invokeCallbackWithFallback(callbacks, 'beforeFooter', this, tooltipItems);
      var footer = invokeCallbackWithFallback(callbacks, 'footer', this, tooltipItems);
      var afterFooter = invokeCallbackWithFallback(callbacks, 'afterFooter', this, tooltipItems);
      var lines = [];
      lines = pushOrConcat(lines, splitNewlines(beforeFooter));
      lines = pushOrConcat(lines, splitNewlines(footer));
      lines = pushOrConcat(lines, splitNewlines(afterFooter));
      return lines;
    }
  }, {
    key: "_createItems",
    value: function _createItems(options) {
      var _this33 = this;
      var active = this._active;
      var data = this.chart.data;
      var labelColors = [];
      var labelPointStyles = [];
      var labelTextColors = [];
      var tooltipItems = [];
      var i, len;
      for (i = 0, len = active.length; i < len; ++i) {
        tooltipItems.push(createTooltipItem(this.chart, active[i]));
      }
      if (options.filter) {
        tooltipItems = tooltipItems.filter(function (element, index, array) {
          return options.filter(element, index, array, data);
        });
      }
      if (options.itemSort) {
        tooltipItems = tooltipItems.sort(function (a, b) {
          return options.itemSort(a, b, data);
        });
      }
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(tooltipItems, function (context) {
        var scoped = overrideCallbacks(options.callbacks, context);
        labelColors.push(invokeCallbackWithFallback(scoped, 'labelColor', _this33, context));
        labelPointStyles.push(invokeCallbackWithFallback(scoped, 'labelPointStyle', _this33, context));
        labelTextColors.push(invokeCallbackWithFallback(scoped, 'labelTextColor', _this33, context));
      });
      this.labelColors = labelColors;
      this.labelPointStyles = labelPointStyles;
      this.labelTextColors = labelTextColors;
      this.dataPoints = tooltipItems;
      return tooltipItems;
    }
  }, {
    key: "update",
    value: function update(changed, replay) {
      var options = this.options.setContext(this.getContext());
      var active = this._active;
      var properties;
      var tooltipItems = [];
      if (!active.length) {
        if (this.opacity !== 0) {
          properties = {
            opacity: 0
          };
        }
      } else {
        var position = positioners[options.position].call(this, active, this._eventPosition);
        tooltipItems = this._createItems(options);
        this.title = this.getTitle(tooltipItems, options);
        this.beforeBody = this.getBeforeBody(tooltipItems, options);
        this.body = this.getBody(tooltipItems, options);
        this.afterBody = this.getAfterBody(tooltipItems, options);
        this.footer = this.getFooter(tooltipItems, options);
        var size = this._size = getTooltipSize(this, options);
        var positionAndSize = Object.assign({}, position, size);
        var alignment = determineAlignment(this.chart, options, positionAndSize);
        var backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
        this.xAlign = alignment.xAlign;
        this.yAlign = alignment.yAlign;
        properties = {
          opacity: 1,
          x: backgroundPoint.x,
          y: backgroundPoint.y,
          width: size.width,
          height: size.height,
          caretX: position.x,
          caretY: position.y
        };
      }
      this._tooltipItems = tooltipItems;
      this.$context = undefined;
      if (properties) {
        this._resolveAnimations().update(this, properties);
      }
      if (changed && options.external) {
        options.external.call(this, {
          chart: this.chart,
          tooltip: this,
          replay: replay
        });
      }
    }
  }, {
    key: "drawCaret",
    value: function drawCaret(tooltipPoint, ctx, size, options) {
      var caretPosition = this.getCaretPosition(tooltipPoint, size, options);
      ctx.lineTo(caretPosition.x1, caretPosition.y1);
      ctx.lineTo(caretPosition.x2, caretPosition.y2);
      ctx.lineTo(caretPosition.x3, caretPosition.y3);
    }
  }, {
    key: "getCaretPosition",
    value: function getCaretPosition(tooltipPoint, size, options) {
      var xAlign = this.xAlign,
        yAlign = this.yAlign;
      var caretSize = options.caretSize,
        cornerRadius = options.cornerRadius;
      var _toTRBLCorners2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(cornerRadius),
        topLeft = _toTRBLCorners2.topLeft,
        topRight = _toTRBLCorners2.topRight,
        bottomLeft = _toTRBLCorners2.bottomLeft,
        bottomRight = _toTRBLCorners2.bottomRight;
      var ptX = tooltipPoint.x,
        ptY = tooltipPoint.y;
      var width = size.width,
        height = size.height;
      var x1, x2, x3, y1, y2, y3;
      if (yAlign === 'center') {
        y2 = ptY + height / 2;
        if (xAlign === 'left') {
          x1 = ptX;
          x2 = x1 - caretSize;
          y1 = y2 + caretSize;
          y3 = y2 - caretSize;
        } else {
          x1 = ptX + width;
          x2 = x1 + caretSize;
          y1 = y2 - caretSize;
          y3 = y2 + caretSize;
        }
        x3 = x1;
      } else {
        if (xAlign === 'left') {
          x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
        } else if (xAlign === 'right') {
          x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
        } else {
          x2 = this.caretX;
        }
        if (yAlign === 'top') {
          y1 = ptY;
          y2 = y1 - caretSize;
          x1 = x2 - caretSize;
          x3 = x2 + caretSize;
        } else {
          y1 = ptY + height;
          y2 = y1 + caretSize;
          x1 = x2 + caretSize;
          x3 = x2 - caretSize;
        }
        y3 = y1;
      }
      return {
        x1: x1,
        x2: x2,
        x3: x3,
        y1: y1,
        y2: y2,
        y3: y3
      };
    }
  }, {
    key: "drawTitle",
    value: function drawTitle(pt, ctx, options) {
      var title = this.title;
      var length = title.length;
      var titleFont, titleSpacing, i;
      if (length) {
        var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
        pt.x = getAlignedX(this, options.titleAlign, options);
        ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
        ctx.textBaseline = 'middle';
        titleFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.titleFont);
        titleSpacing = options.titleSpacing;
        ctx.fillStyle = options.titleColor;
        ctx.font = titleFont.string;
        for (i = 0; i < length; ++i) {
          ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
          pt.y += titleFont.lineHeight + titleSpacing;
          if (i + 1 === length) {
            pt.y += options.titleMarginBottom - titleSpacing;
          }
        }
      }
    }
  }, {
    key: "_drawColorBox",
    value: function _drawColorBox(ctx, pt, i, rtlHelper, options) {
      var labelColor = this.labelColors[i];
      var labelPointStyle = this.labelPointStyles[i];
      var boxHeight = options.boxHeight,
        boxWidth = options.boxWidth;
      var bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
      var colorX = getAlignedX(this, 'left', options);
      var rtlColorX = rtlHelper.x(colorX);
      var yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
      var colorY = pt.y + yOffSet;
      if (options.usePointStyle) {
        var drawOptions = {
          radius: Math.min(boxWidth, boxHeight) / 2,
          pointStyle: labelPointStyle.pointStyle,
          rotation: labelPointStyle.rotation,
          borderWidth: 1
        };
        var centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
        var centerY = colorY + boxHeight / 2;
        ctx.strokeStyle = options.multiKeyBackground;
        ctx.fillStyle = options.multiKeyBackground;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, drawOptions, centerX, centerY);
        ctx.strokeStyle = labelColor.borderColor;
        ctx.fillStyle = labelColor.backgroundColor;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at)(ctx, drawOptions, centerX, centerY);
      } else {
        ctx.lineWidth = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i)(labelColor.borderWidth) ? Math.max.apply(Math, _toConsumableArray(Object.values(labelColor.borderWidth))) : labelColor.borderWidth || 1;
        ctx.strokeStyle = labelColor.borderColor;
        ctx.setLineDash(labelColor.borderDash || []);
        ctx.lineDashOffset = labelColor.borderDashOffset || 0;
        var outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
        var innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
        var borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(labelColor.borderRadius);
        if (Object.values(borderRadius).some(function (v) {
          return v !== 0;
        })) {
          ctx.beginPath();
          ctx.fillStyle = options.multiKeyBackground;
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
            x: outerX,
            y: colorY,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius
          });
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = labelColor.backgroundColor;
          ctx.beginPath();
          (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
            x: innerX,
            y: colorY + 1,
            w: boxWidth - 2,
            h: boxHeight - 2,
            radius: borderRadius
          });
          ctx.fill();
        } else {
          ctx.fillStyle = options.multiKeyBackground;
          ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
          ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
          ctx.fillStyle = labelColor.backgroundColor;
          ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
        }
      }
      ctx.fillStyle = this.labelTextColors[i];
    }
  }, {
    key: "drawBody",
    value: function drawBody(pt, ctx, options) {
      var body = this.body;
      var bodySpacing = options.bodySpacing,
        bodyAlign = options.bodyAlign,
        displayColors = options.displayColors,
        boxHeight = options.boxHeight,
        boxWidth = options.boxWidth,
        boxPadding = options.boxPadding;
      var bodyFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.bodyFont);
      var bodyLineHeight = bodyFont.lineHeight;
      var xLinePadding = 0;
      var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
      var fillLineOfText = function fillLineOfText(line) {
        ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
        pt.y += bodyLineHeight + bodySpacing;
      };
      var bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
      var bodyItem, textColor, lines, i, j, ilen, jlen;
      ctx.textAlign = bodyAlign;
      ctx.textBaseline = 'middle';
      ctx.font = bodyFont.string;
      pt.x = getAlignedX(this, bodyAlignForCalculation, options);
      ctx.fillStyle = options.bodyColor;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.beforeBody, fillLineOfText);
      xLinePadding = displayColors && bodyAlignForCalculation !== 'right' ? bodyAlign === 'center' ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
      for (i = 0, ilen = body.length; i < ilen; ++i) {
        bodyItem = body[i];
        textColor = this.labelTextColors[i];
        ctx.fillStyle = textColor;
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.before, fillLineOfText);
        lines = bodyItem.lines;
        if (displayColors && lines.length) {
          this._drawColorBox(ctx, pt, i, rtlHelper, options);
          bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
        }
        for (j = 0, jlen = lines.length; j < jlen; ++j) {
          fillLineOfText(lines[j]);
          bodyLineHeight = bodyFont.lineHeight;
        }
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(bodyItem.after, fillLineOfText);
      }
      xLinePadding = 0;
      bodyLineHeight = bodyFont.lineHeight;
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F)(this.afterBody, fillLineOfText);
      pt.y -= bodySpacing;
    }
  }, {
    key: "drawFooter",
    value: function drawFooter(pt, ctx, options) {
      var footer = this.footer;
      var length = footer.length;
      var footerFont, i;
      if (length) {
        var rtlHelper = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az)(options.rtl, this.x, this.width);
        pt.x = getAlignedX(this, options.footerAlign, options);
        pt.y += options.footerMarginTop;
        ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
        ctx.textBaseline = 'middle';
        footerFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(options.footerFont);
        ctx.fillStyle = options.footerColor;
        ctx.font = footerFont.string;
        for (i = 0; i < length; ++i) {
          ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
          pt.y += footerFont.lineHeight + options.footerSpacing;
        }
      }
    }
  }, {
    key: "drawBackground",
    value: function drawBackground(pt, ctx, tooltipSize, options) {
      var xAlign = this.xAlign,
        yAlign = this.yAlign;
      var x = pt.x,
        y = pt.y;
      var width = tooltipSize.width,
        height = tooltipSize.height;
      var _toTRBLCorners3 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(options.cornerRadius),
        topLeft = _toTRBLCorners3.topLeft,
        topRight = _toTRBLCorners3.topRight,
        bottomLeft = _toTRBLCorners3.bottomLeft,
        bottomRight = _toTRBLCorners3.bottomRight;
      ctx.fillStyle = options.backgroundColor;
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.beginPath();
      ctx.moveTo(x + topLeft, y);
      if (yAlign === 'top') {
        this.drawCaret(pt, ctx, tooltipSize, options);
      }
      ctx.lineTo(x + width - topRight, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
      if (yAlign === 'center' && xAlign === 'right') {
        this.drawCaret(pt, ctx, tooltipSize, options);
      }
      ctx.lineTo(x + width, y + height - bottomRight);
      ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
      if (yAlign === 'bottom') {
        this.drawCaret(pt, ctx, tooltipSize, options);
      }
      ctx.lineTo(x + bottomLeft, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
      if (yAlign === 'center' && xAlign === 'left') {
        this.drawCaret(pt, ctx, tooltipSize, options);
      }
      ctx.lineTo(x, y + topLeft);
      ctx.quadraticCurveTo(x, y, x + topLeft, y);
      ctx.closePath();
      ctx.fill();
      if (options.borderWidth > 0) {
        ctx.stroke();
      }
    }
  }, {
    key: "_updateAnimationTarget",
    value: function _updateAnimationTarget(options) {
      var chart = this.chart;
      var anims = this.$animations;
      var animX = anims && anims.x;
      var animY = anims && anims.y;
      if (animX || animY) {
        var position = positioners[options.position].call(this, this._active, this._eventPosition);
        if (!position) {
          return;
        }
        var size = this._size = getTooltipSize(this, options);
        var positionAndSize = Object.assign({}, position, this._size);
        var alignment = determineAlignment(chart, options, positionAndSize);
        var point = getBackgroundPoint(options, positionAndSize, alignment, chart);
        if (animX._to !== point.x || animY._to !== point.y) {
          this.xAlign = alignment.xAlign;
          this.yAlign = alignment.yAlign;
          this.width = size.width;
          this.height = size.height;
          this.caretX = position.x;
          this.caretY = position.y;
          this._resolveAnimations().update(this, point);
        }
      }
    }
  }, {
    key: "_willRender",
    value: function _willRender() {
      return !!this.opacity;
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      var options = this.options.setContext(this.getContext());
      var opacity = this.opacity;
      if (!opacity) {
        return;
      }
      this._updateAnimationTarget(options);
      var tooltipSize = {
        width: this.width,
        height: this.height
      };
      var pt = {
        x: this.x,
        y: this.y
      };
      opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
      var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(options.padding);
      var hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
      if (options.enabled && hasTooltipContent) {
        ctx.save();
        ctx.globalAlpha = opacity;
        this.drawBackground(pt, ctx, tooltipSize, options);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aA)(ctx, options.textDirection);
        pt.y += padding.top;
        this.drawTitle(pt, ctx, options);
        this.drawBody(pt, ctx, options);
        this.drawFooter(pt, ctx, options);
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aC)(ctx, options.textDirection);
        ctx.restore();
      }
    }
  }, {
    key: "getActiveElements",
    value: function getActiveElements() {
      return this._active || [];
    }
  }, {
    key: "setActiveElements",
    value: function setActiveElements(activeElements, eventPosition) {
      var _this34 = this;
      var lastActive = this._active;
      var active = activeElements.map(function (_ref11) {
        var datasetIndex = _ref11.datasetIndex,
          index = _ref11.index;
        var meta = _this34.chart.getDatasetMeta(datasetIndex);
        if (!meta) {
          throw new Error('Cannot find a dataset at index ' + datasetIndex);
        }
        return {
          datasetIndex: datasetIndex,
          element: meta.data[index],
          index: index
        };
      });
      var changed = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(lastActive, active);
      var positionChanged = this._positionChanged(active, eventPosition);
      if (changed || positionChanged) {
        this._active = active;
        this._eventPosition = eventPosition;
        this._ignoreReplayEvents = true;
        this.update(true);
      }
    }
  }, {
    key: "handleEvent",
    value: function handleEvent(e, replay) {
      var inChartArea = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      if (replay && this._ignoreReplayEvents) {
        return false;
      }
      this._ignoreReplayEvents = false;
      var options = this.options;
      var lastActive = this._active || [];
      var active = this._getActiveElements(e, lastActive, replay, inChartArea);
      var positionChanged = this._positionChanged(active, e);
      var changed = replay || !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah)(active, lastActive) || positionChanged;
      if (changed) {
        this._active = active;
        if (options.enabled || options.external) {
          this._eventPosition = {
            x: e.x,
            y: e.y
          };
          this.update(true, replay);
        }
      }
      return changed;
    }
  }, {
    key: "_getActiveElements",
    value: function _getActiveElements(e, lastActive, replay, inChartArea) {
      var options = this.options;
      if (e.type === 'mouseout') {
        return [];
      }
      if (!inChartArea) {
        return lastActive;
      }
      var active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);
      if (options.reverse) {
        active.reverse();
      }
      return active;
    }
  }, {
    key: "_positionChanged",
    value: function _positionChanged(active, e) {
      var caretX = this.caretX,
        caretY = this.caretY,
        options = this.options;
      var position = positioners[options.position].call(this, active, e);
      return position !== false && (caretX !== position.x || caretY !== position.y);
    }
  }]);
  return Tooltip;
}(Element);
_defineProperty(Tooltip, "positioners", positioners);
var plugin_tooltip = {
  id: 'tooltip',
  _element: Tooltip,
  positioners: positioners,
  afterInit: function afterInit(chart, _args, options) {
    if (options) {
      chart.tooltip = new Tooltip({
        chart: chart,
        options: options
      });
    }
  },
  beforeUpdate: function beforeUpdate(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  reset: function reset(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  afterDraw: function afterDraw(chart) {
    var tooltip = chart.tooltip;
    if (tooltip && tooltip._willRender()) {
      var args = {
        tooltip: tooltip
      };
      if (chart.notifyPlugins('beforeTooltipDraw', _objectSpread(_objectSpread({}, args), {}, {
        cancelable: true
      })) === false) {
        return;
      }
      tooltip.draw(chart.ctx);
      chart.notifyPlugins('afterTooltipDraw', args);
    }
  },
  afterEvent: function afterEvent(chart, args) {
    if (chart.tooltip) {
      var useFinalPosition = args.replay;
      if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
        args.changed = true;
      }
    }
  },
  defaults: {
    enabled: true,
    external: null,
    position: 'average',
    backgroundColor: 'rgba(0,0,0,0.8)',
    titleColor: '#fff',
    titleFont: {
      weight: 'bold'
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: 'left',
    bodyColor: '#fff',
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: 'left',
    footerColor: '#fff',
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: 'bold'
    },
    footerAlign: 'left',
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: function boxHeight(ctx, opts) {
      return opts.bodyFont.size;
    },
    boxWidth: function boxWidth(ctx, opts) {
      return opts.bodyFont.size;
    },
    multiKeyBackground: '#fff',
    displayColors: true,
    boxPadding: 0,
    borderColor: 'rgba(0,0,0,0)',
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: 'easeOutQuart'
    },
    animations: {
      numbers: {
        type: 'number',
        properties: ['x', 'y', 'width', 'height', 'caretX', 'caretY']
      },
      opacity: {
        easing: 'linear',
        duration: 200
      }
    },
    callbacks: defaultCallbacks
  },
  defaultRoutes: {
    bodyFont: 'font',
    footerFont: 'font',
    titleFont: 'font'
  },
  descriptors: {
    _scriptable: function _scriptable(name) {
      return name !== 'filter' && name !== 'itemSort' && name !== 'external';
    },
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: 'animation'
    }
  },
  additionalOptionScopes: ['interaction']
};
var plugins = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Colors: plugin_colors,
  Decimation: plugin_decimation,
  Filler: index,
  Legend: plugin_legend,
  SubTitle: plugin_subtitle,
  Title: plugin_title,
  Tooltip: plugin_tooltip
});
var addIfString = function addIfString(labels, raw, index, addedLabels) {
  if (typeof raw === 'string') {
    index = labels.push(raw) - 1;
    addedLabels.unshift({
      index: index,
      label: raw
    });
  } else if (isNaN(raw)) {
    index = null;
  }
  return index;
};
function findOrAddLabel(labels, raw, index, addedLabels) {
  var first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index, addedLabels);
  }
  var last = labels.lastIndexOf(raw);
  return first !== last ? index : first;
}
var validIndex = function validIndex(index, max) {
  return index === null ? null : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(Math.round(index), 0, max);
};
function _getLabelForValue(value) {
  var labels = this.getLabels();
  if (value >= 0 && value < labels.length) {
    return labels[value];
  }
  return value;
}
var CategoryScale = /*#__PURE__*/function (_Scale) {
  _inherits(CategoryScale, _Scale);
  var _super19 = _createSuper(CategoryScale);
  function CategoryScale(cfg) {
    var _this35;
    _classCallCheck(this, CategoryScale);
    _this35 = _super19.call(this, cfg);
    _this35._startValue = undefined;
    _this35._valueRange = 0;
    _this35._addedLabels = [];
    return _this35;
  }
  _createClass(CategoryScale, [{
    key: "init",
    value: function init(scaleOptions) {
      var added = this._addedLabels;
      if (added.length) {
        var labels = this.getLabels();
        var _iterator25 = _createForOfIteratorHelper(added),
          _step25;
        try {
          for (_iterator25.s(); !(_step25 = _iterator25.n()).done;) {
            var _step25$value = _step25.value,
              _index3 = _step25$value.index,
              label = _step25$value.label;
            if (labels[_index3] === label) {
              labels.splice(_index3, 1);
            }
          }
        } catch (err) {
          _iterator25.e(err);
        } finally {
          _iterator25.f();
        }
        this._addedLabels = [];
      }
      _get(_getPrototypeOf(CategoryScale.prototype), "init", this).call(this, scaleOptions);
    }
  }, {
    key: "parse",
    value: function parse(raw, index) {
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(raw)) {
        return null;
      }
      var labels = this.getLabels();
      index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(index, raw), this._addedLabels);
      return validIndex(index, labels.length - 1);
    }
  }, {
    key: "determineDataLimits",
    value: function determineDataLimits() {
      var _this$getUserBounds2 = this.getUserBounds(),
        minDefined = _this$getUserBounds2.minDefined,
        maxDefined = _this$getUserBounds2.maxDefined;
      var _this$getMinMax = this.getMinMax(true),
        min = _this$getMinMax.min,
        max = _this$getMinMax.max;
      if (this.options.bounds === 'ticks') {
        if (!minDefined) {
          min = 0;
        }
        if (!maxDefined) {
          max = this.getLabels().length - 1;
        }
      }
      this.min = min;
      this.max = max;
    }
  }, {
    key: "buildTicks",
    value: function buildTicks() {
      var min = this.min;
      var max = this.max;
      var offset = this.options.offset;
      var ticks = [];
      var labels = this.getLabels();
      labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
      this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
      this._startValue = this.min - (offset ? 0.5 : 0);
      for (var value = min; value <= max; value++) {
        ticks.push({
          value: value
        });
      }
      return ticks;
    }
  }, {
    key: "getLabelForValue",
    value: function getLabelForValue(value) {
      return _getLabelForValue.call(this, value);
    }
  }, {
    key: "configure",
    value: function configure() {
      _get(_getPrototypeOf(CategoryScale.prototype), "configure", this).call(this);
      if (!this.isHorizontal()) {
        this._reversePixels = !this._reversePixels;
      }
    }
  }, {
    key: "getPixelForValue",
    value: function getPixelForValue(value) {
      if (typeof value !== 'number') {
        value = this.parse(value);
      }
      return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
    }
  }, {
    key: "getPixelForTick",
    value: function getPixelForTick(index) {
      var ticks = this.ticks;
      if (index < 0 || index > ticks.length - 1) {
        return null;
      }
      return this.getPixelForValue(ticks[index].value);
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {
      return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
    }
  }, {
    key: "getBasePixel",
    value: function getBasePixel() {
      return this.bottom;
    }
  }]);
  return CategoryScale;
}(Scale);
_defineProperty(CategoryScale, "id", 'category');
_defineProperty(CategoryScale, "defaults", {
  ticks: {
    callback: _getLabelForValue
  }
});
function generateTicks$1(generationOptions, dataRange) {
  var ticks = [];
  var MIN_SPACING = 1e-14;
  var bounds = generationOptions.bounds,
    step = generationOptions.step,
    min = generationOptions.min,
    max = generationOptions.max,
    precision = generationOptions.precision,
    count = generationOptions.count,
    maxTicks = generationOptions.maxTicks,
    maxDigits = generationOptions.maxDigits,
    includeBounds = generationOptions.includeBounds;
  var unit = step || 1;
  var maxSpaces = maxTicks - 1;
  var rmin = dataRange.min,
    rmax = dataRange.max;
  var minDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(min);
  var maxDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(max);
  var countDefined = !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(count);
  var minSpacing = (rmax - rmin) / (maxDigits + 1);
  var spacing = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aH)((rmax - rmin) / maxSpaces / unit) * unit;
  var factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{
      value: rmin
    }, {
      value: rmax
    }];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aH)(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === 'ticks') {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aI)((max - min) / step, spacing / 1000)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(numSpaces, Math.round(numSpaces), spacing / 1000)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  var decimalPlaces = Math.max((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aK)(spacing), (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aK)(niceMin));
  factor = Math.pow(10, (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  var j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({
        value: min
      });
      if (niceMin < min) {
        j++;
      }
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }
  for (; j < numSpaces; ++j) {
    var tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({
      value: tickValue
    });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ)(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({
        value: max
      });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({
      value: niceMax
    });
  }
  return ticks;
}
function relativeLabelSize(value, minSpacing, _ref12) {
  var horizontal = _ref12.horizontal,
    minRotation = _ref12.minRotation;
  var rad = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(minRotation);
  var ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
  var length = 0.75 * minSpacing * ('' + value).length;
  return Math.min(minSpacing / ratio, length);
}
var LinearScaleBase = /*#__PURE__*/function (_Scale2) {
  _inherits(LinearScaleBase, _Scale2);
  var _super20 = _createSuper(LinearScaleBase);
  function LinearScaleBase(cfg) {
    var _this36;
    _classCallCheck(this, LinearScaleBase);
    _this36 = _super20.call(this, cfg);
    _this36.start = undefined;
    _this36.end = undefined;
    _this36._startValue = undefined;
    _this36._endValue = undefined;
    _this36._valueRange = 0;
    return _this36;
  }
  _createClass(LinearScaleBase, [{
    key: "parse",
    value: function parse(raw, index) {
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(raw)) {
        return null;
      }
      if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
        return null;
      }
      return +raw;
    }
  }, {
    key: "handleTickRangeOptions",
    value: function handleTickRangeOptions() {
      var beginAtZero = this.options.beginAtZero;
      var _this$getUserBounds3 = this.getUserBounds(),
        minDefined = _this$getUserBounds3.minDefined,
        maxDefined = _this$getUserBounds3.maxDefined;
      var min = this.min,
        max = this.max;
      var setMin = function setMin(v) {
        return min = minDefined ? min : v;
      };
      var setMax = function setMax(v) {
        return max = maxDefined ? max : v;
      };
      if (beginAtZero) {
        var minSign = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(min);
        var maxSign = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s)(max);
        if (minSign < 0 && maxSign < 0) {
          setMax(0);
        } else if (minSign > 0 && maxSign > 0) {
          setMin(0);
        }
      }
      if (min === max) {
        var offset = max === 0 ? 1 : Math.abs(max * 0.05);
        setMax(max + offset);
        if (!beginAtZero) {
          setMin(min - offset);
        }
      }
      this.min = min;
      this.max = max;
    }
  }, {
    key: "getTickLimit",
    value: function getTickLimit() {
      var tickOpts = this.options.ticks;
      var maxTicksLimit = tickOpts.maxTicksLimit,
        stepSize = tickOpts.stepSize;
      var maxTicks;
      if (stepSize) {
        maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
        if (maxTicks > 1000) {
          console.warn("scales.".concat(this.id, ".ticks.stepSize: ").concat(stepSize, " would result generating up to ").concat(maxTicks, " ticks. Limiting to 1000."));
          maxTicks = 1000;
        }
      } else {
        maxTicks = this.computeTickLimit();
        maxTicksLimit = maxTicksLimit || 11;
      }
      if (maxTicksLimit) {
        maxTicks = Math.min(maxTicksLimit, maxTicks);
      }
      return maxTicks;
    }
  }, {
    key: "computeTickLimit",
    value: function computeTickLimit() {
      return Number.POSITIVE_INFINITY;
    }
  }, {
    key: "buildTicks",
    value: function buildTicks() {
      var opts = this.options;
      var tickOpts = opts.ticks;
      var maxTicks = this.getTickLimit();
      maxTicks = Math.max(2, maxTicks);
      var numericGeneratorOptions = {
        maxTicks: maxTicks,
        bounds: opts.bounds,
        min: opts.min,
        max: opts.max,
        precision: tickOpts.precision,
        step: tickOpts.stepSize,
        count: tickOpts.count,
        maxDigits: this._maxDigits(),
        horizontal: this.isHorizontal(),
        minRotation: tickOpts.minRotation || 0,
        includeBounds: tickOpts.includeBounds !== false
      };
      var dataRange = this._range || this;
      var ticks = generateTicks$1(numericGeneratorOptions, dataRange);
      if (opts.bounds === 'ticks') {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aG)(ticks, this, 'value');
      }
      if (opts.reverse) {
        ticks.reverse();
        this.start = this.max;
        this.end = this.min;
      } else {
        this.start = this.min;
        this.end = this.max;
      }
      return ticks;
    }
  }, {
    key: "configure",
    value: function configure() {
      var ticks = this.ticks;
      var start = this.min;
      var end = this.max;
      _get(_getPrototypeOf(LinearScaleBase.prototype), "configure", this).call(this);
      if (this.options.offset && ticks.length) {
        var offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
        start -= offset;
        end += offset;
      }
      this._startValue = start;
      this._endValue = end;
      this._valueRange = end - start;
    }
  }, {
    key: "getLabelForValue",
    value: function getLabelForValue(value) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(value, this.chart.options.locale, this.options.ticks.format);
    }
  }]);
  return LinearScaleBase;
}(Scale);
var LinearScale = /*#__PURE__*/function (_LinearScaleBase) {
  _inherits(LinearScale, _LinearScaleBase);
  var _super21 = _createSuper(LinearScale);
  function LinearScale() {
    _classCallCheck(this, LinearScale);
    return _super21.apply(this, arguments);
  }
  _createClass(LinearScale, [{
    key: "determineDataLimits",
    value: function determineDataLimits() {
      var _this$getMinMax2 = this.getMinMax(true),
        min = _this$getMinMax2.min,
        max = _this$getMinMax2.max;
      this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) ? min : 0;
      this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) ? max : 1;
      this.handleTickRangeOptions();
    }
  }, {
    key: "computeTickLimit",
    value: function computeTickLimit() {
      var horizontal = this.isHorizontal();
      var length = horizontal ? this.width : this.height;
      var minRotation = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.options.ticks.minRotation);
      var ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001;
      var tickFont = this._resolveTickFontOptions(0);
      return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
    }
  }, {
    key: "getPixelForValue",
    value: function getPixelForValue(value) {
      return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {
      return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
    }
  }]);
  return LinearScale;
}(LinearScaleBase);
_defineProperty(LinearScale, "id", 'linear');
_defineProperty(LinearScale, "defaults", {
  ticks: {
    callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.numeric
  }
});
var log10Floor = function log10Floor(v) {
  return Math.floor((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(v));
};
var changeExponent = function changeExponent(v, m) {
  return Math.pow(10, log10Floor(v) + m);
};
function isMajor(tickVal) {
  var remain = tickVal / Math.pow(10, log10Floor(tickVal));
  return remain === 1;
}
function steps(min, max, rangeExp) {
  var rangeStep = Math.pow(10, rangeExp);
  var start = Math.floor(min / rangeStep);
  var end = Math.ceil(max / rangeStep);
  return end - start;
}
function startExp(min, max) {
  var range = max - min;
  var rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}
function generateTicks(generationOptions, _ref13) {
  var min = _ref13.min,
    max = _ref13.max;
  min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.min, min);
  var ticks = [];
  var minExp = log10Floor(min);
  var exp = startExp(min, max);
  var precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  var stepSize = Math.pow(10, exp);
  var base = minExp > exp ? Math.pow(10, minExp) : 0;
  var start = Math.round((min - base) * precision) / precision;
  var offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  var significand = Math.floor((start - offset) / Math.pow(10, exp));
  var value = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
  while (value < max) {
    ticks.push({
      value: value,
      major: isMajor(value),
      significand: significand
    });
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
  }
  var lastTick = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O)(generationOptions.max, value);
  ticks.push({
    value: lastTick,
    major: isMajor(lastTick),
    significand: significand
  });
  return ticks;
}
var LogarithmicScale = /*#__PURE__*/function (_Scale3) {
  _inherits(LogarithmicScale, _Scale3);
  var _super22 = _createSuper(LogarithmicScale);
  function LogarithmicScale(cfg) {
    var _this37;
    _classCallCheck(this, LogarithmicScale);
    _this37 = _super22.call(this, cfg);
    _this37.start = undefined;
    _this37.end = undefined;
    _this37._startValue = undefined;
    _this37._valueRange = 0;
    return _this37;
  }
  _createClass(LogarithmicScale, [{
    key: "parse",
    value: function parse(raw, index) {
      var value = LinearScaleBase.prototype.parse.apply(this, [raw, index]);
      if (value === 0) {
        this._zero = true;
        return undefined;
      }
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value) && value > 0 ? value : null;
    }
  }, {
    key: "determineDataLimits",
    value: function determineDataLimits() {
      var _this$getMinMax3 = this.getMinMax(true),
        min = _this$getMinMax3.min,
        max = _this$getMinMax3.max;
      this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) ? Math.max(0, min) : null;
      this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) ? Math.max(0, max) : null;
      if (this.options.beginAtZero) {
        this._zero = true;
      }
      if (this._zero && this.min !== this._suggestedMin && !(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(this._userMin)) {
        this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
      }
      this.handleTickRangeOptions();
    }
  }, {
    key: "handleTickRangeOptions",
    value: function handleTickRangeOptions() {
      var _this$getUserBounds4 = this.getUserBounds(),
        minDefined = _this$getUserBounds4.minDefined,
        maxDefined = _this$getUserBounds4.maxDefined;
      var min = this.min;
      var max = this.max;
      var setMin = function setMin(v) {
        return min = minDefined ? min : v;
      };
      var setMax = function setMax(v) {
        return max = maxDefined ? max : v;
      };
      if (min === max) {
        if (min <= 0) {
          setMin(1);
          setMax(10);
        } else {
          setMin(changeExponent(min, -1));
          setMax(changeExponent(max, +1));
        }
      }
      if (min <= 0) {
        setMin(changeExponent(max, -1));
      }
      if (max <= 0) {
        setMax(changeExponent(min, +1));
      }
      this.min = min;
      this.max = max;
    }
  }, {
    key: "buildTicks",
    value: function buildTicks() {
      var opts = this.options;
      var generationOptions = {
        min: this._userMin,
        max: this._userMax
      };
      var ticks = generateTicks(generationOptions, this);
      if (opts.bounds === 'ticks') {
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aG)(ticks, this, 'value');
      }
      if (opts.reverse) {
        ticks.reverse();
        this.start = this.max;
        this.end = this.min;
      } else {
        this.start = this.min;
        this.end = this.max;
      }
      return ticks;
    }
  }, {
    key: "getLabelForValue",
    value: function getLabelForValue(value) {
      return value === undefined ? '0' : (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o)(value, this.chart.options.locale, this.options.ticks.format);
    }
  }, {
    key: "configure",
    value: function configure() {
      var start = this.min;
      _get(_getPrototypeOf(LogarithmicScale.prototype), "configure", this).call(this);
      this._startValue = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(start);
      this._valueRange = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(this.max) - (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(start);
    }
  }, {
    key: "getPixelForValue",
    value: function getPixelForValue(value) {
      if (value === undefined || value === 0) {
        value = this.min;
      }
      if (value === null || isNaN(value)) {
        return NaN;
      }
      return this.getPixelForDecimal(value === this.min ? 0 : ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM)(value) - this._startValue) / this._valueRange);
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {
      var decimal = this.getDecimalForPixel(pixel);
      return Math.pow(10, this._startValue + decimal * this._valueRange);
    }
  }]);
  return LogarithmicScale;
}(Scale);
_defineProperty(LogarithmicScale, "id", 'logarithmic');
_defineProperty(LogarithmicScale, "defaults", {
  ticks: {
    callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.logarithmic,
    major: {
      enabled: true
    }
  }
});
function getTickBackdropHeight(opts) {
  var tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(tickOpts.backdropPadding);
    return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(tickOpts.font && tickOpts.font.size, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.d.font.size) + padding.height;
  }
  return 0;
}
function measureLabelSize(ctx, font, label) {
  label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b)(label) ? label : [label];
  return {
    w: (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aN)(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
function fitWithPointLabels(scale) {
  var orig = {
    l: scale.left + scale._padding.left,
    r: scale.right - scale._padding.right,
    t: scale.top + scale._padding.top,
    b: scale.bottom - scale._padding.bottom
  };
  var limits = Object.assign({}, orig);
  var labelSizes = [];
  var padding = [];
  var valueCount = scale._pointLabels.length;
  var pointLabelOpts = scale.options.pointLabels;
  var additionalAngle = pointLabelOpts.centerPointLabels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P / valueCount : 0;
  for (var i = 0; i < valueCount; i++) {
    var opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    var pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
    var plFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(opts.font);
    var textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;
    var angleRadians = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(scale.getIndexAngle(i) + additionalAngle);
    var angle = Math.round((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)(angleRadians));
    var hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    var vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    updateLimits(limits, orig, angleRadians, hLimits, vLimits);
  }
  scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
function updateLimits(limits, orig, angle, hLimits, vLimits) {
  var sin = Math.abs(Math.sin(angle));
  var cos = Math.abs(Math.cos(angle));
  var x = 0;
  var y = 0;
  if (hLimits.start < orig.l) {
    x = (orig.l - hLimits.start) / sin;
    limits.l = Math.min(limits.l, orig.l - x);
  } else if (hLimits.end > orig.r) {
    x = (hLimits.end - orig.r) / sin;
    limits.r = Math.max(limits.r, orig.r + x);
  }
  if (vLimits.start < orig.t) {
    y = (orig.t - vLimits.start) / cos;
    limits.t = Math.min(limits.t, orig.t - y);
  } else if (vLimits.end > orig.b) {
    y = (vLimits.end - orig.b) / cos;
    limits.b = Math.max(limits.b, orig.b + y);
  }
}
function createPointLabelItem(scale, index, itemOpts) {
  var outerDistance = scale.drawingArea;
  var extra = itemOpts.extra,
    additionalAngle = itemOpts.additionalAngle,
    padding = itemOpts.padding,
    size = itemOpts.size;
  var pointLabelPosition = scale.getPointPosition(index, outerDistance + extra + padding, additionalAngle);
  var angle = Math.round((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U)((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(pointLabelPosition.angle + _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H)));
  var y = yForAngle(pointLabelPosition.y, size.h, angle);
  var textAlign = getTextAlignForAngle(angle);
  var left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
  return {
    visible: true,
    x: pointLabelPosition.x,
    y: y,
    textAlign: textAlign,
    left: left,
    top: y,
    right: left + size.w,
    bottom: y + size.h
  };
}
function isNotOverlapped(item, area) {
  if (!area) {
    return true;
  }
  var left = item.left,
    top = item.top,
    right = item.right,
    bottom = item.bottom;
  var apexesInArea = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
    x: left,
    y: top
  }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
    x: left,
    y: bottom
  }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
    x: right,
    y: top
  }, area) || (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C)({
    x: right,
    y: bottom
  }, area);
  return !apexesInArea;
}
function buildPointLabelItems(scale, labelSizes, padding) {
  var items = [];
  var valueCount = scale._pointLabels.length;
  var opts = scale.options;
  var _opts$pointLabels = opts.pointLabels,
    centerPointLabels = _opts$pointLabels.centerPointLabels,
    display = _opts$pointLabels.display;
  var itemOpts = {
    extra: getTickBackdropHeight(opts) / 2,
    additionalAngle: centerPointLabels ? _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P / valueCount : 0
  };
  var area;
  for (var i = 0; i < valueCount; i++) {
    itemOpts.padding = padding[i];
    itemOpts.size = labelSizes[i];
    var item = createPointLabelItem(scale, i, itemOpts);
    items.push(item);
    if (display === 'auto') {
      item.visible = isNotOverlapped(item, area);
      if (item.visible) {
        area = item;
      }
    }
  }
  return items;
}
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return 'center';
  } else if (angle < 180) {
    return 'left';
  }
  return 'right';
}
function leftForTextAlign(x, w, align) {
  if (align === 'right') {
    x -= w;
  } else if (align === 'center') {
    x -= w / 2;
  }
  return x;
}
function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= h / 2;
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}
function drawPointLabelBox(ctx, opts, item) {
  var left = item.left,
    top = item.top,
    right = item.right,
    bottom = item.bottom;
  var backdropColor = opts.backdropColor;
  if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(backdropColor)) {
    var borderRadius = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw)(opts.borderRadius);
    var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(opts.backdropPadding);
    ctx.fillStyle = backdropColor;
    var backdropLeft = left - padding.left;
    var backdropTop = top - padding.top;
    var backdropWidth = right - left + padding.width;
    var backdropHeight = bottom - top + padding.height;
    if (Object.values(borderRadius).some(function (v) {
      return v !== 0;
    })) {
      ctx.beginPath();
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au)(ctx, {
        x: backdropLeft,
        y: backdropTop,
        w: backdropWidth,
        h: backdropHeight,
        radius: borderRadius
      });
      ctx.fill();
    } else {
      ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
    }
  }
}
function drawPointLabels(scale, labelCount) {
  var ctx = scale.ctx,
    pointLabels = scale.options.pointLabels;
  for (var i = labelCount - 1; i >= 0; i--) {
    var item = scale._pointLabelItems[i];
    if (!item.visible) {
      continue;
    }
    var optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    drawPointLabelBox(ctx, optsAtIndex, item);
    var plFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(optsAtIndex.font);
    var x = item.x,
      y = item.y,
      textAlign = item.textAlign;
    (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
      color: optsAtIndex.color,
      textAlign: textAlign,
      textBaseline: 'middle'
    });
  }
}
function pathRadiusLine(scale, radius, circular, labelCount) {
  var ctx = scale.ctx;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T);
  } else {
    var pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (var i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
  var ctx = scale.ctx;
  var circular = gridLineOpts.circular;
  var color = gridLineOpts.color,
    lineWidth = gridLineOpts.lineWidth;
  if (!circular && !labelCount || !color || !lineWidth || radius < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(borderOpts.dash);
  ctx.lineDashOffset = borderOpts.dashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
function createPointLabelContext(parent, index, label) {
  return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j)(parent, {
    label: label,
    index: index,
    type: 'pointLabel'
  });
}
var RadialLinearScale = /*#__PURE__*/function (_LinearScaleBase2) {
  _inherits(RadialLinearScale, _LinearScaleBase2);
  var _super23 = _createSuper(RadialLinearScale);
  function RadialLinearScale(cfg) {
    var _this38;
    _classCallCheck(this, RadialLinearScale);
    _this38 = _super23.call(this, cfg);
    _this38.xCenter = undefined;
    _this38.yCenter = undefined;
    _this38.drawingArea = undefined;
    _this38._pointLabels = [];
    _this38._pointLabelItems = [];
    return _this38;
  }
  _createClass(RadialLinearScale, [{
    key: "setDimensions",
    value: function setDimensions() {
      var padding = this._padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(getTickBackdropHeight(this.options) / 2);
      var w = this.width = this.maxWidth - padding.width;
      var h = this.height = this.maxHeight - padding.height;
      this.xCenter = Math.floor(this.left + w / 2 + padding.left);
      this.yCenter = Math.floor(this.top + h / 2 + padding.top);
      this.drawingArea = Math.floor(Math.min(w, h) / 2);
    }
  }, {
    key: "determineDataLimits",
    value: function determineDataLimits() {
      var _this$getMinMax4 = this.getMinMax(false),
        min = _this$getMinMax4.min,
        max = _this$getMinMax4.max;
      this.min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) && !isNaN(min) ? min : 0;
      this.max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) && !isNaN(max) ? max : 0;
      this.handleTickRangeOptions();
    }
  }, {
    key: "computeTickLimit",
    value: function computeTickLimit() {
      return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
    }
  }, {
    key: "generateTickLabels",
    value: function generateTickLabels(ticks) {
      var _this39 = this;
      LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
      this._pointLabels = this.getLabels().map(function (value, index) {
        var label = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(_this39.options.pointLabels.callback, [value, index], _this39);
        return label || label === 0 ? label : '';
      }).filter(function (v, i) {
        return _this39.chart.getDataVisibility(i);
      });
    }
  }, {
    key: "fit",
    value: function fit() {
      var opts = this.options;
      if (opts.display && opts.pointLabels.display) {
        fitWithPointLabels(this);
      } else {
        this.setCenterPoint(0, 0, 0, 0);
      }
    }
  }, {
    key: "setCenterPoint",
    value: function setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
      this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
      this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
      this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
    }
  }, {
    key: "getIndexAngle",
    value: function getIndexAngle(index) {
      var angleMultiplier = _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T / (this._pointLabels.length || 1);
      var startAngle = this.options.startAngle || 0;
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay)(index * angleMultiplier + (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(startAngle));
    }
  }, {
    key: "getDistanceFromCenterForValue",
    value: function getDistanceFromCenterForValue(value) {
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(value)) {
        return NaN;
      }
      var scalingFactor = this.drawingArea / (this.max - this.min);
      if (this.options.reverse) {
        return (this.max - value) * scalingFactor;
      }
      return (value - this.min) * scalingFactor;
    }
  }, {
    key: "getValueForDistanceFromCenter",
    value: function getValueForDistanceFromCenter(distance) {
      if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(distance)) {
        return NaN;
      }
      var scaledDistance = distance / (this.drawingArea / (this.max - this.min));
      return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
    }
  }, {
    key: "getPointLabelContext",
    value: function getPointLabelContext(index) {
      var pointLabels = this._pointLabels || [];
      if (index >= 0 && index < pointLabels.length) {
        var pointLabel = pointLabels[index];
        return createPointLabelContext(this.getContext(), index, pointLabel);
      }
    }
  }, {
    key: "getPointPosition",
    value: function getPointPosition(index, distanceFromCenter) {
      var additionalAngle = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var angle = this.getIndexAngle(index) - _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H + additionalAngle;
      return {
        x: Math.cos(angle) * distanceFromCenter + this.xCenter,
        y: Math.sin(angle) * distanceFromCenter + this.yCenter,
        angle: angle
      };
    }
  }, {
    key: "getPointPositionForValue",
    value: function getPointPositionForValue(index, value) {
      return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
    }
  }, {
    key: "getBasePosition",
    value: function getBasePosition(index) {
      return this.getPointPositionForValue(index || 0, this.getBaseValue());
    }
  }, {
    key: "getPointLabelPosition",
    value: function getPointLabelPosition(index) {
      var _this$_pointLabelItem = this._pointLabelItems[index],
        left = _this$_pointLabelItem.left,
        top = _this$_pointLabelItem.top,
        right = _this$_pointLabelItem.right,
        bottom = _this$_pointLabelItem.bottom;
      return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
      };
    }
  }, {
    key: "drawBackground",
    value: function drawBackground() {
      var _this$options16 = this.options,
        backgroundColor = _this$options16.backgroundColor,
        circular = _this$options16.grid.circular;
      if (backgroundColor) {
        var ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
        ctx.closePath();
        ctx.fillStyle = backgroundColor;
        ctx.fill();
        ctx.restore();
      }
    }
  }, {
    key: "drawGrid",
    value: function drawGrid() {
      var _this40 = this;
      var ctx = this.ctx;
      var opts = this.options;
      var angleLines = opts.angleLines,
        grid = opts.grid,
        border = opts.border;
      var labelCount = this._pointLabels.length;
      var i, offset, position;
      if (opts.pointLabels.display) {
        drawPointLabels(this, labelCount);
      }
      if (grid.display) {
        this.ticks.forEach(function (tick, index) {
          if (index !== 0) {
            offset = _this40.getDistanceFromCenterForValue(tick.value);
            var context = _this40.getContext(index);
            var optsAtIndex = grid.setContext(context);
            var optsAtIndexBorder = border.setContext(context);
            drawRadiusLine(_this40, optsAtIndex, offset, labelCount, optsAtIndexBorder);
          }
        });
      }
      if (angleLines.display) {
        ctx.save();
        for (i = labelCount - 1; i >= 0; i--) {
          var optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
          var color = optsAtIndex.color,
            lineWidth = optsAtIndex.lineWidth;
          if (!lineWidth || !color) {
            continue;
          }
          ctx.lineWidth = lineWidth;
          ctx.strokeStyle = color;
          ctx.setLineDash(optsAtIndex.borderDash);
          ctx.lineDashOffset = optsAtIndex.borderDashOffset;
          offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
          position = this.getPointPosition(i, offset);
          ctx.beginPath();
          ctx.moveTo(this.xCenter, this.yCenter);
          ctx.lineTo(position.x, position.y);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }, {
    key: "drawBorder",
    value: function drawBorder() {}
  }, {
    key: "drawLabels",
    value: function drawLabels() {
      var _this41 = this;
      var ctx = this.ctx;
      var opts = this.options;
      var tickOpts = opts.ticks;
      if (!tickOpts.display) {
        return;
      }
      var startAngle = this.getIndexAngle(0);
      var offset, width;
      ctx.save();
      ctx.translate(this.xCenter, this.yCenter);
      ctx.rotate(startAngle);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      this.ticks.forEach(function (tick, index) {
        if (index === 0 && !opts.reverse) {
          return;
        }
        var optsAtIndex = tickOpts.setContext(_this41.getContext(index));
        var tickFont = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0)(optsAtIndex.font);
        offset = _this41.getDistanceFromCenterForValue(_this41.ticks[index].value);
        if (optsAtIndex.showLabelBackdrop) {
          ctx.font = tickFont.string;
          width = ctx.measureText(tick.label).width;
          ctx.fillStyle = optsAtIndex.backdropColor;
          var padding = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E)(optsAtIndex.backdropPadding);
          ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
        }
        (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z)(ctx, tick.label, 0, -offset, tickFont, {
          color: optsAtIndex.color,
          strokeColor: optsAtIndex.textStrokeColor,
          strokeWidth: optsAtIndex.textStrokeWidth
        });
      });
      ctx.restore();
    }
  }, {
    key: "drawTitle",
    value: function drawTitle() {}
  }]);
  return RadialLinearScale;
}(LinearScaleBase);
_defineProperty(RadialLinearScale, "id", 'radialLinear');
_defineProperty(RadialLinearScale, "defaults", {
  display: true,
  animate: true,
  position: 'chartArea',
  angleLines: {
    display: true,
    lineWidth: 1,
    borderDash: [],
    borderDashOffset: 0.0
  },
  grid: {
    circular: false
  },
  startAngle: 0,
  ticks: {
    showLabelBackdrop: true,
    callback: _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aL.formatters.numeric
  },
  pointLabels: {
    backdropColor: undefined,
    backdropPadding: 2,
    display: true,
    font: {
      size: 10
    },
    callback: function callback(label) {
      return label;
    },
    padding: 5,
    centerPointLabels: false
  }
});
_defineProperty(RadialLinearScale, "defaultRoutes", {
  'angleLines.color': 'borderColor',
  'pointLabels.color': 'color',
  'ticks.color': 'color'
});
_defineProperty(RadialLinearScale, "descriptors", {
  angleLines: {
    _fallback: 'grid'
  }
});
var INTERVALS = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1000
  },
  second: {
    common: true,
    size: 1000,
    steps: 60
  },
  minute: {
    common: true,
    size: 60000,
    steps: 60
  },
  hour: {
    common: true,
    size: 3600000,
    steps: 24
  },
  day: {
    common: true,
    size: 86400000,
    steps: 30
  },
  week: {
    common: false,
    size: 604800000,
    steps: 4
  },
  month: {
    common: true,
    size: 2.628e9,
    steps: 12
  },
  quarter: {
    common: false,
    size: 7.884e9,
    steps: 4
  },
  year: {
    common: true,
    size: 3.154e10
  }
};
var UNITS = /* #__PURE__ */Object.keys(INTERVALS);
function sorter(a, b) {
  return a - b;
}
function _parse(scale, input) {
  if ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k)(input)) {
    return null;
  }
  var adapter = scale._adapter;
  var _scale$_parseOpts = scale._parseOpts,
    parser = _scale$_parseOpts.parser,
    round = _scale$_parseOpts.round,
    isoWeekday = _scale$_parseOpts.isoWeekday;
  var value = input;
  if (typeof parser === 'function') {
    value = parser(value);
  }
  if (!(0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(value)) {
    value = typeof parser === 'string' ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round) {
    value = round === 'week' && ((0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, 'isoWeek', isoWeekday) : adapter.startOf(value, round);
  }
  return +value;
}
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  var ilen = UNITS.length;
  for (var i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    var interval = INTERVALS[UNITS[i]];
    var factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }
  return UNITS[ilen - 1];
}
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (var i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    var unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
function determineMajorUnit(unit) {
  for (var i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    var _lookup2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aP)(timestamps, time),
      lo = _lookup2.lo,
      hi = _lookup2.hi;
    var timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
function setMajorTicks(scale, ticks, map, majorUnit) {
  var adapter = scale._adapter;
  var first = +adapter.startOf(ticks[0].value, majorUnit);
  var last = ticks[ticks.length - 1].value;
  var major, index;
  for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
    index = map[major];
    if (index >= 0) {
      ticks[index].major = true;
    }
  }
  return ticks;
}
function ticksFromTimestamps(scale, values, majorUnit) {
  var ticks = [];
  var map = {};
  var ilen = values.length;
  var i, value;
  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map[value] = i;
    ticks.push({
      value: value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
}
var TimeScale = /*#__PURE__*/function (_Scale4) {
  _inherits(TimeScale, _Scale4);
  var _super24 = _createSuper(TimeScale);
  function TimeScale(props) {
    var _this42;
    _classCallCheck(this, TimeScale);
    _this42 = _super24.call(this, props);
    _this42._cache = {
      data: [],
      labels: [],
      all: []
    };
    _this42._unit = 'day';
    _this42._majorUnit = undefined;
    _this42._offsets = {};
    _this42._normalized = false;
    _this42._parseOpts = undefined;
    return _this42;
  }
  _createClass(TimeScale, [{
    key: "init",
    value: function init(scaleOpts) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var time = scaleOpts.time || (scaleOpts.time = {});
      var adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
      adapter.init(opts);
      (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab)(time.displayFormats, adapter.formats());
      this._parseOpts = {
        parser: time.parser,
        round: time.round,
        isoWeekday: time.isoWeekday
      };
      _get(_getPrototypeOf(TimeScale.prototype), "init", this).call(this, scaleOpts);
      this._normalized = opts.normalized;
    }
  }, {
    key: "parse",
    value: function parse(raw, index) {
      if (raw === undefined) {
        return null;
      }
      return _parse(this, raw);
    }
  }, {
    key: "beforeLayout",
    value: function beforeLayout() {
      _get(_getPrototypeOf(TimeScale.prototype), "beforeLayout", this).call(this);
      this._cache = {
        data: [],
        labels: [],
        all: []
      };
    }
  }, {
    key: "determineDataLimits",
    value: function determineDataLimits() {
      var options = this.options;
      var adapter = this._adapter;
      var unit = options.time.unit || 'day';
      var _this$getUserBounds5 = this.getUserBounds(),
        min = _this$getUserBounds5.min,
        max = _this$getUserBounds5.max,
        minDefined = _this$getUserBounds5.minDefined,
        maxDefined = _this$getUserBounds5.maxDefined;
      function _applyBounds(bounds) {
        if (!minDefined && !isNaN(bounds.min)) {
          min = Math.min(min, bounds.min);
        }
        if (!maxDefined && !isNaN(bounds.max)) {
          max = Math.max(max, bounds.max);
        }
      }
      if (!minDefined || !maxDefined) {
        _applyBounds(this._getLabelBounds());
        if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
          _applyBounds(this.getMinMax(false));
        }
      }
      min = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
      max = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g)(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
      this.min = Math.min(min, max - 1);
      this.max = Math.max(min + 1, max);
    }
  }, {
    key: "_getLabelBounds",
    value: function _getLabelBounds() {
      var arr = this.getLabelTimestamps();
      var min = Number.POSITIVE_INFINITY;
      var max = Number.NEGATIVE_INFINITY;
      if (arr.length) {
        min = arr[0];
        max = arr[arr.length - 1];
      }
      return {
        min: min,
        max: max
      };
    }
  }, {
    key: "buildTicks",
    value: function buildTicks() {
      var options = this.options;
      var timeOpts = options.time;
      var tickOpts = options.ticks;
      var timestamps = tickOpts.source === 'labels' ? this.getLabelTimestamps() : this._generate();
      if (options.bounds === 'ticks' && timestamps.length) {
        this.min = this._userMin || timestamps[0];
        this.max = this._userMax || timestamps[timestamps.length - 1];
      }
      var min = this.min;
      var max = this.max;
      var ticks = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aO)(timestamps, min, max);
      this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
      this._majorUnit = !tickOpts.major.enabled || this._unit === 'year' ? undefined : determineMajorUnit(this._unit);
      this.initOffsets(timestamps);
      if (options.reverse) {
        ticks.reverse();
      }
      return ticksFromTimestamps(this, ticks, this._majorUnit);
    }
  }, {
    key: "afterAutoSkip",
    value: function afterAutoSkip() {
      if (this.options.offsetAfterAutoskip) {
        this.initOffsets(this.ticks.map(function (tick) {
          return +tick.value;
        }));
      }
    }
  }, {
    key: "initOffsets",
    value: function initOffsets() {
      var timestamps = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var start = 0;
      var end = 0;
      var first, last;
      if (this.options.offset && timestamps.length) {
        first = this.getDecimalForValue(timestamps[0]);
        if (timestamps.length === 1) {
          start = 1 - first;
        } else {
          start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
        }
        last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
        if (timestamps.length === 1) {
          end = last;
        } else {
          end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
        }
      }
      var limit = timestamps.length < 3 ? 0.5 : 0.25;
      start = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(start, 0, limit);
      end = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S)(end, 0, limit);
      this._offsets = {
        start: start,
        end: end,
        factor: 1 / (start + 1 + end)
      };
    }
  }, {
    key: "_generate",
    value: function _generate() {
      var adapter = this._adapter;
      var min = this.min;
      var max = this.max;
      var options = this.options;
      var timeOpts = options.time;
      var minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
      var stepSize = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)(options.ticks.stepSize, 1);
      var weekday = minor === 'week' ? timeOpts.isoWeekday : false;
      var hasWeekday = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x)(weekday) || weekday === true;
      var ticks = {};
      var first = min;
      var time, count;
      if (hasWeekday) {
        first = +adapter.startOf(first, 'isoWeek', weekday);
      }
      first = +adapter.startOf(first, hasWeekday ? 'day' : minor);
      if (adapter.diff(max, min, minor) > 100000 * stepSize) {
        throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor);
      }
      var timestamps = options.ticks.source === 'data' && this.getDataTimestamps();
      for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
        addTick(ticks, time, timestamps);
      }
      if (time === max || options.bounds === 'ticks' || count === 1) {
        addTick(ticks, time, timestamps);
      }
      return Object.keys(ticks).sort(sorter).map(function (x) {
        return +x;
      });
    }
  }, {
    key: "getLabelForValue",
    value: function getLabelForValue(value) {
      var adapter = this._adapter;
      var timeOpts = this.options.time;
      if (timeOpts.tooltipFormat) {
        return adapter.format(value, timeOpts.tooltipFormat);
      }
      return adapter.format(value, timeOpts.displayFormats.datetime);
    }
  }, {
    key: "format",
    value: function format(value, _format) {
      var options = this.options;
      var formats = options.time.displayFormats;
      var unit = this._unit;
      var fmt = _format || formats[unit];
      return this._adapter.format(value, fmt);
    }
  }, {
    key: "_tickFormatFunction",
    value: function _tickFormatFunction(time, index, ticks, format) {
      var options = this.options;
      var formatter = options.ticks.callback;
      if (formatter) {
        return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q)(formatter, [time, index, ticks], this);
      }
      var formats = options.time.displayFormats;
      var unit = this._unit;
      var majorUnit = this._majorUnit;
      var minorFormat = unit && formats[unit];
      var majorFormat = majorUnit && formats[majorUnit];
      var tick = ticks[index];
      var major = majorUnit && majorFormat && tick && tick.major;
      return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
    }
  }, {
    key: "generateTickLabels",
    value: function generateTickLabels(ticks) {
      var i, ilen, tick;
      for (i = 0, ilen = ticks.length; i < ilen; ++i) {
        tick = ticks[i];
        tick.label = this._tickFormatFunction(tick.value, i, ticks);
      }
    }
  }, {
    key: "getDecimalForValue",
    value: function getDecimalForValue(value) {
      return value === null ? NaN : (value - this.min) / (this.max - this.min);
    }
  }, {
    key: "getPixelForValue",
    value: function getPixelForValue(value) {
      var offsets = this._offsets;
      var pos = this.getDecimalForValue(value);
      return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {
      var offsets = this._offsets;
      var pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
      return this.min + pos * (this.max - this.min);
    }
  }, {
    key: "_getLabelSize",
    value: function _getLabelSize(label) {
      var ticksOpts = this.options.ticks;
      var tickLabelWidth = this.ctx.measureText(label).width;
      var angle = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t)(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
      var cosRotation = Math.cos(angle);
      var sinRotation = Math.sin(angle);
      var tickFontSize = this._resolveTickFontOptions(0).size;
      return {
        w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
        h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
      };
    }
  }, {
    key: "_getLabelCapacity",
    value: function _getLabelCapacity(exampleTime) {
      var timeOpts = this.options.time;
      var displayFormats = timeOpts.displayFormats;
      var format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
      var exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [exampleTime], this._majorUnit), format);
      var size = this._getLabelSize(exampleLabel);
      var capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
      return capacity > 0 ? capacity : 1;
    }
  }, {
    key: "getDataTimestamps",
    value: function getDataTimestamps() {
      var timestamps = this._cache.data || [];
      var i, ilen;
      if (timestamps.length) {
        return timestamps;
      }
      var metas = this.getMatchingVisibleMetas();
      if (this._normalized && metas.length) {
        return this._cache.data = metas[0].controller.getAllParsedValues(this);
      }
      for (i = 0, ilen = metas.length; i < ilen; ++i) {
        timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
      }
      return this._cache.data = this.normalize(timestamps);
    }
  }, {
    key: "getLabelTimestamps",
    value: function getLabelTimestamps() {
      var timestamps = this._cache.labels || [];
      var i, ilen;
      if (timestamps.length) {
        return timestamps;
      }
      var labels = this.getLabels();
      for (i = 0, ilen = labels.length; i < ilen; ++i) {
        timestamps.push(_parse(this, labels[i]));
      }
      return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
    }
  }, {
    key: "normalize",
    value: function normalize(values) {
      return (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__._)(values.sort(sorter));
    }
  }]);
  return TimeScale;
}(Scale);
_defineProperty(TimeScale, "id", 'time');
_defineProperty(TimeScale, "defaults", {
  bounds: 'data',
  adapters: {},
  time: {
    parser: false,
    unit: false,
    round: false,
    isoWeekday: false,
    minUnit: 'millisecond',
    displayFormats: {}
  },
  ticks: {
    source: 'auto',
    callback: false,
    major: {
      enabled: false
    }
  }
});
function interpolate(table, val, reverse) {
  var lo = 0;
  var hi = table.length - 1;
  var prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      var _lookupByKey2 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(table, 'pos', val);
      lo = _lookupByKey2.lo;
      hi = _lookupByKey2.hi;
    }
    var _table$lo = table[lo];
    prevSource = _table$lo.pos;
    prevTarget = _table$lo.time;
    var _table$hi = table[hi];
    nextSource = _table$hi.pos;
    nextTarget = _table$hi.time;
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      var _lookupByKey3 = (0,_chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B)(table, 'time', val);
      lo = _lookupByKey3.lo;
      hi = _lookupByKey3.hi;
    }
    var _table$lo2 = table[lo];
    prevSource = _table$lo2.time;
    prevTarget = _table$lo2.pos;
    var _table$hi2 = table[hi];
    nextSource = _table$hi2.time;
    nextTarget = _table$hi2.pos;
  }
  var span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
var TimeSeriesScale = /*#__PURE__*/function (_TimeScale) {
  _inherits(TimeSeriesScale, _TimeScale);
  var _super25 = _createSuper(TimeSeriesScale);
  function TimeSeriesScale(props) {
    var _this43;
    _classCallCheck(this, TimeSeriesScale);
    _this43 = _super25.call(this, props);
    _this43._table = [];
    _this43._minPos = undefined;
    _this43._tableRange = undefined;
    return _this43;
  }
  _createClass(TimeSeriesScale, [{
    key: "initOffsets",
    value: function initOffsets() {
      var timestamps = this._getTimestampsForTable();
      var table = this._table = this.buildLookupTable(timestamps);
      this._minPos = interpolate(table, this.min);
      this._tableRange = interpolate(table, this.max) - this._minPos;
      _get(_getPrototypeOf(TimeSeriesScale.prototype), "initOffsets", this).call(this, timestamps);
    }
  }, {
    key: "buildLookupTable",
    value: function buildLookupTable(timestamps) {
      var min = this.min,
        max = this.max;
      var items = [];
      var table = [];
      var i, ilen, prev, curr, next;
      for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
        curr = timestamps[i];
        if (curr >= min && curr <= max) {
          items.push(curr);
        }
      }
      if (items.length < 2) {
        return [{
          time: min,
          pos: 0
        }, {
          time: max,
          pos: 1
        }];
      }
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        next = items[i + 1];
        prev = items[i - 1];
        curr = items[i];
        if (Math.round((next + prev) / 2) !== curr) {
          table.push({
            time: curr,
            pos: i / (ilen - 1)
          });
        }
      }
      return table;
    }
  }, {
    key: "_generate",
    value: function _generate() {
      var min = this.min;
      var max = this.max;
      var timestamps = _get(_getPrototypeOf(TimeSeriesScale.prototype), "getDataTimestamps", this).call(this);
      if (!timestamps.includes(min) || !timestamps.length) {
        timestamps.splice(0, 0, min);
      }
      if (!timestamps.includes(max) || timestamps.length === 1) {
        timestamps.push(max);
      }
      return timestamps.sort(function (a, b) {
        return a - b;
      });
    }
  }, {
    key: "_getTimestampsForTable",
    value: function _getTimestampsForTable() {
      var timestamps = this._cache.all || [];
      if (timestamps.length) {
        return timestamps;
      }
      var data = this.getDataTimestamps();
      var label = this.getLabelTimestamps();
      if (data.length && label.length) {
        timestamps = this.normalize(data.concat(label));
      } else {
        timestamps = data.length ? data : label;
      }
      timestamps = this._cache.all = timestamps;
      return timestamps;
    }
  }, {
    key: "getDecimalForValue",
    value: function getDecimalForValue(value) {
      return (interpolate(this._table, value) - this._minPos) / this._tableRange;
    }
  }, {
    key: "getValueForPixel",
    value: function getValueForPixel(pixel) {
      var offsets = this._offsets;
      var decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
      return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
    }
  }]);
  return TimeSeriesScale;
}(TimeScale);
_defineProperty(TimeSeriesScale, "id", 'timeseries');
_defineProperty(TimeSeriesScale, "defaults", TimeScale.defaults);
var scales = /*#__PURE__*/Object.freeze({
  __proto__: null,
  CategoryScale: CategoryScale,
  LinearScale: LinearScale,
  LogarithmicScale: LogarithmicScale,
  RadialLinearScale: RadialLinearScale,
  TimeScale: TimeScale,
  TimeSeriesScale: TimeSeriesScale
});
var registerables = [controllers, elements, plugins, scales];


/***/ }),

/***/ "./node_modules/chart.js/dist/chunks/helpers.segment.js":
/*!**************************************************************!*\
  !*** ./node_modules/chart.js/dist/chunks/helpers.segment.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $: () => (/* binding */ unclipArea),
/* harmony export */   A: () => (/* binding */ _rlookupByKey),
/* harmony export */   B: () => (/* binding */ _lookupByKey),
/* harmony export */   C: () => (/* binding */ _isPointInArea),
/* harmony export */   D: () => (/* binding */ getAngleFromPoint),
/* harmony export */   E: () => (/* binding */ toPadding),
/* harmony export */   F: () => (/* binding */ each),
/* harmony export */   G: () => (/* binding */ getMaximumSize),
/* harmony export */   H: () => (/* binding */ HALF_PI),
/* harmony export */   I: () => (/* binding */ _getParentNode),
/* harmony export */   J: () => (/* binding */ readUsedSize),
/* harmony export */   K: () => (/* binding */ supportsEventListenerOptions),
/* harmony export */   L: () => (/* binding */ throttled),
/* harmony export */   M: () => (/* binding */ _isDomSupported),
/* harmony export */   N: () => (/* binding */ _factorize),
/* harmony export */   O: () => (/* binding */ finiteOrDefault),
/* harmony export */   P: () => (/* binding */ PI),
/* harmony export */   Q: () => (/* binding */ callback),
/* harmony export */   R: () => (/* binding */ _addGrace),
/* harmony export */   S: () => (/* binding */ _limitValue),
/* harmony export */   T: () => (/* binding */ TAU),
/* harmony export */   U: () => (/* binding */ toDegrees),
/* harmony export */   V: () => (/* binding */ _measureText),
/* harmony export */   W: () => (/* binding */ _int16Range),
/* harmony export */   X: () => (/* binding */ _alignPixel),
/* harmony export */   Y: () => (/* binding */ clipArea),
/* harmony export */   Z: () => (/* binding */ renderText),
/* harmony export */   _: () => (/* binding */ _arrayUnique),
/* harmony export */   a: () => (/* binding */ resolve),
/* harmony export */   a$: () => (/* binding */ fontString),
/* harmony export */   a0: () => (/* binding */ toFont),
/* harmony export */   a1: () => (/* binding */ _toLeftRightCenter),
/* harmony export */   a2: () => (/* binding */ _alignStartEnd),
/* harmony export */   a3: () => (/* binding */ overrides),
/* harmony export */   a4: () => (/* binding */ merge),
/* harmony export */   a5: () => (/* binding */ _capitalize),
/* harmony export */   a6: () => (/* binding */ descriptors),
/* harmony export */   a7: () => (/* binding */ isFunction),
/* harmony export */   a8: () => (/* binding */ _attachContext),
/* harmony export */   a9: () => (/* binding */ _createResolver),
/* harmony export */   aA: () => (/* binding */ overrideTextDirection),
/* harmony export */   aB: () => (/* binding */ _textX),
/* harmony export */   aC: () => (/* binding */ restoreTextDirection),
/* harmony export */   aD: () => (/* binding */ drawPointLegend),
/* harmony export */   aE: () => (/* binding */ distanceBetweenPoints),
/* harmony export */   aF: () => (/* binding */ noop),
/* harmony export */   aG: () => (/* binding */ _setMinAndMaxByKey),
/* harmony export */   aH: () => (/* binding */ niceNum),
/* harmony export */   aI: () => (/* binding */ almostWhole),
/* harmony export */   aJ: () => (/* binding */ almostEquals),
/* harmony export */   aK: () => (/* binding */ _decimalPlaces),
/* harmony export */   aL: () => (/* binding */ Ticks),
/* harmony export */   aM: () => (/* binding */ log10),
/* harmony export */   aN: () => (/* binding */ _longestText),
/* harmony export */   aO: () => (/* binding */ _filterBetween),
/* harmony export */   aP: () => (/* binding */ _lookup),
/* harmony export */   aQ: () => (/* binding */ isPatternOrGradient),
/* harmony export */   aR: () => (/* binding */ getHoverColor),
/* harmony export */   aS: () => (/* binding */ clone),
/* harmony export */   aT: () => (/* binding */ _merger),
/* harmony export */   aU: () => (/* binding */ _mergerIf),
/* harmony export */   aV: () => (/* binding */ _deprecated),
/* harmony export */   aW: () => (/* binding */ _splitKey),
/* harmony export */   aX: () => (/* binding */ toFontString),
/* harmony export */   aY: () => (/* binding */ splineCurve),
/* harmony export */   aZ: () => (/* binding */ splineCurveMonotone),
/* harmony export */   a_: () => (/* binding */ getStyle),
/* harmony export */   aa: () => (/* binding */ _descriptors),
/* harmony export */   ab: () => (/* binding */ mergeIf),
/* harmony export */   ac: () => (/* binding */ uid),
/* harmony export */   ad: () => (/* binding */ debounce),
/* harmony export */   ae: () => (/* binding */ retinaScale),
/* harmony export */   af: () => (/* binding */ clearCanvas),
/* harmony export */   ag: () => (/* binding */ setsEqual),
/* harmony export */   ah: () => (/* binding */ _elementsEqual),
/* harmony export */   ai: () => (/* binding */ _isClickEvent),
/* harmony export */   aj: () => (/* binding */ _isBetween),
/* harmony export */   ak: () => (/* binding */ _readValueToProps),
/* harmony export */   al: () => (/* binding */ _updateBezierControlPoints),
/* harmony export */   am: () => (/* binding */ _computeSegments),
/* harmony export */   an: () => (/* binding */ _boundSegments),
/* harmony export */   ao: () => (/* binding */ _steppedInterpolation),
/* harmony export */   ap: () => (/* binding */ _bezierInterpolation),
/* harmony export */   aq: () => (/* binding */ _pointInLine),
/* harmony export */   ar: () => (/* binding */ _steppedLineTo),
/* harmony export */   as: () => (/* binding */ _bezierCurveTo),
/* harmony export */   at: () => (/* binding */ drawPoint),
/* harmony export */   au: () => (/* binding */ addRoundedRectPath),
/* harmony export */   av: () => (/* binding */ toTRBL),
/* harmony export */   aw: () => (/* binding */ toTRBLCorners),
/* harmony export */   ax: () => (/* binding */ _boundSegment),
/* harmony export */   ay: () => (/* binding */ _normalizeAngle),
/* harmony export */   az: () => (/* binding */ getRtlAdapter),
/* harmony export */   b: () => (/* binding */ isArray),
/* harmony export */   b0: () => (/* binding */ toLineHeight),
/* harmony export */   b1: () => (/* binding */ PITAU),
/* harmony export */   b2: () => (/* binding */ INFINITY),
/* harmony export */   b3: () => (/* binding */ RAD_PER_DEG),
/* harmony export */   b4: () => (/* binding */ QUARTER_PI),
/* harmony export */   b5: () => (/* binding */ TWO_THIRDS_PI),
/* harmony export */   b6: () => (/* binding */ _angleDiff),
/* harmony export */   c: () => (/* binding */ color),
/* harmony export */   d: () => (/* binding */ defaults),
/* harmony export */   e: () => (/* binding */ effects),
/* harmony export */   f: () => (/* binding */ resolveObjectKey),
/* harmony export */   g: () => (/* binding */ isNumberFinite),
/* harmony export */   h: () => (/* binding */ defined),
/* harmony export */   i: () => (/* binding */ isObject),
/* harmony export */   j: () => (/* binding */ createContext),
/* harmony export */   k: () => (/* binding */ isNullOrUndef),
/* harmony export */   l: () => (/* binding */ listenArrayEvents),
/* harmony export */   m: () => (/* binding */ toPercentage),
/* harmony export */   n: () => (/* binding */ toDimension),
/* harmony export */   o: () => (/* binding */ formatNumber),
/* harmony export */   p: () => (/* binding */ _angleBetween),
/* harmony export */   q: () => (/* binding */ _getStartAndCountOfVisiblePoints),
/* harmony export */   r: () => (/* binding */ requestAnimFrame),
/* harmony export */   s: () => (/* binding */ sign),
/* harmony export */   t: () => (/* binding */ toRadians),
/* harmony export */   u: () => (/* binding */ unlistenArrayEvents),
/* harmony export */   v: () => (/* binding */ valueOrDefault),
/* harmony export */   w: () => (/* binding */ _scaleRangesChanged),
/* harmony export */   x: () => (/* binding */ isNumber),
/* harmony export */   y: () => (/* binding */ _parseObjectDataRadialScale),
/* harmony export */   z: () => (/* binding */ getRelativePosition)
/* harmony export */ });
/* harmony import */ var _kurkle_color__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @kurkle/color */ "./node_modules/@kurkle/color/dist/color.esm.js");
function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
/*!
 * Chart.js v4.4.0
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */


/**
 * @namespace Chart.helpers
 */ /**
    * An empty function that can be used, for example, for optional callback.
    */
function noop() {
  /* noop */}
/**
 * Returns a unique id, sequentially generated from a global variable.
 */
var uid = function () {
  var id = 0;
  return function () {
    return id++;
  };
}();
/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
function isNullOrUndef(value) {
  return value === null || typeof value === 'undefined';
}
/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param value - The value to test.
 * @function
 */
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  var type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === '[object' && type.slice(-6) === 'Array]') {
    return true;
  }
  return false;
}
/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}
/**
 * Returns true if `value` is a finite number, else returns false
 * @param value  - The value to test.
 */
function isNumberFinite(value) {
  return (typeof value === 'number' || value instanceof Number) && isFinite(+value);
}
/**
 * Returns `value` if finite, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is not finite.
 */
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is undefined.
 */
function valueOrDefault(value, defaultValue) {
  return typeof value === 'undefined' ? defaultValue : value;
}
var toPercentage = function toPercentage(value, dimension) {
  return typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 : +value / dimension;
};
var toDimension = function toDimension(value, dimension) {
  return typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 * dimension : +value;
};
/**
 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
 * @param fn - The function to call.
 * @param args - The arguments with which `fn` should be called.
 * @param [thisArg] - The value of `this` provided for the call to `fn`.
 */
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === 'function') {
    return fn.apply(thisArg, args);
  }
}
function each(loopable, fn, thisArg, reverse) {
  var i, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}
/**
 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
 * @param a0 - The array to compare
 * @param a1 - The array to compare
 * @private
 */
function _elementsEqual(a0, a1) {
  var i, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
/**
 * Returns a deep copy of `source` without keeping references on objects and arrays.
 * @param source - The value to clone.
 */
function clone(source) {
  if (isArray(source)) {
    return source.map(clone);
  }
  if (isObject(source)) {
    var target = Object.create(null);
    var keys = Object.keys(source);
    var klen = keys.length;
    var k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone(source[keys[k]]);
    }
    return target;
  }
  return source;
}
function isValidKey(key) {
  return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1;
}
/**
 * The default merger when Chart.helpers.merge is called without merger option.
 * Note(SB): also used by mergeConfig and mergeScaleConfig as fallback.
 * @private
 */
function _merger(key, target, source, options) {
  if (!isValidKey(key)) {
    return;
  }
  var tval = target[key];
  var sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    merge(tval, sval, options);
  } else {
    target[key] = clone(sval);
  }
}
function merge(target, source, options) {
  var sources = isArray(source) ? source : [source];
  var ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options = options || {};
  var merger = options.merger || _merger;
  var current;
  for (var i = 0; i < ilen; ++i) {
    current = sources[i];
    if (!isObject(current)) {
      continue;
    }
    var keys = Object.keys(current);
    for (var k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, current, options);
    }
  }
  return target;
}
function mergeIf(target, source) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return merge(target, source, {
    merger: _mergerIf
  });
}
/**
 * Merges source[key] in target[key] only if target[key] is undefined.
 * @private
 */
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  var tval = target[key];
  var sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone(sval);
  }
}
/**
 * @private
 */
function _deprecated(scope, value, previous, current) {
  if (value !== undefined) {
    console.warn(scope + ': "' + previous + '" is deprecated. Please use "' + current + '" instead');
  }
}
// resolveObjectKey resolver cache
var keyResolvers = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  '': function _(v) {
    return v;
  },
  // default resolvers
  x: function x(o) {
    return o.x;
  },
  y: function y(o) {
    return o.y;
  }
};
/**
 * @private
 */
function _splitKey(key) {
  var parts = key.split('.');
  var keys = [];
  var tmp = '';
  var _iterator = _createForOfIteratorHelper(parts),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var part = _step.value;
      tmp += part;
      if (tmp.endsWith('\\')) {
        tmp = tmp.slice(0, -1) + '.';
      } else {
        keys.push(tmp);
        tmp = '';
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return keys;
}
function _getKeyResolver(key) {
  var keys = _splitKey(key);
  return function (obj) {
    var _iterator2 = _createForOfIteratorHelper(keys),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var k = _step2.value;
        if (k === '') {
          break;
        }
        obj = obj && obj[k];
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    return obj;
  };
}
function resolveObjectKey(obj, key) {
  var resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}
/**
 * @private
 */
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
var defined = function defined(value) {
  return typeof value !== 'undefined';
};
var isFunction = function isFunction(value) {
  return typeof value === 'function';
};
// Adapted from https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality#31129384
var setsEqual = function setsEqual(a, b) {
  if (a.size !== b.size) {
    return false;
  }
  var _iterator3 = _createForOfIteratorHelper(a),
    _step3;
  try {
    for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
      var item = _step3.value;
      if (!b.has(item)) {
        return false;
      }
    }
  } catch (err) {
    _iterator3.e(err);
  } finally {
    _iterator3.f();
  }
  return true;
};
/**
 * @param e - The event
 * @private
 */
function _isClickEvent(e) {
  return e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu';
}

/**
 * @alias Chart.helpers.math
 * @namespace
 */
var PI = Math.PI;
var TAU = 2 * PI;
var PITAU = TAU + PI;
var INFINITY = Number.POSITIVE_INFINITY;
var RAD_PER_DEG = PI / 180;
var HALF_PI = PI / 2;
var QUARTER_PI = PI / 4;
var TWO_THIRDS_PI = PI * 2 / 3;
var log10 = Math.log10;
var sign = Math.sign;
function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}
/**
 * Implementation of the nice number algorithm used in determining where axis labels will go
 */
function niceNum(range) {
  var roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1000) ? roundedRange : range;
  var niceRange = Math.pow(10, Math.floor(log10(range)));
  var fraction = range / niceRange;
  var niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
/**
 * Returns an array of factors sorted from 1 to sqrt(value)
 * @private
 */
function _factorize(value) {
  var result = [];
  var sqrt = Math.sqrt(value);
  var i;
  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort(function (a, b) {
    return a - b;
  }).pop();
  return result;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
function almostWhole(x, epsilon) {
  var rounded = Math.round(x);
  return rounded - epsilon <= x && rounded + epsilon >= x;
}
/**
 * @private
 */
function _setMinAndMaxByKey(array, target, property) {
  var i, ilen, value;
  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
function toRadians(degrees) {
  return degrees * (PI / 180);
}
function toDegrees(radians) {
  return radians * (180 / PI);
}
/**
 * Returns the number of decimal places
 * i.e. the number of digits after the decimal point, of the value of this Number.
 * @param x - A number.
 * @returns The number of decimal places.
 * @private
 */
function _decimalPlaces(x) {
  if (!isNumberFinite(x)) {
    return;
  }
  var e = 1;
  var p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}
// Gets the angle from vertical upright to the point about a centre.
function getAngleFromPoint(centrePoint, anglePoint) {
  var distanceFromXCenter = anglePoint.x - centrePoint.x;
  var distanceFromYCenter = anglePoint.y - centrePoint.y;
  var radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
  }

  return {
    angle: angle,
    distance: radialDistanceFromCenter
  };
}
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
/**
 * Shortest distance between angles, in either direction.
 * @private
 */
function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}
/**
 * Normalize angle to be between 0 and 2*PI
 * @private
 */
function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}
/**
 * @private
 */
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  var a = _normalizeAngle(angle);
  var s = _normalizeAngle(start);
  var e = _normalizeAngle(end);
  var angleToStart = _normalizeAngle(s - a);
  var angleToEnd = _normalizeAngle(e - a);
  var startToAngle = _normalizeAngle(a - s);
  var endToAngle = _normalizeAngle(a - e);
  return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
/**
 * Limit `value` between `min` and `max`
 * @param value
 * @param min
 * @param max
 * @private
 */
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
/**
 * @param {number} value
 * @private
 */
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
/**
 * @param value
 * @param start
 * @param end
 * @param [epsilon]
 * @private
 */
function _isBetween(value, start, end) {
  var epsilon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1e-6;
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
function _lookup(table, value, cmp) {
  cmp = cmp || function (index) {
    return table[index] < value;
  };
  var hi = table.length - 1;
  var lo = 0;
  var mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return {
    lo: lo,
    hi: hi
  };
}
/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @param last - lookup last index
 * @private
 */
var _lookupByKey = function _lookupByKey(table, key, value, last) {
  return _lookup(table, value, last ? function (index) {
    var ti = table[index][key];
    return ti < value || ti === value && table[index + 1][key] === value;
  } : function (index) {
    return table[index][key] < value;
  });
};
/**
 * Reverse binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @private
 */
var _rlookupByKey = function _rlookupByKey(table, key, value) {
  return _lookup(table, value, function (index) {
    return table[index][key] >= value;
  });
};
/**
 * Return subset of `values` between `min` and `max` inclusive.
 * Values are assumed to be in sorted order.
 * @param values - sorted array of values
 * @param min - min value
 * @param max - max value
 */
function _filterBetween(values, min, max) {
  var start = 0;
  var end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
var arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, '_chartjs', {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [listener]
    }
  });
  arrayEvents.forEach(function (key) {
    var method = '_onData' + _capitalize(key);
    var base = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value: function value() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        var res = base.apply(this, args);
        array._chartjs.listeners.forEach(function (object) {
          if (typeof object[method] === 'function') {
            object[method].apply(object, args);
          }
        });
        return res;
      }
    });
  });
}
function unlistenArrayEvents(array, listener) {
  var stub = array._chartjs;
  if (!stub) {
    return;
  }
  var listeners = stub.listeners;
  var index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach(function (key) {
    delete array[key];
  });
  delete array._chartjs;
}
/**
 * @param items
 */
function _arrayUnique(items) {
  var set = new Set(items);
  if (set.size === items.length) {
    return items;
  }
  return Array.from(set);
}
function fontString(pixelSize, fontStyle, fontFamily) {
  return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
}
/**
* Request animation polyfill
*/
var requestAnimFrame = function () {
  if (typeof window === 'undefined') {
    return function (callback) {
      return callback();
    };
  }
  return window.requestAnimationFrame;
}();
/**
 * Throttles calling `fn` once per animation frame
 * Latest arguments are used on the actual call
 */
function throttled(fn, thisArg) {
  var argsToUse = [];
  var ticking = false;
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }
    // Save the args for use later
    argsToUse = args;
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, function () {
        ticking = false;
        fn.apply(thisArg, argsToUse);
      });
    }
  };
}
/**
 * Debounces calling `fn` for `delay` ms
 */
function debounce(fn, delay) {
  var timeout;
  return function () {
    for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
/**
 * Converts 'start' to 'left', 'end' to 'right' and others to 'center'
 * @private
 */
var _toLeftRightCenter = function _toLeftRightCenter(align) {
  return align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
};
/**
 * Returns `start`, `end` or `(start + end) / 2` depending on `align`. Defaults to `center`
 * @private
 */
var _alignStartEnd = function _alignStartEnd(align, start, end) {
  return align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
};
/**
 * Returns `left`, `right` or `(left + right) / 2` depending on `align`. Defaults to `left`
 * @private
 */
var _textX = function _textX(align, left, right, rtl) {
  var check = rtl ? 'left' : 'right';
  return align === check ? right : align === 'center' ? (left + right) / 2 : left;
};
/**
 * Return start and count of visible points.
 * @private
 */
function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  var pointCount = points.length;
  var start = 0;
  var count = pointCount;
  if (meta._sorted) {
    var iScale = meta.iScale,
      _parsed = meta._parsed;
    var axis = iScale.axis;
    var _iScale$getUserBounds = iScale.getUserBounds(),
      min = _iScale$getUserBounds.min,
      max = _iScale$getUserBounds.max,
      minDefined = _iScale$getUserBounds.minDefined,
      maxDefined = _iScale$getUserBounds.maxDefined;
    if (minDefined) {
      start = _limitValue(Math.min(
      // @ts-expect-error Need to type _parsed
      _lookupByKey(_parsed, axis, min).lo,
      // @ts-expect-error Need to fix types on _lookupByKey
      animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo), 0, pointCount - 1);
    }
    if (maxDefined) {
      count = _limitValue(Math.max(
      // @ts-expect-error Need to type _parsed
      _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
      // @ts-expect-error Need to fix types on _lookupByKey
      animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1), start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }
  return {
    start: start,
    count: count
  };
}
/**
 * Checks if the scale ranges have changed.
 * @param {object} meta - dataset meta.
 * @returns {boolean}
 * @private
 */
function _scaleRangesChanged(meta) {
  var xScale = meta.xScale,
    yScale = meta.yScale,
    _scaleRanges = meta._scaleRanges;
  var newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  var changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
var atEdge = function atEdge(t) {
  return t === 0 || t === 1;
};
var elasticIn = function elasticIn(t, s, p) {
  return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
};
var elasticOut = function elasticOut(t, s, p) {
  return Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
};
/**
 * Easing functions adapted from Robert Penner's easing equations.
 * @namespace Chart.helpers.easing.effects
 * @see http://www.robertpenner.com/easing/
 */
var effects = {
  linear: function linear(t) {
    return t;
  },
  easeInQuad: function easeInQuad(t) {
    return t * t;
  },
  easeOutQuad: function easeOutQuad(t) {
    return -t * (t - 2);
  },
  easeInOutQuad: function easeInOutQuad(t) {
    return (t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1);
  },
  easeInCubic: function easeInCubic(t) {
    return t * t * t;
  },
  easeOutCubic: function easeOutCubic(t) {
    return (t -= 1) * t * t + 1;
  },
  easeInOutCubic: function easeInOutCubic(t) {
    return (t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2);
  },
  easeInQuart: function easeInQuart(t) {
    return t * t * t * t;
  },
  easeOutQuart: function easeOutQuart(t) {
    return -((t -= 1) * t * t * t - 1);
  },
  easeInOutQuart: function easeInOutQuart(t) {
    return (t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2);
  },
  easeInQuint: function easeInQuint(t) {
    return t * t * t * t * t;
  },
  easeOutQuint: function easeOutQuint(t) {
    return (t -= 1) * t * t * t * t + 1;
  },
  easeInOutQuint: function easeInOutQuint(t) {
    return (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2);
  },
  easeInSine: function easeInSine(t) {
    return -Math.cos(t * HALF_PI) + 1;
  },
  easeOutSine: function easeOutSine(t) {
    return Math.sin(t * HALF_PI);
  },
  easeInOutSine: function easeInOutSine(t) {
    return -0.5 * (Math.cos(PI * t) - 1);
  },
  easeInExpo: function easeInExpo(t) {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
  },
  easeOutExpo: function easeOutExpo(t) {
    return t === 1 ? 1 : -Math.pow(2, -10 * t) + 1;
  },
  easeInOutExpo: function easeInOutExpo(t) {
    return atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2);
  },
  easeInCirc: function easeInCirc(t) {
    return t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1);
  },
  easeOutCirc: function easeOutCirc(t) {
    return Math.sqrt(1 - (t -= 1) * t);
  },
  easeInOutCirc: function easeInOutCirc(t) {
    return (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
  },
  easeInElastic: function easeInElastic(t) {
    return atEdge(t) ? t : elasticIn(t, 0.075, 0.3);
  },
  easeOutElastic: function easeOutElastic(t) {
    return atEdge(t) ? t : elasticOut(t, 0.075, 0.3);
  },
  easeInOutElastic: function easeInOutElastic(t) {
    var s = 0.1125;
    var p = 0.45;
    return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },
  easeInBack: function easeInBack(t) {
    var s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack: function easeOutBack(t) {
    var s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack: function easeInOutBack(t) {
    var s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
  },
  easeInBounce: function easeInBounce(t) {
    return 1 - effects.easeOutBounce(1 - t);
  },
  easeOutBounce: function easeOutBounce(t) {
    var m = 7.5625;
    var d = 2.75;
    if (t < 1 / d) {
      return m * t * t;
    }
    if (t < 2 / d) {
      return m * (t -= 1.5 / d) * t + 0.75;
    }
    if (t < 2.5 / d) {
      return m * (t -= 2.25 / d) * t + 0.9375;
    }
    return m * (t -= 2.625 / d) * t + 0.984375;
  },
  easeInOutBounce: function easeInOutBounce(t) {
    return t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5;
  }
};
function isPatternOrGradient(value) {
  if (value && _typeof(value) === 'object') {
    var type = value.toString();
    return type === '[object CanvasPattern]' || type === '[object CanvasGradient]';
  }
  return false;
}
function color(value) {
  return isPatternOrGradient(value) ? value : new _kurkle_color__WEBPACK_IMPORTED_MODULE_0__.Color(value);
}
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : new _kurkle_color__WEBPACK_IMPORTED_MODULE_0__.Color(value).saturate(0.5).darken(0.1).hexString();
}
var numbers = ['x', 'y', 'borderWidth', 'radius', 'tension'];
var colors = ['color', 'borderColor', 'backgroundColor'];
function applyAnimationsDefaults(defaults) {
  defaults.set('animation', {
    delay: undefined,
    duration: 1000,
    easing: 'easeOutQuart',
    fn: undefined,
    from: undefined,
    loop: undefined,
    to: undefined,
    type: undefined
  });
  defaults.describe('animation', {
    _fallback: false,
    _indexable: false,
    _scriptable: function _scriptable(name) {
      return name !== 'onProgress' && name !== 'onComplete' && name !== 'fn';
    }
  });
  defaults.set('animations', {
    colors: {
      type: 'color',
      properties: colors
    },
    numbers: {
      type: 'number',
      properties: numbers
    }
  });
  defaults.describe('animations', {
    _fallback: 'animation'
  });
  defaults.set('transitions', {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: 'transparent'
        },
        visible: {
          type: 'boolean',
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: 'transparent'
        },
        visible: {
          type: 'boolean',
          easing: 'linear',
          fn: function fn(v) {
            return v | 0;
          }
        }
      }
    }
  });
}
function applyLayoutsDefaults(defaults) {
  defaults.set('layout', {
    autoPadding: true,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
var intlCache = new Map();
function getNumberFormat(locale, options) {
  options = options || {};
  var cacheKey = locale + JSON.stringify(options);
  var formatter = intlCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    intlCache.set(cacheKey, formatter);
  }
  return formatter;
}
function formatNumber(num, locale, options) {
  return getNumberFormat(locale, options).format(num);
}
var formatters = {
  values: function values(value) {
    return isArray(value) ? value : '' + value;
  },
  numeric: function numeric(tickValue, index, ticks) {
    if (tickValue === 0) {
      return '0';
    }
    var locale = this.chart.options.locale;
    var notation;
    var delta = tickValue;
    if (ticks.length > 1) {
      var maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e+15) {
        notation = 'scientific';
      }
      delta = calculateDelta(tickValue, ticks);
    }
    var logDelta = log10(Math.abs(delta));
    var numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
    var options = {
      notation: notation,
      minimumFractionDigits: numDecimal,
      maximumFractionDigits: numDecimal
    };
    Object.assign(options, this.options.ticks.format);
    return formatNumber(tickValue, locale, options);
  },
  logarithmic: function logarithmic(tickValue, index, ticks) {
    if (tickValue === 0) {
      return '0';
    }
    var remain = ticks[index].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
    if ([1, 2, 3, 5, 10, 15].includes(remain) || index > 0.8 * ticks.length) {
      return formatters.numeric.call(this, tickValue, index, ticks);
    }
    return '';
  }
};
function calculateDelta(tickValue, ticks) {
  var delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
var Ticks = {
  formatters: formatters
};
function applyScaleDefaults(defaults) {
  defaults.set('scale', {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,
    bounds: 'ticks',
    clip: true,
    grace: 0,
    grid: {
      display: true,
      lineWidth: 1,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: function tickWidth(_ctx, options) {
        return options.lineWidth;
      },
      tickColor: function tickColor(_ctx, options) {
        return options.color;
      },
      offset: false
    },
    border: {
      display: true,
      dash: [],
      dashOffset: 0.0,
      width: 1
    },
    title: {
      display: false,
      text: '',
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: '',
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: 'center',
      crossAlign: 'near',
      showLabelBackdrop: false,
      backdropColor: 'rgba(255, 255, 255, 0.75)',
      backdropPadding: 2
    }
  });
  defaults.route('scale.ticks', 'color', '', 'color');
  defaults.route('scale.grid', 'color', '', 'borderColor');
  defaults.route('scale.border', 'color', '', 'borderColor');
  defaults.route('scale.title', 'color', '', 'color');
  defaults.describe('scale', {
    _fallback: false,
    _scriptable: function _scriptable(name) {
      return !name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser';
    },
    _indexable: function _indexable(name) {
      return name !== 'borderDash' && name !== 'tickBorderDash' && name !== 'dash';
    }
  });
  defaults.describe('scales', {
    _fallback: 'scale'
  });
  defaults.describe('scale.ticks', {
    _scriptable: function _scriptable(name) {
      return name !== 'backdropPadding' && name !== 'callback';
    },
    _indexable: function _indexable(name) {
      return name !== 'backdropPadding';
    }
  });
}
var overrides = Object.create(null);
var descriptors = Object.create(null);
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  var keys = key.split('.');
  for (var i = 0, n = keys.length; i < n; ++i) {
    var k = keys[i];
    node = node[k] || (node[k] = Object.create(null));
  }
  return node;
}
function _set(root, scope, values) {
  if (typeof scope === 'string') {
    return merge(getScope$1(root, scope), values);
  }
  return merge(getScope$1(root, ''), scope);
}
var Defaults = /*#__PURE__*/function () {
  function Defaults(_descriptors, _appliers) {
    _classCallCheck(this, Defaults);
    this.animation = undefined;
    this.backgroundColor = 'rgba(0,0,0,0.1)';
    this.borderColor = 'rgba(0,0,0,0.1)';
    this.color = '#666';
    this.datasets = {};
    this.devicePixelRatio = function (context) {
      return context.chart.platform.getDevicePixelRatio();
    };
    this.elements = {};
    this.events = ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: 'normal',
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = function (ctx, options) {
      return getHoverColor(options.backgroundColor);
    };
    this.hoverBorderColor = function (ctx, options) {
      return getHoverColor(options.borderColor);
    };
    this.hoverColor = function (ctx, options) {
      return getHoverColor(options.color);
    };
    this.indexAxis = 'x';
    this.interaction = {
      mode: 'nearest',
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = undefined;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;
    this.describe(_descriptors);
    this.apply(_appliers);
  }
  _createClass(Defaults, [{
    key: "set",
    value: function set(scope, values) {
      return _set(this, scope, values);
    }
  }, {
    key: "get",
    value: function get(scope) {
      return getScope$1(this, scope);
    }
  }, {
    key: "describe",
    value: function describe(scope, values) {
      return _set(descriptors, scope, values);
    }
  }, {
    key: "override",
    value: function override(scope, values) {
      return _set(overrides, scope, values);
    }
  }, {
    key: "route",
    value: function route(scope, name, targetScope, targetName) {
      var _Object$definePropert;
      var scopeObject = getScope$1(this, scope);
      var targetScopeObject = getScope$1(this, targetScope);
      var privateName = '_' + name;
      Object.defineProperties(scopeObject, (_Object$definePropert = {}, _defineProperty(_Object$definePropert, privateName, {
        value: scopeObject[name],
        writable: true
      }), _defineProperty(_Object$definePropert, name, {
        enumerable: true,
        get: function get() {
          var local = this[privateName];
          var target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set: function set(value) {
          this[privateName] = value;
        }
      }), _Object$definePropert));
    }
  }, {
    key: "apply",
    value: function apply(appliers) {
      var _this = this;
      appliers.forEach(function (apply) {
        return apply(_this);
      });
    }
  }]);
  return Defaults;
}();
var defaults = /* #__PURE__ */new Defaults({
  _scriptable: function _scriptable(name) {
    return !name.startsWith('on');
  },
  _indexable: function _indexable(name) {
    return name !== 'events';
  },
  hover: {
    _fallback: 'interaction'
  },
  interaction: {
    _scriptable: false,
    _indexable: false
  }
}, [applyAnimationsDefaults, applyLayoutsDefaults, applyScaleDefaults]);

/**
 * Converts the given font object into a CSS font string.
 * @param font - A font object.
 * @return The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
 * @private
 */
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + ' ' : '') + (font.weight ? font.weight + ' ' : '') + font.size + 'px ' + font.family;
}
/**
 * @private
 */
function _measureText(ctx, data, gc, longest, string) {
  var textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
/**
 * @private
 */ // eslint-disable-next-line complexity
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  var data = cache.data = cache.data || {};
  var gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  var longest = 0;
  var ilen = arrayOfThings.length;
  var i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];
    // Undefined strings and arrays should not be measured
    if (thing !== undefined && thing !== null && !isArray(thing)) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      // if it is an array lets measure each element
      // to do maybe simplify this function a bit so we can do this more recursively?
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        // Undefined strings and arrays should not be measured
        if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  var gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
/**
 * Returns the aligned pixel value to avoid anti-aliasing blur
 * @param chart - The chart instance.
 * @param pixel - A pixel value.
 * @param width - The width of the element.
 * @returns The aligned pixel value.
 * @private
 */
function _alignPixel(chart, pixel, width) {
  var devicePixelRatio = chart.currentDevicePixelRatio;
  var halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
}
/**
 * Clears the entire canvas.
 */
function clearCanvas(canvas, ctx) {
  ctx = ctx || canvas.getContext('2d');
  ctx.save();
  // canvas.width and canvas.height do not consider the canvas transform,
  // while clearRect does
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}
function drawPoint(ctx, options, x, y) {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  drawPointLegend(ctx, options, x, y, null);
}
// eslint-disable-next-line complexity
function drawPointLegend(ctx, options, x, y, w) {
  var type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
  var style = options.pointStyle;
  var rotation = options.rotation;
  var radius = options.radius;
  var rad = (rotation || 0) * RAD_PER_DEG;
  if (style && _typeof(style) === 'object') {
    type = style.toString();
    if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius) || radius <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    // Default includes circle
    default:
      if (w) {
        ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
      } else {
        ctx.arc(x, y, radius, 0, TAU);
      }
      ctx.closePath();
      break;
    case 'triangle':
      width = w ? w / 2 : radius;
      ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      ctx.closePath();
      break;
    case 'rectRounded':
      // NOTE: the rounded rect implementation changed to use `arc` instead of
      // `quadraticCurveTo` since it generates better results when rect is
      // almost a circle. 0.516 (instead of 0.5) produces results with visually
      // closer proportion to the previous impl and it is inscribed in the
      // circle with `radius`. For more details, see the following PRs:
      // https://github.com/chartjs/Chart.js/issues/5597
      // https://github.com/chartjs/Chart.js/issues/5858
      cornerRadius = radius * 0.516;
      size = radius - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case 'rect':
      if (!rotation) {
        size = Math.SQRT1_2 * radius;
        width = w ? w / 2 : size;
        ctx.rect(x - width, y - size, 2 * width, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    /* falls through */
    case 'rectRot':
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      ctx.closePath();
      break;
    case 'crossRot':
      rad += QUARTER_PI;
    /* falls through */
    case 'cross':
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case 'star':
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      rad += QUARTER_PI;
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case 'line':
      xOffset = w ? w / 2 : Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      break;
    case 'dash':
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
      break;
    case false:
      ctx.closePath();
      break;
  }
  ctx.fill();
  if (options.borderWidth > 0) {
    ctx.stroke();
  }
}
/**
 * Returns true if the point is inside the rectangle
 * @param point - The point to test
 * @param area - The rectangle
 * @param margin - allowed margin
 * @private
 */
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5; // margin - default is to match rounded decimals
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
function unclipArea(ctx) {
  ctx.restore();
}
/**
 * @private
 */
function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === 'middle') {
    var midpoint = (previous.x + target.x) / 2.0;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === 'after' !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
/**
 * @private
 */
function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    /**
    * Now that IE11 support has been dropped, we can use more
    * of the TextMetrics object. The actual bounding boxes
    * are unflagged in Chrome, Firefox, Edge, and Safari so they
    * can be safely used.
    * See https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#Browser_compatibility
    */
    var metrics = ctx.measureText(line);
    var left = x - metrics.actualBoundingBoxLeft;
    var right = x + metrics.actualBoundingBoxRight;
    var top = y - metrics.actualBoundingBoxAscent;
    var bottom = y + metrics.actualBoundingBoxDescent;
    var yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
function drawBackdrop(ctx, opts) {
  var oldColor = ctx.fillStyle;
  ctx.fillStyle = opts.color;
  ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
  ctx.fillStyle = oldColor;
}
/**
 * Render text onto the canvas
 */
function renderText(ctx, text, x, y, font) {
  var opts = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var lines = isArray(text) ? text : [text];
  var stroke = opts.strokeWidth > 0 && opts.strokeColor !== '';
  var i, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    if (opts.backdrop) {
      drawBackdrop(ctx, opts.backdrop);
    }
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x, y, opts.maxWidth);
    }
    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);
    y += Number(font.lineHeight);
  }
  ctx.restore();
}
/**
 * Add a path of a rectangle with rounded corners to the current sub-path
 * @param ctx - Context
 * @param rect - Bounding rect
 */
function addRoundedRectPath(ctx, rect) {
  var x = rect.x,
    y = rect.y,
    w = rect.w,
    h = rect.h,
    radius = rect.radius;
  // top left arc
  ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
  // line from top left to bottom left
  ctx.lineTo(x, y + h - radius.bottomLeft);
  // bottom left arc
  ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
  // line from bottom left to bottom right
  ctx.lineTo(x + w - radius.bottomRight, y + h);
  // bottom right arc
  ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
  // line from bottom right to top right
  ctx.lineTo(x + w, y + radius.topRight);
  // top right arc
  ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
  // line from top right to top left
  ctx.lineTo(x + radius.topLeft, y);
}
var LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
var FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
/**
 * @alias Chart.helpers.options
 * @namespace
 */ /**
    * Converts the given line height `value` in pixels for a specific font `size`.
    * @param value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
    * @param size - The font size (in pixels) used to resolve relative `value`.
    * @returns The effective line height in pixels (size * 1.2 if value is invalid).
    * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
    * @since 2.7.0
    */
function toLineHeight(value, size) {
  var matches = ('' + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === 'normal') {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case 'px':
      return value;
    case '%':
      value /= 100;
      break;
  }
  return size * value;
}
var numberOrZero = function numberOrZero(v) {
  return +v || 0;
};
function _readValueToProps(value, props) {
  var ret = {};
  var objProps = isObject(props);
  var keys = objProps ? Object.keys(props) : props;
  var read = isObject(value) ? objProps ? function (prop) {
    return valueOrDefault(value[prop], value[props[prop]]);
  } : function (prop) {
    return value[prop];
  } : function () {
    return value;
  };
  var _iterator4 = _createForOfIteratorHelper(keys),
    _step4;
  try {
    for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
      var prop = _step4.value;
      ret[prop] = numberOrZero(read(prop));
    }
  } catch (err) {
    _iterator4.e(err);
  } finally {
    _iterator4.f();
  }
  return ret;
}
/**
 * Converts the given value into a TRBL object.
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left)
 * @since 3.0.0
 */
function toTRBL(value) {
  return _readValueToProps(value, {
    top: 'y',
    right: 'x',
    bottom: 'y',
    left: 'x'
  });
}
/**
 * Converts the given value into a TRBL corners object (similar with css border-radius).
 * @param value - If a number, set the value to all TRBL corner components,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 * @returns The TRBL corner values (topLeft, topRight, bottomLeft, bottomRight)
 * @since 3.0.0
 */
function toTRBLCorners(value) {
  return _readValueToProps(value, ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']);
}
/**
 * Converts the given value into a padding object with pre-computed width/height.
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left, width, height)
 * @since 2.7.0
 */
function toPadding(value) {
  var obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
/**
 * Parses font options and returns the font object.
 * @param options - A object that contains font options to be parsed.
 * @param fallback - A object that contains fallback font options.
 * @return The font object.
 * @private
 */
function toFont(options, fallback) {
  options = options || {};
  fallback = fallback || defaults.font;
  var size = valueOrDefault(options.size, fallback.size);
  if (typeof size === 'string') {
    size = parseInt(size, 10);
  }
  var style = valueOrDefault(options.style, fallback.style);
  if (style && !('' + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = undefined;
  }
  var font = {
    family: valueOrDefault(options.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
    size: size,
    style: style,
    weight: valueOrDefault(options.weight, fallback.weight),
    string: ''
  };
  font.string = toFontString(font);
  return font;
}
/**
 * Evaluates the given `inputs` sequentially and returns the first defined value.
 * @param inputs - An array of values, falling back to the last value.
 * @param context - If defined and the current value is a function, the value
 * is called with `context` as first argument and the result becomes the new input.
 * @param index - If defined and the current value is an array, the value
 * at `index` become the new input.
 * @param info - object to return information about resolution in
 * @param info.cacheable - Will be set to `false` if option is not cacheable.
 * @since 2.7.0
 */
function resolve(inputs, context, index, info) {
  var cacheable = true;
  var i, ilen, value;
  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === undefined) {
      continue;
    }
    if (context !== undefined && typeof value === 'function') {
      value = value(context);
      cacheable = false;
    }
    if (index !== undefined && isArray(value)) {
      value = value[index % value.length];
      cacheable = false;
    }
    if (value !== undefined) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}
/**
 * @param minmax
 * @param grace
 * @param beginAtZero
 * @private
 */
function _addGrace(minmax, grace, beginAtZero) {
  var min = minmax.min,
    max = minmax.max;
  var change = toDimension(grace, (max - min) / 2);
  var keepZero = function keepZero(value, add) {
    return beginAtZero && value === 0 ? 0 : value + add;
  };
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}

/**
 * Creates a Proxy for resolving raw values for options.
 * @param scopes - The option scopes to look for values, in resolution order
 * @param prefixes - The prefixes for values, in resolution order.
 * @param rootScopes - The root option scopes
 * @param fallback - Parent scopes fallback
 * @param getTarget - callback for getting the target for changed values
 * @returns Proxy
 * @private
 */
function _createResolver(scopes) {
  var _cache;
  var prefixes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [''];
  var rootScopes = arguments.length > 2 ? arguments[2] : undefined;
  var fallback = arguments.length > 3 ? arguments[3] : undefined;
  var getTarget = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : function () {
    return scopes[0];
  };
  var finalRootScopes = rootScopes || scopes;
  if (typeof fallback === 'undefined') {
    fallback = _resolve('_fallback', scopes);
  }
  var cache = (_cache = {}, _defineProperty(_cache, Symbol.toStringTag, 'Object'), _defineProperty(_cache, "_cacheable", true), _defineProperty(_cache, "_scopes", scopes), _defineProperty(_cache, "_rootScopes", finalRootScopes), _defineProperty(_cache, "_fallback", fallback), _defineProperty(_cache, "_getTarget", getTarget), _defineProperty(_cache, "override", function override(scope) {
    return _createResolver([scope].concat(_toConsumableArray(scopes)), prefixes, finalRootScopes, fallback);
  }), _cache);
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty: function deleteProperty(target, prop) {
      delete target[prop]; // remove from cache
      delete target._keys; // remove cached keys
      delete scopes[0][prop]; // remove from top level scope
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get: function get(target, prop) {
      return _cached(target, prop, function () {
        return _resolveWithPrefixes(prop, prefixes, scopes, target);
      });
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    /**
    * A trap for the in operator.
    */
    has: function has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys: function ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    /**
    * A trap for setting property values.
    */
    set: function set(target, prop, value) {
      var storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value; // set to top level scope + cache
      delete target._keys; // remove cached keys
      return true;
    }
  });
}
/**
 * Returns an Proxy for resolving option values with context.
 * @param proxy - The Proxy returned by `_createResolver`
 * @param context - Context object for scriptable/indexable options
 * @param subProxy - The proxy provided for scriptable options
 * @param descriptorDefaults - Defaults for descriptors
 * @private
 */
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  var cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: function setContext(ctx) {
      return _attachContext(proxy, ctx, subProxy, descriptorDefaults);
    },
    override: function override(scope) {
      return _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults);
    }
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty: function deleteProperty(target, prop) {
      delete target[prop]; // remove from cache
      delete proxy[prop]; // remove from proxy
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get: function get(target, prop, receiver) {
      return _cached(target, prop, function () {
        return _resolveWithContext(target, prop, receiver);
      });
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor: function getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
        enumerable: true,
        configurable: true
      } : undefined : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf: function getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    /**
    * A trap for the in operator.
    */
    has: function has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys: function ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    /**
    * A trap for setting property values.
    */
    set: function set(target, prop, value) {
      proxy[prop] = value; // set to proxy
      delete target[prop]; // remove from cache
      return true;
    }
  });
}
/**
 * @private
 */
function _descriptors(proxy) {
  var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
    scriptable: true,
    indexable: true
  };
  var _proxy$_scriptable = proxy._scriptable,
    _scriptable = _proxy$_scriptable === void 0 ? defaults.scriptable : _proxy$_scriptable,
    _proxy$_indexable = proxy._indexable,
    _indexable = _proxy$_indexable === void 0 ? defaults.indexable : _proxy$_indexable,
    _proxy$_allKeys = proxy._allKeys,
    _allKeys = _proxy$_allKeys === void 0 ? defaults.allKeys : _proxy$_allKeys;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : function () {
      return _scriptable;
    },
    isIndexable: isFunction(_indexable) ? _indexable : function () {
      return _indexable;
    }
  };
}
var readKey = function readKey(prefix, name) {
  return prefix ? prefix + _capitalize(name) : name;
};
var needsSubResolver = function needsSubResolver(prop, value) {
  return isObject(value) && prop !== 'adapters' && (Object.getPrototypeOf(value) === null || value.constructor === Object);
};
function _cached(target, prop, resolve) {
  if (Object.prototype.hasOwnProperty.call(target, prop)) {
    return target[prop];
  }
  var value = resolve();
  // cache the resolved value
  target[prop] = value;
  return value;
}
function _resolveWithContext(target, prop, receiver) {
  var _proxy = target._proxy,
    _context = target._context,
    _subProxy = target._subProxy,
    descriptors = target._descriptors;
  var value = _proxy[prop]; // resolve from proxy
  // resolve with context
  if (isFunction(value) && descriptors.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    // if the resolved value is an object, create a sub resolver for it
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors);
  }
  return value;
}
function _resolveScriptable(prop, getValue, target, receiver) {
  var _proxy = target._proxy,
    _context = target._context,
    _subProxy = target._subProxy,
    _stack = target._stack;
  if (_stack.has(prop)) {
    throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop);
  }
  _stack.add(prop);
  var value = getValue(_context, _subProxy || receiver);
  _stack["delete"](prop);
  if (needsSubResolver(prop, value)) {
    // When scriptable option returns an object, create a resolver on that.
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
function _resolveArray(prop, value, target, isIndexable) {
  var _proxy = target._proxy,
    _context = target._context,
    _subProxy = target._subProxy,
    descriptors = target._descriptors;
  if (typeof _context.index !== 'undefined' && isIndexable(prop)) {
    return value[_context.index % value.length];
  } else if (isObject(value[0])) {
    // Array of objects, return array or resolvers
    var arr = value;
    var scopes = _proxy._scopes.filter(function (s) {
      return s !== arr;
    });
    value = [];
    var _iterator5 = _createForOfIteratorHelper(arr),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var item = _step5.value;
        var resolver = createSubResolver(scopes, _proxy, prop, item);
        value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors));
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
  }
  return value;
}
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
var getScope = function getScope(key, parent) {
  return key === true ? parent : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;
};
function addScopes(set, parentScopes, key, parentFallback, value) {
  var _iterator6 = _createForOfIteratorHelper(parentScopes),
    _step6;
  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var parent = _step6.value;
      var scope = getScope(key, parent);
      if (scope) {
        set.add(scope);
        var fallback = resolveFallback(scope._fallback, key, value);
        if (typeof fallback !== 'undefined' && fallback !== key && fallback !== parentFallback) {
          // When we reach the descriptor that defines a new _fallback, return that.
          // The fallback will resume to that new scope.
          return fallback;
        }
      } else if (scope === false && typeof parentFallback !== 'undefined' && key !== parentFallback) {
        // Fallback to `false` results to `false`, when falling back to different key.
        // For example `interaction` from `hover` or `plugins.tooltip` and `animation` from `animations`
        return null;
      }
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
  return false;
}
function createSubResolver(parentScopes, resolver, prop, value) {
  var rootScopes = resolver._rootScopes;
  var fallback = resolveFallback(resolver._fallback, prop, value);
  var allScopes = [].concat(_toConsumableArray(parentScopes), _toConsumableArray(rootScopes));
  var set = new Set();
  set.add(value);
  var key = addScopesFromKey(set, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (typeof fallback !== 'undefined' && fallback !== prop) {
    key = addScopesFromKey(set, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set), [''], rootScopes, fallback, function () {
    return subGetTarget(resolver, prop, value);
  });
}
function addScopesFromKey(set, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set, allScopes, key, fallback, item);
  }
  return key;
}
function subGetTarget(resolver, prop, value) {
  var parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  var target = parent[prop];
  if (isArray(target) && isObject(value)) {
    // For array of objects, the object is used to store updated values
    return value;
  }
  return target || {};
}
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  var value;
  var _iterator7 = _createForOfIteratorHelper(prefixes),
    _step7;
  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var prefix = _step7.value;
      value = _resolve(readKey(prefix, prop), scopes);
      if (typeof value !== 'undefined') {
        return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
      }
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }
}
function _resolve(key, scopes) {
  var _iterator8 = _createForOfIteratorHelper(scopes),
    _step8;
  try {
    for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
      var scope = _step8.value;
      if (!scope) {
        continue;
      }
      var value = scope[key];
      if (typeof value !== 'undefined') {
        return value;
      }
    }
  } catch (err) {
    _iterator8.e(err);
  } finally {
    _iterator8.f();
  }
}
function getKeysFromAllScopes(target) {
  var keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
function resolveKeysFromAllScopes(scopes) {
  var set = new Set();
  var _iterator9 = _createForOfIteratorHelper(scopes),
    _step9;
  try {
    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
      var scope = _step9.value;
      var _iterator10 = _createForOfIteratorHelper(Object.keys(scope).filter(function (k) {
          return !k.startsWith('_');
        })),
        _step10;
      try {
        for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
          var key = _step10.value;
          set.add(key);
        }
      } catch (err) {
        _iterator10.e(err);
      } finally {
        _iterator10.f();
      }
    }
  } catch (err) {
    _iterator9.e(err);
  } finally {
    _iterator9.f();
  }
  return Array.from(set);
}
function _parseObjectDataRadialScale(meta, data, start, count) {
  var iScale = meta.iScale;
  var _this$_parsing$key = this._parsing.key,
    key = _this$_parsing$key === void 0 ? 'r' : _this$_parsing$key;
  var parsed = new Array(count);
  var i, ilen, index, item;
  for (i = 0, ilen = count; i < ilen; ++i) {
    index = i + start;
    item = data[index];
    parsed[i] = {
      r: iScale.parse(resolveObjectKey(item, key), index)
    };
  }
  return parsed;
}
var EPSILON = Number.EPSILON || 1e-14;
var getPoint = function getPoint(points, i) {
  return i < points.length && !points[i].skip && points[i];
};
var getValueAxis = function getValueAxis(indexAxis) {
  return indexAxis === 'x' ? 'y' : 'x';
};
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
  // Props to Rob Spencer at scaled innovation for his post on splining between points
  // http://scaledinnovation.com/analytics/splines/aboutSplines.html
  // This function must also respect "skipped" points
  var previous = firstPoint.skip ? middlePoint : firstPoint;
  var current = middlePoint;
  var next = afterPoint.skip ? middlePoint : afterPoint;
  var d01 = distanceBetweenPoints(current, previous);
  var d12 = distanceBetweenPoints(next, current);
  var s01 = d01 / (d01 + d12);
  var s12 = d12 / (d01 + d12);
  // If all points are the same, s01 & s02 will be inf
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  var fa = t * s01; // scaling factor for triangle Ta
  var fb = t * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
/**
 * Adjust tangents to ensure monotonic properties
 */
function monotoneAdjust(points, deltaK, mK) {
  var pointsLen = points.length;
  var alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  var pointAfter = getPoint(points, 0);
  for (var i = 0; i < pointsLen - 1; ++i) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i], 0, EPSILON)) {
      mK[i] = mK[i + 1] = 0;
      continue;
    }
    alphaK = mK[i] / deltaK[i];
    betaK = mK[i + 1] / deltaK[i];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i] = alphaK * tauK * deltaK[i];
    mK[i + 1] = betaK * tauK * deltaK[i];
  }
}
function monotoneCompute(points, mK) {
  var indexAxis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'x';
  var valueAxis = getValueAxis(indexAxis);
  var pointsLen = points.length;
  var delta, pointBefore, pointCurrent;
  var pointAfter = getPoint(points, 0);
  for (var i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    var iPixel = pointCurrent[indexAxis];
    var vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent["cp1".concat(indexAxis)] = iPixel - delta;
      pointCurrent["cp1".concat(valueAxis)] = vPixel - delta * mK[i];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent["cp2".concat(indexAxis)] = iPixel + delta;
      pointCurrent["cp2".concat(valueAxis)] = vPixel + delta * mK[i];
    }
  }
}
/**
 * This function calculates Bézier control points in a similar way than |splineCurve|,
 * but preserves monotonicity of the provided data and ensures no local extremums are added
 * between the dataset discrete points due to the interpolation.
 * See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
 */
function splineCurveMonotone(points) {
  var indexAxis = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'x';
  var valueAxis = getValueAxis(indexAxis);
  var pointsLen = points.length;
  var deltaK = Array(pointsLen).fill(0);
  var mK = Array(pointsLen);
  // Calculate slopes (deltaK) and initialize tangents (mK)
  var i, pointBefore, pointCurrent;
  var pointAfter = getPoint(points, 0);
  for (i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      var slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      // In the case of two points that appear at the same x pixel, slopeDeltaX is 0
      deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
function capBezierPoints(points, area) {
  var i, ilen, point, inArea, inAreaPrev;
  var inAreaNext = _isPointInArea(points[0], area);
  for (i = 0, ilen = points.length; i < ilen; ++i) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
/**
 * @private
 */
function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
  var i, ilen, point, controlPoints;
  // Only consider points that are drawn in case the spanGaps option is used
  if (options.spanGaps) {
    points = points.filter(function (pt) {
      return !pt.skip;
    });
  }
  if (options.cubicInterpolationMode === 'monotone') {
    splineCurveMonotone(points, indexAxis);
  } else {
    var prev = loop ? points[points.length - 1] : points[0];
    for (i = 0, ilen = points.length; i < ilen; ++i) {
      point = points[i];
      controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options.capBezierPoints) {
    capBezierPoints(points, area);
  }
}

/**
 * Note: typedefs are auto-exported, so use a made-up `dom` namespace where
 * necessary to avoid duplicates with `export * from './helpers`; see
 * https://github.com/microsoft/TypeScript/issues/46011
 * @typedef { import('../core/core.controller.js').default } dom.Chart
 * @typedef { import('../../types').ChartEvent } ChartEvent
 */ /**
    * @private
    */
function _isDomSupported() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
/**
 * @private
 */
function _getParentNode(domNode) {
  var parent = domNode.parentNode;
  if (parent && parent.toString() === '[object ShadowRoot]') {
    parent = parent.host;
  }
  return parent;
}
/**
 * convert max-width/max-height values that may be percentages into a number
 * @private
 */
function parseMaxStyle(styleValue, node, parentProperty) {
  var valueInPixels;
  if (typeof styleValue === 'string') {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf('%') !== -1) {
      // percentage * size in dimension
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
var getComputedStyle = function getComputedStyle(element) {
  return element.ownerDocument.defaultView.getComputedStyle(element, null);
};
function getStyle(el, property) {
  return getComputedStyle(el).getPropertyValue(property);
}
var positions = ['top', 'right', 'bottom', 'left'];
function getPositionedStyle(styles, style, suffix) {
  var result = {};
  suffix = suffix ? '-' + suffix : '';
  for (var i = 0; i < 4; i++) {
    var pos = positions[i];
    result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
var useOffsetPos = function useOffsetPos(x, y, target) {
  return (x > 0 || y > 0) && (!target || !target.shadowRoot);
};
/**
 * @param e
 * @param canvas
 * @returns Canvas position
 */
function getCanvasPosition(e, canvas) {
  var touches = e.touches;
  var source = touches && touches.length ? touches[0] : e;
  var offsetX = source.offsetX,
    offsetY = source.offsetY;
  var box = false;
  var x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    var rect = canvas.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return {
    x: x,
    y: y,
    box: box
  };
}
/**
 * Gets an event's x, y coordinates, relative to the chart area
 * @param event
 * @param chart
 * @returns x and y coordinates of the event
 */
function getRelativePosition(event, chart) {
  if ('native' in event) {
    return event;
  }
  var canvas = chart.canvas,
    currentDevicePixelRatio = chart.currentDevicePixelRatio;
  var style = getComputedStyle(canvas);
  var borderBox = style.boxSizing === 'border-box';
  var paddings = getPositionedStyle(style, 'padding');
  var borders = getPositionedStyle(style, 'border', 'width');
  var _getCanvasPosition = getCanvasPosition(event, canvas),
    x = _getCanvasPosition.x,
    y = _getCanvasPosition.y,
    box = _getCanvasPosition.box;
  var xOffset = paddings.left + (box && borders.left);
  var yOffset = paddings.top + (box && borders.top);
  var width = chart.width,
    height = chart.height;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
  };
}
function getContainerSize(canvas, width, height) {
  var maxWidth, maxHeight;
  if (width === undefined || height === undefined) {
    var container = _getParentNode(canvas);
    if (!container) {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
    } else {
      var rect = container.getBoundingClientRect(); // this is the border box of the container
      var containerStyle = getComputedStyle(container);
      var containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
      var containerPadding = getPositionedStyle(containerStyle, 'padding');
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
    }
  }
  return {
    width: width,
    height: height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
var round1 = function round1(v) {
  return Math.round(v * 10) / 10;
};
// eslint-disable-next-line complexity
function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
  var style = getComputedStyle(canvas);
  var margins = getPositionedStyle(style, 'margin');
  var maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
  var maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
  var containerSize = getContainerSize(canvas, bbWidth, bbHeight);
  var width = containerSize.width,
    height = containerSize.height;
  if (style.boxSizing === 'content-box') {
    var borders = getPositionedStyle(style, 'border', 'width');
    var paddings = getPositionedStyle(style, 'padding');
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    // https://github.com/chartjs/Chart.js/issues/4659
    // If the canvas has width, but no height, default to aspectRatio of 2 (canvas default)
    height = round1(width / 2);
  }
  var maintainHeight = bbWidth !== undefined || bbHeight !== undefined;
  if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
    height = containerSize.height;
    width = round1(Math.floor(height * aspectRatio));
  }
  return {
    width: width,
    height: height
  };
}
/**
 * @param chart
 * @param forceRatio
 * @param forceStyle
 * @returns True if the canvas context size or transformation has changed.
 */
function retinaScale(chart, forceRatio, forceStyle) {
  var pixelRatio = forceRatio || 1;
  var deviceHeight = Math.floor(chart.height * pixelRatio);
  var deviceWidth = Math.floor(chart.width * pixelRatio);
  chart.height = Math.floor(chart.height);
  chart.width = Math.floor(chart.width);
  var canvas = chart.canvas;
  // If no style has been set on the canvas, the render size is used as display size,
  // making the chart visually bigger, so let's enforce it to the "correct" values.
  // See https://github.com/chartjs/Chart.js/issues/3575
  if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
    canvas.style.height = "".concat(chart.height, "px");
    canvas.style.width = "".concat(chart.width, "px");
  }
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas.height = deviceHeight;
    canvas.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
/**
 * Detects support for options object argument in addEventListener.
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
 * @private
 */
var supportsEventListenerOptions = function () {
  var passiveSupported = false;
  try {
    var options = {
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    window.addEventListener('test', null, options);
    window.removeEventListener('test', null, options);
  } catch (e) {
    // continue regardless of error
  }
  return passiveSupported;
}();
/**
 * The "used" size is the final value of a dimension property after all calculations have
 * been performed. This method uses the computed style of `element` but returns undefined
 * if the computed style is not expressed in pixels. That can happen in some cases where
 * `element` has a size relative to its parent and this last one is not yet displayed,
 * for example because of `display: none` on a parent node.
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 * @returns Size in pixels or undefined if unknown.
 */
function readUsedSize(element, property) {
  var value = getStyle(element, property);
  var matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : undefined;
}

/**
 * @private
 */
function _pointInLine(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
/**
 * @private
 */
function _steppedInterpolation(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y : mode === 'after' ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
  };
}
/**
 * @private
 */
function _bezierInterpolation(p1, p2, t, mode) {
  var cp1 = {
    x: p1.cp2x,
    y: p1.cp2y
  };
  var cp2 = {
    x: p2.cp1x,
    y: p2.cp1y
  };
  var a = _pointInLine(p1, cp1, t);
  var b = _pointInLine(cp1, cp2, t);
  var c = _pointInLine(cp2, p2, t);
  var d = _pointInLine(a, b, t);
  var e = _pointInLine(b, c, t);
  return _pointInLine(d, e, t);
}
var getRightToLeftAdapter = function getRightToLeftAdapter(rectX, width) {
  return {
    x: function x(_x) {
      return rectX + rectX + width - _x;
    },
    setWidth: function setWidth(w) {
      width = w;
    },
    textAlign: function textAlign(align) {
      if (align === 'center') {
        return align;
      }
      return align === 'right' ? 'left' : 'right';
    },
    xPlus: function xPlus(x, value) {
      return x - value;
    },
    leftForLtr: function leftForLtr(x, itemWidth) {
      return x - itemWidth;
    }
  };
};
var getLeftToRightAdapter = function getLeftToRightAdapter() {
  return {
    x: function x(_x2) {
      return _x2;
    },
    setWidth: function setWidth(w) {},
    textAlign: function textAlign(align) {
      return align;
    },
    xPlus: function xPlus(x, value) {
      return x + value;
    },
    leftForLtr: function leftForLtr(x, _itemWidth) {
      return x;
    }
  };
};
function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
function overrideTextDirection(ctx, direction) {
  var style, original;
  if (direction === 'ltr' || direction === 'rtl') {
    style = ctx.canvas.style;
    original = [style.getPropertyValue('direction'), style.getPropertyPriority('direction')];
    style.setProperty('direction', direction, 'important');
    ctx.prevTextDirection = original;
  }
}
function restoreTextDirection(ctx, original) {
  if (original !== undefined) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty('direction', original[0], original[1]);
  }
}
function propertyFn(property) {
  if (property === 'angle') {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: function compare(a, b) {
      return a - b;
    },
    normalize: function normalize(x) {
      return x;
    }
  };
}
function normalizeSegment(_ref) {
  var start = _ref.start,
    end = _ref.end,
    count = _ref.count,
    loop = _ref.loop,
    style = _ref.style;
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style: style
  };
}
function getSegment(segment, points, bounds) {
  var property = bounds.property,
    startBound = bounds.start,
    endBound = bounds.end;
  var _propertyFn = propertyFn(property),
    between = _propertyFn.between,
    normalize = _propertyFn.normalize;
  var count = points.length;
  var start = segment.start,
    end = segment.end,
    loop = segment.loop;
  var i, ilen;
  if (loop) {
    start += count;
    end += count;
    for (i = 0, ilen = count; i < ilen; ++i) {
      if (!between(normalize(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return {
    start: start,
    end: end,
    loop: loop,
    style: segment.style
  };
}
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [segment];
  }
  var property = bounds.property,
    startBound = bounds.start,
    endBound = bounds.end;
  var count = points.length;
  var _propertyFn2 = propertyFn(property),
    compare = _propertyFn2.compare,
    between = _propertyFn2.between,
    normalize = _propertyFn2.normalize;
  var _getSegment = getSegment(segment, points, bounds),
    start = _getSegment.start,
    end = _getSegment.end,
    loop = _getSegment.loop,
    style = _getSegment.style;
  var result = [];
  var inside = false;
  var subStart = null;
  var value, point, prevValue;
  var startIsBefore = function startIsBefore() {
    return between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
  };
  var endIsBefore = function endIsBefore() {
    return compare(endBound, value) === 0 || between(endBound, prevValue, value);
  };
  var shouldStart = function shouldStart() {
    return inside || startIsBefore();
  };
  var shouldStop = function shouldStop() {
    return !inside || endIsBefore();
  };
  for (var i = start, prev = start; i <= end; ++i) {
    point = points[i % count];
    if (point.skip) {
      continue;
    }
    value = normalize(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({
        start: subStart,
        end: i,
        loop: loop,
        count: count,
        style: style
      }));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({
      start: subStart,
      end: end,
      loop: loop,
      count: count,
      style: style
    }));
  }
  return result;
}
function _boundSegments(line, bounds) {
  var result = [];
  var segments = line.segments;
  for (var i = 0; i < segments.length; i++) {
    var sub = _boundSegment(segments[i], line.points, bounds);
    if (sub.length) {
      result.push.apply(result, _toConsumableArray(sub));
    }
  }
  return result;
}
function findStartAndEnd(points, count, loop, spanGaps) {
  var start = 0;
  var end = count - 1;
  if (loop && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return {
    start: start,
    end: end
  };
}
function solidSegments(points, start, max, loop) {
  var count = points.length;
  var result = [];
  var last = start;
  var prev = points[start];
  var end;
  for (end = start + 1; end <= max; ++end) {
    var cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({
          start: start % count,
          end: (end - 1) % count,
          loop: loop
        });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({
      start: start % count,
      end: last % count,
      loop: loop
    });
  }
  return result;
}
function _computeSegments(line, segmentOptions) {
  var points = line.points;
  var spanGaps = line.options.spanGaps;
  var count = points.length;
  if (!count) {
    return [];
  }
  var loop = !!line._loop;
  var _findStartAndEnd = findStartAndEnd(points, count, loop, spanGaps),
    start = _findStartAndEnd.start,
    end = _findStartAndEnd.end;
  if (spanGaps === true) {
    return splitByStyles(line, [{
      start: start,
      end: end,
      loop: loop
    }], points, segmentOptions);
  }
  var max = end < start ? end + count : end;
  var completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
function doSplitByStyles(line, segments, points, segmentOptions) {
  var chartContext = line._chart.getContext();
  var baseStyle = readStyle(line.options);
  var datasetIndex = line._datasetIndex,
    spanGaps = line.options.spanGaps;
  var count = points.length;
  var result = [];
  var prevStyle = baseStyle;
  var start = segments[0].start;
  var i = start;
  function addStyle(s, e, l, st) {
    var dir = spanGaps ? -1 : 1;
    if (s === e) {
      return;
    }
    s += count;
    while (points[s % count].skip) {
      s -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s % count !== e % count) {
      result.push({
        start: s % count,
        end: e % count,
        loop: l,
        style: st
      });
      prevStyle = st;
      start = e % count;
    }
  }
  var _iterator11 = _createForOfIteratorHelper(segments),
    _step11;
  try {
    for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
      var segment = _step11.value;
      start = spanGaps ? start : segment.start;
      var prev = points[start % count];
      var style = void 0;
      for (i = start + 1; i <= segment.end; i++) {
        var pt = points[i % count];
        style = readStyle(segmentOptions.setContext(createContext(chartContext, {
          type: 'segment',
          p0: prev,
          p1: pt,
          p0DataIndex: (i - 1) % count,
          p1DataIndex: i % count,
          datasetIndex: datasetIndex
        })));
        if (styleChanged(style, prevStyle)) {
          addStyle(start, i - 1, segment.loop, prevStyle);
        }
        prev = pt;
        prevStyle = style;
      }
      if (start < i - 1) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
    }
  } catch (err) {
    _iterator11.e(err);
  } finally {
    _iterator11.f();
  }
  return result;
}
function readStyle(options) {
  return {
    backgroundColor: options.backgroundColor,
    borderCapStyle: options.borderCapStyle,
    borderDash: options.borderDash,
    borderDashOffset: options.borderDashOffset,
    borderJoinStyle: options.borderJoinStyle,
    borderWidth: options.borderWidth,
    borderColor: options.borderColor
  };
}
function styleChanged(style, prevStyle) {
  if (!prevStyle) {
    return false;
  }
  var cache = [];
  var replacer = function replacer(key, value) {
    if (!isPatternOrGradient(value)) {
      return value;
    }
    if (!cache.includes(value)) {
      cache.push(value);
    }
    return cache.indexOf(value);
  };
  return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
}


/***/ }),

/***/ "./node_modules/chart.js/dist/helpers.js":
/*!***********************************************!*\
  !*** ./node_modules/chart.js/dist/helpers.js ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HALF_PI: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.H),
/* harmony export */   INFINITY: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b2),
/* harmony export */   PI: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.P),
/* harmony export */   PITAU: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b1),
/* harmony export */   QUARTER_PI: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b4),
/* harmony export */   RAD_PER_DEG: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b3),
/* harmony export */   TAU: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.T),
/* harmony export */   TWO_THIRDS_PI: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b5),
/* harmony export */   _addGrace: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.R),
/* harmony export */   _alignPixel: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.X),
/* harmony export */   _alignStartEnd: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a2),
/* harmony export */   _angleBetween: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.p),
/* harmony export */   _angleDiff: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b6),
/* harmony export */   _arrayUnique: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__._),
/* harmony export */   _attachContext: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a8),
/* harmony export */   _bezierCurveTo: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.as),
/* harmony export */   _bezierInterpolation: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ap),
/* harmony export */   _boundSegment: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ax),
/* harmony export */   _boundSegments: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.an),
/* harmony export */   _capitalize: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a5),
/* harmony export */   _computeSegments: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.am),
/* harmony export */   _createResolver: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a9),
/* harmony export */   _decimalPlaces: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aK),
/* harmony export */   _deprecated: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aV),
/* harmony export */   _descriptors: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aa),
/* harmony export */   _elementsEqual: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ah),
/* harmony export */   _factorize: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.N),
/* harmony export */   _filterBetween: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aO),
/* harmony export */   _getParentNode: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.I),
/* harmony export */   _getStartAndCountOfVisiblePoints: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.q),
/* harmony export */   _int16Range: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.W),
/* harmony export */   _isBetween: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aj),
/* harmony export */   _isClickEvent: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ai),
/* harmony export */   _isDomSupported: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.M),
/* harmony export */   _isPointInArea: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.C),
/* harmony export */   _limitValue: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.S),
/* harmony export */   _longestText: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aN),
/* harmony export */   _lookup: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aP),
/* harmony export */   _lookupByKey: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.B),
/* harmony export */   _measureText: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.V),
/* harmony export */   _merger: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aT),
/* harmony export */   _mergerIf: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aU),
/* harmony export */   _normalizeAngle: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ay),
/* harmony export */   _parseObjectDataRadialScale: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.y),
/* harmony export */   _pointInLine: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aq),
/* harmony export */   _readValueToProps: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ak),
/* harmony export */   _rlookupByKey: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.A),
/* harmony export */   _scaleRangesChanged: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.w),
/* harmony export */   _setMinAndMaxByKey: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aG),
/* harmony export */   _splitKey: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aW),
/* harmony export */   _steppedInterpolation: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ao),
/* harmony export */   _steppedLineTo: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ar),
/* harmony export */   _textX: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aB),
/* harmony export */   _toLeftRightCenter: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a1),
/* harmony export */   _updateBezierControlPoints: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.al),
/* harmony export */   addRoundedRectPath: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.au),
/* harmony export */   almostEquals: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aJ),
/* harmony export */   almostWhole: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aI),
/* harmony export */   callback: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Q),
/* harmony export */   clearCanvas: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.af),
/* harmony export */   clipArea: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Y),
/* harmony export */   clone: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aS),
/* harmony export */   color: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.c),
/* harmony export */   createContext: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.j),
/* harmony export */   debounce: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ad),
/* harmony export */   defined: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.h),
/* harmony export */   distanceBetweenPoints: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aE),
/* harmony export */   drawPoint: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.at),
/* harmony export */   drawPointLegend: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aD),
/* harmony export */   each: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.F),
/* harmony export */   easingEffects: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.e),
/* harmony export */   finiteOrDefault: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.O),
/* harmony export */   fontString: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a$),
/* harmony export */   formatNumber: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.o),
/* harmony export */   getAngleFromPoint: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.D),
/* harmony export */   getHoverColor: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aR),
/* harmony export */   getMaximumSize: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.G),
/* harmony export */   getRelativePosition: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.z),
/* harmony export */   getRtlAdapter: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.az),
/* harmony export */   getStyle: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a_),
/* harmony export */   isArray: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b),
/* harmony export */   isFinite: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.g),
/* harmony export */   isFunction: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a7),
/* harmony export */   isNullOrUndef: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.k),
/* harmony export */   isNumber: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.x),
/* harmony export */   isObject: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.i),
/* harmony export */   isPatternOrGradient: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aQ),
/* harmony export */   listenArrayEvents: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.l),
/* harmony export */   log10: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aM),
/* harmony export */   merge: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a4),
/* harmony export */   mergeIf: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ab),
/* harmony export */   niceNum: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aH),
/* harmony export */   noop: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aF),
/* harmony export */   overrideTextDirection: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aA),
/* harmony export */   readUsedSize: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.J),
/* harmony export */   renderText: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.Z),
/* harmony export */   requestAnimFrame: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.r),
/* harmony export */   resolve: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a),
/* harmony export */   resolveObjectKey: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.f),
/* harmony export */   restoreTextDirection: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aC),
/* harmony export */   retinaScale: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ae),
/* harmony export */   setsEqual: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ag),
/* harmony export */   sign: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.s),
/* harmony export */   splineCurve: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aY),
/* harmony export */   splineCurveMonotone: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aZ),
/* harmony export */   supportsEventListenerOptions: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.K),
/* harmony export */   throttled: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.L),
/* harmony export */   toDegrees: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.U),
/* harmony export */   toDimension: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.n),
/* harmony export */   toFont: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.a0),
/* harmony export */   toFontString: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aX),
/* harmony export */   toLineHeight: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.b0),
/* harmony export */   toPadding: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.E),
/* harmony export */   toPercentage: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.m),
/* harmony export */   toRadians: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.t),
/* harmony export */   toTRBL: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.av),
/* harmony export */   toTRBLCorners: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.aw),
/* harmony export */   uid: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.ac),
/* harmony export */   unclipArea: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.$),
/* harmony export */   unlistenArrayEvents: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.u),
/* harmony export */   valueOrDefault: () => (/* reexport safe */ _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__.v)
/* harmony export */ });
/* harmony import */ var _chunks_helpers_segment_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chunks/helpers.segment.js */ "./node_modules/chart.js/dist/chunks/helpers.segment.js");
/*!
 * Chart.js v4.4.0
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */



/***/ }),

/***/ "./node_modules/chart.js/helpers/helpers.js":
/*!**************************************************!*\
  !*** ./node_modules/chart.js/helpers/helpers.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HALF_PI: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.HALF_PI),
/* harmony export */   INFINITY: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.INFINITY),
/* harmony export */   PI: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.PI),
/* harmony export */   PITAU: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.PITAU),
/* harmony export */   QUARTER_PI: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.QUARTER_PI),
/* harmony export */   RAD_PER_DEG: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.RAD_PER_DEG),
/* harmony export */   TAU: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.TAU),
/* harmony export */   TWO_THIRDS_PI: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.TWO_THIRDS_PI),
/* harmony export */   _addGrace: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._addGrace),
/* harmony export */   _alignPixel: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._alignPixel),
/* harmony export */   _alignStartEnd: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._alignStartEnd),
/* harmony export */   _angleBetween: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._angleBetween),
/* harmony export */   _angleDiff: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._angleDiff),
/* harmony export */   _arrayUnique: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._arrayUnique),
/* harmony export */   _attachContext: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._attachContext),
/* harmony export */   _bezierCurveTo: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._bezierCurveTo),
/* harmony export */   _bezierInterpolation: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._bezierInterpolation),
/* harmony export */   _boundSegment: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._boundSegment),
/* harmony export */   _boundSegments: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._boundSegments),
/* harmony export */   _capitalize: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._capitalize),
/* harmony export */   _computeSegments: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._computeSegments),
/* harmony export */   _createResolver: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._createResolver),
/* harmony export */   _decimalPlaces: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._decimalPlaces),
/* harmony export */   _deprecated: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._deprecated),
/* harmony export */   _descriptors: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._descriptors),
/* harmony export */   _elementsEqual: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._elementsEqual),
/* harmony export */   _factorize: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._factorize),
/* harmony export */   _filterBetween: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._filterBetween),
/* harmony export */   _getParentNode: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._getParentNode),
/* harmony export */   _getStartAndCountOfVisiblePoints: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._getStartAndCountOfVisiblePoints),
/* harmony export */   _int16Range: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._int16Range),
/* harmony export */   _isBetween: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._isBetween),
/* harmony export */   _isClickEvent: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._isClickEvent),
/* harmony export */   _isDomSupported: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._isDomSupported),
/* harmony export */   _isPointInArea: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._isPointInArea),
/* harmony export */   _limitValue: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._limitValue),
/* harmony export */   _longestText: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._longestText),
/* harmony export */   _lookup: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._lookup),
/* harmony export */   _lookupByKey: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._lookupByKey),
/* harmony export */   _measureText: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._measureText),
/* harmony export */   _merger: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._merger),
/* harmony export */   _mergerIf: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._mergerIf),
/* harmony export */   _normalizeAngle: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._normalizeAngle),
/* harmony export */   _parseObjectDataRadialScale: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._parseObjectDataRadialScale),
/* harmony export */   _pointInLine: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._pointInLine),
/* harmony export */   _readValueToProps: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._readValueToProps),
/* harmony export */   _rlookupByKey: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._rlookupByKey),
/* harmony export */   _scaleRangesChanged: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._scaleRangesChanged),
/* harmony export */   _setMinAndMaxByKey: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._setMinAndMaxByKey),
/* harmony export */   _splitKey: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._splitKey),
/* harmony export */   _steppedInterpolation: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._steppedInterpolation),
/* harmony export */   _steppedLineTo: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._steppedLineTo),
/* harmony export */   _textX: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._textX),
/* harmony export */   _toLeftRightCenter: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._toLeftRightCenter),
/* harmony export */   _updateBezierControlPoints: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__._updateBezierControlPoints),
/* harmony export */   addRoundedRectPath: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.addRoundedRectPath),
/* harmony export */   almostEquals: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.almostEquals),
/* harmony export */   almostWhole: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.almostWhole),
/* harmony export */   callback: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.callback),
/* harmony export */   clearCanvas: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.clearCanvas),
/* harmony export */   clipArea: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.clipArea),
/* harmony export */   clone: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.clone),
/* harmony export */   color: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.color),
/* harmony export */   createContext: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.createContext),
/* harmony export */   debounce: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.debounce),
/* harmony export */   defined: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.defined),
/* harmony export */   distanceBetweenPoints: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.distanceBetweenPoints),
/* harmony export */   drawPoint: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.drawPoint),
/* harmony export */   drawPointLegend: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.drawPointLegend),
/* harmony export */   each: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.each),
/* harmony export */   easingEffects: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.easingEffects),
/* harmony export */   finiteOrDefault: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.finiteOrDefault),
/* harmony export */   fontString: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.fontString),
/* harmony export */   formatNumber: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.formatNumber),
/* harmony export */   getAngleFromPoint: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getAngleFromPoint),
/* harmony export */   getHoverColor: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getHoverColor),
/* harmony export */   getMaximumSize: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getMaximumSize),
/* harmony export */   getRelativePosition: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getRelativePosition),
/* harmony export */   getRtlAdapter: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getRtlAdapter),
/* harmony export */   getStyle: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.getStyle),
/* harmony export */   isArray: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isArray),
/* harmony export */   isFinite: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFinite),
/* harmony export */   isFunction: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction),
/* harmony export */   isNullOrUndef: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isNullOrUndef),
/* harmony export */   isNumber: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isNumber),
/* harmony export */   isObject: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isObject),
/* harmony export */   isPatternOrGradient: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPatternOrGradient),
/* harmony export */   listenArrayEvents: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.listenArrayEvents),
/* harmony export */   log10: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.log10),
/* harmony export */   merge: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge),
/* harmony export */   mergeIf: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.mergeIf),
/* harmony export */   niceNum: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.niceNum),
/* harmony export */   noop: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.noop),
/* harmony export */   overrideTextDirection: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.overrideTextDirection),
/* harmony export */   readUsedSize: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.readUsedSize),
/* harmony export */   renderText: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.renderText),
/* harmony export */   requestAnimFrame: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.requestAnimFrame),
/* harmony export */   resolve: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.resolve),
/* harmony export */   resolveObjectKey: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.resolveObjectKey),
/* harmony export */   restoreTextDirection: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.restoreTextDirection),
/* harmony export */   retinaScale: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.retinaScale),
/* harmony export */   setsEqual: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.setsEqual),
/* harmony export */   sign: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.sign),
/* harmony export */   splineCurve: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.splineCurve),
/* harmony export */   splineCurveMonotone: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.splineCurveMonotone),
/* harmony export */   supportsEventListenerOptions: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.supportsEventListenerOptions),
/* harmony export */   throttled: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.throttled),
/* harmony export */   toDegrees: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toDegrees),
/* harmony export */   toDimension: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toDimension),
/* harmony export */   toFont: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toFont),
/* harmony export */   toFontString: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toFontString),
/* harmony export */   toLineHeight: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toLineHeight),
/* harmony export */   toPadding: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toPadding),
/* harmony export */   toPercentage: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toPercentage),
/* harmony export */   toRadians: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toRadians),
/* harmony export */   toTRBL: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toTRBL),
/* harmony export */   toTRBLCorners: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.toTRBLCorners),
/* harmony export */   uid: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.uid),
/* harmony export */   unclipArea: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.unclipArea),
/* harmony export */   unlistenArrayEvents: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.unlistenArrayEvents),
/* harmony export */   valueOrDefault: () => (/* reexport safe */ _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__.valueOrDefault)
/* harmony export */ });
/* harmony import */ var _dist_helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dist/helpers.js */ "./node_modules/chart.js/dist/helpers.js");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && !scriptUrl) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_style_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles/style.scss */ "./src/styles/style.scss");
/* harmony import */ var _search__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./search */ "./src/search.js");
/* harmony import */ var _data_storage__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./data-storage */ "./src/data-storage.js");



(0,_search__WEBPACK_IMPORTED_MODULE_1__.addSearchListeners)();
(0,_data_storage__WEBPACK_IMPORTED_MODULE_2__.addLocalStorage)();
})();

/******/ })()
;
//# sourceMappingURL=main.6a8b93216d7c1ae74f0d.js.map