package org.anthropic.cordova.firebase;

import android.util.Log;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import com.google.firebase.perf.FirebasePerformance;
import com.google.firebase.perf.metrics.Trace;

import java.util.HashMap;

public class FirebasexPerformancePlugin extends CordovaPlugin {

    private static final String TAG = "FirebasexPerformance";
    private static final String PERFORMANCE_COLLECTION_ENABLED = "firebase_performance_collection_enabled";

    private HashMap<String, Trace> traces = new HashMap<String, Trace>();

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
