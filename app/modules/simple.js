;
(function (app, gee, $) {
    'use strict';

    app.simple = {

        init: function () {
            app.simple.defaultOptTmpl = $.templates('<select name="{{:name}}" module="{{:module}}" tmpl="{{:tmpl}}" force="{{:force}}"><option value=""> 請選擇 </option>{{props opt}}<option value="{{:prop.id}}">{{:prop.title}}</option>{{/props}}</select>');

            app.simple.menuOptTmpl = $.templates('<select name="{{:name}}" module="{{:module}}" tmpl="{{:tmpl}}" force="{{:force}}"><option value=""> 選單總管 </option>{{props opt}}<option value="{{:prop.id}}">{{:prop.title}}</option>{{/props}}</select>');

            app.simple.chkBoxOptTmpl = $.templates(
                '{{props opt}} <input class="is-checkradio" id="chkb-{{:#parent.parent.data.name}}-{{:prop.id}}" '+
                ' type="checkbox" name="{{:#parent.parent.data.name}}[]" value="{{:prop.id}}"> '+
                ' <label for="chkb-{{:#parent.parent.data.name}}-{{:prop.id}}">{{:prop.title}}</label> <br /> {{/props}}'
            );
        },

        loadRow: function (pid, tmpl) {
            let callback = function () {
                app.module.pid = null;
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let row = this.data;
                    app.arena.renderBox($('#' + tmpl), { item: row }, 1);

                    // dealing with fileUploaidngDnd
                    if (row.pic) {
                        let imgSrc = row.pic;
                        let targetArea = $('.gee__uploadingFile-dnd > input');
                        app.simple.renderFLDnDDataPic(targetArea, imgSrc);
                    }

                    app.waitFor(0.1).then(function () {

                        if (row.tags) {
                            $('input[name="tags"]').data('initial-value', row.tags).val(_.map(row.tags, 'id').join());
                        }
                        if (row.teachers) {
                            $('input[name="teachers"]').data('initial-value', row.teachers).val(_.map(row.teachers, 'id').join());
                        }

                        gee.init();
                        app.editor.init();
                        if (row.content) {
                            app.editor.load('content', row.content);
                        }

                        // initialize content data for upload module pic preview
                        let dataParams = app.upload.checkDataParam();
                        if (dataParams.length !== 0) {
                            let pics = [];
                            dataParams.forEach((dataParam) => {
                                if (row[dataParam]) {
                                    pics.push({ paramName: dataParam, value: row[dataParam] });
                                }
                            });
                            app.upload.initContent(pics);
                        }
                    });
                }
            };

            gee.yell(app.module.name + '/get', JSON.stringify({ id: pid }), callback, callback);
        },

        loadOpt: function (attr, data, selectBox, val) {
            data = data || {};
            let tmpl = app.simple[attr.tmpl] || app.simple.defaultOptTmpl;
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    selectBox.replaceWith(tmpl.render({ name: attr.name, module: attr.module, tmpl: attr.tmpl, force: attr.force, opt: this.data }));

                    if (val) {
                        if (attr.tmpl !== 'chkBoxOptTmpl') {
                            $('select[name="' + attr.name + '"]').find('option[value="' + val + '"]').prop('selected', true);
                        }
                        else {
                            let ary = val.split(',');
                            _.map(ary, function (v) {
                                $('#chkb-'+ attr.name +'-'+ v).prop('checked', true);
                            });
                        }
                    }
                }
            };

            gee.yell(attr.module + '/get_opts', JSON.stringify(data), callback, callback);
        },

        loadDetailRow: function (pid, tmpl) {
            let callback = function () {
                app.module.pid = null;
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    let row = this.data;

                    app.arena.renderBox($('#' + tmpl), { item: row }, 1);

                    app.waitFor(0.1).then(function () {
                        if (row.tags) {
                            $('input[name="tags"]').data('initial-value', row.tags).val(_.map(row.tags, 'id').join());
                        }

                        gee.init();
                        app.editor.init();
                    });
                }
            };

            gee.yell(app.module.name + '/get_detail', JSON.stringify({ parent_id: pid }), callback, callback);
        },

        set: function (data, btn) {
            let callback = function () {

                app.waitFor(0.9).then(function () {
                    app.doneBtn(btn);
                });

                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    app.arena.loadPage(app.arena.pageBox);

                    let successTxt = '已儲存成功!';
                    if (data.indexOf('id=0') !== -1) {
                        btn.closest('form')[0].reset();
                        successTxt = '已新增成功!';
                    }
                    app.arena.addNotification(successTxt);
                }
            };

            gee.yell(app.module.name + '/save', data, callback, callback);
        },

        setDetail: function (data, btn) {
            let callback = function () {
                app.waitFor(0.9).then(function () {
                    app.doneBtn(btn);
                });
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    app.arena.loadPage(app.arena.pageBox);
                    let successTxt = '已儲存成功!';
                    if (data.indexOf('id=0') !== -1) {
                        btn.closest('form')[0].reset();
                        successTxt = '已新增成功!';
                    }
                    app.arena.addNotification(successTxt);
                }
            };

            gee.yell(app.module.name + '/saveDetail', data, callback, callback);
        },

        del: function (data, btn) {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);
                    btn.closest('tr, .loop-item').remove();

                    btn.closest('').remove();
                }
            };

            gee.yell(app.module.name + '/del', data, callback, callback);
        },

        renderFLDnDDataPic: (area, imgSrc) => {
            let image = new Image();
            image.src = window.apiUrl.substring(0, window.apiUrl.length - 1) + imgSrc;
            image.style.width = '100%';

            area.append(image);
        },

        bat: function (action, data) {
            let callback = function () {
                if (this.code !== 1) {
                    app.stdErr(this);
                } else {
                    app.stdSuccess(this);

                    $.each(this.data.ids, function (i, v) {
                        $('input[value="' + v + '"]').closest('tr').remove();
                    });
                }
            };

            switch (action) {
                case 'cl':
                    gee.yell('fulfill/cancel', data, callback, callback);
                    break;
                default:
                    // to nothing
            }
        }
    };

    gee.hook('loadList', function (me) {
        app.arena.resetCurrent(me);
        app.arena.nextPage(me);
    });

    gee.hook('cancelForm', function (me) {
        me.closest('form').html('');
    });

    gee.hook('loadRow', function (me, tmplNameRef) {
        let pid = app.module.pid || me.data('id');
        // NOTE : add templName input to expand the functinalities(also add the complexity)
        let tmpl = tmplNameRef ? tmplNameRef : me.data('tmpl');
        let tmplName = app.module.name + tmpl;
        let box = $('#' + tmpl);

        if (pid) {
            if (me.data('src')) {
                let size = me.data('size') ? me.data('size') : 'nor';
                app.module.pid = pid;
                app.module.modal = me.data('src');
                var path = app.route.getPath();

                app.route.flash({ ta: app.module.name, path: path });
                // app.arena.showModal(me.data('title'), me.data('src'), size);
            } else {
                app.simple.loadRow(pid, tmpl);
            }
        } else {
            var row = app.moduleItems[tmplName];
            gee.clog(row);
            app.arena.renderBox(box, { item: row }, 1);
            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                if (row.tags) {
                    $('input[name="tags"]').data('initial-value', row.tags).val(_.map(row.tags, 'id').join());
                }

                if (row.teachers) {
                    $('input[name="teachers"]').data('initial-value', row.teachers).val(_.map(row.teachers, 'id').join());
                }

                gee.init();
                app.editor.init();

                if (row.content) {
                    app.editor.load('content', row.content);
                }
            });
        }
    });

    gee.hook('initForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = app.module.name + tmpl;

        app.loadTmpl(tmplName, box);

        if (app.module.pid) {
            app.simple.loadRow(app.module.pid, tmpl);
        } else {
            app.arena.renderBox(box, { item: app.moduleItems[tmplName] }, 1);
            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                gee.init();
                app.editor.init().load('content', '');
            });
        }

        // For those forms that have uploading files
        if (gee.isset(app[app.module.name]) && gee.isset(app[app.module.name].uploadFiles)) {
            app[app.module.name].uploadFiles = [];
        }
    });

    gee.hook('initDetailForm', function (me) {
        let tmpl = me.data('tmpl');
        let box = $('#' + tmpl);
        let tmplName = app.module.name + tmpl;

        app.loadTmpl(tmplName, box);

        // gee.clog('-------------------------------------- gee.initForm');

        if (app.module.pid) {
            app.simple.loadDetailRow(app.module.pid, tmpl);
        } else {
            app.arena.renderBox(box, { item: app.moduleItems[tmplName] }, 1);

            app.waitFor(function () {
                return !box.is(':empty');
            }).then(function () {
                gee.init();
                app.editor.init().load('content', '');
            });
        }
    });

    // NOTE: fetch common form-verify from setRow&setRowV2(not finished)
    gee.hook('generalVerifyForm', (jForm) => {});

    gee.hook('setRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        if (form.find('.col-content').length > 0) {
            form.find('[name="content"]').val(app.editor.get('content'));
        }

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            app.progressingBtn(me);
            app.simple.set(form.serialize(), me);
            gee.hideModal();
        }
    });

    gee.hook('setDetailRow', function (me) {
        let form = me.closest('form');

        form.find('input').each(function () {
            if ($(this).val() === $(this).attr('placeholder')) {
                $(this).val('');
            }
        });

        if (!$.validatr.validateForm(form)) {
            return false;
        } else {
            app.progressingBtn(me);
            app.simple.setDetail(form.serialize(), me);
            gee.hideModal();
        }
    });

    gee.hook('delRow', function (me) {
        if (confirm('確認刪除此記錄')) {
            app.simple.del({ id: me.data('id') }, me);
        }
    });

    gee.hook('reactList', function (me) {
        let ta = $(me.event.target).closest('[data-func]');
        let func = ta.data('func');

        if (typeof func !== 'undefined') {
            // func = func.replace(me.event.type +':', '');

            if (gee.check(func)) {
                ta.event = me.event;
                gee.exe(func, ta);
                me.event.preventDefault();
            }
        }
    });

    gee.hook('largeclickarea', function (me) {
        let target = $(me.event.target)
        let selectName = target.attr('value') ? target.attr('name') + '-all' : me.find('input[type=checkbox]').attr('name') + '-all';
        let checkedEle = target.attr('value') ? target : me.find('input[type=checkbox]');

        if (!target.attr('value') && !target.is('a')) {
            me.find('input[type=checkbox]').each(function (index, c) {
                $(c).prop('checked', !$(c).prop("checked"));
            });
        }

        // synchonized check-all behavior
        let checkallEle = $(`input[name=${selectName}]`);
        if (checkallEle.is(':checked') && !checkedEle.is(":checked")) {
            checkallEle.prop('checked', false);
        } else if (!checkallEle.is(':checked') && checkedEle.is(':checked')) {
            let result = true;
            let checkboxes = $('tbody input[type="checkbox"]');

            for (let i = 0; i < checkboxes.length; i++) {
                if (!$(checkboxes[i]).is(":checked")) {
                    result = false;
                    break;
                }
            }

            if (result) {
                checkallEle.prop('checked', true);
            }
        }
    });

    // dealing with list item checkbox and all selected
    gee.hook('reactSelectListItem', (me) => {
        let id = me.attr('value');

        if (!id) {
            let selectName = me.attr('name').replace(/-all\b/ig, "");
            let checkboxList = $(`[name=${selectName}]`);

            if (checkboxList.length) {
                checkboxList.prop('checked', me.is(':checked'));
            }
        }
    });

    gee.hook('patchChange', (me) => {
        let action = $(me.event.target).closest('li').attr('action');
        let checklist = $('tbody input[type="checkbox"]');
        let module = $('tbody').attr('data-tmpl');

        let result = [];
        checklist.each((index, cb) => {
            if (cb.checked) {
                let jcb = $(cb);
                let order_no = jcb.attr('value');
                let item_id = jcb.closest('tr').find('td')[2].innerText;

                let obj = {
                    "order_no": order_no,
                    // "action": action
                }
                if (module.indexOf('orderList') !== -1) {
                    obj["item_name"] = item_id;
                } else if (module.indexOf('fulfillList') !== -1) {
                    obj["item_id"] = item_id;
                }
                result.push(obj);
            }
        });

        // console.log(result);
        app.simple.bat(action, { ids: result, type: app.module.name });
        // TODO calling API
    });

    // <gee:set-option module="site"></gee:set-option>
    gee.hookTag('gee\\:set-option', function (me) {
        me.each(function (idx) {
            let cu = $(this);
            let attr = app.extractAttr(cu);

            if (attr.module) {
                app.simple.loadOpt(attr, {}, cu);
            }
        });
    });

    gee.hook('setSelect', function (me) {
        let option = me.data('value');
        let force = me.attr('force');

        if (force) {
            app.simple.loadOpt(app.extractAttr(me), {}, me, option);
        } else {
            me.find('option[value="' + option + '"]').prop('selected', true);
        }
    });

    gee.hook('setRadio', function (me) {
        let option = me.data('value');
        let type = me.data('type');
        if (type === 'checkbox') {
            _.map(option.split(','), function (v) {
                me.find('[value="'+ v +'"]').prop('checked', true);
            });
        }
        else {
            me.find('[value="' + option + '"]').prop('checked', true);
        }
    });

    gee.hook('toggleCheckbox', function (me) {
        gee.clog('toggleCheckbox');
        let state = me.prop('checked');
        let ta = $('input[name="' + me.attr('data-relate') + '"]');
        let func = app.module.name + '/' + ta.attr('func');

        gee.clog('toggleCheckbox+state' + state + ' / func:' + func);
        if (gee.check(func) && ta.length !== 0) {
            ta.each(function () {
                let item = $(this);
                if (item.prop('disabled') === false) {
                    item.prop('checked', state);
                    if (gee.check(func)) {
                        item.event = me.event;
                        gee.exe(func, item);
                    }
                }
            });
        }
    });

    gee.hook('toggleTab', function (me) {
        let cu = $(me.event.target);

        if (cu.is('a')) {
            me.find('li.is-active').removeClass('is-active');
            $('#'+ me.data('ta')).find('.tab-box.is-active').removeClass('is-active');
            cu.parent().addClass('is-active');
            $('#'+ cu.data('ta')).addClass('is-active');
        }
    });

    gee.hookTag('gee\\:upload1', (me) => {
        me.each((idx) => {
            let cu = $(me[idx]);
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'pic';
            let infoText = cu.attr('info-text') ? cu.attr('info-text') : '1200*800';

            let templateCode = app.tmplStores.upload1;
            if (!templateCode) {
                let htmlCode = '<div class="field fuu has-addons"> <p class="control"> <input type="text" name="{{:param}}" class="input fuu-filename" readonly="readonly" placeholder="{{:infoText}}"> </p> <p class="control"> <a class="button is-warning fuu-clear gee" data-gene="click:clearFile" style="display:none;">Clear</a> <div class="button is-expanded fuu-input"> <span class="glyphicon glyphicon-folder-open"></span> <span class="fuu-input-btn">Browse</span> <input type="file" accept="image/png, image/jpeg, image/gif" class="gee" data-gene="change:passFile" /> </div> <a class="button is-success fuu-upload gee" data-gene="click:upload" style="display:none;">Upload</a> </p> </div>';

                templateCode = $.templates(htmlCode);
                app.tmplStores.upload1 = templateCode;
            }

            cu.replaceWith(templateCode.render({ param: param, infoText: infoText }));
        });
    });

    gee.hookTag('gee\\:upload', (me) => {
        me.each((idx) => {
            let cu = $(me[idx]);
            let moduleName = cu.attr('module-name');
            let multiple = cu.attr('data-multiple');
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'pic';
            let infoText = cu.attr('info-text') ? cu.attr('info-text') : '1200*800';

            let templateCode = app.tmplStores.upload;
            if (!templateCode) {
                let htmlCode = `<div class="gee__uploadingFile-dnd"><input type="file" accept="image/png, image/jpeg, image/gif" class="inputfile pre-gee" data-gene="change:uploadingFile" module={{:module}} data-multiple={{:multiple}} data-param={{:param}} /><label for="file"><div class="pre-gee" data-gene="init:upload/dndUploading,click:upload/uploading" module={{:module}} data-multiple={{:multiple}} data-param={{:param}}><div class="file__loading-text"><i class="fa fa-cloud-upload" aria-hidden="true"></i><strong>Choose a file</strong><span class="box__dragndrop"> or drag it here (NOTE:{{:infoText}})</span>.</div><div class="file__uploading-progressbar">Uploading...</div></div></label></div>`;

                htmlCode = htmlCode.replace(/pre-gee/g, 'gee');
                templateCode = $.templates(htmlCode);
                app.tmplStores.upload = templateCode;
            }

            cu.replaceWith(templateCode.render({ module: moduleName, multiple: multiple, param: param, infoText: infoText }));
        });
    });

}(app, gee, jQuery));
