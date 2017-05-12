import 'styles/index.scss';

// import 'gene-event-handler/docs/scripts/jquery.gene.min';
require('jsrender');
import 'gene-event-handler/app/scripts/validatr';
import 'gene-event-handler/app/scripts/jquery.gene';

window.mainUrl = '/';
window.apiUrl = window.mainUrl +'';
gee.debug = IS_DEV;

import './extend';
import './app';
import './modules/arena';
import './modules/member';
import './modules/cart';

gee.hook('showAlert', function (me) {
    gee.clog(gee);
    alert('test');
});

$.views.helpers(app.formatHelper);

app.init(['arena', 'cart', 'member']);
