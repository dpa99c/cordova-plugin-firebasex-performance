/**
 * @file after_prepare.js
 * @brief Cordova "after_prepare" hook for the cordova-plugin-firebasex-performance plugin.
 *
 * Configures Firebase Performance Monitoring for both Android and iOS platforms:
 *
 * **Android** (when `ANDROID_FIREBASE_PERFORMANCE_MONITORING` is `true`):
 * - Adds the `firebase-perf-plugin` classpath dependency to the root `build.gradle`.
 * - Applies the `com.google.firebase.firebase-perf` plugin to the app `build.gradle`.
 * - The Gradle plugin version defaults to `2.0.1` but can be overridden via
 *   `ANDROID_FIREBASE_PERF_GRADLE_PLUGIN_VERSION`.
 *
 * **iOS** (when `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` is set):
 * - Writes the `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` key into
 *   `GoogleService-Info.plist` to enable or disable automatic collection.
 *
 * This script is self-contained — it includes its own Gradle helpers and plugin
 * variable resolution rather than depending on the core plugin's utilities.
 *
 * Plugin variables are resolved using a 3-layer override strategy:
 * 1. Defaults from `plugin.xml` `<preference>` elements.
 * 2. Overrides from `config.xml` `<plugin><variable>` elements.
 * 3. Overrides from `package.json` `cordova.plugins` entries (highest priority).
 *
 * For layers 2 and 3, variables are checked under both the wrapper meta-plugin ID
 * (`cordova-plugin-firebasex`) and this plugin's own ID, allowing users who install
 * via the wrapper to specify variables under the original monolithic plugin name.
 *
 * @module scripts/after_prepare
 */
var fs = require("fs");
var path = require("path");

/** @constant {string} The plugin identifier. */
var PLUGIN_ID = "cordova-plugin-firebasex-performance";
/** @constant {string} The wrapper meta-plugin identifier used as a fallback source for plugin variables. */
var WRAPPER_PLUGIN_ID = "cordova-plugin-firebasex";

/** @constant {string} Root directory of the Android platform. */
var ANDROID_PROJECT_ROOT = "platforms/android";
/** @constant {string} Path to the root-level build.gradle file. */
var ROOT_GRADLE_FILEPATH = ANDROID_PROJECT_ROOT + "/build.gradle";
/** @constant {string} Path to the app-level build.gradle file. */
var APP_GRADLE_FILEPATH = ANDROID_PROJECT_ROOT + "/app/build.gradle";

/** @constant {string} Maven artifact prefix for the Firebase Perf Gradle plugin. */
var PERF_GRADLE_PLUGIN_CLASS_DEF = "com.google.firebase:perf-plugin";
/** @constant {string} Gradle plugin ID to apply for Firebase Performance Monitoring. */
var PERF_GRADLE_PLUGIN_DEF = "com.google.firebase.firebase-perf";

/**
 * Resolves plugin variables using a 3-layer override strategy:
 * 1. Default values from `plugin.xml` `<preference>` elements.
 * 2. Overrides from `config.xml` `<plugin><variable>` elements.
 * 3. Overrides from `package.json` `cordova.plugins` entries (highest priority).
 *
 * @returns {Object} Resolved plugin variable key/value pairs.
 */
