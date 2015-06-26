/* This widget displays the image associated to the annotation in the given container */

IriSP.Widgets.Quizz = function(player, config) {
    IriSP.Widgets.Widget.call(this, player, config);
}

IriSP.Widgets.Quizz.prototype = new IriSP.Widgets.Widget();

IriSP.Widgets.Quizz.prototype.defaults = {
    annotation_type: "Quizz",
	quizz_activated: true,
	api_serializer: "ldt_annotate",
    api_endpoint_template: "",
    api_method: "POST",
    user: "",
    userid:""
    // container: "imageContainer"
}

IriSP.Widgets.Quizz.prototype.template = '<div class="Ldt-Quizz-Container">'
										+ '<div class="Ldt-Quizz-Header"><div class="Ldt-Quizz-Index"></div><div class="Ldt-Quizz-Score"></div></div>'
										+ '<h1 style="line-height:1;padding-top:10px;text-align:center;" class="Ldt-Quizz-Title">{{question}}</h1>'
										+ '	<div class="Ldt-Quizz-Questions">'
										+ '	</div>'
										+ ' <div class="Ldt-Quizz-FootBar">'
										+ '		<div class="Ldt-Quizz-Result">Bonne réponse</div>'
										+ '		<div class="Ldt-Quizz-Submit">'
										+ '			<div class="quizz-submit-button"><input type="button" value="Valider" /></div>'
										+ '			<div class="quizz-submit-skip-link"><a href="#">Passer</a></div><div style="clear:both;"></div>'
										+ '		</div>'
										+ '		<div class="Ldt-Quizz-Votes">'
										+ '			<h1>Avez-vous trouvé cette question utile ?</h1>'
										+ '			<div class="Ldt-Quizz-Votes-Buttons">'
										+ '				<div><input type="button" value="Non" class="Ldt-Quizz-Vote-Useless" /></div>'
										+ '				<div><input type="button" value="Oui" class="Ldt-Quizz-Vote-Usefull" /></div>'
										+ '				<div class="Ldt-Quizz-Vote-Skip-Block"><a href="#" class="Ldt-Quizz-Vote-Skip">Passer</a></div>'
										+ ' 		</div>'
										+ '		</div>'
										+ '	</div>'
										+ '</div>';

IriSP.Widgets.Quizz.prototype.annotationTemplate = '';

