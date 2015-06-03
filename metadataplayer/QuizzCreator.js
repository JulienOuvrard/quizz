/* TODO: Add Social Network Sharing */

IriSP.Widgets.QuizzCreator = function(player, config) {
    var _this = this;
    IriSP.Widgets.Widget.call(this, player, config);
};

IriSP.Widgets.QuizzCreator.prototype = new IriSP.Widgets.Widget();

IriSP.Widgets.QuizzCreator.prototype.defaults = {
    show_title_field : true,
    show_creator_field : true,
    start_visible : true,
    always_visible : false,
    show_slice : true,
    show_controls: false,
    show_arrow : true,
    show_mic_record: false,
    show_mic_play: false,
    minimize_annotation_widget : true,
    creator_name : "",
    creator_avatar : "",
    tags : false,
    tag_titles : false,
    pause_on_write : true,
    max_tags : 8,
    polemics : [{
        keyword: "++",
        background_color: "#00a000",
        text_color: "#ffffff"
    },{
        keyword: "--",
        background_color: "#c00000",
        text_color: "#ffffff"
    },{
        keyword: "??",
        background_color: "#0000e0",
        text_color: "#ffffff"
    },{
        keyword: "==",
        background_color: "#f0e000",
        text_color: "#000000"
    }],
    slice_annotation_type: "chap",
    annotation_type: "Quizz",
    api_serializer: "ldt_annotate",
    api_endpoint_template: "",
    api_method: "POST",
    // Id that will be used as localStorage key
    editable_storage: "",
    after_send_timeout: 0,
    close_after_send: true,
    tag_prefix: "#",
    slice_widget: null
};

IriSP.Widgets.QuizzCreator.prototype.messages = {
    en: {
        from_time: "from",
        to_time: "to",
        at_time: "at",
        submit: "Submit",
        add_keywords_: "Add keywords:",
        add_polemic_keywords_: "Add polemic attributes :",
        your_name_: "Your name:",
        annotate_video: "New note",
        type_title: "Annotation title",
        type_description: "Enter a new note...",
        wait_while_processing: "Please wait while your annotation is being processed...",
        error_while_contacting: "An error happened while contacting the server. Your annotation has not been saved.",
        annotation_saved: "Thank you, your annotation has been saved.",
        share_annotation: "Would you like to share it on social networks ?",
        close_widget: "Hide the annotation form",
        "polemic++": "Agree",
        "polemic--": "Disagree",
        "polemic??": "Question",
        "polemic==": "Reference",
        "in_tooltip": "Set begin time to current player time",
        "out_tooltip": "Set begin time to current player time",
        "play_tooltip": "Play the fragment"
    },
    fr: {
        from_time: "de",
        to_time: "à",
        at_time: "à",
        submit: "Envoyer",
        add_keywords_: "Ajouter des mots-clés\u00a0:",
        add_polemic_keywords_: "Ajouter des attributs polémiques\u00a0:",
        your_name_: "Votre nom\u00a0:",
        annotate_video: "Entrez une nouvelle note...",
        type_title: "Titre de l'annotation",
        type_description: "Prenez vos notes...",
        wait_while_processing: "Veuillez patienter pendant le traitement de votre annotation...",
        error_while_contacting: "Une erreur s'est produite en contactant le serveur. Votre annotation n'a pas été enregistrée.",
        annotation_saved: "Merci, votre annotation a été enregistrée.",
        share_annotation: "Souhaitez-vous la partager sur les réseaux sociaux ?",
        close_widget: "Cacher le formulaire de création d'annotations",
        "polemic++": "Accord",
        "polemic--": "Désaccord",
        "polemic??": "Question",
        "polemic==": "Référence",
        "in_tooltip": "Utiliser le temps courant comme début",
        "out_tooltip": "Utiliser le temps courant comme fin",
        "play_tooltip": "Jouer le fragment"
    }
};

