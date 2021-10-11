package three;

@:enum @:jsRequire("three") extern abstract PixelFormat(Int) from Int to Int {
	final AlphaFormat : PixelFormat;
	final RGBFormat : PixelFormat;
	final RGBAFormat : PixelFormat;
	final LuminanceFormat : PixelFormat;
	final LuminanceAlphaFormat : PixelFormat;
	final RGBEFormat : PixelFormat;
	final DepthFormat : PixelFormat;
	final DepthStencilFormat : PixelFormat;
	final RedFormat : PixelFormat;
	final RedIntegerFormat : PixelFormat;
	final RGFormat : PixelFormat;
	final RGIntegerFormat : PixelFormat;
	final RGBIntegerFormat : PixelFormat;
	final RGBAIntegerFormat : PixelFormat;
}