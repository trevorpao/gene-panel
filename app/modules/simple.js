;(function(app, gee, $){
    'use strict';

    app.simple = {
        init: function() {},

        loadRow: function(pid, tmpl) {
            let callback = function() {
                app.module.pid = null;
                if (this.code !== '1') {
                    app.stdErr(this);
                } else {
                    app.arena.renderBox($('#'+ tmpl), { item: this.data }, 1);
                    gee.init();
                }
            };

            gee.yell(app.module.name +'/get_one', JSON.stringify({id: pid}), callback, callback);
        },

        set: function (data, btn) {
            let callback = function () {
                app.doneBtn(btn);
                if (this.code !== '1') {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    app.arena.loadPage(app.arena.pageBox);
                }
            };

            gee.yell(app.module.name + '/save', data, callback, callback);
        },

        del: function (data, btn) {
            let callback = function () {
                if (this.code !== '1') {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    btn.closest('tr, .loop-item').remove();
                }
            };

            gee.yell(app.module.name + '/del_row', data, callback, callback);
        },
    };

    gee.hook('loadList', function(me) {
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('cancelForm', function (me) {
        me.closest('form').html('');
    });

    gee.hook('loadRow', function(me) {
        let pid = app.module.pid || me.data('id');
        let tmpl = me.data('tmpl');
        let tmplName = app.module.name + tmpl;

        if (pid) {
            if (me.data('src')) {
                let size = me.data('size') ? me.data('size') : 'nor';
                app.module.pid = pid;
                app.arena.showModal(me.data('title'), me.data('src'), size);
            }
            else {
                app.simple.loadRow(pid, tmpl);
            }
        }
        else {
            let box = $('#'+ tmpl);

            app.arena.renderBox(box, { item: { id: 0 } }, 1);
            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                gee.init();
            });
        }
    });

    gee.hook('initForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = app.module.name + tmpl;

        app.loadTmpl(tmplName, box);

        app.arena.renderBox(box, { item: { id: 0 } }, 1);
    });

    gee.hook('setRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            app.progressingBtn(me);
            app.simple.set(form.serialize(), me);
            gee.hideModal();
        }
    });

    gee.hook('delRow', function (me) {
        if (confirm('確認刪除此記錄')) {
            app.simple.del({ id: me.data('id') }, me);
        }
    });

    gee.hook('reactList', function(me) {
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

    gee.hook('setSelect', function (me) {
        let option = me.data('value');
        me.find('option[value="' + option + '"]').prop('selected', true);
    });

    gee.hook('setRadio', function (me) {
        let option = me.data('value');
        me.find('[value="' + option + '"]').prop('checked', true);
    });

    gee.hook('toggleCheckbox', function (me) {
        gee.clog('toggleCheckbox');
        let state = me.prop('checked');
        let ta = $('input[name="' + me.attr('data-relate') + '"]');
        let func = app.module.name + '/' + ta.attr('func');

        gee.clog('toggleCheckbox+state' + state + ' / func:' + func);
        if (gee.check(func) && ta.length !== 0) {
            ta.each(function () {
                let item = $(this);
                if (item.prop('disabled') === false) {
                    item.prop('checked', state);
                    if (gee.check(func)) {
                        item.event = me.event;
                        gee.exe(func, item);
                    }
                }
            });
        }
    });

}(app, gee, jQuery));
