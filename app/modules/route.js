;(function (app, gee, $) {
    'use strict';

    let RoutingObj = function (u, f, t) {
        this.Params = u.split('/').filter(function(h){ return h.length > 0; });
        this.Url = u;
        this.Fn = f;

        this.Title = t;
    };

    app.route = {
        routingList: [],
        //to check status of pages
        currentPage: '',
        mode: 'history',
        base: '',
        changing: 0,
        init: function () {
            let state = {ta: '', path: ((app.route.mode === 'history') ? location.pathname : location.hash)};
            app.route.changing = 1;
            app.route.flash(state);

            window.onpopstate = app.route.onChange;

            if (app.route.mode === 'history') {
                let path = document.location.toString();
                app.arena.urlQuery = gee.parseUrlQuery(path);
            } else {
                let params_tmp = window.location.hash.substring(1);
                let first = params_tmp.indexOf('&');
                let hash = params_tmp.substr(0, first);

                app.arena.urlQuery = gee.parseUrlQuery('/?' + params_tmp.substr(first));
            }
        },

        onChange: function(e) {
            let targetPage = app.route.fixPath(((app.route.mode === 'history') ? location.pathname : location.hash));
            if (targetPage !== app.route.currentPage && app.route.changing !==1) {
                app.route.changing = 1;
                app.route.flash({ta: '', path: targetPage});
            }
        },

        flash: function (state) {
            let urlToParse = app.route.fixPath(state.path);

            if(app.route.currentPage !== urlToParse) {
                app.route.previousPage = app.route.currentPage;
                app.route.currentPage = urlToParse;
                let uParams = urlToParse.split('/').filter(function (h) {
                    return h.length > 0;
                });
                let isRouteFound = 0;
                let routeItem = null;
                let _params = false;
                for (let i = 0; i < app.route.routingList.length; i++) {
                    if (isRouteFound === 0) {
                        routeItem = app.route.routingList[i];
                        if (routeItem.Params.length === uParams.length) {
                            _params = app.route.checkParams(uParams, routeItem.Params);
                            if (_params) {
                                _params.Title = routeItem.Title;
                                isRouteFound += 1;
                                routeItem.Fn.call(null, _params);
                            }
                        }
                    }
                }
            }
        },

        //simple utility function that return 'false' or url params
        //will parse url and fetches param values from 'location.href'
        checkParams: function (urlParams, routeParams) {
            let paramMatchCount = 0, paramObject = {};

            for(let i =0 ; i < urlParams.length ; i++){
                let rtParam = routeParams[i];
                if(rtParam.indexOf(':') >= 0){
                    paramObject[rtParam.split(':')[1]] = urlParams[i];
                    paramMatchCount += 1;
                }
            }

            if(paramMatchCount === urlParams.length){
                return paramObject;
            }

            return false;
        },

        //will add 'url' and 'function' to routing list
        addRoute: function (urlToMatch, fnToExecute, t) {
            if(typeof urlToMatch === 'string'){
                app.route.routingList.push(new RoutingObj(urlToMatch, fnToExecute, t));
            }else if(typeof urlToMatch && urlToMatch instanceof Array){
                urlToMatch.forEach(function (lItem) {
                    app.route.routingList.push(new RoutingObj(lItem, fnToExecute, t));
                });
            }
        },

        loadModule: function (params) {
            let path = '/'+ params.module +'/'+ params.layout;
            let append = '';

            if (typeof app.module.name === 'undefined') {
                app.route.landing = 1;
            }

            app.route.params = null;
            app.module.pid = null;
            app.module.name = params.module;
            app.module.layout = params.layout;

            if (params.id) {
                append = '/'+ params.id;
                app.module.pid = params.id;
            }

            if (!app.route.changing) {
                if (app.route.mode === 'history') {
                    window.history.pushState(params, null, app.route.base + '/'+ params.space + path + ((params.modal)?'/'+params.modal:'') + append);
                }
                else {
                    window.location.hash = '/'+ params.space + path + ((params.modal)?'/'+params.modal:'') + append;
                }
            }

            app.route.changing = 0;

            if (app.space !== params.space) {
                app.route.changing = 1;
                app.route.params = params;
                app.space = params.space;
                gee.loadApp($('.navbar-menu .navbar-item[data-app="'+ params.space +'"]'));
            }
            else {
                if (params.modal) {
                    let ta = null;
                    // app.modal.slienceMode = app.route.previousPage;
                    if (app.route.landing === 1) {
                        app.route.landing = 0;
                        app.loadHtml(path, 'main-box', params.module);

                        $('#submenu-box').find('.item').removeClass('is-active').end()
                            .find('[data-module="'+ params.module +'"]').closest('.item').addClass('is-active');

                        app.waitFor(function () {
                            ta = $('[data-src="'+ params.modal +'"]:eq(0)');
                            return ta.length;
                        }).then(function () {
                            if (params.id) {
                                app.module.pid = params.id;
                            }

                            if (ta.hasClass('engrossed-btn')) {
                                app.body.removeClass('defocused').addClass('engrossed');
                                app.loadHtml('/'+ app.module.name +'/'+ params.modal, 'engrossed-box', params.module, app.module.pid);
                                $('.engrossed-app').animateIt('swoopInRight');
                            }
                            else {
                                app.arena.showModal(ta.attr('title'), '/'+ app.module.name +'/'+ params.modal, (ta.data('size') ? ta.data('size') : 'nor'));

                                // app.modal.show({
                                //     title: ta.attr('title'),
                                //     src: ''+ app.module.name +'/'+ params.modal,
                                //     size: ta.data('size') ? ta.data('size') : 'nor',
                                //     canClose: false,
                                // });
                            }
                        });
                    }
                    else {
                        if (app.body.hasClass('engrossed')) {
                            app.loadHtml('/'+ app.module.name +'/'+ params.modal, 'engrossed-box', params.module, app.module.pid);
                        }
                        else {
                            ta = $('.modal-btn[data-src="'+ params.modal +'"]:eq(0)');

                            app.arena.showModal(ta.attr('title'), '/'+ app.module.name +'/'+ params.modal, (ta.data('size') ? ta.data('size') : 'nor'));

                            // app.modal.show({
                            //     title: ta.attr('title'),
                            //     src: ''+ app.module.name +'/'+ params.modal,
                            //     size: ta.data('size') ? ta.data('size') : 'nor',
                            //     canClose: false,
                            // });
                        }
                    }

                }
                else {
                    app.loadHtml(path, 'main-box', params.module, app.module.pid);
                    let cuModule = $('#submenu-box').find('.item').removeClass('is-active').end()
                        .find('[data-module="'+ params.module +'"][data-layout="'+ params.layout +'"]');
                    let showSidebar = cuModule.data('sidebar') || 0;

                    cuModule.closest('.item').addClass('is-active');

                    if (showSidebar) {
                        app.loadHtml('/'+ params.module +'/sidebar', 'aside-box');
                        $('#aside-box').next('.column').addClass('is-10').end().show();
                    }
                    else {
                        $('#aside-box').next('.column').removeClass('is-10').end().hide();
                    }
                }
            }
        },

        fixPath: function (urlToParse) {
            urlToParse = urlToParse.replace(app.route.base, '');
            if (app.route.mode !== 'history') {
                urlToParse = urlToParse.replace('#', '');
            }

            return urlToParse;
        },

        getPath: function (mode) {
            mode = mode || 'full';
            return '/' + app.space +'/' + app.module.name + '/' + app.module.layout +
                ((mode === 'short') ? '' : '/' + app.module.modal + '/' + app.module.pid);
        }
    };

    app.route.addRoute('/:space/:module/:layout/:modal/:id', app.route.loadModule, '@space@module@layout@modal@id');

    app.route.addRoute('/:space/:module/:layout/:id', app.route.loadModule, '@space@module@layout@id');

    app.route.addRoute('/:space/:module/:layout', app.route.loadModule, '@space@module@layout');

    app.route.addRoute(['/', '/:space/:module'], function (params) {}, '@space@module');

}(app, gee, jQuery));
