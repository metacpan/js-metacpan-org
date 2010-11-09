// main javascript for search.metacpan.org

function metaSearch(value) {
    if ( value !== '') {
        $.ajax({
            type: 'get',
            url: 'http://api.metacpan.org/module/_search',
            data: { 'q': 'name: "' + value + '"', size: 500 },
            //data: '{ size: 500, query: { term: { name: "' + value + '" } } }',
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
                //$("#paging_container").fadeOut(200);
                $("#results_table").fadeOut(200);
                //$("#search_results").html("");
                $("#search_loader").fadeIn(200);
            },
            success: function(res) {
                //var moduleTemplate = '<div><a href="#" class="name">{{name}}</a><span class="version">{{version}}</span></div><div class="info_container"><a href="#" class="dist">{{distvname}}</a><a href="#" class="author">{{author}}</a></div>';
                //$(res.hits.hits).each(function() {
                //    var view = $.extend({}, this._source);
                //    var module = Mustache.to_html(moduleTemplate, view);
                //    $("<li />").addClass("module_container").html(module).appendTo('#search_results');
                //});
                //$("#paging_container").pajinate({
                //    items_per_page: 10,
                //    num_page_links_to_display: 20
                //}).fadeIn(200);
                var rowData = [];
                $(res.hits.hits).each(function() {
                    rowData.push([
                        this._source.name,
                        this._source.version,
                        this._source.distvname,
                        this._source.author,
                        this._score,
                        '<a href="' + this._source.download_url + '" title="Download Archive" class="ui-state-default" style="width: 16px; height: 16px; border: 0px; margin: 0px; padding: 0px;"><span class="ui-icon ui-icon-disk" style="width: 16px; height: 16px;"></span></a>'
                    ]);
                });

                $("#results_table").dataTable({
                    aaData: rowData,
                    bRetrieve: true
                });
                $("#results_table").fadeIn(200);
                $("#search_loader").fadeOut(200);
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