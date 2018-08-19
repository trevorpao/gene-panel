;((app, gee, $) => {
    'use strict';

    app.menu = {
        box: null,

        opts: {
            connectWith: 'ul.sortable',
            placeholder: 'placeholder',
            cursor: 'move',
            handle: '.js-sortable-handle',
            items: '.sortable-block',
            cursorAt: { left: 5 },
            helper: function(event, ui) {
                return $('<div></div>').html($(this).find('.menu-name').html());
            },
            start: function (event, ui) {
                app.menu.box.addClass('js-sortable-ing');
            },
            stop: function( event, ui ) {
                app.menu.box.removeClass('js-sortable-ing');
                app.menu.resort(ui.item);
            }
        },

        init: function () {
            app.menu.box = $('#menu-tree-container');
        },

        refresh: function () {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.menu.box.html($('#menuList').render({rows: this.data.subset}));

                    $('ul.sortable').sortable(app.menu.opts).disableSelection();
                }
            };

            gee.yell(app.module.name +'/list', {}, callback, callback);
        },

        resort: function (item) {
            let itemID = item.data('id');
            let parentID = item.closest('.sortable').data('parent');
            let sort = [];
            item.closest('.sortable').find('>.sortable-block').each(function (idx) {
                sort.push({id: $(this).data('id'), sorter: idx});
            });

            gee.yell(app.module.name +'/update_sorter', JSON.stringify({itemID: itemID, parentID: parentID, sort: sort}), app.stdCallback, app.stdCallback);
        }
    };

    gee.hook('menu.initial', (me) => {
        app.menu.box =  me;
        app.menu.refresh();
    });

})(app, gee, jQuery);
