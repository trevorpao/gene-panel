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
        pageCounter: 1,
        pageLimit: 10,

        fontSize: 1.25,

        redo: null,

        module: {},

        tmplStores: {},
        htmlStores: {},
        tmplPath: './app/tmpls',

        init: function(modules) {

            app.win = $(window);
            app.docu = $(document);
            app.body = (app.win.opera) ? (app.docu.compatMode === 'CSS1Compat' ? $('html') : $('body')) : $('body');

            app.screen = (app.body.width() < that.config.detectWidth) ? 'mobile' : 'tablet';
            app.body.addClass(app.screen);

            gee.apiUri = window.apiUrl +'';
            gee.mainUri = window.mainUrl;

            gee.init();

            if (modules && modules.length > 0) {
                modules.map(function (module) {
                    if (gee.isset(app[module]) && gee.isset(app[module].init)) {
                        app[module].init();
                    }
                });
            }
        },

        loadHtml: function(src, box, redirect) {
            var newPath = '/'+ src;
            var success = function(html, status, xhr) {
                if ( status === 'error' ) {
                    gee.alert({
                        title: 'Alert!',
                        txt: 'Sorry but there was an error: '+ xhr.status + ' ' + xhr.statusText
                    });
                }
                else {
                    app.htmlStores[app.module.name +'-tmpl-'+ src] = html;
                    box.html(html);
                    if (redirect !== '') {
                        app.redirect({path: newPath, ta: redirect});
                    }
                    gee.init();
                }
            };
            box = (typeof box === 'string') ? $('#'+ box) : box;
            redirect = (redirect) ? redirect : '';

            if (typeof app.htmlStores[app.module.name +'-tmpl-'+ src] === 'undefined') {
                gee.clog('load: '+ app.tmplPath +'/'+ app.module.name + newPath +'.html');
                box.load(app.tmplPath +'/'+ app.module.name + newPath +'.html', success);
            }
            else {
                box.html(app.htmlStores[app.module.name +'-tmpl-'+ src]);
                if (redirect !== '') {
                    app.redirect({path: newPath, ta: redirect});
                }
                gee.init();
            }
        },

        loadTmpl: function (tmplName, box) {
            var item = {};
            if (typeof app.tmplStores[tmplName] === 'undefined') {
                var htmlCode = box.html() || '';
                if (box.is('tbody')) { // fix tbody>tr bug
                    htmlCode = '{{props data}}'+ htmlCode +'{{/props}}';
                }
                if (box.is('form')) {
                    item = app.initForm(box);
                    htmlCode = box.html();
                }
                app.tmplStores[tmplName] = $.templates(htmlCode);
            }

            // box.html('');
            return item;
        },

        initForm: function(box) {
            var item = {};
            box.find(':input:not(:button)').each(function() {
                let me = $(this);
                let name = me.attr('name');
                item[name] = '';
                if (me.is(':radio, :checkbox')) {
                    gee.clog(name);
                }
                else if (me.is('textarea')) {
                    me.text('{{:item.'+ name +'}}');
                }
                else {
                    me.attr('value', '{{:item.'+ name +'}}');
                }
            });

            return item;
        },

        setForm: function (ta, row) {
            ta.find(':input:not(:button)').each(function() {
                var col = $(this);
                var idx = col.attr('name');
                if (row.hasOwnProperty(idx)) {
                    var val = row[idx];
                    if (col.is(':checkbox')) {
                        if (col.attr('value') === val) {
                            col.prop('checked', true);
                        }
                    }
                    else {
                        col.val(val);
                    }
                }
            });
        },

        redirect: function(state){
            window.history.pushState(state, '', state.path);
        },

        defaultPic: function() {
            var img = event.srcElement;
            $(img).attr('src', 'default.svg');
            img.onerror = null;
        },

        stdErr: function(e, redo) {
            if (e.code === '100') {
                app.redo = redo || null;
                app.body.removeClass('login').addClass('logout');

                gee.alert({
                    title: 'Alert!',
                    txt: '請重新登入'
                });
            }
            else {
                if (gee.isset(e.data.msg)) {
                    gee.alert({
                        title: 'Alert!',
                        txt: e.data.msg
                    });
                } else {
                    gee.alert({
                        title: 'Error!',
                        txt: 'Server Error, Plaese Try Later(' + e.code + ')'
                    });
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
            currency: function(val) { return '$' + ($.fn.formatMoney((val+''), 0)); },
            sum: function(price, qty) { return app.tmplHelpers.currency(qty*price); },
            loadPic: function(path) { return that.config.baseUrl + path; },
            average: function(sum, divide) { return (divide*1!=='0') ? Math.round(sum*10/divide)/10 : 0; },
            beforeDate: function(ts, target) {
                var cu = moment(ts);
                app[target].max_ts = moment.max(app[target].max_ts, cu);
                app[target].min_ts = moment.min(app[target].min_ts, cu);
                return $.timeago(ts);
            },
            showDate: function(status, flow, schedule, createDate, publishDate) {
                var ts = publishDate || createDate;

                return status +' 於 ' + moment(ts).format('MM/DD HH:mm');
            },
            iso8601: function(ts) {
                return moment(ts).toISOString();
            },
            getYear: function(ts) {
                return moment(ts).format('YYYY');
            },
            getMon: function(ts) {
                return moment(ts).format('MMMM');
            },
            getWeek: function(ts) {
                return moment(ts).format('ddd');
            },
            getDay: function(ts) {
                return moment(ts).format('DD');
            },
            getTime: function(ts) {
                return moment(ts).format('HH:mm');
            },
            genderedHonorific: function(gender) {
                return (gender === 'f') ? '女士' : '先生';
            },
            linkAPI: function(str) {
                return that.config.uri + str;
            },
            nl2br: function(str) {
                var breakTag = '<br />';
                return (str + '')
                    .replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
            }
        },

        extractAttr: function(obj) {
            var attr = {};
            obj.each(function() {
                $.each(this.attributes, function() {
                    attr[this.name] = this.value;
                });
            });
            return attr;
        },

        progressingBtn: function(me) {
            me.attr('disabled', 'disabled').append('<i class="fa fa-spinner fa-pulse fa-fw"></i>');
        }
    };

    return app;
};

window.app = new App();
