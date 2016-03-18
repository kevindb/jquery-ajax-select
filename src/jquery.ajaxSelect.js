(function($) {
	// Plugin definition
	$.fn.ajaxSelect = function(settings) {
		// Extend this object from Deferred, allowing for promises
		var defer = $.extend(this, $.Deferred());

		// Extend our default options with those proved
		// Note that the first argument to extend is an empty object
		// This is to keep from overriding our "defaults" object
		var settings = $.extend(true, {}, $.fn.ajaxSelect.defaults, settings);

		// Plugin implimentation code to iterate each matched element
		this.each(function() {
			if (fnIsElementSelect(this)) {
				var element = $(this);
				var thisSettings = fnGetSettingsFromAttributes(element, settings);

				if (thisSettings.data !== null) {
					fnReplaceOptions(element, thisSettings);
				} else {
					fnReplaceOptionsFromAjax(element, thisSettings);
				}
			}
		});

		$.when.apply($, deferredList).done(function() {
			defer.resolve();
		});

		return defer;
	};

	// Plugin defaults
	$.fn.ajaxSelect.defaults = {
		optionElem:			$('<option></option>'),
		params:				{},
		prependBlankOption:	false,
		blankOptionValue:	'',
		data:				null,
		dataSrc:			'data'
	};

	// Private functions
	var deferredList = [];

	var fnGetSettingsFromAttributes = function(selectElem, settings) {
		var attributeSettings = ['url','method'];
		var thisSettings = $.extend(true, {}, settings);

		$.each(attributeSettings, function(i, e) {
			if (thisSettings[e] === null) {
				thisSettings[e] = selectElem.data(e);
			}
		});

		return thisSettings;
	};

	// Collect method and parameters into one object
	var fnMethodIntoParam = function(settings) {
		if (settings.method !== null) {
			if(settings.params.method === null) {
				settings.params.method = settings.method;
			}
		}

		return settings;
	};

	var fnRequiredParamsExist = function(settings) {
		return (settings.url !== null && settings.params.method !== null);
	};

	var fnIsElementSelect = function(element) {
		var response = false;
		var type = element.tagName || element.type;

		if (type !== null) {
			type = type.toLowerCase();

			if (type == 'select' || type == 'select-one' || type == 'select-multiple') {
				response = true;
			}
		}

		return response;
	};

	var fnAddOptions = function(selectElem, settings) {
		var options = [];

		if (settings.prependBlankOption) {
			options.push(settings.optionElem.clone().val(settings.blankOptionValue));
		}

		$.each(settings.data, function(i, obj) {
			var optionElem = settings.optionElem.clone();
			optionElem.val(obj.id);
			optionElem.text(obj.name);
			options.push(optionElem);
		});

		selectElem.append(options);
	};

	var fnReplaceOptions = function(selectElem, settings) {
		$('option', selectElem).remove();
		fnAddOptions(selectElem, settings);
	};

	var fnReplaceOptionsFromAjax = function(selectElem, settings) {
		settings = fnMethodIntoParam(settings);

		if (fnRequiredParamsExist(settings)) {
			// Make AJAX call
			deferredList.push($.ajax({
				url:		settings.url,
				dataType:	'json',
				data:		settings.params,
				success:	function(data, textStatus, jqXHR) {
					if (settings.dataSrc.length) {
						settings.data = data[settings.dataSrc];
					} else {
						settings.data = data;
					}
					fnReplaceOptions(selectElem, settings);
				},
				beforeSend:	function(jqXHR, textStatus, errorThrown) {
					try {
						$body.addClass('loading');
					} catch(e) {}
				},
				complete:	function(jqXHR, textStatus, errorThrown) {
					try {
						$body.removeClass('loading');
					} catch(e) {}
				}
			}));
		}
	};
} (jQuery));
