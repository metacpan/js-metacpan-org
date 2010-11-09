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
                $("#results_container").fadeOut(200);
                $("#search_loader").fadeIn(200);
            },
            success: function(res) {
                var rowData = [];
                $(res.hits.hits).each(function() {
                    rowData.push([
                        
                        '<div class="cell_contents" title="' + this._source.name + '" style="width: 219px;">' + this._source.name + '</div>',
                        '<div class="cell_contents" title="' + this._source.version + '" style="width: 68px;">' + this._source.version + '</div>',
                        '<div class="cell_contents" title="' + this._source.release_date.substr(0,10) + '" style="width: 68px;">' + this._source.release_date.substr(0,10) + '</div>',
                        '<div class="cell_contents" title="' + this._source.distvname + '" style="width: 187px;">' + this._source.distvname + '</div>',
                        '<div class="cell_contents" title="' + this._source.author + '" style="width: 126px;">' + this._source.author + '</div>',
                        '<div class="cell_contents" title="' + this._source._score + '" style="width: 86px;">' + this._score + '</div>'
                    ]);
                });
                $("#results_table").dataTable().fnClearTable();
                $("#results_table").dataTable().fnAddData(rowData);
                $("#results_container").fadeIn(200);
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