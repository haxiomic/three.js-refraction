import three.AmbientLight;
import three.DirectionalLight;
import three.WebGLRenderer;
import three.examples.jsm.loaders.rgbeloader.RGBELoader;
import three.Scene;
import three.Texture;
import three.WebGLRenderTarget;
import three.Vector3;
import three.TextureLoader;
import tool.IBLGenerator;
import haxe.io.Path;

class EnvironmentManager {

	public var environmentPath(default, null): Null<String> = null;
	public final environmentSun: DirectionalLight;
	public final environmentAmbient: AmbientLight;
	final renderer: WebGLRenderer;
	final scene: Scene;

	public function new(renderer: WebGLRenderer, scene: Scene) {
		this.renderer = renderer;
		this.scene = scene;

		environmentSun = new DirectionalLight(0xFFFFFF, 0);
		environmentSun.castShadow = true;
		environmentSun.shadow.bias = -0.001;
		environmentSun.shadow.radius = 7;
		environmentSun.layers.enable(Blended);
		scene.add(environmentSun);

		environmentAmbient = new AmbientLight(0x000000, 1);
		scene.add(environmentAmbient);
	}

	var _pmremRenderTarget: Null<WebGLRenderTarget>;
	public function setEnvironmentMapPath(path: Null<String>, ?onLoaded: (envMap: Texture) -> Void, ?onError: String -> Void) {
		if (path == environmentPath) return; // no change
		if (onLoaded == null) onLoaded = (e) -> {};
		if (onError == null) onError = (e) -> {};
		environmentPath = path;

		if (path != null) {
			var ext = Path.extension(path);

			switch ext.toLowerCase() {
				case 'hdr':
					var iblGenerator = new tool.IBLGenerator(renderer);
					iblGenerator.compileEquirectangularShader();
					new RGBELoader()
					.setDataType(FloatType)
					.load(
						path,
						(texture, texData) -> {
						if (_pmremRenderTarget != null) {
							_pmremRenderTarget.dispose();
						}

						_pmremRenderTarget = iblGenerator.fromEquirectangular(texture);
						iblGenerator.dispose();
						_pmremRenderTarget.texture.sourceFile = path;
						setEnvironmentMap(_pmremRenderTarget.texture);
						onLoaded(_pmremRenderTarget.texture);
					});
				case 'png':
					new TextureLoader().load(path, texture -> {
						texture.minFilter = NearestFilter;
						texture.magFilter = NearestFilter;
						texture.type = UnsignedByteType;
						texture.format = RGBEFormat;
						texture.encoding = RGBDEncoding;
						texture.mapping = CubeUVReflectionMapping;
						texture.generateMipmaps = false;
						texture.flipY = false;
						texture.sourceFile = path;
						setEnvironmentMap(texture);
						onLoaded(texture);
					});
				default:
					var error = 'Unknown environment extension $ext';
					js.Browser.console.error(error);
					onError(error);
			}
		}
	}

	public function setEnvironmentMap(texture: Texture) {
		if (scene.environment != null) {
			scene.environment.dispose();
		}
		scene.environment = texture;

		applyAdditionalLighting(texture.sourceFile);
	}

	function applyAdditionalLighting(sourceFile: Null<String>) {
		var mapName = if (sourceFile != null) {
			var filename = Path.withoutDirectory(sourceFile);
			filename.substr(0, filename.indexOf('.')).toLowerCase();
		} else null;

		var additionalLighting = switch mapName {
			case 'winter_evening_2k': {
				sunPosition: new Vector3(0.66, 0.4, -0.03).normalize(),
				sunColor: 0xFFFFFF,
				sunIntensity: 1.0,
				sunShadowRadius: 7,
				ambient: 0x000000,
				exposure: 1.0,
			}
			case 'winter_lake_01_1k': {
				sunPosition: new Vector3(1.17, 0.55, 0.88).normalize(),
				sunColor: 0xfff279,
				sunIntensity: 1.,
				sunShadowRadius: 10,
				ambient: 0x000021,
				exposure: 0.9,
			}
			case 'snowy_park_01_1k': {
				sunPosition: new Vector3(0.31, 0.48, 0.902).normalize(),
				sunColor: 0xffffff,
				sunIntensity: 0.8,
				sunShadowRadius: 6,
				ambient: 0x000000,
				exposure: 1.2,
			}
			case 'night_bridge_2k': {
				sunPosition: new Vector3(0.7, 0.21, 0.579).normalize(),
				sunColor: 0xFFFFFF,
				sunIntensity: 1.8,
				sunShadowRadius: 13,
				ambient: 0x000000,
				exposure: 0.7,
			}
			case 'venice_sunset_2k': {
				sunPosition: new Vector3(1.2, 0.25, 0.88).normalize(),
				sunColor: 0xFFbb31,
				sunIntensity: 2,
				sunShadowRadius: 12,
				ambient: 0x00003a,
				exposure: 0.7,
			}
			case 'blouberg_sunrise_1_2k': {
				sunPosition: new Vector3(-59, 43, -26).normalize(),
				sunColor: 0xFFbb31,
				sunIntensity: 2,
				sunShadowRadius: 12,
				ambient: 0x000000,
				exposure: 1.0,
			}
			case 'the_sky_is_on_fire_2k': {
				sunPosition: new Vector3(1.71, 0.08, 2.41).normalize(),
				sunColor: 0xff7741,
				sunIntensity: 1,
				sunShadowRadius: 12,
				ambient: 0x000000,
				exposure: 1.0,
			}
			case 'snowy_forest_path_01_1k': {
				sunPosition: new Vector3(1.37, 0.45, 0.84).normalize(),
				sunColor: 0xffffff,
				sunIntensity: 1.0,
				sunShadowRadius: 3,
				ambient: 0x000000,
				exposure: 1.0,
			}
			case 'kiara_1_dawn_2k': {
				sunPosition: new Vector3(0.64, 0.35, 0.5).normalize(),
				sunColor: 0xff7237,
				sunIntensity: 1.0,
				sunShadowRadius: 5,
				ambient: 0x000000,
				exposure: 0.9,
			}
			case 'birchwood_2k': {
				sunPosition: new Vector3(0.83, 0.21, 0.50).normalize(),
				sunColor: 0xffdcc8,
				sunIntensity: 4.,
				sunShadowRadius: 15,
				ambient: 0x000000,
				exposure: 0.7,
			}
			default: {
				sunPosition: new Vector3(),
				sunColor: 0xFFFFFF,
				sunIntensity: 0,
				sunShadowRadius: 0,
				ambient: 0x000000,
				exposure: 1,
			}
		}

		environmentSun.color.set(additionalLighting.sunColor);
		environmentSun.intensity = additionalLighting.sunIntensity;
		environmentSun.position.copy(additionalLighting.sunPosition);
		environmentSun.shadow.radius = additionalLighting.sunShadowRadius;
		environmentSun.visible = true;
		environmentAmbient.color.set(additionalLighting.ambient);
		// renderer.toneMappingExposure = additionalLighting.exposure;
		// renderer.shadowMap.enabled = additionalLighting.sunIntensity > 0;
	}

}