IriSP.Widgets.QuizzCreator.prototype.template =
	  '<div class="Ldt-QuizzCreator-Ui Ldt-TraceMe">'
	+	'<div class="Ldt-QuizzCreator-Question-Form">'
	+		'<textarea class="Ldt-QuizzCreator-Question-Area" style="width:calc(100% - 20px);" placeholder="Votre question"></textarea><br />'
	+		'<textarea class="Ldt-QuizzCreator-Resource-Area" style="width:calc(100% - 20px);" placeholder="Ressources (lien vers une image, etc.)"></textarea><br />'
	+	'</div>'
	+		'<p>Type de question : '
	+ 		'<select name="type" class="Ldt-QuizzCreator-Question-Type">'
	+			'<option value="unique_choice">Choix unique</option>'
	+			'<option value="multiple_choice">Choix multiple</option>'
	+		'</select>'
	+		' à <input type="text" placeholder="hh:mm:ss" size="6" class="Ldt-QuizzCreator-Time" /><button class="Ldt-QuizzCreator-Question-Save">Sauvegarder</button></p>'
	+ 	'<div class="Ldt-QuizzCreator-Questions-Block">'
	+ 	'</div>'
	+	'<div><button class="Ldt-QuizzCreator-Question-Add">Ajouter une réponse</button></div>'
	+ '</div>';

IriSP.Widgets.QuizzCreator.prototype.hmsToSecondsOnly = function(str) {
    var p = str.split(':'),
        s = 0, m = 1;

    while (p.length > 0) {
        s += m * parseInt(p.pop(), 10);
        m *= 60;
    }

    return s;
}

/* Hide and clear the interface is case of someone skipped or answer the current question in the Quizz panel*/
IriSP.Widgets.QuizzCreator.prototype.skip = function() {
	$(".Ldt-QuizzCreator-Time").val("");
	$(".Ldt-QuizzCreator-Question-Area").val("");
	$(".Ldt-QuizzCreator-Resource-Area").val("");
	$(".Ldt-QuizzCreator-Questions-Block").html("");
}

IriSP.Widgets.QuizzCreator.prototype.reloadAnnotations = function() {

    var _annotations = this.getWidgetAnnotations().sortBy(function(_annotation) {
        return _annotation.begin;
    });

	var _this = this;
	var flag = 1;

    _annotations.forEach(function(_a) {
		_a.on("enter", function() {
            _this.addQuestion(_a, flag++);
        });
    });

}

IriSP.Widgets.QuizzCreator.prototype.draw = function() {
	
    this.reloadAnnotations();

	var _this = this;

    this.onMediaEvent("timeupdate", function(_time) {
    	_this.setBegin(_time);
    });

	this.onMdpEvent("QuizzCreator.show", function() {
		console.log("[QuizzCreator] show at " + _this.media.currentTime);
		$("#QuizzEditContainer").show();
		_this.setBegin(_this.media.currentTime);
    });

	this.onMdpEvent("QuizzCreator.create", function() {
		console.log("[QuizzCreator] create at " + _this.media.currentTime);
		$("#QuizzEditContainer").show();
		_this.skip();
		_this.setBegin(_this.media.currentTime);
    });

	this.onMdpEvent("QuizzCreator.hide", function() {
		$("#QuizzEditContainer").hide();
	});

    this.onMdpEvent("QuizzCreator.skip", function() {
		console.log("[Quizz] skipped");
		_this.skip();
    });

    this.begin = new IriSP.Model.Time();
    this.end = this.source.getDuration();
	this.answers = [];

    this.renderTemplate();
   
	/* Quizz creator */
	this.nbQuestions = 0;

	this.question = new IriSP.Widgets.UniqueChoiceQuestion();

	//	alert(this.question.renderTemplate(null, 1));
	this.$.find(".Ldt-QuizzCreator-Question-Type").bind("change", this.functionWrapper("onQuestionTypeChange"));
	this.$.find(".Ldt-QuizzCreator-Question-Add").bind("click", this.functionWrapper("onQuestionAdd"));
	this.$.find(".Ldt-QuizzCreator-Question-Save").bind("click", this.functionWrapper("onSubmit"));

	$("#tab-quizz").prepend('<button class="Ldt-QuizzCreator-Export-Link">Exporter</button>');

	$(".Ldt-QuizzCreator-Export-Link").click(function() {
		console.log("[Quizz] export");
		_this.exportAnnotations();
	});

	$(".Ldt-QuizzCreator-Time").keyup(function() {
		var str = $(".Ldt-QuizzCreator-Time").val();
		_this.begin = _this.hmsToSecondsOnly(str) * 1000;
		_this.end = _this.begin + 1000;
		console.log(_this.begin);
	});

    this.onMediaEvent("timeupdate", function(_time) {
        // Do not update timecode if description is not empty
        if (_this.$.find(".Ldt-QuizzCreator-Question-Area").val().trim() != "") {
            _this.setBegin(_time);
        };
    });
};

