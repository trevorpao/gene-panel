;
(function (app, gee, $) {
    'use strict';

    app.press = {
        init: function () {},

        loadRow: function (pid, tmpl) {
            let callback = function () {
                app.module.pid = null;
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let row = this.data;
                    app.arena.renderBox($('#' + tmpl), { item: row }, 1);

                    if (!_.isEmpty(row.history)) {
                        app.press.initHistory(row.history);
                    }

                    app.waitFor(0.1).then(function () {
                        // let priv = app.staff.parsePriv(app.staff.current.priv);
                        // if (priv[1] !== '1') {
                        //     $('.no-kol').addClass('hidden');
                        // }
                        gee.init();

                        $('input[name="tags"]').data('initial-value', row.tags).val(_.map(row.tags, 'id').join());
                        $('input[name="authors"]').data('initial-value', row.authors).val(_.map(row.authors, 'id').join());
                        $('input[name="relateds"]').data('initial-value', row.relateds).val(_.map(row.relateds, 'id').join());
                        app.editor.init(row);

                        // initialize content data for upload module pic preview
                        let dataParams = app.upload.checkDataParam();
                        if (dataParams.length !== 0) {
                            let pics = [];
                            dataParams.forEach((dataParam) => {
                                if (row[dataParam]) {
                                    pics.push({ paramName: dataParam, value: row[dataParam] });
                                }
                            });
                            app.upload.initContent(pics);
                        }
                        app.press.initSicebar(row);
                    });
                }
            };

            gee.yell(app.module.name + '/get', JSON.stringify({ id: pid }), callback, callback);
        },

        set: function (data, btn) {
            let callback = function () {
                app.waitFor(0.9).then(function () {
                    app.doneBtn(btn);
                });

                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let $id = $('[name="id"]');
                    app.stdSuccess(this);
                    app.arena.loadPage(app.arena.pageBox);
                    let successTxt = '已儲存成功!';
                    if ($id.val()*1 === 0) {
                        successTxt = '已新增成功!';
                        $id.val(this.data.id);
                    }
                    app.arena.addNotification(successTxt);
                }
            };

            gee.yell(app.module.name + '/save', data, callback, callback);
        },

        del: function (data, btn) {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    btn.closest('tr, .loop-item').remove();
                }
            };

            gee.yell(app.module.name + '/del', data, callback, callback);
        },

        published: function (data, btn) {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    app.arena.addNotification('已更新發佈設定');
                }
            };

            gee.yell(app.module.name + '/published', data, callback, callback);
        },

        initHistory: function (hs) {
            if (!app.press.historyTmpl) {
                app.press.historyTmpl = $.templates('{{props data}} <li>{{:prop.time}}<br /> {{:prop.info}} <a href="https://stage.how-living.com/history?uri={{:prop.uri}}" target="_blank" class="is-pulled-right"> <span class="icon"><i class="fa fa-share-square-o"></i></span></a> </li>{{/props}}');
            }

            let ary = [];

            _.map(hs, function (str) {
                let tmp = str.split("\n");
                ary.push({
                    time: tmp[0],
                    info: tmp[1],
                    uri: tmp[2]
                });
            });

            ary = _.reverse(ary);

            let lis = app.press.historyTmpl.render({ data: ary });

            $('#history-list').html(lis);
        },

        initSicebar: function (data) {

            var box = $('#pressForm, #courseForm');

            if (data.status == 'Published') {
                box.find('.js-published-f').toggleClass('hidden', true).end()
                    .find('.js-published-t').toggleClass('hidden', false)
                    .find('.js-published-time').html(data.online_date +' '+ data.hh +':'+ data.mm);
            }
        }
    };

    gee.hook('press/loadList', function (me) {
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('press/cancelForm', function (me) {
        me.closest('form').html('');
    });

    gee.hook('press/loadRow', function (me) {
        let pid = app.module.pid || me.data('id');
        let tmpl = me.data('tmpl');
        let tmplName = app.module.name + tmpl;
        let box = $('#' + tmpl);

        if (me.data('src')) {
            app.module.pid = pid;
            app.module.modal = me.data('src');
            let path = app.route.getPath();
            // app.arena.showModal(me.data('title'), me.data('src'), size);
            app.body.removeClass('defocused').addClass('engrossed');
            app.route.flash({ ta: app.module.name, path: path });
            $('.engrossed-app').animateIt('swoopInRight');
        }
    });

    gee.hook('press/initForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = app.module.name + tmpl;

        app.loadTmpl(tmplName, box);

        if (app.module.pid && app.module.pid !== '0') {
            app.press.loadRow(app.module.pid, tmpl);
        } else {
            app.arena.renderBox(box, { item: app.moduleItems[tmplName] }, 1);

            app.waitFor(0.1).then(function () {
                let priv = app.staff.parsePriv(app.staff.current.priv);
                if (priv[1] !== '1') {
                    $('.no-kol').addClass('hidden');
                }
                gee.init();
                app.editor.init();
                $('[name="online_date"]').val(moment().add(1, 'days').format('YYYY-MM-DD'));
            });
        }
    });

    gee.hook('press/setRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        app.editor.passVal(form);

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            let moduleName = app.module.name;
            let formSerializedArray = form.serializeArray();
            formSerializedArray = app.upload.addPics(formSerializedArray, moduleName);

            app.progressingBtn(me);
            app.press.set(formSerializedArray, me);
        }
    });

    gee.hook('press/delRow', function (me) {
        if (confirm('確認刪除此記錄')) {
            app.press.del({ id: me.data('id') }, me);
        }
    });

    gee.hook('press/reactList', function (me) {
        gee.clog(me.event.target);
        var ta = $(me.event.target).closest('[data-func]');
        var func = ta.data('func');

        if (typeof func !== 'undefined') {
            // func = func.replace(me.event.type +':', '');

            if (gee.check(func)) {
                ta.event = me.event;
                gee.exe(func, ta);
                me.event.preventDefault();
            }
        }
    });

    gee.hook('press/offline', function (me) {
        var data = 'id=' + $('[name="id"]').val();
        data += '&status=Offlined&online_date=2000-01-01 00:00'; // reset online_date
        app.press.published(data, me);

        me.closest('.js-published-t').toggleClass('hidden', true)
            .siblings('.js-published-f').toggleClass('hidden', false);
    });

    gee.hook('press/online', function (me) {
        var data = 'id=' + $('[name="id"]').val();
        var status = me.data('force') || $('#status-published').prop('checked');
        var onlineDate = $('[name="online_date"]').val() + ' '+ $('[name="hh"]').val() +':'+ $('[name="mm"]').val();
        var onlineDateTS = moment(onlineDate, 'YYYY-MM-DD HH:mm');
        var now = moment();

        if (status) {
            data += '&status=Published&online_date='+ now.add(-1, 'hours').format('YYYY-MM-DD HH:mm:00'); // one hour ago
        }
        else {
            data += '&status=Scheduled&online_date='+ onlineDate;
        }

        if (status || onlineDateTS.diff(now) > 1800) {
            app.press.published(data, me);

            $('#pressForm').find('.js-published-f').toggleClass('hidden', true).end()
                .find('.js-published-t').toggleClass('hidden', false).end()
                .find('.js-published-time').html(onlineDate);
        }
        else {
            alert('發佈時間請至少設定半小時之後');
        }
    });

    gee.hook('press/reset', function (me) {
        $('#status-published').prop('checked', true);
        $('[name="online_date"]').val(moment().format('YYYY-MM-DD'));
        $('[name="hh"] option:eq(17)').prop('selected', true);
        $('[name="mm"] option:eq(0)').prop('selected', true);
    });

}(app, gee, jQuery));
