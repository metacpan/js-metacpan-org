// Controllers used by search.metacpan.org

var Metacpan = Backbone.Controller.extend({

    routes: {
        "/author/:query":           "showauthor",
        "/search/:type/:query":     "search",
        "/showpod/:query":          "showpod"
    },

    initialize: function() {
        _.bindAll(this, [ "enableBackButtons" ]);
    },
    
    search: function(type, query) {
        debug("Action: search");
        debug("Type :  " + type);
        debug("Query:  " + query);

        document.title = 'Search results for: ' + query + ' - search.metacpan.org';

        SearchBoxView.searchType(type);

        switch(type) {
        
            case 'module':
                this.saveLocation("/search/module/" +query);
                SearchBoxView.updateQuery(query);
                $.ajax({
                    //type: 'post',
                    url: 'http://api.metacpan.org/module/_search',
                    data: { 'q': 'name: "' + query + '"', size: 1000 },
                    //data: '{ "size": "500", "query": { "term": { "name": "' + module.toLowerCase() + '" } } }',
                    //data: {
                    //    "query": {
                    //        "term": {
                    //            "name": '"' + module + '"'
                    //        }
                    //    }
                    //},
                    beforeSend: function() {
                        $(".metacpanView").fadeOut(200);
                        SearchBoxView.loader('show');
                    },
                    success: function(res) {
                        debug(res);
                        $("#module_results_table").dataTable().fnClearTable();
                        ModuleResultsView.update(res, true);
                        SearchBoxView.loader('hide');
                    },
                    error: function(xhr,status,error) {
                        debug(xhr);
                        debug(status);
                        debug(error);
                        $("#module_results_table").dataTable().fnClearTable()
                        ModuleResultsView.show();
                        SearchBoxView.loader('hide');
                    }
                });
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

        SearchBoxView.searchType('module');

        $.ajax({
            url:  'http://api.metacpan.org/module/' + query,
            beforeSend: function() {
                ModuleDetailsView.reset();
                ModuleDetailsView.show();
            },
            success: function(res) {
                debug(res);
                MetacpanController.saveLocation("/showpod/" + res._source.name);
                $.ajax({
                    url: 'http://api.metacpan.org/pod/' + res._source.name,
                    success: function(pod) {
                        debug(pod);
                        if ( pod.hasOwnProperty('_source') && pod._source.hasOwnProperty('pod') ) {
                            $.ajax({
                                url: 'http://api.metacpan.org/author/' + res._source.author,
                                success: function(author) {
                                    ModuleDetailsView.updatePod(res, pod, author);
                                },
                                error: function() {
                                    ModuleDetailsView.updatePod(module, pod);
                                }
                            });
                        } else {
                            ModuleDetailsView.noPod("no pod could be found for << " + res._source.name + " >>");
                        }
                    },
                    error: function(xhr,status,error) {
                        debug(xhr);
                        debug(status);
                        debug(error);
                        ModuleDetailsView.noPod("no pod could be found for << " + res._source.name + " >>");
                    }
                });
            },
            error: function(xhr, error, status) {
                debug(xhr);
                debug(status);
                debug(error);
                MetacpanController.saveLocation("/showpod/" + query);
                ModuleDetailsView.noPod("no module found for << " + query + " >>");
            }
        });

    },

    showauthor: function(query) {
        debug("Action: showauthor");
        debug("Query:  " + query);

        var author = query.toUpperCase();

        document.title = author + ' - search.metacpan.org';

        SearchBoxView.searchType('author');

        $.ajax({
            url:  'http://api.metacpan.org/author/' + author,
            beforeSend: function() {
                AuthorDetailsView.reset();
                AuthorDetailsView.show();
            },
            success: function(res) {
                debug(res);
                AuthorDetailsView.showAuthor(res);
            },
            error: function(xhr, error, status) {
                debug(xhr);
                debug(status);
                debug(error);
                AuthorDetailsView.noAuthor("no author info found for PAUSEID << " + author + " >>");
            }
        }); 

    },

    enableBackButtons: function() {
        $(".back_button").button({
            icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
            text: false
        }).click(function() {
            history.back()
        });
    }

});
