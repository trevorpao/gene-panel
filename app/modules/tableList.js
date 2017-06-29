;(function(app, gee, $){
    'use strict';

    // register a module name
    app.tableList = {
        init: function() {}
    };

    gee.hook('loadList', function(me) {
        let tmpl = me.data('tmpl');

        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('loadRow', function(me) {
        let pid = app.module.pid || me.data('id');
        let tmpl = me.data('tmpl');
        let tmplName = app.module.name + tmpl;
        let item = app.loadTmpl(tmplName, me);

        gee.clog(item);

        if (pid) {
            if (me.data('src')) {
                app.module.pid = pid;
                var size = me.data('size') ? me.data('size') : 'nor';
                app.arena.showModal(me.data('title'), me.data('src'), size);
            }
            else {
                app.arena.loadRow(pid, tmpl);
            }
        }
        else {
            app.arena.renderBox($('#'+ tmpl), { item: item }, 1);
            // gee.init();
        }
    });

}(app, gee, jQuery));
