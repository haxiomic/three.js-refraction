import Environments.EnvironmentManager;
import VectorMath;
import app.InteractionEventsManager;
import dat_gui.GUI;
import js.Browser.*;
import js.lib.Float32Array;
import rendering.Background;
import rendering.FragmentRenderer;
import rendering.PostProcess;
import rendering.RenderTargetStore;
import rendering.WebGLRenderTarget;
import three.AmbientLight;
import three.BoxGeometry;
import three.BufferGeometry;
import three.Color;
import three.InterleavedBuffer;
import three.InterleavedBufferAttribute;
import three.Mesh;
import three.MeshPhysicalMaterial;
import three.Points;
import three.RawShaderMaterial;
import three.SphereGeometry;
import three.Uniform;

// settings
var pixelRatio = min(window.devicePixelRatio, 1);

final scene = new three.Scene();
final camera = new three.PerspectiveCamera(100, 1, 0.0001, 10);
final canvas = {
	var _ = document.createCanvasElement();
	_.style.position = 'absolute';
	_.style.zIndex = '-1';
	_.style.top = '0';
	_.style.left = '0';
	_.style.width = '100%';
	_.style.height = '100%';
	_;
}

final renderer = {
	var _ = new three.WebGLRenderer({
		canvas: canvas,
		antialias: true,
		powerPreference: 'high-performance',
	});
	_.autoClear = false;
	_.autoClearColor = false;
	_.autoClearDepth = false;
	_.shadowMap.enabled = false;

	_.outputEncoding = sRGBEncoding;
	_.toneMapping = ACESFilmicToneMapping;

	_.toneMappingExposure = 0.2;
	_.physicallyCorrectLights = true;
	_;
}
final gl = renderer.getContext();

final eventManager = new InteractionEventsManager(canvas);

final arcBallControl = new control.ArcBallControl({
	interactionEventsManager: eventManager,
	radius: 1.9,
	dragSpeed: 4.,
	zoomSpeed: 1.,
});

final uTime_s = new Uniform(0.0);

final environmentManager = new EnvironmentManager(renderer, scene);
final background = new Background();

// post processing
final fragmentRenderer = new FragmentRenderer(renderer);
final renderTargetStore = new RenderTargetStore();
final postProcess = new PostProcess(renderer);

var bloomEnabled = false;
var bloomAlpha = 0.39;
var bloomExponent = 2.2;
var bloomSigma = 0.38;
var bloomBlurRadius = 0.027;
var bloomBlurDownsampleIterations = 1;

var overrideTransmissionFramebuffer = false;

final sphere = {
	var _ = new Mesh(new three.SphereGeometry(1, 80, 80), new MeshPhysicalMaterial({
		roughness: 0.0,
		color: 0xffffff,
		transmission: 0.9,
		attenuationTint: new Color(0x59ff),
		attenuationDistance: 1.7,
		clearcoat: 0.9
	}));
	_.material.thickness = 1.8;
	_;
}

final cube = new Mesh(new BoxGeometry(0.4, 0.4, 0.4), new MeshPhysicalMaterial({
	color: 0xAAFFAA,
	emissive: 0xFFFFFF,
	emissiveIntensity: 30,
}));

final particles = {
	var starCount = 10000;
	// [x,y,z,r,g,b,a]
	var strideElements = 7;
	var geomArrayBuffer = new Float32Array(starCount * strideElements);
	for (i in 0...starCount) {
		var xyz = vec3(Math.random(), Math.random(), Math.random());
		var rgba = vec4(
			Math.random(),
			Math.random(),
			Math.random(),
			1.0
		);
		var offset = i * strideElements;
		xyz.copyIntoArray(geomArrayBuffer, offset);
		rgba.copyIntoArray(geomArrayBuffer, offset + 3);
	}
	var interleavedBuffer = new InterleavedBuffer(geomArrayBuffer, strideElements);
	var particleGeom = new BufferGeometry();
	particleGeom.setAttribute('position', new InterleavedBufferAttribute(interleavedBuffer, 3, 0));
	particleGeom.setAttribute('special', new InterleavedBufferAttribute(interleavedBuffer, 4, 3));
	
	var m = new StarsMaterial({
		height: 0.25,

		winding: 7.,
		windingExponent: 1.6,
		bulgeWinding: 0.8,
		bulgeWindingExponent: 1.6,
		armSpread: 1.9,
		armSpreadExponent: -0.1,
	});
	var _ = new Points(particleGeom, m);
	_.onBeforeRender = (renderer, scene, camera, geometry, material, group) -> {
		var rt: WebGLRenderTarget = cast renderer.getRenderTarget();
		var height: Float = rt != null ? rt.height : gl.drawingBufferHeight;
		m.pointScale.value = height * 0.005;
	};
	_;
}

