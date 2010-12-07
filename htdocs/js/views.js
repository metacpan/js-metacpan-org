// Views used by search.metacpan.org

var ModuleResults = Backbone.View.extend({

    id: "module_results",

    tagName: "div",

    className: "metacpanView",

    el: $("#module_results"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide", "update", "current" ]);
    },

    events: {
        "click #module_results_table tbody tr": "showpod",
        "hover #module_results_table tbody tr.ui-state-active": "hover",
        "hover #module_results_table tbody tr.ui-state-default": "hover"
    },

    render: function() {
        this.el.append(ich.resultsTable({ id: "module_results_table" }));
        
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
        window.location = '/#/showpod/' + $(row.currentTarget).find('td:first-child div').attr('title');
    },

    // toggles row class when hovering
    hover: function(row) {
        $(row.currentTarget).toggleClass('ui-state-highlight');
    },

    // fades the view in
    show: function() {
        $(".metacpanView").fadeOut(200);
        setTimeout(function() { $("#module_results").fadeIn(200); }, 200);
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
                '<div class="cell_contents" title="' + this._score + '" style="width: 86px;">' + Number(this._score) + '</div>'
            ]);
        });
        var temp = $("#module_results_table").dataTable().fnAddData(rowData);

        if (show) {
            this.show();
        }
    },

    currentModule: '',

    current: function(module) {
        if ( typeof(module) != 'undefined' ) {
            this.currentModule = module;
        }
        return this.currentModule;
    }

});

var ModuleDetails = Backbone.View.extend({

    id: "module_details",

    tagName: "div",

    className: "metacpanView",

    el: $("#module_details"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide", "updatePod", "noPod", "showPod", "current" ]);
    },

    render: function() {
        this.el.append(ich.moduleDetailsView());
        //$(".toggle_pod_source").button().click(function() {
        //    if ( $("#pod_contents:visible").length ) {
        //        $("#pod_contents").fadeOut(200, function() {
        //            $("#source_contents").fadeIn(200);
        //        });
        //    } else {
        //        $("#source_contents").fadeOut(200, function() {
        //            $("#pod_contents").fadeIn(200);
        //        });
        //    }
        //});
    },

    // fades the view in
    show: function() {
        $(".metacpanView").fadeOut(200);
        var fn = (function() {
            $("#module_view_contents").hide();
            $("#module_view_loader").show();
            $("#module_details").fadeIn(200);
        });
        setTimeout(fn, 205);
    },

    updatePod: function(module, pod, author) {
        $("#module_view_contents").fadeOut(200, function() {
            $(this).html(ich.podView({
                author: module._source.author,
                authorName: author._source.name,
                distvname: module._source.distvname,
                email: author._source.email,
                //fbLike: '<fb:like href="http://search.metacpan.org/#/showpod/' + encodeURIComponent(module._source.name) + '" show_faces="true" width="300" font="trebuchet ms"></fb:like>',
                gravatar: author._source.gravatar_url,
                name: module._source.name,
                podHTML: pod._source.pod,
                release_date: module._source.release_date.substr(0,10)
            }));
            //$("meta[property=og:title]").attr("content", module._source.name);
            //$("meta[property=og:url]").attr("content", 'http://search.metacpan.org/#/showpod/' + encodeURIComponent(module._source.name));
            //FB.XFBML.parse($("div#fb_box").get(0));
            $("#pod_html a.moduleLink").map(function() {
                $(this).attr('href', '/#/showpod/' + $(this).attr('href'));
            });
            $("#pod_html pre").each(function(i, e) {
                $(this).addClass("language-perl");
                $(this).wrapInner('<code />');
                hljs.highlightBlock(e, '    ');
            });
            $("#module_view_loader").hide();
        }).fadeIn(205);
    },

    noPod: function(message) {
        $("#module_view_loader").fadeOut(200, function() {
            $("#module_view_contents").fadeOut(200).html(ich.error({ message: message })).fadeIn(200);            
        });
    },

    showPod: function() {
        $("#module_view_loader").fadeOut(200, function() {
            $("#module_view_contents").fadeIn(200);
        });
    },

    currentModule: '',

    current: function(module) {
        if ( typeof(module) != 'undefined' ) {
            this.currentModule = module;
        }
        return this.currentModule;
    }

});

var SearchBox = Backbone.View.extend({

    id: "search_box",

    tagName: "div",

    el: $("#search_box"),

    initialize: function() {
        _.bindAll(this, [ "render", "updateQuery", "searchType", "loader" ]);
    },

    render: function() {
        this.el.append(ich.searchBox());

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
    },
    
    loader: function(action) {
        var loader = $("#search_loader");

        switch(action) {

            case 'show':
                loader.fadeIn(200);
                break;

            case 'hide':
                loader.fadeOut(200);
                break;

            default:
                debug('Invalid action passed to SearchBoxView.loader');

        }

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
        //this.el.append(ich.resultsTable({ id: "author_results_table" }));
    },

    // fades the view in
    show: function() {
        $(".metacpanView").fadeOut(200);
        setTimeout(function() { $("#author_results").fadeIn(200); }, 200);
    }

});

var AuthorDetails = Backbone.View.extend({

    id: "author_details",

    tagName: "div",

    className: "metacpanView",

    el: $("#author_details"),

    initialize: function() {
        _.bindAll(this, [ "render", "show", "hide", "updateAuthor", "showAuthor", "noAuthor", "current" ]);
    },

    render: function() {
        this.el.html(ich.authorView());
    },

    updateAuthor: function(author) {
        $("#author_view_contents").fadeOut(200, function() {
            $(this).html(ich.authorDetails({
                pauseid: author._source.pauseid,
                authorDir: author._source.author_dir,
                authorName: author._source.name,
                email: author._source.email,
                githubName: author._source.github_username,
                gravatar: author._source.gravatar_url,
                irc_nick: author._source.irc_nick,
                linkedinProfile: author._source.linkedin_public_profile,
                perlmonksName: author._source.perlmonks_username,
                stackoverflowProfile: author._source.stackoverflow_public_profile,
                twitterName: author._source.twitter_username
            }));
            $("#author_view_loader").hide();
        }).fadeIn(205);
    },

    noAuthor: function(message) {
        $("#author_view_loader").fadeOut(200, function() {
            $("#author_view_contents").fadeOut(200).html(ich.error({ message: message })).fadeIn(200);            
        })
    },
    
    showAuthor: function() {
        $("#author_view_loader").fadeOut(200, function() {
            $("#author_view_contents").fadeIn(200);
        });
    },

    // fades the view in
    show: function() {
        $(".metacpanView").fadeOut(200);
        var fn = (function() {
            $("#author_view_contents").hide();
            $("#author_view_loader").show();
            $("#author_details").fadeIn(200);
        });
        setTimeout(fn, 205);
    },

    currentAuthor: '',

    current: function(author) {
        if ( typeof(author) != 'undefined' ) {
            this.currentAuthor = author;
        }
        return this.currentAuthor;
    }

});