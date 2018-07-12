;(function (app, gee, $) {
    'use strict';

    app.staff = {
        current: {},
        detail: {},
        course: {},
        errMsg: {
            'e8001': '尚未登入',
            'e8009': '權限不足',
        },

        init: function () {
            $.extend(app.errMsg, app.staff.errMsg);
            app.staff.status();
        },

        status: function () {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    this.data = this.data || {};
                    if (this.data.isLogin) {
                        gee.clog('Logined');
                        app.body.removeClass('logout').addClass('login');

                        if (gee.isset(this.data.user)) {
                            app.staff.current = this.data.user;
                            app.staff.setHtml();
                        }
                    } else {
                        gee.clog('Did not login');
                        app.body.removeClass('login').addClass('logout');
                    }

                    app.staff.current.isLogin = this.data.isLogin;
                }
            };

            gee.yell('staff/status', {}, callback, callback);
        },

        setHtml: function () {
            $('.js-staff-name').text(app.staff.current.name);
            $('.js-staff-avatar').attr('src', app.staff.current.avatar);
            $('.js-staff-email').text(app.staff.current.email);

            // let priv = app.staff.parsePriv(app.staff.current.priv);

            // if (priv[0] === '1') {
            //     $('#navMenu .is-tab[data-app="cms"]').removeClass('hidden');
            // }
            // if (priv[7] === '1') {
            //     $('#navMenu .is-tab[data-app="club"]').removeClass('hidden');
            // }
            // if (priv[3] === '1') {
            //     $('#navMenu .is-tab[data-app="market"]').removeClass('hidden');
            // }
            // if (priv[2] === '1') {
            //     $('#navMenu .is-tab[data-app="store"]').removeClass('hidden');
            // }
            // if (priv[5] === '1' || priv[6] === '1') {
            //     $('#navMenu .is-tab[data-app="site"]').removeClass('hidden');
            // }
        },

        login: function (data, btn) {
            var callback = function () {
                if (this.code !== 1) {
                    switch (this.code) {
                        case 7100:
                        case 8202:
                            app.showErrMsg(
                                btn.closest('form').find('input[name="account"]'),
                                true,
                                app.errMsg['e' + this.code]
                            );
                            break;
                        case 7104:
                            app.showErrMsg(
                                btn.closest('form').find('input[name="pwd"]'),
                                true,
                                app.errMsg['e' + this.code]
                            );
                            break;
                        default:
                            app.stdErr(this);
                            break;
                    }
                } else {
                    app.stdSuccess(this);

                    app.staff.status();

                    app.arena.loadPage(app.arena.pageBox);
                }
            };

            gee.yell('staff/login', data, callback, callback);
        },

        logout: function () {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.body.removeClass('login').addClass('logout');
                }
            };

            gee.yell('staff/logout', {}, callback, callback, 'GET');
        },

        setMine: function (data, btn) {
            let callback = function () {
                app.waitFor(0.9).then(function () {
                    app.doneBtn(btn);
                });

                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    let successTxt = '已儲存成功!';
                    app.arena.addNotification(successTxt);
                }
            };

            gee.yell('staff/saveMine', data, callback, callback);
        },

        loadMine: function (tmpl) {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let row = this.data.user;
                    let tmplName = 'staff' + tmpl;
                    let html = app.tmplStores[tmplName].render({ item: row });
                    $('#' + tmpl).html(html);

                    app.waitFor(0.1).then(function () {
                        gee.init();
                    });
                }
            };

            gee.yell('staff/status', {}, callback, callback);
        },

        parsePriv: function (priv) {
            priv = app.baseConverter(priv, 10, 2);
            return app.padLeft(priv, 8).split('').reverse();
        }
    };

    gee.hook('staff/login', function (me) {
        var keycode = 0;
        if (me.event.type === 'keyup') {
            keycode = (me.event.keyCode ? me.event.keyCode : me.event.which) + '';
        }
        else {
            keycode = '13';
        }

        if (keycode === '13') {
            var f = me.data('ta') ? $('#' + me.data('ta')) : me.closest('form');
            app.staff.login(f.serialize(), me);
        }
    });

    gee.hook('staff/logout', function (me) {
        if (confirm('確認登出後台?')) {
            app.staff.logout();
        }
    });

    gee.hook('staff/loadMine', function (me) {
        let size = me.data('size') ? me.data('size') : 'nor';
        app.arena.showModal('編輯個人資料', me.data('src'), size);
    });

    gee.hook('staff.initForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = 'staff' + tmpl;

        app.loadTmpl(tmplName, box);

        app.staff.loadMine(tmpl);
    });

    gee.hook('staff.setMine', function (me) {
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
            app.staff.setMine(form.serialize(), me);
            gee.hideModal();
        }
    });

}(app, gee, jQuery));
