;(function(app, gee, $){
    'use strict';

    app.post = {
        init: function() {},

        loadRow: function(pid, tmpl) {
            let callback = function() {
                app.module.pid = null;
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let row = this.data;
                    app.arena.renderBox($('#'+ tmpl), { item: row }, 1);

                    app.waitFor(0.1).then(function () {
                        gee.init();
                        app.editor.init().load('content', row.content);
                    });
                }
            };

            gee.yell(app.module.name +'/get', JSON.stringify({id: pid}), callback, callback);
        },

        set: function (data, btn) {
            let callback = function () {
                app.waitFor(0.9).then(function () {
                    app.doneBtn(btn);
                });

                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    app.arena.loadPage(app.arena.pageBox);
                    let successTxt = '已儲存成功!';
                    if (data.indexOf('id=0') !== -1) {
                        successTxt = '已新增成功!';
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
    };

    gee.hook('post/loadList', function(me) {
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('post/cancelForm', function (me) {
        me.closest('form').html('');
    });

    gee.hook('post/loadRow', function(me) {
        let pid = app.module.pid || me.data('id');
        let tmpl = me.data('tmpl');
        let tmplName = app.module.name + tmpl;
        let box = $('#'+ tmpl);

        if (pid) {
            if (me.data('src')) {
                let size = me.data('size') ? me.data('size') : 'nor';
                app.module.pid = pid;
                app.module.modal = me.data('src');
                var path = app.route.getPath();
                app.route.flash({ ta: app.module.name, path: path });
                // app.arena.showModal(me.data('title'), me.data('src'), size);
            }
            else {
                app.post.loadRow(pid, tmpl);
            }
        }
        else {
            app.arena.renderBox(box, { item: { id: 0 } }, 1);
            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                gee.init();
                app.editor.init().load('content', '');
            });
        }
    });

    gee.hook('post/initForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = app.module.name + tmpl;

        app.loadTmpl(tmplName, box);

        if (app.module.pid) {
            app.post.loadRow(app.module.pid, tmpl);
        } else {
            app.arena.renderBox(box, { item: { id: 0 } }, 1);

            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                gee.init();
                app.editor.init().load('content', '');
            });
        }
    });

    gee.hook('post/setRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        form.find('[name="content"]').val(app.editor.get('content'));

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            app.progressingBtn(me);
            app.post.set(form.serialize(), me);
            gee.hideModal();
        }
    });

    gee.hook('post/delRow', function (me) {
        if (confirm('確認刪除此記錄')) {
            app.post.del({ id: me.data('id') }, me);
        }
    });

    gee.hook('post/reactList', function(me) {
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

}(app, gee, jQuery));
