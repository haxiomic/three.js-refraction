package three;

/**
	see {@link https://github.com/mrdoob/three.js/blob/master/src/lights/DirectionalLight.js|src/lights/DirectionalLight.js}
**/
@:jsRequire("three", "DirectionalLight") extern class DirectionalLight extends Light {
	function new(?color:ColorRepresentation, ?intensity:Float);
	/**
		Target used for shadow camera orientation.
	**/
	var target : Object3D<Event>;
	final isDirectionalLight : Bool;
	function applyQuaternion(quaternion:Quaternion):DirectionalLight;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):DirectionalLight;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):DirectionalLight;
	function rotateX(angle:Float):DirectionalLight;
	function rotateY(angle:Float):DirectionalLight;
	function rotateZ(angle:Float):DirectionalLight;
	function translateOnAxis(axis:Vector3, distance:Float):DirectionalLight;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):DirectionalLight;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):DirectionalLight;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):DirectionalLight;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):DirectionalLight;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):DirectionalLight;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():DirectionalLight;
	/**
		Removes all child objects.
	**/
	function clear():DirectionalLight;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):DirectionalLight;
	function clone(?recursive:Bool):DirectionalLight;
	function copy(source:DirectionalLight, ?recursive:Bool):DirectionalLight;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, DirectionalLight>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, DirectionalLight>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, DirectionalLight>):Void;
	static var prototype : DirectionalLight;
}