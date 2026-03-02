/**
 * @file FirebasexPerformancePlugin.h
 * @brief Cordova plugin for Firebase Performance Monitoring on iOS.
 *
 * Provides custom trace management and control over performance data collection.
 */

#import <Cordova/CDVPlugin.h>

/**
 * Cordova plugin class for Firebase Performance Monitoring on iOS.
 *
 * Manages custom traces (start, increment counter, stop) and controls
 * the performance data collection enabled state.
 */
@interface FirebasexPerformancePlugin : CDVPlugin

/** Starts a custom performance trace. args[0] = trace name. */
- (void)startTrace:(CDVInvokedUrlCommand *)command;
/** Increments a metric on an active trace. args[0] = trace name, args[1] = counter name. */
- (void)incrementCounter:(CDVInvokedUrlCommand *)command;
/** Stops an active trace and submits it. args[0] = trace name. */
- (void)stopTrace:(CDVInvokedUrlCommand *)command;
/** Enables or disables performance data collection. args[0] = boolean. */
- (void)setPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command;
/** Returns the current performance data collection enabled state. */
- (void)isPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command;

@end
