/**
 * Sample interface definition.
 * @class test.aria.core.test.Interface1
 */
Aria.interfaceDefinition({
	$classpath : "test.aria.core.test.Interface1",
	$events : {
		"MyEventFromInterface1" : "This  event belongs to interface 1."
	},
	$interface : {
		// The $interface section contains empty functions, objects or arrays
		search : function () {},
		reset : function () {},
		myData : "Object",
		myArray : []
	}
});