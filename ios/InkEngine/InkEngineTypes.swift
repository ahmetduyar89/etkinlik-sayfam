import Foundation
import CoreGraphics

public struct InkPointData: Codable {
    public var x: Double
    public var y: Double
    public var p: Double?
    public var timestamp: Double?
    public var pressure: Double?
    public var velocity: Double?
    public var tiltX: Double?
    public var tiltY: Double?
    public var twist: Double?

    public init(x: Double, y: Double, p: Double? = nil, timestamp: Double? = nil, pressure: Double? = nil, velocity: Double? = nil, tiltX: Double? = nil, tiltY: Double? = nil, twist: Double? = nil) {
        self.x = x
        self.y = y
        self.p = p
        self.timestamp = timestamp
        self.pressure = pressure
        self.velocity = velocity
        self.tiltX = tiltX
        self.tiltY = tiltY
        self.twist = twist
    }
}

public struct InkStrokePayload: Codable {
    public var id: String
    public var tool: String
    public var color: String
    public var width: Double
    public var opacity: Double?
    public var penType: String?
    public var points: [InkPointData]
    public var inkVersion: Int?

    public init(id: String, tool: String, color: String, width: Double, opacity: Double? = nil, penType: String? = nil, points: [InkPointData], inkVersion: Int? = 2) {
        self.id = id
        self.tool = tool
        self.color = color
        self.width = width
        self.opacity = opacity
        self.penType = penType
        self.points = points
        self.inkVersion = inkVersion
    }
}

public struct InkViewportConfig: Codable {
    public var scale: Double
    public var tx: Double
    public var ty: Double
    public var pageWidth: Double?
    public var pageHeight: Double?

    public init(scale: Double = 1.0, tx: Double = 0.0, ty: Double = 0.0, pageWidth: Double? = nil, pageHeight: Double? = nil) {
        self.scale = scale
        self.tx = tx
        self.ty = ty
        self.pageWidth = pageWidth
        self.pageHeight = pageHeight
    }
}
