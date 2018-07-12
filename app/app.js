/**
 * app
 */

var gee = window.gee || $.fn.gene;
window.gee = gee;

var App = function() {
    'use strict';

    var that = this;

    that.config = {
        detectWidth: 600
    };

    var app = {
        pageCounter: 0,
        pageLimit: 10,

        fontSize: 1.25,

        redo: null,

        module: {},

        tmplStores: {},
        htmlStores: {},
        moduleItems: {},
        tmplPath: './app/tmpls',

        errMsg: {
            'e9100': '資料庫發生錯誤',
            'e9101': '資料庫發生錯誤',
            'e9102': '資料庫發生錯誤',
            'e9103': '資料庫發生錯誤',
            'e8100': '請輸入必填欄位'
        },

        init: function(modules) {

            app.win = $(window);
            app.docu = $(document);
            app.body = (app.win.opera) ? (app.docu.compatMode === 'CSS1Compat' ? $('html') : $('body')) : $('body');

            app.screen = (app.body.width() < that.config.detectWidth) ? 'mobile' : 'tablet';
            app.body.addClass(app.screen);

            gee.apiUri = window.apiUrl +'';
            gee.mainUri = window.mainUrl;
            gee.picUri = gee.mainUri.slice(0, -1);

            app.editor.option.imageUploadURL = gee.apiUri + app.editor.option.imageUploadURL;
            app.editor.option.pastedImagesUploadURL = gee.apiUri + app.editor.option.pastedImagesUploadURL;

            app.editor.inlineOption.imageUploadURL = gee.apiUri + app.editor.inlineOption.imageUploadURL;
            app.editor.inlineOption.pastedImagesUploadURL = gee.apiUri + app.editor.inlineOption.pastedImagesUploadURL;

            gee.init();

            if (modules && modules.length > 0) {
                modules.map(function (module) {
                    if (gee.isset(app[module]) && gee.isset(app[module].init)) {
                        app[module].init();
                    }
                });
            }
        },

        loadHtml: function (src, box, redirect) {
            var newPath = src;
            var success = function (html, status, xhr) {
                if (status === 'error') {
                    gee.alert({
                        title: 'Alert!',
                        txt: 'Sorry but there was an error: ' + xhr.status + ' ' + xhr.statusText
                    });
                } else {
                    app.htmlStores[app.module.name + '-tmpl-' + src] = html;
                    box.html(html);
                    if (redirect !== '') {
                        app.redirect({ path: newPath, ta: redirect });
                    }
                    gee.init();
                }
            };
            box = (typeof box === 'string') ? $('#' + box) : box;
            redirect = (redirect) ? redirect : '';

            if (typeof app.htmlStores[app.module.name + '-tmpl-' + src] === 'undefined') {
                gee.clog('load: ' + app.tmplPath + newPath + '.html');
                box.load(app.tmplPath + newPath + '.html', success);
            } else {
                box.html(app.htmlStores[app.module.name + '-tmpl-' + src]);
                if (redirect !== '') {
                    app.redirect({ path: newPath, ta: redirect });
                }
                gee.init();
            }
        },

        loadTmpl: function (tmplName, box) {
            if (typeof app.tmplStores[tmplName] === 'undefined') {
                var htmlCode = box.html() || '';

                if (box.is('tbody')) { // fix tbody>tr bug
                    htmlCode = '{{props data}}'+ htmlCode +'{{/props}}';
                }

                if (box.is('form')) {
                    app.moduleItems[tmplName] = app.initForm(box);
                    htmlCode = box.html(); // get new htmlcode
                }

                htmlCode = htmlCode.replace(/pre-gee/g, 'gee')
                    .replace(/pre-src/g, 'src'); // img src

                app.tmplStores[tmplName] = $.templates(htmlCode);
            }

            // box.html('');
        },

        initForm: function (box) {
            var item = {};

            box.find(':input:not(:button)').each(function () {
                var me = $(this);
                var name = me.attr('name');
                var gene = me.data('gene');
                var boolGee = me.hasClass('gee');

                if (name && name.match(/\[/g)) {
                    name = name.replace(/\[/g, '.').replace(/]/g, '');
                }

                item[name] = (name !== 'id') ? '' : 0;

                if (me.is(':radio')) {
                    me.closest('.field').toggleClass('pre-gee', !boolGee).attr('data-gene', 'init:setRadio')
                        .attr('data-value', '{{:item.' + name + '}}');
                } else if (me.is(':checkbox')) {
                    name = name.replace('.', '');
                    me.closest('.field').toggleClass('pre-gee', !boolGee)
                        .attr('data-gene', 'init:setRadio')
                        .attr('data-type', 'checkbox')
                        .attr('data-value', '{{:item.' + name + '}}');
                } else if (me.is('[type="datetime-local"]')) {
                    me.attr('value', '{{:~formatDate(item.' + name + ', \'YYYY-MM-DDTHH:mm:00\')}}');
                } else if (me.is('textarea')) {
                    me.html('{{:item.' + name + '}}');
                } else if (me.is('select')) {
                    var value = 'init:setSelect';

                    if (gene !== 'undefined' && typeof gene !== 'undefined') {
                        value = 'init:setSelect,' + gene;
                    }

                    me.toggleClass('pre-gee', !boolGee).attr('data-gene', value)
                        .attr('data-value', '{{:item.' + name + '}}');

                    // TODO: render select options
                } else if (me.hasClass('multipleSelect')) {
                    me.attr('value', '');
                } else {
                    me.attr('value', '{{:item.' + name + '}}');
                }
            });

            // gee.clog('------------------------ initForm');
            // gee.clog(item);

            return item;
        },

        setForm: function (ta, row) {
            ta.find(':input:not(:button)').each(function () {
                var col = $(this);
                var idx = col.attr('name');
                if (row.hasOwnProperty(idx)) {
                    var val = row[idx];
                    if (col.is(':checkbox')) {
                        if (col.attr('value') === val) {
                            col.prop('checked', true);
                        }
                    } else {
                        col.val(val);
                    }
                }
            });
        },

        redirect: function (state) {
            if (!app.route) {
                if (IS_DEV) {
                    window.location.hash = state.ta;
                } else {
                    window.history.pushState(state, '', state.path);
                }
            }
        },

        defaultPic: function () {
            var img = event.srcElement;
            $(img).attr('src', 'default.svg');
            img.onerror = null;
        },

        /**
         * a object of promise
         * @param  condition function OR sec return bool
         * @param  int limit max test times
         * @return promise
         */
        waitFor: function (condition, limit) {
            var dfr = $.Deferred();
            var times = 0;
            var during = 70;
            limit = limit || 9; // Longest duration :  during * (limit+1)

            if (Number(condition) === condition) {
                setTimeout(function () {
                    dfr.resolve();
                }, condition * 1000);
            }
            else {
                var timer = setInterval(function () {
                    times++;
                    if (condition()) {
                        clearInterval(timer);
                        dfr.resolve();
                    }

                    if (times > limit) {
                        clearInterval(timer);
                        dfr.reject();
                    }
                }, during);

            }

            return dfr.promise();
        },

        stdErr: function(e, redo) {
            e.data = e.data || {};

            if (gee.isset(e.data) && gee.isset(e.data.msg)) {
                gee.alert({
                    title: 'Alert!',
                    txt: e.data.msg
                });
            } else {
                var code = 'e' + e.code;
                if (gee.isset(app.errMsg[code])) {
                    gee.alert({
                        title: 'Alert!',
                        txt: app.errMsg[code]
                    });
                } else {
                    gee.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(' + e.code + ')'
                    });
                }

                if (e.code === '8001') {
                    app.body.removeClass('login').addClass('logout');
                }
            }
        },

        stdSuccess: function(rtn) {
            rtn.data = rtn.data || {};

            if (gee.isset(rtn.data.msg)) {
                gee.alert({title: 'Alert!', txt: rtn.data.msg });
            }

            if (gee.isset(rtn.data.redirect)) {
                location.href = (rtn.data.redirect === '') ? gee.apiUri : rtn.data.redirect;
            }

            if (gee.isset(rtn.data.goback)) {
                history.go(-1);
            }
        },

        showErrMsg: function(col, cond, msg) {
            var box = col.closest('.form-group');
            box.removeClass('has-error has-success has-feedback');

            if (cond) {
                box.addClass('has-error').find('.error-msg').text(msg);
                col.one('keyup', app.clearMsg);
            }
            else {
                box.addClass('has-success has-feedback');
            }
        },

        clearMsg: function () {
            $(this).closest('.form-group').removeClass('has-error has-success has-feedback');
        },

        cleanArray: function (actual) {
          var newArray = [];
          for (var i = 0; i < actual.length; i++) {
                if (actual[i]) {
                    newArray.push(actual[i]);
                }
          }
          return newArray;
        },

        formatHelper: {
            currency: function (num, prefix) {
                var str = $.fn.formatNum((num + ''), 0, '.', ',', 1);
                var cls = 'dollar';
                if (num < 0) {
                    cls += ' minus';
                }
                if (typeof prefix !== 'undefined') {
                    cls += ' currency';
                }
                return '<span class="' + cls + '"></span>' + str + '';
            },
            sum: function (price, qty) { return app.tmplHelpers.currency(qty * price); },
            loadPic: function (path) { return gee.picUri + path; },
            average: function (sum, divide) { return (divide * 1 !== 0) ? Math.round(sum * 10000 / divide) / 100 : 0; },
            beforeDate: function (ts, target) {
                var cu = moment(ts);
                app[target].max_ts = moment.max(app[target].max_ts, cu);
                app[target].min_ts = moment.min(app[target].min_ts, cu);
                return $.timeago(ts);
            },
            showDate: function (status, flow, schedule, createDate, publishDate) {
                var ts = publishDate || createDate;

                return status + ' 於 ' + moment(ts).format('MM/DD HH:mm');
            },
            iso8601: function (ts) {
                return moment(ts).toISOString();
            },
            getYear: function (ts) {
                return moment(ts).format('YYYY');
            },
            getMon: function (ts) {
                return moment(ts).format('MMMM');
            },
            getWeek: function (ts) {
                return moment(ts).format('ddd');
            },
            getDay: function (ts) {
                return moment(ts).format('DD');
            },
            getTime: function (ts) {
                return moment(ts).format('HH:mm');
            },
            formatDate: function (str, format) {
                str = (str) ? moment(str, 'YYYY-MM-DD HH:mm:ss') : moment();

                if (str.isValid()) {
                    return str.format(format);
                } else {
                    return moment().format(format);
                }
            },
            genderedHonorific: function (gender) {
                return (gender === 'f') ? '女士' : '先生';
            },
            linkAPI: function (str) {
                return that.config.uri + str;
            },
            nl2br: function (str) {
                var breakTag = '<br />';
                return (str + '')
                    .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
            }
        },

        extractAttr: function (obj) {
            var attr = {};
            obj.each(function () {
                $.each(this.attributes, function () {
                    attr[this.name] = this.value;
                });
            });
            return attr;
        },

        progressingBtn: function (btn) {
            btn.attr('disabled', 'disabled').addClass('is-loading'); // .append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
        },

        doneBtn: function (btn) {
            btn.prop('disabled', false).removeClass('is-loading'); // .find('.fa-spinner').remove();
        },

        baseConverter: function (nbasefrom, basefrom, baseto) {
            var SYMBOLS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (basefrom <= 0 || basefrom > SYMBOLS.length || baseto <= 0 || baseto > SYMBOLS.length) {

                return null;
            }
            var i, nbaseten = 0;
            if (basefrom !== 10) {
                var sizenbasefrom = nbasefrom.length;
                for (i = 0; i < sizenbasefrom; i++) {
                    var mul, mul_ok = -1;
                    for (mul = 0; mul < SYMBOLS.length; mul++) {
                        if (nbasefrom[i] === SYMBOLS[mul]) {
                            mul_ok = 1;
                            break;
                        }
                    }
                    if (mul >= basefrom) {

                        return null;
                    }
                    if (mul_ok === -1) {
                        return null;
                    }
                    var exp = (sizenbasefrom - i - 1);
                    if (exp === 0) {
                        nbaseten += mul;
                    }
                    else {
                        nbaseten += mul * Math.pow(basefrom, exp);
                    }
                }
            } else {
                nbaseten = parseInt(nbasefrom);
            }

            if (baseto !== 10) {
                var nbaseto = [];
                while (nbaseten > 0) {
                    var mod = nbaseten % baseto;
                    if (mod < 0 || mod >= SYMBOLS.length) {

                        return null;
                    }
                    nbaseto.push(SYMBOLS[mod]);
                    nbaseten = parseInt(nbaseten / baseto);
                }
                return nbaseto.reverse().toString().replace(/,/g, '');
            } else {
                return nbaseten.toString();
            }
            return '0';
        },

        padLeft: function(str, lenght){
            if(str.length >= lenght) {
                return str;
            }
            else {
                return app.padLeft('0'+ str, lenght);
            }
        }
    };

    return app;
};

window.app = new App();
