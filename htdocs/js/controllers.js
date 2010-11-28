// Controllers used by search.metacpan.org

var Workspace = Backbone.Controller.extend({

  routes: {
    "search/:query":        "search",
    "showpod/:query":       "showpod"
  },
  
  search: function(query) {
    
  }

});
