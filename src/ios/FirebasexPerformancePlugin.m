#import "FirebasexPerformancePlugin.h"
#import "FirebasexCorePlugin.h"
@import FirebasePerformance;

static NSString *const FIREBASE_PERFORMANCE_COLLECTION_ENABLED =
    @"FIREBASE_PERFORMANCE_COLLECTION_ENABLED";

@implementation FirebasexPerformancePlugin {
    NSMutableDictionary *_traces;
}

- (void)pluginInitialize {
    NSLog(@"FirebasexPerformancePlugin pluginInitialize");
    _traces = [[NSMutableDictionary alloc] init];

    FirebasexCorePlugin *core = [FirebasexCorePlugin sharedInstance];
    if ([core getPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED]) {
        [core setPreferenceFlag:FIREBASE_PERFORMANCE_COLLECTION_ENABLED flag:YES];
    }
}

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
