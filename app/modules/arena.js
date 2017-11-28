;(function(app, gee, $) {
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        menuBox: $('#mainNav'),

        init: function() {
            app.arena.handler();

            app.arena.menuBox = (app.screen === 'mobile') ? $('#mobileNav') : app.arena.menuBox;

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind('touchend touchcancel touchleave', function(e) {
                    app.arena.handler();
                });
            } else {
                $(window).scroll(function() {
                    app.arena.handler();
                });
            }
        },

        toTop: function() {
            $('html, body').animate({
                scrollTop: 0
            }, 600);
        },

        handler: function() {
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
            app.arena.cuModal.removeClass('is-active')
                .find('.modal-content').removeClass('modal-lg modal-nor modal-sm').html('');
            app.arena.cuModal = null;
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
            box = box || app.arena.pageBox;
            app.arena.pageCounter++;
            setTimeout(function() {
                switch (app.module.name) {
                    case 'calendar':
                        $('#calendar').fullCalendar('refetchEvents');
                        break;
                    default:
                        var callback = function() {
                            if (this.code !== '1') {
                                app.stdErr(this);
                            } else {
                                app.arena.renderBox(box, {'data': this.data.rows}, 1);
                                app.arena.setPaginate(this.data.counter);
                                gee.init();
                            }
                        };

                        gee.yell(app.module.name +'/list_all', JSON.stringify({
                            _token: '6d5ymvtn9nlljcgmg7rsikvs4i',
                            page: app.arena.pageCounter -1
                        }), callback, callback);
                        break;
                }
            }, 10);
        },

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

            gee.yell(app.module.name +'/get_one', JSON.stringify({_token: '6d5ymvtn9nlljcgmg7rsikvs4i', pid: pid}), callback, callback);
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

                    if (app.arena.pageCounter === 1) {
                        app.arena.toTop();
                    }
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
