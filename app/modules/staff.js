;(function (app, gee, $) {
    'use strict';

    app.staff = {
        current: {},
        detail: {},
        course: {},
        errMsg: {
            'e8001': '尚未登入',
        },

        init: function () {
            $.extend(app.errMsg, app.staff.errMsg);
            app.staff.status();
        },

        status: function () {
            var callback = function () {
                if (this.code !== '1') {
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
            $('.my-nickname').text(app.staff.current.nickname);
            $('.my-avatar').attr('src', app.staff.current.img);
            $('.my-email').text(app.staff.current.email);
        },

        login: function (data, btn) {
            var callback = function () {
                if (this.code !== '1') {
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
                }
            };

            gee.yell('staff/login', data, callback, callback);
        },

        logout: function () {
            var callback = function () {
                if (this.code !== '1') {
                    app.stdErr(this);
                } else {
                    location.href = '/';
                }
            };

            gee.yell('staff/logout', {}, callback, callback, 'GET');
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
        app.staff.logout();
    });

}(app, gee, jQuery));
