/**
 * Test for the IOFilter class.
 * @class test.aria.core.IOFiltersMgrTest
 */
Aria.classDefinition({
	$classpath : 'test.aria.core.IOFilterTest',
	$extends : 'aria.jsunit.TestCase',
	$dependencies : ['aria.core.IOFilter'],
	$prototype : {
		testSetJsonPostData : function () {
			var filter = new aria.core.IOFilter();
			var req = {
				url : aria.core.DownloadMgr.resolveURL("test/aria/core/test/TestFile.txt", true),
				method : "POST",
				postData : "notChanged"
			};
			filter.setJsonPostData(req, {});
			this.assertTrue(req.postData == "data={}");
			filter.$dispose();

			// Test for PTR 05168918: keys must be enclosed in ""
			filter = new aria.core.IOFilter();
			req = {
				url : aria.core.DownloadMgr.resolveURL("test/aria/core/test/TestFile.txt", true),
				method : "POST",
				postData : "notChanged"
			};
			filter.setJsonPostData(req, {
				a : {
					b : "c"
				}
			});
			this.assertTrue(req.postData.indexOf("\"a\"") != -1);
      this.assertTrue(req.postData.indexOf("\"b\"") != -1);
			filter.$dispose();
		},

		testAsyncCheckErrorInFilter : function () {
			var ioFiltersMgr = aria.core.IOFiltersMgr;
			var oSelf = this;
			var onRequestCalled = false;
			var onResponseCalled = false;
			var myRequest = {
				sender : {
					classpath : this.$classpath
				},
				url : aria.core.DownloadMgr.resolveURL("test/aria/core/test/TestFile.txt", true),
				callback : {
					fn : function (res) {
						this.assertTrue(res == myRequest.res);
						// check that the exception raised by onResponse was reported in the logs:
						this.assertErrorInLogs(aria.core.IOFilter.FILTER_RES_ERROR);
						this.assertLogsEmpty(); // the previous error should be the only error in the logs
						// check the file was correctly requested, even if there were exceptions
						this.assertTrue(res.responseText == "[Some Test Content]");
						ioFiltersMgr.removeFilter("test.aria.core.test.IOFilterSample");
						this.notifyTestEnd("testAsyncCheckErrorInFilter");
					},
					scope : this,
					onerror : function (res) {
						this.fail("The error callback should not be called.");
					}
				}
			};
			ioFiltersMgr.addFilter({
				classpath : "test.aria.core.test.IOFilterSample",
				initArgs : {
					onRequest : function (req) {
						oSelf.assertFalse(onRequestCalled);
						oSelf.assertTrue(req == myRequest);
						onRequestCalled = true;
						oSelf.assertLogsEmpty(); // make sure logs are empty before raising the exception
						this.callInvalidMethod(); // raise an exception
					},
					onResponse : function (req) {
						oSelf.assertTrue(onRequestCalled);
						oSelf.assertFalse(onResponseCalled);
						oSelf.assertTrue(req == myRequest)
						// check that the exception raised by onRequest was reported in the logs:
						oSelf.assertErrorInLogs(this.FILTER_REQ_ERROR);
						oSelf.assertLogsEmpty(); // the previous error should be the only error in the logs
						onResponseCalled = true;
						this.callInvalidMethod(); // raise an exception
					}
				}
			});
			aria.core.IO.asyncRequest(myRequest);
		},

		testAsyncCheckRedirectToFile : function () {
			var ioFiltersMgr = aria.core.IOFiltersMgr;
			var oSelf = this;
			var onRequestCalled = false;
			var onResponseCalled = false;
			var myRequest = {
				sender : {
					classpath : this.$classpath
				},
				url : "/originalRequest",
				callback : {
					fn : function (res) {
						this.assertTrue(res == myRequest.res);
						this.assertTrue(onResponseCalled);
						this.assertTrue(res.responseText == "[Changed Content]");
						ioFiltersMgr.removeFilter("test.aria.core.test.IOFilterSample");
						this.notifyTestEnd("testAsyncCheckRedirectToFile");
					},
					scope : this,
					onerror : function (res) {
						this.fail("The error callback should not be called.");
					}
				}
			};
			ioFiltersMgr.addFilter({
				classpath : "test.aria.core.test.IOFilterSample",
				initArgs : {
					onRequest : function (req) {
						oSelf.assertFalse(onRequestCalled);
						oSelf.assertTrue(req == myRequest);
						onRequestCalled = true;
						this.redirectToFile(req, "test/aria/core/test/TestFile.txt");
					},
					onResponse : function (req) {
						oSelf.assertTrue(onRequestCalled);
						oSelf.assertFalse(onResponseCalled);
						oSelf.assertTrue(req == myRequest)
						oSelf.assertTrue(req.res.responseText == "[Some Test Content]");
						req.res.responseText = "[Changed Content]";
						onResponseCalled = true;
					}
				}
			});
			aria.core.IO.asyncRequest(myRequest);
		},

		/**
		 * Test to check filter delays.
		 */
		testAsyncFilterDelays : function () {
			var delayApplied = false;
			aria.core.IOFiltersMgr.addFilter({
				classpath : 'aria.core.IOFilter',
				initArgs : {
					requestDelay : 1000,
					responseDelay : 1000
				}
			});
			aria.core.Timer.addCallback({
				fn : function () {
					delayApplied = true;
				},
				delay : 2000,
				scope : this
			});
			aria.core.IO.asyncRequest({
				sender : {
					classpath : this.$classpath
				},
				url : aria.core.DownloadMgr.resolveURL("test/aria/core/test/TestFile.txt", true),
				callback : {
					scope : this,
					fn : function (evt) {
						try {
							this.assertTrue(delayApplied, "Delay not applied");
							aria.core.IOFiltersMgr.removeFilter('aria.core.IOFilter');
							this.assertTrue(aria.core.IOFiltersMgr._filters === null);
						} catch (ex) {
							this.handleAsyncTestError(ex, false);
						}
						this.notifyTestEnd("testAsyncFilterDelays");
					}

				}
			});
		}
	}
});