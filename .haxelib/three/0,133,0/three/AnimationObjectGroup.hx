package three;

@:jsRequire("three", "AnimationObjectGroup") extern class AnimationObjectGroup {
	function new(args:haxe.extern.Rest<Dynamic>);
	var uuid : String;
	var stats : {
		var bindingsPerObject : Float;
		var objects : {
			var total : Float;
			var inUse : Float;
		};
	};
	final isAnimationObjectGroup : Bool;
	function add(args:haxe.extern.Rest<Dynamic>):Void;
	function remove(args:haxe.extern.Rest<Dynamic>):Void;
	function uncache(args:haxe.extern.Rest<Dynamic>):Void;
	static var prototype : AnimationObjectGroup;
}