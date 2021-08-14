// 1. Import the Froala Editor
import FroalaEditor from 'froala-editor';

// 2. Import a Froala Editor plugin(s)
import 'froala-editor/js/plugins/fullscreen.min.js';  
import 'froala-editor/js/plugins/image.min.js';  
import 'froala-editor/js/plugins/link.min.js';  
import 'froala-editor/js/plugins/word_paste.min.js';  
import 'froala-editor/js/plugins/code_view.min.js';  
import 'froala-editor/js/plugins/quote.min.js';  
import 'froala-editor/js/plugins/url.min.js';  
import 'froala-editor/js/plugins/video.min.js';  
import 'froala-editor/js/plugins/lists.min.js';  
// import 'froala-editor/js/plugins/font_family.min.js';  
// import 'froala-editor/js/plugins/font_size.min.js';  
import 'froala-editor/js/plugins/inline_style.min.js';  
import 'froala-editor/js/plugins/paragraph_format.min.js';  
import 'froala-editor/js/plugins/paragraph_style.min.js';  
import 'froala-editor/js/plugins/align.min.js';  
import 'froala-editor/js/plugins/quick_insert.min.js';  
// import 'froala-editor/js/plugins/emoticons.min.js'; // OR EmailOctopus EmojiPicker v1.0.0 (https://emailoctopus.com/)

import 'froala-editor/js/languages/zh_tw.js';  

// 3. Import the Froala Editor css
// The webpack style-loader & css-loader are required to import css here. 
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

