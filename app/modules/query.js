;(function (app, gee, $) {
    'use strict';

    app.query = {
        tagElem: '<span class="tag {{:cls}} js-query-{{:col}} is-medium"> {{:label}} <button class="delete is-small gee" data-gene="click:delQuery"> </button> </span>',
        cu: {},
        init: function (argument) {
            app.query.box = $('.js-query-list');
            app.query.tagTmpl = $.templates(app.query.tagElem);
            // TODO: load current module query from LS
        },
        get: function (argument) {
            // TODO: callback for loading LS
        },
        add: function (str) {
            let item = app.query._str2Item(str);
            app.query.cu[item.col] = item;
            gee.clog(app.query.cu);
            // TODO: update LS

            app.query.box.find('.js-query-'+ item.col).remove().end() // remove the same column from the condition
                .append(app.query.tagTmpl.render(item));
            gee.init();
        },
        remove: function (tag) {
            let item = app.query._str2Item(tag.text().trim());
            gee.clog(item);
            delete app.query.cu[item.col];
            gee.clog(app.query.cu);
            // TODO: update LS
            tag.remove();
        },
        _str2Item: function (str) {
            let cls = 'is-primary';
            let type = 'normal';
            let col = 'all';

            if (str.indexOf('<>') !== -1) {
                cls = 'is-info';
                type = 'between';
                col = str.slice(0, str.indexOf('<>'));
            } else if (str.indexOf('>') !== -1) {
                cls = 'is-info';
                type = 'gt';
                col = str.slice(0, str.indexOf('>'));
            } else if (str.indexOf('<') !== -1) {
                cls = 'is-info';
                type = 'lt';
                col = str.slice(0, str.indexOf('<'));
            } else if (str.indexOf('!') !== -1) {
                cls = 'is-danger';
                type = 'not';
                col = str.slice(0, str.indexOf('!'));
            } else if (str.indexOf('~') !== -1) {
                cls = 'is-warning';
                type = 'like';
                col = str.slice(0, str.indexOf('~'));
            } else if (str.indexOf(':') !== -1) {
                type = 'is';
                col = str.slice(0, str.indexOf(':'));
            }

            return {type: type, cls: cls, label: str, col: col};
        }
    };

    gee.hook('initQueryForm', function (me) {
        app.query.init();
    });

    gee.hook('addQuery', function (me) {
        let txt = me.closest('.field').find('.input').val().trim();
        if (txt) {
            app.query.add(txt);
        }
    });

    gee.hook('delQuery', function (me) {
        app.query.remove(me.closest('.tag'));
    });

}(app, gee, jQuery));
