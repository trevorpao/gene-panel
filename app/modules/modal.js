;(function (app, gee, $) {
    'use strict';

    app.modal = {
        stack: {},
        slienceMode: 0,
        forceMode: false,
        defaultOpts: {
            title: '',
            src: '',
            ta: '',
            size: 'nor',
            canClose: true,
            cover: 'white',
            header: 'logo',
            message: {
                content: '',
                status: 'success' // success, error, sound
            },
        },
        init: function () {
            // init modal
            $('.modal').unbind()
                .on('show.bs.modal', function (e) {
                    var ta = $(e.target).attr('id');
                    gee.clog('show.bs.modal::' + ta);
                    app.modal.format(ta);
                })
                .on('hidden.bs.modal', function (e) {
                    var ta = $(e.target).attr('id');
                    gee.clog('hidden.bs.modal::' + ta);
                    app.modal.stack[ta] = null;
                    app.modal.format(null);
                    if (app.route && app.modal.slienceMode !== 1) {
                        app.route.changing = 1;
                        // TODO: move this to app.route
                        var path = app.route.getPath('short');
                        if (app.route.mode === 'history') {
                            window.history.pushState({ ta: app.module.name, path: path }, null, app.route.base + path);
                        } else {
                            window.location.hash = path;
                        }
                        app.route.currentPage = path;
                        app.route.changing = 0;
                    }
                });
        },

        show: function (opts) {
            opts = $.extend({}, app.modal.defaultOpts, opts);

            opts.ta = (opts.ta) ? opts.ta : 'defaultModal';
            var modal = $('#' + opts.ta);

            modal.opts = opts;

            modal
                .find('.modal-dialog')
                .removeClass('modal-logo modal-blue modal-light-blue modal-grey modal-white modal-lg modal-nor modal-sm modal-xs')
                .addClass('modal-' + opts.size).end()
                .find('.modal-title').text(opts.title).end()
                .find('.modal-header').show();

            if (opts.header !== '') {
                modal.find('.modal-dialog').addClass('modal-' + opts.header);
            }

            if (opts.title === '') {
                modal.find('.modal-header').hide();
            }

            if (opts.type === "html") {
                modal.find('.modal-body').html(opts.src);
            } else {
                modal.find('.modal-dialog').addClass(opts.src);
                app.loadHtml(opts.src, modal.find('.modal-body'));
            }

            app.modal.stack[opts.ta] = modal;

            modal.modal({ backdrop: false, keyboard: false }); // .modal('show');
        },

        hide: function (ta) {
            if (ta && app.modal.stack[ta]) {
                app.modal.stack[ta].modal('hide');
            } else {
                $.each(app.modal.stack, function (idx, elem) {
                    if (elem) {
                        elem.modal('hide');
                    }
                });
            }
        },

        format: function (ta) {
            var zidx = 1010;
            var modalOrder = ['defaultModal', 'galleryModal', 'messageModal'];
            var canClose = true;
            var cover = '';
            var clsName = '';

            $.each(modalOrder, function (idx, elem) {
                if (app.modal.stack[elem]) {
                    canClose = app.modal.stack[elem].opts.canClose;
                    cover = app.modal.stack[elem].opts.cover;
                }
            });

            if (ta !== null) {
                switch (ta) {
                    case 'galleryModal':
                        zidx = 2010;
                        break;
                    case 'messageModal':
                        zidx = 3010;
                        break;
                }

                if ($('#modalBackdrop').length === 0) {
                    app.body.append('<div id="modalBackdrop" class="modal-backdrop fade in"></div>');
                }

                var modal = $('#' + ta);
                modal.off('click.hideModal');
                if (canClose !== false && app.modal.forceMode === false) {
                    modal.on('click.hideModal', function (e) {
                        if ($(e.target).hasMutilClass('modal&fade&in')) {
                            gee.clog('click.hideModal');
                            app.modal.hide(ta);
                        }
                    });
                }
            } else { // on hidden.bs.modal
                if (gee.isset(app.modal.stack.galleryModal)) {
                    // sometime, we close one modal & leave galleryModal open
                    zidx = 2010;
                }
            }

            if (canClose === false || app.modal.forceMode === true) {
                clsName += ' modal-static ';
            }

            if (cover !== '') {
                clsName += ' modal-' + cover;
            }

            app.body.removeClass('modal-static modal-black modal-white modal-opacity')
                .addClass(clsName);

            if (ta === null && $('.modal.in').length === 0) {
                $('#modalBackdrop').remove();
                app.modal.forceMode = false;
            } else {
                $('#modalBackdrop').css('zIndex', zidx);
            }
        }
    };

    gee.hook('showModal', function (me) {
        if (me.data('src')) {
            app.modal.show({
                title: me.data('title'),
                src: me.data('src'),
                ta: me.data('ta'),
                size: me.data('size') ? me.data('size') : 'nor',
                canClose: me.data('close'),
                cover: me.data('cover'),
                header: me.data('class'),
                message: {
                    content: me.data('msg'),
                    status: me.data('msg-type')
                }
            });
        }
    });

    gee.hook('hideModal', function (me) {
        app.modal.hide();
    });

    gee.hook('initMessage', function (me) {
        var box = me.closest('.modal');
        var msg = app.modal.stack['messageModal'].opts.message.content;
        var status = app.modal.stack['messageModal'].opts.message.status;

        if (msg) {
            me.find('.message').html(msg);
        }

        if (status) {
            me.find('.' + status).removeClass('hide');
        }
    });

}(app, gee, jQuery));
