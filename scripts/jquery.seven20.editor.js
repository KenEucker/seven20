(function ($) {
    $.fn.seven20Editor = function (options) {
        var defaultOptions =
        {
            'data': '',
            "contentName": '',
            "contentId": '',
            'target': '',
            'targetForm': '',
			'formEntryHtml': '<div class="control-group"><label class="control-label" for="input-##inputname##">##displayname##</label><div class="controls"><input type="##type##" class="input-large" id="input-##inputname##" name="##inputname##" value="##value##"></div></div>',
			'formHtml':'<div id="editor-##id##" class="editor-box"><h4>Edit address entry with id:##id##</h4><form id="form-##id##" class="form-horizontal" method="post" ><div class="form-actions"><button type="submit" class="btn btn-success" data-original-title="Save"><i class="icon-ok"></i></button><button onclick="javascript:fadeAndRemove(\'#editor-##id##\'); return false;" class="btn btn-danger" data-original-title="Cancel"><i class="icon-remove"></i></button></div></form></div>'
        };
        var o = $.extend(defaultOptions, options);

        return this.each(function () {
            var elem = $(this);
			
            function init() {
                buildForm();
            }
			
			function buildForm() {
				var myForm = o.formHtml;
				
				myForm = myForm.replace(/##id##/g, o.contentId);
				
				$(o.target).append(myForm);
				o.targetForm = '#form-' + o.contentId;

                $.each(o.data, function(k, v) {
                    buildFormEntry(k, v, '', 'text');
                });

                $(o.targetForm).validate({
                    submitHandler: validateForm
                });
			}

            function getSerializedFormWithIdValue(form, id) {
                var serializedForm = $(form).serializeArray();
                var serializedString = "";
                for (var item in serializedForm) {
                    if (serializedForm[item].name == 'id') {
                        serializedForm[item].value = id;
                    }
                    serializedString += "&" + serializedForm[item].name + "=" + serializedForm[item].value;
                }

                return serializedString.replace("&", "");
            }

            function validateForm(form) {
                var data = $(form).serializeFormJSON();
                setData(o.contentId, closeForm, form.data());

                //return false;
            }

            function closeForm(result)
            {
                $(o.targetForm).parent().fadeAndRemove();
            }

            function insertFormValues(data) {
                if (data.error) {
                }
                else {

                    $.each(data, function (i, item) {
                        for (var key in item) {
                            $(o.targetForm).find('#' + key).val(item[key]);
                        }
                    });
                }
            }

            function getValidationClassFromSqlColumn(nullable) {
                var cssText = "";

                if (nullable == "NO") {
                    cssText += "required ";
                }

                return cssText;
            }

            function getValidationHtmlFromSqlColumn(maxLength) {
                if (maxLength > 0) {
                }

                return "";
            }

            function buildFormEntry(entryName, entryValue, entryClass, entryType, validationEntries) {
                if (entryName == "_id") {
                    entryClass = entryClass.replace("required", "");
                    validationEntries += " readonly=readonly "
                }
                var newEntry = o.formEntryHtml.replace(/##displayname##/g, entryName);
                newEntry = newEntry.replace(/##class##/g, entryClass);
                newEntry = newEntry.replace(/##inputname##/g, $.trim(entryName));
                newEntry = newEntry.replace(/##type##/g, entryType);
                newEntry = newEntry.replace(/##value##/g, entryValue);
                newEntry = newEntry.replace(/##validation##/g, validationEntries);

                $(newEntry).insertBefore(o.targetForm + ' .form-actions');
            }

            init();
        });
    }
})(jQuery);