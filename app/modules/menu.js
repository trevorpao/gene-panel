;((app, gee, $) => {
    'use strict';

    let callback = function(){
        if (this.code !== 1) {
            app.stdErr(this);
        } else {
            app.stdSuccess(this);
        }
    };

    app.menu = {
        // NOTE : jstree data structure example
        // 'core' : {
        //     'data' : [
        //       { "text" : "Root node", "children" : [
        //           { "text" : "Child node 1" },
        //           { "text" : "Child node 2" }
        //         ]
        //       }
        //     ]
        //   }
        // }
        //

        isInit: false,

        options: {
            'core':{
                'data': [],
                'check_callback': true
            },
            'types': {
                'default': {
                    'icon': 'glyphicon glyphicon-flash'
                },
                'demo': {
                    'icon' : 'glyphicon glyphicon-ok'
                }
            },
            'contextmenu': {
                'items': {
                    'deleteItem': {
                        'label': 'Delete',
                        'action': (data) => {
                            let item = data.reference.prevObject[0];
                            let ele = $(item);
                            ele.data('id', item.id);
                            gee.delMenuRow(ele);
                        }
                    }
                }
            },
            'plugins' : [ 'dnd', 'types', 'contextmenu' ]
        },

        uploadFiles: [],    // file already uploaded uri would be stored here

        init: function (me) {
            let tree = $('#menu-tree-container');
            app.menu.isInit = true;
            $( () => {
                tree.on('changed.jstree', function(e, d){
                    me.data('id', d.selected[0]);
                    gee.loadRow(me, 'menuForm');
                })
                .on('loaded.jstree,refresh.jstree', function(e, d){
                    tree.jstree('open_all');
                })
                .jstree(app.menu.options);
            });

            $(() => {
                $(document).bind('dnd_stop.vakata', (e, data) => {
                    // let updateSorterData = [];
                    let outterNode = $('#menu-tree-container > ul');
                    let objs = app.menu.prepareSorterData(outterNode, true);

                    gee.yell(app.module.name +'/update_sorter', JSON.stringify({ data: objs }), callback, callback);
                });
            });
        },

        refresh: (me) => {
            let tree = $('#menu-tree-container');

            let jstreeCallback = function(){
                callback.call(this);    //  make general callback warkable
                let data = app.menu.prepareTreeNode(this.data.subset, true);

                if (!app.menu.isInit) {
                    app.menu.init(me);
                    app.waitFor(function (argument) {
                        return tree.hasClass('jstree');
                    }).then(function () {
                        tree.jstree(true).settings.core.data = data;
                        tree.jstree(true).refresh();
                    });
                }
                else {
                    tree.jstree(true).settings.core.data = data;
                    tree.jstree(true).refresh();
                }
            };
            gee.yell(app.module.name +'/list', '', jstreeCallback, jstreeCallback);
        },

        prepareSorterData: (jele, isTop) => {
            let updateSorterData = [];

            jele.children().each( function(index, c){
                c = $(c);

                let hasChild = c.children('ul').length ? true : false;
                if(hasChild){
                    let d = {
                        'id': this.getAttribute('id'),
                        'sorter': index,
                        'parent_id': isTop ? '0' : c.attr('parent_id')
                    };
                    d.children = app.menu.prepareSorterData( $(c.children('ul')[0]) );
                    updateSorterData.push(d);
                }else{
                    let d = {
                        'id': this.getAttribute('id'),
                        'sorter': index,
                        'parent_id':  isTop ? '0' : c.attr('parent_id')
                    };
                    updateSorterData.push(d);
                }
            });
            return updateSorterData;
        },

        prepareTreeNode: (rowData, outerContainer) => {
            let finalData = [];

            rowData.forEach( e => {
                let result = {
                    'text': e.title,
                    'id': e.id,
                    'li_attr': {
                        'parent_id': e.parent_id
                    }
                };
                if( e.rows.length !== 0 ){
                    result.children = app.menu.prepareTreeNode(e.rows);
                }
                finalData.push(result);
            });
            return finalData;
        },

        del: (data, ele) => {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    ele.remove();
                }
            };
            gee.yell(app.module.name + '/del_row', data, callback, callback);
        }
    };

    gee.hook('menu/initial', (me) => {
        app.menu.isInit = false;
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('menu/cancelForm', (me) => {
        me.closest('form').find('input[type=text], textarea').val('');
        gee.refreshForm(me.closest('form'));
    });

    gee.hook('delMenuRow',  (ele) => {
        if (confirm('確認刪除此記錄')) {
            app.menu.del({ id: ele.data('id') }, ele);
        }
    });

    gee.hook('menu/setRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            let moduleName = app.module.name;
            let formSerializedArray = form.serializeArray();

            formSerializedArray.push({
                'name': 'pics',
                'value': app[moduleName].uploadFiles
            });
            app.progressingBtn(me);
            app.simple.set(formSerializedArray, me);
        }
    });

})(app, gee, jQuery);
