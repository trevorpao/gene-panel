;
(function(app, gee, $) {
    "use strict";

    // register a module name
    app.arena = {
        cuModal: null,
        menuBox: $("#mainMenu"),

        init: function() {
            app.arena.handler();

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind("touchend touchcancel touchleave", function(e) {
                    app.arena.handler();
                });
            } else {
                $(window).scroll(function() {
                    app.arena.handler();
                });
            }

            $('.modal').unbind()
                .on('show.bs.modal', function() {
                    gee.clog('show.bs.modal');
                })
                .on('hidden.bs.modal', function() {
                    gee.clog('hidden.bs.modal');
                    app.arena.cuModal
                        .find('.modal-dialog').removeClass('modal-lg modal-nor modal-sm').end()
                        .find('.modal-title').html('').end()
                        .find('.modal-body').html('');
                    app.arena.cuModal = null;
                });
        },

        toTop: function() {
            $("html, body").animate({
                scrollTop: 0
            }, 600);
        },

        handler: function() {
            var currentWindowPosition = $(window).scrollTop();
            gee.clog('currentWindowPosition::' + currentWindowPosition);

            if (currentWindowPosition > 300) {
                $(".goTop").show();
            } else {
                $(".goTop").hide();
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

        setPaginate: function (total, callback) {
            $('#paginate').twbsPagination({
              totalPages: Math.ceil(total/app.pageLimit),
              visiblePages: 7,
              onPageClick: function (event, page) {
                app.pageCounter = page;
                callback.call(this);
              }
            });
        },

        destroyPaginate: function (total, callback) {
            $('#paginate').empty().removeData('twbs-pagination').off('page');
        },

        resetCurrent: function(box) {
            box = box || $('#main-box');

            if (typeof app.tmplStores[app.arena.module] === 'undefined') {
                let tmpl = box.html();
                if (box.is('tbody')) { // fix tbody>tr bug
                    tmpl = '{{props data}}'+ tmpl +'{{/props}}';
                }
                app.tmplStores[app.arena.module] = $.templates(tmpl);
            }

            app.arena.pageCounter = 0;
            box.html('');
        },

        nextPage: function(box) {
            gee.clog('nextPage');
            app.arena.pageCounter++;
            setTimeout(function() {
                switch (app.arena.module) {
                    case 'calendar':
                        $('#calendar').fullCalendar('refetchEvents');
                        break;
                    default:
                        var callback = function() {
                            if (this.code !== '1') {
                                app.stdErr(this);
                            } else {
                                app.arena.renderBox(box, {'data': this.data});
                            }
                        };

                        gee.yell(app.arena.module +'/list_all', JSON.stringify({_token: "6d5ymvtn9nlljcgmg7rsikvs4i"}), callback, callback);
                        break;
                }
            }, 10);
        },

        renderBox: function (box, dataList, clearBox, orientation) {
            box = box || $('#main-box');
            orientation = orientation || 'down';
            if (dataList) {

                if (clearBox) {
                    box.html('');
                }

                if (orientation === 'down') {
                    box.append(app.tmplStores[app.arena.module].render(dataList));

                    if (app.pageCounter === 1) {
                        app.arena.toTop();
                    }
                }
                else {
                    app.arena.toTop();

                    box.prepend(app.tmplStores[app.arena.module].render(dataList));
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
        var layout = (me.data('layout') || 'table') + '-layout';
        app.arena.module = me.data('module') || 'post';

        app.loadHtml(layout, 'main-box');

        me.parent().find('>a').removeClass('active').end().end()
            .addClass('active');

    });

    gee.hook('loadList', function(me) {
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

}(app, gee, jQuery));
