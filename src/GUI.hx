#if !macro
import three.TextureEncoding;
import three.ToneMapping;
import three.MeshPhysicalMaterial;
final gui = new dat_gui.GUI({
	closed: false
});

@:access(Main)
function init() {
	gui.domElement.style.userSelect = 'none';
	gui.domElement.parentElement.style.zIndex = '1000';
	var renderer = Main.renderer;

	addProperty(gui, Main.overrideTransmissionFramebuffer).name('Fix Transmission').onChange(function(value) {
		if ((renderer: Dynamic)._transmissionRenderTarget) {
			(renderer: Dynamic)._transmissionRenderTarget.dispose();
			(renderer: Dynamic)._transmissionRenderTarget = null;
		}
	});

	{	// Rendering pipeline
		var g = gui.addFolder('Rendering');
		addProperty(g, Main.pixelRatio, 0.1, 4).name('resolution');
		addProperty(g, Main.camera.fov, 1, 200, (v) -> Main.camera.updateProjectionMatrix());

		g.add({toneMapping: renderer.toneMapping}, 'toneMapping', {
			'NoToneMapping': NoToneMapping,
			'LinearToneMapping': LinearToneMapping,
			'ReinhardToneMapping': ReinhardToneMapping,
			'CineonToneMapping': CineonToneMapping,
			'ACESFilmicToneMapping': ACESFilmicToneMapping
		}).onChange(v -> {
			renderer.toneMapping = Std.parseInt(v);
			renderer.outputEncoding = renderer.outputEncoding;
		});

		g.add({outputEncoding: renderer.outputEncoding}, 'outputEncoding', {
			'LinearEncoding': TextureEncoding.LinearEncoding,
			'sRGBEncoding': TextureEncoding.sRGBEncoding,
			'GammaEncoding': TextureEncoding.GammaEncoding,
		})
		.onChange(v -> {
			renderer.outputEncoding = Std.parseInt(v);
		});

		addProperty(g, renderer.toneMappingExposure, 0, 10);

		var environments = [
			'assets/env/winter_lake_01_1k.rgbd.png',
			'assets/env/venice_sunset_2k.rgbd.png',
			'assets/env/the_sky_is_on_fire_2k.rgbd.png',
			'assets/env/snowy_park_01_1k.rgbd.png',
			'assets/env/snowy_forest_path_01_1k.rgbd.png',
			'assets/env/night_bridge_2k.rgbd.png',
			'assets/env/kiara_1_dawn_2k.rgbd.png',
			'assets/env/blouberg_sunrise_1_2k.rgbd.png',
			'assets/env/birchwood_2k.rgbd.png',
		];
		g.add({p: Main.environmentManager.environmentPath}, 'p', environments).onChange(p -> {
			Main.environmentManager.setEnvironmentMapPath(p, (e) -> gui.updateDisplay());
		}).name('Environment');

		addProperty(g, Main.background.roughness, 0, 1);

		// bloom
		addProperty(g, Main.bloomEnabled);
		addProperty(g, Main.bloomAlpha);
		addProperty(g, Main.bloomExponent, 0, 4);
		addProperty(g, Main.bloomSigma);
		addProperty(g, Main.bloomBlurRadius, 0, 0.2);
		addProperty(g, Main.bloomBlurDownsampleIterations, 0, 4).step(1);
	}

	{	// Controls
		var g = gui.addFolder('Controls');
		var c = Main.arcBallControl;
		addProperty(g, c.dragSpeed, 0, 15);
		addProperty(g, c.zoomSpeed, 0, 20);
		addProperty(g, c.strength, 0, 1000);
		addProperty(g, c.damping, 0, 200);
	}

	{
		var g = gui;

		addMaterial(g, Main.cube.material, 'Cube');
		addMaterial(g, Main.sphere.material, 'Sphere');

		
		// addProperty(g, Main.environmentManager.environmentAmbient.intensity, 0, 10).name('Ambient intensity');
		// addProperty(g, Main.environmentManager.environmentAmbient.color).name('Ambient color');
		addProperty(g, Main.environmentManager.environmentSun.intensity, 0, 3).name('Sun intensity');
		addProperty(g, Main.environmentManager.environmentSun.color).name('Sun color');
		// addProperty(g, sphere.material.sheen);
	}
}

function addMaterial(g: dat_gui.GUI, material: MeshPhysicalMaterial, name: String) {
	var g = g.addFolder(name);
	var m = material;
	addProperty(g, m.roughness, 0, 1);
	addProperty(g, m.metalness, 0, 1);
	addProperty(g, m.clearcoat, 0, 1);
	addProperty(g, m.clearcoatRoughness, 0, 1);
	addProperty(g, m.reflectivity, 0, 1);
	addProperty(g, m.transmission, 0, 1);
	addProperty(g, m.ior, 0, 3);
	addProperty(g, m.thickness, 0, 3);
	addProperty(g, m.attenuationTint);
	addProperty(g, m.attenuationDistance, 0, 10);
	// addProperty(g, m.refractionRatio, 0, 1);
	addProperty(g, m.transparent);
	addProperty(g, m.emissiveIntensity, 0, 4);
	addProperty(g, m.color);
	addProperty(g, m.emissive);
	addProperty(g, m.opacity, 0, 1);
}

#end

#if macro
import haxe.macro.Expr;
import haxe.macro.Context;
#end

/**
	Little utility to better integrate with haxe properties
**/
macro function addProperty<T>(g: ExprOf<dat_gui.GUI>, fieldAccessExpr: ExprOf<T>, ?min: Float = 0, ?max: Float = 1, ?onChange: ExprOf<(v: T) -> Void>): ExprOf<dat_gui.GUI> {
	var name = switch fieldAccessExpr.expr {
		case EField(e, field): field;
		default: new haxe.macro.Printer().printExpr(fieldAccessExpr);
	}
	
	// check if three.Color
	var threeColor = Context.getType('three.Color');
	var type = Context.typeof(fieldAccessExpr);
	return if (Context.unify(type, threeColor)) {
		return macro {
			var color: three.Color = $fieldAccessExpr;
			$g.addColor({c: color.getHex()}, 'c')
			.name($v{name})
			.onChange((hex) -> {
				color.setHex(hex);
				var cb = $onChange;
				if (cb != null) cb(color);
			});
		};
	} else {
		macro {
			var o = {};
			// use native javascript setter as a proxy
			js.lib.Object.defineProperty(o, 'f', {
				set: (x) -> $fieldAccessExpr = x,
				get: () -> $fieldAccessExpr,
			});
			$g.add(o, 'f', $v{min}, $v{max})
				.name($v{name})
				.onChange(v -> {
					$fieldAccessExpr = v;
					var cb = $onChange;
					if (cb != null) cb(v);
				})
				.listen();
		}
	}

}