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

        init: function () {
            if ($('.froalaEditor').length > 0) {
                app.editor.selector = '.froalaEditor';
                $('.froalaEditor').froalaEditor(app.editor.option)
                .on('froalaEditor.image.inserted', function (e, editor, $img) {
                    $img.addClass('img-responsive');
                });
            }

            if ($('.froalaInlineEditor').length > 0) {
                app.editor.selector = '.froalaInlineEditor';
                $('.froalaInlineEditor').froalaEditor(app.editor.inlineOption)
                .on('froalaEditor.image.inserted', function (e, editor, $img) {
                    $img.addClass('img-responsive');
                });
            }

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

        load: function (column, content) {
            if (_.isObject(content)) {
                _.map(content, function (row, idx) {
                    app.waitFor(function () {
                        return ($(app.editor.selector + '.col-'+ idx +'-' + column).length > 0);
                    }).then(function () {
                        $(app.editor.selector + '.col-'+ idx +'-' + column).froalaEditor('html.set', row[column]);
                    });
                });
            }
            else {
                app.waitFor(function () {
                    return ($(app.editor.selector + '.col-' + column).length > 0);
                }).then(function () {
                    $(app.editor.selector + '.col-' + column).froalaEditor('html.set', content);
                });
            }

            return app.editor;
        },

        get: function (column) {
            return $(app.editor.selector + '.col-' + column).froalaEditor('html.get');
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

}(app, gee, jQuery));
