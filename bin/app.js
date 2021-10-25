(function ($global) { "use strict";
class EnvironmentManager {
	constructor(renderer,scene) {
		this.environmentPath = null;
		this.renderer = renderer;
		this.scene = scene;
		this.environmentSun = new three_DirectionalLight(16777215,0);
		this.environmentSun.castShadow = true;
		this.environmentSun.shadow.bias = -0.001;
		this.environmentSun.shadow.radius = 7;
		this.environmentSun.layers.enable(1);
		scene.add(this.environmentSun);
		this.environmentAmbient = new three_AmbientLight(0,1);
		scene.add(this.environmentAmbient);
	}
	setEnvironmentMapPath(path,onLoaded,onError) {
		if(path == this.environmentPath) {
			return;
		}
		if(onLoaded == null) {
			onLoaded = function(e) {
			};
		}
		if(onError == null) {
			onError = function(e) {
			};
		}
		this.environmentPath = path;
		let _gthis = this;
		if(path != null) {
			let ext = haxe_io_Path.extension(path);
			switch(ext.toLowerCase()) {
			case "hdr":
				let iblGenerator = new tool_IBLGenerator(this.renderer);
				iblGenerator.compileEquirectangularShader();
				new three_examples_jsm_loaders_rgbeloader_RGBELoader().setDataType(three_TextureDataType.FloatType).load(path,function(texture,texData) {
					if(_gthis._pmremRenderTarget != null) {
						_gthis._pmremRenderTarget.dispose();
					}
					_gthis._pmremRenderTarget = iblGenerator.fromEquirectangular(texture);
					iblGenerator.dispose();
					_gthis._pmremRenderTarget.texture.sourceFile = path;
					_gthis.setEnvironmentMap(_gthis._pmremRenderTarget.texture);
					onLoaded(_gthis._pmremRenderTarget.texture);
				});
				break;
			case "png":
				new three_TextureLoader().load(path,function(texture) {
					texture.minFilter = three_TextureFilter.NearestFilter;
					texture.magFilter = three_TextureFilter.NearestFilter;
					texture.type = three_TextureDataType.UnsignedByteType;
					texture.format = three_PixelFormat.RGBEFormat;
					texture.encoding = three_TextureEncoding.RGBDEncoding;
					texture.mapping = three_Mapping.CubeUVReflectionMapping;
					texture.generateMipmaps = false;
					texture.flipY = false;
					texture.sourceFile = path;
					_gthis.setEnvironmentMap(texture);
					onLoaded(texture);
				});
				break;
			default:
				let error = "Unknown environment extension " + ext;
				$global.console.error(error);
				onError(error);
			}
		}
	}
	setEnvironmentMap(texture) {
		if(this.scene.environment != null) {
			this.scene.environment.dispose();
		}
		this.scene.environment = texture;
		this.applyAdditionalLighting(texture.sourceFile);
	}
	applyAdditionalLighting(sourceFile) {
		let mapName;
		if(sourceFile != null) {
			let filename = haxe_io_Path.withoutDirectory(sourceFile);
			mapName = HxOverrides.substr(filename,0,filename.indexOf(".")).toLowerCase();
		} else {
			mapName = null;
		}
		let additionalLighting;
		if(mapName == null) {
			additionalLighting = { sunPosition : new three_Vector3(), sunColor : 16777215, sunIntensity : 0, sunShadowRadius : 0, ambient : 0, exposure : 1};
		} else {
			switch(mapName) {
			case "birchwood_2k":
				additionalLighting = { sunPosition : new three_Vector3(0.83,0.21,0.50).normalize(), sunColor : 16768200, sunIntensity : 4., sunShadowRadius : 15, ambient : 0, exposure : 0.7};
				break;
			case "blouberg_sunrise_1_2k":
				additionalLighting = { sunPosition : new three_Vector3(-59,43,-26).normalize(), sunColor : 16759601, sunIntensity : 2, sunShadowRadius : 12, ambient : 0, exposure : 1.0};
				break;
			case "kiara_1_dawn_2k":
				additionalLighting = { sunPosition : new three_Vector3(0.64,0.35,0.5).normalize(), sunColor : 16740919, sunIntensity : 1.0, sunShadowRadius : 5, ambient : 0, exposure : 0.9};
				break;
			case "night_bridge_2k":
				additionalLighting = { sunPosition : new three_Vector3(0.7,0.21,0.579).normalize(), sunColor : 16777215, sunIntensity : 1.8, sunShadowRadius : 13, ambient : 0, exposure : 0.7};
				break;
			case "snowy_forest_path_01_1k":
				additionalLighting = { sunPosition : new three_Vector3(1.37,0.45,0.84).normalize(), sunColor : 16777215, sunIntensity : 1.0, sunShadowRadius : 3, ambient : 0, exposure : 1.0};
				break;
			case "snowy_park_01_1k":
				additionalLighting = { sunPosition : new three_Vector3(0.31,0.48,0.902).normalize(), sunColor : 16777215, sunIntensity : 0.8, sunShadowRadius : 6, ambient : 0, exposure : 1.2};
				break;
			case "the_sky_is_on_fire_2k":
				additionalLighting = { sunPosition : new three_Vector3(1.71,0.08,2.41).normalize(), sunColor : 16742209, sunIntensity : 1, sunShadowRadius : 12, ambient : 0, exposure : 1.0};
				break;
			case "venice_sunset_2k":
				additionalLighting = { sunPosition : new three_Vector3(1.2,0.25,0.88).normalize(), sunColor : 16759601, sunIntensity : 2, sunShadowRadius : 12, ambient : 58, exposure : 0.7};
				break;
			case "winter_evening_2k":
				additionalLighting = { sunPosition : new three_Vector3(0.66,0.4,-0.03).normalize(), sunColor : 16777215, sunIntensity : 1.0, sunShadowRadius : 7, ambient : 0, exposure : 1.0};
				break;
			case "winter_lake_01_1k":
				additionalLighting = { sunPosition : new three_Vector3(1.17,0.55,0.88).normalize(), sunColor : 16773753, sunIntensity : 1., sunShadowRadius : 10, ambient : 33, exposure : 0.9};
				break;
			default:
				additionalLighting = { sunPosition : new three_Vector3(), sunColor : 16777215, sunIntensity : 0, sunShadowRadius : 0, ambient : 0, exposure : 1};
			}
		}
		this.environmentSun.color.set(additionalLighting.sunColor);
		this.environmentSun.intensity = additionalLighting.sunIntensity;
		this.environmentSun.position.copy(additionalLighting.sunPosition);
		this.environmentSun.shadow.radius = additionalLighting.sunShadowRadius;
		this.environmentSun.visible = true;
		this.environmentAmbient.color.set(additionalLighting.ambient);
	}
}
var dat_$gui_GUI = require("dat.gui").GUI;
function GUI_init() {
	GUI_gui.domElement.style.userSelect = "none";
	GUI_gui.domElement.parentElement.style.zIndex = "1000";
	let renderer = Main_renderer;
	let o = { };
	Object.defineProperty(o,"f",{ set : function(x) {
		Main_overrideTransmissionFramebuffer = x;
	}, get : function() {
		return Main_overrideTransmissionFramebuffer;
	}});
	GUI_gui.add(o,"f",0,1).name("overrideTransmissionFramebuffer").onChange(function(v) {
		Main_overrideTransmissionFramebuffer = v;
	}).listen().name("Fix Transmission").onChange(function(value) {
		if(renderer._transmissionRenderTarget) {
			renderer._transmissionRenderTarget.dispose();
			renderer._transmissionRenderTarget = null;
		}
	});
	let g = GUI_gui.addFolder("Rendering");
	let o1 = { };
	Object.defineProperty(o1,"f",{ set : function(x) {
		Main_pixelRatio = x;
	}, get : function() {
		return Main_pixelRatio;
	}});
	g.add(o1,"f",0.1,4).name("pixelRatio").onChange(function(v) {
		Main_pixelRatio = v;
	}).listen().name("resolution");
	let o2 = { };
	Object.defineProperty(o2,"f",{ set : function(x) {
		Main_camera.fov = x;
	}, get : function() {
		return Main_camera.fov;
	}});
	g.add(o2,"f",1,200).name("fov").onChange(function(v) {
		Main_camera.fov = v;
		let cb = function(v) {
			Main_camera.updateProjectionMatrix();
		};
		if(cb != null) {
			cb(v);
		}
	}).listen();
	g.add({ toneMapping : renderer.toneMapping},"toneMapping",{ "NoToneMapping" : three_ToneMapping.NoToneMapping, "LinearToneMapping" : three_ToneMapping.LinearToneMapping, "ReinhardToneMapping" : three_ToneMapping.ReinhardToneMapping, "CineonToneMapping" : three_ToneMapping.CineonToneMapping, "ACESFilmicToneMapping" : three_ToneMapping.ACESFilmicToneMapping}).onChange(function(v) {
		renderer.toneMapping = Std.parseInt(v);
		return renderer.outputEncoding = renderer.outputEncoding;
	});
	g.add({ outputEncoding : renderer.outputEncoding},"outputEncoding",{ "LinearEncoding" : three_TextureEncoding.LinearEncoding, "sRGBEncoding" : three_TextureEncoding.sRGBEncoding, "GammaEncoding" : three_TextureEncoding.GammaEncoding}).onChange(function(v) {
		return renderer.outputEncoding = Std.parseInt(v);
	});
	let o3 = { };
	Object.defineProperty(o3,"f",{ set : function(x) {
		renderer.toneMappingExposure = x;
	}, get : function() {
		return renderer.toneMappingExposure;
	}});
	g.add(o3,"f",0,10).name("toneMappingExposure").onChange(function(v) {
		renderer.toneMappingExposure = v;
	}).listen();
	g.add({ p : Main_environmentManager.environmentPath},"p",["assets/env/winter_lake_01_1k.rgbd.png","assets/env/venice_sunset_2k.rgbd.png","assets/env/the_sky_is_on_fire_2k.rgbd.png","assets/env/snowy_park_01_1k.rgbd.png","assets/env/snowy_forest_path_01_1k.rgbd.png","assets/env/night_bridge_2k.rgbd.png","assets/env/kiara_1_dawn_2k.rgbd.png","assets/env/blouberg_sunrise_1_2k.rgbd.png","assets/env/birchwood_2k.rgbd.png"]).onChange(function(p) {
		Main_environmentManager.setEnvironmentMapPath(p,function(e) {
			GUI_gui.updateDisplay();
		});
	}).name("Environment");
	let o4 = { };
	Object.defineProperty(o4,"f",{ set : function(x) {
		Main_background.environmentMaterial.uRoughness.value = x;
	}, get : function() {
		return Main_background.environmentMaterial.uRoughness.value;
	}});
	g.add(o4,"f",0,1).name("roughness").onChange(function(v) {
		Main_background.environmentMaterial.uRoughness.value = v;
	}).listen();
	let o5 = { };
	Object.defineProperty(o5,"f",{ set : function(x) {
		Main_bloomEnabled = x;
	}, get : function() {
		return Main_bloomEnabled;
	}});
	g.add(o5,"f",0,1).name("bloomEnabled").onChange(function(v) {
		Main_bloomEnabled = v;
	}).listen();
	let o6 = { };
	Object.defineProperty(o6,"f",{ set : function(x) {
		Main_bloomAlpha = x;
	}, get : function() {
		return Main_bloomAlpha;
	}});
	g.add(o6,"f",0,1).name("bloomAlpha").onChange(function(v) {
		Main_bloomAlpha = v;
	}).listen();
	let o7 = { };
	Object.defineProperty(o7,"f",{ set : function(x) {
		Main_bloomExponent = x;
	}, get : function() {
		return Main_bloomExponent;
	}});
	g.add(o7,"f",0,4).name("bloomExponent").onChange(function(v) {
		Main_bloomExponent = v;
	}).listen();
	let o8 = { };
	Object.defineProperty(o8,"f",{ set : function(x) {
		Main_bloomSigma = x;
	}, get : function() {
		return Main_bloomSigma;
	}});
	g.add(o8,"f",0,1).name("bloomSigma").onChange(function(v) {
		Main_bloomSigma = v;
	}).listen();
	let o9 = { };
	Object.defineProperty(o9,"f",{ set : function(x) {
		Main_bloomBlurRadius = x;
	}, get : function() {
		return Main_bloomBlurRadius;
	}});
	g.add(o9,"f",0,0.2).name("bloomBlurRadius").onChange(function(v) {
		Main_bloomBlurRadius = v;
	}).listen();
	let o10 = { };
	Object.defineProperty(o10,"f",{ set : function(x) {
		Main_bloomBlurDownsampleIterations = x;
	}, get : function() {
		return Main_bloomBlurDownsampleIterations;
	}});
	g.add(o10,"f",0,4).name("bloomBlurDownsampleIterations").onChange(function(v) {
		Main_bloomBlurDownsampleIterations = v;
	}).listen().step(1);
	let g1 = GUI_gui.addFolder("Controls");
	let c = Main_arcBallControl;
	let o11 = { };
	Object.defineProperty(o11,"f",{ set : function(x) {
		c.dragSpeed = x;
	}, get : function() {
		return c.dragSpeed;
	}});
	g1.add(o11,"f",0,15).name("dragSpeed").onChange(function(v) {
		c.dragSpeed = v;
	}).listen();
	let o12 = { };
	Object.defineProperty(o12,"f",{ set : function(x) {
		c.zoomSpeed = x;
	}, get : function() {
		return c.zoomSpeed;
	}});
	g1.add(o12,"f",0,20).name("zoomSpeed").onChange(function(v) {
		c.zoomSpeed = v;
	}).listen();
	let o13 = { };
	Object.defineProperty(o13,"f",{ set : function(x) {
		let v = x;
		c.angleAroundY.strength = v;
		c.angleAroundXZ.strength = v;
		c.radius.strength = v;
	}, get : function() {
		return c.angleAroundY.strength;
	}});
	g1.add(o13,"f",0,1000).name("strength").onChange(function(v) {
		c.angleAroundY.strength = v;
		c.angleAroundXZ.strength = v;
		c.radius.strength = v;
	}).listen();
	let o14 = { };
	Object.defineProperty(o14,"f",{ set : function(x) {
		let v = x;
		c.angleAroundY.damping = v;
		c.angleAroundXZ.damping = v;
		c.radius.damping = v;
	}, get : function() {
		return c.angleAroundY.damping;
	}});
	g1.add(o14,"f",0,200).name("damping").onChange(function(v) {
		c.angleAroundY.damping = v;
		c.angleAroundXZ.damping = v;
		c.radius.damping = v;
	}).listen();
	let g2 = GUI_gui;
	GUI_addMaterial(g2,Main_cube.material,"Cube");
	GUI_addMaterial(g2,Main_sphere.material,"Sphere");
	let o15 = { };
	Object.defineProperty(o15,"f",{ set : function(x) {
		Main_environmentManager.environmentSun.intensity = x;
	}, get : function() {
		return Main_environmentManager.environmentSun.intensity;
	}});
	g2.add(o15,"f",0,3).name("intensity").onChange(function(v) {
		Main_environmentManager.environmentSun.intensity = v;
	}).listen().name("Sun intensity");
	let color = Main_environmentManager.environmentSun.color;
	g2.addColor({ c : color.getHex()},"c").name("color").onChange(function(hex) {
		color.setHex(hex);
	}).name("Sun color");
}
function GUI_addMaterial(g,material,name) {
	let g1 = g.addFolder(name);
	let m = material;
	let o = { };
	Object.defineProperty(o,"f",{ set : function(x) {
		m.roughness = x;
	}, get : function() {
		return m.roughness;
	}});
	g1.add(o,"f",0,1).name("roughness").onChange(function(v) {
		m.roughness = v;
	}).listen();
	let o1 = { };
	Object.defineProperty(o1,"f",{ set : function(x) {
		m.metalness = x;
	}, get : function() {
		return m.metalness;
	}});
	g1.add(o1,"f",0,1).name("metalness").onChange(function(v) {
		m.metalness = v;
	}).listen();
	let o2 = { };
	Object.defineProperty(o2,"f",{ set : function(x) {
		m.clearcoat = x;
	}, get : function() {
		return m.clearcoat;
	}});
	g1.add(o2,"f",0,1).name("clearcoat").onChange(function(v) {
		m.clearcoat = v;
	}).listen();
	let o3 = { };
	Object.defineProperty(o3,"f",{ set : function(x) {
		m.clearcoatRoughness = x;
	}, get : function() {
		return m.clearcoatRoughness;
	}});
	g1.add(o3,"f",0,1).name("clearcoatRoughness").onChange(function(v) {
		m.clearcoatRoughness = v;
	}).listen();
	let o4 = { };
	Object.defineProperty(o4,"f",{ set : function(x) {
		m.reflectivity = x;
	}, get : function() {
		return m.reflectivity;
	}});
	g1.add(o4,"f",0,1).name("reflectivity").onChange(function(v) {
		m.reflectivity = v;
	}).listen();
	let o5 = { };
	Object.defineProperty(o5,"f",{ set : function(x) {
		m.transmission = x;
	}, get : function() {
		return m.transmission;
	}});
	g1.add(o5,"f",0,1).name("transmission").onChange(function(v) {
		m.transmission = v;
	}).listen();
	let o6 = { };
	Object.defineProperty(o6,"f",{ set : function(x) {
		m.ior = x;
	}, get : function() {
		return m.ior;
	}});
	g1.add(o6,"f",0,3).name("ior").onChange(function(v) {
		m.ior = v;
	}).listen();
	let o7 = { };
	Object.defineProperty(o7,"f",{ set : function(x) {
		m.thickness = x;
	}, get : function() {
		return m.thickness;
	}});
	g1.add(o7,"f",0,3).name("thickness").onChange(function(v) {
		m.thickness = v;
	}).listen();
	let color = m.attenuationTint;
	g1.addColor({ c : color.getHex()},"c").name("attenuationTint").onChange(function(hex) {
		color.setHex(hex);
	});
	let o8 = { };
	Object.defineProperty(o8,"f",{ set : function(x) {
		m.attenuationDistance = x;
	}, get : function() {
		return m.attenuationDistance;
	}});
	g1.add(o8,"f",0,10).name("attenuationDistance").onChange(function(v) {
		m.attenuationDistance = v;
	}).listen();
	let o9 = { };
	Object.defineProperty(o9,"f",{ set : function(x) {
		m.transparent = x;
	}, get : function() {
		return m.transparent;
	}});
	g1.add(o9,"f",0,1).name("transparent").onChange(function(v) {
		m.transparent = v;
	}).listen();
	let o10 = { };
	Object.defineProperty(o10,"f",{ set : function(x) {
		m.emissiveIntensity = x;
	}, get : function() {
		return m.emissiveIntensity;
	}});
	g1.add(o10,"f",0,4).name("emissiveIntensity").onChange(function(v) {
		m.emissiveIntensity = v;
	}).listen();
	let color1 = m.color;
	g1.addColor({ c : color1.getHex()},"c").name("color").onChange(function(hex) {
		color1.setHex(hex);
	});
	let color2 = m.emissive;
	g1.addColor({ c : color2.getHex()},"c").name("emissive").onChange(function(hex) {
		color2.setHex(hex);
	});
	let o11 = { };
	Object.defineProperty(o11,"f",{ set : function(x) {
		m.opacity = x;
	}, get : function() {
		return m.opacity;
	}});
	g1.add(o11,"f",0,1).name("opacity").onChange(function(v) {
		m.opacity = v;
	}).listen();
}
class HxOverrides {
	static substr(s,pos,len) {
		if(len == null) {
			len = s.length;
		} else if(len < 0) {
			if(pos == 0) {
				len = s.length + len;
			} else {
				return "";
			}
		}
		return s.substr(pos,len);
	}
	static now() {
		return Date.now();
	}
}
var three_ShaderMaterial = require("three").ShaderMaterial;
var three_RawShaderMaterial = require("three").RawShaderMaterial;
class _$Main_StarsMaterial extends three_RawShaderMaterial {
	constructor(shape) {
		let pointScale = new three_Uniform(1.);
		super({ uniforms : { shape : new three_Uniform(shape), pointScale : pointScale, time_s : Main_uTime_s}, vertexShader : "\n\t\t\t\tprecision highp float;\n\n\t\t\t\tuniform mat4 projectionMatrix;\n\t\t\t\tuniform mat4 modelViewMatrix;\n\t\t\t\tuniform float pointScale;\n\t\t\t\tattribute vec3 position;\n\n\t\t\t\tattribute vec4 special;\n\n\t\t\t\tvarying vec2 vBlackBodyCoordinate;\n\t\t\t\tvarying float vIntensity;\n\t\t\t\tvarying float vPointScale;\n\n\t\t\t\tuniform float time_s;\n\n\t\t\t\tstruct GalaxyShape {\n\t\t\t\t\tfloat height;\n\t\t\t\t\tfloat winding;\n\t\t\t\t\tfloat windingExponent;\n\t\t\t\t\tfloat bulgeWinding;\n\t\t\t\t\tfloat bulgeWindingExponent;\n\t\t\t\t\tfloat armSpread;\n\t\t\t\t\tfloat armSpreadExponent;\n\t\t\t\t};\n\t\t\t\tuniform GalaxyShape shape;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec3 rand = position;\n\t\t\t\t\t\n\t\t\t\t\tvec3 pos;\n\t\t\t\t\tfloat r;\n\t\t\t\t\tif (false) {\n\t\t\t\t\t\tr = pow(rand.x, 5.);\n\n\t\t\t\t\t\t// spiral shape parameters\n\t\t\t\t\t\t// https://www.desmos.com/calculator/iwl6c2mqfe\n\n\t\t\t\t\t\tfloat angle =\n\t\t\t\t\t\t\t// base spiral a ~ r\n\t\t\t\t\t\t\tshape.winding * pow(r, shape.windingExponent)\n\t\t\t\t\t\t\t// core tight spiral\n\t\t\t\t\t\t\t- shape.bulgeWinding * pow(r, -shape.bulgeWindingExponent)\n\n\t\t\t\t\t\t\t// angle offset\n\t\t\t\t\t\t\t+ shape.armSpread * pow(rand.y, shape.armSpreadExponent) / pow(r, 0.9)\n\n\t\t\t\t\t\t\t// left or right arm\n\t\t\t\t\t\t\t+ (rand.z > 0.5 ? 3.14159 : 0.);\n\n\t\t\t\t\t\tfloat x = r * 4.;\n\t\t\t\t\t\tfloat y = pow(1. + x, -x) * 0.1 * (rand.z > 0.5 ? 1. : -1.) * rand.x;\n\n\t\t\t\t\t\tpos = vec3(\n\t\t\t\t\t\t\tcos(angle) * r,\n\t\t\t\t\t\t\ty,\n\t\t\t\t\t\t\tsin(angle) * r\n\t\t\t\t\t\t);\n\t\t\t\t\t}\n\n\t\t\t\t\tif (true) {\n\t\t\t\t\t\tr = special.r;\n\t\t\t\t\t\tpos = r * normalize(rand * 2. - 1.);\n\t\t\t\t\t}\n\n\t\t\t\t\tvec4 eyeSpace = modelViewMatrix * vec4(pos, 1.0);\n\t\t\t\t\tgl_Position = projectionMatrix * eyeSpace;\n\n\t\t\t\t\t// star color and brightness\n\t\t\t\t\t{\n\t\t\t\t\t\tfloat u = special.r; // uniform random number 0 - 1\n\t\t\t\t\t\tfloat v = special.g; // uniform random number 0 - 1\n\n\t\t\t\t\t\tfloat I = 6. + v * 2.;\n\t\t\t\t\t\tI *= pow((sin(r * 20. + time_s) * 0.5 + 0.5), 2.);\n\n\t\t\t\t\t\t// inverse square intensity falloff\n\t\t\t\t\t\tfloat eyeSpaceDistanceSq = dot(eyeSpace.xyz, eyeSpace.xyz);\n\t\t\t\t\t\tI /= eyeSpaceDistanceSq;\n\n\t\t\t\t\t\tvIntensity = I;\n\n\t\t\t\t\t\t// set sprite size to fit airy disk (approximate)\n\t\t\t\t\t\tvPointScale = pointScale / sqrt(eyeSpaceDistanceSq);\n\t\t\t\t\t\tgl_PointSize = min(vPointScale, 1000.);\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t", fragmentShader : "\n\t\t\t\tprecision highp float;\n\n\t\t\t\tvarying float vIntensity;\n\t\t\t\tvarying float vPointScale;\n\n\t\t\t\t// https://www.shadertoy.com/view/tlc3zM\n\t\t\t\tfloat fastAiry(float x) {\n\t\t\t\t\t#define gauss(x) exp(-.5*((x)*(x)) )\n\t\t\t\t\treturn (abs(x) < 1.88 ? gauss(x/1.4) : abs(x) > 6. ? 1.35/abs(x*x*x) : ( gauss(x/1.4) + 2.7/abs(x*x*x) )/2. );\n\t\t\t\t\t#undef gauss\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tfloat I = vIntensity;\n\n\t\t\t\t\tfloat d = length(gl_PointCoord.xy - vec2(0.5));\n\n\t\t\t\t\t// force circular bound at sprite edges\n\t\t\t\t\tI *= smoothstep(0.5, 0.45, d);\n\n\t\t\t\t\tvec3 c = vec3(1.) * I;\n\t\t\t\t\t\n\t\t\t\t\tgl_FragColor = vec4(c, 1.0);\n\n\t\t\t\t\t// if (gl_PointCoord.y < 0.05) gl_FragColor = vec4(vec3(0., 1., 0.), 1.0);\n\t\t\t\t}\n\t\t\t", blending : three_Blending.AdditiveBlending, depthWrite : false, depthTest : true, transparent : false});
		this.pointScale = pointScale;
	}
}
class app_InteractionEventsManager {
	constructor(el) {
		this.haxeAppActivated = false;
		this.elClientHeight = null;
		this.elClientWidth = null;
		this.primaryPointer = null;
		this.el = el;
		this.eventHandler = new app__$InteractionEventsManager_EventDispatcher();
		if(el.tabIndex == null) {
			el.tabIndex = 1;
		}
		el.style.touchAction = "none";
		el.setAttribute("touch-action","none");
		let cancelEvent = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};
		el.addEventListener("gesturestart",cancelEvent,false);
		el.addEventListener("gesturechange",cancelEvent,false);
		this.addPointerEventListeners();
		this.addWheelEventListeners();
		this.addKeyboardEventListeners();
		this.addLifeCycleEventListeners();
		this.addResizeEventListeners();
		this.onVisibilityChange();
	}
	onVisibilityChange() {
		switch(window.document.visibilityState) {
		case "hidden":
			if(this.haxeAppActivated) {
				this.eventHandler.onDeactivate();
				this.haxeAppActivated = false;
			}
			break;
		case "visible":
			if(!this.haxeAppActivated) {
				this.eventHandler.onActivate();
				this.haxeAppActivated = true;
			}
			break;
		}
	}
	addPointerEventListeners() {
		let _gthis = this;
		let executePointerMethodFromMouseEvent = function(mouseEvent,pointerMethod) {
			let force = mouseEvent.force != null ? mouseEvent.force : mouseEvent.webkitForce != null ? mouseEvent.webkitForce : 0.5;
			if(pointerMethod(new app_event_PointerEvent(1,"mouse",true,mouseEvent.button,mouseEvent.buttons,mouseEvent.clientX,mouseEvent.clientY,1,1,_gthis.el.clientWidth,_gthis.el.clientHeight,Math.max(force - 1,0),0,0,0,0)) == 0) {
				mouseEvent.preventDefault();
			}
		};
		let touchInfoForType_h = Object.create(null);
		let getTouchInfoForType = function(type) {
			let touchInfo = touchInfoForType_h[type];
			if(touchInfo == null) {
				touchInfo = { primaryTouchIdentifier : null, activeCount : 0};
				touchInfoForType_h[type] = touchInfo;
			}
			return touchInfo;
		};
		let executePointerMethodFromTouchEvent = function(touchEvent,pointerMethod) {
			let buttonStates;
			switch(touchEvent.type) {
			case "touchforcechange":case "touchmove":
				buttonStates = { button : -1, buttons : 1};
				break;
			case "touchstart":
				buttonStates = { button : 0, buttons : 1};
				break;
			default:
				buttonStates = { button : 0, buttons : 0};
			}
			let _g = 0;
			let _g1 = touchEvent.changedTouches.length;
			while(_g < _g1) {
				let touch = touchEvent.changedTouches[_g++];
				if(touchEvent.type == "touchforcechange") {
					let touchIsActive = false;
					let _g = 0;
					let _g1 = touchEvent.touches;
					while(_g < _g1.length) if(touch == _g1[_g++]) {
						touchIsActive = true;
						break;
					}
					if(!touchIsActive) {
						continue;
					}
				}
				let touchInfo = getTouchInfoForType(touch.touchType);
				if(touchInfo.activeCount == 0 && touchEvent.type == "touchstart") {
					touchInfo.primaryTouchIdentifier = touch.identifier;
				}
				switch(touchEvent.type) {
				case "touchcancel":case "touchend":
					touchInfo.activeCount--;
					break;
				case "touchstart":
					touchInfo.activeCount++;
					break;
				}
				let tanAlt = Math.tan(touch.altitudeAngle);
				let radToDeg = 180.0 / Math.PI;
				let tiltX = Math.atan(Math.cos(touch.azimuthAngle) / tanAlt) * radToDeg;
				let tiltY = Math.atan(Math.sin(touch.azimuthAngle) / tanAlt) * radToDeg;
				let radiusX = touch.radiusX != null ? touch.radiusX : touch.webkitRadiusX != null ? touch.webkitRadiusX : 5;
				let radiusY = touch.radiusY != null ? touch.radiusY : touch.webkitRadiusY != null ? touch.webkitRadiusY : 5;
				if(pointerMethod(new app_event_PointerEvent(touch.identifier,touch.touchType == "stylus" ? "pen" : "touch",touch.identifier == touchInfo.primaryTouchIdentifier,buttonStates.button,buttonStates.buttons,touch.clientX,touch.clientY,radiusX * 2,radiusY * 2,_gthis.el.clientWidth,_gthis.el.clientHeight,touch.force,0,isFinite(tiltX) ? tiltX : 0,isFinite(tiltY) ? tiltY : 0,touch.rotationAngle)) == 0) {
					touchEvent.preventDefault();
				}
			}
		};
		let onPointerDown = function(e) {
			e["viewWidth"] = _gthis.el.clientWidth;
			e["viewHeight"] = _gthis.el.clientHeight;
			if(e.isPrimary) {
				_gthis.primaryPointer = e;
			}
			return _gthis.eventHandler.onPointerDown(e);
		};
		let onPointerMove = function(e) {
			e["viewWidth"] = _gthis.el.clientWidth;
			e["viewHeight"] = _gthis.el.clientHeight;
			if(e.isPrimary) {
				_gthis.primaryPointer = e;
			}
			return _gthis.eventHandler.onPointerMove(e);
		};
		let onPointerUp = function(e) {
			e["viewWidth"] = _gthis.el.clientWidth;
			e["viewHeight"] = _gthis.el.clientHeight;
			if(e.isPrimary) {
				_gthis.primaryPointer = null;
			}
			return _gthis.eventHandler.onPointerUp(e);
		};
		let onPointerCancel = function(e) {
			e["viewWidth"] = _gthis.el.clientWidth;
			e["viewHeight"] = _gthis.el.clientHeight;
			if(e.isPrimary) {
				_gthis.primaryPointer = null;
			}
			return _gthis.eventHandler.onPointerCancel(e);
		};
		if(window.PointerEvent) {
			this.el.addEventListener("pointerdown",onPointerDown);
			window.addEventListener("pointermove",onPointerMove);
			window.addEventListener("pointerup",onPointerUp);
			window.addEventListener("pointercancel",onPointerCancel);
		} else {
			this.el.addEventListener("mousedown",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerDown);
			});
			window.addEventListener("mousemove",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerMove);
			});
			window.addEventListener("webkitmouseforcechanged",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerMove);
			});
			window.addEventListener("mouseforcechanged",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerMove);
			});
			window.addEventListener("mouseup",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerUp);
			});
			this.el.addEventListener("touchstart",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerDown);
			},{ capture : true, passive : false});
			window.addEventListener("touchmove",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerMove);
			},{ capture : true, passive : false});
			window.addEventListener("touchforcechange",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerMove);
			},{ capture : true, passive : false});
			window.addEventListener("touchend",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerUp);
			},{ capture : true, passive : false});
			window.addEventListener("touchcancel",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerCancel);
			},{ capture : true, passive : false});
		}
	}
	addWheelEventListeners() {
		let _gthis = this;
		this.el.addEventListener("wheel",function(e) {
			let x_px = e.clientX;
			let y_px = e.clientY;
			let deltaX_px = e.deltaX;
			let deltaY_px = e.deltaY;
			let deltaZ_px = e.deltaZ;
			switch(e.deltaMode) {
			case 0:
				deltaX_px = e.deltaX;
				deltaY_px = e.deltaY;
				deltaZ_px = e.deltaZ;
				break;
			case 1:
				deltaX_px = e.deltaX * 16;
				deltaY_px = e.deltaY * 16;
				deltaZ_px = e.deltaZ * 16;
				break;
			case 2:
				deltaX_px = e.deltaX * 100;
				deltaY_px = e.deltaY * 100;
				deltaZ_px = e.deltaZ * 100;
				break;
			}
			if(_gthis.eventHandler.onWheel(new app_event_WheelEvent(deltaX_px,deltaY_px,deltaZ_px,x_px,y_px,e.altKey,e.ctrlKey,e.metaKey,e.shiftKey,e)) == 0) {
				e.preventDefault();
			}
		},{ passive : false});
	}
	addKeyboardEventListeners() {
		let _gthis = this;
		window.addEventListener("keydown",function(e) {
			if(_gthis.eventHandler.onKeyDown(e,e.target == _gthis.el) == 0) {
				e.preventDefault();
			}
		});
		window.addEventListener("keyup",function(e) {
			if(_gthis.eventHandler.onKeyUp(e,e.target == _gthis.el) == 0) {
				e.preventDefault();
			}
		});
	}
	addLifeCycleEventListeners() {
		let _gthis = this;
		window.document.addEventListener("visibilitychange",function() {
			_gthis.onVisibilityChange();
		});
	}
	addResizeEventListeners() {
		let _gthis = this;
		window.addEventListener("resize",function() {
			if(_gthis.elClientWidth != _gthis.el.clientWidth || _gthis.elClientHeight != _gthis.el.clientHeight) {
				_gthis.elClientWidth = _gthis.el.clientWidth;
				_gthis.elClientHeight = _gthis.el.clientHeight;
				_gthis.eventHandler.onResize(_gthis.el.clientWidth,_gthis.el.clientHeight);
			}
		},{ capture : false});
	}
}
class app__$InteractionEventsManager_EventDispatcher {
	constructor() {
		this.onDeactivateCallbacks = [];
		this.onActivateCallbacks = [];
		this.onKeyUpCallbacks = [];
		this.onKeyDownCallbacks = [];
		this.onWheelCallbacks = [];
		this.onPointerCancelCallbacks = [];
		this.onPointerUpCallbacks = [];
		this.onPointerMoveCallbacks = [];
		this.onPointerDownCallbacks = [];
		this.onResizeCallbacks = [];
	}
	onResize(width,height) {
		let _g = 0;
		let _g1 = this.onResizeCallbacks;
		while(_g < _g1.length) _g1[_g++](width,height);
	}
	onPointerDown(event) {
		let _g = 0;
		let _g1 = this.onPointerDownCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event) == 0) {
			return 0;
		}
		return 1;
	}
	onPointerMove(event) {
		let _g = 0;
		let _g1 = this.onPointerMoveCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event) == 0) {
			return 0;
		}
		return 1;
	}
	onPointerUp(event) {
		let _g = 0;
		let _g1 = this.onPointerUpCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event) == 0) {
			return 0;
		}
		return 1;
	}
	onPointerCancel(event) {
		let _g = 0;
		let _g1 = this.onPointerCancelCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event) == 0) {
			return 0;
		}
		return 1;
	}
	onWheel(event) {
		let _g = 0;
		let _g1 = this.onWheelCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event) == 0) {
			return 0;
		}
		return 1;
	}
	onKeyDown(event,hasFocus) {
		let _g = 0;
		let _g1 = this.onKeyDownCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event,hasFocus) == 0) {
			return 0;
		}
		return 1;
	}
	onKeyUp(event,hasFocus) {
		let _g = 0;
		let _g1 = this.onKeyUpCallbacks;
		while(_g < _g1.length) if(_g1[_g++](event,hasFocus) == 0) {
			return 0;
		}
		return 1;
	}
	onActivate() {
		let _g = 0;
		let _g1 = this.onActivateCallbacks;
		while(_g < _g1.length) _g1[_g++]();
	}
	onDeactivate() {
		let _g = 0;
		let _g1 = this.onDeactivateCallbacks;
		while(_g < _g1.length) _g1[_g++]();
	}
}
class control_ArcBallControl {
	constructor(options) {
		this._isPointerDown = false;
		this._onDown_clientXY = new Vec2Data(0,0);
		this._onDown_angleAroundXZ = 0;
		this._onDown_angleAroundY = 0;
		this.orientation = new Vec4Data(0,0,0,1);
		this.position = new Vec3Data(0.,0.,0.);
		this.radius = new animator_Spring(1.);
		this.angleAroundXZ = new animator_Spring(0.);
		this.angleAroundY = new animator_Spring(0.);
		let a = control_ArcBallControl.defaults;
		let options_radius = options.radius != null ? options.radius : a.radius;
		let options_interactionSurface = options.interactionSurface;
		let options_interactionEventsManager = options.interactionEventsManager;
		let options_angleAroundXZ = options.angleAroundXZ != null ? options.angleAroundXZ : a.angleAroundXZ;
		this.dragSpeed = options.dragSpeed != null ? options.dragSpeed : a.dragSpeed;
		this.zoomSpeed = options.zoomSpeed != null ? options.zoomSpeed : a.zoomSpeed;
		let v = options.strength != null ? options.strength : a.strength;
		this.angleAroundY.strength = v;
		this.angleAroundXZ.strength = v;
		this.radius.strength = v;
		let v1 = options.damping != null ? options.damping : a.damping;
		this.angleAroundY.damping = v1;
		this.angleAroundXZ.damping = v1;
		this.radius.damping = v1;
		this.angleAroundY.forceCompletion(options.angleAroundY != null ? options.angleAroundY : a.angleAroundY);
		this.angleAroundXZ.forceCompletion(options_angleAroundXZ);
		this.radius.forceCompletion(options_radius);
		let interactionSurface = options_interactionSurface;
		let _gthis = this;
		if(options_interactionEventsManager != null) {
			options_interactionEventsManager.eventHandler.onPointerDownCallbacks.push(function(e) {
				_gthis._isPointerDown = true;
				_gthis._onDown_angleAroundY = _gthis.angleAroundY.target;
				_gthis._onDown_angleAroundXZ = _gthis.angleAroundXZ.target;
				let this1 = _gthis._onDown_clientXY;
				this1.x = e.x;
				this1.y = e.y;
				return 1;
			});
			options_interactionEventsManager.eventHandler.onPointerMoveCallbacks.push(function(e) {
				let surfaceSize_x = e.viewWidth;
				let surfaceSize_y = e.viewHeight;
				if(_gthis._isPointerDown) {
					let a = _gthis._onDown_clientXY;
					_gthis.angleAroundXZ.target = _gthis._onDown_angleAroundXZ + (e.y / surfaceSize_y - a.y / surfaceSize_y) * _gthis.dragSpeed;
					let this1 = _gthis.orientation;
					let u_x = this1.x;
					let u_y = this1.y;
					let u_z = this1.z;
					let s = this1.w;
					let up_y = u_y * (2 * (u_x * 0. + u_y + u_z * 0.)) + (s * s - (u_x * u_x + u_y * u_y + u_z * u_z)) + (u_z * 0. - u_x * 0.) * (2 * s);
					_gthis.angleAroundY.target = _gthis._onDown_angleAroundY - (1.0 - Math.pow(Math.abs(up_y) + 1,-4)) * (up_y >= 0 ? 1 : -1) * (e.x / surfaceSize_x - a.x / surfaceSize_x) * _gthis.dragSpeed * (surfaceSize_x / surfaceSize_y);
					return 0;
				} else {
					return 1;
				}
			});
			options_interactionEventsManager.eventHandler.onPointerUpCallbacks.push(function(e) {
				_gthis._isPointerDown = false;
				return 1;
			});
			options_interactionEventsManager.eventHandler.onWheelCallbacks.push(function(e) {
				_gthis.radius.target += e.deltaY * _gthis.zoomSpeed / 1000;
				_gthis.radius.target = Math.max(_gthis.radius.target,0);
				return 0;
			});
		} else if(interactionSurface != null) {
			interactionSurface.addEventListener("mousedown",function(e) {
				_gthis._isPointerDown = true;
				_gthis._onDown_angleAroundY = _gthis.angleAroundY.target;
				_gthis._onDown_angleAroundXZ = _gthis.angleAroundXZ.target;
				let this1 = _gthis._onDown_clientXY;
				this1.x = e.clientX;
				this1.y = e.clientY;
			});
			interactionSurface.addEventListener("contextmenu",function(e) {
				_gthis._isPointerDown = false;
			});
			window.addEventListener("mousemove",function(e) {
				let surfaceSize_x = interactionSurface.clientWidth;
				let surfaceSize_y = interactionSurface.clientHeight;
				let tmp;
				if(_gthis._isPointerDown) {
					let a = _gthis._onDown_clientXY;
					_gthis.angleAroundXZ.target = _gthis._onDown_angleAroundXZ + (e.clientY / surfaceSize_y - a.y / surfaceSize_y) * _gthis.dragSpeed;
					let this1 = _gthis.orientation;
					let u_x = this1.x;
					let u_y = this1.y;
					let u_z = this1.z;
					let s = this1.w;
					let up_y = u_y * (2 * (u_x * 0. + u_y + u_z * 0.)) + (s * s - (u_x * u_x + u_y * u_y + u_z * u_z)) + (u_z * 0. - u_x * 0.) * (2 * s);
					_gthis.angleAroundY.target = _gthis._onDown_angleAroundY - (1.0 - Math.pow(Math.abs(up_y) + 1,-4)) * (up_y >= 0 ? 1 : -1) * (e.clientX / surfaceSize_x - a.x / surfaceSize_x) * _gthis.dragSpeed * (surfaceSize_x / surfaceSize_y);
					tmp = 0;
				} else {
					tmp = 1;
				}
				if(tmp == 0) {
					e.preventDefault();
				}
			});
			window.addEventListener("mouseup",function(e) {
				_gthis._isPointerDown = false;
			});
			interactionSurface.addEventListener("wheel",function(e) {
				_gthis.radius.target += e.deltaY * _gthis.zoomSpeed / 1000;
				_gthis.radius.target = Math.max(_gthis.radius.target,0);
				e.preventDefault();
			},{ passive : false});
		}
	}
	applyToCamera(camera) {
		let p = this.position;
		let q = this.orientation;
		camera.position.x = p.x;
		camera.position.y = p.y;
		camera.position.z = p.z;
		camera.quaternion.x = q.x;
		camera.quaternion.y = q.y;
		camera.quaternion.z = q.z;
		camera.quaternion.w = q.w;
	}
}
var three_Mesh = require("three").Mesh;
class rendering_Background extends three_Mesh {
	constructor(roughness) {
		if(roughness == null) {
			roughness = 0.5;
		}
		let environmentMaterial = new rendering_EnvironmentMaterial(roughness);
		super(new three_BoxGeometry(1,1,1),environmentMaterial);
		this.environmentMaterial = environmentMaterial;
		this.geometry.deleteAttribute("normal");
		this.geometry.deleteAttribute("uv");
		this.frustumCulled = false;
		this.castShadow = false;
		this.receiveShadow = false;
		this.matrixAutoUpdate = false;
		this.renderOrder = -Infinity;
		let _gthis = this;
		this.onBeforeRender = function(renderer,scene,camera,geometry,material,group) {
			let v = scene.environment;
			if(v != environmentMaterial.uEnvMap.value) {
				environmentMaterial.needsUpdate = true;
			}
			if(v != null) {
				environmentMaterial.uFlipEnvMap.value = v.isCubeTexture == true ? -1 : 1;
			}
			environmentMaterial.uEnvMap.value = v;
			environmentMaterial.envMap = v;
			_gthis.matrixWorld.copyPosition(camera.matrixWorld);
		};
	}
}
class rendering_EnvironmentMaterial extends three_ShaderMaterial {
	constructor(roughness) {
		let uRoughness = new three_Uniform(0.5);
		let uFlipEnvMap = new three_Uniform(-1);
		let uEnvMap = new three_Uniform(null);
		super({ uniforms : { "envMap" : uEnvMap, "flipEnvMap" : uFlipEnvMap, "uRoughness" : uRoughness}, vertexShader : Three.ShaderLib.cube.vertexShader, fragmentShader : "\n\t\t\t\tuniform float uRoughness;\n\t\t\t\t#include <envmap_common_pars_fragment>\n\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\tvarying vec3 vWorldDirection;\n\t\t\t\t#endif\n\t\t\t\t#include <cube_uv_reflection_fragment>\n\t\t\t\tvoid main() {\n\t\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\t\t\tvec3 reflectVec = vWorldDirection;\n\t\t\t\t\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\t\t\t\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\t\t\t\t\tvec4 envColor = textureCubeUV(envMap, reflectVec, uRoughness);\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\t\t\t\t\t\tvec2 sampleUV;\n\t\t\t\t\t\t\treflectVec = normalize( reflectVec );\n\t\t\t\t\t\t\tsampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\t\t\t\t\t\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\t\t\t\t\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\t\t\t\t\t\treflectVec = normalize( reflectVec );\n\t\t\t\t\t\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n\t\t\t\t\t\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t\t\t\t\t\t#else\n\t\t\t\t\t\t\tvec4 envColor = vec4( 0.0 );\n\t\t\t\t\t\t#endif\n\t\t\t\t\t\t#ifndef ENVMAP_TYPE_CUBE_UV\n\t\t\t\t\t\t\tenvColor = envMapTexelToLinear( envColor );\n\t\t\t\t\t\t#endif\n\t\t\t\t\t#endif\n\t\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\t\t\tgl_FragColor = envColor;\n\t\t\t\t\t#else\n\t\t\t\t\t\tgl_FragColor = vec4(1., 1., 1., 1.);\n\t\t\t\t\t#endif\n\t\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t\t#include <encodings_fragment>\n\t\t\t\t}\n\t\t\t", side : three_Side.DoubleSide, depthWrite : false, depthTest : true, blending : three_Blending.NoBlending});
		this.uRoughness = uRoughness;
		this.uFlipEnvMap = uFlipEnvMap;
		this.uEnvMap = uEnvMap;
		uRoughness.value = roughness;
	}
}
var three_Uniform = require("three").Uniform;
var Three = require("three");
var three_Side = require("three");
var three_Blending = require("three");
var three_BufferGeometry = require("three").BufferGeometry;
var three_BoxGeometry = require("three").BoxGeometry;
var three_PerspectiveCamera = require("three").PerspectiveCamera;
var three_MeshPhysicalMaterial = require("three").MeshPhysicalMaterial;
var three_WebGLRenderer = require("three").WebGLRenderer;
var three_TextureEncoding = require("three");
var three_ToneMapping = require("three");
var three_Vector4 = require("three").Vector4;
class rendering_RenderTargetStore {
	static acquire(this1,uid,width,height,options,alwaysSyncOptions) {
		if(alwaysSyncOptions == null) {
			alwaysSyncOptions = false;
		}
		let target = this1.h[uid];
		let needsNew = target == null;
		if(alwaysSyncOptions && !needsNew) {
			needsNew = options.depthBuffer != target.depthBuffer || options.stencilBuffer != target.stencilBuffer || options.depthTexture != target.depthTexture || (options.wrapS != null && target.texture.wrapS != options.wrapS || options.wrapT != null && target.texture.wrapT != options.wrapT || options.magFilter != null && target.texture.magFilter != options.magFilter || options.minFilter != null && target.texture.minFilter != options.minFilter || options.format != null && target.texture.format != options.format || options.type != null && target.texture.type != options.type || options.anisotropy != null && target.texture.anisotropy != options.anisotropy || options.msaaSamples != null && target.samples != options.msaaSamples);
		}
		if(needsNew) {
			if(target != null) {
				target.dispose();
			}
			if(options.msaaSamples > 0) {
				let _ = new three_WebGLMultisampleRenderTarget(width,height,options);
				_.samples = options.msaaSamples;
				target = _;
			} else {
				target = new three_WebGLRenderTarget(width,height,options);
			}
			this1.h[uid] = target;
		} else {
			target.texture.generateMipmaps = options.generateMipmaps;
			target.texture.encoding = options.encoding;
			if(width != target.width || height != target.height) {
				target.setSize(width,height);
			}
		}
		return target;
	}
}
var three_WebGLRenderTarget = require("three").WebGLRenderTarget;
var three_WebGLMultisampleRenderTarget = require("three").WebGLMultisampleRenderTarget;
var three_TextureFilter = require("three");
var three_TextureDataType = require("three");
var three_Scene = require("three").Scene;
var three_DirectionalLight = require("three").DirectionalLight;
var three_AmbientLight = require("three").AmbientLight;
var three_OrthographicCamera = require("three").OrthographicCamera;
var three_BufferAttribute = require("three").BufferAttribute;
class mesh_ClipSpaceTriangle extends three_Mesh {
	constructor(material) {
		super(mesh_ClipSpaceTriangle.globalGeom,material);
		this.frustumCulled = false;
		this.castShadow = false;
		this.receiveShadow = false;
	}
}
class rendering_FragmentRenderer {
	constructor(renderer) {
		this._oldViewport = new three_Vector4();
		this.renderer = renderer;
	}
	render(target,material,clearColor,viewport) {
		this.renderer.setRenderTarget(target);
		let restoreViewport = false;
		if(viewport != null) {
			restoreViewport = true;
			this.renderer.getViewport(this._oldViewport);
			this.renderer.setViewport(viewport.x,viewport.y,viewport.z,viewport.w);
		}
		rendering_FragmentRenderer.rttMesh.material = material;
		if(clearColor != null) {
			this.renderer.setClearColor(clearColor);
			this.renderer.clear(true,false,false);
		}
		this.renderer.render(rendering_FragmentRenderer.rttScene,rendering_FragmentRenderer.rttCamera);
		if(restoreViewport) {
			this.renderer.setViewport(this._oldViewport.x,this._oldViewport.y,this._oldViewport.z,this._oldViewport.w);
		}
	}
}
class Vec3Data {
	constructor(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
class Vec4Data {
	constructor(x,y,z,w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}
var three_InterleavedBuffer = require("three").InterleavedBuffer;
var three_InterleavedBufferAttribute = require("three").InterleavedBufferAttribute;
var three_Points = require("three").Points;
class rendering_PostProcess {
	constructor(renderer) {
		this._blitBasicMaterial = new three_MeshBasicMaterial({ color : 16777215});
		this.copyShader = new rendering_CopyShader();
		this.renderer = renderer;
		this.gl = renderer.getContext();
		this.fragmentRenderer = new rendering_FragmentRenderer(renderer);
		this.renderTargetStore = new haxe_ds_StringMap();
	}
	blitViaBasicMaterial(source,target) {
		this._blitBasicMaterial.map = source;
		this.fragmentRenderer.render(target,this._blitBasicMaterial,16711935);
	}
	resize(uid,source,width,height) {
		let target = rendering_RenderTargetStore.acquire(this.renderTargetStore,"resize." + uid,width,height,{ wrapS : source.wrapS, wrapT : source.wrapT, magFilter : source.magFilter, minFilter : source.minFilter, format : source.format, type : source.type, anisotropy : source.anisotropy, generateMipmaps : source.generateMipmaps, encoding : source.encoding, depthBuffer : false, stencilBuffer : false, depthTexture : null});
		this.copyShader.setParams(source,1.);
		this.fragmentRenderer.render(target,this.copyShader);
		return target.texture;
	}
	blur(uid,source,kernel_yFraction,sigma,downsampleIterations) {
		if(downsampleIterations == null) {
			downsampleIterations = 0;
		}
		if(sigma == null) {
			sigma = 0.5;
		}
		if(kernel_yFraction == 0) {
			return source;
		}
		let blurInput = source;
		let _g = 0;
		while(_g < downsampleIterations) {
			let w = Math.pow(2,Math.floor(Math.log(blurInput.image.width * 0.5) / 0.6931471805599453)) | 0;
			let h = Math.pow(2,Math.floor(Math.log(blurInput.image.height * 0.5) / 0.6931471805599453)) | 0;
			blurInput = this.resize("blur." + _g++ + "." + uid,blurInput,w,h);
			if(w <= 1 && h <= 1) {
				break;
			}
		}
		let width = blurInput.image.width;
		let height = blurInput.image.height;
		let targetOptions = { wrapS : source.wrapS, wrapT : source.wrapT, encoding : source.encoding, generateMipmaps : source.generateMipmaps, anisotropy : source.anisotropy, type : source.type, format : source.format, minFilter : source.minFilter, magFilter : source.magFilter};
		let blurXTarget = rendering_RenderTargetStore.acquire(this.renderTargetStore,"blurX." + uid,width,height,targetOptions);
		let blurXYTarget = rendering_RenderTargetStore.acquire(this.renderTargetStore,"blurXY." + uid,width,height,targetOptions);
		let kernelY_texels = kernel_yFraction * blurInput.image.height;
		let kernelX_texels = kernel_yFraction * (1 / (source.image.width / source.image.height)) * blurInput.image.width;
		let tmp = this.fragmentRenderer;
		let kernel = kernelX_texels;
		let width1 = blurInput.image.width;
		let height1 = blurInput.image.height;
		kernel = shaders_Blur1D.nearestBestKernel(kernelX_texels);
		let key = "" + kernel + "@" + 1. + "@" + 0. + "@" + sigma;
		let instance = shaders_Blur1D.instances.h[key];
		if(instance == null) {
			instance = new shaders_Blur1D(this.gl,kernel,sigma,1.,0.,true);
			shaders_Blur1D.instances.h[key] = instance;
		}
		instance.uTexture.value = blurInput;
		instance.uTexelSize.value.set(1 / width1,1 / height1);
		tmp.render(blurXTarget,instance);
		let tmp1 = this.fragmentRenderer;
		let kernel1 = kernelY_texels;
		let texture = blurXTarget.texture;
		let width2 = blurXTarget.width;
		let height2 = blurXTarget.height;
		kernel1 = shaders_Blur1D.nearestBestKernel(kernelY_texels);
		let key1 = "" + kernel1 + "@" + 0. + "@" + 1. + "@" + sigma;
		let instance1 = shaders_Blur1D.instances.h[key1];
		if(instance1 == null) {
			instance1 = new shaders_Blur1D(this.gl,kernel1,sigma,0.,1.,true);
			shaders_Blur1D.instances.h[key1] = instance1;
		}
		instance1.uTexture.value = texture;
		instance1.uTexelSize.value.set(1 / width2,1 / height2);
		tmp1.render(blurXYTarget,instance1);
		return blurXYTarget.texture;
	}
}
class haxe_ds_StringMap {
	constructor() {
		this.h = Object.create(null);
	}
}
var three_SphereGeometry = require("three").SphereGeometry;
var three_Color = require("three").Color;
function Main_main() {
	window.document.body.appendChild(Main_canvas);
	Main_scene.add(new three_AmbientLight(16777215,0.2));
	Main_scene.add(Main_particles);
	Main_scene.add(Main_sphere);
	Main_scene.add(Main_background);
	Main_camera.position.z = 2;
	Main_camera.position.y = 1;
	Main_environmentManager.setEnvironmentMapPath("assets/env/venice_sunset_2k.rgbd.png",function(env) {
		Main_environmentManager.environmentSun.visible = false;
	},function(error) {
		$global.console.error(error);
	});
	GUI_init();
	Main_animationFrame(window.performance.now());
}
function Main_animationFrame(time_ms) {
	let time_s = time_ms / 1000;
	let dt_ms = Main_animationFrame_lastTime_ms > 0 ? time_ms - Main_animationFrame_lastTime_ms : 0.0;
	Main_animationFrame_lastTime_ms = time_ms;
	Main_uTime_s.value = time_s;
	let gl = Main_renderer.getContext();
	let x = window.innerWidth;
	let y = window.innerHeight;
	let b = Main_pixelRatio;
	let x1 = Math.floor(x * b);
	let y1 = Math.floor(y * b);
	if(!(x1 == gl.drawingBufferWidth && y1 == gl.drawingBufferHeight)) {
		Main_canvas.width = Math.floor(x1);
		Main_canvas.height = Math.floor(y1);
	}
	let newAspect = x1 / y1;
	if(Main_camera.aspect != newAspect) {
		Main_camera.aspect = newAspect;
		Main_camera.updateProjectionMatrix();
	}
	Main_update(time_s,dt_ms / 1000);
	let usePostProcess = Main_bloomEnabled && Main_bloomAlpha > 0;
	let mainRenderTarget = usePostProcess ? rendering_RenderTargetStore.acquire(Main_renderTargetStore,"main",x1,y1,{ magFilter : three_TextureFilter.LinearFilter, minFilter : three_TextureFilter.LinearFilter, depthBuffer : true, type : three_TextureDataType.HalfFloatType, encoding : three_TextureEncoding.LinearEncoding, msaaSamples : 4}) : null;
	let _toneMapping = Main_renderer.toneMapping;
	if(usePostProcess) {
		Main_renderer.toneMapping = three_ToneMapping.NoToneMapping;
	}
	Main_renderer.setRenderTarget(mainRenderTarget);
	Main_renderer.setViewport(0,0,x1,y1);
	Main_renderer.clear(true,true,true);
	Main_renderer.render(Main_scene,Main_camera);
	if(Main_bloomAlpha > 0 && Main_bloomEnabled) {
		let blurredMainLinearTexture = Main_postProcess.blur("mainBlurred",mainRenderTarget.texture,Main_bloomBlurRadius,Main_bloomSigma,Main_bloomBlurDownsampleIterations);
		shaders_BloomBlend.instance.uTexture.value = blurredMainLinearTexture;
		shaders_BloomBlend.instance.uBoomAlpha.value = Main_bloomAlpha;
		shaders_BloomBlend.instance.uBoomExponent.value = Main_bloomExponent;
		Main_fragmentRenderer.render(mainRenderTarget,shaders_BloomBlend.instance);
	}
	if(usePostProcess) {
		Main_renderer.toneMapping = _toneMapping;
		Main_postProcess.blitViaBasicMaterial(mainRenderTarget.texture,null);
	}
	window.requestAnimationFrame(Main_animationFrame);
}
function Main_update(time_s,dt_s) {
	let _this = Main_arcBallControl;
	_this.angleAroundY.step(dt_s);
	_this.angleAroundXZ.step(dt_s);
	_this.radius.step(dt_s);
	_this.position.x = _this.radius.value * Math.sin(_this.angleAroundY.value) * Math.cos(_this.angleAroundXZ.value);
	_this.position.z = _this.radius.value * Math.cos(_this.angleAroundY.value) * Math.cos(_this.angleAroundXZ.value);
	_this.position.y = _this.radius.value * Math.sin(_this.angleAroundXZ.value);
	let angle = _this.angleAroundY.value;
	let sa = Math.sin(angle * 0.5);
	let x = 0 * sa;
	let y = 1 * sa;
	let z = 0 * sa;
	let w = Math.cos(angle * 0.5);
	let angle1 = -_this.angleAroundXZ.value;
	let sa1 = Math.sin(angle1 * 0.5);
	let x1 = 1 * sa1;
	let y1 = 0 * sa1;
	let z1 = 0 * sa1;
	let w1 = Math.cos(angle1 * 0.5);
	let this1 = _this.orientation;
	this1.x = x * w1 + y * z1 - z * y1 + w * x1;
	this1.y = -x * z1 + y * w1 + z * x1 + w * y1;
	this1.z = x * y1 - y * x1 + z * w1 + w * z1;
	this1.w = -x * x1 - y * y1 - z * z1 + w * w1;
	Main_arcBallControl.applyToCamera(Main_camera);
}
class Reflect {
	static field(o,field) {
		try {
			return o[field];
		} catch( _g ) {
			return null;
		}
	}
	static fields(o) {
		let a = [];
		if(o != null) {
			let hasOwnProperty = Object.prototype.hasOwnProperty;
			for( var f in o ) {
			if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) {
				a.push(f);
			}
			}
		}
		return a;
	}
}
class Std {
	static parseInt(x) {
		if(x != null) {
			let _g = 0;
			let _g1 = x.length;
			while(_g < _g1) {
				let i = _g++;
				let c = x.charCodeAt(i);
				if(c <= 8 || c >= 14 && c != 32 && c != 45) {
					let nc = x.charCodeAt(i + 1);
					let v = parseInt(x,nc == 120 || nc == 88 ? 16 : 10);
					if(isNaN(v)) {
						return null;
					} else {
						return v;
					}
				}
			}
		}
		return null;
	}
}
function Structure_extendAny(base,extendWidth) {
	let extended = { };
	if(base != null) {
		let _g = 0;
		let _g1 = Reflect.fields(base);
		while(_g < _g1.length) {
			let field = _g1[_g];
			++_g;
			extended[field] = Reflect.field(base,field);
		}
	}
	if(extendWidth != null) {
		let _g = 0;
		let _g1 = Reflect.fields(extendWidth);
		while(_g < _g1.length) {
			let field = _g1[_g];
			++_g;
			extended[field] = Reflect.field(extendWidth,field);
		}
	}
	return extended;
}
class Vec2Data {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}
class animator_Spring {
	constructor(initialValue,target,strength,damping,velocity,onUpdate) {
		if(velocity == null) {
			velocity = 0.0;
		}
		if(damping == null) {
			damping = 18;
		}
		if(strength == null) {
			strength = 80;
		}
		this.minEnergyThreshold = 1e-5;
		this.value = initialValue;
		this.target = target == null ? initialValue : target;
		this.strength = strength;
		this.damping = damping;
		this.velocity = velocity;
		this.onUpdate = onUpdate;
	}
	step(dt_s) {
		let V0 = this.velocity;
		let X0 = this.value - this.target;
		if(X0 == 0 && V0 == 0 || dt_s == 0) {
			return;
		}
		let k = this.strength;
		let b = this.damping;
		if(0.5 * V0 * V0 + 0.5 * k * X0 * X0 < this.minEnergyThreshold) {
			this.velocity = 0;
			this.value = this.target;
		} else {
			let critical = k * 4 - b * b;
			if(critical > 0) {
				let q = 0.5 * Math.sqrt(critical);
				let B = (b * X0 * 0.5 + V0) / q;
				let m = Math.exp(-b * 0.5 * dt_s);
				let c = Math.cos(q * dt_s);
				let s = Math.sin(q * dt_s);
				this.velocity = m * ((B * q - 0.5 * X0 * b) * c + (-X0 * q - 0.5 * b * B) * s);
				this.value = m * (X0 * c + B * s) + this.target;
			} else if(critical < 0) {
				let u = 0.5 * Math.sqrt(-critical);
				let p = -0.5 * b + u;
				let n = -0.5 * b - u;
				let B = -(n * X0 - V0) / (2 * u);
				let A = X0 - B;
				let ep = Math.exp(p * dt_s);
				let en = Math.exp(n * dt_s);
				this.velocity = A * n * en + B * p * ep;
				this.value = A * en + B * ep + this.target;
			} else {
				let w = Math.sqrt(k);
				let B = V0 + w * X0;
				let e = Math.exp(-w * dt_s);
				this.velocity = (B - w * (X0 + B * dt_s)) * e;
				this.value = (X0 + B * dt_s) * e + this.target;
			}
		}
		if(this.onUpdate != null) {
			this.onUpdate(this.value,this.velocity);
		}
	}
	forceCompletion(v) {
		if(v != null) {
			this.target = v;
		}
		this.value = this.target;
		this.velocity = 0;
		if(this.onUpdate != null) {
			this.onUpdate(this.value,this.velocity);
		}
	}
}
class app_event_KeyboardEvent {
}
class app_event_PointerEvent {
	constructor(pointerId,pointerType,isPrimary,button,buttons,x,y,width,height,viewWidth,viewHeight,pressure,tangentialPressure,tiltX,tiltY,twist) {
		this.pointerId = pointerId;
		this.pointerType = pointerType;
		this.isPrimary = isPrimary;
		this.button = button;
		this.buttons = buttons;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.viewWidth = viewWidth;
		this.viewHeight = viewHeight;
		this.pressure = pressure;
		this.tangentialPressure = tangentialPressure;
		this.tiltX = tiltX;
		this.tiltY = tiltY;
		this.twist = twist;
	}
}
class app_event_WheelEvent {
	constructor(deltaX,deltaY,deltaZ,x,y,altKey,ctrlKey,metaKey,shiftKey,nativeEvent) {
		this.deltaX = deltaX;
		this.deltaY = deltaY;
		this.deltaZ = deltaZ;
		this.x = x;
		this.y = y;
		this.altKey = altKey;
		this.ctrlKey = ctrlKey;
		this.metaKey = metaKey;
		this.shiftKey = shiftKey;
		this.nativeEvent = nativeEvent;
	}
}
class haxe_io_Path {
	constructor(path) {
		switch(path) {
		case ".":case "..":
			this.dir = path;
			this.file = "";
			return;
		}
		let c1 = path.lastIndexOf("/");
		let c2 = path.lastIndexOf("\\");
		if(c1 < c2) {
			this.dir = HxOverrides.substr(path,0,c2);
			path = HxOverrides.substr(path,c2 + 1,null);
			this.backslash = true;
		} else if(c2 < c1) {
			this.dir = HxOverrides.substr(path,0,c1);
			path = HxOverrides.substr(path,c1 + 1,null);
		} else {
			this.dir = null;
		}
		let cp = path.lastIndexOf(".");
		if(cp != -1) {
			this.ext = HxOverrides.substr(path,cp + 1,null);
			this.file = HxOverrides.substr(path,0,cp);
		} else {
			this.ext = null;
			this.file = path;
		}
	}
	toString() {
		return (this.dir == null ? "" : this.dir + (this.backslash ? "\\" : "/")) + this.file + (this.ext == null ? "" : "." + this.ext);
	}
	static withoutDirectory(path) {
		let s = new haxe_io_Path(path);
		s.dir = null;
		return s.toString();
	}
	static extension(path) {
		let s = new haxe_io_Path(path);
		if(s.ext == null) {
			return "";
		}
		return s.ext;
	}
}
class haxe_iterators_ArrayIterator {
	constructor(array) {
		this.current = 0;
		this.array = array;
	}
	hasNext() {
		return this.current < this.array.length;
	}
	next() {
		return this.array[this.current++];
	}
}
class material_CustomPhysicalMaterial extends three_ShaderMaterial {
	constructor(additionalUniforms,parameters) {
		let tmp = Structure_extendAny(Three.ShaderLib.physical.uniforms,additionalUniforms);
		super(Structure_extendAny({ defines : { "STANDARD" : "", "PHYSICAL" : ""}, uniforms : tmp, vertexShader : Three.ShaderLib.physical.vertexShader, fragmentShader : Three.ShaderLib.physical.fragmentShader, fog : true},parameters));
		this.color = new three_Color(16777215);
		this.roughness = 1.0;
		this.metalness = 0.0;
		this.map = null;
		this.lightMap = null;
		this.lightMapIntensity = 1.0;
		this.aoMap = null;
		this.aoMapIntensity = 1.0;
		this.emissive = new three_Color(0);
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;
		this.bumpMap = null;
		this.bumpScale = 1;
		this.normalMa = null;
		this.normalMapType = three_NormalMapTypes.TangentSpaceNormalMap;
		this.normalScale = new three_Vector2(1,1);
		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;
		this.roughnessMap = null;
		this.metalnessMap = null;
		this.alphaMap = null;
		this.envMap = null;
		this.envMapIntensity = 1.0;
		this.refractionRatio = 0.98;
		this.wireframeLinecap = "round";
		this.wireframeLinejoin = "round";
		this.vertexTangents = false;
		this.isMeshStandardMaterial = true;
		this.clearcoat = 0.0;
		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new three_Vector2(1,1);
		this.clearcoatNormalMap = null;
		this.reflectivity = 0.5;
		this.sheen = null;
		this.transparency = 0.0;
		this.transmission = 0.;
		this.ior = 1.3;
		this.isMeshPhysicalMaterial = true;
	}
}
class rendering_CopyShader extends three_RawShaderMaterial {
	constructor() {
		let uTexture = new three_Uniform(null);
		let uOpacity = new three_Uniform(1.);
		super({ uniforms : { uTexture : uTexture, uOpacity : uOpacity}, vertexShader : "\n\t\t\t\tattribute vec2 position;\n\t\t\t\tvarying vec2 vUv;\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = position * 0.5 + 0.5;\n\t\t\t\t\tgl_Position = vec4(position, 0., 1.);\n\t\t\t\t}\n\t\t\t", fragmentShader : "\n\t\t\t\tprecision highp float;\n\t\t\t\tuniform sampler2D uTexture;\n\t\t\t\tuniform float uOpacity;\n\t\t\t\tvarying vec2 vUv;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_FragColor = texture2D(uTexture, vUv);\n\t\t\t\t\tgl_FragColor.a *= uOpacity;\n\t\t\t\t}\n\t\t\t", side : three_Side.DoubleSide, depthWrite : false, depthTest : false, fog : false, lights : false, toneMapped : false, blending : three_Blending.NoBlending});
		this.uTexture = uTexture;
		this.uOpacity = uOpacity;
	}
	setParams(texture,opacity) {
		this.uTexture.value = texture;
		this.uOpacity.value = opacity;
	}
}
class shaders_BloomBlend extends three_RawShaderMaterial {
	constructor() {
		let uTexture = new three_Uniform(null);
		let uBoomAlpha = new three_Uniform(0.1);
		let uBoomExponent = new three_Uniform(1.);
		super({ uniforms : { uTexture : uTexture, uBoomAlpha : uBoomAlpha, uBoomExponent : uBoomExponent}, vertexShader : "\n\t\t\t\tattribute vec2 position;\n\n\t\t\t\tvarying vec2 vUv;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvUv = position * 0.5 + 0.5;\n\t\t\t\t\tgl_Position = vec4(position, 0., 1.);\n\t\t\t\t}\n\t\t\t", fragmentShader : "\n\t\t\t\tprecision highp float;\n\n\t\t\t\tuniform sampler2D uTexture;\n\t\t\t\tuniform float uBoomAlpha;\n\t\t\t\tuniform float uBoomExponent;\n\n\t\t\t\tvarying vec2 vUv;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tgl_FragColor = texture2D(uTexture, vUv);\n\t\t\t\t\tgl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(uBoomExponent));\n\t\t\t\t\tgl_FragColor.a *= uBoomAlpha;\n\t\t\t\t}\n\t\t\t", side : three_Side.DoubleSide, blending : three_Blending.AdditiveBlending});
		this.uTexture = uTexture;
		this.uBoomAlpha = uBoomAlpha;
		this.uBoomExponent = uBoomExponent;
	}
}
class shaders_Blur1D extends three_RawShaderMaterial {
	constructor(ctx,kernel,truncationSigma,directionX,directionY,linearSampling) {
		let uTexture = new three_Uniform(null);
		let uTexelSize = new three_Uniform(new three_Vector2(1,1));
		let shaderParts = shaders_Blur1D.generateShaderParts(ctx,kernel,truncationSigma,directionX,directionY,linearSampling);
		let tmp = "\n\t\t\t\tprecision " + "mediump" + " float;\n\t\t\t\tattribute vec2 position;\n\n\t\t\t\tuniform vec2 invResolution;\n\n\t\t\t\t\n" + shaderParts.varyingDeclarations.join("\n") + "\n\n\t\t\t\tconst vec2 madd = vec2(0.5, 0.5);\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec2 texelCoord = (position * madd + madd);\n\n\t\t\t\t\t\n" + shaderParts.varyingValues.join("\n") + "\n\n\t\t\t\t\tgl_Position = vec4(position, 0.0, 1.);\n\t\t\t\t}\n\t\t\t";
		let tmp1 = "\n\t\t\t\tprecision " + "mediump" + " float;\n\t\t\t\tuniform sampler2D texture;\n\n\t\t\t\t\n" + shaderParts.fragmentDeclarations.join("\n") + "\n\n\t\t\t\t\n" + shaderParts.varyingDeclarations.join("\n") + "\n\n\t\t\t\tvoid main() {\n\t\t\t\t\t\n" + shaderParts.fragmentVariables.join("\n") + "\n\n\t\t\t\t\tvec4 blend = vec4(0.0);\n\t\t\t\t\t\n" + shaderParts.textureSamples.join("\n") + ";\n\t\t\t\t\tgl_FragColor = blend;\n\t\t\t\t}\n\t\t\t";
		super({ uniforms : { texture : uTexture, invResolution : uTexelSize}, vertexShader : tmp, fragmentShader : tmp1});
		this.uTexture = uTexture;
		this.uTexelSize = uTexelSize;
		this.kernel = kernel;
		this.directionX = directionX;
		this.directionY = directionY;
	}
	static generateShaderParts(ctx,kernel,truncationSigma,directionX,directionY,linearSampling) {
		let N = shaders_Blur1D.nearestBestKernel(kernel);
		let centerIndex = (N - 1) / 2;
		let offsets = [];
		let weights = [];
		let totalWeight = 0.0;
		let _g = 0;
		while(_g < N) {
			let i = _g++;
			let w = shaders_Blur1D.gaussianWeight(i / (N - 1) * 2.0 - 1,truncationSigma);
			offsets[i] = i - centerIndex;
			weights[i] = w;
			totalWeight += w;
		}
		let _g1 = 0;
		let _g2 = weights.length;
		while(_g1 < _g2) weights[_g1++] /= totalWeight;
		if(linearSampling) {
			let lerpSampleOffsets = [];
			let lerpSampleWeights = [];
			let i = 0;
			while(i < N) {
				let A = weights[i];
				let leftOffset = offsets[i];
				if(i + 1 < N) {
					let B = weights[i + 1];
					lerpSampleOffsets.push(leftOffset + B / (A + B));
					lerpSampleWeights.push(A + B);
				} else {
					lerpSampleOffsets.push(leftOffset);
					lerpSampleWeights.push(A);
				}
				i += 2;
			}
			offsets = lerpSampleOffsets;
			weights = lerpSampleWeights;
		}
		let maxVaryingRows = ctx.getParameter(36348);
		let varyingCount = Math.min(offsets.length,maxVaryingRows) | 0;
		let _g3 = [];
		let _g4 = 0;
		while(_g4 < varyingCount) _g3.push("varying vec2 sampleCoord" + _g4++ + ";");
		let _g5 = [];
		let _g6 = 0;
		while(_g6 < varyingCount) {
			let i = _g6++;
			_g5.push("sampleCoord" + i + " = texelCoord + vec2(" + shaders_Blur1D.glslFloat(offsets[i] * directionX) + ", " + shaders_Blur1D.glslFloat(offsets[i] * directionY) + ") * invResolution;");
		}
		let _g7 = [];
		let _g8 = varyingCount;
		let _g9 = offsets.length;
		while(_g8 < _g9) {
			let i = _g8++;
			_g7.push("vec2 sampleCoord" + i + " = sampleCoord0 + vec2(" + shaders_Blur1D.glslFloat((offsets[i] - offsets[0]) * directionX) + ", " + shaders_Blur1D.glslFloat((offsets[i] - offsets[0]) * directionY) + ") * invResolution;");
		}
		let _g10 = [];
		let _g11 = 0;
		let _g12 = offsets.length;
		while(_g11 < _g12) {
			let i = _g11++;
			_g10.push("blend += texture2D(texture, sampleCoord" + i + ") * " + shaders_Blur1D.glslFloat(weights[i]) + ";");
		}
		return { varyingDeclarations : _g3, varyingValues : _g5, fragmentDeclarations : varyingCount < offsets.length ? ["uniform vec2 invResolution;"] : [""], fragmentVariables : _g7, textureSamples : _g10};
	}
	static nearestBestKernel(idealKernel) {
		let v = Math.round(idealKernel);
		if(v % 2 != 0 && Math.floor(v / 2) % 2 == 0 && v > 0) {
			return Math.max(v,3) | 0;
		}
		let k = v - 1;
		if(k % 2 != 0 && Math.floor(k / 2) % 2 == 0 && k > 0) {
			return Math.max(k,3) | 0;
		}
		let k1 = v + 1;
		if(k1 % 2 != 0 && Math.floor(k1 / 2) % 2 == 0 && k1 > 0) {
			return Math.max(k1,3) | 0;
		}
		let k2 = v - 2;
		if(k2 % 2 != 0 && Math.floor(k2 / 2) % 2 == 0 && k2 > 0) {
			return Math.max(k2,3) | 0;
		}
		let k3 = v + 2;
		if(k3 % 2 != 0 && Math.floor(k3 / 2) % 2 == 0 && k3 > 0) {
			return Math.max(k3,3) | 0;
		}
		return Math.max(v,3) | 0;
	}
	static gaussianWeight(x,truncationSigma) {
		return 1.0 / (Math.sqrt(2.0 * Math.PI) * truncationSigma) * Math.exp(-(x * x / (2.0 * truncationSigma * truncationSigma)));
	}
	static glslFloat(f) {
		let s = f == null ? "null" : "" + f;
		if(s.indexOf(".") == -1) {
			s += ".";
		}
		return s;
	}
}
var three_Mapping = require("three");
var three_MeshBasicMaterial = require("three").MeshBasicMaterial;
var three_NormalMapTypes = require("three");
var three_PixelFormat = require("three");
var three_TextureLoader = require("three").TextureLoader;
var three_Vector2 = require("three").Vector2;
var three_Vector3 = require("three").Vector3;
var three_examples_jsm_loaders_rgbeloader_RGBELoader = require("three/examples/jsm/loaders/RGBELoader").RGBELoader;
var tool_PMREMGeneratorInternal = require("three").PMREMGenerator;
class tool_IBLGenerator extends tool_PMREMGeneratorInternal {
	constructor(renderer) {
		super(renderer);
	}
	_allocateTargets(equirectangular) {
		let params = { magFilter : three_TextureFilter.NearestFilter, minFilter : three_TextureFilter.NearestFilter, generateMipmaps : false, type : three_TextureDataType.UnsignedByteType, format : three_PixelFormat.RGBEFormat, encoding : this._isLDR(equirectangular) ? equirectangular.encoding : three_TextureEncoding.RGBDEncoding, depthBuffer : false, stencilBuffer : false};
		let cubeUVRenderTarget = this._createRenderTarget(params);
		cubeUVRenderTarget.depthBuffer = equirectangular != null ? false : true;
		this._pingPongRenderTarget = this._createRenderTarget(params);
		return cubeUVRenderTarget;
	}
	_isLDR(texture) {
		if(texture == null || texture.type != three_TextureDataType.UnsignedByteType) {
			return false;
		}
		if(!(texture.encoding == three_TextureEncoding.LinearEncoding || texture.encoding == three_TextureEncoding.sRGBEncoding)) {
			return texture.encoding == three_TextureEncoding.GammaEncoding;
		} else {
			return true;
		}
	}
	_createRenderTarget(params) {
		let cubeUVRenderTarget = new three_WebGLRenderTarget(3 * tool_IBLGenerator.SIZE_MAX,3 * tool_IBLGenerator.SIZE_MAX,params);
		cubeUVRenderTarget.texture.mapping = three_Mapping.CubeUVReflectionMapping;
		cubeUVRenderTarget.texture.name = "PMREM.cubeUv";
		cubeUVRenderTarget.scissorTest = true;
		return cubeUVRenderTarget;
	}
}
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
{
}
var GUI_gui = new dat_$gui_GUI({ closed : false});
control_ArcBallControl.defaults = { strength : 700, damping : 100, dragSpeed : 6, angleAroundY : 0, angleAroundXZ : 0, radius : 1, zoomSpeed : 1};
mesh_ClipSpaceTriangle.globalGeom = (function($this) {
	var $r;
	let buffer = new three_BufferGeometry();
	let triangle = new Float32Array([-1,-1,3,-1,-1,3]);
	let uv = new Float32Array(triangle.map(function(v) {
		return v * 0.5 + 0.5;
	}));
	buffer.setAttribute("position",new three_BufferAttribute(triangle,2));
	buffer.setAttribute("uv",new three_BufferAttribute(uv,2));
	$r = buffer;
	return $r;
}(this));
rendering_FragmentRenderer.rttScene = new three_Scene();
rendering_FragmentRenderer.rttCamera = new three_OrthographicCamera(-1,1,1,-1,0,1);
rendering_FragmentRenderer.rttMesh = (function($this) {
	var $r;
	let mesh = new mesh_ClipSpaceTriangle(null);
	rendering_FragmentRenderer.rttScene.add(mesh);
	$r = mesh;
	return $r;
}(this));
var Main_pixelRatio = Math.min(window.devicePixelRatio,1);
var Main_scene = new three_Scene();
var Main_camera = new three_PerspectiveCamera(100,1,0.0001,10);
var Main_canvas = (function($this) {
	var $r;
	let _ = window.document.createElement("canvas");
	_.style.position = "absolute";
	_.style.zIndex = "-1";
	_.style.top = "0";
	_.style.left = "0";
	_.style.width = "100%";
	_.style.height = "100%";
	$r = _;
	return $r;
}(this));
var Main_renderer = (function($this) {
	var $r;
	let _ = new three_WebGLRenderer({ canvas : Main_canvas, antialias : true, powerPreference : "high-performance"});
	_.autoClear = false;
	_.autoClearColor = false;
	_.autoClearDepth = false;
	_.shadowMap.enabled = false;
	_.outputEncoding = three_TextureEncoding.sRGBEncoding;
	_.toneMapping = three_ToneMapping.ACESFilmicToneMapping;
	_.toneMappingExposure = 0.2;
	_.physicallyCorrectLights = true;
	let viewport = new three_Vector4();
	_.getTransmissionRenderTarget = function() {
		_.getCurrentViewport(viewport);
		return rendering_RenderTargetStore.acquire(Main_renderTargetStore,"transmission",viewport.width,viewport.height,{ magFilter : three_TextureFilter.LinearFilter, minFilter : three_TextureFilter.LinearMipmapLinearFilter, depthBuffer : true, type : three_TextureDataType.HalfFloatType, encoding : three_TextureEncoding.LinearEncoding, generateMipmaps : true, msaaSamples : 4});
	};
	$r = _;
	return $r;
}(this));
var Main_gl = Main_renderer.getContext();
var Main_eventManager = new app_InteractionEventsManager(Main_canvas);
var Main_arcBallControl = new control_ArcBallControl({ interactionEventsManager : Main_eventManager, radius : 1.9, dragSpeed : 4., zoomSpeed : 1.});
var Main_uTime_s = new three_Uniform(0.0);
var Main_environmentManager = new EnvironmentManager(Main_renderer,Main_scene);
var Main_background = new rendering_Background();
var Main_fragmentRenderer = new rendering_FragmentRenderer(Main_renderer);
var Main_renderTargetStore = new haxe_ds_StringMap();
var Main_postProcess = new rendering_PostProcess(Main_renderer);
var Main_bloomEnabled = false;
var Main_bloomAlpha = 0.39;
var Main_bloomExponent = 2.2;
var Main_bloomSigma = 0.38;
var Main_bloomBlurRadius = 0.027;
var Main_bloomBlurDownsampleIterations = 1;
var Main_overrideTransmissionFramebuffer = false;
var Main_sphere = (function($this) {
	var $r;
	let _ = new three_Mesh(new three_SphereGeometry(1,80,80),new three_MeshPhysicalMaterial({ roughness : 0.0, color : 16777215, transmission : 0.9, attenuationTint : new three_Color(23039), attenuationDistance : 1.7, clearcoat : 0.9}));
	_.material.thickness = 1.8;
	$r = _;
	return $r;
}(this));
var Main_cube = new three_Mesh(new three_BoxGeometry(0.4,0.4,0.4),new three_MeshPhysicalMaterial({ color : 11206570, emissive : 16777215, emissiveIntensity : 30}));
var Main_particles = (function($this) {
	var $r;
	let geomArrayBuffer = new Float32Array(70000);
	{
		let _g = 0;
		while(_g < 10000) {
			let x = Math.random();
			let y = Math.random();
			let z = Math.random();
			let x1 = Math.random();
			let y1 = Math.random();
			let z1 = Math.random();
			let offset = _g++ * 7;
			geomArrayBuffer[offset] = x;
			geomArrayBuffer[1 + offset] = y;
			geomArrayBuffer[2 + offset] = z;
			let i = offset + 3;
			geomArrayBuffer[i] = x1;
			geomArrayBuffer[1 + i] = y1;
			geomArrayBuffer[2 + i] = z1;
			geomArrayBuffer[3 + i] = 1.0;
		}
	}
	let interleavedBuffer = new three_InterleavedBuffer(geomArrayBuffer,7);
	let particleGeom = new three_BufferGeometry();
	particleGeom.setAttribute("position",new three_InterleavedBufferAttribute(interleavedBuffer,3,0));
	particleGeom.setAttribute("special",new three_InterleavedBufferAttribute(interleavedBuffer,4,3));
	let m = new _$Main_StarsMaterial({ height : 0.25, winding : 7., windingExponent : 1.6, bulgeWinding : 0.8, bulgeWindingExponent : 1.6, armSpread : 1.9, armSpreadExponent : -0.1});
	let _ = new three_Points(particleGeom,m);
	_.onBeforeRender = function(renderer,scene,camera,geometry,material,group) {
		let rt = renderer.getRenderTarget();
		m.pointScale.value = (rt != null ? rt.height : Main_gl.drawingBufferHeight) * 0.005;
	};
	$r = _;
	return $r;
}(this));
var Main_animationFrame_lastTime_ms = -1.0;
shaders_BloomBlend.instance = new shaders_BloomBlend();
shaders_Blur1D.instances = new haxe_ds_StringMap();
tool_IBLGenerator.LOD_MAX = 8;
tool_IBLGenerator.SIZE_MAX = Math.pow(2,tool_IBLGenerator.LOD_MAX);
Main_main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
