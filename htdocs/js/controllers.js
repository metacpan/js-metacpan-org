// Controllers used by search.metacpan.org

var Metacpan = Backbone.Controller.extend({

    routes: {
        "/author/:query":           "showauthor",
        "/search/:type/:query":     "search",
        "/showpod/:query":          "showpod",
        "/showsrc/:query":          "showsrc"
    },

    initialize: function() {

        $("#main_content a").click(function(e) {
            e.preventDefault;
        });

        $.ajaxSetup({
            cache: false,
            dataType: 'json'
        });

        // some global defaults for the DataTable plugin
        $.extend($.fn.dataTableExt.oJUIClasses, {
            sStripOdd: 'ui-state-active row_overrides',
            sStripEven: 'ui-state-default row_overrides'
        });

        // sets up some persistant cookie variables
        if ( $.cookie('tableDisplayLength') == '' || Number($.cookie('tableDisplayLength')) < 10 ) {
            $.cookie('tableDisplayLength', 10);
        }
        if ( $.cookie('jquery-ui-theme') == '' || $.cookie('jquery-ui-theme') == null ) {
            $.cookie('jquery-ui-theme', 'metaCPAN');
        }

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
                SearchBoxView.updateTweet();

                if ( ModuleResultsView.current() === query ) {
                    ModuleResultsView.show();
                } else {
                    ModuleResultsView.current(query);
                    SearchBoxView.updateQuery(query);
                    $.ajax({
                        url: 'http://api.metacpan.org/module/_search',
                        data: { 'q': 'name: "' + query + '"', size: 1000 },
                        //type: 'post',
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
                }
                break;
            default:
                debug('<< ' + type + ' >> is not a valid search type.' );
        
        } 

    },

    showpod: function(query) {
        debug("Action: showpod");
        debug("Query:  " + query);

        document.title = query + ' - search.metacpan.org';

        SearchBoxView.searchType('module');

        ModuleDetailsView.show();

        if ( ModuleDetailsView.current() === query ) {
            var fn = (function() { ModuleDetailsView.showPod(); });
            setTimeout(fn, 410);
        } else {
            $.ajax({
                url:  'http://api.metacpan.org/module/' + query,
                success: function(res) {
                    debug(res);
                    MetacpanController.saveLocation("/showpod/" + res._source.name);
                    SearchBoxView.updateTweet();
                    if ( ModuleDetailsView.current() === res._source.name ) {
                        ModuleDetailsView.showPod();
                    } else {
                        ModuleDetailsView.current(res._source.name);
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
                                            ModuleDetailsView.updatePod(res, pod);
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
                    }
                },
                error: function(xhr, error, status) {
                    debug(xhr);
                    debug(status);
                    debug(error);
                    if ( ModuleDetailsView.current() === query ) {
                        MetacpanController.saveLocation("/showpod/" + query);
                        SearchBoxView.updateTweet();
                        var fn = (function() { ModuleDetailsView.showPod(); });
                        setTimeout(fn, 205);
                    } else {
                        ModuleDetailsView.current(query);
                        MetacpanController.saveLocation("/showpod/" + query);
                        SearchBoxView.updateTweet();
                        var fn = (function() { ModuleDetailsView.noPod("no module found for << " + query + " >>"); });
                        setTimeout(fn, 205);
                    }
                }
            });
        }

    },

    showsrc: function(query) {
        debug("Action: showsrc");
        debug("Query:  " + query);

        document.title = 'Source: ' + query + ' - search.metacpan.org';

        SearchBoxView.searchType('module');

        SourceDetailsView.show();

        if ( SourceDetailsView.current() === query ) {
            var fn = (function() { SourceDetailsView.showSource(); });
            setTimeout(fn, 410);
        } else {
            $.ajax({
                url:  'http://api.metacpan.org/module/' + query,
                success: function(res) {
                    debug(res);
                    MetacpanController.saveLocation("/showsrc/" + res._source.name);
                    SearchBoxView.updateTweet();
                    if ( SourceDetailsView.current() === res._source.name ) {
                        SourceDetailsView.showSource();
                    } else {
                        SourceDetailsView.current(res._source.name);
                        $.ajax({
                            url: res._source.source_url,
                            dataType: 'text',
                            processData: false,
                            success: function(source) {
                                if ( typeof(source) != 'undefined') {
                                    SourceDetailsView.showSource(source, res._source.author);
                                    $.ajax({
                                        url: 'http://api.metacpan.org/module/_search',
                                        data: { 'q': 'author: "' + res._source.author + '"', size: 1000 },
                                        beforeSend: function() {
                                            $("#author_results_table").dataTable().fnClearTable();
                                        },
                                        success: function(results) {
                                            debug('Succeeded module search for author: ' + res._source.author);
                                            debug(res);
                                            AuthorDetailsView.update(results);
                                        },
                                        error: function(xhr,status,error) {
                                            debug('Failed module search for author: ' + res._source.author);
                                            debug(xhr);
                                            debug(status);
                                            debug(error);
                                        }
                                    });
                                } else {
                                    SourceDetailsView.noSource("no source could be found for << " + res._source.name + " >>");
                                }
                            },
                            error: function(xhr,status,error) {
                                debug('Failed retrieving source:');
                                debug(xhr);
                                debug(status);
                                debug(error);
                                SourceDetailsView.noSource("no source could be found for << " + res._source.name + " >>");
                            }
                        });
                    }
                },
                error: function(xhr, error, status) {
                    debug(xhr);
                    debug(status);
                    debug(error);
                    if ( SourceDetailsView.current() === query ) {
                        MetacpanController.saveLocation("/showsrc/" + query);
                        SearchBoxView.updateTweet();
                        var fn = (function() { SourceDetailsView.showSource(); });
                        setTimeout(fn, 205);
                    } else {
                        SourceDetailsView.current(query);
                        MetacpanController.saveLocation("/showsrc/" + query);
                        SearchBoxView.updateTweet();
                        var fn = (function() { SourceDetailsView.noSource("no module found for << " + query + " >>"); });
                        setTimeout(fn, 205);
                    }
                }
            });
        }

    },

    showauthor: function(query) {
        debug("Action: showauthor");
        debug("Query:  " + query);

        var author = query.toUpperCase();

        document.title = author + ' - search.metacpan.org';

        MetacpanController.saveLocation("/author/" + author);
        SearchBoxView.updateTweet();

        SearchBoxView.searchType('author');
        SearchBoxView.updateQuery(query);

        AuthorDetailsView.show();

        if ( AuthorDetailsView.current() === query ) {
            var fn = (function() { AuthorDetailsView.showAuthor(); });
            setTimeout(fn, 410);
        } else {
            AuthorDetailsView.current(query);
            var fn = (function() {
                $.ajax({
                    url:  'http://api.metacpan.org/author/' + author,
                    success: function(res) {
                        debug(res);
                        AuthorDetailsView.updateAuthor(res);
                        $.ajax({
                            url: 'http://api.metacpan.org/module/_search',
                            data: { 'q': 'author: "' + author + '"', size: 1000 },
                            success: function(results) {
                                debug('Succeeded module search for author: ' + author);
                                debug(res);
                                AuthorDetailsView.update(results);
                            },
                            error: function(xhr,status,error) {
                                debug('Failed module search for author: ' + author);
                                debug(xhr);
                                debug(status);
                                debug(error);
                                AuthorDetailsView.update();
                            }
                        });
                    },
                    error: function(xhr, error, status) {
                        debug(xhr);
                        debug(status);
                        debug(error);
                        AuthorDetailsView.noAuthor("no author info found for PAUSEID << " + author + " >>");
                    }
                });  
            });
            setTimeout(fn, 410);
        }

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