IriSP.Widgets.QuizzCreator.prototype.addQuestion = function(annotation, number) {

	if (annotation.content.data.type == "multiple_choice") {
		this.question = new IriSP.Widgets.MultipleChoiceQuestion(annotation);
	}
	else if (annotation.content.data.type == "unique_choice") {
		this.question = new IriSP.Widgets.UniqueChoiceQuestion(annotation);
	}

	var answers = annotation.content.data.answers;

	this.answers = [];
	this.nbQuestions = 0;

	var output = '';
	$(".Ldt-QuizzCreator-Questions-Block").html(output);

	$("#Ldt-QuizzCreator-Time").val(annotation.begin);
	$(".Ldt-QuizzCreator-Question-Area").val(annotation.content.data.question);
	$(".Ldt-QuizzCreator-Resource-Area").val(annotation.content.data.resource);

	for (i = 0; i < answers.length; i++) {
		output += '<div class="Ldt-QuizzCreator-Questions-Question">'
		+	'<div class="Ldt-QuizzCreator-Questions-Question-Correct">'+ this.question.renderFullTemplate(answers[i], this.nbQuestions) +'</div>'
		+ 	'<div class="Ldt-QuizzCreator-Questions-Question-Content">Réponse :<br />'
		+		'<input type="text" class="Ldt-QuizzCreator-Answer-Content" data-question="'+ this.nbQuestions +'" id="question'+ this.nbQuestions +'" value="'+ answers[i].content +'" /><br />'
		+		'Feedback :<br/><textarea class="Ldt-QuizzCreator-Answer-Feedback" data-question="'+ this.nbQuestions +'" id="feedback'+ this.nbQuestions +'">'+ answers[i].feedback +'</textarea>'
		+	'</div>' 
		+ 	'<div class="Ldt-QuizzCreator-Questions-Question-Delete"><button class="Ldt-QuizzCreator-Remove" id="remove'+ this.nbQuestions +'">x</button></div>'
		+	'</div>';
		this.nbQuestions++;
	}

	$("body").on("click", ".Ldt-QuizzCreator-Remove", function() {
		var id = this.id;
		$("#"+ id).closest(".Ldt-QuizzCreator-Questions-Question").remove();
		_this.nbQuestions--;
	});

	$(".Ldt-QuizzCreator-Questions-Block").append(output);
}

IriSP.Widgets.QuizzCreator.prototype.onQuestionTypeChange = function(e) {

    var _field = this.$.find(".Ldt-QuizzCreator-Question-Type");
    var _contents = _field.val();

	var _this = this;
	switch(_contents) {
		case "unique_choice":
			this.question = new IriSP.Widgets.UniqueChoiceQuestion();
		break;

		case "multiple_choice":
			this.question = new IriSP.Widgets.MultipleChoiceQuestion();
		break;
	}

	this.nbQuestions = 0;

	var output = "";

	$("body").on("click", ".Ldt-QuizzCreator-Remove", function() {
		var id = this.id;
		$("#"+ id).closest(".Ldt-QuizzCreator-Questions-Question").remove();
		_this.nbQuestions--;
	});

	$(".Ldt-QuizzCreator-Questions-Block").html(output);
	
    this.pauseOnWrite();
};

IriSP.Widgets.QuizzCreator.prototype.onQuestionAdd = function(e) {

	var output = '<div class="Ldt-QuizzCreator-Questions-Question">'
	+ 	'<div class="Ldt-QuizzCreator-Questions-Question-Correct">'+ this.question.renderTemplate(null, this.nbQuestions) +'</div>'
	+ 	'<div class="Ldt-QuizzCreator-Questions-Question-Content">Réponse :<br /><input class="Ldt-QuizzCreator-Answer-Content" data-question="'+ this.nbQuestions +'" type="text" id="question'+ this.nbQuestions +'" /><br />'
	+	'Feedback :<br/><textarea class="class="Ldt-QuizzCreator-Answer-Feedback" data-question="'+ this.nbQuestions +'"id="feedback'+ this.nbQuestions +'"></textarea></div>'
	+ 	'<div class="Ldt-QuizzCreator-Questions-Question-Delete"><button class="Ldt-QuizzCreator-Remove" id="remove'+ this.nbQuestions +'">x</button></div>'
	+ '</div>';

	this.nbQuestions++;

	$(".Ldt-QuizzCreator-Questions-Block").append(output);

	$("body").on("click", ".Ldt-QuizzCreator-Remove", function() {
		var id = this.id;
		$("#"+ id).closest(".Ldt-QuizzCreator-Questions-Question").remove();
		_this.nbQuestions--;
	});

	$(".Ldt-QuizzCreator-Answer-Content").last().focus();

    this.pauseOnWrite();
};

