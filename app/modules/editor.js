;
(function (app, gee, $) {
    'use strict';

    app.editor = {
        option: {
            inlineMode: false,
            language: 'zh_tw',
            key: 'qB1H2H1G1rA1C7C7C4E1D4B3E1B9C5eC-11F5C-9pmE2ln==',
            placeholderText: '開始打字吧~~~~~~',
            pluginsEnabled: ['fullscreen', 'image', 'link', 'wordPaste', 'codeView', 'quote', 'url', 'video'],
            imageUploadURL: 'media/editor_upload',
            imageUploadParam: 'photo',
            pasteImage: true,
            htmlAllowComments: false,
            pastedImagesUploadURL: 'media/editor_upload',
            imageDefaultWidth: 0,
            requestWithCredentials: true,
            toolbarFixed: false,
            plainPaste: true,
            minHeight: 300,
            htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'span', 'video', 'style', 'script', '.fa']
        },

        inlineOption: {
            key: 'qB1H2H1G1rA1C7C7C4E1D4B3E1B9C5eC-11F5C-9pmE2ln==',
            placeholderText: '開始打字吧~~~~~~',
            toolbarInline: true,
            toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'indent', 'outdent', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo'],
            quickInsertButtons: ['image', 'table', 'ul', 'ol', 'hr'],
            imageUploadURL: 'media/editor_upload',
            pastedImagesUploadURL: 'media/editor_upload',
            imageUploadParam: 'photo',
            requestWithCredentials: true,
            htmlAllowComments: false,
            imageDefaultWidth: 0,
            toolbarButtonsXS: null,
            toolbarButtonsSM: null,
            toolbarButtonsMD: null
        },

        selector: '.froalaEditor',

        init: function (row) {
            $(app.editor.selector).each(function () {
                app.editor.initFroala($(this), row);
            });

            if ($('.multipleSelect').length > 0) {
                $('.multipleSelect').fastselect();
            }
            if ($('input.datepicker').length > 0) {
                $('input.datepicker').datepicker({
                    dateFormat: 'yy-mm-dd',
                    numberOfMonths: 2,
                    defaultDate: +7,
                    minDate: 0
                });
            }

            if ($('.tabs-content').length > 0) {
                app.editor.tabRender($('.tabs-content'));
                app.waitFor(function () {
                    return ($('.tabs').length > 0);
                }).then(function () {
                    gee.init();
                    $('.tabs-content').prev().find('a:eq(0)').trigger('click');
                });
            }

            return app.editor;
        },

        initFroala: function ($elem, row) {
            var opt = app.editor.option;
            var param = $elem.data('param');
            var val = '';

            if ($elem.data('inline') === '1') {
                opt = app.editor.inlineOption;
            }
            $elem.froalaEditor(opt)
            .on('froalaEditor.image.inserted', function (e, editor, $img) {
                $img.addClass('img-responsive');
            });

            param = param.replace(/\[/g, '.').replace(/]/g, '');

            if (row) {
                if (param.indexOf('.') !== -1) { // only support meta[column] & lang[code][column]
                    var dp = param.split('.');
                    if (row[dp[0]] && row[dp[0]][dp[1]]) {
                        if (dp.length === 3) {
                            val = row[dp[0]][dp[1]][dp[2]];
                        }
                        else {
                            val = row[dp[0]][dp[1]];
                        }
                    }
                }
                else {
                    val = row[param];
                }
            }

            $elem.froalaEditor('html.set', val);
        },

        passVal: function (form) {
            form.find(app.editor.selector).each(function () {
                var uid = $(this).data('uid');
                $(uid).val($(this).froalaEditor('html.get'));
            });
        },

        tabRender: function (me) {
            let suffix = Math.floor(Math.random() * 999 + 1);
            let tabs = [];

            me.find('.tab-box').each(function (idx) {
                let cu = $(this);
                gee.clog(cu);
                cu.attr('id', 'tab-'+ idx +'-'+ suffix);
                tabs.push({title: cu.attr('title')});
            });

            let templateCode = app.tmplStores.tabNav;
            if (!templateCode) {
                let htmlCode = `<div class="tabs is-boxed gee" data-gene="click:toggleTab" data-ta="tabs-content-{{:suffix}}" data-nopde="1">
                  <ul>{{props tabs}}
                    <li>
                      <a href="javascript:;" data-ta="tab-{{:#index}}-{{:#parent.parent.data.suffix}}"> {{:prop.title}} </a>
                    </li>
                  {{/props}}</ul>
                </div>`;

                templateCode = $.templates(htmlCode);
                app.tmplStores.tabNav = templateCode;
            }

            me.attr('id', 'tabs-content-'+ suffix).before(templateCode.render({ tabs: tabs, suffix: suffix}));
        }
    };

    // <gee:editor data-param="lang[tw][content]" data-inline="0"></gee:editor>
    gee.hookTag('gee\\:editor', (me) => {
        me.each((idx) => {
            let cu = $(me[idx]);
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'content';
            let inline = cu.attr('data-inline') ? cu.attr('data-inline') : '0';
            let uniqid = 'feditor-' + Math.floor(Math.random() * 999 + 1);

            let templateCode = app.tmplStores.editor;
            if (!templateCode) {
                let htmlCode = '<div class="froalaEditor" data-uid="#{{:uniqid}}" data-param="{{:param}}" data-inline="{{:inline}}"></div><textarea name="{{:param}}" class="is-hidden" id="{{:uniqid}}" ></textarea>';

                templateCode = $.templates(htmlCode);
                app.tmplStores.editor = templateCode;
            }

            cu.replaceWith(templateCode.render({ param: param, inline: inline, uniqid: uniqid }));
        });
    });

}(app, gee, jQuery));
