package three;

@:jsRequire("three", "VectorKeyframeTrack") extern class VectorKeyframeTrack extends KeyframeTrack {
	function new(name:String, times:Array<Dynamic>, values:Array<Dynamic>, ?interpolation:InterpolationModes);
	function clone():VectorKeyframeTrack;
	static var prototype : VectorKeyframeTrack;
}