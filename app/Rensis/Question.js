
import _ from 'lodash';
import $ from 'jquery';

var likertLookup = {
	"strongly_disagree": -1,
	"disagree": -0.5,
	"neutral": 0,
	"agree": 0.5,
	"strongly_agree": 1
};

class Question {

	constructor (options) {
		this.options = options;
		if("func" in this.options) {
			this.options.fullFunc = new Function('ans', this.options.func);
		}
	}


	idifyChoices(q) {
		return q.toLowerCase().replace(/ /g,"_");
	}

	getHtml() {

		if(this.options.type == "likert") {
      var likertid = 'likert_' + this.options.qid ;
			var html = ''
			+'   <div class="likert_question question" id="question_' + this.options.qid + '">'
			+'    <div class="statement">' + this.options.question + '</div> '
			+'			<ul class="options">'
			+'				<li class="wider"><input type="radio" name="' + likertid + '" id="' + likertid + "_sd" + '" value="strongly_disagree"><label for="' + likertid + "_sd" + '">Strongly disagree</label></li>'
			+'				<li><input type="radio" name="' + likertid + '" id="' + likertid + "_d" + '" value="disagree"><label for="' + likertid + "_d" + '">Disagree</label></li>'
			+'				<li><input type="radio" name="' + likertid + '" id="' + likertid + "_n" + '" value="neutral"><label for="' + likertid + "_n" + '">Neutral</label></li>'
			+'				<li><input type="radio" name="' + likertid + '" id="' + likertid + "_a" + '" value="agree"><label for="' + likertid + "_a" + '">Agree</label></li>'
			+'				<li class="wider"><input type="radio" name="' + likertid + '" id="' + likertid + "_sa" + '" value="strongly_agree"><label for="' + likertid + "_sa" + '">Strongly agree</label></li>'
			+'			</ul>'
			+'   </div>';
			return html;
		}
		if(this.options.type == "multipleChoice") {
			var html = ''
			+'   <div class="multiple_choice_question question" id="question_' + this.options.qid + '">'
			+'    <div class="statement">' + this.options.question + '</div> '
			+'			<ul class="options">';

				Object.keys(this.options.answers).forEach((ans) => {
					var aname = this.idifyChoices(ans);

					html += '				<li><input type="radio" name="multiplechoice_' + this.options.qid + '" value="' + aname + '"><label>' + ans + '</label></li>';
				});

				html += '			</ul>'
			+'   </div>';
			return html;
		}
		if(this.options.type == "checkboxes") {
			var html = ''
			+'   <div class="checkboxes_question question" id="question_' + this.options.qid + '">'
			+'    <div class="statement">' + this.options.question + '</div> '
			+'			<ul class="options">';

				Object.keys(this.options.answers).forEach((ans) => {
					var aname = this.idifyChoices(ans);

					html += '				<li><input type="checkbox" name="checkboxes_' + this.options.qid + '" value="' + aname + '"><label>' + ans + '</label></li>';
				});

				html += '			</ul>'
			+'   </div>';
			return html;
		}
		if(this.options.type == "text") {
			var html = ''
			+'   <div class="text_question question" id="question_' + this.options.qid + '">'
			+'    <div class="statement">' + this.options.question + '</div> '
			+'			<input type="text" name="text_' + this.options.qid + '" required />'
			+'    </div>'
			+'   </div>';
			return html;
		}
		
	}

	getResult() {
		var answer = 2; // temporary

		if(this.options.type == "multipleChoice") {
			var answer = document.querySelector("input[name=multiplechoice_" + this.options.qid + "]:checked").value;
			var res = Object.keys(this.options.answers).filter((ans) => {
				return answer == this.idifyChoices(ans);
			});
			return { "convo_topics" : this.options.answers[res[0]] };
		}

    if(this.options.type == "checkboxes") {
    var self = this;

      var idifiedAnswers = {};
      _.forEach(self.options.answers, function(v, k) {
        idifiedAnswers[self.idifyChoices(k)] = v;
      });


			var checkedVals =  _.map($("input[name=checkboxes_" + self.options.qid + "]:checked"), function(a) { return a.value; });
			var matchingAnswers = _.map(checkedVals, function(v) {
				return idifiedAnswers[self.idifyChoices(v)];
			});
			return { "convo_topics" : _.flatten(matchingAnswers) };
		}

		if(this.options.type == "likert") {
			var answer = document.querySelector("input[name=likert_" + this.options.qid + "]:checked").value;
			return this.options.fullFunc(likertLookup[answer]);
		}


		if(this.options.type == "text") {
			var answer = document.querySelector("input[name=text_" + this.options.qid + "]").value;
			var res = {};
			res[this.options.qid] = answer;
			return res;
		}


	}


	static mergeResults(results) {

		var allResults = {};
		_.each(results, function(res) {
			_.each(Object.keys(res), function(reskey) {
				if(!(reskey in allResults)) {
					allResults[reskey] = res[reskey];
				} else {
					if(_.isArray(allResults[reskey])) { allResults[reskey] = allResults[reskey].concat(res[reskey])}
					else { allResults[reskey] += res[reskey]; }
				}
			});
		});
		return allResults;

		
	}

}

export default Question;
