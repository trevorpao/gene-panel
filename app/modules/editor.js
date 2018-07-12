;
(function (app, gee, $) {
    'use strict';

    app.editor = {
        option: {
            inlineMode: false,
            language: 'zh_tw',
            key: 'mrumF-11eyF4H-7od1==',
            placeholderText: '開始打字吧~~~~~~',
            pluginsEnabled: ['fullscreen', 'image', 'link', 'wordPaste', 'codeView', 'quote', 'url', 'video'],
            imageUploadURL: 'media/editor_upload',
            imageUploadParam: 'photo',
            pasteImage: true,
            pastedImagesUploadURL: 'media/editor_upload',
            imageDefaultWidth: 0,
            requestWithCredentials: true,
            toolbarFixed: false,
            plainPaste: true,
            minHeight: 300,
            htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'span', 'video', 'style', 'script', '.fa']
        },

        inlineOption: {
            key: 'mrumF-11eyF4H-7od1==',
            placeholderText: '開始打字吧~~~~~~',
            toolbarInline: true,
            toolbarButtons: ['bold', 'italic', 'underline', 'strikeThrough', 'color', 'indent', 'outdent', '-', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'insertLink', 'undo', 'redo'],
            quickInsertButtons: ['image', 'table', 'ul', 'ol', 'hr'],
            imageUploadURL: 'media/editor_upload',
            pastedImagesUploadURL: 'media/editor_upload',
            imageUploadParam: 'photo',
            requestWithCredentials: true,
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

            return app.editor;
        },

        load: function (column, content) {
            app.waitFor(function () {
                return ($(app.editor.selector + '.col-' + column).length > 0);
            }).then(function () {
                $(app.editor.selector + '.col-' + column).froalaEditor('html.set', content);
            });

            return app.editor;
        },

        get: function (column) {
            return $(app.editor.selector + '.col-' + column).froalaEditor('html.get');
        }
    };

}(app, gee, jQuery));