IriSP.Widgets.Quizz.prototype.update = function(annotation) {
	var _this = this;
	if (this.quizz_activated &&
		this.correct[annotation.id] != 1 &&
		this.correct[annotation.id] != 0) {

		console.log("new annotation : ");
		console.log(annotation);		
		_this.quizz_displayed = true;
		//Pause the current video
		this.media.pause();

		this.annotation = annotation;

		
		var question = annotation.content.data.question;
		var answers = annotation.content.data.answers;
		var resource = annotation.content.data.resource;

		//Hide useless components
		//$(".Ldt-Pause-Add-Question").hide();
		$(".Ldt-Quizz-Votes").hide();

		$(".Ldt-Quizz-Container .Ldt-Quizz-Title").html(question);

		var i = 0

		var correctness = this.globalScore();

		var score = "";
		score += '<span class="Ldt-Quizz-Correct-Answer">' + correctness[0] +'</span> / <span class="Ldt-Quizz-Incorrect-Answer">' + correctness[1] + '</span>';
		$(".Ldt-Quizz-Index").html("Q"+ (annotation.number+1) + "/" + this.totalAmount);
		$(".Ldt-Quizz-Score").html(score);
		this.question = new IriSP.Widgets.UniqueChoiceQuestion(annotation);
		this.resource = new IriSP.Widgets.UniqueChoiceQuestion(resource);

		if (annotation.content.data.type == "multiple_choice") {
			this.question = new IriSP.Widgets.MultipleChoiceQuestion(annotation);
		this.resource = new IriSP.Widgets.MultipleChoiceQuestion(resource);
		}
		else if (annotation.content.data.type == "unique_choice") {
			this.question = new IriSP.Widgets.UniqueChoiceQuestion(annotation);
		this.resource = new IriSP.Widgets.UniqueChoiceQuestion(resource);
		}
		
		var output = "";
		for (i = 0; i < answers.length; i++) {
			//alert( answers[i].content);

			output += '<div class="quizz-question-block"><p>' + this.question.renderQuizzTemplate(answers[i], i) + '<span class="quizz-question-label">'+ answers[i].content + '</span></p>';
			var color = (answers[i].correct == true) ? "quizz-question-correct-feedback" : "quizz-question-incorrect-feedback";
			output += '<div class="quizz-question-feedback '+ color +'">'+ answers[i].feedback +'</div>';
			output += '</div>';

		}	
		
		
		QR='<div class="quizz-resource-block" id="resource" ><p>'+resource+'</p></div>';		
		QR += output;
		
		//If there is an attached resource, display it on the resources overlay
		if ( resource != null) {
			$(".Ldt-Quizz-Questions").html( QR);
		}
		else {
			$(".Ldt-Quizz-Questions").html(output);
		}
		$(".Ldt-Quizz-Overlay").show();
		
		$(".Ldt-Quizz-Submit").fadeIn();
	
		//Let's automatically check the checkbox/radio if we click on the label
		$(".quizz-question-label").click(function() {
			var parent = $(this).parent().children('.quizz-question').first().prop('checked', true);
			$(".Ldt-Quizz-Questions .quizz-question").each( function(index, item) {
				if ($(item).is(':checked')) {
					$(item).parent().children(".quizz-question-label").css("text-decoration", "underline");
				}
				else
				{
					$(item).parent().children(".quizz-question-label").css("text-decoration", "none");
				}
			});
		});

		//In case we click on the first "Skip" link
		$(".quizz-submit-skip-link").click({media: this.media}, function(event) {
			_this.hide();
			_this.player.trigger("QuizzCreator.skip");
			event.data.media.play();
		});

		var _this = this;
		//Trying to catch timeupdate and play events
		/*
		this.onMediaEvent("timeupdate", function(_time) {
		    if (_time < annotation.begin || _time > ( annotation.begin + 1000) ) {
				_this.hide();
				_this.media.play();
			}
		});
		this.onMediaEvent("play", function(_time) {
		    if (_time < annotation.begin || _time > ( annotation.begin + 500)) {
				_this.hide();
			}
		});
		*/
	}
};

IriSP.Widgets.Quizz.prototype.hide = function() {
	$(".Ldt-Quizz-Votes").fadeOut();
	$(".Ldt-Quizz-Overlay").hide();
	$(".Ldt-Pause-Add-Question").hide();
	var _this = this;
	
	_this.quizz_displayed = false;
}

