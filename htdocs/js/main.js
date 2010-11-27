// main javascript for search.metacpan.org

function debug(data) {
    if (window.console && window.console.log) {
        console.log(data);
    }
}

// does a search on module name through ElasticSearch
function metaSearch(value) {
    if ( value !== '') {
        $.ajax({
            type: 'get',
            //type: 'post',
            url: 'http://api.metacpan.org/module/_search',
            data: { 'q': 'name: "' + value + '"', size: 1000 },
            //data: '{ "size": "500", "query": { "term": { "name": "' + value.toLowerCase() + '" } } }',
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

// retrieves and displays the podf from ElasticSearch for a module
function showPod(module) {
    $.ajax({
            type: 'get',
            //type: 'post',
            url: 'http://api.metacpan.org/pod/' + module,
            dataType: 'json',
            cache: false,
            beforeSend: function() {
                $("#pod_contents").html('');
                $("#module_container").fadeIn(200);
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

                    $("#pod_contents").html(podHTML).wrapInner('<div class="pod" />');
                    $("#pod_contents a").filter(function() {
                        var href = $(this).attr('href');
                        var http = /^http:\/\//;
                        var anchor = /^#/;
                        var mailto = /^mailto:/;
                        return ( http.exec(href) || anchor.exec(href) || mailto.exec(href) ) ? 0 : 1;
                    }).map(function() {
                        $(this).attr('href', '/?action=showPod&value=' + $(this).attr('href'));
                    });
                    $("#pod_contents pre").each(function(i, e) {
                        $(this).addClass("language-perl");
                        $(this).wrapInner('<code class="language-perl" />');
                        hljs.highlightBlock(e, '    ');
                    });
                    $("#pod_loader").fadeOut(200, function() {
                        $("#pod_contents").fadeIn(200);
                    });
                } else {
                    $("#pod_loader").fadeOut(200, function() {
                        $("#no_pod").fadeIn(200);
                    });
                }
            },
            error: function(xhr,status,error) {
                debug(xhr);
                debug(status);
                debug(error);
                $("#pod_loader").fadeOut(200, function() {
                    $("#no_pod").fadeIn(200);
                });
            }
    });
}
