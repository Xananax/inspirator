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
	,	$button = $('#Button').on('click',function(evt){
			createText();
			evt.preventDefault();
			return false;
		})
	;
	createText();
});