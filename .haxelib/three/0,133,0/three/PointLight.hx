package three;

@:jsRequire("three", "PointLight") extern class PointLight extends Light {
	function new(?color:ColorRepresentation, ?intensity:Float, ?distance:Float, ?decay:Float);
	/**
		If non-zero, light will attenuate linearly from maximum intensity at light position down to zero at distance.
	**/
	var distance : Float;
	var decay : Float;
	var power : Float;
	function applyQuaternion(quaternion:Quaternion):PointLight;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):PointLight;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):PointLight;
	function rotateX(angle:Float):PointLight;
	function rotateY(angle:Float):PointLight;
	function rotateZ(angle:Float):PointLight;
	function translateOnAxis(axis:Vector3, distance:Float):PointLight;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):PointLight;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):PointLight;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):PointLight;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):PointLight;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):PointLight;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():PointLight;
	/**
		Removes all child objects.
	**/
	function clear():PointLight;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):PointLight;
	function clone(?recursive:Bool):PointLight;
	function copy(source:PointLight, ?recursive:Bool):PointLight;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, PointLight>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, PointLight>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, PointLight>):Void;
	static var prototype : PointLight;
}