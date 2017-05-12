;(function(app, gee, $){
    "use strict";

    // register a module name
    app.arena = {
        cuModal: null,
        menuBox: $("#mainMenu"),
        init: function () {
            app.arena.handler();

            if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                $(window).bind("touchend touchcancel touchleave", function (e) {
                    app.arena.handler();
                });
            } else {
                $(window).scroll(function () {
                    app.arena.handler();
                });
            }

            $('.modal').unbind()
                .on('show.bs.modal', function () {
                    gee.clog('show.bs.modal');
                })
                .on('hidden.bs.modal', function () {
                    gee.clog('hidden.bs.modal');
                    app.arena.cuModal
                        .find('.modal-dialog').removeClass('modal-lg modal-nor modal-sm').end()
                        .find('.modal-title').html('').end()
                        .find('.modal-body').html('');
                    app.arena.cuModal = null;
                });
        },
        handler: function () {
            var currentWindowPosition = $(window).scrollTop();
            gee.clog('currentWindowPosition::'+ currentWindowPosition);

            if (currentWindowPosition > 300) {
                $(".goTop").show();
            } else {
                $(".goTop").hide();
            }
        },
        showModal: function (title, src, size, ta) {
            src = (src) ? src : '';
            var modal = (ta) ? $('#'+ ta) : $('#defaultModal');

            modal
                .find('.modal-dialog').removeClass('modal-lg modal-nor modal-sm').addClass('modal-'+ size).end()
                .find('.modal-title').text(title);

            app.loadHtml(src, modal.find('.modal-body'));

            if (modal !== app.arena.cuModal) {
                app.arena.cuModal = modal;
                modal.modal('show');
            }
        }
    };

    gee.hook('reXPos', function(me) {
        var left = me.data('left')*1;
        var x = me.data('x')*1;
        var w = app.body.width();

        if (w > 1000) {
            left = 0;
        }
        else {
            left = (app.body.width() * x + left);
        }
        left = (app.body.width() * x + left);

        me.css({
            left: left + 'px'
        });

    }, 'init');

    gee.hook('selOpt', function(me){
        var f = me.closest('form');
        var ta = me.data('ta');

        f.find('input[name="'+ ta +'"]').val($(me.event.target).text());
    });

    gee.hook('go2Top', function(me) {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
    });

    // hook some handler
    gee.hook('showModal', function(me){
        if (me.data('src')) {
            var size = me.data('size') ? me.data('size') : 'nor';
            app.arena.showModal(me.data('title'), me.data('src'), size);
        }
    });

}(app, gee, jQuery));
