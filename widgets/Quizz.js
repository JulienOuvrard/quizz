/* This widget displays the image associated to the annotation in the given container */

IriSP.Widgets.Quizz = function(player, config) {
    IriSP.Widgets.Widget.call(this, player, config);
}

IriSP.Widgets.Quizz.prototype = new IriSP.Widgets.Widget();

IriSP.Widgets.Quizz.prototype.defaults = {
    annotation_type: "Quizz",
	quizz_activated: true
    // container: "imageContainer"
}

IriSP.Widgets.Quizz.prototype.template = '<div class="Ldt-Quizz-Container">'
										+ '<div class="Ldt-Quizz-Score"></div>'
										+ '<h1 style="line-height:1;padding-top:10px;text-align:center;" class="Ldt-Quizz-Title">{{question}}</h1>'
										+ '	<div class="Ldt-Quizz-Questions">'
										+ '	</div>'
										+ ' <div class="Ldt-Quizz-FootBar">'
										+ '		<div class="Ldt-Quizz-Result">Bonne réponse</div>'
										+ '		<div class="Ldt-Quizz-Submit">'
										+ '			<div class="quizz-submit-button"><input type="button" value="Valider" /></div>'
										+ '			<div class="quizz-submit-skip-link"><a href="#">Skip</a></div><div style="clear:both;"></div>'
										+ '		</div>'
										+ '		<div class="Ldt-Quizz-Votes">'
										+ '			<h1>Avez-vous trouvé cette question utile ?</h1>'
										+ '			<div class="Ldt-Quizz-Votes-Buttons">'
										+ '				<div><input type="button" value="Non" class="Ldt-Quizz-Vote-Useless" /></div>'
										+ '				<div><input type="button" value="Oui" class="Ldt-Quizz-Vote-Usefull" /></div>'
										+ '				<div class="Ldt-Quizz-Vote-Skip-Block"><a href="#" class="Ldt-Quizz-Vote-Skip">Skip</a></div>'
										+ ' 		</div>'
										+ '		</div>'
										+ '	</div>'
										+ '</div>';

IriSP.Widgets.Quizz.prototype.annotationTemplate = '';

