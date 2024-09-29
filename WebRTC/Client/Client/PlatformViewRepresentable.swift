//
//  PlatformViewRepresentable.swift
//  Client
//
//  Created by Giovanna Zanardini on 29/09/24.
//
// https://gist.github.com/insidegui/97d821ca933c8627e7f614bc1d6b4983#file-platformviewrepresentable-swift
//

import SwiftUI
import WebRTC

#if os(iOS) || os(tvOS)
public typealias PlatformView = UIView
public typealias PlatformViewRepresentable = UIViewRepresentable
public typealias PlatformRTCMTLVideoView = RTCMTLVideoView
#elseif os(macOS)
public typealias PlatformView = NSView
public typealias PlatformViewRepresentable = NSViewRepresentable
public typealias PlatformRTCMTLVideoView = RTCMTLNSVideoView
#endif

/// Implementers get automatic `UIViewRepresentable` conformance on iOS
/// and `NSViewRepresentable` conformance on macOS.
public protocol PlatformAgnosticViewRepresentable: PlatformViewRepresentable {
    associatedtype PlatformViewType

    func makePlatformView(context: Context) -> PlatformViewType
    func updatePlatformView(_ platformView: PlatformViewType, context: Context)
}

#if os(iOS) || os(tvOS)
public extension PlatformAgnosticViewRepresentable where UIViewType == PlatformViewType {
    func makeUIView(context: Context) -> UIViewType {
        makePlatformView(context: context)
    }

    func updateUIView(_ uiView: UIViewType, context: Context) {
        updatePlatformView(uiView, context: context)
    }
}
#elseif os(macOS)
public extension PlatformAgnosticViewRepresentable where NSViewType == PlatformViewType {
    func makeNSView(context: Context) -> NSViewType {
        makePlatformView(context: context)
    }

    func updateNSView(_ nsView: NSViewType, context: Context) {
        updatePlatformView(nsView, context: context)
    }
}
#endif

struct VideoView: PlatformAgnosticViewRepresentable {
    var rtcTrack: RTCVideoTrack
    
    func makePlatformView(context: Context) -> PlatformRTCMTLVideoView {
        return PlatformRTCMTLVideoView()
    }
    
    func updatePlatformView(_ view: PlatformRTCMTLVideoView, context: Context) {
        rtcTrack.add(view)
    }
}
