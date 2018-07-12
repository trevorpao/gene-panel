;(function (app, gee, $) {
    'use strict';

    // sample query
    // status:Enabled
    // date<>2017-12-01~2017-12-05
    // name!test
    // content~likeme

    // 欄位名:查詢值

    // : 是等於
    // < 是小於
    // > 是大於
    // <> 是介於
    // ! 是不等於
    // ~ 是部份等於


    app.query = {
        tagElem: '<span class="tag {{:cls}} js-query-{{:col}} is-medium"> {{:label}} <button class="delete is-small gee" data-gene="click:delQuery"> </button> </span>',
        cu: {},
        init: function () {
            app.query.box = $('.js-query-list');
            app.query.tagTmpl = $.templates(app.query.tagElem);
        },
        deploy: function () {
            app.arena.destroyPaginate();
            app.arena.resetCurrent(app.arena.pageBox);
            app.arena.nextPage(app.arena.pageBox);
        },
        get: function (module, callback) {
            module = module || app.module.name;

            app.arena.feed.getItem(module + 'Qry', function(err, val){
                if (err) {
                    gee.clog('---------------------- localforage err -------------------------');
                    gee.clog(err);
                    app.track.send('failure', 'load_localforage', JSON.stringify(err));
                }

                if (val) {
                    app.query.cu  = val;
                    app.query.renderAll(callback);
                }
                else {
                    app.query.cu = {};
                    callback.call(this);
                }
            });
        },
        set: function (col, val, module) {
            module = module || app.module.name;
            app.query.cu[col] = val;
            gee.clog(app.query.cu);
            app.arena.feed.setItem(module + 'Qry', app.query.cu).catch( gee.clog );
        },
        del: function (col, module) {
            module = module || app.module.name;
            delete app.query.cu[col];
            gee.clog(app.query.cu);
            app.arena.feed.setItem(module + 'Qry', app.query.cu).catch( gee.clog );
        },
        add: function (str, option, module) {
            let item = app.query._str2Item(str, option);
            app.query.set(item.col, item, module);
            app.query.box.find('.js-query-'+ item.col).remove().end() // remove the same column from the condition
                .append(app.query.tagTmpl.render(item));
            // gee.init(); // TODO: update list
            app.waitFor(0.1).then(function () {
                gee.init();
            });
        },
        renderAll: function (callback) {
            app.query.box.html('');

            for (let idx in app.query.cu) {
                app.query.box.find('.js-query-'+ app.query.cu[idx].col).remove().end()
                    .append(app.query.tagTmpl.render(app.query.cu[idx]));
            }

            app.waitFor(0.1).then(function () {
                gee.init();
                callback.call(this);
            });
        },
        remove: function (tag) {
            let item = app.query._str2Item(tag.text().trim());
            gee.clog(item);
            app.query.del(item.col);
            tag.remove(); // TODO: update list
        },
        removeAll: function () {
            app.query.cu = [];
            app.arena.feed.setItem(app.module.name + 'Qry', app.query.cu).catch( gee.clog );
            app.query.box.html('');
        },
        dealingSearchOption: function(opt, result){
            if( opt.indexOf('出貨') !== -1 ){
                result.col = 'fulfillment_status';
            }else if (opt.indexOf('付款') !== -1 ){
                result.col = 'financial_status';
            }

            result.label = result.col + opt.slice(opt.indexOf(':'), opt.length);
            return result;
        },
        dealWithSearchStr: function(str, result){
            if (str.indexOf('<>') !== -1) {
                result.cls = 'is-info';
                result.type = 'between';
                result.col = str.slice(0, str.indexOf('<>'));
            } else if (str.indexOf('>') !== -1) {
                result.cls = 'is-info';
                result.type = 'gt';
                result.col = str.slice(0, str.indexOf('>'));
            } else if (str.indexOf('<') !== -1) {
                result.cls = 'is-info';
                result.type = 'lt';
                result.col = str.slice(0, str.indexOf('<'));
            } else if (str.indexOf('!') !== -1) {
                result.cls = 'is-danger';
                result.type = 'not';
                result.col = str.slice(0, str.indexOf('!'));
            } else if (str.indexOf('~') !== -1) {
                result.cls = 'is-warning';
                result.type = 'like';
                result.col = str.slice(0, str.indexOf('~'));
            } else if (str.indexOf(':') !== -1) {
                result.type = 'is';
                result.col = str.slice(0, str.indexOf(':'));
            }
            result.label = str;
            return result;
        },
        _str2Item: function (str, option) {
            let result = {
                type: 'normal',
                cls: 'is-primary',
                // label: str,
                col: 'all'
            }
            if( !option ){
                result = app.query.dealWithSearchStr(str, result);
            }
            else {
                if( option.indexOf('Order Id') === -1){
                    result = app.query.dealingSearchOption(option, result);
                }else{
                    result.col = 'ids';
                    result.label = 'ids:' + str;
                }
            }

            // console.log('redy to return result : ', result);
            return result;
            // return {type: type, cls: cls, label: str, col: col};
        }
    };

    gee.hook('initQueryForm', function (me) {
        app.query.init();
    });

    gee.hook('addQuery', function (me) {
        let input = me.closest('.field').find('.input');
        let txt = input.val().trim();
        if (txt) {
            app.query.add(txt);
        }
        input.val('');
        app.query.deploy();
    });

    /**
     * 兩種條件相加的查詢
     */
    gee.hook('combineQuery', function(me){
        let option = me.closest('.level-item').prev('.level-item').find('select[name="query"] option:checked').val().trim();
        let input = me.closest('.field').find('.input');
        let txt = input.val().trim();

        if( option.indexOf('=') !== -1 || txt ){
            app.query.add((option + txt).replace('=', ':'));
            input.val('');
            app.query.deploy();
        }
    });

    // 使用者選擇某種查詢條件是不需要輸入多餘文字時，讓 search 的input text不能輸入
    gee.hook('checkOption', function(me){
        let selectedVal = me.val();
        let textE = me.closest('.level-item').next().find('input[type="text"]');
        if( selectedVal.indexOf('=') === -1 ){
            textE.removeAttr('disabled');
        }
        else {
            textE.attr('disabled','disabled');
            me.closest('.level-item').next('.level-item').find('.button').trigger('click');
        }
    });

    gee.hook('delQuery', function (me) {
        app.query.remove(me.closest('.tag'));
        app.query.deploy();
    });

    gee.hook('loadQuery', function(me) {
        let txt = me.data('query') || 'status:Enabled';
        let ary = txt.split(',');
        app.query.removeAll();
        $.each(ary, function (idx) {
            app.query.add(this);
        });
        app.query.deploy();
    });

    gee.hook('loadModuleQuery', function(me) {
        let txt = me.data('query') || 'status:Enabled';
        let ary = txt.split(',');
        let module = me.data('module') || app.module.name;
        $.each(ary, function (idx) {
            let item = app.query._str2Item(this);
            app.query.set(item.col, item, module);
        });

        gee.exe('loadMain', me);
    });

}(app, gee, jQuery));
