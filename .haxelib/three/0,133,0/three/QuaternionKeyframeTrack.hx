package three;

@:jsRequire("three", "QuaternionKeyframeTrack") extern class QuaternionKeyframeTrack extends KeyframeTrack {
	function new(name:String, times:Array<Dynamic>, values:Array<Dynamic>, ?interpolation:InterpolationModes);
	function clone():QuaternionKeyframeTrack;
	static var prototype : QuaternionKeyframeTrack;
}