import 'styles/index.scss';

import 'jquery-touch-events/src/jquery.mobile-events';
import 'jquery.cookie/jquery.cookie';
import 'twbs-pagination/jquery.twbsPagination';

// import 'gene-event-handler/docs/scripts/jquery.gene.min';
require('jsrender');

import 'gene-event-handler/app/scripts/validatr';
import 'gene-event-handler/app/scripts/jquery.gene';

window.mainUrl = 'http://demo.sense-info.co/';
window.apiUrl = window.mainUrl +'api/';
gee.debug = IS_DEV;

import './extend';
import './app';
import './modules/arena';
import './modules/staff';
import './modules/tableList';

// $.views.settings.delimiters('<%', '%>');
$.views.helpers(app.formatHelper);

$(document).ready(function () {
    app.init(['arena', 'staff']);
});
