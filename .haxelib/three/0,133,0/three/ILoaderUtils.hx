package three;

typedef ILoaderUtils = {
	function decodeText(array:js.lib.BufferSource):String;
	function extractUrlBase(url:String):String;
};