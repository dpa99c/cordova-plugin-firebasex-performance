var fs = require("fs");
var path = require("path");

var PLUGIN_ID = "cordova-plugin-firebasex-performance";

var ANDROID_PROJECT_ROOT = "platforms/android";
var ROOT_GRADLE_FILEPATH = ANDROID_PROJECT_ROOT + "/build.gradle";
var APP_GRADLE_FILEPATH = ANDROID_PROJECT_ROOT + "/app/build.gradle";

var PERF_GRADLE_PLUGIN_CLASS_DEF = "com.google.firebase:perf-plugin";
var PERF_GRADLE_PLUGIN_DEF = "com.google.firebase.firebase-perf";

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

    // Override with values from config.xml
    try {
        var configXmlPath = path.join("config.xml");
        if (fs.existsSync(configXmlPath)) {
            var configXml = fs.readFileSync(configXmlPath, "utf-8");
            var pluginRegex = new RegExp('<plugin[^>]+name="' + PLUGIN_ID + '"[^>]*>(.*?)</plugin>', "s");
            var pluginMatch = configXml.match(pluginRegex);
            if (pluginMatch) {
                var varRegex = /<variable\s+name="([^"]+)"\s+value="([^"]+)"\s*\/>/g;
                var varMatch;
                while ((varMatch = varRegex.exec(pluginMatch[1])) !== null) {
                    variables[varMatch[1]] = varMatch[2];
                }
            }
        }
    } catch (e) {
        console.warn("Could not read config.xml: " + e.message);
    }

    // Override with values from package.json
    try {
        var packageJsonPath = path.join("package.json");
        if (fs.existsSync(packageJsonPath)) {
            var packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            if (packageJson.cordova && packageJson.cordova.plugins && packageJson.cordova.plugins[PLUGIN_ID]) {
                var pluginVars = packageJson.cordova.plugins[PLUGIN_ID];
                for (var key in pluginVars) {
                    variables[key] = pluginVars[key];
                }
            }
        }
    } catch (e) {
        console.warn("Could not read package.json: " + e.message);
    }

    return variables;
}

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

module.exports = function (context) {
    var pluginVariables = getPluginVariables();

    // Handle ANDROID_FIREBASE_PERFORMANCE_MONITORING - add perf gradle plugin
    if (pluginVariables["ANDROID_FIREBASE_PERFORMANCE_MONITORING"] === "true") {
        var perfGradlePluginVersion = pluginVariables["ANDROID_FIREBASE_PERF_GRADLE_PLUGIN_VERSION"] || "2.0.1";
        addDependencyToRootGradle(PERF_GRADLE_PLUGIN_CLASS_DEF + ":" + perfGradlePluginVersion);
        applyPluginToAppGradle(PERF_GRADLE_PLUGIN_DEF);
    }

    // Handle FIREBASE_PERFORMANCE_COLLECTION_ENABLED in iOS plist
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
