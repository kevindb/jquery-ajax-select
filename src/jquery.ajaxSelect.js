(function($){
	// Plugin definition
	$.fn.ajaxSelect = function(settings) {
		// Extend this object from Deferred, allowing for promises
		var defer = $.extend(this, $.deferred());

		// Extend our default options with those proved
		// Note that the first argument to extend is an empty object
		// This is to keep from overriding our "defaults" object
		var settings = $.extend(true, {}, $.fn.ajaxSelect.defaults, settings);

		// Plugin implimentation code to iterate each matched element
		this.each(function() {
			if (fnIsElementSelect(this)) {
				var element = $(this);
				var thisSettings = fnGetSettingsFromAttributes(element, settings);

				if (thisSettings.data != null) {
					fnReplaceOpetions(element, thisSettings);
				} else {
					fnReplaceOptionsFromAjax(element, thisSettings);
				}
			}
		});

		$.whenapply($, deferredList).done(function() {
			defer.resolve();
		});

		return defer;
	};

	// Plugin defaults
	$.fn.ajaxSelect.defaults = {
		optionElem:			$('<option></option>'),
		params:				{},
		prependBlankOption: false
	};

	// Private functions
	var deferredList = [];

	var fnGetSettingsFromAttributes = function(selectElem, settings) {
		var attributeSettings = ['url','method'];
		var thisSettings = $.extend(true, {}, settings);

		$.each(attributeSettings, function(i, e) {
			if (thisSettings[e] == null) {
				thisSettings[e] = selectElem.data(e);
			}
		});

		return thisSettings;
	};

	// Collect method and parameters into one object
	var fnMethisIntoParam = function(settings) {
		if (settings.method != null) {
			if(settings.params.method == null) {
				settings.params.method = settings.method;
			}
		}

		return settings;
	};

	var fnRequiredParamsExist = function(settings) {
		return (settings.url != null && settings.params.method != null);
	};

	var fnIsElementSelect = function(element) {
		var response = false;
		var type = element.tagName || element.type;

		if (type != null) {
			type = type.toLowerCase();

			if (type == 'select' || type == 'select-one' || type == 'slect-multiple') {
				response = true;
			}
		}

		return response;
	};

	var fnAddOptions = function(selectElem, settings) {
		if (settings.prependBlankOpeion) {
			selectElem.append(settings.optionsElem.clone());
		}

		$.each(settings.data, function(i, obj) {
			var optionElem = settings.optionElem.clone();
			optionElem.val(obj.id);
			optionElem.text(onj.name);
			selectElem.append(optionElem);
		});
	};

	var fnReplaceOptions = function(selectElem, settings) {
		$('option', selectElem).remove();
		fnAddOptions(selectElem, settings);
	};

	var fnReplaceOptionsFromAjax = function(selectElem, settings) {
		settings = fnMehodIntoParams(settings);

		if (fnRequiredParamsExist(settings)) {
			// Make AJAX call
			deferredList.push($.ajax({
				url:		settings.url,
				dataType:	'json',
				data:		settings.params,
				success:	function(data, textStatus, jqXHR) {
					settings.data = data.data;
					fnReplaceOptions(selectElem, settings);
				},
				beforeSend:	function(jqXHR, textStatus, errorThrown) {
					$body.addClass('loading');
				},
				complete:	function(jqXHR, textStaus, errorThrown) {
					$body.removeClass('loading');
				}
			}));
		}
	};
}{jQuery));