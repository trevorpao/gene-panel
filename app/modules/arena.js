;(function(app, gee, $) {
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        menuBox: $('#mainNav'),

        init: function() {
            app.arena.adjustAjax();

            app.arena.handlerScroll();

            app.arena.menuBox = (app.screen === 'mobile') ? $('#mobileNav') : app.arena.menuBox;

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind('touchend touchcancel touchleave', function(e) {
                    app.arena.handlerScroll();
                });
            } else {
                $(window).scroll(function() {
                    app.arena.handlerScroll();
                });
            }
        },

        adjustAjax: function(argument) {
            $.ajaxSetup({
                async: false,
                contentType: 'application/x-www-form-urlencoded',
                xhrFields: {
                    withCredentials: true
                }
            });

            $(document).ajaxSend(function (event, jqXHR, ajaxOptions) {
                $('#preloader').addClass('in');
                jqXHR.setRequestHeader('X-Requested-Token', window.csrfToken);
            });

            $(document).ajaxComplete(function (event, jqXHR, ajaxOptions) {
                $('#preloader').removeClass('in');
                if (jqXHR.responseJSON) {
                    gee.clog(jqXHR.responseJSON);
                    window.csrfToken = (jqXHR.responseJSON.csrf) ? jqXHR.responseJSON.csrf : '';
                }
            });
        },

        toTop: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 600);
        },

        handlerScroll: function() {
            var currentWindowPosition = $(window).scrollTop();
            // gee.clog('currentWindowPosition::' + currentWindowPosition);

            if (currentWindowPosition > 300) {
                $('.goTop').show();
            } else {
                $('.goTop').hide();
            }
        },

        showModal: function(title, src, size, ta) {
            src = (src) ? src : '';
            var modal = (ta) ? $('#' + ta) : $('#defaultModal');

            modal
                .find('.modal-content').removeClass('modal-lg modal-nor modal-sm').addClass('modal-' + size).end()
                .find('.modal-title').text(title);

            app.loadHtml(src, modal.find('.modal-content'));

            if (modal !== app.arena.cuModal) {
                app.arena.cuModal = modal;
                modal.addClass('is-active');
            }
        },

        hideModal: function () {
            if (app.arena.cuModal !== null) {
                app.arena.cuModal.removeClass('is-active')
                    .find('.modal-content').removeClass('modal-lg modal-nor modal-sm').html('');
                app.arena.cuModal = null;
            }
        },

        setPaginate: function (total) {
            if (1===2 && !$('#paginate').data('twbsPagination')) {
                $('#paginate').twbsPagination({
                  totalPages: Math.ceil(total/app.pageLimit),
                  visiblePages: 3,
                  initiateStartPageClick: false,
                  paginationClass: 'pagination-list',
                  anchorClass: 'pagination-link',
                  activeClass: 'is-current',
                  onPageClick: function (event, page) {
                    app.arena.pageCounter = page-1;
                    app.arena.nextPage();
                  }
                });
            }
        },

        destroyPaginate: function (total, callback) {
            $('#paginate').empty().removeData('twbs-pagination').off('page');
        },

        resetCurrent: function(box) {
            box = box || $('#main-box');
            let tmpl = box.data('tmpl');
            let tmplName = app.module.name + tmpl;

            app.loadTmpl(tmplName, box);
            app.arena.pageCounter = 0;
            app.arena.pageBox = box;
            box.html('');
        },

        nextPage: function(box) {
            gee.clog('nextPage');
            app.arena.pageCounter++;
            app.arena.loadPage(box || app.arena.pageBox);
        },

        loadPage: function (box) {
            var callback = function () {
                if (this.code !== '1') {
                    app.stdErr(this);
                } else {
                    app.arena.renderBox(box, { 'data': this.data }, 1);
                    app.arena.setPaginate(this.data.length);

                    app.waitFor(function () {
                        return !box.is(':empty');
                    }).then(function () {
                        gee.init();
                    });
                }
            };

            setTimeout(function () {
                switch (app.module.name) {
                    case 'calendar':
                        $('#calendar').fullCalendar('refetchEvents');
                        break;
                    default:
                        // TODO: get other params

                        var data = {
                            page: app.arena.pageCounter
                        };

                        if (app.arena.type) {
                            data = $.extend({}, data, { type: app.arena.type });
                        }

                        gee.yell(app.module.name + '/list_all', data, callback, callback);
                        break;
                }
            }, 10);
        },

        renderBox: function (box, dataList, clearBox, orientation) {
            box = box || $('#main-box');
            let tmpl = box.data('tmpl');
            let tmplName = app.module.name + tmpl;

            orientation = orientation || 'down';
            if (dataList) {
                if (clearBox) {
                    box.html('');
                }

                if (orientation === 'down') {
                    box.append(app.tmplStores[tmplName].render(dataList));
                }
                else {
                    app.arena.toTop();

                    box.prepend(app.tmplStores[tmplName].render(dataList));
                }
            }
        }
    };

    gee.hook('reXPos', function(me) {
        var left = me.data('left') * 1;
        var x = me.data('x') * 1;
        var w = app.body.width();

        if (w > 1000) {
            left = 0;
        } else {
            left = (app.body.width() * x + left);
        }
        left = (app.body.width() * x + left);

        me.css({
            left: left + 'px'
        });

    }, 'init');

    gee.hook('selOpt', function(me) {
        var f = me.closest('form');
        var ta = me.data('ta');

        f.find('input[name="' + ta + '"]').val($(me.event.target).text());
    });

    gee.hook('go2Top', function(me) {
        app.arena.toTop();
    });

    gee.hook('toggleMenu', function(me) {
        if (app.arena.menuBox.hasClass('is-active')) {
            app.arena.menuBox.removeClass('is-active');
        }
        else {
            app.arena.menuBox.addClass('is-active');
        }
    });

    gee.hook('showModal', function(me) {
        if (me.data('src')) {
            var size = me.data('size') ? me.data('size') : 'nor';
            app.arena.showModal(me.data('title'), me.data('src'), size);
        }
    });

    gee.hook('hideModal', function (me) {
        app.arena.hideModal();
    });

    gee.hook('loadMain', function(me) {
        var layout = me.data('layout') || 'list';
        app.module.name = me.data('module') || 'post';

        app.loadHtml(layout, 'main-box');

        me.parent().find('>a').removeClass('active').end().end()
            .addClass('active');
    });

}(app, gee, jQuery));