IriSP.Widgets.QuizzCreator.prototype.pauseOnWrite = function() {
    if (this.pause_on_write && !this.media.getPaused()) {
        this.media.pause();
    }
};

IriSP.Widgets.QuizzCreator.prototype.setBegin = function (t) {
    this.begin = new IriSP.Model.Time(t || 0);
	this.end = this.begin + 500;
    $(".Ldt-QuizzCreator-Time").val(this.begin.toString());
};

IriSP.Widgets.QuizzCreator.prototype.load_local_annotations = function() {
    // Update local storage
    if (this.localSource === undefined) {
        // Initialize local source
        this.localSource = this.player.sourceManager.newLocalSource({serializer: IriSP.serializers['ldt_localstorage']});
    }
    // Load current local annotations
    this.localSource.deSerialize(window.localStorage[this.editable_storage]);
};

IriSP.Widgets.QuizzCreator.prototype.get_local_annotation = function (ident) {
    load_local_annotations();
    // We cannot use .getElement since it fetches
    // elements from the global Directory
    return IriSP._.first(IriSP._.filter(this.localSource.getAnnotations(), function (a) { return a.id == ident; }));
};

IriSP.Widgets.QuizzCreator.prototype.save_local_annotations = function() {
    // Save annotations back
    window.localStorage[widget.editable_storage] = this.localSource.serialize();
    // Merge modifications into widget source
    this.source.merge(this.localSource);
};

IriSP.Widgets.QuizzCreator.prototype.delete_local_annotation = function(i) {
    load_local_annotations();
    this.localSource.getAnnotations().removeId(i);
    this.source.getAnnotations().removeId(i);
    save_local_annotations();
    this.refresh(true);
};

IriSP.Widgets.QuizzCreator.prototype.show = function() {
	//do something
};

IriSP.Widgets.QuizzCreator.prototype.hide = function() {
	console.log("hide");
	$(".Ldt-QuizzCreator-Questions-Block").html("");
	$(".Ldt-QuizzCreator-Question-Area").val("");
	$(".Ldt-QuizzCreator-Resource-Area").val("");
	$(".Ldt-QuizzCreator-Time").val("");
};


IriSP.Widgets.QuizzCreator.prototype.exportAnnotations = function() {
    var widget = this;
    var annotations = this.getWidgetAnnotations().sortBy(function(_annotation) {
        return _annotation.begin;
    });;
    var $ = IriSP.jQuery;

	var content = "{annotations : [\n";

	var i = 0;
	var goal = annotations.length - 1;
	var _this = this;

	annotations.forEach(function(_a) {
		var _exportedAnnotations = new IriSP.Model.List(_this.player.sourceManager), /* Création d'une liste d'annotations contenant une annotation afin de l'envoyer au serveur */
        _export = _this.player.sourceManager.newLocalSource({serializer: IriSP.serializers[_this.api_serializer]}); /* Création d'un objet source utilisant un sérialiseur spécifique pour l'export */
		_a.setAnnotationType("Quizz");
		_exportedAnnotations.push(_a); /* Ajout de l'annotation à la liste à exporter */
		_export.addList("annotation",_exportedAnnotations); /* Ajout de la liste à exporter à l'objet Source */
		content += _export.serialize();
		if (i < goal) {
			content += ",\n";
		}
		i++;
	});
	content += "]}";

    var el = $("<pre>")
            .addClass("exportContainer")
            .text(content)
            .dialog({
                title: "Annotation export",
                open: function( event, ui ) {
                    // Select text
                    var range;
                    if (document.selection) {
		                range = document.body.createTextRange();
                        range.moveToElementText(this[0]);
		                range.select();
		            } else if (window.getSelection) {
		                range = document.createRange();
		                range.selectNode(this[0]);
		                window.getSelection().addRange(range);
		            }
                },
                autoOpen: true,
                width: '80%',
                minHeight: '400',
                height: 400,
                buttons: [ { text: "Close", click: function() { $( this ).dialog( "close" ); } },
                           { text: "Download", click: function () {
								function encode_utf8( s ) {
								  return unescape( encodeURIComponent( s ) );
								}

								function decode_utf8( s ) {
								  return decodeURIComponent( escape( s ) );
								}
                               a = document.createElement('a');
                               a.setAttribute('href', 'data:text/plain;base64,' + btoa(encode_utf8(content)));
                               a.setAttribute('download', 'Annotations - ' + widget.media.title.replace(/[^ \w]/g, '') + '.json');
                               a.click();
                           } } ]
            });
};