(function (app, gee, $) {
    'use strict';

    var licenseKey = '';

    var apiPath = 'media/editor_upload';

    var paragraphStyles = {
        'fr-grey-block': 'QuoteBlock',
        'fr-text-gray': 'Gray',
        'fr-text-bordered': 'Bordered',
        'fr-text-spaced': 'Spaced',
        'fr-text-uppercase': 'Uppercase'
    };

    var imageStyles = {
        'fr-rounded': 'Rounded',
        'fr-bordered': 'Bordered',
        'fr-shadow': 'Shadow',
        'img-responsive': '100%',
        'col-6': '50%',
        'col-4': '33%',
    };

    var paragraphFormat = {
        N: 'Normal',
        H3: 'Heading 3',
        PRE: 'Code'
    }

    app.editor = {
        option: {
            toolbarSticky: true,
            toolbarFixed: false,
            toolbarStickyOffset: 0,
            inlineMode: false,
            language: 'zh_tw',
            key: licenseKey,
            placeholderText: '開始打字吧~~~~~~',
            imageUploadURL: apiPath,
            pastedImagesUploadURL: apiPath,
            imageUploadParam: 'photo',
            pasteImage: true,
            htmlAllowComments: false,
            imageDefaultWidth: 1,
            imageResizeWithPercent: true,
            requestWithCredentials: true,
            minHeight: 500,
            htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'span', 'video', 'style', 'script', '.fa'],
            imageStyles: imageStyles,
            paragraphStyles: paragraphStyles,
            paragraphFormat: paragraphFormat,

            quickInsertEnabled: true,
            quickInsertButtons: ['image', 'video', 'embedly', 'table', 'ul', 'ol', 'hr'],

            // Define new inline styles.
            inlineStyles: {
                '標色文字': 'color: #ca5f00;',
            },

            // useless
            // pastePlain: true,
            // wordAllowedStyleProps: ['font-size'],
            // wordDeniedAttrs: ['style'],

            // simple mode
            // toolbarButtons: ['bold', 'italic', 'underline', 'insertImage', 'insertLink', 'insertTable', 'undo', 'redo'], 

            // default
            toolbarButtons: {
              moreText: {
                buttonsVisible: 4,
                buttons: ['bold', 'inlineStyle', 'clearFormatting', 'italic', 'underline', 'strikeThrough', 'backgroundColor', 'inlineClass']
              }, // , 'subscript', 'superscript', 'fontFamily', 'fontSize', 'textColor', 'emoticons'
              moreParagraph: {
                buttonsVisible: 3,
                buttons: ['paragraphFormat', 'quote', 'formatUL', 'alignLeft', 'alignCenter', 'formatOLSimple', 'alignRight', 'alignJustify', 'formatOL', 'paragraphStyle',  'lineHeight', 'outdent', 'indent']
              },
              moreRich: {
                buttonsVisible: 2,
                buttons: ['insertImage', 'insertLink', 'insertVideo', 'insertTable', 'emoticons', 'specialCharacters', 'embedly', 'insertHR']
              },
              moreMisc: {
                buttonsVisible: 2,
                buttons: ['undo', 'redo', 'fullscreen', 'print', 'getPDF', 'spellChecker', 'selectAll', 'html', 'help']
              }
            }

        },

        selector: '.froalaEditor',

        init: function (row) {
            app.editor.initFroala(row);

            if ($('.multipleSelect').length > 0) {
                $('.multipleSelect').fastselect();

                app.waitFor(0.3).then(function () {
                    $('.fstControls').sortable({
                        handle: '.holder',
                        items: '.fstChoiceItem',
                        start: function (event, ui) {
                            $(ui.placeholder[0]).height(ui.item.height());
                            $(this).addClass('js-sortable-ing');
                        },
                        stop: function (event, ui) {
                            var tmp = [];
                            $(this).removeClass('js-sortable-ing');
                            let sbox = $(this).closest('.fstMultipleMode');
                            sbox.find('.fstChoiceItem').each(function () {
                                tmp.push($(this).data('id'));
                            });

                            sbox.find('input.multipleSelect').val(tmp.join(','));
                        },
                        cancel: '.js-sortable-cancel',
                        opacity: 0.8
                    });

                    // var ary = [];
                    // sbox.find('.fstChoiceItem').each(function () {
                    //     ary.push($(this).data('id'));
                    // });
                    // box.find('input[name="relateds"]').val(ary.join(','));
                });
            }
            if ($('input.datepicker').length > 0) {
                $('input.datepicker').each(function () {
                    let minDate = $(this).data('mindate') || 0;
                    $(this).datepicker({
                        dateFormat: 'yy-mm-dd',
                        numberOfMonths: 2,
                        defaultDate: +7,
                        minDate: minDate
                    });
                });
            }

            if ($('.tabs-content').length > 0 && !$('.tabs-content').parent().find('.tabs').length) {
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

        initFroala: function (row) {
            var opt = _.cloneDeep(app.editor.option);

            opt.imageUploadURL = gee.apiUri + opt.imageUploadURL;
            opt.pastedImagesUploadURL = gee.apiUri + opt.pastedImagesUploadURL;

            opt.events = {
                'image.inserted': function ($img, response) {
                    $img.addClass('img-responsive');
                },
                'initialized': function () {
                    var param = this.$box.data('param');
                    var val = '';

                    // $(this.$box.find('.fr-wrapper')).find('div:eq(0)').hide();

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

                    if (gee.isset(this.html) && val != '') {
                        this.html.set(val);
                    }
                },
                'paste.afterCleanup': function (clipboard_html) {
                  // Do something here.
                  // this is the editor instance.
                  // console.log('====================================');
                  // console.log(clipboard_html);
                  // console.log(this);
                }
            };

            app.editor.instance = new FroalaEditor(app.editor.selector, opt);
        },

        passVal: function (form) {
            if (app.editor.instance.length > 1) {
                _.map(app.editor.instance, function (el) {
                    var param = el.$box.data('param');
                    $('textarea[name="'+ param +'"]', form).val(el.html.get());
                });
            } else if (app.editor.instance.length == 1) {
                var param = app.editor.instance.$box.data('param');
                $('textarea[name="'+ param +'"]', form).val(app.editor.instance.html.get());
            }
        },

        tabRender: function (me) {
            let suffix = Math.floor(Math.random() * 999 + 1);
            let tabs = [];

            me.find('.tab-box').each(function (idx) {
                let cu = $(this);
                cu.attr('id', 'tab-'+ idx +'-'+ suffix);
                tabs.push({title: cu.attr('title')});
            });

            let templateCode = app.tmplStores.tabNav;
            if (!templateCode) {
                let htmlCode = `<div class="tabs gee" data-gene="click:toggleTab" data-ta="tabs-content-{{:suffix}}" data-nopde="1">
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
        },
    };

    gee.hook('setColumn', function (me) {
        let form = me.closest('.field-editable');
        let box = me.closest('.editing');
        let cModule = me.data('module');
        let val = form.find('textarea[name="content"]').val();
        let pid = form.find('input[name="pid"]').val();
        let col = box.data('column');

        if (!pid || !col) {
            return false;
        } else {
            val = val.trim();
            let tmpModule = app.module.name;
            app.module.name = cModule;

            app.simple.set('&id='+ pid +'&'+ col +'='+ encodeURIComponent(val), me);
            app.module.name = tmpModule;

            if (val === '') {
                val = '<p class="empty-hit"></p>';
            }

            box.html(app.formatHelper.nl2br(val)).removeClass('editing');
        }
    });

    // <gee:set-option module="artwork" name="artwork_id" force="1"></gee:set-option>
    // <gee:set-option module="menu" name="parent_id" force="1" tmpl="menuOptTmpl"></gee:set-option>
    gee.hookTag('gee\\:set-option', function (me) {
        me.not('.js-going').each(function (idx) {
            let cu = $(this);
            cu.addClass('js-going');
            let val = cu.data('value');
            let attr = app.extractAttr(cu);
            attr.param = (gee.isset(attr.param)) ? JSON.parse(attr.param) : {};

            if (attr.module) {
                app.simple.loadOpt(attr, attr.param, cu, val);
            }
        });
    });

    // <gee:editor data-param="lang[tw][content]" data-inline="0"></gee:editor>
    gee.hookTag('gee\\:editor', (me) => {
        me.not('.js-going').each(function (idx) {
            let cu = $(this);
            cu.addClass('js-going');
            let param = cu.attr('data-param') ? cu.attr('data-param') : 'content';
            let inline = cu.attr('data-inline') ? cu.attr('data-inline') : '0';
            let uniqid = 'feditor-' + Math.floor(Math.random() * 999 + 1);

            let templateCode = app.tmplStores.editor;
            if (!templateCode) {
                let htmlCode = '<div class="froalaEditor" data-param="{{:param}}" data-inline="{{:inline}}"></div><textarea name="{{:param}}" class="is-hidden" ></textarea>';

                templateCode = $.templates(htmlCode);
                gee.clog(templateCode.render({ param: param, inline: inline, uniqid: uniqid }));
                app.tmplStores.editor = templateCode;
            }

            cu.replaceWith(templateCode.render({ param: param, inline: inline, uniqid: uniqid }));
        });
    });

}(app, gee, jQuery));