function main() {
	document.body.appendChild(canvas);

	var amb = new AmbientLight(0xFFFFFF, 0.2);
	scene.add(amb);

	// scene.add(cube);
	scene.add(particles);
	scene.add(sphere);

	scene.add(background);

	camera.position.z = 2;
	camera.position.y = 1;

	environmentManager.setEnvironmentMapPath(
		'assets/env/venice_sunset_2k.rgbd.png',
		(env) -> {
			// environmentManager.environmentSun.color.setHex(0xffc200);
			environmentManager.environmentSun.visible = false;
		},
		(error) -> console.error(error)
	);

	GUI.init();

	animationFrame(window.performance.now());
}

var animationFrame_lastTime_ms = -1.0;
function animationFrame(time_ms: Float) {
	var time_s = time_ms / 1000;
	var dt_ms = animationFrame_lastTime_ms > 0 ? (time_ms - animationFrame_lastTime_ms) : 0.0;
	var dt_s = dt_ms / 1000;
	animationFrame_lastTime_ms = time_ms;

	uTime_s.value = time_s;

	var gl = renderer.getContext();

	// Rendering Pipeline
	var targetSize = floor(vec2(window.innerWidth, window.innerHeight) * pixelRatio);

	// resize canvas and camera projection aspect if needed
	if (targetSize != vec2(gl.drawingBufferWidth, gl.drawingBufferHeight)) {
		canvas.width = floor(targetSize.x);
		canvas.height = floor(targetSize.y);
	}

	var newAspect = targetSize.x / targetSize.y;
	if (camera.aspect != newAspect) {
		camera.aspect = newAspect;
		camera.updateProjectionMatrix();
	}

	update(time_s, dt_s);

	{ // render pipeline
		var usePostProcess = bloomEnabled && bloomAlpha > 0;

		var mainRenderTarget = usePostProcess ? renderTargetStore.acquire('main', targetSize.x, targetSize.y, {
			magFilter: LinearFilter,
			minFilter: LinearFilter,
			depthBuffer: true,
			type: HalfFloatType,
			encoding: LinearEncoding,
			msaaSamples: 4,
		}) : null;

		// transmission pass framebuffer
		if (overrideTransmissionFramebuffer) (renderer: Dynamic)._transmissionRenderTarget = renderTargetStore.acquire('transmission', targetSize.x, targetSize.y, {
			magFilter: LinearFilter,
			minFilter: LinearMipmapLinearFilter,
			depthBuffer: true,
			type: HalfFloatType,
			encoding: LinearEncoding,
			generateMipmaps: true,
			msaaSamples: 4,
		});

		// render scene
		var _toneMapping = renderer.toneMapping;
		if (usePostProcess) {
			renderer.toneMapping = NoToneMapping;
		}

		renderer.setRenderTarget(mainRenderTarget);
		renderer.setViewport(0, 0, targetSize.x, targetSize.y);
		renderer.clear(true, true, true);
		renderer.render(scene, camera);

		// apply bloom
		if (bloomAlpha > 0 && bloomEnabled) {
			// generate blurred copy of main render target
			var blurredMainLinearTexture = postProcess.blur('mainBlurred', mainRenderTarget.texture, bloomBlurRadius, bloomSigma, bloomBlurDownsampleIterations);
			// blend onto main target
			fragmentRenderer.render(mainRenderTarget, shaders.BloomBlend.get(blurredMainLinearTexture, bloomAlpha, bloomExponent));
		}

		// copy to canvas and apply tonemapping
		if (usePostProcess) {
			renderer.toneMapping = _toneMapping; 
			postProcess.blitViaBasicMaterial(mainRenderTarget.texture, null);
		}
	}


	window.requestAnimationFrame(animationFrame);
}