function getPluginVariables() {
    var variables = {};

    // Try reading from plugin.xml
    try {
        var pluginXmlPath = path.join("plugins", PLUGIN_ID, "plugin.xml");
        if (fs.existsSync(pluginXmlPath)) {
            var pluginXml = fs.readFileSync(pluginXmlPath, "utf-8");
            var prefRegex = /<preference\s+name="([^"]+)"\s+default="([^"]+)"\s*\/>/g;
            var match;
            while ((match = prefRegex.exec(pluginXml)) !== null) {
                variables[match[1]] = match[2];
            }
        }
    } catch (e) {
        console.warn("Could not read plugin.xml: " + e.message);
    }

    // Override with values from config.xml (check both wrapper and own plugin ID)
    try {
        var configXmlPath = path.join("config.xml");
        if (fs.existsSync(configXmlPath)) {
            var configXml = fs.readFileSync(configXmlPath, "utf-8");
            [WRAPPER_PLUGIN_ID, PLUGIN_ID].forEach(function(pluginId) {
                var pluginRegex = new RegExp('<plugin[^>]+name="' + pluginId + '"[^>]*>(.*?)</plugin>', "s");
                var pluginMatch = configXml.match(pluginRegex);
                if (pluginMatch) {
                    var varRegex = /<variable\s+name="([^"]+)"\s+value="([^"]+)"\s*\/>/g;
                    var varMatch;
                    while ((varMatch = varRegex.exec(pluginMatch[1])) !== null) {
                        variables[varMatch[1]] = varMatch[2];
                    }
                }
            });
        }
    } catch (e) {
        console.warn("Could not read config.xml: " + e.message);
    }

    // Override with values from package.json (check wrapper first as base, then own plugin)
    try {
        var packageJsonPath = path.join("package.json");
        if (fs.existsSync(packageJsonPath)) {
            var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            if (packageJson.cordova && packageJson.cordova.plugins) {
                [WRAPPER_PLUGIN_ID, PLUGIN_ID].forEach(function(pluginId) {
                    if (packageJson.cordova.plugins[pluginId]) {
                        var pluginVars = packageJson.cordova.plugins[pluginId];
                        for (var key in pluginVars) {
                            variables[key] = pluginVars[key];
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.warn("Could not read package.json: " + e.message);
    }

    return variables;
}

/**
 * Adds a classpath dependency to the root-level build.gradle file.
 * If the dependency already exists, this is a no-op.
 *
 * @param {string} artifactDef - The full artifact definition (e.g., "com.google.firebase:perf-plugin:2.0.1").
 */
function addDependencyToRootGradle(artifactDef) {
    var gradleDependency = "classpath '" + artifactDef + "'";
    var rootGradlePath = path.resolve(ROOT_GRADLE_FILEPATH);
    if (!fs.existsSync(rootGradlePath)) return;

    var rootGradle = fs.readFileSync(rootGradlePath, "utf-8");
    if (rootGradle.indexOf(gradleDependency) !== -1) return;

    rootGradle = rootGradle.replace("dependencies {", "dependencies {\n" + gradleDependency);
    fs.writeFileSync(rootGradlePath, rootGradle, "utf-8");
    console.log("Added dependency to root gradle: " + artifactDef);
}

/**
 * Appends an `apply plugin` statement to the app-level build.gradle file.
 * If the plugin is already applied, this is a no-op.
 *
 * @param {string} pluginDef - The Gradle plugin ID to apply (e.g., "com.google.firebase.firebase-perf").
 */
function applyPluginToAppGradle(pluginDef) {
    var applyPlugin = "apply plugin: '" + pluginDef + "'";
    var appGradlePath = path.resolve(APP_GRADLE_FILEPATH);
    if (!fs.existsSync(appGradlePath)) return;

    var appGradle = fs.readFileSync(appGradlePath, "utf-8");
    if (appGradle.indexOf(applyPlugin) !== -1) return;

    appGradle += "\n" + applyPlugin;
    fs.writeFileSync(appGradlePath, appGradle, "utf-8");
    console.log("Applied plugin to app gradle: " + pluginDef);
}

/**
 * Cordova hook entry point.
 *
 * Resolves plugin variables and applies platform-specific configuration:
 * - Android: Injects the Firebase Performance Gradle plugin when enabled.
 * - iOS: Writes `FIREBASE_PERFORMANCE_COLLECTION_ENABLED` to GoogleService-Info.plist.
 *
 * @param {object} context - The Cordova hook context.
 */
module.exports = function (context) {
    var pluginVariables = getPluginVariables();

    // Handle ANDROID_FIREBASE_PERFORMANCE_MONITORING:
    // When enabled, adds the firebase-perf Gradle plugin classpath dependency
    // to the root build.gradle and applies it to the app build.gradle.
    if (pluginVariables["ANDROID_FIREBASE_PERFORMANCE_MONITORING"] === "true") {
        var perfGradlePluginVersion = pluginVariables["ANDROID_FIREBASE_PERF_GRADLE_PLUGIN_VERSION"] || "2.0.1";
        addDependencyToRootGradle(PERF_GRADLE_PLUGIN_CLASS_DEF + ":" + perfGradlePluginVersion);
        applyPluginToAppGradle(PERF_GRADLE_PLUGIN_DEF);
    }

    // Handle FIREBASE_PERFORMANCE_COLLECTION_ENABLED in iOS plist:
    // When set, writes the value into GoogleService-Info.plist to control
    // whether automatic performance data collection is enabled at app startup.
    if (context.opts.platforms && context.opts.platforms.indexOf("ios") !== -1) {
        try {
            var plist = require("plist");
            var iosDir = path.join("platforms", "ios");
            if (!fs.existsSync(iosDir)) return;

            var configXml = fs.readFileSync(path.join("config.xml"), "utf-8");
            var appNameMatch = configXml.match(/<name>([^<]+)<\/name>/);
            if (!appNameMatch) return;
            var appName = appNameMatch[1];

            var googlePlistPath = path.join(iosDir, appName, "GoogleService-Info.plist");
            if (!fs.existsSync(googlePlistPath)) return;

            var googlePlist = plist.parse(fs.readFileSync(googlePlistPath, "utf-8"));
            if (typeof pluginVariables["FIREBASE_PERFORMANCE_COLLECTION_ENABLED"] !== "undefined") {
                googlePlist["FIREBASE_PERFORMANCE_COLLECTION_ENABLED"] =
                    pluginVariables["FIREBASE_PERFORMANCE_COLLECTION_ENABLED"] !== "false" ? "true" : "false";
                fs.writeFileSync(googlePlistPath, plist.build(googlePlist), "utf-8");
                console.log("Set FIREBASE_PERFORMANCE_COLLECTION_ENABLED in GoogleService-Info.plist");
            }
        } catch (e) {
            console.warn("Could not update GoogleService-Info.plist for performance: " + e.message);
        }
    }
};
