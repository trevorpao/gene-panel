
(function(w, $){
    'use strict';

    $.fn.placeholder = function(options) {
        return this.each(function() {
            if (!('placeholder' in document.createElement(this.tagName.toLowerCase()))) {
                var $this = $(this);
                var placeholder = $this.attr('placeholder');
                $this.val(placeholder).data('color', $this.css('color')).css('color', '#aaa');
                $this.focus(function() {
                        if ($.trim($this.val()) === placeholder) {
                            $this.val('').css('color', $this.data('color'));
                        }
                    })
                    .blur(function() {
                        if (!$.trim($this.val())) {
                            $this.val(placeholder).data('color', $this.css('color')).css('color', '#aaa');
                        }
                    });
            }
        });
    };

    $.fn.inArray = function(ary, str) {
        var inArray = 0;

        for (var i in ary) {
            if (ary[i] === str) {
                inArray++;
            }
        }

        return (inArray > 0) ? true : false;
    };

    $.fn.serializeFormJSON = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    $.fn.extend({
        /**
         * hasMutilClass
         * @param  {String}  nameStr classA|classB for OR, classA&classB for AND
         * @return {Boolean} return true if those classes are assigned to this element
         */
        hasMutilClass: function (nameStr) {
            var split = (nameStr.indexOf('|') !== -1) ? '|' : '&';
            var ary = nameStr.split(split);
            var ta = $(this)[0];
            var check = (split === '|' || ary.length === 0) ? false : true;
            $.each(ary, function (idx, val) {
                var tmpChk = ta.classList.contains(val);
                if (tmpChk && split === '|') {
                    check = true;
                }
                if (!tmpChk && split === '&') {
                    check = false;
                }
            });
            return check;
        }
    });

    /**
     * Copyright 2012, Digital Fusion
     * Licensed under the MIT license.
     * http://teamdf.com/jquery-plugins/license/
     *
     * @author Sam Sehnert
     * @desc A small plugin that checks whether elements are within
     *       the user visible viewport of a web browser.
     *       only accounts for vertical position, not horizontal.
     */
    $.fn.visible = function(partial){

        var $t              = $(this),
            $w              = $(window),
            viewTop         = $w.scrollTop(),
            viewBottom      = viewTop + $w.height(),
            _top            = $t.offset().top,
            _bottom         = _top + $t.height(),
            compareTop      = partial === true ? _bottom : _top,
            compareBottom   = partial === true ? _top : _bottom;

        return ((compareBottom <= viewBottom) && (compareTop >= viewTop));
    };

})(window, jQuery);
