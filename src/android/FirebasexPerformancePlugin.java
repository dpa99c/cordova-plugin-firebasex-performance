package org.apache.cordova.firebasex;

import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;

/**
 * Cordova plugin for Firebase Performance Monitoring on Android.
 *
 * <p>Provides custom trace management (start, increment counter, stop) and
 * control over performance data collection. Active traces are stored in an
 * in-memory map keyed by trace name.
 *
 * <p>The performance collection enabled state is persisted via
 * {@link FirebasexCorePlugin} shared preferences so it survives app restarts.
 *
 * @see <a href="https://firebase.google.com/docs/perf-mon">Firebase Performance Monitoring</a>
 */
public class FirebasexPerformancePlugin extends CordovaPlugin {

    /** Log tag for all messages from this plugin. */
    private static final String TAG = "FirebasexPerformance";

    /** SharedPreferences key for the performance collection enabled state. */
    private static final String PERFORMANCE_COLLECTION_ENABLED = "firebase_performance_collection_enabled";

    /** Map of active traces, keyed by trace name. */
    private HashMap<String, Trace> traces = new HashMap<String, Trace>();

    /**
     * Initialises the plugin.
     *
     * Checks the shared preference for performance collection enabled state.
     * If not already set, reads the value from AndroidManifest meta-data and
     * persists it to shared preferences.
     */
    @Override
    protected void pluginInitialize() {
        Log.d(TAG, "pluginInitialize");
        try {
            boolean enabled = FirebasexCorePlugin.getInstance().getPreference(PERFORMANCE_COLLECTION_ENABLED);
            if (!enabled) {
                android.os.Bundle metaData = cordova.getActivity().getPackageManager()
                        .getApplicationInfo(cordova.getActivity().getPackageName(),
                                android.content.pm.PackageManager.GET_META_DATA).metaData;
                if (metaData != null && metaData.containsKey(PERFORMANCE_COLLECTION_ENABLED)) {
                    boolean metaEnabled = metaData.getBoolean(PERFORMANCE_COLLECTION_ENABLED);
                    if (metaEnabled) {
                        FirebasexCorePlugin.getInstance().setPreference(PERFORMANCE_COLLECTION_ENABLED, true);
                    }
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error reading performance collection preference: " + e.getMessage());
        }
    }

    /**
     * Dispatches Cordova actions to plugin methods.
     *
     * <p>Supported actions:
     * <ul>
     *   <li>{@code "startTrace"} - start a custom trace</li>
     *   <li>{@code "incrementCounter"} - increment a metric on an active trace</li>
     *   <li>{@code "stopTrace"} - stop and submit an active trace</li>
     *   <li>{@code "setPerformanceCollectionEnabled"} - enable/disable data collection</li>
     *   <li>{@code "isPerformanceCollectionEnabled"} - query data collection state</li>
     * </ul>
     */
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "startTrace":
                this.startTrace(callbackContext, args.getString(0));
                return true;
            case "incrementCounter":
                this.incrementCounter(callbackContext, args.getString(0), args.getString(1));
                return true;
            case "stopTrace":
                this.stopTrace(callbackContext, args.getString(0));
                return true;
            case "setPerformanceCollectionEnabled":
                this.setPerformanceCollectionEnabled(callbackContext, args.getBoolean(0));
                return true;
            case "isPerformanceCollectionEnabled":
                this.isPerformanceCollectionEnabled(callbackContext);
                return true;
        }
        return false;
    }

    /**
     * Starts a custom performance trace with the given name.
     *
     * If a trace with the same name already exists, the existing trace is reused.
     *
     * @param callbackContext the Cordova callback
     * @param name            the trace name
     */
    private void startTrace(final CallbackContext callbackContext, final String name) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    Trace myTrace = traces.get(name);
                    if (myTrace == null) {
                        myTrace = FirebasePerformance.getInstance().newTrace(name);
                        myTrace.start();
                        traces.put(name, myTrace);
                    }
                    callbackContext.success();
                } catch (Exception e) {
                    FirebasexCorePlugin.handleExceptionWithContext(e, callbackContext);
                }
            }
        });
    }

    /**
     * Increments a named metric on an active trace by 1.
     *
     * @param callbackContext the Cordova callback
     * @param name            the trace name
     * @param counterNamed    the metric/counter name to increment
     */
    private void incrementCounter(final CallbackContext callbackContext, final String name, final String counterNamed) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    Trace myTrace = traces.get(name);
                    if (myTrace != null) {
                        myTrace.incrementMetric(counterNamed, 1);
                        callbackContext.success();
                    } else {
                        callbackContext.error("Trace not found");
                    }
                } catch (Exception e) {
                    FirebasexCorePlugin.handleExceptionWithContext(e, callbackContext);
                }
            }
        });
    }

    /**
     * Stops an active trace, submitting its data, and removes it from the map.
     *
     * @param callbackContext the Cordova callback
     * @param name            the trace name to stop
     */
    private void stopTrace(final CallbackContext callbackContext, final String name) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    Trace myTrace = traces.get(name);
                    if (myTrace != null) {
                        myTrace.stop();
                        traces.remove(name);
                        callbackContext.success();
                    } else {
                        callbackContext.error("Trace not found");
                    }
                } catch (Exception e) {
                    FirebasexCorePlugin.handleExceptionWithContext(e, callbackContext);
                }
            }
        });
    }

    /**
     * Enables or disables Firebase Performance Monitoring data collection.
     *
     * The setting is persisted to shared preferences via the core plugin.
     *
     * @param callbackContext the Cordova callback
     * @param enabled         {@code true} to enable, {@code false} to disable
     */
    private void setPerformanceCollectionEnabled(final CallbackContext callbackContext, final boolean enabled) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    FirebasePerformance.getInstance().setPerformanceCollectionEnabled(enabled);
                    FirebasexCorePlugin.getInstance().setPreference(PERFORMANCE_COLLECTION_ENABLED, enabled);
                    callbackContext.success();
                } catch (Exception e) {
                    FirebasexCorePlugin.handleExceptionWithContext(e, callbackContext);
                }
            }
        });
    }

    /**
     * Queries the current performance data collection enabled state from shared preferences.
     *
     * Returns 1 (enabled) or 0 (disabled) to the callback.
     *
     * @param callbackContext the Cordova callback
     */
    private void isPerformanceCollectionEnabled(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    boolean enabled = FirebasexCorePlugin.getInstance().getPreference(PERFORMANCE_COLLECTION_ENABLED);
                    callbackContext.success(enabled ? 1 : 0);
                } catch (Exception e) {
                    FirebasexCorePlugin.handleExceptionWithContext(e, callbackContext);
                }
            }
        });
    }
}
