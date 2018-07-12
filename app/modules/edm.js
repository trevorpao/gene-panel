/**
 * 發信
 */
;
(function (app, gee, $) {
    'use strict';
    app.edm = {
        box: null,
        limit: 10,
        delay: 5,

        loopList: function() {
            var items = [];
            var counter = 0;

            app.edm.box.find('.item.new').each(function(idx) {
                var row = $(this).find(':checkbox:checked');
                if (row.length > 0 && counter < app.edm.limit) {
                    items.push(row.val());
                    $(this).removeClass('new').addClass('progressing');
                    counter++;
                }
                else {
                    // $(this).removeClass('new').addClass('pass');
                }
            });

            gee.clog(items);
            app.edm.send(items);
        },

        send: function(rows) {
            var callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.edm.box.find('.item.progressing').removeClass('progressing').addClass('done');
                    setTimeout(function() {
                        app.edm.loopList();
                    }, app.edm.delay * 1000);
                }
            };

            if (rows.length > 0) {
                gee.yell(app.module.name + '/send', {edm: app.query.cu.schedule_id.label, emails: rows}, callback, callback);
            }
            else {

                app.waitFor(0.9).then(function () {
                    app.doneBtn(app.edm.sendBtn);
                    app.edm.sendBtn.html('已完成發送');
                });

            }
        }
    };

    gee.hook('edm.loadList', function (me) {
        app.edm.box = me;
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('edm.loadEmails', function (me) {
        app.edm.loadEmails(me);
    });

    gee.hook('edm.send', function (me) {
        app.edm.sendBtn = me;
        me.html('發送中');
        app.progressingBtn(me);
        // app.edm.box.find('.item.pass').removeClass('pass').addClass('new');
        app.edm.loopList();
    });

}(app, gee, jQuery));
