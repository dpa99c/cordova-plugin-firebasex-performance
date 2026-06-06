// swift-tools-version:5.9

import PackageDescription

let firebaseSDKVersion: Version = "12.14.0"

let package = Package(
    name: "cordova-plugin-firebasex-performance",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "cordova-plugin-firebasex-performance",
            targets: ["cordova-plugin-firebasex-performance"]
        )
    ],
    dependencies: [
        .package(path: "../cordova-plugin-firebasex-core"),
        .package(url: "https://github.com/apache/cordova-ios.git", branch: "master"),
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", exact: firebaseSDKVersion)
    ],
    targets: [
        .target(
            name: "cordova-plugin-firebasex-performance",
            dependencies: [
                .product(name: "cordova-plugin-firebasex-core", package: "cordova-plugin-firebasex-core"),
                .product(name: "Cordova", package: "cordova-ios"),
                .product(name: "FirebasePerformance", package: "firebase-ios-sdk")
            ],
            path: "src/ios",
            publicHeadersPath: "."
        )
    ]
)