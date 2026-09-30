import UIKit
import WebKit

@objc public class PencilInteractionManager: NSObject, UIPencilInteractionDelegate {
    public weak var webView: WKWebView?
    private var pencilInteraction: UIPencilInteraction?
    private var hoverRecognizer: UIHoverGestureRecognizer?

    public init(webView: WKWebView) {
        self.webView = webView
        super.init()
        setupPencilInteraction()
        setupHover()
    }

    private func setupPencilInteraction() {
        let interaction = UIPencilInteraction()
        interaction.delegate = self
        self.pencilInteraction = interaction
        self.webView?.addInteraction(interaction)
    }

    private func setupHover() {
        let hover = UIHoverGestureRecognizer(target: self, action: #selector(handleHover(_:)))
        self.hoverRecognizer = hover
        self.webView?.addGestureRecognizer(hover)
    }

    // MARK: - UIPencilInteractionDelegate
    public func pencilInteractionDidTap(_ interaction: UIPencilInteraction) {
        let action: String
        switch UIPencilInteraction.preferredTapAction {
        case .switchEraser:
            action = "switchEraser"
        case .switchPrevious:
            action = "switchPrevious"
        case .showColorPalette:
            action = "showColorPalette"
        case .showInkAttributes:
            action = "showInkAttributes"
        default:
            action = "switchEraser"
        }

        let js = "window.InkEngineNative && window.InkEngineNative.onPencilDoubleTap('\(action)');"
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    // iOS 17.5+ Apple Pencil Pro Squeeze & Hover Pose support
    @available(iOS 17.5, *)
    public func pencilInteraction(_ interaction: UIPencilInteraction, didReceiveSqueeze squeeze: UIPencilHoverPose) {
        let js = "window.InkEngineNative && window.InkEngineNative.onPencilSqueeze();"
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    @objc private func handleHover(_ recognizer: UIHoverGestureRecognizer) {
        guard let view = recognizer.view else { return }
        let loc = recognizer.location(in: view)

        var altitude: Double = 0.0
        var azimuth: Double = 0.0
        var roll: Double = 0.0

        if #available(iOS 16.4, *) {
            altitude = Double(recognizer.altitudeAngle)
            azimuth = Double(recognizer.azimuthAngle(in: view))
        }

        if #available(iOS 17.5, *) {
            roll = Double(recognizer.rollAngle)
        }

        let js = """
        window.InkEngineNative && window.InkEngineNative.onPencilHover({
            x: \(loc.x),
            y: \(loc.y),
            altitude: \(altitude),
            azimuth: \(azimuth),
            roll: \(roll)
        });
        """
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
