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
(function () {

    // shortcuts
    var stringUtil, typesUtil;

    /**
     * Resources handler for LABEL-CODE suggestions. This handler is to be fed and used with user defined entries.<br />
     * Suggestion must match the bean defined in this.SUGGESTION_BEAN
     */
    Aria.classDefinition({
        $classpath : "aria.resources.handlers.LCRangeResourceHandler",
        $extends : "aria.resources.handlers.LCResourcesHandler",
        $dependencies : ["aria.resources.handlers.LCRangeResourceHandlerBean", "aria.utils.String", "aria.utils.Array"],
        $statics : {
            /**
             * Suggestion bean that validates a given suggestion
             * @type String
             */
            CONFIGURATION_BEAN : "aria.resources.handlers.LCRangeResourceHandlerBean.Configuration"

        },
        $constructor : function (cfg) {
            this.$LCResourcesHandler.constructor.call(this, cfg);
            if (cfg) {
                this.allowRangeValues = cfg.allowRangeValues || false;
            }

        },
        $onload : function () {
            stringUtil = aria.utils.String;
            typesUtil = aria.utils.Type;
        },
        $onunload : function () {
            stringUtil = null;
            typesUtil = null;
        },
        $prototype : {

            rangePattern : /^[a-z]{1}\d+-\d+/,

            /**
             * Call the callback with an array of suggestions in its arguments. Suggestions that are exact match are
             * marked with parameter exactMatch set to true.
             * @param {String} textEntry Search string
             * @param {aria.core.CfgBeans.Callback} callback Called when suggestions are ready
             */
            getSuggestions : function (textEntry, callback) {

                if (typesUtil.isString(textEntry) && textEntry.length >= this.threshold) {
                    textEntry = stringUtil.stripAccents(textEntry).toLowerCase();

                    var codeSuggestions = [], labelSuggestions = [], nbSuggestions = this._suggestions.length, textEntryLength = textEntry.length;
                    var results = {};
                    var index, suggestion, isRangeValue = false;
                    var patt = this.rangePattern;
                    if (this.allowRangeValues && patt.test(textEntry)) {
                        var firstLetter = textEntry.charAt(0);
                        var rangeV = textEntry.substring(1).split("-");
                        isRangeValue = true;
                    } else {
                        var rangeV = [];
                        rangeV[0] = 1;
                        rangeV[1] = 1;
                    }
                    for (var k = rangeV[0]; k <= rangeV[1]; k++) {
                        textEntry = firstLetter ? firstLetter + k : textEntry;
                        textEntryLength = textEntry.length;
                        for (index = 0; index < nbSuggestions; index++) {
                            suggestion = this._suggestions[index];
                            if (suggestion.code === textEntry) {
                                suggestion.original.exactMatch = !isRangeValue && true;
                                codeSuggestions.unshift(suggestion.original);
                            } else if (suggestion.code.substring(0, textEntryLength) === textEntry
                                    && !this.codeExactMatch) {
                                codeSuggestions.push(suggestion.original);
                                suggestion.original.exactMatch = false;
                            } else {
                                if (suggestion.label.substring(0, textEntryLength) === textEntry) {
                                    var exactMatch = suggestion.label === textEntry;
                                    exactMatch = !isRangeValue && exactMatch;
                                    suggestion.original.exactMatch = exactMatch;
                                    if (exactMatch) {
                                        labelSuggestions.unshift(suggestion.original);
                                    } else {
                                        labelSuggestions.push(suggestion.original);
                                    }
                                }
                            }
                        }
                    }

                    var suggestions = codeSuggestions.concat(labelSuggestions);
                    results.suggestions = suggestions;
                    results.multipleValues = isRangeValue;
                    this.$callback(callback, results);
                } else {
                    this.$callback(callback, null);
                }
            }

        }
    });
})();