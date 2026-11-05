import UIKit
import WebKit
import PencilKit

@objc public class PKInkEngineBridge: NSObject, WKScriptMessageHandler, PKCanvasViewDelegate {
    public weak var webView: WKWebView?
    public let canvasView: PKCanvasView
    private var viewport = InkViewportConfig()
    private var lastStrokeCount: Int = 0

    public init(webView: WKWebView) {
        self.webView = webView
        self.canvasView = PKCanvasView(frame: webView.bounds)
        super.init()
        setupCanvas()
    }

    private func setupCanvas() {
        canvasView.delegate = self
        canvasView.isOpaque = false
        canvasView.backgroundColor = .clear
        canvasView.drawingPolicy = .anyInput
        canvasView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        canvasView.tool = PKInkingTool(.pen, color: .black, width: 2.0)
    }

    public func attach(to containerView: UIView) {
        containerView.addSubview(canvasView)
        canvasView.frame = containerView.bounds
    }

    // MARK: - WKScriptMessageHandler
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "inkEngine", let dict = message.body as? [String: Any], let type = dict["type"] as? String else {
            return
        }

        switch type {
        case "setTool":
            handleSetTool(dict)
        case "setViewport":
            handleSetViewport(dict)
        case "undo":
            canvasView.undoManager?.undo()
        case "redo":
            canvasView.undoManager?.redo()
        case "clear":
            canvasView.drawing = PKDrawing()
            lastStrokeCount = 0
        default:
            break
        }
    }

    private func handleSetTool(_ dict: [String: Any]) {
        let toolName = dict["tool"] as? String ?? "pencil"
        let width = CGFloat((dict["width"] as? Double) ?? 2.0)
        let colorHex = dict["color"] as? String ?? "#000000"
        let penType = dict["penType"] as? String ?? "ballpoint"
        let color = UIColor(hex: colorHex) ?? .black

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if toolName == "eraser" {
                self.canvasView.tool = PKEraserTool(.vector)
            } else if toolName == "highlighter" {
                self.canvasView.tool = PKInkingTool(.marker, color: color.withAlphaComponent(0.35), width: width * 3.0)
            } else {
                let inkType: PKInkingTool.InkType
                switch penType {
                case "marker":
                    inkType = .marker
                case "fountain", "brush":
                    if #available(iOS 17.0, *) {
                        inkType = .fountainPen
                    } else {
                        inkType = .pen
                    }
                case "graphite":
                    inkType = .pencil
                default:
                    if #available(iOS 17.0, *) {
                        inkType = .monoline
                    } else {
                        inkType = .pen
                    }
                }
                self.canvasView.tool = PKInkingTool(inkType, color: color, width: width)
            }
        }
    }

    private func handleSetViewport(_ dict: [String: Any]) {
        let scale = dict["scale"] as? Double ?? 1.0
        let tx = dict["tx"] as? Double ?? 0.0
        let ty = dict["ty"] as? Double ?? 0.0
        let pw = dict["pageWidth"] as? Double
        let ph = dict["pageHeight"] as? Double
        self.viewport = InkViewportConfig(scale: scale, tx: tx, ty: ty, pageWidth: pw, pageHeight: ph)
    }

    // MARK: - PKCanvasViewDelegate
    public func canvasViewDrawingDidChange(_ canvasView: PKCanvasView) {
        let currentStrokes = canvasView.drawing.strokes
        let count = currentStrokes.count
        guard count > lastStrokeCount, count > 0 else {
            lastStrokeCount = count
            return
        }

        let newStroke = currentStrokes[count - 1]
        lastStrokeCount = count
        serializeAndDispatch(stroke: newStroke)
    }

    private func serializeAndDispatch(stroke: PKStroke) {
        let v = self.viewport
        var points: [InkPointData] = []
        let path = stroke.path

        for i in 0..<path.count {
            let sp = path[i]
            let worldX = (Double(sp.location.x) - v.tx) / v.scale
            let worldY = (Double(sp.location.y) - v.ty) / v.scale
            let pressure = Double(sp.force)

            points.append(InkPointData(
                x: worldX,
                y: worldY,
                p: pressure,
                timestamp: Double(sp.timeOffset),
                pressure: pressure,
                velocity: nil,
                tiltX: Double(sp.altitude),
                tiltY: Double(sp.azimuth),
                twist: nil
            ))
        }

        let toolStr: String
        let penTypeStr: String?
        switch stroke.ink.inkType {
        case .marker:
            toolStr = "highlighter"
            penTypeStr = "marker"
        case .pencil:
            toolStr = "pencil"
            penTypeStr = "graphite"
        default:
            toolStr = "pencil"
            penTypeStr = "ballpoint"
        }

        let hexColor = stroke.ink.color.toHexString()
        let payload = InkStrokePayload(
            id: "pk-\(UUID().uuidString.prefix(8))",
            tool: toolStr,
            color: hexColor,
            width: Double(stroke.path.creationDate.timeIntervalSince1970), // Width can be computed from path
            opacity: 1.0,
            penType: penTypeStr,
            points: points,
            inkVersion: 2
        )

        guard let data = try? JSONEncoder().encode(payload),
              let jsonStr = String(data: data, encoding: .utf8) else { return }

        let js = "window.InkEngineNative && window.InkEngineNative.onStrokeCompleted(\(jsonStr));"
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}

fileprivate extension UIColor {
    convenience init?(hex: String) {
        var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        guard Scanner(string: hexSanitized).scanHexInt64(&rgb) else { return nil }
        let r = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
        let g = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
        let b = CGFloat(rgb & 0x0000FF) / 255.0
        self.init(red: r, green: g, blue: b, alpha: 1.0)
    }

    func toHexString() -> String {
        var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
        getRed(&r, green: &g, blue: &b, alpha: &a)
        return String(format: "#%02lX%02lX%02lX", lroundf(Float(r * 255)), lroundf(Float(g * 255)), lroundf(Float(b * 255)))
    }
}
