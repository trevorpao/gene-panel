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
        let pid = app.arena.pid || me.data('id');
        let tmpl = me.data('tmpl');
        let tmplName = app.arena.module + tmpl;
        app.loadTmpl(tmplName, me);

        if (pid) {
            if (me.data('src')) {
                app.arena.pid = pid;
                var size = me.data('size') ? me.data('size') : 'nor';
                app.arena.showModal(me.data('title'), me.data('src'), size);
            }
            else {
                app.arena.loadRow(pid, tmpl);
            }
        }
    });

}(app, gee, jQuery));
