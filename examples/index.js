var $form;

$(function() {
	$form = $('#form1');

	var $statusId = $('#statusId').ajaxSelect( {
		url:	'task.cfc',
		method:	'getStatusList'
	});

	if ($.isNumeric(oUrl.taskId)) {
		var $getTask = $.ajax({
			url:		'task.cfc',
			dataType:	'json',
			data: {
				method:	'getTask',
				taskId:	oUrl.taskId
			},
			beforeSend:	function(jqXHR, textStatus, errorThrown) {
				try {
					$body.addClass('loading');
				} catch(e) {}
			}
		});
	}

	$.when($statusId, $getTask).done(function($statusIdDone, $task) {
		if ($task !== null) {
			// Populate form fields
			$form.loadJSON($task[0].data.taskInfo);
 		}

 		$body.removeClass('loading');
	});

	var $formValidator = $form.validate();
});
