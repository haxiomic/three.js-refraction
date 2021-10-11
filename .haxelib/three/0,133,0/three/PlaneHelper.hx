package three;

@:jsRequire("three", "PlaneHelper") extern class PlaneHelper extends LineSegments<BufferGeometry, ts.AnyOf2<Material, Array<Material>>> {
	function new(plane:Plane, ?size:Float, ?hex:Float);
	var plane : Plane;
	var size : Float;
	function computeLineDistances():PlaneHelper;
	function applyQuaternion(quaternion:Quaternion):PlaneHelper;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):PlaneHelper;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):PlaneHelper;
	function rotateX(angle:Float):PlaneHelper;
	function rotateY(angle:Float):PlaneHelper;
	function rotateZ(angle:Float):PlaneHelper;
	function translateOnAxis(axis:Vector3, distance:Float):PlaneHelper;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):PlaneHelper;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):PlaneHelper;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):PlaneHelper;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):PlaneHelper;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):PlaneHelper;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():PlaneHelper;
	/**
		Removes all child objects.
	**/
	function clear():PlaneHelper;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):PlaneHelper;
	function clone(?recursive:Bool):PlaneHelper;
	function copy(source:PlaneHelper, ?recursive:Bool):PlaneHelper;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, PlaneHelper>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, PlaneHelper>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, PlaneHelper>):Void;
	static var prototype : PlaneHelper;
}