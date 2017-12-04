;(function (app, gee, $) {
    'use strict';

    var RoutingObj = function (u, f, t) {
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
        base: '/backend',
        init: function () {
            var state = {ta: '', path: ((app.route.mode === 'history') ? location.pathname : location.hash)};
            app.route.flash(state);

            window.onpopstate = app.route.onChange;

            if (app.route.mode === 'history') {
                var path = document.location.toString();
                app.backend.urlQuery = gee.parseUrlQuery(path);
            } else {
                var params_tmp = window.location.hash.substring(1);
                var first = params_tmp.indexOf('&');
                var hash = params_tmp.substr(0, first);

                app.backend.urlQuery = gee.parseUrlQuery('/?' + params_tmp.substr(first));
            }
        },

        onChange: function(e) {
            var targetPage = app.route.fixPath(((app.route.mode === 'history') ? location.pathname : location.hash));
            gee.clog('---------- route onChange ------------');
            if (targetPage !== app.route.currentPage && app.route.changing !==1) {
                app.route.changing = 1;
                app.route.flash({ta: '', path: targetPage});
            }
        },

        flash: function (state) {
            var urlToParse = app.route.fixPath(state.path);

            if(app.route.currentPage !== urlToParse) {
                app.route.previousPage = app.route.currentPage;
                app.route.currentPage = urlToParse;
                var uParams = urlToParse.split('/').filter(function (h) {
                    return h.length > 0;
                });
                var isRouteFound = 0;
                var routeItem = null;
                var _params = false;
                for (var i = 0; i < app.route.routingList.length; i++) {
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
            var paramMatchCount = 0, paramObject = {};

            for(var i =0 ; i < urlParams.length ; i++){
                var rtParam = routeParams[i];
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
            var path = '/'+ params.module +'/'+ params.layout;
            var append = '';
            var landing = 0;
            if (typeof app.module.name === 'undefined') {
                landing = 1;
            }
            app.module.pid = null;
            app.module.name = params.module;
            app.module.layout = params.layout;

            gee.clog('---------- route loadModule ------------');
            if (params.id) {
                append = '/'+ params.id;
                app.module.pid = params.id;
            }

            if (!app.route.changing) {
                if (app.route.mode === 'history') {
                    window.history.pushState(params, null, app.route.base + path + ((params.modal)?'/'+params.modal:'') + append);
                }
                else {
                    window.location.hash = path + ((params.modal)?'/'+params.modal:'') + append;
                }
            }

            app.route.changing = 0;

            gee.clog('---------- '+ app.module.pid +' ------');

            if (params.modal) {
                var ta = null;
                app.modal.slienceMode = app.route.previousPage;
                if (landing === 1) {
                    app.loadHtml('backend'+ path, 'main-box', params.module);

                    app.waitFor(function () {
                        ta = $('.btn[data-src="'+ params.modal +'"]:eq(0)');
                        return ta.length;
                    }).then(function () {
                        if (params.id) {
                            app.module.pid = params.id;
                        }

                        app.modal.show({
                            title: ta.attr('title'),
                            src: 'backend/'+ app.module.name +'/'+ params.modal,
                            size: ta.data('size') ? ta.data('size') : 'nor',
                            canClose: false,
                        });
                    });
                }
                else {
                    ta = $('.btn[data-src="'+ params.modal +'"]:eq(0)');

                    app.modal.show({
                        title: ta.attr('title'),
                        src: 'backend/'+ app.module.name +'/'+ params.modal,
                        size: ta.data('size') ? ta.data('size') : 'nor',
                        canClose: false,
                    });
                }
            }
            else {
                app.loadHtml('backend'+ path, 'main-box', params.module, app.module.pid);
            }
        },

        fixPath: function (urlToParse) {
            urlToParse = urlToParse.replace(app.route.base, '');
            if (app.route.mode !== 'history') {
                urlToParse = urlToParse.replace('#', '');
            }

            return urlToParse;
        }
    };

    app.route.addRoute('/:module/:layout/:modal/:id', app.route.loadModule, '@module@layout@modal@id');

    app.route.addRoute('/:module/:layout/:id', app.route.loadModule, '@module@layout@id');

    app.route.addRoute('/:module/:layout', app.route.loadModule, '@module@layout');

    app.route.addRoute(['/', '/:module'], function (params) {}, '@module');

}(app, gee, jQuery));
