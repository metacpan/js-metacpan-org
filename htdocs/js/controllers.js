// Controllers used by search.metacpan.org

var Metacpan = Backbone.Controller.extend({

    routes: {
        "/search/:type/:query":     "search",
        "/showpod/:query":          "showpod"
    },

    initialize: function() {
        _.bindAll(this, [ "hideViews", "showPod", "moduleSearch" ]);
    },
    
    search: function(type, query) {
        debug("Action: search");
        debug("Type :  " + type);
        debug("Query:  " + query);

        document.title = 'Search results for: ' + query + ' - search.metacpan.org';

        this.hideViews();

        SearchBoxView.searchType(type);

        switch(type) {
        
            case 'module':
                this.moduleSearch(query);
                break;
            case 'author':
                //this.authorSearch(query);
                this.saveLocation("/search/author/" + query);
                SearchBoxView.updateQuery(query);
                AuthorResultsView.show();
                break;
            default:
                debug('"' + type + '" is not a valid search type.' );
        
        }
        
    },

    showpod: function(query) {
        debug("Action: showpod");
        debug("Query:  " + query);

        document.title = query + ' - search.metacpan.org';

        this.hideViews();

        $.ajax({
            url:  'http://api.metacpan.org/module/' + query,
            beforeSend: function() {
                ModuleDetailsView.resetPod();
                ModuleDetailsView.show();
            },
            success: function(res) {
                MetacpanController.showPod(res._source.name);
            },
            error: function(xhr, error, status) {
                debug(xhr);
                debug(status);
                debug(error);
                ModuleDetailsView.noPod("no module named << " + query + " >> could be found.");
            }
        });

    },
    
    showPod: function(module) {
        this.saveLocation("/showpod/" + module);
        $.ajax({
            url: 'http://api.metacpan.org/pod/' + module,
            beforeSend: function() {
                ModuleDetailsView.resetPod();
                ModuleDetailsView.show();
            },
            success: function(res) {
                debug(res);
                if ( res.hasOwnProperty('_source') && res._source.hasOwnProperty('pod') ) {
                    var podHTML = res._source.pod;
                    
                    // /some interim formatting until we clean up the formatted
                    // pod stored in ElasticSearch
                    podHTML = podHTML.replace('<html>', '');
                    podHTML = podHTML.replace('</html>', '');
                    podHTML = podHTML.replace('<head>', '');
                    podHTML = podHTML.replace('</head>', '');
                    podHTML = podHTML.replace('<body>', '');
                    podHTML = podHTML.replace('</body>', '');
                    podHTML = podHTML.replace('<title>', '');
                    podHTML = podHTML.replace('</title>', '');
                    podHTML = podHTML.replace(/<meta.* \/>/, '');
                    podHTML = podHTML.replace(/<link.* \/>/, '');
                    podHTML = podHTML.replace('<div style="height:50px">&nbsp;</div>', '');

                    ModuleDetailsView.updatePod(podHTML);

                } else {
                    ModuleDetailsView.noPod("no pod could be found.");
                }
            },
            error: function(xhr,status,error) {
                debug(xhr);
                debug(status);
                debug(error);
                ModuleDetailsView.noPod("no pod could be found.");
            }
        });
    },

    moduleSearch: function(module) {
        if ( module !== '') {
            this.saveLocation("/search/module/" + module);
            SearchBoxView.updateQuery(module);
            $.ajax({
                //type: 'post',
                url: 'http://api.metacpan.org/module/_search',
                data: { 'q': 'name: "' + module + '"', size: 1000 },
                //data: '{ "size": "500", "query": { "term": { "name": "' + module.toLowerCase() + '" } } }',
                //data: {
                //    "query": {
                //        "term": {
                //            "name": '"' + module + '"'
                //        }
                //    }
                //},
                beforeSend: function() {
                    MetacpanController.hideViews($("#module_results_table").dataTable().fnClearTable());
                    ModuleDetailsView.resetPod();
                    $("#search_loader").fadeIn(200);
                },
                success: function(res) {
                    debug(res);
                    ModuleResultsView.update(res, true);
                    $("#search_loader").fadeOut(200);
                },
                error: function(xhr,status,error) {
                    debug(xhr);
                    debug(status);
                    debug(error);
                    ModuleResultsView.show();
                    $("#search_loader").fadeOut(200);
                }
            });
        }  
    },

    hideViews: function(callback) {
        $(".metacpanView").fadeOut(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    }

});