function update(time_s: Float, dt_s: Float) {
	arcBallControl.step(dt_s);
	arcBallControl.applyToCamera(camera);
}

typedef GalaxyShape = {
	height: Float,
	winding: Float,
	windingExponent: Float,
	bulgeWinding: Float,
	bulgeWindingExponent: Float,
	armSpread: Float,
	armSpreadExponent: Float,
}

private class StarsMaterial extends RawShaderMaterial {

	public var pointScale: Uniform<Float>;

	public function new(shape: GalaxyShape) {
		var pointScale = new Uniform(1.);
		super({
			uniforms: {
				shape: new Uniform(shape),
				pointScale: pointScale,
				time_s: uTime_s,
			},
			vertexShader: '
				precision highp float;

				uniform mat4 projectionMatrix;
				uniform mat4 modelViewMatrix;
				uniform float pointScale;
				attribute vec3 position;

				attribute vec4 special;

				varying vec2 vBlackBodyCoordinate;
				varying float vIntensity;
				varying float vPointScale;

				uniform float time_s;

				struct GalaxyShape {
					float height;
					float winding;
					float windingExponent;
					float bulgeWinding;
					float bulgeWindingExponent;
					float armSpread;
					float armSpreadExponent;
				};
				uniform GalaxyShape shape;

				void main() {
					vec3 rand = position;
					
					vec3 pos;
					float r;
					if (false) {
						r = pow(rand.x, 5.);

						// spiral shape parameters
						// https://www.desmos.com/calculator/iwl6c2mqfe

						float angle =
							// base spiral a ~ r
							shape.winding * pow(r, shape.windingExponent)
							// core tight spiral
							- shape.bulgeWinding * pow(r, -shape.bulgeWindingExponent)

							// angle offset
							+ shape.armSpread * pow(rand.y, shape.armSpreadExponent) / pow(r, 0.9)

							// left or right arm
							+ (rand.z > 0.5 ? 3.14159 : 0.);

						float x = r * 4.;
						float y = pow(1. + x, -x) * 0.1 * (rand.z > 0.5 ? 1. : -1.) * rand.x;

						pos = vec3(
							cos(angle) * r,
							y,
							sin(angle) * r
						);
					}

					if (true) {
						r = special.r;
						pos = r * normalize(rand * 2. - 1.);
					}

					vec4 eyeSpace = modelViewMatrix * vec4(pos, 1.0);
					gl_Position = projectionMatrix * eyeSpace;

					// star color and brightness
					{
						float u = special.r; // uniform random number 0 - 1
						float v = special.g; // uniform random number 0 - 1

						float I = 6. + v * 2.;
						I *= pow((sin(r * 20. + time_s) * 0.5 + 0.5), 2.);

						// inverse square intensity falloff
						float eyeSpaceDistanceSq = dot(eyeSpace.xyz, eyeSpace.xyz);
						I /= eyeSpaceDistanceSq;

						vIntensity = I;

						// set sprite size to fit airy disk (approximate)
						vPointScale = pointScale / sqrt(eyeSpaceDistanceSq);
						gl_PointSize = min(vPointScale, 1000.);
					}
				}
			',
			fragmentShader: '
				precision highp float;

				varying float vIntensity;
				varying float vPointScale;

				// https://www.shadertoy.com/view/tlc3zM
				float fastAiry(float x) {
					#define gauss(x) exp(-.5*((x)*(x)) )
					return (abs(x) < 1.88 ? gauss(x/1.4) : abs(x) > 6. ? 1.35/abs(x*x*x) : ( gauss(x/1.4) + 2.7/abs(x*x*x) )/2. );
					#undef gauss
				}

				void main() {
					float I = vIntensity;

					float d = length(gl_PointCoord.xy - vec2(0.5));

					// force circular bound at sprite edges
					I *= smoothstep(0.5, 0.45, d);

					vec3 c = vec3(1.) * I;
					
					gl_FragColor = vec4(c, 1.0);

					// if (gl_PointCoord.y < 0.05) gl_FragColor = vec4(vec3(0., 1., 0.), 1.0);
				}
			',
			blending: AdditiveBlending,
			depthWrite: false,
			depthTest: true,
			transparent: false,
		});
		this.pointScale = pointScale;
	}

}