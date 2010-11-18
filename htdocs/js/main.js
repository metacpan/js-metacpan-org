// main javascript for search.metacpan.org

function debug(data) {
    if (window.console && window.console.log) {
        console.log(data);
    }
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
        else {
            debug('Error: Nothing returned from getJSON.');
            callback('');
        }
    }

    // Request that YSQL string, and run a callback function.
    // Pass a defined function to prevent cache-busting.
    $.getJSON( yql, cbFunc );

}

function metaSearch(value) {
    if ( value !== '') {
        $.ajax({
            type: 'get',
            url: 'http://api.metacpan.org/module/_search',
            data: { 'q': 'name: "' + value + '"', size: 1000 },
            //data: '{ "size": "500", "query": { "term": { "name": "' + value + '" } } }',
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
                $("#module_container").fadeOut(200, function() {
                    $("#pod_contents").show();
                    $("#pod_loader").show();
                    $("#source_contents").hide();
                    $("#no_pod").hide();
                });
                $("#module_results_table").dataTable().fnClearTable();
                $("#search_loader").fadeIn(200);
            },
            success: function(res) {
                debug(res);
                var rowData = [];
                $(res.hits.hits).each(function() {
                    rowData.push([
                        
                        '<div class="cell_contents" title="' + this._source.name + '" style="width: 219px;">' + this._source.name + '</div>',
                        '<div class="cell_contents" title="' + this._source.version + '" style="width: 68px;">' + this._source.version + '</div>',
                        '<div class="cell_contents" title="' + this._source.release_date.substr(0,10) + '" style="width: 68px;">' + this._source.release_date.substr(0,10) + '</div>',
                        '<div class="cell_contents" title="' + this._source.distvname + '" style="width: 187px;">' + this._source.distvname + '</div>',
                        '<div class="cell_contents" title="' + this._source.author + '" style="width: 126px;"><a href="http://api.metacpan.org/author/' + this._source.author + '">' + this._source.author + '</a></div>',
                        '<div class="cell_contents" title="' + this._score + '" style="width: 86px;">' + this._score + '</div>'
                    ]);
                });
                $("#module_results_table").dataTable().fnAddData(rowData);
                $("#results_container").fadeIn(200);
                $("#search_loader").fadeOut(200);
            },
            error: function(xhr,status,error) {
                debug(xhr);
                debug(status);
                debug(error);
                $("#results_container").fadeIn(200);
                $("#search_loader").fadeOut(200);
            }
        });
    }  
}

function remotePod(module, dist, author) {
    var modulePath = module.replace(/::/g, '/');
    var url = 'http://search.cpan.org/~' + escape(author) + '/' + escape(dist) + '/lib/' + escape(modulePath) + '.pm';
    debug('Remote pod URL: ' + url);
    $("#pod_contents, #source_contents").html('');
    requestCrossDomain( url, function(resp) {
        if ( resp !== '' ) {
            var html = resp;
            html = html.replace(/\n/gm, 'metacpan_newline');
            html = html.replace(/^.*<div class="pod">/m, '<div class="pod">');
            html = html.replace(/<div class="footer">.*$/m, '');
            html = html.replace(/metacpan_newline/g, '\n');
            html = html.replace('<div class="pod">', '<a name="___top" /><div class="pod">');
            $("#pod_contents").html(html);
            if ( $("#pod_contents").html() !== '' ) {
                $("#pod_contents pre").each(function() {
                    $(this).replaceWith('<code class="highlight" style="padding: 10px;">' + $(this).html() + '</code>');
                });
                $("#pod_contents").syntaxHighlight();
                var srcUrl = 'http://cpansearch.perl.org/src/' + escape(author) + '/' + escape(dist) + '/lib/' + escape(modulePath) + '.pm';
                var srcFunc = (function(srcResp) {
                    if ( srcResp !== '' ) {
                        debug('Remote source URL: ' + srcUrl);
                        var src = srcResp.query.results.body.p;
                        if ( typeof(src) == 'object') {
                            src = src.join('');
                        }
                        src = src.replace(/^\n/gm, 'meta_newline');
                        //src = src.replace(/\n/gm, ' ');
                        src = src.replace(/;/gm, ';\n');
                        //src = src.replace(/{/gm, '{\n');
                        //src = src.replace(/}/gm, '}\n');
                        src = src.replace(/meta_newline/gm, '\n');
                        $("#source_contents").html(src);
                        $("#source_contents").wrapInner('<code class="highlight" style="padding: 10px;   white-space: pre;" />').syntaxHighlight();
                    }
                });
                var yql = 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + srcUrl + '"') + '&format=json&callback=?';
                $.getJSON( yql, srcFunc );
            }
            $("#pod_loader").fadeOut(200, function() {
                $("#pod_container").fadeIn(200);
            });
        } else {
            $("#pod_loader").fadeOut(200, function() {
                $("#no_pod").fadeIn(200);
            });
        }
    });
}
