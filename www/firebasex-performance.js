/**
 * @fileoverview Cordova JavaScript interface for the FirebaseX Performance Monitoring plugin.
 *
 * Provides methods to create custom traces for measuring app performance,
 * increment trace counters (metrics), and control the performance data collection state.
 *
 * @module firebasex-performance
 * @see https://firebase.google.com/docs/perf-mon
 */

var exec = require("cordova/exec");

/** @private Cordova service name registered in plugin.xml. */
var SERVICE = "FirebasexPerformancePlugin";

/**
 * Starts a custom performance trace.
 *
 * If a trace with the given name already exists, this is a no-op.
 * Call {@link module:firebasex-performance.stopTrace|stopTrace} with the same
 * name to finish the trace and submit it.
 *
 * @param {string} name - Unique name for the trace.
 * @param {function} success - Called on success.
 * @param {function} error - Called with an error message on failure.
 */
exports.startTrace = function (name, success, error) {
    exec(success, error, SERVICE, "startTrace", [name]);
};

/**
 * Increments a named counter (metric) on an active trace by 1.
 *
 * The trace must have been previously started with
 * {@link module:firebasex-performance.startTrace|startTrace}.
 *
 * @param {string} name - The name of the trace.
 * @param {string} counterNamed - The name of the counter/metric to increment.
 * @param {function} success - Called on success.
 * @param {function} error - Called with an error message on failure (e.g. if trace not found).
 */
exports.incrementCounter = function (name, counterNamed, success, error) {
    exec(success, error, SERVICE, "incrementCounter", [name, counterNamed]);
};

/**
 * Stops an active performance trace and submits it.
 *
 * The trace must have been previously started with
 * {@link module:firebasex-performance.startTrace|startTrace}.
 *
 * @param {string} name - The name of the trace to stop.
 * @param {function} success - Called on success.
 * @param {function} error - Called with an error message on failure (e.g. if trace not found).
 */
exports.stopTrace = function (name, success, error) {
    exec(success, error, SERVICE, "stopTrace", [name]);
};

/**
 * Enables or disables Firebase Performance Monitoring data collection.
 *
 * When disabled, no performance data is collected or sent to Firebase.
 * The setting is persisted across app restarts.
 *
 * @param {boolean} enabled - {@code true} to enable, {@code false} to disable.
 * @param {function} success - Called on success.
 * @param {function} error - Called with an error message on failure.
 */
exports.setPerformanceCollectionEnabled = function (enabled, success, error) {
    exec(success, error, SERVICE, "setPerformanceCollectionEnabled", [!!enabled]);
};

/**
 * Returns the current performance data collection enabled state.
 *
 * @param {function} success - Called with a boolean: {@code true} if enabled.
 * @param {function} error - Called with an error message on failure.
 */
exports.isPerformanceCollectionEnabled = function (success, error) {
    exec(success, error, SERVICE, "isPerformanceCollectionEnabled", []);
};
