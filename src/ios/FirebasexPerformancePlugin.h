#import <Cordova/CDVPlugin.h>

@interface FirebasexPerformancePlugin : CDVPlugin

- (void)startTrace:(CDVInvokedUrlCommand *)command;
- (void)incrementCounter:(CDVInvokedUrlCommand *)command;
- (void)stopTrace:(CDVInvokedUrlCommand *)command;
- (void)setPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command;
- (void)isPerformanceCollectionEnabled:(CDVInvokedUrlCommand *)command;

@end
