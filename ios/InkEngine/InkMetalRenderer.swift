import UIKit
import Metal
import MetalKit

public struct MetalInkVertex {
    public var position: SIMD2<Float>
    public var color: SIMD4<Float>
    public var width: Float

    public init(position: SIMD2<Float>, color: SIMD4<Float>, width: Float) {
        self.position = position
        self.color = color
        self.width = width
    }
}

public class InkMetalView: MTKView, MTKViewDelegate {
    private var commandQueue: MTLCommandQueue?
    private var pipelineState: MTLRenderPipelineState?
    private var vertexBuffer: MTLBuffer?
    private var vertexCount: Int = 0

    public override init(frame frameRect: CGRect, device: MTLDevice?) {
        let dev = device ?? MTLCreateSystemDefaultDevice()
        super.init(frame: frameRect, device: dev)
        commonInit()
    }

    public required init(coder: NSCoder) {
        super.init(coder: coder)
        self.device = MTLCreateSystemDefaultDevice()
        commonInit()
    }

    private func commonInit() {
        guard let device = self.device else { return }
        self.delegate = self
        self.isOpaque = false
        self.clearColor = MTLClearColor(red: 0, green: 0, blue: 0, alpha: 0)
        self.preferredFramesPerSecond = 120 // ProMotion 120 FPS
        self.commandQueue = device.makeCommandQueue()
        setupPipeline(device: device)
    }

    private func setupPipeline(device: MTLDevice) {
        let metalShaderSource = """
        #include <metal_stdlib>
        using namespace metal;

        struct VertexIn {
            float2 position [[attribute(0)]];
            float4 color [[attribute(1)]];
            float width [[attribute(2)]];
        };

        struct VertexOut {
            float4 position [[position]];
            float4 color;
        };

        vertex VertexOut inkVertexShader(uint vertexID [[vertex_id]],
                                         constant VertexIn *vertices [[buffer(0)]],
                                         constant float2 &viewportSize [[buffer(1)]]) {
            VertexOut out;
            float2 pixelSpacePosition = vertices[vertexID].position;
            out.position = float4(0.0, 0.0, 0.0, 1.0);
            out.position.xy = (pixelSpacePosition / (viewportSize / 2.0)) - float2(1.0, 1.0);
            out.position.y = -out.position.y;
            out.color = vertices[vertexID].color;
            return out;
        }

        fragment float4 inkFragmentShader(VertexOut in [[stage_in]]) {
            return in.color;
        }
        """

        guard let library = try? device.makeLibrary(source: metalShaderSource, options: nil),
              let vertexFunc = library.makeFunction(name: "inkVertexShader"),
              let fragmentFunc = library.makeFunction(name: "inkFragmentShader") else {
            return
        }

        let desc = MTLRenderPipelineDescriptor()
        desc.vertexFunction = vertexFunc
        desc.fragmentFunction = fragmentFunc
        desc.colorAttachments[0].pixelFormat = self.colorPixelFormat
        desc.colorAttachments[0].isBlendingEnabled = true
        desc.colorAttachments[0].rgbBlendOperation = .add
        desc.colorAttachments[0].alphaBlendOperation = .add
        desc.colorAttachments[0].sourceRGBBlendFactor = .sourceAlpha
        desc.colorAttachments[0].sourceAlphaBlendFactor = .sourceAlpha
        desc.colorAttachments[0].destinationRGBBlendFactor = .oneMinusSourceAlpha
        desc.colorAttachments[0].destinationAlphaBlendFactor = .oneMinusSourceAlpha

        self.pipelineState = try? device.makeRenderPipelineState(descriptor: desc)
    }

    public func updateMesh(vertices: [MetalInkVertex]) {
        guard let device = self.device, !vertices.isEmpty else {
            self.vertexCount = 0
            return
        }
        self.vertexCount = vertices.count
        let size = MemoryLayout<MetalInkVertex>.stride * vertices.count
        self.vertexBuffer = device.makeBuffer(bytes: vertices, length: size, options: .storageModeShared)
        self.setNeedsDisplay()
    }

    // MARK: - MTKViewDelegate
    public func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {}

    public func draw(in view: MTKView) {
        guard let drawable = view.currentDrawable,
              let descriptor = view.currentRenderPassDescriptor,
              let pipeline = self.pipelineState,
              let buffer = self.vertexBuffer,
              let commandQueue = self.commandQueue,
              let commandBuffer = commandQueue.makeCommandBuffer(),
              let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: descriptor) else {
            return
        }

        var viewportSize = SIMD2<Float>(Float(view.drawableSize.width), Float(view.drawableSize.height))
        encoder.setRenderPipelineState(pipeline)
        encoder.setVertexBuffer(buffer, offset: 0, index: 0)
        encoder.setVertexBytes(&viewportSize, length: MemoryLayout<SIMD2<Float>>.size, index: 1)
        encoder.drawPrimitives(type: .triangleStrip, vertexStart: 0, vertexCount: self.vertexCount)
        encoder.endEncoding()

        commandBuffer.present(drawable)
        commandBuffer.commit()
    }
}
