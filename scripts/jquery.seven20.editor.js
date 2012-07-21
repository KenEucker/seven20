(function ($) {
    $.fn.epicEditor = function (options) {
        var defaultOptions =
        {
            'data': '',
            'contentname': '',
            'contentid': '',
            'mode': '',
            'storedProcMode': '',
            'targetForm': '',
            'successSaveFun': '',
            'formEntryHtml': '<tr><td class="name">##displayname##</td><td class="value"><input name="##inputname##" type="##type##" id="##inputname##" class="form-input ##class##" ##validation## ></td></tr>'
        };
        var o = $.extend(defaultOptions, options);

        return this.each(function () {
            var elem = $(this);

            function init() {
                $.each(o.data, function (i, item) {
                    buildFormEntry(item.name, item.name, getValidationClassFromSqlColumn(item.nullable), getHtmlInputTypeFromSqlDatatype(item.type), getValidationHtmlFromSqlColumn(item.maxLength));
                });

                if (o.contentid !== "") {
                    getData('/d/' + o.contentname + '/' + o.contentid, '', insertFormValues, false);
                }

                $(o.targetForm).validate({
                    submitHandler: validateform
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

            function validateform(form) {
                if (o.mode == "Edit") {
                    getData('/m/usp_udt_' + o.contentname + o.storedProcMode, getSerializedFormWithIdValue(form, o.contentid), o.successSaveFun, false, '', o.targetForm);
                }
                else if (o.mode == "Create") {


                    getData('/m/sp_getNextContentIdentityFromName', 'content_name=' + o.contentname, function (data) {
                        if (data.error) {
                            return false;
                        }
                        getData('/m/usp_udt_' + o.contentname + o.storedProcMode, getSerializedFormWithIdValue(form, data[0].id), o.successSaveFun, false, '', o.targetForm);
                    }, false);
                }

                return false;
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

            function buildFormEntry(displayName, entryName, entryClass, entryType, validationEntries) {
                if (entryName == "id") {
                    entryClass = entryClass.replace("required", "");
                    validationEntries += " readonly=readonly "
                }
                var newEntry = o.formEntryHtml.replace(/##displayname##/g, displayName);
                newEntry = newEntry.replace(/##class##/g, entryClass);
                newEntry = newEntry.replace(/##inputname##/g, $.trim(entryName));
                newEntry = newEntry.replace(/##type##/g, entryType);
                newEntry = newEntry.replace(/##validation##/g, validationEntries);

                $(newEntry).insertBefore($(o.targetForm).find('table tbody').children().last('tr'));
            }

            init();
        });
    }
})(jQuery);