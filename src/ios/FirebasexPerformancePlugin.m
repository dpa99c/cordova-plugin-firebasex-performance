/**
 * @file FirebasexPerformancePlugin.m
 * @brief iOS implementation of the Firebase Performance Monitoring Cordova plugin.
 */

#import "FirebasexPerformancePlugin.h"
#import "FirebasexCorePlugin.h"
@import FirebasePerformance;

/** Preference key for the performance data collection enabled state. */
static NSString *const FIREBASE_PERFORMANCE_COLLECTION_ENABLED =
    @"FIREBASE_PERFORMANCE_COLLECTION_ENABLED";

@implementation FirebasexPerformancePlugin {
    /** Dictionary of active traces, keyed by trace name. Thread-safe via @synchronized. */
    NSMutableDictionary *_traces;
}

/**
 * Initialises the plugin, creating the traces dictionary and reading the
 * persisted performance collection preference.
 */
- (void)pluginInitialize {
    NSLog(@"FirebasexPerformancePlugin pluginInitialize");
    _traces = [[NSMutableDictionary alloc] init];

    FirebasexCorePlugin *core = [FirebasexCorePlugin sharedInstance];
    if ([core getPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED]) {
        [core setPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED flag:YES];
    }
}

/**
 * Enables or disables Firebase Performance data collection.
 *
 * Persists the setting via the core plugin's preference flags.
 *
 * @param command Cordova command. args[0] = boolean.
 */
- (void)setPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        @try {
            BOOL enabled = [[command argumentAtIndex:0] boolValue];
            [[FIRPerformance sharedInstance] setDataCollectionEnabled:enabled];
            [[FirebasexCorePlugin sharedInstance] setPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED
                                                              flag:enabled];
            CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        } @catch (NSException *exception) {
            [[FirebasexCorePlugin sharedInstance] handlePluginExceptionWithContext:exception :command];
        }
    }];
}

/**
 * Returns the current performance data collection enabled state as a boolean.
 */
- (void)isPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        @try {
            CDVPluginResult *pluginResult = [CDVPluginResult
                resultWithStatus:CDVCommandStatus_OK
                   messageAsBool:[[FirebasexCorePlugin sharedInstance]
                                     getPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED]];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        } @catch (NSException *exception) {
            [[FirebasexCorePlugin sharedInstance] handlePluginExceptionWithContext:exception :command];
        }
    }];
}

/**
 * Starts a custom performance trace.
 *
 * If a trace with the given name already exists, it is reused.
 * The trace dictionary is protected with @c @synchronized for thread safety.
 *
 * @param command Cordova command. args[0] = trace name (NSString).
 */
- (void)startTrace:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        @try {
            NSString *traceName = [command.arguments objectAtIndex:0];
            @synchronized(self->_traces) {
                FIRTrace *trace = [self->_traces objectForKey:traceName];
                if (trace == nil) {
                    trace = [FIRPerformance startTraceWithName:traceName];
                    [self->_traces setObject:trace forKey:traceName];
                }
            }
            CDVPluginResult *pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        } @catch (NSException *exception) {
            [[FirebasexCorePlugin sharedInstance] handlePluginExceptionWithContext:exception :command];
        }
    }];
}

/**
 * Increments a named metric on an active trace by 1.
 *
 * Returns an error if the trace is not found.
 *
 * @param command Cordova command. args[0] = trace name, args[1] = counter name.
 */
- (void)incrementCounter:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        @try {
            NSString *traceName = [command.arguments objectAtIndex:0];
            NSString *counterNamed = [command.arguments objectAtIndex:1];
            CDVPluginResult *pluginResult;
            @synchronized(self->_traces) {
                FIRTrace *trace = (FIRTrace *)[self->_traces objectForKey:traceName];
                if (trace != nil) {
                    [trace incrementMetric:counterNamed byInt:1];
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                } else {
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                     messageAsString:@"Trace not found"];
                }
            }
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        } @catch (NSException *exception) {
            [[FirebasexCorePlugin sharedInstance] handlePluginExceptionWithContext:exception :command];
        }
    }];
}

/**
 * Stops an active trace, submits its data, and removes it from the dictionary.
 *
 * Returns an error if the trace is not found.
 *
 * @param command Cordova command. args[0] = trace name.
 */
- (void)stopTrace:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        @try {
            NSString *traceName = [command.arguments objectAtIndex:0];
            CDVPluginResult *pluginResult;
            @synchronized(self->_traces) {
                FIRTrace *trace = [self->_traces objectForKey:traceName];
                if (trace != nil) {
                    [trace stop];
                    [self->_traces removeObjectForKey:traceName];
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                } else {
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR
                                                     messageAsString:@"Trace not found"];
                }
            }
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        } @catch (NSException *exception) {
            [[FirebasexCorePlugin sharedInstance] handlePluginExceptionWithContext:exception :command];
        }
    }];
}

@end