IriSP.Widgets.Quizz.prototype.answer = function() { 
	//alert(this.annotation.content.data.question);
	//Display feedbacks

	$( ".quizz-question-feedback").each(function(index) {
		$(this).fadeIn();
	});

	var answers = this.annotation.content.data.answers;
	var faux = false;
	var i =0;
	var _this = this;
	var ans_property;
	var ans_value;
	while (i < answers.length && faux == false) {
		console.log("Réponse : "+ i +" => réponse : "+ $(".Ldt-Quizz-Container .Ldt-Quizz-Question-Check-" + i).is(':checked'));
		if ( !this.question.isCorrect(i, $(".Ldt-Quizz-Container .Ldt-Quizz-Question-Check-" + i).is(':checked'))) {
			faux = true;
		}
		i++;
	}
	var j=0;
	while (j < answers.length){
		if($(".Ldt-Quizz-Container .Ldt-Quizz-Question-Check-" + j).is(':checked')){
			ans_value=j;
		}
		j++;
	}
	
	$(".Ldt-Quizz-Score").fadeIn();

	//Todo : display the result in a cool way :)
	if (faux == true) {
		$(".Ldt-Quizz-Result").html("Mauvaise réponse");
		$(".Ldt-Quizz-Result").css({"background-color" : "red"});
		$('*[data-annotation="'+ this.annotation.id +'"]').children(".Ldt-AnnotationsList-Duration").children(".Ldt-AnnotationsList-Begin").removeClass("Ldt-Quizz-Correct-Answer").addClass("Ldt-Quizz-Incorrect-Answer");
		this.correct[this.annotation.id] = 0;
		ans_property="wrong_answer";
	}
	else
	{
		$(".Ldt-Quizz-Result").html("Bonne réponse !");
		$(".Ldt-Quizz-Result").css({"background-color" : "green"});
		$('*[data-annotation="'+ this.annotation.id +'"]').children(".Ldt-AnnotationsList-Duration").children(".Ldt-AnnotationsList-Begin").removeClass("Ldt-Quizz-Incorrect-Answer").addClass("Ldt-Quizz-Correct-Answer");
		this.correct[this.annotation.id] = 1;
		ans_property="right_answer";
	}
	$(".Ldt-Quizz-Result").animate({height:"100%"},500, "linear", function(){
		$(".Ldt-Quizz-Result").delay( 2000 ).animate({height:"0%"}, 500);
	});

	var question_number= this.annotation.number+1;
	var correctness = this.globalScore();
	var score = "";
	score += '<span class="Ldt-Quizz-Correct-Answer">' + correctness[0] +'</span> / <span class="Ldt-Quizz-Incorrect-Answer">' + correctness[1] + '</span>';
	$(".Ldt-Quizz-Index").html("Q"+ question_number + "/" + this.totalAmount);
	$(".Ldt-Quizz-Score").html(score);

	this.submit(this.user,this.userid,this.annotation.id,ans_property,ans_value);
	
	//Hide the "Validate" button and display the UI dedicated to votes
	$(".Ldt-Quizz-Submit").fadeOut();
	$(".Ldt-Quizz-Votes").delay(500).fadeIn();
	
};

IriSP.Widgets.Quizz.prototype.globalScore = function() { 
	//Define 2 variables to know how good and bad answers there are
	var ok = 0;
	var ko = 0;
	for(var i = 0; i < this.totalAmount; i++) {
		if (this.correct[this.keys[i]] == 1) {
			ok++;
		}
		else if (this.correct[this.keys[i]] == 0)
		{
			ko++;
		}
	}
	var array = [ok, ko];
	return array;
}

IriSP.Widgets.Quizz.prototype.refresh = function() { 
    var _annotations = this.getWidgetAnnotations().sortBy(function(_annotation) {
        return _annotation.begin;
    });

    var _this = this;

	_this.totalAmount = _annotations.length;
	_this.number = 0;
	_this.correct = {};
	_this.keys = {};

    _annotations.forEach(function(_a) {
		//Fix each annotation as "non-answered yet"
		_this.correct[_a.id] = -1;
		_this.keys[_this.number] = _a.id;
		_a.number = _this.number++;
        _a.on("enter", function() {
            _this.update(_a);
        });
    });

}

