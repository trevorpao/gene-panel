;(function(app, gee, $) {
    'use strict';

    // register a module name
    app.arena = {
        cuModal: null,
        menuBox: $('#mainNav'),
        urlQuery: {},

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

            $('.modal').unbind()
                .on('show.bs.modal', function (e) {
                    var ta = $(e.target).attr('id');
                    gee.clog('show.bs.modal::' + ta);
                    // app.modal.format(ta);
                })
                .on('hidden.bs.modal', function (e) {
                    var ta = $(e.target).attr('id');
                    gee.clog('hidden.bs.modal::' + ta);
                    // app.modal.stack[ta] = null;
                    // app.modal.format(null);
                    app.arena.cuModal
                        .removeClass('is-active')
                        .find('.modal-content')
                        .removeClass('modal-lg modal-nor modal-sm')
                        .html('');
                    app.arena.cuModal = null;
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



            localforage.ready().then(function() {
                app.arena.feed = localforage.createInstance({
                    name: 'arenaBase',
                    version: 1
                });
                gee.clog('-------------------------- localforage start -----------------------------');
                app.query.init();
            }).catch(function (e) {
                gee.clog(e);
                app.track.send('failure', 'init_localforage', JSON.stringify(e));
            });
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
                app.arena.cuModal
                    .removeClass('is-active')
                    .find('.modal-content')
                    .removeClass('modal-lg modal-nor modal-sm')
                    .html('');
                app.arena.cuModal = null;
            }
            if (app.route) {
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
        },

        setPaginate: function (pageTotal) {
            if (!$('#paginate').data('twbsPagination') && pageTotal > 1) {
                $('#paginate').twbsPagination({
                    totalPages: pageTotal,
                    visiblePages: 3, // pagination-ellipsis
                    initiateStartPageClick: false,
                    paginationClass: 'pagination-list',
                    pageClass: 'pagination-link',
                    activeClass: 'is-current',
                    nextClass: 'pagination-link',
                    prevClass: 'pagination-link',
                    lastClass: 'pagination-link',
                    firstClass: 'pagination-link',
                    disabledClass: 'is-disabled',
                    first: '<span aria-hidden="true"> &laquo; </span>',
                    last: '<span aria-hidden="true"> &raquo; </span>',
                    prev: '<span aria-hidden="true"> &lt; </span>',
                    next: '<span aria-hidden="true"> &gt; </span>',
                    onPageClick: function (event, page) {
                        app.arena.pageCounter = page - 1; // nextPage will +1
                        app.arena.nextPage();
                    }
                });
            }
        },

        destroyPaginate: function () {
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

        prevPage: function(box) {
            gee.clog('prevPage');
            app.arena.pageCounter--;
            app.arena.loadPage(box || app.arena.pageBox);
        },

        loadPage: function (box) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.arena.renderBox(box, { 'data': this.data.subset }, 1);
                    app.arena.setPaginate(this.data.count);

                    app.waitFor(function () {
                        return !box.is(':empty');
                    }).then(function () {
                        app.arena.toTop();
                        gee.init();
                    });
                }
            };

            app.waitFor(0.01).then(function () {
                switch (app.module.name) {
                    case 'calendar':
                        $('#calendar').fullCalendar('refetchEvents');
                        break;
                    case 'menu':
                        app.menu.refresh(box);
                        break;
                    default:

                        let data = {
                            page: app.arena.pageCounter,
                            query: ''
                        };

                        if (app.arena.type) {
                            data = $.extend({}, data, { type: app.arena.type });
                        }

                        // load current module query from LS
                        app.query.get(app.module.name, function () {

                            for (let idx in app.query.cu) {
                                data.query += ','+ app.query.cu[idx].label;
                            }

                            gee.yell(app.module.name + '/list', data, callback, callback);
                        });

                        break;
                }
            });
        },

        renderBox: function (box, dataList, clearBox, orientation) {

            box = box || $('#main-box');
            let tmpl = box.data('tmpl');
            let tmplName = app.module.name + tmpl;

            orientation = orientation || 'down';
            if (dataList) {
                let html = app.tmplStores[tmplName].render(dataList);
                // gee.clog(html);

                if (clearBox) {
                    box.html('');
                }

                if (orientation === 'down') {
                    box.append(html);
                }
                else {
                    app.arena.toTop();

                    box.prepend(html);
                }
            }
        },

        addNotification: function (txt, sec) {
            sec = sec || 0.7;
            app.body.append('<div class="js-notification-show notification is-success gee" data-gene="init:removeMeLater" data-sec="'+ sec +'">'+ txt +'</div>');
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

    gee.hook('fixMainUri', function(me) {
        let uri = me.attr('href');
        me.attr('href', gee.mainUri + uri);
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
        app.module.name = app.module.name || me.data('module') || 'post';
        if (me.data('src')) {
            app.module.modal = me.data('src');
            var size = me.data('size') ? me.data('size') : 'nor';
            var path = app.route.getPath('short') +
                '/' + app.module.modal +
                '/' + (app.module.pid?app.module.pid:0);
            // app.arena.showModal(me.data('title'), me.data('src'), size);
            app.route.flash({ ta: app.module.name, path: path });
        }
    });

    gee.hook('hideModal', function (me) {
        app.arena.hideModal();
    });

    gee.hook('nextPage', function (me) {
        app.arena.nextPage();
    });

    gee.hook('prevPage', function (me) {
        app.arena.prevPage();
    });

    gee.hook('loadMain', function(me) {
        app.module.layout = me.data('layout') || 'list';
        let showSidebar = me.data('sidebar') || 0;
        let displayname = me.data('display') || '';
        app.module.name = me.data('module') || 'post';

        var path = app.route.getPath('short'); // + ((app.module.pid) ? '/' + app.module.pid : '');

        app.route.flash({ ta: app.module.name, path: path });

        // app.loadHtml(layout, 'main-box');

        if (showSidebar) {
            $('#aside-box').next('.column').addClass('is-10').end().show();
        }
        else {
            $('#aside-box').next('.column').removeClass('is-10').end().hide();
        }

        if (displayname === '') {
            $('#submenu-box').find('.item').removeClass('is-active').end()
                .find('[data-module="'+ app.module.name +'"]').closest('.item').addClass('is-active');
        }
        else {
            $('#submenu-box').find('.item').removeClass('is-active').end()
             .find('[data-display="'+ displayname +'"]').closest('.item').addClass('is-active');
        }

    });

    gee.hook('loadApp', function(me) {
        let workspace = me.data('app') || 'cms';
        app.space = workspace;

        app.loadHtml('/app/'+ workspace, 'app-box');

        $('.navbar-menu .navbar-item').removeClass('is-active');
        me.addClass('is-active');
    });

    gee.hook('setDefocused', function(me) {
        $('.engrossed-app').animateIt('driveOutRight', function () {
            $('#engrossed-box').html('');
            app.body.removeClass('engrossed').addClass('defocused');
            if (app.route) {
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
    });

    gee.hook('showQuickview', function(me) {
        $('.'+ app.module.name +'-quickview').addClass('is-active');
    });

    gee.hook('hideQuickview', function(me) {
        me.closest('.quickview').removeClass('is-active');
    });

    gee.hook('initWorkSpace', function(me) {
        app.waitFor(0.3).then(function () {
            if (app.route.params) {
                app.route.loadModule(app.route.params);
            }
            else {
                $('#submenu-box li:eq(0) a').trigger('click');
            }
        });
    });

    gee.hook('removeMeLater', function (me) {
        let sec = me.data('sec') || 5;

        app.waitFor(1.5).then(function () {
            me.animate({
                opacity: 0.05,
                right: '-=80'
            }, sec * 1000, function() {
                $(this).remove();
            });
        });
    });

}(app, gee, jQuery));
