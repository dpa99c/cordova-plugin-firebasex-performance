var exec = require("cordova/exec");
var SERVICE = "FirebasexPerformancePlugin";

exports.startTrace = function (name, success, error) {
    exec(success, error, SERVICE, "startTrace", [name]);
};

exports.incrementCounter = function (name, counterNamed, success, error) {
    exec(success, error, SERVICE, "incrementCounter", [name, counterNamed]);
};

exports.stopTrace = function (name, success, error) {
    exec(success, error, SERVICE, "stopTrace", [name]);
};

exports.setPerformanceCollectionEnabled = function (enabled, success, error) {
    exec(success, error, SERVICE, "setPerformanceCollectionEnabled", [!!enabled]);
};

exports.isPerformanceCollectionEnabled = function (success, error) {
    exec(success, error, SERVICE, "isPerformanceCollectionEnabled", []);
};
