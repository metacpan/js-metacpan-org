// main javascript for search.metacpan.org

function metaSearch(value) {
    if ( value !== '') {
        $.ajax({
            type: 'get',
            url: 'http://api.metacpan.org/module/_search',
            data: { 'q': 'name:"' + value + '"' },
            //data: '{ size: 15, query: { term: { name: "' + value + '" } } }',
            //data: {
            //    "query": {
            //        "term": {
            //            "name": '"' + value + '"'
            //        }
            //    }
            //},
            dataType: 'json',
            cache: false,
            beforeSend: function() {
                $("#results_container").fadeOut(200);
                $("#search_results").html("");
            },
            success: function(res) {
                var moduleTemplate = '<div><a href="#" class="name">{{name}}</a><span class="version">{{version}}</span></div><div class="info_container"><a href="#" class="dist">{{dist}}</a><span class="distvname">{{distvname}}</span><a href="#" class="author">{{author}}</a></div>';
                $(res.hits.hits).each(function() {
                    var view = $.extend({}, this._source);
                    var module = Mustache.to_html(moduleTemplate, view);
                    //console.log(module);
                    $("<li />").addClass("module_container").html(module).appendTo('#search_results');
                    $("#results_container").fadeIn(200);
                });
            },
            error: function(xhr,status,error) {
                if ( window.console && window.console.log ) {
                    console.log(xhr);
                    console.log(status);
                    console.log(error);
                }
            }
        });
    }  
}