IriSP.Widgets.Quizz.prototype.update = function(annotation) {

	if (this.quizz_activated &&
		this.correct[annotation.id] != 1 &&
		this.correct[annotation.id] != 0) {

		console.log("new annotation : ");
		console.log(annotation);

		//Pause the current video
		this.media.pause();

		this.annotation = annotation;

		var _this = this;
		var question = annotation.content.data.question;
		var answers = annotation.content.data.answers;

		//Hide useless components
		$(".Ldt-Ressources-Overlay").hide();
		$(".Ldt-Quizz-Votes").hide();

		$(".Ldt-Quizz-Container .Ldt-Quizz-Title").html(question);

		var i = 0

		var correctness = this.globalScore();

		var score = "";
		score += '<span class="Ldt-Quizz-Correct-Answer">' + correctness[0] +'</span> / <span class="Ldt-Quizz-Incorrect-Answer">' + correctness[1] + '</span>';
		$(".Ldt-Quizz-Score").html("Q"+ (annotation.number+1) + "/" + this.totalAmount + " : " + score);

		this.question = new IriSP.Widgets.UniqueChoiceQuestion(annotation);

		if (annotation.content.data.type == "multiple_choice") {
			this.question = new IriSP.Widgets.MultipleChoiceQuestion(annotation);
		}
		else if (annotation.content.data.type == "unique_choice") {
			this.question = new IriSP.Widgets.UniqueChoiceQuestion(annotation);
		}

		var output = "";
		for (i = 0; i < answers.length; i++) {
			//alert( answers[i].content);

			output += '<div class="quizz-question-block"><p>' + this.question.renderTemplate(answers[i], i) + '<span class="quizz-question-label">'+ answers[i].content + '</span></p>';
			var color = (answers[i].correct == true) ? "quizz-question-correct-feedback" : "quizz-question-incorrect-feedback";
			output += '<div class="quizz-question-feedback '+ color +'">'+ answers[i].feedback +'</div>';
			output += '</div>';

		}
		$(".Ldt-Quizz-Questions").html(output);

		//If there is an attached resource, display it on the resources overlay
		if (typeof this.annotation.content.data.resource != "undefined") {
			$(".Ldt-Ressources-Overlay").html(annotation.content.data.resource);
			$(".Ldt-Ressources-Overlay").show();
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
	$(".Ldt-Ressources-Overlay").hide();
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

	while (i < answers.length && faux == false) {
		console.log("Réponse : "+ i +" => réponse : "+ $(".Ldt-Quizz-Container .Ldt-Quizz-Question-Check-" + i).is(':checked'));
		if ( !this.question.isCorrect(i, $(".Ldt-Quizz-Container .Ldt-Quizz-Question-Check-" + i).is(':checked'))) {
			faux = true;
		}
		i++;
	}

	$(".Ldt-Quizz-Score").fadeIn();

	//Todo : display the result in a cool way :)
	if (faux == true) {
		$(".Ldt-Quizz-Result").html("Mauvaise réponse");
		$(".Ldt-Quizz-Result").css({"background-color" : "red"});
		$('*[data-annotation="'+ this.annotation.id +'"]').children(".Ldt-AnnotationsList-Duration").children(".Ldt-AnnotationsList-Begin").removeClass("Ldt-Quizz-Correct-Answer").addClass("Ldt-Quizz-Incorrect-Answer");
		this.correct[this.annotation.id] = 0;
	}
	else
	{
		$(".Ldt-Quizz-Result").html("Bonne réponse !");
		$(".Ldt-Quizz-Result").css({"background-color" : "green"});
		$('*[data-annotation="'+ this.annotation.id +'"]').children(".Ldt-AnnotationsList-Duration").children(".Ldt-AnnotationsList-Begin").removeClass("Ldt-Quizz-Incorrect-Answer").addClass("Ldt-Quizz-Correct-Answer");
		this.correct[this.annotation.id] = 1;
	}
	$(".Ldt-Quizz-Result").animate({height:"100%"},500, "linear", function(){
		$(".Ldt-Quizz-Result").delay( 2000 ).animate({height:"0%"}, 500);
	});

	var correctness = this.globalScore();
	var score = "";
	score += '<span class="Ldt-Quizz-Correct-Answer">' + correctness[0] +'</span> / <span class="Ldt-Quizz-Incorrect-Answer">' + correctness[1] + '</span>';
	$(".Ldt-Quizz-Score").html("Q"+ (this.annotation.number+1) + "/" + this.totalAmount + " : " + score);
	
	//Hide the "Validate" button and display the UI dedicated to votes
	$(".Ldt-Quizz-Submit").fadeOut();
	$(".Ldt-Quizz-Votes").delay(500).fadeIn();
	
	$(".Ldt-Quizz-Votes-Buttons input[type=\"button\"], .Ldt-Quizz-Votes-Buttons a").click({media: this.media}, function(event) {
		//Todo : thanks people for their feedback, then close the quizz window
		
		//Resume the current video
		event.data.media.play();

		_this.hide();
		$(".Ldt-Ressources-Overlay").hide();

		_this.player.trigger("QuizzCreator.skip");

	});

	$(".Ldt-Quizz-Votes-Buttons").trigger("click", this.media);
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

    var _annotations = this.getWidgetAnnotations().sortBy(function(_annotation) {
        return _annotation.begin;
    });
	
	console.log(_annotations.length + " Quizz annotations ");

    var _this = this;

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

	_this.container = $("<div class='Ldt-Quizz-Overlay right_panel'></div>").prependTo($("[widget-type*=Player]"));
	_this.ressourcesContainer = $("<div class='Ldt-Ressources-Overlay left_panel'></div>").prependTo($("[widget-type*=Player]"));
	_this.container.html(this.template);

	$(".Ldt-Quizz-Overlay").hide();

    console.log("Quizz was drawn");

    $(".Ldt-Quizz-Submit input").click(function() {
		_this.answer();
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

IriSP.Widgets.UniqueChoiceQuestion.prototype.renderTemplate = function(answer, identifier) {
	return '<input type="radio" class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question" data-question="'+ identifier +'" value="' + identifier + '" /> ';
}

IriSP.Widgets.UniqueChoiceQuestion.prototype.renderFullTemplate = function(answer, identifier) {
	var correct = (answer.correct == true) ? "checked=\"checked\"" : "";
	return '<input type="radio" '+ correct +' class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question" data-question="'+ identifier +'" value="' + identifier + '" /> ';
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

IriSP.Widgets.MultipleChoiceQuestion.prototype.renderTemplate = function(answer, identifier) {
	return '<input type="checkbox" class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question['+ identifier +']" data-question="'+ identifier +'" value="' + identifier + '" /> ';
}

IriSP.Widgets.MultipleChoiceQuestion.prototype.renderFullTemplate = function(answer, identifier) {
	var correct = (answer.correct == true) ? "checked=\"checked\"" : "";
	return '<input type="checkbox" '+ correct +' class="quizz-question Ldt-Quizz-Question-Check-'+ identifier +'" name="question['+ identifier +']" data-question="'+ identifier +'" value="' + identifier + '" /> ';
}

