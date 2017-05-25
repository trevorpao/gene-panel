import 'styles/index.scss';

import 'jquery-touch-events/src/jquery.mobile-events';
import 'jquery.cookie/jquery.cookie';

// import 'gene-event-handler/docs/scripts/jquery.gene.min';
require('jsrender');
import 'gene-event-handler/app/scripts/validatr';
import 'gene-event-handler/app/scripts/jquery.gene';

window.mainUrl = (IS_DEV) ? 'http://music.sense-info.co/' : '/';
window.apiUrl = window.mainUrl +'';
gee.debug = IS_DEV;

import './extend';
import './app';
import './modules/arena';
import './modules/table';

$.views.helpers(app.formatHelper);

$(document).ready(function () {
    app.init(['arena', 'tableList']);
});
