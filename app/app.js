/**
 * app
 */

var gee = window.gee || $.fn.gene;
window.gee = gee;

var app = function() {
    'use strict';

    var that = this;

    that.config = {
        detectWidth: 600
    };

    var app = {
        pageCounter: 1,
        pageLimit: 8,

        fontSize: 1.25,

        redo: null,

        tmplStores: {},
        htmlStores: {},
        tmplPath: '/app/tmpls',

        init: function(modules) {

            app.win = $(window);
            app.docu = $(document);
            app.body = (app.win.opera) ? (app.docu.compatMode == 'CSS1Compat' ? $('html') : $('body')) : $('body');

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
                if ( status == 'error' ) {
                    gee.alert({
                        title: 'Alert!',
                        txt: 'Sorry but there was an error: '+ xhr.status + ' ' + xhr.statusText
                    });
                }
                else {
                    app.htmlStores['tmpl-'+ src] = html;
                    box.html(html);
                    if (redirect !== '') {
                        app.redirect({path: newPath, ta: redirect});
                    }
                    gee.init();
                }
            };
            box = (typeof box === 'string') ? $('#'+ box) : box;
            redirect = (redirect) ? redirect : '';

            if (typeof app.htmlStores['tmpl-'+ src] === 'undefined') {
                gee.clog('load: '+ app.tmplPath + newPath +'.html');
                box.load(app.tmplPath + newPath +'.html', success);
            }
            else {
                box.html(app.htmlStores['tmpl-'+ src]);
                if (redirect !== '') {
                    app.redirect({path: newPath, ta: redirect});
                }
                gee.init();
            }
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
                            col.next('.switchery').remove();
                            new Switchery(col[0], col.data());
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
            sum: function(price, qty) { return tmplHelpers.currency(qty*price); },
            loadPic: function(path) { return that.config.baseUrl + path; },
            average: function(sum, divide) { return (divide!='0') ? Math.round(sum*10/divide)/10 : 0; },
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
        }
    };

    return app;
};

window.app = new app();
