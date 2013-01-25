/*
 * Copyright 2012 Amadeus s.a.s.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Test case for aria.utils.Orientation
 */
Aria.classDefinition({
    $classpath : "test.aria.utils.OrientationTest",
    $extends : "aria.jsunit.TestCase",
    $dependencies : ["aria.utils.Orientation"],
    $constructor : function () {
        this.$TestCase.constructor.call(this);
        this.windowObj = Aria.$window;
    },
    $prototype : {
    	 setUp : function () {
             // Setup required environment for orientation change simulation test
    		this.emitter = new aria.utils.Orientation();
         	this.windowObj.orientationchange = function (thisObj) {
                this.$raiseEvent({
                    name : "change",
                    screenOrientation : this.windowObj.orientation,
                    isPortrait : this.isPortrait,
                    scope : thisObj
                })
            };
         },
         tearDown : function () {
        	 this.emitter = null;
         },
        /**
         * Test case for aria.utils.Orientation
         * testOrientation() will be used for simulating orientation change on desktop browser
         * that with mobile device browser where orientationchange event is present
         * @public
         */
        testOrientation : function () {
            // capture the change event raised by
            this.emitter.$on({
                "change" : this.__assertValues,
                scope : this
            });
            // Call the mock method to add orientation change
            this.__mockOrientation(0);
        },
        /**
         *__assertValues() will be used to assert isPortrait based on the  screenOrientation
         * @private
         * @param {Object} evt
         */
        __assertValues : function (evt) {
            if (evt.screenOrientation % 180 == 0) {
                this.assertTrue(evt.isPortrait == true, "Orientation is not correct " + evt.isPortrait)
            } else {
                this.assertTrue(evt.isPortrait == false, "Orientation is not correct " + evt.isPortrait)
            }
        },
        /**
         * Mock Orientation change for desktop browsers. Add orientationchange mock event through a normal function
         * Invoke the mock event explicitly.
         * @private
         * @param arg
         */
        __mockOrientation : function (arg) {
            this.windowObj.orientation = arg;
            this.emitter._onOrientationChange();
            if (arg != 90) {
                this.__mockOrientation(90);
            }
        }
    }
});