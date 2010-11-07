// main javascript for search.metacpan.org

function metaSearch(value) {
    if ( value !== '') {
        $.ajax({
            url: 'http://api.metacpan.org/module/_search',
            cache: false,
            data: {
                'q': 'name:"' + value + '"'
            },
            beforeSend: function() {
                $("#results_container").fadeOut(200);
                $("#search_results").html("");
            },
            dataType: 'json',
            success: function(res) {
                $(res.hits.hits).each(function() {
                    $("<li />").addClass("search_results").html(this._source.name).appendTo('#search_results');
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