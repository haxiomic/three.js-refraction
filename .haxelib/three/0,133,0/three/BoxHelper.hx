package three;

@:jsRequire("three", "BoxHelper") extern class BoxHelper extends LineSegments<BufferGeometry, ts.AnyOf2<Material, Array<Material>>> {
	function new(object:Object3D<Event>, ?color:ColorRepresentation);
	function update(?object:Object3D<Event>):Void;
	function setFromObject(object:Object3D<Event>):BoxHelper;
	function computeLineDistances():BoxHelper;
	function applyQuaternion(quaternion:Quaternion):BoxHelper;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):BoxHelper;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):BoxHelper;
	function rotateX(angle:Float):BoxHelper;
	function rotateY(angle:Float):BoxHelper;
	function rotateZ(angle:Float):BoxHelper;
	function translateOnAxis(axis:Vector3, distance:Float):BoxHelper;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):BoxHelper;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):BoxHelper;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):BoxHelper;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):BoxHelper;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):BoxHelper;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():BoxHelper;
	/**
		Removes all child objects.
	**/
	function clear():BoxHelper;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):BoxHelper;
	function clone(?recursive:Bool):BoxHelper;
	function copy(source:BoxHelper, ?recursive:Bool):BoxHelper;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, BoxHelper>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, BoxHelper>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, BoxHelper>):Void;
	static var prototype : BoxHelper;
}