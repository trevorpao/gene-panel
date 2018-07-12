import 'jquery-touch-events/src/jquery.mobile-events';
import 'jquery.cookie/jquery.cookie';
import 'twbs-pagination/jquery.twbsPagination';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/sortable';
import 'jquery-ui/ui/disable-selection';
import 'jquery-ui/ui/widgets/datepicker';
import 'jquery-ui/ui/widgets/draggable';
import 'blueimp-file-upload/js/jquery.fileupload';
import 'localforage/dist/localforage';

import 'moment/moment';
import './fastselect';

import 'jstree';
require('jsrender');

import 'gene-event-handler/app/scripts/validatr';
import 'gene-event-handler/app/scripts/jquery.gene';

// Require Editor JS files.
import 'froala-editor/js/froala_editor.pkgd.min';

// Require Editor CSS files.
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

import 'styles/index.scss';
import 'fastselect/dist/fastselect.css';

import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/datepicker.css';

import '../assets/styles/vivify.min.css';

import 'styles/custom.scss';

window.mainUrl = 'https://loc.sense-info.co/';
window.apiUrl = window.mainUrl +'api/';
gee.debug = IS_DEV;

import './extend';
import './app';
import './modules/route';
import './modules/arena';
import './modules/editor';
import './modules/upload';
import './modules/query';
import './modules/staff';
import './modules/simple';
import './modules/post';
import './modules/press';
import './modules/author';
import './modules/media';
import './modules/edm';
import './modules/menu';

// $.views.settings.delimiters('<%', '%>');
$.views.helpers(app.formatHelper);

localforage.config({
    name: 'GeneBaseApp',
    version: 3
});

$(document).ready(function () {
    if (gee.debug) {
        app.route.mode = 'hash';
    }

    app.init(['arena', 'route', 'simple', 'staff']);

    app.waitFor(0.5).then(function () {
        if (app.route.changing) {
            gee.clog($('#navMenu .navbar-start .navbar-item:eq(0)'));
            $('#navMenu .navbar-start .navbar-item:eq(0)').trigger('tap');
        }
    });
});
