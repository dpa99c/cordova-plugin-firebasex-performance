# cordova-plugin-firebasex-performance

Firebase Performance Monitoring module for `cordova-plugin-firebasex`.

## Installation

```bash
cordova plugin add cordova-plugin-firebasex-performance
```

This plugin depends on `cordova-plugin-firebasex-core` which will be installed automatically.

## Preferences

| Preference | Default | Description |
|---|---|---|
| `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` | `true` | Enable/disable performance data collection |
| `ANDROID_FIREBASE_PERFORMANCE_MONITORING` | `false` | Enable Firebase Performance gradle plugin for Android network traffic monitoring |
| `ANDROID_FIREBASE_PERF_GRADLE_PLUGIN_VERSION` | `2.0.1` | Version of the Firebase Performance gradle plugin |

## API

### startTrace(name, success, error)
Start a custom performance trace.

```javascript
FirebasexPerformancePlugin.startTrace("myTrace", function() {
    console.log("Trace started");
}, function(error) {
    console.error(error);
});
```

### incrementCounter(name, counterName, success, error)
Increment a metric counter on an active trace.

### stopTrace(name, success, error)
Stop an active performance trace.

### setPerformanceCollectionEnabled(enabled, success, error)
Enable or disable performance data collection at runtime.

### isPerformanceCollectionEnabled(success, error)
Check if performance data collection is enabled.
