(function ($) {
    $.fn.epicGrid = function (options) {
        var defaultOptions =
        {
            'navSelector': $('#nav'),
            'navEntrySelector': 'ul.nav-list li',
            'navHeaderSelector': '.nav-header',
            'navEntryNames': ["data", "view", "method"],
            'viewerTemplate': '<div id="viewer" class="well grid-height"><div id="view-items-list" class=""></div></div>',
            'navEntryTemplate': '<li class="nav-header">##name##</li>',
            'navTemplate': '<ul id="nav" class="well nav nav-list grid-height">##nav-entries##</ul>'
        };
        var o = $.extend(defaultOptions, options);

        return this.each(function () {
            var $t = $(this);

            function initNav(selector, group, header) {
                selector.find(header).click(function () {
                    $(this).next(group).slideToggle();
                });
            }

            function populateNav(data, selector, action) {
                // Show loading animation

                $.each(data, function (i, item) {
                    var entryClass = 'nav-entry';
                    if (item.name.toUpperCase() === objectname.toUpperCase())
                        entryClass += ' active';

                    var item_html = "<li><a class='" + entryClass + "' href='/" + action + "/" + item.name + "'><span>" + item.name + "</span></a></li>";
                    $(item_html).insertAfter(selector);
                });
            }

            function init() {

                var navHtml = o.navTemplate;
                var navEntriesHtml = "";
                for (var i in o.navEntryNames) {
                    var navEntryHtml = o.navEntryTemplate;
                    navEntryHtml = navEntryHtml.replace(/##name##/g, o.navEntryNames[i]);
                    navEntriesHtml += navEntryHtml;
                }
                navHtml = navHtml.replace(/##nav-entries##/g, navEntriesHtml);
                $(o.navSelector).append(navHtml);
            }

            init();
        });
    }
})(jQuery);