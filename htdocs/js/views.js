// Views used by search.metacpan.org

var views = (function($) {

    var my = {};

    var _views = [];

    // module results view
    _views.moduleResults = [];
    _views.moduleResults.view = {
        
    };
    _views.moduleResults.template = '<table id="module_results_table" cellpadding="0" cellspacing="0" border="0" class="display"></table>';

    // accessors
    my.getView = function(name) {
        //return Mustache.to_html(_views[name].template, _views[name].view);
    };

    return my;

}(jQuery));
