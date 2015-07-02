var configuration_mdp = function(vid_url) {
    IriSP.libFiles.defaultDir = "../libs";
    IriSP.widgetsDir = "../widgets";
    IriSP.language = "fr";
    var username = "";
    var _metadata = {
        url: "data.json",
        format: 'ldt'
    };
    var local_id = 'annotations-' + document.location.pathname.split('/').reverse()[1];
    var _config = {
        width : '100%',
        container : 'LdtPlayer',
        default_options: {
            metadata: _metadata
        },
        css : 'metadataplayer/LdtPlayer-core.css',
        widgets: [
            {
                type: "SlideVideoPlayer",
                container: "ControlledVideoPlayer",
                video: vid_url,
                width: '100%',
                url_transform: function(n) {
                    var elements = /(.+)\.(\w\w\w)$/.exec(n);
                    var videoname = null;
                    var v = document.createElement("video");
                    if (v && v.canPlayType && v.canPlayType("video/mp4")) {
                        videoname = elements[1] + ".mp4";
                    } else {
                        videoname = elements[1] + ".ogv";
                    }
                    return videoname;
                }
            },
            { type: "Trace",
              url: "http://comin-ocw.org/trace/",
              requestmode: "GET",
              default_subject: "comin"
            },
            { type: "Mediafragment"},
            { type: "Shortcuts"},
            { type: "Slider",
              container: "ControlledVideoPlayer"
            },
            { type: "Controller",
              container: "ControlledVideoPlayer",
              disable_annotate_btn: true,
              always_show_search: true,
              create_quizz_callback: function () {
                  console.log("Quizz callback");
                  $("#QuizzEditContainer").show();
                  _tabs.tabs("option", "active", get_tab_index('#tab-quizz-edit'));
              },
              enable_quizz_toggle: true
            },
            { type: "CreateAnnotation",
              annotation_type: "Contributions",
              minimize_annotation_widget : true,
              pause_on_write: false,
              after_send_timeout: 1500,
              start_visible : true,
              always_visible: true,
              show_slice: false,
              show_arrow: false,
              show_controls: true,
              show_creator_field: false,
              show_title_field: false,
              editable_storage: local_id,
              api_endpoint_template: 'http://comin-ocw.org/devpf/api/annotation/',
              polemics: []
            },
            { type: "MultiSegments",
              annotation_start_minimized: false,
              annotation_show_creator: false,
              segments_show_creator: false,
              show_all: true },
            {
                type: "AnnotationsList",
                container: "SlidesContainer",
                annotation_type: "Slides",
                limit_count: 120,
                show_audio: false,
                show_end_time: false,
                show_controls: false,
                polemics: []
            },
            {
                type: "AnnotationsList",
                container: "TocContainer",
                annotation_type: "Slides",
                limit_count: 120,
                show_audio: false,
                show_end_time: false,
                show_controls: false,
                polemics: []
            }, //
            {
                type: "AnnotationsList",
                container: "ContributionsContainer",
                annotation_type: "Contributions",
                editable: true,
                editable_storage: local_id,
                limit_count: 240,
                show_creator: true,
                show_audio: false,
                show_end_time: false,
                show_controls: false,
                default_thumbnail: 'imagecache/contribution.svg',
                polemics: []
            },
            {
                type: "AnnotationsList",
                container: "QuizzListContainer",
                annotation_type: "Quizz",
			    editable: true,
                show_creator: true,
                show_audio: false,
                show_end_time: false,
                show_controls: false,
                default_thumbnail: 'imagecache/cdlh.svg',
			    is_quizz: true,
			    show_creator: false,
                polemics: []
            },
            { type: "QuizzCreator",
              container: "QuizzEditContainer",
              annotation_type: "Quizz",
              minimize_annotation_widget : true,
              pause_on_write: true,
              after_send_timeout: 1500,
              start_visible : true,
              always_visible: true,
              show_slice: false,
              show_arrow: false,
              show_controls: true,
              show_creator_field: false,
              show_title_field: false,
              editable_storage: local_id,
              api_endpoint_template: 'http://comin-ocw.org/devpf/api/annotation/',
              polemics: []
            },
            {
                type: "Quizz",
                container: "ControlledVideoPlayer",
                annotation_type: "Quizz",
                show_creator: true,
                show_audio: false,
                show_end_time: false,
                show_controls: false,
			    api_endpoint_template: 'http://comin-ocw.org/devpf/api/analytics/',
                polemics: [],
                create_quizz_callback: function () {
                    console.log("Quizz callback");
                    $("#QuizzEditContainer").show();
                    _tabs.tabs("option", "active", get_tab_index('#tab-quizz-edit'));
                }
            },
            {
                type: "NoteTaking",
                container: "NoteTakingContainer",
                editable_storage: "notes-" + local_id
            }
        ]
    };
    _myPlayer = new IriSP.Metadataplayer(_config);
};
