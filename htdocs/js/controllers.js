// Controllers used by search.metacpan.org

var Workspace = Backbone.Controller.extend({

  routes: {
    "help":                 "help",
    "search/:query":        "search",
    "showpod/:query":       "showpod"
  },
  
  help: function() {
    
  },
  
  search: function(query) {
    
  }

});
