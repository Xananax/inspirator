var texts = {
	games:	"# This is a comment, because it begins with '#'\n" +
			"genre\n" +
			"Ball and paddle,Beat'em up,hack and slash,Fighting,Mascot Fighting,Maze,Pinball,Platform,Shooter,Shoot 'em up,Rail shooter,Action Adventure,Stealth,Survival,Rogue Like,Sandbox RPG,Action RPG,Tactical RPG,Construction and management simulation,Life simulation,Artillery,4X,Real-time strategy,Real-time tactics,Tower defense,Turn-based strategy,Turn-based tactics,War,Racing,Dating\n" +
			"\n" +
			"#Each set of variables begins with a name, followed by words separated by commas\n" +
			"pacing\n" +
			"contemplative,casual, normal, harcore, twitch\n" +
			"\n" +
			"type\n" +
			"turn-based,very short, asymmetric, cooperative, deathmatch, emergent, hack and slash, micromanagement, nonlinear, passive, twitch, party,meta\n" +
			"\n" +
			"time\n" +
			"bullet time,turn,real time\n" +
			"\n" +
			"view\n" +
			"text,top-down,side scroller,3D third person, first-person\n" +
			"\n" +
			"style\n" +
			"minimalist, low-poly, pixelart, high fidelity, gritty reality, abstract, cel-shaded\n" +
			"\n" +
			"# Increase the weight of an element by prepending a number to it\n" +
			"# Here, 'mouse and keyboard' is 4 times as likely to appear as 'gamepad'\n" +
			"controls\n" +
			"3:mouse and keyboard, mouse only, a gamepad, lots of controls, minimalisting controls, one button only\n" +
			"\n" +
			"content\n" +
			"user-submitted,procedurally generated,lovingly hand-made,minimal and repeated\n" +
			"\n" +
			"#Finally, the text that will tie all of that\n" +
			"#Notice the usage of {{maybe}}, that allows certain variables to be passed one time out of two\n" +
			"text \n" +
			"{{maybe:[pacing] }}{{genre}} game with elements of {{genre}} game in {{view}} and drawn in a {{style}} style.{{maybe: content is [content]. }}It plays with {{controls}}{{maybe: and is [time] based}}."
,	simple: "food\n" +
			"burger,pizza,sushi\n"+
			"\n"+
			"text\n"+
			"I want to eat {{food}}"
};
var generate = (function(){
	var TokensType = {
			VAR_NAME:'VAR_NAME'
		,	VAR_VALUE:'VAR_VALUE'
		,	TEXT_HEADER:'TEXT_HEADER'
		,	TEXT:'TEXT'
		,	SEPARATOR:'SEPARATOR'
		,	UNKNOWN:'UNKNOWN'
		}
	,	r = {
			normalizeEOL : /(\n\r|\r\n|\n|\r)/g
		,	chompSpace: /^\s*|\s*$/g
		,	tokenSeparator:/\n/g
		,	arraySeparator:/,/g
		,	commentToken:'#'
		,	stringKeyStartToken:'{{'
		,	stringKeyEndToken:'}}'
		,	stringKeys: /\{\{(.*?)\}\}/g
		,	stringKeyMaybe: /\{\{\s*?maybe:(.*?)\}\}/g
		}
	,	getRandomArrayIndex = function(arr){
			return Math.floor(Math.random() * arr.length);
		}
	,	getRandomArrayValue = function(arr,remove){
			if(arguments.length<2){remove = true;}
			var i = getRandomArrayIndex(arr);
			var v = arr[i];
			if(remove){
				arr.splice(i,1);
			}
			return v;
		}
	,	getRandomBoolean = function(){
			return Math.random() >= 0.5;
		}
	,	makeValues = function(line){
			var arr = line.split(r.arraySeparator);
			var additional = [];
			arr = arr.filter(function(n){return (n != undefined && n!='');});
			arr.forEach(function(el,i){arr[i] = el.replace(r.chompSpace,'');});
			arr.forEach(function(el,i){
				var match = el.match(/^(\d+):/),full,key,str;
				if(match){
					full = match[0];
					key = parseInt(match[1]);
					str = el.replace(full,'');
					arr[i] = str;
					while(key){
						key--;
						additional.push(str);
					}
				}
			});
			arr = arr.concat(additional);
			return arr;
		}
	;

	return function generate(text){
		var	variables = {}
		,	currentLine
		,	currentVar
		,	currentToken
		,	str = ''
		,	previousToken = TokensType.SEPARATOR
		;
		text = text.replace(r.normalizeEOL,'\n')
			.replace(r.chompSpace,'')
			.split(r.tokenSeparator)
		;
		while(text.length){
			currentLine = text.shift().replace(r.chompSpace,'');
			if(currentLine[0] == r.commentToken){continue;}
			switch(previousToken){
				case TokensType.SEPARATOR:
				case TokensType.UNKNOWN:
					if(currentLine){
						currentToken = TokensType.VAR_NAME;
						if(currentLine.toLowerCase()=='text'){
							currentToken = TokensType.TEXT_HEADER;
						}
					}else{currentToken = TokensType.SEPARATOR;}
					break;
				case TokensType.VAR_NAME:
					currentToken = TokensType.VAR_VALUE;
					break;
				case TokensType.TEXT_HEADER:
					currentToken = TokensType.TEXT;
					break;
				case TokensType.TEXT:
				case TokensType.VAR_VALUE:
				default:
					currentToken = TokensType.UNKNOWN;
					break;
			};
			switch(currentToken){
				case TokensType.VAR_NAME:
					currentVar = currentLine;
					break;
				case TokensType.VAR_VALUE:
					variables[currentVar] = makeValues(currentLine);
					break;
				case TokensType.TEXT:
					str = currentLine;
					break;
				default:
					break;
			};
			previousToken = currentToken;
		};

		str = str
			.replace(r.stringKeyMaybe,function(full,key,pos){
				return getRandomBoolean() ? '' : key.replace(/\[/g,r.stringKeyStartToken).replace(/\]/,r.stringKeyEndToken)
			})
			.replace(r.stringKeys,function(full,key,pos){
				if(!variables.hasOwnProperty(key)){return full;}
				var val = getRandomArrayValue(variables[key],true);
				if(pos==0){val = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();}
				else{val = val.toLowerCase();}
				return val;
			})
		;
		return str;
	};
})();

jQuery(function($){
	var $container = $('#Container')
	,	$text = $('#Text')
	,	createText = function(){
			var input = $text.val();
			var output = generate(input);
			var quote = $('<div class="well"><h1>'+output+'</h1></div>');
			$container.prepend(quote);
			quote.hide().slideDown();
		}
	,	changeText = function(text,bypass){
			if(bypass || window.confirm("Do you want to change your text?")){
				$text.val(text);
			}
		}
	,	$button = $('#Button').on('click',function(evt){
			createText();
			evt.preventDefault();
			return false;
		})
	,	$examples = $('a.example').on('click',function(evt){
			var key = $(this).data('text');
			changeText(texts[key]);
		});
	;
	changeText(texts.games,true);
	createText();
});