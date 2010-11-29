// Views used by search.metacpan.org

var ModuleResults = Backbone.View.extend({

    id: "module_results",

    tagName: "div",

    className: "metacpanView",

    el: $("#module_results"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide", "update" ]);
    },

    events: {
        "click #module_results_table tbody tr": "showpod",
        "hover #module_results_table tbody tr.ui-state-active": "hover",
        "hover #module_results_table tbody tr.ui-state-default": "hover"
    },

    render: function() {
        $(this.el).append(ich.resultsTable({ id: "module_results_table" }));
        
        $("#module_results_table").dataTable({
            aoColumns: [
                { sTitle: '<div class="cell_contents" title="Sort by Module Name" style="width: 219px;">Module</div>', sWidth: '219px' },
                { sTitle: '<div class="cell_contents" title="Sort by Version" style="width: 68px;">Version</div>', sWidth: '68px', bSearchable: false },
                { sTitle: '<div class="cell_contents" title="Sort by Release Date" style="width: 68px;">Date</div>', sWidth: '68px' },
                { sTitle: '<div class="cell_contents" title="Sort by Distribution Name" style="width: 187px;">Distribution</div>', sWidth: '187px' },
                { sTitle: '<div class="cell_contents" title="Sort by Author ID" style="width: 126px;">Author</div>', sWidth: '126px' },
                { sTitle: '<div class="cell_contents" title="Sort by Search Score" style="width: 86px;">Score</div>', sWidth: '86px', bSearchable: false }
            ],
            aaSorting: [[ 5, "desc" ]],
            bAutoWidth: false,
            bJQueryUI: true,
            fnDrawCallback: function() {
                var settings = $("#module_results_table").dataTable().fnSettings();
                if ( $.cookie('tableDisplayLength') !== settings._iDisplayLength ) {
                    $.cookie('tableDisplayLength', settings._iDisplayLength);
                }
                $(".cell_contents:visible").textOverflow();
            },
            iDisplayLength: Number($.cookie('tableDisplayLength')),
            sPaginationType: 'full_numbers',
            oLanguage: {
                sSearch: 'Filter:'
            }
        });
    },

    // shows the pod when clicking on a row
    showpod: function(row) {
        var module = $(row.currentTarget).find('td:first-child').text();
        this.hide(MetacpanController.showPod(module));
    },

    // toggles row class when hovering
    hover: function(row) {
        $(row.currentTarget).toggleClass('ui-state-highlight');
    },

    // fades the view in
    show: function(callback) {
        $(this.el).fadeIn(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

    // fades the view out
    hide: function(callback) {
        $(this.el).fadeOut(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

    // updates the module results table
    update: function(res, show) {
        var rowData = [];
        $(res.hits.hits).each(function() {
            rowData.push([
                '<div class="cell_contents" title="' + this._source.name + '" style="width: 219px;">' + this._source.name + '</div>',
                '<div class="cell_contents" title="' + this._source.version + '" style="width: 68px;">' + this._source.version + '</div>',
                '<div class="cell_contents" title="' + this._source.release_date.substr(0,10) + '" style="width: 68px;">' + this._source.release_date.substr(0,10) + '</div>',
                '<div class="cell_contents" title="' + this._source.distvname + '" style="width: 187px;">' + this._source.distvname + '</div>',
                '<div class="cell_contents" title="' + this._source.author + '" style="width: 126px;">' + this._source.author + '</div>',
                '<div class="cell_contents" title="' + this._score + '" style="width: 86px;">' + this._score + '</div>'
            ]);
        });
        $("#module_results_table").dataTable().fnAddData(rowData);
        if (show) {
            this.show();
        }
    }

});

var ModuleDetails = Backbone.View.extend({

    id: "module_details",

    tagName: "div",

    className: "metacpanView",

    el: $("#module_details"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide", "updatePod", "noPod", "resetPod" ]);
    },

    render: function() {
        $(this.el).append(ich.moduleDetailsView());
        $(".back_to_results").button({
            icons: { primary: 'ui-icon-arrowreturnthick-1-w' },
            text: false
        }).click(function() {
            history.back()
            //ModuleDetailsView.hide(
            //    ModuleResultsView.show((function() {
            //        $("#pod_contents").hide();
            //        $("#pod_loader").show();
            //        $("#source_contents").hide();
            //        $("#no_pod").hide();
            //    }))
            //);
        });
    },

    // fades the view in
    show: function(callback) {
        $(this.el).fadeIn(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

    // fades the view out
    hide: function(callback) {
        $(this.el).fadeOut(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

    updatePod: function(podHTML) {
        $("#pod_contents").html(podHTML).wrapInner('<div class="pod" />');
        $("#pod_contents a").filter(function() {
            var href = $(this).attr('href');
            var http = /^http:\/\//;
            var anchor = /^#/;
            var mailto = /^mailto:/;
            return ( http.exec(href) || anchor.exec(href) || mailto.exec(href) ) ? 0 : 1;
        }).map(function() {
            $(this).attr('href', '/#/showpod/' + $(this).attr('href'));
        });
        $("#pod_contents pre").each(function(i, e) {
            $(this).addClass("language-perl");
            $(this).wrapInner('<code />');
            hljs.highlightBlock(e, '    ');
        });
        $("#pod_loader").fadeOut(200, function() {
            $("#pod_contents").fadeIn(200);
        });
    },

    noPod: function(message) {
        $("#pod_loader").fadeOut(200, function() {
            $("#pod_error").text(message);
            $("#no_pod").fadeIn(200);
        });  
    },

    resetPod: function() {
        $("#no_pod").hide();
        $("#pod_contents").html('');
        $("#pod_loader").fadeIn(200);
    }

});

var SearchBox = Backbone.View.extend({

    id: "search_box",

    tagName: "div",

    el: $("#search_box"),

    initialize: function() {
        _.bindAll(this, [ "render", "updateQuery", "searchType" ]);
    },

    render: function() {
        $(this.el).append(ich.searchBox());

        // initializes the theme switcher
        $('#switcher').themeswitcher();

        $("#search_input").keypress(function(e) {
            if (e.which == 13 ) {
                e.preventDefault;
                MetacpanController.search($("input[name='search_type']:checked").val(), $(this).val());
            }
        });

        $("#search_button").button().click(function() {
            MetacpanController.search($("input[name='search_type']:checked").val(), $("#search_input").val());
        });
        $("#search_type").buttonset();
    },

    updateQuery: function(query) {
        $("#search_input").val(query);
    },

    searchType: function(type) {
        $("#type_" + type).attr('checked', true);
        $("#type_" + type).button('refresh');
    }

});

var AuthorResults = Backbone.View.extend({

    id: "author_results",

    tagName: "div",

    className: "metacpanView",

    el: $("#author_results"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide" ]);
    },

    render: function() {
        //$(this.el).append(ich.resultsTable({ id: "author_results_table" }));
    },

    // fades the view in
    show: function(callback) {
        $(this.el).fadeIn(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

    // fades the view out
    hide: function(callback) {
        $(this.el).fadeOut(200, function() {
            if (typeof(callback) != 'undefined' ) {
                callback();
            }
        });
    },

});