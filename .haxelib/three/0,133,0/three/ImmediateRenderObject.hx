package three;

@:jsRequire("three", "ImmediateRenderObject") extern class ImmediateRenderObject extends Object3D<Event> {
	function new(material:Material);
	final isImmediateRenderObject : Bool;
	var material : Material;
	var hasPositions : Bool;
	var hasNormals : Bool;
	var hasColors : Bool;
	var hasUvs : Bool;
	var positionArray : Null<js.lib.Float32Array>;
	var normalArray : Null<js.lib.Float32Array>;
	var colorArray : Null<js.lib.Float32Array>;
	var uvArray : Null<js.lib.Float32Array>;
	var count : Float;
	function render(renderCallback:() -> Void):Void;
	function applyQuaternion(quaternion:Quaternion):ImmediateRenderObject;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):ImmediateRenderObject;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):ImmediateRenderObject;
	function rotateX(angle:Float):ImmediateRenderObject;
	function rotateY(angle:Float):ImmediateRenderObject;
	function rotateZ(angle:Float):ImmediateRenderObject;
	function translateOnAxis(axis:Vector3, distance:Float):ImmediateRenderObject;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):ImmediateRenderObject;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):ImmediateRenderObject;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):ImmediateRenderObject;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):ImmediateRenderObject;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):ImmediateRenderObject;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():ImmediateRenderObject;
	/**
		Removes all child objects.
	**/
	function clear():ImmediateRenderObject;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):ImmediateRenderObject;
	function clone(?recursive:Bool):ImmediateRenderObject;
	function copy(source:ImmediateRenderObject, ?recursive:Bool):ImmediateRenderObject;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, ImmediateRenderObject>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, ImmediateRenderObject>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, ImmediateRenderObject>):Void;
	static var prototype : ImmediateRenderObject;
}