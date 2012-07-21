(function ($) {
    $.fn.epicGrid = function (options) {
        var defaultOptions =
        {
            "contentType": '',
            'dataUrl': '',
            'dataParams': '',
            'gridSelector': '#gridUI',
            'outerContainerSelector': '#grid-inner-container',
            'innerContainerSelector': '#grid-inner-container .grid-items-list',
            'gridItemSelector': '.grid-items-list',
            'messageSelector': '.yellow-message',
            'buildViewer': false,
            'timer': '',
            'filter': '',
            'downKey': 40,
            'upKey': 38,
            'selectKey': 32,
            'deleteKey': 46,
            'completeKey': 35,
            'deleteFunction': null,
            'editFunction': null,
            'archiveFuntion': null,
            'pinFunction': null,
            'loadDataFunction': null,
            'editButtons': null,
            'scrollbarSelector1': $('#nav'),
            'scrollbarSelector2': 'div.nav-category',
            'scrollbarSelector3': 'h3',
            'globalButtonNames': ["refresh", "add"],
            'globalButtonIcons': ["refresh", "plus"],
            'editButtonNames': ["pin", "share", "edit", "archive", "delete"],
            'editButtonIcons': ["heart", "share", "edit", "inbox", "trash"],
            'viewerTemplate': '<div id="viewer" class="well grid-height"><div id="view-items-list" class=""></div></div>',
            'gridTemplate': '<div id="grid" class="well grid-width"><div id="grid-inner-container" class="grid-width"><div class="grid-control-bar grid-width"><div class="grid-control-buttons" grid-width><div class="left-padding"></div><label class="checkbox"><input type="checkbox" class="selectall"></label><div class="input-append" style="display: inline-block;"><input type="text" rows="30" id="filterText" class="input-medium"><a class="btn filter-button" href="#" data-original-title="Filter"><i class="icon-filter"></i></a></div><div class="global-buttons"></div><div class="edit-buttons"></div></div></div><div class="error-message"></div><div class="grid-items-list grid-height grid-width"><div class="no-data">No Data To Show</div></div></div></div>',
            'barButtonHtml': '<a class="btn ##name##-button" href="#" data-original-title="##tip##"><i class="icon-##icon##"></i></a>',
            'viewTemplate1': '<div class="view-row"><div class="view-name">',
            'viewTemplate2': '</div><div class="view-value">',
            'viewTemplate3': '</div></div>',
            'arrowHTML': '<div class="selected-item"></div>'
        };
        var o = $.extend(defaultOptions, options);

        return this.each(function () {
            var $t = $(this);

            function init() {
                buildGrid();
                if(o.buildViewer)
                    buildViewer();
                callLoadData();

                var editButtonSelector = configureButtons();
                o.editButtons = $t.find(editButtonSelector);
                o.editButtons.hide();

                configureButtonEvents();
                configureCheckboxes($t);
                configureGridItemClick();
            }

            function showLoadingAnimation() {
                $(o.innerContainerSelector).html('<div class="loading-results">Loading Results</div>');
            }

            function insertData(data) {
                $(o.innerContainerSelector).html('<div class="no-data">No Data To Show</div>');

                if (data.error) {
                    ShowMessage('Error: ' + data.error, 'Get Data Eror', 'error');
                    return;
                }

                $(o.innerContainerSelector).html('');

                $.each(data, function (i, item) {
                    var item_html = grid_item_html;
                    var count = 0;
                    for (var key in item) {
                        item_html = item_html.replace('##' + count++ + '##', item[key]);
                    }
                    $(o.innerContainerSelector).append(item_html);
                });
            }

            function callLoadData() {
                getData(o.contentType, insertData, o.dataParams, o.dataUrl);
            }

            function callRefresh() {
                getData(o.contentType, insertData, o.dataParams, o.dataUrl);
            }

            function buildViewer() {
                $(o.gridSelector).append(o.viewerTemplate);
            }

            function buildGrid() {
                $(o.gridSelector).append(o.gridTemplate);
            }

//            function displayItem(item)
//            {
//                $("#viewer").append('<p>');
//                $.each(item, function(k, v) {
//                    if(k === '_id')
//                    {
//                        $("#viewer").append('<h4>_id: ' + v + '</h4>');
//                    }
//                    else
//                    {
//                        $("#viewer").append(k + ': ' + v + '</br>');
//                    }
//
//                });
//                $("#viewer").append('</p>');
//            }
//
//            function showDataInViewer(data)
//            {
//                $("#viewer").html('');
//                if($.isArray(data))
//                {
//                    $.each(data, function(i, item) {
//                        displayItem(item);
//                    });
//                }
//                else
//                {
//                    displayItem(data);
//                }
//            }

            function refreshData() {
                // Show loading animation
                showLoadingAnimation($('#grid-inner-container .grid-items-list'));
                getData('/h/' + contentname, '', insertData, false, '', $('#grid-inner-container .grid-items-list'), true);
            }

            function addCreatorItem() {
                var newDivId = "new" + contentname + $('#editor').find('div.add-div').length;
                $('#viewer').append('<div class="add-div"></div>');
                $.get("/Create/d/" + contentname + "?embedded=true&target=" + newDivId, function (html) {
                    $('#viewer .add-div:last').html(html);
                });
            }

            function editItems() {
                var selectedItems = $('.checked-grid-item-bar');
                $.each(selectedItems, function (i, item) {
                    var itemID = $(item).find('.id-tag').html().trim();
                    addEditorItem(itemID);
                });
            }

            function deleteItems() {
                var selectedItems = $('.checked-grid-item-bar');
                $.each(selectedItems, function (i, item) {
                    var itemID = $(item).find('.id-tag').html().trim();
                    getData('/m/sp_deleteContentById', 'id=' + itemID, function () { }, false);
                });
            }

            function addEditorItem(id) {
                var newDivId = "edit" + contentname + id;
                if ($('#' + newDivId).length != 0)
                    return;
                $('#viewer').append('<div class="edit-div ' + newDivId + '"></div>');
                $('#viewer div.edit-div.' + newDivId).load("/Edit/d/" + contentname + "/" + id + "/?embedded=true&loadscripts=false&target=" + newDivId);
                //$.get("/Edit/" + contentname + "/" + id + "/?embedded=true&loadscripts=false&target=" + newDivId, function (html) {
                //    $('div.edit-div.' + newDivId).html(html);
                //});
            }

            function configureCheckboxes() {
                $t.find('.selectall').bind('click', function () {
                    if ($(this).is(':checked')) {
                        $(o.gridItemSelector).find(':checkbox:not(:checked)').attr('checked', 'checked').change();
                        //enableGridButtons();
                    } else {
                        $(o.gridItemSelector).find(':checkbox:checked').removeAttr('checked').change();
                        //disableGridButtons();
                    }
                });

                // Turn item bar yellow on checkbox click
                $(o.gridItemSelector).delegate(':checkbox', 'change', function () {
                    if ($(this).is(':checked')) {
                        $(this).parents('.grid-item').addClass('checked-grid-item-bar');
                        enableGridButtons();
                    } else {
                        $(this).parents('.grid-item').removeClass('checked-grid-item-bar');
                        if ($(o.gridItemSelector).find(":checked").length === 0) {
                            // Make complete and delete item buttons look disabled
                            disableGridButtons();
                        }
                    }
                });
            }

            function configureButtons() {
                var editButtonSelector = "";
                var globalButtonSelector = "";

                // Create the global buttons
                for (var i in o.globalButtonNames) {
                    globalButtonSelector += ", ." + o.globalButtonNames[i] + "-button";
                    var globalButtonHtml = o.barButtonHtml;
                    var camelName = o.globalButtonNames[i][0] = o.globalButtonNames[i][0].toUpperCase();
                    if (o.globalButtonNames[i].length > 1)
                        camelName += o.globalButtonNames[i].substr(1, o.globalButtonNames[i].length);
                    globalButtonHtml = globalButtonHtml.replace(/##name##/, o.globalButtonNames[i]);
                    globalButtonHtml = globalButtonHtml.replace(/##icon##/, o.globalButtonIcons[i]);
                    globalButtonHtml = globalButtonHtml.replace(/##tip##/, camelName);
                    $t.find('.global-buttons').append(globalButtonHtml);
                }
                globalButtonSelector = globalButtonSelector.replace(",", "");

                // Create the edit buttons
                for (var i in o.editButtonNames) {
                    editButtonSelector += ", ." + o.editButtonNames[i] + "-button";
                    var editButtonHtml = o.barButtonHtml;
                    var camelName = o.editButtonNames[i][0] = o.editButtonNames[i][0].toUpperCase();
                    if (o.editButtonNames[i].length > 1)
                        camelName += o.editButtonNames[i].substr(1, o.editButtonNames[i].length);
                    editButtonHtml = editButtonHtml.replace(/##name##/, o.editButtonNames[i]);
                    editButtonHtml = editButtonHtml.replace(/##icon##/, o.editButtonIcons[i]);;
                    editButtonHtml = editButtonHtml.replace(/##tip##/, camelName);
                    $t.find('.edit-buttons').append(editButtonHtml);
                }
                editButtonSelector = editButtonSelector.replace(",", "");

                $(editButtonSelector).tooltip({ placement: 'bottom' });
                $(globalButtonSelector).tooltip({ placement: 'bottom' });
                $('.filter-button').tooltip({ placement: 'bottom' });
                return editButtonSelector;
            }

            function configureButtonEvents() {
                // Refresh the grid results
                $t.find('.refresh-button').bind('click', function () {
                    if (o.refreshFunction != null)
                        o.refreshFunction();

                    callRefresh();
                });

                // Add an item
                $t.find('.add-button').bind('click', function () {
                    if (o.addFunction != null)
                        o.addFunction();
                });

                // Edit the selected items
                $t.find('.edit-button').bind('click', function () {
                    if (o.editFunction != null)
                        o.editFunction();

                    var selectedItems = $(o.gridItemSelector).find(":checked");
                    removeItems(selectedItems);
                    disableGridButtons();
                });

                // Delete the selected items
                $t.find('.delete-button').bind('click', function () {
                    if (o.deleteFunction != null)
                        o.deleteFunction();

                    clearCheckedItems(' items moved to trash', false);
                    disableGridButtons();
                });

                // Complete the selected item
                $t.find('.archive-button').bind('click', function () {
                    if (o.archiveFunction != null)
                        o.archiveFunction();

                    clearCheckedItems(' items archived', true);
                    disableGridButtons();
                });

                // Complete the selected item
                $t.find('.pin-button').bind('click', function () {
                    if (o.pinFunction != null)
                        o.pinFunction();

                    clearCheckedItems(' items pinned', true);
                    disableGridButtons();
                });

                $t.find('.filter-button').bind('click', function () {
                    var filter = $(this).parent().siblings('#filterText').val();
                    if (filter == o.filter) {
                        return;
                    }
                    if (filter === "") {
                        $(o.gridItemSelector).find('.grid-item').show();
                        return;
                    }
                    o.filter = filter;
                    filterItems(o.filter);
                });
            }

            function configureGridItemClick() {
                // Add click event to the grid item content area for viewing the item
                $(o.gridItemSelector).delegate('.grid-item-content-area', 'click', function () {
                    // Show loading animation
                    $('#view-items-list').empty();

                    $(o.gridItemSelector).find('.selected-grid-item-bar').removeClass('selected-grid-item-bar');
                    $(this).addClass('selected-grid-item-bar');

                    var getDataMethod = '/d/' + o.contentType + '/' + $(this).find('.id-tag').html();
                    var getDataMethodParams = '';
                    if (o.contentType == "dynamic") {
                        getDataMethod = '/m/sp_getContentById';
                        getDataMethodParams = 'id=' + $(this).find('.id-tag').html();
                    }
                    getData(getDataMethod, getDataMethodParams, showDataInViewer, false, '', $(this), "");
                });
            }

            function showDataInViewer(data, target, unused) {
                var view_html = "";

                for (var key in data[0]) {
                    view_html = o.viewTemplate1 + key + o.viewTemplate2 + data[0][key] + o.viewTemplate3;
                    $('#view-items-list').append(view_html);
                }
            }

            function filterItems(term) {
                var results = $(o.gridItemSelector).find('.grid-item:contains(' + term + ')');

                if (results.length === 0) {
                    $(o.gridItemSelector).find('.grid-item').fadeOut();
                    return;
                }
                var excess = $(o.gridItemSelector).find('.grid-item:not(:contains(' + term + '))');

                excess.fadeOut();
                results.show();
            }

            function clearCheckedItems(message, fade) {
                var selectedItems = $(o.gridItemSelector).find(":checked");

                // Prevent the arrow from being prepended if nothing's checked
                if (selectedItems.length === 0) {
                    // Alert the user that nothing's checked with a yellow alert message
                    ShowMessage('N/A', 'No items selected');
                    return false;
                }

                // Alert the user what's been removed
                removeItems(selectedItems, selectedItems.length + message, fade)
            }

            function removeItems(removeList, message, fadeout) {
                if (fadeout === true) {
                    removeList.parents('.grid-item').fadeOut('slow', function () {
                        $(this).remove();
                    });
                }
                else {
                    removeList.parents('.grid-item').remove();
                }
                if (message.length != 0)
                    ShowMessage(message, 'Success');
            }

            function ShowMessage(msg, title, type) {
                if(type === undefined)
                    type = 'success';
                if (msg === '') {
                    $(o.messageSelector).hide();
                } else {
                    $.pnotify({
                        title: title,
                        text: msg,
                        type: type,
                        icon: false
                    });
                }
            }

            function disableGridButtons() {
                o.editButtons.fadeOut();
            }

            function enableGridButtons() {
                if (o.editButtons.is(':visible') != true) {
                    o.editButtons.fadeIn();
                }
            }

            init();
        });
    }
})(jQuery);