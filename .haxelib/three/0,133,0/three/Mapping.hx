package three;

@:enum @:jsRequire("three") extern abstract Mapping(Int) from Int to Int {
	final UVMapping : Mapping;
	final CubeReflectionMapping : Mapping;
	final CubeRefractionMapping : Mapping;
	final EquirectangularReflectionMapping : Mapping;
	final EquirectangularRefractionMapping : Mapping;
	final CubeUVReflectionMapping : Mapping;
	final CubeUVRefractionMapping : Mapping;
}