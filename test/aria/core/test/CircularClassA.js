/**
 * Test class for detection of circular reference
 * @class test.aria.core.test.CircularClassA
 */
Aria.classDefinition({
	$classpath : 'test.aria.core.test.CircularClassA',
	$dependencies : ['test.aria.core.test.CircularClassD', 'test.aria.core.test.CircularClassB'],
	$constructor : function () {
		// TODO: implement constructor
	},
	$destructor : function () {
		// TODO: implement destructor
	},
	$prototype : {

		/**
		 * TODOC
		 */
		myPublicFunction : function () {},

		/**
		 * @private TODOC
		 */
		_myPrivateFunction : function () {}

	}
});