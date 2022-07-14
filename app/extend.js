
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

    // https://gist.github.com/peteboere/1517285
    $.fn.alterClass = function(removals, additions) {
        var self = this;
        if (removals.indexOf('*') === -1) {
            // Use native jQuery methods if there is no wildcard matching
            self.removeClass(removals);
            return !additions ? self : self.addClass(additions);
        }

        var patt = new RegExp('\\s' + removals.replace(/\*/g, '[A-Za-z0-9-_]+').split(' ').join('\\s|\\s') + '\\s', 'g');

        self.each(function(i, it) {
            var cn = ' ' + it.className + ' ';
            while (patt.test(cn)) {
                cn = cn.replace(patt, ' ');
            }
            it.className = $.trim(cn);
        });
        return (!additions) ? self : self.addClass(additions);
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

    $.fn.formatMoney = function (n, c, d, t) {
        n = n * 1;
        c = isNaN(c = Math.abs(c)) ? 2 : c;
        d = typeof d === 'undefined' ? '.' : d;
        t = typeof t === 'undefined' ? ',' : t;
        var s = n < 0 ? '-$' : '$';
        var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '';
        var j = (j = i.length) > 3 ? j % 3 : 0;
        return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
    };

    $.fn.formatNum = function(n, c, d, t, s) {
        n = n * 1;
        c = isNaN(c = Math.abs(c)) ? 2 : c;
        d = typeof d === 'undefined' ? '.' : d;
        t = typeof t === 'undefined' ? ',' : t;
        s = (s === 1) ? ('') : ((n < 0) ? '-' : '');
        var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + '';
        var j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : '');
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
        },

        animateIt: function (anim, callback) {
            let me = $(this);
            me.one('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function(e) {
                if ($(this).hasClass(anim)) {
                    $(this).removeClass(anim);
                    if (typeof callback === 'function') {
                        callback.call($(this));
                    }
                }

            })
            .addClass(anim);
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

    $.fn.attrs = function() {
        if (arguments.length === 0) {
            if (this.length === 0) {
                return null;
            }

            var obj = {};
            $.each(this[0].attributes, function() {
                if (this.specified) {
                    obj[this.name] = this.value;
                }
            });
            return obj;
        }

        return old.apply(this, arguments);
    };

})(window, jQuery);
