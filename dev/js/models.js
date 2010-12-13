// Models used by search.metacpan.org

var Module = Backbone.Model.extend({
    index: '',
    name: '',
    dist: '',
    distvname: '',
    author: '',
    version: ''
});

var Modules = Backbone.Collection.extend({
    model: Module
});