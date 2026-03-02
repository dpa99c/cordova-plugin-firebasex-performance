# cordova-plugin-firebasex-performance

[![npm version](https://img.shields.io/npm/v/cordova-plugin-firebasex-performance.svg)](https://www.npmjs.com/package/cordova-plugin-firebasex-performance)

Firebase Performance Monitoring module for the [modular FirebaseX Cordova plugin suite](https://github.com/dpa99c/cordova-plugin-firebasex-performance#modular-plugins).

The [Firebase Performance Monitoring SDK](https://firebase.google.com/docs/perf-mon) enables you to measure, monitor and analyze the performance of your app in the Firebase console.
It enables you to measure metrics such as app startup, screen rendering and network requests.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Installation](#installation)
  - [Plugin variables](#plugin-variables)
- [Android Performance Monitoring Gradle plugin](#android-performance-monitoring-gradle-plugin)
- [Disable data collection on startup](#disable-data-collection-on-startup)
- [API](#api)
  - [setPerformanceCollectionEnabled](#setperformancecollectionenabled)
  - [isPerformanceCollectionEnabled](#isperformancecollectionenabled)
  - [startTrace](#starttrace)
  - [incrementCounter](#incrementcounter)
  - [stopTrace](#stoptrace)
- [Reporting issues](#reporting-issues)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

Install the plugin by adding it to your project's config.xml:

    cordova plugin add cordova-plugin-firebasex-performance

or by running:

    cordova plugin add cordova-plugin-firebasex-performance

**This module depends on `cordova-plugin-firebasex-core` which will be installed automatically as a dependency.**

## Plugin variables

The following plugin variables are used to configure the performance module at install time.
They can be set on the command line at plugin installation time:

    cordova plugin add cordova-plugin-firebasex-performance --variable VARIABLE_NAME=value

Or in your `config.xml`:

    <plugin name="cordova-plugin-firebasex-performance">
        <variable name="VARIABLE_NAME" value="value" />
    </plugin>

| Variable | Default | Description |
|---|---|---|
| `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` | `true` | Whether to enable performance data collection on app startup. Set to `false` to [disable on startup](#disable-data-collection-on-startup) and enable at runtime using [`setPerformanceCollectionEnabled()`](#setperformancecollectionenabled). |
| `ANDROID_FIREBASE_PERFORMANCE_MONITORING` | `false` | Whether to add the [Firebase Performance Monitoring Gradle plugin](#android-performance-monitoring-gradle-plugin) for automatic Android network request monitoring. |
| `ANDROID_FIREBASE_PERF_GRADLE_PLUGIN_VERSION` | `2.0.1` | Version of the Firebase Performance Monitoring Gradle plugin to use. |

# Android Performance Monitoring Gradle plugin

-   The [Firebase Performance Monitoring Gradle plugin for Android](https://firebase.google.com/docs/perf-mon/get-started-android?authuser=0#add-perfmon-plugin) is required to enable automatic monitoring of network requests in Android apps.
-   However, as [outlined here](https://proandroiddev.com/hidden-costs-of-firebase-performance-and-how-to-avoid-them-a54f96bafcb1), adding this Gradle plugin to your Android builds can significantly increase Android build times and memory usage.
-   For this reason, the Gradle plugin is not added to your Android app builds by default.
-   If you want to add it to make use of automatic network request monitoring on Android, set the `ANDROID_FIREBASE_PERFORMANCE_MONITORING` plugin variable at plugin install time:
    -   `--variable ANDROID_FIREBASE_PERFORMANCE_MONITORING=true`
-   If you choose to add it, the Gradle plugin currently requires Gradle v6.1.1 and Android Studio v4.0 or above.
-   Note: on iOS when this plugin is installed, automatic network request monitoring takes place without requiring any extra configuration.

# Disable data collection on startup

By default, performance data collection is enabled on app startup.
To disable this, set the `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` plugin variable to `false` at install time:

    cordova plugin add cordova-plugin-firebasex-performance --variable FIREBASE_PERFORMANCE_COLLECTION_ENABLED=false

Data collection can then be enabled/disabled at runtime using [`setPerformanceCollectionEnabled()`](#setperformancecollectionenabled).

# API

The following methods are available via the `FirebasexPerformancePlugin` global object.

## setPerformanceCollectionEnabled

Manually enable/disable performance data collection, e.g. if [disabled on app startup](#disable-data-collection-on-startup).

**Parameters**:

-   {boolean} setEnabled - whether to enable or disable performance data collection

```javascript
FirebasexPerformancePlugin.setPerformanceCollectionEnabled(true); // Enables performance data collection

FirebasexPerformancePlugin.setPerformanceCollectionEnabled(false); // Disables performance data collection
```

## isPerformanceCollectionEnabled

Indicates whether performance data collection is enabled.

Notes:

-   This value applies both to the current app session and subsequent app sessions until such time as it is changed.
-   It returns the value set by [`setPerformanceCollectionEnabled()`](#setperformancecollectionenabled).
-   If automatic data collection was not [disabled on app startup](#disable-data-collection-on-startup), this will always return `true`.

**Parameters**:

-   {function} success - callback function which will be invoked on success.
    Will be passed a {boolean} indicating if the setting is enabled.
-   {function} error - (optional) callback function which will be passed a {string} error message as an argument

```javascript
FirebasexPerformancePlugin.isPerformanceCollectionEnabled(
    function (enabled) {
        console.log(
            "Performance data collection is " +
                (enabled ? "enabled" : "disabled")
        );
    },
    function (error) {
        console.error(
            "Error getting Performance data collection setting: " + error
        );
    }
);
```

## startTrace

Start a trace.

**Parameters**:

-   {string} name - name of trace to start
-   {function} success - callback function to call on successfully starting trace
-   {function} error - callback function which will be passed a {string} error message as an argument

```javascript
FirebasexPerformancePlugin.startTrace("test trace", success, error);
```

## incrementCounter

To count the performance-related events that occur in your app (such as cache hits or retries), add a line of code similar to the following whenever the event occurs, using a string other than retry to name that event if you are counting a different type of event:

**Parameters**:

-   {string} name - name of trace
-   {string} counterName - name of counter to increment
-   {function} success - callback function to call on successfully incrementing counter
-   {function} error - callback function which will be passed a {string} error message as an argument

```javascript
FirebasexPerformancePlugin.incrementCounter("test trace", "retry", success, error);
```

## stopTrace

Stop the trace.

**Parameters**:

-   {string} name - name of trace to stop
-   {function} success - callback function to call on successfully stopping trace
-   {function} error - callback function which will be passed a {string} error message as an argument

```javascript
FirebasexPerformancePlugin.stopTrace("test trace");
```

# Reporting issues

Before reporting an issue with this plugin, please do the following:
- Check the existing [issues](https://github.com/dpa99c/cordova-plugin-firebasex-performance/issues) to see if the issue has already been reported.
- Check the [issue template](https://github.com/dpa99c/cordova-plugin-firebasex-performance/issues/new/choose) and provide all requested information.
- The more information and context you provide, the easier it is for the maintainers to understand the issue and provide a resolution.