IriSP.Widgets.Quizz.prototype.draw = function() {   
	var _this = this;
    var _annotations = this.getWidgetAnnotations().sortBy(function(_annotation) {
        return _annotation.begin;
    });
	
	console.log(_annotations.length + " Quizz annotations ");
	
	_this.quizz_displayed = false;
    
	
    this.onMdpEvent("Quizz.activate", function() {
		_this.quizz_activated = true;
		$("#tab_quizz_toc").show();
		console.log("[Quizz] : abled");
    });

    this.onMdpEvent("Quizz.deactivate", function() {
		_this.quizz_activated = false;
		console.log("[Quizz] disabled");
		$("#tab_quizz_toc").hide();
		_this.hide();
    });

    this.onMdpEvent("Quizz.hide", function() {
		console.log("[Quizz] hide");
		_this.hide();
    });

    this.onMdpEvent("Quizz.refresh", function() {
		console.log("[Quizz] refreshed");
		_this.refresh();		
    }); 


	var circle = '<img id="PAQ" src="../widgets/img/addQuestion.svg"/>';
		
    this.onMediaEvent("pause", function() {
		if(_this.quizz_displayed){
	$(".Ldt-Pause-Add-Question").html(circle).hide();}
		else{$(".Ldt-Pause-Add-Question").html(circle).show();}
		
	document.getElementById( "PAQ" ).onclick = function() {_this.create_quizz_callback();};
    });
    
    this.onMediaEvent("play", function() {
	$(".Ldt-Pause-Add-Question").html(circle).hide();
    });
  
	_this.container = $("<div class='Ldt-Quizz-Overlay right_panel'></div>").appendTo($("[widget-type*=Player]"));
	_this.PauseAddQuestion = $("<div class='Ldt-Pause-Add-Question'></div>").prependTo($("[widget-type*=Player]"));
	_this.container.html(this.template);
	

	$(".Ldt-Quizz-Overlay").hide();

    console.log("Quizz was drawn");

    $(".Ldt-Quizz-Submit input").click(function() {
		_this.answer();
    });

	//In case we click on the first "Skip" link
	$(".quizz-submit-skip-link").click({media: this.media}, function(event) {
		_this.submit(_this.user,_this.userid,_this.annotation.id,"skipped_answer",0);
		_this.hide();
		_this.player.trigger("QuizzCreator.skip");
		event.data.media.play();
	});
		
    $(".Ldt-Quizz-Votes-Buttons input[type=\"button\"], .Ldt-Quizz-Votes-Buttons a").click({media: this.media}, function(event) {
		//Todo : thanks people for their feedback, then close the quizz window
		
		var vote_prop, vote_val;
		
		if ($(this).hasClass("Ldt-Quizz-Vote-Usefull")){
			vote_prop = "usefull"
			vote_val = 1;
		}else if ($(this).hasClass("Ldt-Quizz-Vote-Useless")){
			vote_prop = "useless";
			vote_val = -1;
			
			$(".Ldt-Ctrl-Quizz-Create").addClass("button_highlight").delay(5000).queue(function(){
                $(this).removeClass("button_highlight").dequeue();
            });
            
		}else{
			vote_prop = "skipped_vote";
			vote_val = 0;
		}
		
		_this.submit(_this.user,_this.userid,_this.annotation.id,vote_prop,vote_val);
		
		//Resume the current video
		event.data.media.play();

		_this.hide();
		$(".Ldt-Pause-Add-Question").hide();

		_this.player.trigger("QuizzCreator.skip");
		

	});

	_this.totalAmount = _annotations.length;
	_this.number = 0;
	_this.correct = {};
	_this.keys = {};

    _annotations.forEach(function(_a) {
		//Fix each annotation as "non-answered yet"
		_this.correct[_a.id] = -1;
		_this.keys[_this.number] = _a.id;
		_a.number = _this.number++;
        _a.on("enter", function() {
            _this.update(_a);
        });
    });
}

//Generates uid
//source : http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
IriSP.Widgets.Widget.prototype.generateUid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

//UniqueChoice Question
IriSP.Widgets.UniqueChoiceQuestion = function(annotation) {
    this.annotation = annotation;
}

IriSP.Widgets.UniqueChoiceQuestion.prototype = new IriSP.Widgets.Widget();

IriSP.Widgets.UniqueChoiceQuestion.prototype.isCorrect = function(answer, valid) {
	if (this.annotation.content.data.answers[answer].correct == true && valid == true) {
		return true;
	}
	else if ((typeof this.annotation.content.data.answers[answer].correct === "undefined" || this.annotation.content.data.answers[answer].correct == false) && valid == false) {
		return true;
	}
	return false;
}