/* Fonction effectuant l'envoi des annotations */
IriSP.Widgets.QuizzCreator.prototype.onSubmit = function() {

	if (this.nbQuestions <= 0) {
		alert("Vous devez spécifier au moins une réponse à votre question !");
		return false;
	}

    var _this = this,
        _exportedAnnotations = new IriSP.Model.List(this.player.sourceManager), /* Création d'une liste d'annotations contenant une annotation afin de l'envoyer au serveur */
        _export = this.player.sourceManager.newLocalSource({serializer: IriSP.serializers[this.api_serializer]}), /* Création d'un objet source utilisant un sérialiseur spécifique pour l'export */
        _local_export = this.player.sourceManager.newLocalSource({serializer: IriSP.serializers['ldt_localstorage']}), /* Création d'un objet source utilisant un sérialiseur spécifique pour l'export local */
        _annotation = new IriSP.Model.Annotation(false, _export), /* Création d'une annotation dans cette source avec un ID généré à la volée (param. false) */
        _annotationTypes = this.source.getAnnotationTypes().searchByTitle(this.annotation_type, true), /* Récupération du type d'annotation dans lequel l'annotation doit être ajoutée */
        _annotationType = (_annotationTypes.length ? _annotationTypes[0] : new IriSP.Model.AnnotationType(false, _export)), /* Si le Type d'Annotation n'existe pas, il est créé à la volée */
        _url = Mustache.to_html(this.api_endpoint_template, {id: this.source.projectId}); /* Génération de l'URL à laquelle l'annotation doit être envoyée, qui doit inclure l'ID du projet */

    /* Si nous avons dû générer un ID d'annotationType à la volée... */
    if (!_annotationTypes.length) {
        /* Il ne faudra pas envoyer l'ID généré au serveur */
        _annotationType.dont_send_id = true;
        /* Il faut inclure le titre dans le type d'annotation */
		_annotationType.id = "Quizz";

        _annotationType.title = this.annotation_type;
    }

    /*
     * Nous remplissons les données de l'annotation générée à la volée
     * ATTENTION: Si nous sommes sur un MASHUP, ces éléments doivent se référer AU MEDIA D'ORIGINE
     * */
    _annotation.setMedia(this.source.currentMedia.id); /* Id du média annoté */
    _annotation.setBegin(this.begin); /*Timecode de début */
    _annotation.setEnd(this.end); /* Timecode de fin */
    _annotation.created = new Date(); /* Date de création de l'annotation */

    _annotation.setAnnotationType(_annotationType.id); /* Id du type d'annotation */
    _annotation.description = $(".Ldt-QuizzCreator-Question-Area").val().trim(); /* Champ description */
	_annotation.content = {};
	_annotation.content.data = {};
	_annotation.content.data.type = $(".Ldt-QuizzCreator-Question-Type").val();
	_annotation.content.data.question = _annotation.description;
	_annotation.content.data.resource = $(".Ldt-QuizzCreator-Resource-Area").val();
	_annotation.content.data.answers = [];

	
	for(var i = 0; i < this.nbQuestions; i++) {
		if (typeof $("#question"+ i) != "undefined") {
			console.log(i);
			var answer = {
				correct : ($(".Ldt-Quizz-Question-Check-"+ i).is(':checked')) ? true : false, 
				content : $("#question"+ i).val(),
				feedback : $("#feedback"+ i).val()
			};
			_annotation.content.data.answers.push(answer);
		}
	}

    if (this.show_title_field) {
        /* Champ titre, seulement s'il est visible */
        _annotation.title = $(".Ldt-CreateAnnotation-Title").val();
    } else {
        _annotation.title = _annotation.description;
    }

    var tagIds = Array.prototype.map.call(
        $(".Ldt-CreateAnnotation-TagLi.selected"),
        function(el) { return IriSP.jQuery(el).attr("tag-id"); }
    );

    IriSP._(_annotation.description.match(/#[^\s#.,;]+/g)).each(function(_tt) {
        var _tag,
            _tag_title = _tt.replace(/^#/,''),
            _tags = _this.source.getTags().searchByTitle(_tag_title, true);
        if (_tags.length) {
            _tag = _tags[0];
        } else {
            _tag = new IriSP.Model.Tag(false, _this.source);
            _this.source.getTags().push(_tag);
            _tag.title = _tag_title;
        }
        if (tagIds.indexOf(_tag.id) === -1) {
            tagIds.push(_tag.id);
        }

    });

    _annotation.setTags(IriSP._(tagIds).uniq()); /*Liste des ids de tags */
    if (this.audio_url) {
        _annotation.audio = {
            src: "mic",
            mimetype: "audio/mp3",
            href: this.audio_url
        };
    }
    if (this.show_creator_field) {
        _annotation.creator = $(".Ldt-CreateAnnotation-Creator").val();
    } else {
        _annotation.creator = this.creator_name;
    }
    _exportedAnnotations.push(_annotation); /* Ajout de l'annotation à la liste à exporter */

    if (this.editable_storage != '') {
        // Append to localStorage annotations

        // FIXME: handle movie ids
        _local_export.addList("annotation", _exportedAnnotations); /* Ajout de la liste à exporter à l'objet Source */
        _this.source.merge(_local_export); /* On ajoute la nouvelle annotation au recueil original */
        // Import previously saved local annotations
        if (window.localStorage[this.editable_storage]) {
            _local_export.deSerialize(window.localStorage[this.editable_storage]);
        }
        // Save everything back
        window.localStorage[_this.editable_storage] = _local_export.serialize();
        _this.player.trigger("AnnotationsList.refresh"); /* On force le rafraîchissement du widget AnnotationsList */
        _this.player.trigger("Annotation.create", _annotation);
        $(".Ldt-CreateAnnotation-Description").val("");
    }
    
    if (_url !== "") {
        _export.addList("annotation",_exportedAnnotations); /* Ajout de la liste à exporter à l'objet Source */
        /* Envoi de l'annotation via AJAX au serveur ! */
        IriSP.jQuery.ajax({
            url: _url,
            type: this.api_method,
            contentType: 'application/json',
            data: _export.serialize(), /* L'objet Source est sérialisé */
            success: function(_data) {
				console.log(_export.serialize());
				alert("Question ajoutée avec succès");
				_this.nbQuestions = 0;
                //_this.showScreen('Saved'); /* Si l'appel a fonctionné, on affiche l'écran "Annotation enregistrée" */
                if (_this.after_send_timeout) { /* Selon les options de configuration, on revient à l'écran principal ou on ferme le widget, ou rien */
                    window.setTimeout(
                        function() {
                            _this.close_after_send
                                ? _this.hide()
                                : _this.show();
                        },
                        _this.after_send_timeout
                    );
                }

					_this.player.trigger("AnnotationsList.refresh"); /* On force le rafraîchissement du widget AnnotationsList */
                    _this.player.trigger("CreateAnnotation.created", _annotation.id);

                if (this.editable_storage == '') {
                    _export.getAnnotations().removeElement(_annotation, true); /* Pour éviter les doublons, on supprime l'annotation qui a été envoyée */
                    _export.deSerialize(_data); /* On désérialise les données reçues pour les réinjecter */
                    _this.source.merge(_export); /* On récupère les données réimportées dans l'espace global des données */
                    if (_this.pause_on_write && _this.media.getPaused()) {
                        _this.media.play();
                    }
                    _this.player.trigger("AnnotationsList.refresh"); /* On force le rafraîchissement du widget AnnotationsList */
                    _this.player.trigger("CreateAnnotation.created", _annotation.id);
                }

				_tabs.tabs("option", "active", get_tab_index('#tab-quizz'));

				//Refresh the quizz container
				_this.player.trigger("Quizz.refresh");
				_this.reloadAnnotations();
            },
            error: function(_xhr, _error, _thrown) {
                IriSP.log("Error when sending annotation", _thrown);
                _export.getAnnotations().removeElement(_annotation, true);
                //_this.showScreen('Error');
                window.setTimeout(function(){
                    //_this.showScreen("Main");
                },
                                  (_this.after_send_timeout || 5000));
            }
        });
        //this.showScreen('Wait');
    };
    return false;
};
