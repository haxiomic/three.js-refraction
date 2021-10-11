package three;

@:jsRequire("three", "StereoCamera") extern class StereoCamera extends Camera {
	function new();
	var aspect : Float;
	var eyeSep : Float;
	var cameraL : PerspectiveCamera;
	var cameraR : PerspectiveCamera;
	function update(camera:PerspectiveCamera):Void;
	function applyQuaternion(quaternion:Quaternion):StereoCamera;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):StereoCamera;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):StereoCamera;
	function rotateX(angle:Float):StereoCamera;
	function rotateY(angle:Float):StereoCamera;
	function rotateZ(angle:Float):StereoCamera;
	function translateOnAxis(axis:Vector3, distance:Float):StereoCamera;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):StereoCamera;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):StereoCamera;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):StereoCamera;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):StereoCamera;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):StereoCamera;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():StereoCamera;
	/**
		Removes all child objects.
	**/
	function clear():StereoCamera;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):StereoCamera;
	function clone(?recursive:Bool):StereoCamera;
	function copy(source:StereoCamera, ?recursive:Bool):StereoCamera;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, StereoCamera>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, StereoCamera>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, StereoCamera>):Void;
	static var prototype : StereoCamera;
}