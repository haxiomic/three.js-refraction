package three;

@:jsRequire("three", "Sprite") extern class Sprite extends Object3D<Event> {
	function new(?material:SpriteMaterial);
	final isSprite : Bool;
	var geometry : BufferGeometry;
	var material : SpriteMaterial;
	var center : Vector2;
	function raycast(raycaster:Raycaster, intersects:Array<Intersection<Object3D<Event>>>):Void;
	function copy(source:Sprite):Sprite;
	function applyQuaternion(quaternion:Quaternion):Sprite;
	/**
		Rotate an object along an axis in object space. The axis is assumed to be normalized.
	**/
	function rotateOnAxis(axis:Vector3, angle:Float):Sprite;
	/**
		Rotate an object along an axis in world space. The axis is assumed to be normalized. Method Assumes no rotated parent.
	**/
	function rotateOnWorldAxis(axis:Vector3, angle:Float):Sprite;
	function rotateX(angle:Float):Sprite;
	function rotateY(angle:Float):Sprite;
	function rotateZ(angle:Float):Sprite;
	function translateOnAxis(axis:Vector3, distance:Float):Sprite;
	/**
		Translates object along x axis by distance.
	**/
	function translateX(distance:Float):Sprite;
	/**
		Translates object along y axis by distance.
	**/
	function translateY(distance:Float):Sprite;
	/**
		Translates object along z axis by distance.
	**/
	function translateZ(distance:Float):Sprite;
	/**
		Adds object as child of this object.
	**/
	function add(object:haxe.extern.Rest<Object3D<Event>>):Sprite;
	/**
		Removes object as child of this object.
	**/
	function remove(object:haxe.extern.Rest<Object3D<Event>>):Sprite;
	/**
		Removes this object from its current parent.
	**/
	function removeFromParent():Sprite;
	/**
		Removes all child objects.
	**/
	function clear():Sprite;
	/**
		Adds object as a child of this, while maintaining the object's world transform.
	**/
	function attach(object:Object3D<Event>):Sprite;
	function clone(?recursive:Bool):Sprite;
	/**
		Adds a listener to an event type.
	**/
	function addEventListener<T>(type:T, listener:EventListener<Event, T, Sprite>):Void;
	/**
		Checks if listener is added to an event type.
	**/
	function hasEventListener<T>(type:T, listener:EventListener<Event, T, Sprite>):Bool;
	/**
		Removes a listener from an event type.
	**/
	function removeEventListener<T>(type:T, listener:EventListener<Event, T, Sprite>):Void;
	static var prototype : Sprite;
}