IriSP.Widgets.UniqueChoiceQuestion.prototype.renderQuizzTemplate = function(answer, identifier) {
	return '<input type="radio" class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question" data-question="'+ identifier +'" value="' + identifier + '" />';
}

IriSP.Widgets.UniqueChoiceQuestion.prototype.renderTemplate = function(answer, identifier) {
	var id = this.generateUid();
	return '<input type="radio" id="'+ id +'" class="quizz-question-edition Ldt-Quizz-Question-Check-'+ identifier +'" name="question" data-question="'+ identifier +'" value="' + identifier + '" /><label for="'+ id +'" title="Veuillez sélectionner la réponse correcte"></label>';
}

IriSP.Widgets.UniqueChoiceQuestion.prototype.renderFullTemplate = function(answer, identifier) {
	var correct = (answer.correct == true) ? "checked=\"checked\"" : "";
	var id = this.generateUid();
	return '<input type="radio" id="'+ id +'" '+ correct +' class="quizz-question-edition Ldt-Quizz-Question-Check-'+ identifier +'" name="question" data-question="'+ identifier +'" value="' + identifier + '" /><label for="'+ id +'"></label>';
}


//MultipleChoice Question
IriSP.Widgets.MultipleChoiceQuestion = function(annotation) {
    this.annotation = annotation;
}

IriSP.Widgets.MultipleChoiceQuestion.prototype = new IriSP.Widgets.Widget();

IriSP.Widgets.MultipleChoiceQuestion.prototype.isCorrect = function(answer, valid) {
	if (this.annotation.content.data.answers[answer].correct == true && valid == true) {
		return true;
	}
	else if ((typeof this.annotation.content.data.answers[answer].correct === "undefined" || this.annotation.content.data.answers[answer].correct == false) && valid == false) {
		return true;
	}
	return false;
}

IriSP.Widgets.MultipleChoiceQuestion.prototype.renderQuizzTemplate = function(answer, identifier) {
	return '<input type="checkbox" class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question['+ identifier +']" data-question="'+ identifier +'" value="' + identifier + '" /> ';
}

IriSP.Widgets.MultipleChoiceQuestion.prototype.renderTemplate = function(answer, identifier) {
	var id = this.generateUid();
	return '<input type="checkbox" id="'+ id +'" class="quizz-question-edition Ldt-Quizz-Question-Check-'+ identifier +'" name="question['+ identifier +']" data-question="'+ identifier +'" value="' + identifier + '" /><label for="'+ id +'" title="Veuillez sélectionner la ou les réponses correctes"></label>';
}

IriSP.Widgets.MultipleChoiceQuestion.prototype.renderFullTemplate = function(answer, identifier) {
	var correct = (answer.correct == true) ? "checked=\"checked\"" : "";
	var id = this.generateUid();
	return '<input type="checkbox" id="'+ id +'" '+ correct +' class="quizz-question-edition Ldt-Quizz-Question-Check-'+ identifier +'" name="question['+ identifier +']" data-question="'+ identifier +'" value="' + identifier + '" /><label for="'+ id +'"></label> ';
}

IriSP.Widgets.Quizz.prototype.submit = function(user,user_id,question,prop,val) {
	var _url = Mustache.to_html(this.api_endpoint_template, {id: this.source.projectId}),
	donnees = {
			"username": user, 
			"useruuid": user_id,  
			"subject": question,
			"property": prop,
			"value": val
		};
	
	IriSP.jQuery.ajax({
            url: _url,
            type: this.api_method,
            contentType: 'application/json',
            data: JSON.stringify(donnees), 
            success: function(_data) {
		console.log("données enregistrées avec succès " +JSON.stringify(donnees));	
            },
            error: function(_xhr, _error, _thrown) {
                IriSP.log("Error when sending annotation", _thrown);
            }
    	});
}
