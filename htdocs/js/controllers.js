// Controllers used by search.metacpan.org

var Metacpan = Backbone.Controller.extend({

    routes: {
        "":                         "home",
        "/author/:query":           "showauthor",
        "/search/:type/:query":     "search",
        "/showpod/:query":          "showpod",
        "/showsrc/:query":          "showsrc",
        "/dist/:query":             "showdist"
    },

    apiUrl: '/api',

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

        SearchBoxView = new SearchBox();
        SearchBoxView.render();
        ModuleResultsView = new ModuleResults();
        ModuleResultsView.render();
        ModuleDetailsView = new ModuleDetails();
        ModuleDetailsView.render();
        SourceDetailsView = new SourceDetails();
        SourceDetailsView.render();
        AuthorDetailsView = new AuthorDetails();
        AuthorDetailsView.render();
        DistResultsView = new DistResults();
        DistResultsView.render();
        DistDetailsView = new DistDetails();
        DistDetailsView.render();
        HomeView = new Home();
        HomeView.render();

        _.bindAll(this, [ "enableBackButtons" ]);
    },

    home: function() {
        debug("Action: home page");

        document.title = 'Welcome to search.metacpan.org'
        $("#changes").load("/CHANGES");
        this.saveLocation("");
        HomeView.show();
    },

    search: function(type, query) {
        query = unescape(query);
        debug("Action: search");
        debug("Type :  " + type);
        debug("Query:  " + query);

        var my = this;

        document.title = 'Search results for: ' + query + ' - search.metacpan.org';

        SearchBoxView.searchType(type);
        SearchBoxView.updateQuery(query);

        switch(type) {

            case 'module':
                this.saveLocation("/search/module/" + query);
                SearchBoxView.updateTweet();
                SearchBoxView.loader('show');

                if ( ModuleResultsView.current() === query ) {
                    ModuleResultsView.show();
                    SearchBoxView.loader('hide');
                } else {
                    ModuleResultsView.current(query);
                    $(".metacpanView").fadeOut(200);
                    query = query.replace(/::/, " ");
                    $.ajax({
                        url: 'http://0.0.0.0:3000/',
                        type: 'post',
                        processData: false,
                        data: '{ "size": "50", "query": { "field":{"file.documentation.analyzed":"' + query.toLowerCase() + '"}}, "filter":{"term":{"file.status":"latest"}} }',
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
            case 'dist':
                this.saveLocation("/search/dist/" + query);
                SearchBoxView.updateTweet();
                SearchBoxView.loader('show');

                if ( DistResultsView.current() === query ) {
                    DistResultsView.show();
                    SearchBoxView.loader('hide');
                } else {
                    DistResultsView.current(query);
                    $(".metacpanView").fadeOut(200);
                    $.ajax({
                        url: my.apiUrl + '/release/_search',
                        type: 'post',
                        processData: false,
                        data: '{ "size": "500", "query": { "field": { "release.name.analyzed":"' + query.toLowerCase() + '"}}, "filter":{"term":{"status":"latest"}} }',
                        success: function(res) {
                            debug(res);
                            $("#dist_results_table").dataTable().fnClearTable();
                            DistResultsView.update(res, true);
                            SearchBoxView.loader('hide');
                        },
                        error: function(xhr,status,error) {
                            debug(xhr);
                            debug(status);
                            debug(error);
                            $("#dist_results_table").dataTable().fnClearTable()
                            DistResultsView.show();
                            SearchBoxView.loader('hide');
                        }
                    });
                }
                break;
            default:
                debug('<< ' + type + ' >> is not a valid search type.' );
                SearchBoxView.loader('hide');
        
        } 

    },

    showpod: function(query) {
        query = unescape(query);
        debug("Action: showpod");
        debug("Query:  " + query);

        var my = this;

        document.title = query + ' - search.metacpan.org';

        SearchBoxView.searchType('module');
        SearchBoxView.updateQuery(query);

        ModuleDetailsView.show();

        if ( ModuleDetailsView.current() === query ) {
            var fn = (function() { ModuleDetailsView.showPod(); });
            setTimeout(fn, 410);
        } else {
            $.ajax({
                url:  my.apiUrl + '/module/' + query,
                success: function(res) {
                    res["_source"] = res;
                    MetacpanController.saveLocation("/showpod/" + res._source.documentation);
                    SearchBoxView.updateTweet();
                    if ( ModuleDetailsView.current() === res._source.documentation ) {
                        ModuleDetailsView.showPod();
                    } else {
                        ModuleDetailsView.current(res._source.documentation);
                        $.ajax({
                            url: my.apiUrl + '/pod/' + res._source.documentation + '?content-type=text/html',
                            dataType: 'text',
                            success: function(pod) {
                                if ( pod ) {
                                    $.ajax({
                                        url: my.apiUrl + '/author/' + res._source.author,
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
        query = unescape(query);
        debug("Action: showsrc");
        debug("Query:  " + query);

        var my = this;

        document.title = 'Source: ' + query + ' - search.metacpan.org';

        SearchBoxView.searchType('module');
        SearchBoxView.updateQuery(query);

        SourceDetailsView.show();

        if ( SourceDetailsView.current() === query ) {
            var fn = (function() { SourceDetailsView.showSource(); });
            setTimeout(fn, 410);
        } else {
            $.ajax({
                url:  my.apiUrl + '/module/' + query,
                success: function(res) {
                    debug(res);
                    res["_source"] = res;
                    MetacpanController.saveLocation("/showsrc/" + res._source.documentation);
                    SearchBoxView.updateTweet();
                    if ( SourceDetailsView.current() === res._source.documentation ) {
                        SourceDetailsView.showSource();
                    } else {
                        SourceDetailsView.current(res._source.documentation);
                        var url = ["/source", res._source.author, res._source.release, res._source.path].join("/");
                        $.ajax({
                            url: url,
                            dataType: 'text',
                            processData: false,
                            success: function(source) {
                                if ( typeof(source) != 'undefined') {
                                    SourceDetailsView.showSource(source, res._source.author);
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
        query = unescape(query);
        debug("Action: showauthor");
        debug("Query:  " + query);

        var my = this;

        var author = query.toUpperCase();

        document.title = author + ' - search.metacpan.org';

        MetacpanController.saveLocation("/author/" + author);
        SearchBoxView.updateTweet();

        SearchBoxView.searchType('author');
        SearchBoxView.updateQuery(query);

        AuthorDetailsView.show();

        if ( AuthorDetailsView.current() === query ) {
            debug("Author info already retrieved.");
            var fn = (function() { AuthorDetailsView.showAuthor(); });
            setTimeout(fn, 410);
        } else {
            AuthorDetailsView.current(query);
            var fn = (function() {
                $.ajax({
                    url:  my.apiUrl + '/author/' + author,
                    success: function(res) {
                        debug(res);
                        AuthorDetailsView.updateAuthor(res);
                        $.ajax({
                            url: my.apiUrl + '/release/_search',
                            processData: false,
                            type: 'post',
                            data: '{ "query": { "term": { "author": "' + author + '" } }, "filter":{"term":{"status":"latest"}},  "size": 1000 }',
                            success: function(results) {
                                debug('Succeeded dist search for author: ' + author);
                                debug(results);
                                AuthorDetailsView.update(results);
                            },
                            error: function(xhr,status,error) {
                                debug('Failed dist search for author: ' + author);
                                debug(xhr);
                                debug(status);
                                debug(error);
                                AuthorDetailsView.update();
                            }
                        });
                    },
                    error: function(xhr, error, status) {
                        debug('Failed author search for PAUSEID << ' + author + ' >>');
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

    showdist: function(query) {
        query = unescape(query);
        debug("Action: showdist");
        debug("Query:  " + query);

        var my = this;

        document.title = 'Distribution: ' + query + ' - search.metacpan.org';

        MetacpanController.saveLocation("/dist/" + query);
        SearchBoxView.updateTweet();

        SearchBoxView.searchType('dist');
        SearchBoxView.updateQuery(query);

        DistDetailsView.show();

        if ( DistDetailsView.current() === query ) {
            var fn = (function() { DistDetailsView.showDist(); });
            setTimeout(fn, 410);
        } else {
            DistDetailsView.current(query);
            var fn = (function() {
                $.ajax({
                    url: my.apiUrl + '/release/_search',
                    type: 'post',
                    data: '{"size":1,"query":{"term":{"release.name":"' + query + '"}}}',
                    success: function(res) {
                        res = res.hits.hits[0]._source;
                        debug(res);
                        DistDetailsView.updateDist(res);
                        $.ajax({
                            url: my.apiUrl + '/file/_search',
                            type: 'post',
                            processData: false,
                            data: '{ "size": "1000", "query":{"match_all":{}},"filter": { "and":[{"exists":{"field":"file.documentation"}},{"term": { "file.release": "' + query + '" } },{"term": { "file.indexed": true } }] } }',
                            success: function(results) {
                                debug('Succeeded module search for dist: ' + query);
                                debug(results);
                                DistDetailsView.update(results);
                            },
                            error: function(xhr,status,error) {
                                debug('Failed module search for dist: ' + query);
                                debug(xhr);
                                debug(status);
                                debug(error);
                                DistDetailsView.update();
                            }
                        });
                    },
                    error: function(xhr, error, status) {
                        debug('Failed distrbution search for dist: ' + query);
                        debug(xhr);
                        debug(status);
                        debug(error);
                        DistDetailsView.noDist("No distribution info found for << " + query + " >>");
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
