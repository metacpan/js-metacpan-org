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
                $("#module_container").fadeOut(200);
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

function remotePod(module, dist, author) {
    var modulePath = module.replace(/::/g, '/');
    var url = 'http://search.cpan.org/~' + escape(author) + '/' + escape(dist) + '/lib/' + escape(modulePath) + '.pm';
    requestCrossDomain( url, function(resp) {
        var html = resp;
        html = html.replace(/\n/gm, 'metacpan_newline');
        html = html.replace(/^.*<div class="pod">/m, '<div class="pod">');
        html = html.replace(/<div class="footer">.*$/m, '');
        html = html.replace(/metacpan_newline/g, '\n');
        $("#pod_contents").html(html);
        $("#module_container").fadeIn(200);
    });
}

// Accepts a url and a callback function to run.
function requestCrossDomain( site, callback ) {

    // If no url was passed, exit.
    if ( !site ) {
        alert('No site was passed.');
        return false;
    }

    // Take the provided url, and add it to a YQL query. Make sure you encode it!
    var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + site + '"') + '&format=xml&callback=?';

    // Request that YSQL string, and run a callback function.
    // Pass a defined function to prevent cache-busting.
    $.getJSON( yql, cbFunc );

    function cbFunc(data) {
        // If we have something to work with...
        if ( data.results[0] ) {
            // Strip out all script tags, for security reasons.
            // BE VERY CAREFUL. This helps, but we should do more.
            data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
            // If the user passed a callback, and it
            // is a function, call it, and send through the data var.
            if ( typeof callback === 'function') {
                callback(data);
            }
        }
        // Else, Maybe we requested a site that doesn't exist, and nothing returned.
        else if (window.console && window.console.log) {
            console.log('Error: Nothing returned from getJSON.');
            callback('');
        }
    }
}