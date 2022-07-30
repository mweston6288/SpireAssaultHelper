var game
var OwnedItems;
var efficiencies;
var battleCount = 50;
var bestSet = {dps: 0, items:[]}
var trialSet = []
function parse(){
	game = JSON.parse(LZString.decompressFromBase64((document.getElementById("saveString").value.replace(/(\r\n|\n|\r|\s)/gm,"") )));
	autoBattle.load()
	var itemsList = autoBattle.getItemOrder()
	autoBattle.autoLevel = false
	OwnedItems = []
	for(item in itemsList){
        if(autoBattle.items[itemsList[item].name].owned){
			OwnedItems.push(itemsList[item]);
		}
	}
    simulate();
    calcBest();
}
function comparator(item, item2, f1, f2){
	return f1() > f2() ? item : item2
}
function changeBattleCount(){
    battleCount = document.getElementById("battleCounter").value
    calcBest();
}
function simulate(){
    autoBattle.count = 0;
    autoBattle.resetStats();
    while(autoBattle.count < battleCount){
        autoBattle.update();
    }
}
function calcBest(){
	efficiencies = new Array(3)
	efficiencies[0] = new Array(OwnedItems.length)
	efficiencies[1] = new Array(OwnedItems.length)
	efficiencies[2] = new Array(1)
    var initdps = autoBattle.getDustPs();
    var BiggestDustPercent = 0;
	var BiggestShardPercent = 0
	var i, j, k
    for(i = 0, j = 0, k = 0; i <OwnedItems.length; i++){
        if(!autoBattle.items[OwnedItems[i].name].equipped || autoBattle.items[OwnedItems[i].name].noUpgrade){
            if(OwnedItems[i].dustType === "shards"){
				efficiencies[0][j++] = 0;
			}
			else{
				efficiencies[1][k++] = 0;
			}
            continue
        }
        autoBattle.items[OwnedItems[i].name].level++
        simulate();
        var percent = (autoBattle.getDustPs() - initdps) / autoBattle.upgradeCost(OwnedItems[i].name);
        
		if(OwnedItems[i].dustType === "shards" && percent > BiggestShardPercent) 
			BiggestShardPercent = percent;
		else if(OwnedItems[i].dustType === "dust" && percent > BiggestDustPercent)		
			BiggestDustPercent = percent
		
		if(OwnedItems[i].dustType === "shards"){
			efficiencies[0][j++] = percent;
		}
		else{
			efficiencies[1][k++] = percent;
		}
        autoBattle.items[OwnedItems[i].name].level--
    }
	if(autoBattle.oneTimers.The_Ring.owned){
		autoBattle.rings.level++
		simulate();
		var percent = (autoBattle.getDustPs() - initdps) / autoBattle.getRingLevelCost();
		if(percent > BiggestShardPercent){
			efficiencies[2][0] = 1
			BiggestShardPercent = percent;
		}
		else{
			efficiencies[2][0] = 0
		}
		autoBattle.rings.level--

	}
	for(i = 0, j = 0, k = 0; i < OwnedItems.length; i++){
		if(OwnedItems[i].dustType === "shards"){
			efficiencies[0][j] = efficiencies[0][j] / BiggestShardPercent
			if(efficiencies[0][j] <= 0  || Number.isNaN(efficiencies[0][j])){
				efficiencies[0][j] = 0
			}
			j++
		}
		else{
			efficiencies[1][k] = efficiencies[1][k] / BiggestDustPercent
			if(efficiencies[1][k] <= 0  || Number.isNaN(efficiencies[1][k])){
				efficiencies[1][k] = 0
			}
			k++
		}
	}
    autoBattle.popup()
}
function searchForBetter(){
    var equipped = [];
    var bestdps = autoBattle.getDustPs()
    for(item in OwnedItems){
        if(autoBattle.items[OwnedItems[item].name].equipped)
        equipped.push(OwnedItems[item])
    }
    var perm = Array(OwnedItems.length)
    for(var i = 0; i < perm.length;i++){
        perm[i] = i
    }
    for(var j = 0; j < 100; j++){

        for(item in OwnedItems){
            autoBattle.items[OwnedItems[item].name].equipped = false
        }
        for(var i = autoBattle.getMaxItems() - 1; i >= 0; i--){
            var rand = Math.floor(Math.random() * OwnedItems.length)
            var temp = perm[perm.length - 1 - i]
            perm[perm.length - 1 - i] = perm[rand];
            perm[rand] = temp
        }
        for(var i = autoBattle.getMaxItems() - 1; i >= 0; i--){
            autoBattle.items[OwnedItems[perm[perm.length - 1 - i]].name].equipped = true
        }
        simulate();
        if (autoBattle.getDustPs() > bestdps){
            bestdps = autoBattle.getDustPs()
            equipped = []
            for(item in OwnedItems){
                if(autoBattle.items[OwnedItems[item].name].equipped)
                equipped.push(OwnedItems[item])
            }
        }
    }
    for(item in OwnedItems){
        autoBattle.items[OwnedItems[item].name].equipped = false
    }
    for(item in equipped){
        autoBattle.items[equipped[item].name].equipped = true
    }
    calcBest()
    simulate()
    autoBattle.popup();
}
function getBGColor(type, dustNum, shardNum){
	
	var x,y,z
	if(type === "Dust"){
		x = 9 * efficiencies[1][dustNum]
		y = 7 * efficiencies[1][dustNum] 
		z = 146 * efficiencies[1][dustNum]

	}
	else{
		x = 146 * efficiencies[0][shardNum]
		y = 23 * efficiencies[0][shardNum] 
		z = 7 * efficiencies[0][shardNum]
	}
	return "rgb(" + x + ", " + y + ", " + z + ")"
}
function getEfficiency(type, dustNum, shardNum){
	if(type === "Dust"){
		return (efficiencies[1][dustNum] * 100).toFixed(2)
	}
	return (efficiencies[0][shardNum] * 100).toFixed(2)
}
function ringBest(item){
	return autoBattle.getCurrencyName(item) == "Shards" ? (efficiencies[2][0] == 1 ? "<br>Upgrading the ring is more efficient" : "") : ""
}
function checkRingEff(){
	if(efficiencies[2][0] == 1){
		return ""
	}
	return "<br>You're better off upgrading items"
}
function reset(){
	autoBattle.resetAll()
	var itemsList = autoBattle.getItemOrder()
	autoBattle.autoLevel = false
	OwnedItems = []
	for(item in itemsList){
        if(autoBattle.items[itemsList[item].name].owned){
			OwnedItems.push(itemsList[item]);
		}
	}
    simulate();
    calcBest();	
}
function unlockNextItem(){
	var items = autoBattle.getItemOrder();
	for(item in items){
		if (!autoBattle.items[item.name].owned){
			autoBattle.items[item.name].owned = true
			OwnedItems.push(items[item])
		}
	}
}


function getRandomIntSeeded(seed, minIncl, maxExcl) {
	var toReturn = Math.floor(seededRandom(seed) * (maxExcl - minIncl)) + minIncl;
	return (toReturn === maxExcl) ? minIncl : toReturn;
}
function seededRandom(seed){
	var x = Math.sin(seed++) * 10000;
	return parseFloat((x - Math.floor(x)).toFixed(7));
}
function swapClass(prefix, newClass, elem) {
    if (elem == null) {
        return;
    }
    var className = elem.className;
    if (typeof className.split('newClass')[1] !== 'undefined') return;
    className = className.split(prefix);
    if(typeof className[1] === 'undefined') {
        elem.className += " " + newClass;
        return;
    }
    var classEnd = className[1].indexOf(' ');
    if (classEnd >= 0)
        className = className[0] + newClass + className[1].slice(classEnd, className[1].length);
    else
        className = className[0] + newClass;
    elem.className = className;
}
function prettify(number) {
	var numberTmp = number;
	if (!isFinite(number)) return "<span class='icomoon icon-infinity'></span>";
	if (number >= 1000 && number < 10000) return Math.floor(number);
	if (number == 0) return prettifySub(0);
	if (number < 0) return "-" + prettify(-number);
	if (number < 0.005) return (+number).toExponential(2);

	var base = Math.floor(Math.log(number)/Math.log(1000));
	if (base <= 0) return prettifySub(number);

	if(game.options.menu.standardNotation.enabled == 5) {
		//Thanks ZXV
		var logBase = game.global.logNotBase;
		var exponent = Math.log(number) / Math.log(logBase);
		return prettifySub(exponent) + "L" + logBase;
	}


	number /= Math.pow(1000, base);
	if (number >= 999.5) {
		// 999.5 rounds to 1000 and we don’t want to show “1000K” or such
		number /= 1000;
		++base;
	}
	if (game.options.menu.standardNotation.enabled == 3){
		var suffices = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
		if (base <= suffices.length) suffix = suffices[base -1];
		else {
			var suf2 = (base % suffices.length) - 1;
			if (suf2 < 0) suf2 = suffices.length - 1;
			suffix = suffices[Math.ceil(base / suffices.length) - 2] + suffices[suf2];
		}
	}
	else {
		var suffices = [
			'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud',
            'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Od', 'Nd', 'V', 'Uv', 'Dv',
            'Tv', 'Qav', 'Qiv', 'Sxv', 'Spv', 'Ov', 'Nv', 'Tg', 'Utg', 'Dtg', 'Ttg',
            'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Otg', 'Ntg', 'Qaa', 'Uqa', 'Dqa', 'Tqa',
            'Qaqa', 'Qiqa', 'Sxqa', 'Spqa', 'Oqa', 'Nqa', 'Qia', 'Uqi', 'Dqi',
            'Tqi', 'Qaqi', 'Qiqi', 'Sxqi', 'Spqi', 'Oqi', 'Nqi', 'Sxa', 'Usx',
            'Dsx', 'Tsx', 'Qasx', 'Qisx', 'Sxsx', 'Spsx', 'Osx', 'Nsx', 'Spa',
            'Usp', 'Dsp', 'Tsp', 'Qasp', 'Qisp', 'Sxsp', 'Spsp', 'Osp', 'Nsp',
            'Og', 'Uog', 'Dog', 'Tog', 'Qaog', 'Qiog', 'Sxog', 'Spog', 'Oog',
            'Nog', 'Na', 'Un', 'Dn', 'Tn', 'Qan', 'Qin', 'Sxn', 'Spn', 'On',
            'Nn', 'Ct', 'Uc'
		];
		var suffix;
		if (game.options.menu.standardNotation.enabled == 2 || (game.options.menu.standardNotation.enabled == 1 && base > suffices.length) || (game.options.menu.standardNotation.enabled == 4 && base > 31))
			suffix = "e" + ((base) * 3);
		else if (game.options.menu.standardNotation.enabled && base <= suffices.length)
			suffix = suffices[base-1];
		else
		{
			var exponent = parseFloat(numberTmp).toExponential(2);
			exponent = exponent.replace('+', '');
			return exponent;
		}
	}
	return prettifySub(number) + suffix;
}
function prettifySub(number){
	number = parseFloat(number);
	var floor = Math.floor(number);
	if (number === floor) // number is an integer, just show it as-is
		return number;
	var precision = 3 - floor.toString().length; // use the right number of digits

	return number.toFixed(3 - floor.toString().length);
}
function formatSecondsAsClock(timeSince, maxOutputs){
	var days = Math.floor(timeSince / 86400);
	var hours = Math.floor( timeSince / 3600) % 24;
	var minutes = Math.floor(timeSince / 60) % 60;
	var seconds = Math.floor(timeSince % 60);
	var timeArray = [days, hours, minutes, seconds];
	var timeString = "";
	var startAt = (maxOutputs) ? maxOutputs : 0;
	for (var x = startAt; x < 4; x++){
		var thisTime = timeArray[x];
		thisTime = thisTime.toString();
		timeString += (thisTime.length < 2) ? "0" + thisTime : thisTime;
		if (x != 3) timeString += ":";
	}
	return timeString;
}
// Correct function to call to cancel the current tooltip
function cancelTooltip(ignore2){
	unlockTooltip();
	tooltip("hide");
	// if (!ignore2){
	// 	 document.getElementById('tooltipDiv2').style.display = 'none';
	// 	 geneMenuOpen = false;
	// }
	tooltipUpdateFunction = "";
	document.getElementById("tipCost").innerHTML = "";
	document.getElementById("tipText").className = "";
	customUp = 0;
	lastMousePos = [0, 0];
	openTooltip = null;
}
function unlockTooltip(){
	game.global.lockTooltip = false;
}
function tooltip(what, isItIn, event, textString, attachFunction, numCheck, renameBtn, noHide, hideCancel, ignoreShift) { //Now 20% less menacing. Work in progress.
	if (!game.options.menu.bigPopups.enabled && (
		what == "The Improbability" ||
		(what == "Corruption" && getHighestLevelCleared() >= 199) ||
		(what == "The Spire" && getHighestLevelCleared() >= 219) ||
		(what == "The Magma" && getHighestLevelCleared() >= 249)
	)){
		return;
	} 
	checkAlert(what, isItIn);
	if (game.global.lockTooltip && event != 'update') return;
	if (game.global.lockTooltip && isItIn && event == 'update') return;
	var elem = document.getElementById("tooltipDiv");
	swapClass("tooltipExtra", "tooltipExtraNone", elem);
	document.getElementById('tipText').className = "";
	var ondisplay = null; // if non-null, called after the tooltip is displayed
	openTooltip = null;
	if (what == "hide"){
		elem.style.display = "none";
		tooltipUpdateFunction = "";
		onShift = null;
		return;
	}
	if (event != 'lock' && (event != 'update' || isItIn) && !game.options.menu.tooltips.enabled && !shiftPressed && what != "Well Fed" && what != 'Perk Preset' && what != 'Activate Portal' && !ignoreShift) {
		var whatU = what, isItInU = isItIn, eventU = event, textStringU = textString, attachFunctionU = attachFunction, numCheckU = numCheck, renameBtnU = renameBtn, noHideU = noHide;
		var newFunction = function () {
			tooltip(whatU, isItInU, eventU, textStringU, attachFunctionU, numCheckU, renameBtnU, noHideU);
		};
		onShift = newFunction;
		return;
	}
	if (event != "update" && event != "screenRead"){
		var whatU = what, isItInU = isItIn, eventU = event, textStringU = textString, attachFunctionU = attachFunction, numCheckU = numCheck, renameBtnU = renameBtn, noHideU = noHide;
		var newFunction = function () {
			tooltip(whatU, isItInU, eventU, textStringU, attachFunctionU, numCheckU, renameBtnU, noHideU);
		};
		tooltipUpdateFunction = newFunction;
	}
	var tooltipText;
	var costText = "";
	var toTip;
	var titleText;
	var tip2 = false;
	var noExtraCheck = false;
	if (isItIn !== null && isItIn != "maps" && isItIn != "customText" && isItIn != "dailyStack" && isItIn != "advMaps"){
		toTip = game[isItIn];
		toTip = toTip[what];
		if (typeof toTip === 'undefined') console.log(what);
		else {
			tooltipText = toTip.tooltip;
			if (typeof tooltipText === 'function') tooltipText = tooltipText();
			if (typeof toTip.cost !== 'undefined') costText = addTooltipPricing(toTip, what, isItIn);
			else if (what == "Hub") costText = "Purchase a Hut, House, Mansion, Hotel, Resort, or Gateway"

		}
	}
	if (isItIn == "advMaps"){
		var advTips = {
			Loot: "This slider allows you to fine tune the map Loot modifier. Moving this slider from left to right will guarantee more loot from the map, but increase the cost.",
			Size: "This slider allows you to fine tune the map Size modifier. Moving this slider from left to right will guarantee a smaller map, but increase the cost.",
			Difficulty: "This slider allows you to fine tune the map Difficulty modifier. Moving this slider from left to right will guarantee an easier map, but increase the cost.",
			get Biome(){
				var text = "<p>If you're looking to farm something specific, you can select the biome here. Anything other than random will increase the cost of the map.</p><ul>";
				text += "<li><b>Mountain</b> - Contains a lot of Metal</li><li><b>Forest</b> - A great place to find some Wood</li><li><b>Sea</b> - Just filled with food to catch</li><li><b>Depths</b> - Ancient Gem mines</li>";
				if (game.global.decayDone) text += "<li><b>Gardens</b> - 25% extra loot and a random assortment of resources</li>";
				if (game.global.farmlandsUnlocked) text += "<li><b>Farmlands</b> - 100% extra loot in Universe 2, 50% extra Herbs. Mimics Mountains on Z6, Forest on Z7, Sea on Z8, Depths at Z9, Gardens at Z10. Continues on rotating every World Zone."
				text += "</ul>";
				return text;
			},
			get Special_Modifier() {
				var text = "<p>Select a special modifier to add to your map from the drop-down below! You can only add one of these to each map. The following bonuses are currently available:</p><ul>"
				for (var item in mapSpecialModifierConfig){
					var bonusItem = mapSpecialModifierConfig[item];
					var unlocksAt = (game.global.universe == 2) ? bonusItem.unlocksAt2 : bonusItem.unlocksAt;
					if ((typeof unlocksAt === 'function' && !unlocksAt()) || unlocksAt == -1){
						continue;
					}
					else if (getHighestLevelCleared() + 1 < unlocksAt){
						text += "<li><b>Next modifier unlocks at Z" + unlocksAt + "</b></li>";
						break;
					}
					text += "<li><b>" + bonusItem.name + " (" + bonusItem.abv + ")</b> - " + bonusItem.description + "</li>";
				}
				return text;
			},
			Show_Hide_Map_Config: "Click this to collapse/expand the map configuration options.",
			Save_Map_Settings: "Click this to save your current map configuration settings to your currently selected preset. These settings will load by default every time you come in to the map chamber or select this preset.",
			Reset_Map_Settings: "Click this to reset all settings to their default positions. This will not clear your saved setting, which will still be loaded next time you enter the map chamber.",
			Extra_Zones: "<p>Create a map up to 10 Zones higher than your current Zone number. This map will gain +10% loot per extra level (compounding), and can drop Prestige upgrades higher than you could get from a world level map.</p><p>A green background indicates that you could afford a map at this Extra Zone amount with your selected Special Modifier and Perfect Sliders. A gold background indicates that you could afford that map with your selected Special Modifier and some combination of non-perfect sliders.</p><p>You can only use this setting when creating a max level map.</p>",
			Perfect_Sliders: "<p>This option takes all of the RNG out of map generation! If sliders are maxxed and the box is checked, you have a 100% chance to get a perfect roll on Loot, Size, and Difficulty.</p><p>You can only choose this setting if the sliders for Loot, Size, and Difficulty are at the max.</p>",
			Map_Preset: "You can save up to 5 different map configurations to switch between at will. The most recently selected setting will load each time you enter your map chamber."
		}
		if (what == "Special Modifier" && game.global.highestLevelCleared >= 149) {
			swapClass("tooltipExtra", "tooltipExtraLg", elem);
			renameBtn = "forceLeft";
		}
		noExtraCheck = true;
		tooltipText = advTips[what.replace(/ /g, '_').replace(/\//g, '_')];
	}
	if (isItIn == "dailyStack"){
		tooltipText = dailyModifiers[what].stackDesc(game.global.dailyChallenge[what].strength, game.global.dailyChallenge[what].stacks);
		costText = "";
		what = what[0].toUpperCase() + what.substr(1)
	}
	if (what == "Confirm Purchase"){
		if (attachFunction == "purchaseImport()" && !boneTemp.selectedImport) return;
		if (game.options.menu.boneAlerts.enabled == 0 && numCheck){
			eval(attachFunction);
			return;
		}
		var btnText = "Make Purchase";
		if (numCheck && game.global.b < numCheck){
			if (typeof kongregate === 'undefined') return;
			tooltipText = "You can't afford this bonus. Would you like to visit the shop?";
			attachFunction = "showPurchaseBones()";
			btnText = "Visit Shop";
		}
		else
		tooltipText = textString;
		costText += '<div class="maxCenter"><div id="confirmTooltipBtn" class="btn btn-info" onclick="' + attachFunction + '; cancelTooltip()">' + btnText + '</div><div class="btn btn-info" onclick="cancelTooltip()">Cancel</div></div>';
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Trimps Info"){
		var kongMode = (document.getElementById('boneBtn') !== null);
		var text = '<div class="trimpsInfoPopup">Need help, found a bug or just want to talk about Trimps? Check out the <a href="https://www.reddit.com/r/trimps" target="_blank">/r/Trimps SubReddit</a>';
		if (kongMode) text += ' or the <a href="https://www.kongregate.com/forums/11405-trimps" target="_blank">Kongregate Forums</a>.<br/><br/>';
		else text +=' or come hang out in the new <a href="https://discord.gg/kSpNHte" target="_blank">Trimps Official Discord</a>!<br/><br/>';
		text += ' If you want to read about or discuss the finer details of Trimps mechanics, check out the <a href="https://trimps.wikia.com/wiki/Trimps_Wiki" target="_blank">community-created Trimps Wiki!</a><br/><br/>';
		if (kongMode) text += ' If you need to contact the developer for any reason, <a target="_blank" href="https://www.kongregate.com/accounts/Greensatellite/private_messages?focus=true">send a private message to GreenSatellite</a> on Kongregate.';
		else text += ' If you need to contact the developer for any reason, <a href="https://www.reddit.com/message/compose/?to=Greensatellite" target="_blank">click here to send a message on Reddit</a> or find Greensatellite in the Trimps Discord.<hr/><br/>';
		if (!kongMode) text += "If you would like to make a donation to help support the development of Trimps, you can now do so with PayPal! If you want to contribute but can't afford a donation, you can still give back by joining the community and sharing your feedback or helping others. Thank you either way, you're awesome! <form id='donateForm' style='text-align: center' action='https://www.paypal.com/cgi-bin/webscr' method='post' target='_blank'><input type='hidden' name='cmd' value='_s-xclick'><input type='hidden' name='hosted_button_id' value='MGFEJS3VVJG6U'><input type='image' src='https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif' border='0' name='submit' alt='PayPal - The safer, easier way to pay online!'><img alt='' border='0' src='https://www.paypalobjects.com/en_US/i/scr/pixel.gif' width='1' height='1'></form>";
		text += '</div>';
		tooltipText = text;
		costText = '<div class="btn btn-info" onclick="cancelTooltip()">Close</div>';
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		noExtraCheck = true;
	}
	if (what == "NW Trimps Info"){
		what = "Trimps Info";
		var text = '<div class="trimpsInfoPopup">Need help, found a bug or just want to talk about Trimps? Check out the <a class="nwWebLink" onclick="nwWebLink(\'https://www.reddit.com/r/trimps\')">/r/Trimps SubReddit</a>';
		text +=' or come hang out in the <a class="nwWebLink" onclick="nwWebLink(\'https://discord.gg/Trimps\')">Trimps Official Discord</a>!<br/><br/>';
		text += ' If you want to read about or discuss the finer details of Trimps mechanics, check out the <a class="nwWebLink" onclick="nwWebLink(\'https://trimps.wikia.com/wiki/Trimps_Wiki\')">community-created Trimps Wiki!</a><br/><br/>';
		text += ' If you need to contact the developer for any reason, <a class="nwWebLink" onclick="nwWebLink(\'https://www.reddit.com/message/compose/?to=Greensatellite\')">click here to send a message on Reddit</a> or find Greensatellite#7771 in the Trimps Discord.';
		text += '</div>';
		tooltipText = text;
		costText = '<div class="btn btn-info" onclick="cancelTooltip()">Close</div>';
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		noExtraCheck = true;
	}
	if (what == "Fluffy"){
		if (event == 'update'){
			//clicked
			game.global.lockTooltip = true;
			elem.style.top = "25%";
			elem.style.left = "25%";
			swapClass('tooltipExtra', 'tooltipExtraLg', elem);
			var fluffyTip = Fluffy.tooltip(true);
			tooltipText = "<div id='fluffyTooltipTopContainer'>" + fluffyTip[0] + "</div>";
			tooltipText += "<div id='fluffyLevelBreakdownContainer' class='niceScroll'>" + fluffyTip[1] + "</div>";
			costText = '<div class="btn btn-danger btn-lg" onclick="cancelTooltip()">Close</div>';
			if (game.challenges.Nurture.boostsActive()){
				costText += "<span id='toggleCruffyTipBtn' class='btn btn-lg btn-primary' onclick='Fluffy.toggleCruffys()'>Show ";
				costText += (Fluffy.cruffysTipActive()) ? "Scruffy" : "Cruffys";
				costText += " Info</span>"
			}
			costText += "<span onclick='Fluffy.pat()' id='fluffyPatBtn' style='display: " + ((Fluffy.cruffysTipActive()) ? "none" : "inline-block") + "' class='btn btn-lg btn-warning'>Pat</span>";
			openTooltip = "Fluffy";
			setTimeout(Fluffy.refreshTooltip, 1000);
			ondisplay = function(){
				verticalCenterTooltip(false, true);
			};
		}
		else {
			//mouseover
			tooltipText = Fluffy.tooltip();
			costText = "Click for more detailed info"
		}
		if (Fluffy.cruffysTipActive()) what = "<b>IT'S CRUFFYS</b>";
		else what = Fluffy.getName();
	}
	if (what == "Scryer Formation"){
		tooltipText = "<p>Trimps lose half of their attack, health and block but gain 2x resources from loot (not including Helium) and have a chance to find Dark Essence above Z180 in the world. This formation must be active for the entire fight to receive any bonus from enemies, and must be active for the entire map to earn a bonus from a Cache.</p>";
		tooltipText += getExtraScryerText(4);
		tooltipText += "<br/>(Hotkeys: S or 5)";
		costText = "";
	}
	if (what == "First Amalgamator"){
		tooltipText = "<p><b>You found your first Amalgamator! You can view this tooltip again and track how many Amalgamators you currently have under 'Jobs'.</b></p>";
		tooltipText += game.jobs.Amalgamator.tooltip;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks for the help, tooltip, but you can go now.</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		noExtraCheck = true;
		ondisplay = function () { verticalCenterTooltip() };
	}
	if (what == "Empowerments of Nature"){
		var active = getEmpowerment();
		if (!active) return;
		var emp = game.empowerments[active];
		if (typeof emp.description === 'undefined') return;
		var lvlsLeft = ((5 - ((game.global.world - 1) % 5)) + (game.global.world - 1)) + 1;
		tooltipText = "<p>The " + active + " Empowerment is currently active!</p><p>" + emp.description() + "</p><p>This Empowerment will end on Z" + lvlsLeft;
		if (game.global.challengeActive !== "Eradicated"){
			tooltipText += ", at which point you'll be able to fight a " + getEmpowerment(null, true) + " enemy to earn";
			var tokCount = rewardToken(emp, true, lvlsLeft);
			tooltipText += " " + prettify(tokCount) + " Token" + needAnS(tokCount) + " of " + active + ".</p>";
		}
		else tooltipText += ".</p>";
		costText = "";

	}
	if (what == "Helium Per Hour"){
		var name = heliumOrRadon();
		what = name + " Per Hour";
		tooltipText = "The displayed value for " + name + " Per Hour is simply a calculation of how much " + name + " you've earned so far this run, divided by the amount of hours you've spent so far on this run.<br/><br/>This value is <b>not</b> production like the other resources. " + name + " is always earned from killing strong Bad Guys and never produced automatically.";
		costText = "";
	}
	if (what == "Finish Daily"){
		var reward = game.challenges.Daily.getCurrentReward();
		tooltipText = "Clicking <b>Finish</b> below will end your daily challenge and you will be unable to attempt it again. You will earn <b>" + prettify(reward) + " extra " + heliumOrRadon() + "!</b>";
		costText = '<div class="maxCenter"><div id="confirmTooltipBtn" class="btn btn-info" onclick="abandonChallenge(); cancelTooltip()">Finish</div><div class="btn btn-danger" onclick="cancelTooltip()">Cancel</div></div>';
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Switch Daily"){
		var daysUntilReset = Math.floor(7 + textString);
		tooltipText = "Click to view " + ((textString == 0) ? "today" : dayOfWeek(getDailyTimeString(textString, false, true))) + "s challenge, which resets in less than " + daysUntilReset + " day" + ((daysUntilReset == 1) ? "" : "s") + ".";
		costText = "";
	}
	if (what == "Decay"){
		var challenge = game.challenges.Decay;
		if (game.global.challengeActive == "Melt"){
			challenge = game.challenges.Melt;
			what = "Melt";
		}
		var decayedAmt = ((1 - Math.pow(challenge.decayValue, challenge.stacks)) * 100).toFixed(2);
		tooltipText = "Things are quickly becoming tougher. Gathering, looting, and Trimp attack are reduced by " + decayedAmt + "%.";
		costText = "";
	}
	if (what == "Heirloom"){
		//attachFunction == location, numCheck == index
		tooltipUpdateFunction = "";
		tooltipText = displaySelectedHeirloom(false, 0, true, numCheck, attachFunction);
		costText = "";
		renameBtn = what;
		what = "";
		if (getSelectedHeirloom(numCheck, attachFunction).rarity == 8){
			ondisplay = function() {
				document.getElementById('tooltipHeirloomIcon').style.animationDelay = "-" + ((new Date().getTime() / 1000) % 30).toFixed(1) + "s";
			}
		}
		swapClass("tooltipExtra", "tooltipExtraHeirloom", elem);
		noExtraCheck = true;
	}
	if (what == "Bone Shrine"){
		tooltipText = game.permaBoneBonuses.boosts.btnTooltip();
		costText = "";
		tooltipUpdateFunction = "";
	}
	if (what == "Respec"){
		tooltipText = "You can respec your perks once per portal. Clicking cancel after clicking this button will not consume your respec.";
		costText = "";
	}
	if (what == "Well Fed"){
		var tBonus = 50;
		if (game.talents.turkimp2.purchased) tBonus = 100;
		else if (game.talents.turkimp2.purchased) tBonus = 75;
		tooltipText = "That Turkimp was delicious, and you have leftovers. If you set yourself to gather Food, Wood, or Metal while this buff is active, you can share with your workers to increase their gather speed by " + tBonus + "%";
		costText = "";
	}
	if (what == "Geneticistassist"){
		tooltipText = "I'm your Geneticistassist! I'll hire and fire Geneticists until your total breed time is as close as possible to the target time you choose. I will fire a Farmer, Lumberjack, or Miner at random if there aren't enough workspaces, I will never spend more than 1% of your food on a Geneticist, and you can customize my target time options in Settings <b>or by holding Ctrl and clicking me</b>. I have uploaded myself to your portal and will never leave you.";
		costText = "";
	}
	if (what == "Welcome"){
		tooltipText = "Welcome to Trimps! This game saves using Local Storage in your browser. Clearing your cookies or browser settings will cause your save to disappear! Please make sure you regularly back up your save file by either using the 'Export' button in the bar below or the 'Online Saving' option under 'Settings'.<br/><br/><b>Chrome and Firefox are currently the only fully supported browsers.</b><br/><br/>";
		if (document.getElementById('boneBtn') !== null){
			tooltipText += "<b style='color: red'>Notice: Did you expect to see your save here?</b><br/>If this is your first time playing since November 13th 2017, check <a target='_blank' href='http://trimps.github.io'>http://trimps.github.io</a> (make sure you go to http, not https), and see if it's there. For more information, see <a target='_blank' href='http://www.kongregate.com/forums/11406-general-discussion/topics/941201-if-your-save-is-missing-after-november-13th-click-here?page=1#posts-11719541'>This Forum Thread</a>.<br/><br/>";
		}
		tooltipText += "<b>Would you like to enable online saving before you start?</b>";
		game.global.lockTooltip = true;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip(); toggleSetting(\"usePlayFab\");'>Enable Online Saving</div><div class='btn btn-danger' onclick='cancelTooltip()'>Don't Enable</div></div>";
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Trustworthy Trimps"){	
		// if (usingScreenReader){
		// 	setTimeout(function(){document.getElementById('screenReaderTooltip').innerHTML = textString;}, 2000);
			
		// 	return;
		// }
		tooltipText = textString;
		game.global.lockTooltip = true;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Sweet, thanks.</div></div>";
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Unequip Heirloom"){
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		costText = "<div class='maxCenter'>";
		tooltipText = "<p>You have no more room to carry another Heirloom, ";
		if (game.global.maxCarriedHeirlooms > game.heirlooms.values.length){
			tooltipText += "and you've already purchased the maximum amount of slots.</p><p>Would you like to leave this Heirloom equipped "			
		}
		else if (game.global.nullifium < getNextCarriedCost()){
			tooltipText += "and don't have enough Nullifium to purchase another Carried slot.</p><p>Would you like to leave this Heirloom equipped "
		}
		else {
			tooltipText += "but you do have enough Nullifium to purchase another Carried slot!</p><p>Would you like to purchase another Carried slot, leave this Heirloom equipped, ";
			costText += "<div class='btn btn-success' onclick='cancelTooltip(); addCarried(true); unequipHeirloom();'>Buy a Slot (" + getNextCarriedCost() + " Nu)</div>";
		}
		tooltipText += "or put it in Temporary Storage? <b>If you use your Portal while this Heirloom is in Temporary Storage, it will be recycled!</b></p>";
		costText += "<div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Leave it equipped</div><div class='btn btn-danger' onclick='cancelTooltip(); unequipHeirloom(null, \"heirloomsExtra\");'>Place in Temporary</div></div>";
	}
	if (what == "Configure AutoStructure"){
		tooltipText = "<p>Here you can choose which structures will be automatically purchased when AutoStructure is toggled on. Check a box to enable the automatic purchasing of that structure, set the dropdown to specify the cost-to-resource % that the structure should be purchased below, and set the 'Up To:' box to the maximum number of that structure you'd like purchased <b>(0&nbsp;for&nbsp;no&nbsp;limit)</b>. For example, setting the dropdown to 10% and the 'Up To:' box to 50 for 'House' will cause a House to be automatically purchased whenever the costs of the next house are less than 10% of your Food, Metal, and Wood, as long as you have less than 50 houses. \'W\' for Gigastation is the required minimum amount of Warpstations before a Gigastation is purchased.</p><table id='autoPurchaseConfigTable'><tbody><tr>";
		var count = 0;
		var setting, selectedPerc, checkbox, options;
		var settingGroup = getAutoStructureSetting();
		for (var item in game.buildings){
			var building = game.buildings[item];
			if (building.blockU2 && game.global.universe == 2) continue;
			if (building.blockU1 && game.global.universe == 1) continue;
			if (item == "Laboratory" && game.global.challengeActive != "Nurture") continue;
			if (!building.AP) continue;
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = settingGroup[item];
			selectedPerc = (setting) ? setting.value : 0.1;		
			checkbox = buildNiceCheckbox('structConfig' + item, 'autoCheckbox', (setting && setting.enabled));
			options = "<option value='0.1'" + ((selectedPerc == 0.1) ? " selected" : "") + ">0.1%</option><option value='1'" + ((selectedPerc == 1) ? " selected" : "") + ">1%</option><option value='5'" + ((selectedPerc == 5) ? " selected" : "") + ">5%</option><option value='10'" + ((selectedPerc == 10) ? " selected" : "") + ">10%</option><option value='25'" + ((selectedPerc == 25) ? " selected" : "") + ">25%</option><option value='50'" + ((selectedPerc == 50) ? " selected" : "") + ">50%</option><option value='99'" + ((selectedPerc == 99) ? " selected" : "") + ">99%</option>";
			var id = "structSelect" + item;
			tooltipText += "<td><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='structSelect' id='" + id + "'>" + options + "</select></div><div class='col-xs-5 lowPad' style='text-align: right'>Up To: <input class='structConfigQuantity' id='structQuant" + item + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0 ) + "'/></div></div></td>";
			count++;
		}
		tooltipText += "</tr><tr>";
		if (game.global.universe == 1){
			tooltipText += "<tr>";
			//stupid gigas making this all spaghetti
			setting = settingGroup.Gigastation;
			selectedPerc = (setting) ? setting.value : 0.1;		
			checkbox = buildNiceCheckbox('structConfigGigastation', 'autoCheckbox', (setting && setting.enabled));
			options = "<option value='0.1'" + ((selectedPerc == 0.1) ? " selected" : "") + ">0.1%</option><option value='1'" + ((selectedPerc == 1) ? " selected" : "") + ">1%</option><option value='5'" + ((selectedPerc == 5) ? " selected" : "") + ">5%</option><option value='10'" + ((selectedPerc == 10) ? " selected" : "") + ">10%</option><option value='25'" + ((selectedPerc == 25) ? " selected" : "") + ">25%</option><option value='50'" + ((selectedPerc == 50) ? " selected" : "") + ">50%</option><option value='99'" + ((selectedPerc == 99) ? " selected" : "") + ">99%</option>";
			tooltipText += "<td><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>Gigastation</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='structSelect' id='structSelectGigastation'>" + options + "</select></div><div class='col-xs-5 lowPad' style='text-align: right'>At W: <input class='structConfigQuantity' id='structQuantGigastation' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0 ) + "'/></div></div></td>";
			if (getHighestLevelCleared() >= 229){
				var nurserySetting = (typeof settingGroup.NurseryZones !== 'undefined') ? settingGroup.NurseryZones : 1;
				tooltipText += "<td><div class='row'><div class='col-xs-12' style='text-align: right; padding-right: 5px;'>Don't buy Nurseries Until Z: <input style='width: 20.8%; margin-right: 4%;' class='structConfigQuantity' id='structZoneNursery' type='number' value='" + nurserySetting + "'></div></div></td>";
			}
			tooltipText += "</tr>";
		}
		options = "<option value='0'>Apply Percent to All</option><option value='0.1'>0.1%</option><option value='1'>1%</option><option value='5'>5%</option><option value='10'>10%</option><option value='25'>25%</option><option value='50'>50%</option><option value='99'>99%</option>";
		tooltipText += "<tr style='text-align: center'>";
		tooltipText += "<td><span data-nexton='true' onclick='toggleAllAutoStructures(this)' class='btn colorPrimary btn-md toggleAllBtn'>Toggle All Structures On</span></td>";
		tooltipText += "<td><select class='toggleAllBtn' id='autoStructureAllPctSelect' onchange='setAllAutoStructurePercent(this)'>" + options + "</select></td>";

		tooltipText += "</tr></tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='saveAutoStructureConfig()'>Apply</div><div class='btn-lg btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		ondisplay = function(){
			verticalCenterTooltip(false, true);
		};
	}
	if (what == "AutoStructure"){
		tooltipText = "<p>Your mastery of this world has enabled your Foremen to handle fairly complicated orders regarding which buildings should be built. Click the cog icon on the right side of this button to tell your Foremen what you want and when you want it, then click the left side of the button to tell them to start or stop.</p>";
		costText = "";
	}
	if (what == "Configure AutoEquip"){
		tooltipText = "<p>Welcome to AutoEquip! <span id='autoTooltipHelpBtn' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>Here you can choose which equipment will be automatically purchased when AutoEquip is toggled on. Check a box to enable the automatic purchasing of that equipment type, set the dropdown to specify the cost-to-resource % that the equipment should be purchased below, and set the 'Up To:' box to the maximum number of that equipment you'd like purchased (0 for no limit).</p><p>For example, setting the dropdown to 10% and the 'Up To:' box to 50 for 'Shield' will cause a Shield to be automatically purchased whenever the cost of the next Shield is less than 10% of your Wood, as long as you have less than 50 Shields.</p></div>";
		tooltipText += "<table id='autoPurchaseConfigTable'><tbody><tr>";
		var count = 0;
		var setting, selectedPerc, checkbox, options, type;
		var settingGroup = getAutoEquipSetting();
		for (var item in game.equipment){
			var equipment = game.equipment[item];
			if (count != 0 && count % 2 == 0) tooltipText += "</tr><tr>";
			setting = settingGroup[item];
			selectedPerc = (setting) ? setting.value : 0.1;
			type = ((equipment.health) ? "Armor" : "Wep");
			checkbox = buildNiceCheckbox('equipConfig' + item, 'autoCheckbox checkbox' + type, (setting && setting.enabled));
			options = "<option value='0.1'" + ((selectedPerc == 0.1) ? " selected" : "") + ">0.1%</option><option value='1'" + ((selectedPerc == 1) ? " selected" : "") + ">1%</option><option value='5'" + ((selectedPerc == 5) ? " selected" : "") + ">5%</option><option value='10'" + ((selectedPerc == 10) ? " selected" : "") + ">10%</option><option value='25'" + ((selectedPerc == 25) ? " selected" : "") + ">25%</option><option value='50'" + ((selectedPerc == 50) ? " selected" : "") + ">50%</option><option value='99'" + ((selectedPerc == 99) ? " selected" : "") + ">99%</option>";
			tooltipText += "<td><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select class='equipSelect" + type + "' id='equipSelect" + item + "'>" + options + "</select></div><div class='col-xs-4 lowPad' style='text-align: right'>Up To: <input class='equipConfigQuantity' id='equipQuant" + item + "' type='number'  value='" + ((setting && setting.buyMax) ? setting.buyMax : 0 ) + "'/></div></div></td>";
			count++;
		}
		tooltipText += "</tr><tr><td></td></tr></tbody></table>";

		options = "<option value='0'>Apply Percent to All</option><option value='0.1'>0.1%</option><option value='1'>1%</option><option value='5'>5%</option><option value='10'>10%</option><option value='25'>25%</option><option value='50'>50%</option><option value='99'>99%</option>";
		tooltipText += "<table id='autoEquipMiscTable'><tbody><tr>";
		tooltipText += "<td><span data-nexton='true' onclick='uncheckAutoEquip(\"Armor\", this)' class='toggleAllBtn btn colorPrimary btn-md'>Toggle All Armor On</span></td>";
		tooltipText += "<td><select class='toggleAllBtn' onchange='setAllAutoEquipPercent(\"Armor\", this)'>" + options + "</select></td>";
		var highestTierOn = (settingGroup.highestTier === true);
		tooltipText += "<td><span data-on='" + (highestTierOn) + "' onclick='toggleAutoEquipHighestTier(this)' id='highestTierOnlyBtn' class='toggleAllBtn btn color" + ((highestTierOn) ? "Success" : "Danger") + " btn-md'>Only Buy From Highest Tier" + ((highestTierOn) ? " On" : " Off") + "</span></td>";
		tooltipText += "<td><span data-nexton='true' onclick='uncheckAutoEquip(\"Wep\", this)' class='toggleAllBtn btn colorPrimary btn-md'>Toggle All Weapons On</span></td>";
		tooltipText += "<td><select class='toggleAllBtn' onchange='setAllAutoEquipPercent(\"Wep\", this)'>" + options + "</select></td>";
		tooltipText += "</tr></tbody></table>";

		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-lg btn-info' onclick='saveAutoEquipConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "25%";
		elem.style.top = "25%";
		ondisplay = function(){
			verticalCenterTooltip(false, true);
		};
	}
	if (what == "AutoEquip"){
		tooltipText = "<p>The Auspicious Presence has blessed your Trimps with the ability to automatically upgrade their own equipment! Click the cog icon on the right side of this button to tell your Trimps what they should upgrade and when to do it, then click the left side of the button to tell them to start or stop.</p>";
		costText = "";
	}
	if (what == "Configure Generator State"){
		geneMenuOpen = true;
		elem = document.getElementById('tooltipDiv2');
		tip2 = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		tooltipText = "<div style='padding: 1.5vw;'><div style='color: red; font-size: 1.1em; text-align: center;' id='genStateConfigError'></div>"
		tooltipText += "<div id='genStateConfigTooltip'>" + getGenStateConfigTooltip() + "</div>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveGenStateConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
	}
	if (what == "Rename SA Preset"){
		what += " " + textString;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		tooltipText = autoBattle.renamePresetTooltip(textString);
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' onclick='autoBattle.savePresetName(" + textString + ")' class='btn-lg btn autoItemEquipped'>Save</div><div class='btn btn-lg autoItemHide' onclick='autoBattle.popup(false,false,false,true);'>Cancel</div>";
	}
	if (what == "Configure AutoJobs"){
		tooltipText = "<div style='color: red; font-size: 1.1em; text-align: center;' id='autoJobsError'></div><p>Welcome to AutoJobs! <span id='autoTooltipHelpBtn' role='button' style='font-size: 0.6vw;' class='btn btn-md btn-info' onclick='toggleAutoTooltipHelp()'>Help</span></p><div id='autoTooltipHelpDiv' style='display: none'><p>The left side of this window is dedicated to jobs that are limited more by workspaces than resources. 1:1:1:1 will purchase all 4 of these ratio-based jobs evenly, and the ratio refers to the amount of workspaces you wish to dedicate to each job. You can use any number larger than 0. Ratio-based jobs will be purchased once at the end of every Zone AND once every 30 seconds, but not more often than once every 2 seconds.</p><p>The right side of this window is dedicated to jobs limited more by resources than workspaces. Set the dropdown to the percentage of resources that you'd like to be spent on each job, and add a max amount if you wish (0 for unlimited). Percentage-based jobs are purchased once every 2 seconds.</p></div><table id='autoStructureConfigTable' style='font-size: 1.1vw;'><tbody>";
		var percentJobs = ["Explorer"];
		if (game.global.universe == 1){
			if (game.global.highestLevelCleared >= 229)	percentJobs.push("Magmamancer");
			percentJobs.push("Trainer");
		}
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 29) percentJobs.push("Meteorologist");
		if (game.global.universe == 2 && game.global.highestRadonLevelCleared > 49) percentJobs.push("Worshipper");
		var ratioJobs = ["Farmer", "Lumberjack", "Miner", "Scientist"];
		var count = 0;
		var sciMax = 1;
		var settingGroup = getAutoJobsSetting();
		for (var x = 0; x < ratioJobs.length; x++){
			tooltipText += "<tr>";
			var item = ratioJobs[x];
			var setting = settingGroup[item];
			var selectedPerc = (setting) ? setting.value : 0.1;
			var max;	
			var checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));
			tooltipText += "<td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div class='col-xs-6 lowPad' style='text-align: right'>Ratio: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' type='number'  value='" + ((setting && setting.ratio) ? setting.ratio : 1 ) + "'/></div></div>"
			if (ratioJobs[x] == "Scientist"){
				max = ((setting && setting.buyMax) ? setting.buyMax : 0 );
				if (max > 1e4) max = max.toExponential().replace('+', '');
				sciMax = max;
				if (percentJobs.length < 4) tooltipText += "</td><td style='width: 60%'><div class='row' style='width: 50%; border: 0; text-align: left;'><span style='padding-left: 0.4vw'>&nbsp;</span>Up To: <input class='jobConfigQuantity' id='autoJobQuant" + item + "' value='" + prettify(max) + "'/></div></td>"
			}
			else tooltipText += "</td>";
			if (percentJobs.length > x){
				item = percentJobs[x];
				setting = settingGroup[item];
				selectedPerc = (setting) ? setting.value : 0.1;
				max = ((setting && setting.buyMax) ? setting.buyMax : 0 );
				if (max > 1e4) max = max.toExponential().replace('+', '');	
				checkbox = buildNiceCheckbox('autoJobCheckbox' + item, 'autoCheckbox', (setting && setting.enabled));	
				var options = "<option value='0.1'" + ((selectedPerc == 0.001) ? " selected" : "") + ">0.1%</option><option value='1'" + ((selectedPerc == .01) ? " selected" : "") + ">1%</option><option value='5'" + ((selectedPerc == .05) ? " selected" : "") + ">5%</option><option value='10'" + ((selectedPerc == .10) ? " selected" : "") + ">10%</option><option value='25'" + ((selectedPerc == .25) ? " selected" : "") + ">25%</option><option value='50'" + ((selectedPerc == .50) ? " selected" : "") + ">50%</option><option value='99'" + ((selectedPerc == .99) ? " selected" : "") + ">99%</option>";
				tooltipText += "<td style='width: 60%'><div class='row'><div class='col-xs-5' style='padding-right: 5px'>" + checkbox + "&nbsp;&nbsp;<span>" + item + "</span></div><div style='text-align: center; padding-left: 0px;' class='col-xs-2'><select  id='autoJobSelect" + item + "'>" + options + "</select></div><div class='col-xs-5 lowPad' style='text-align: right'>Up To: <input class='jobConfigQuantity' id='autoJobQuant" + item + "'  value='" + prettify(max) + "'/></div></div></td></tr>";	
			}
		}
		if (percentJobs.length >= 4) tooltipText += "<tr><td style='width: 40%'><div class='row'><div class='col-xs-6' style='padding-right: 5px'>&nbsp;</div><div class='col-xs-6 lowPad' style='text-align: right'>Up To: <input class='jobConfigQuantity' id='autoJobQuantScientist2' value='" + prettify(sciMax) + "'></div></div></td><td style='width: 60%'>&nbsp;</td></tr>";
		tooltipText += "<tr><td style='width: 40%'><div class='col-xs-7' style='padding-right: 5px'>Gather on Portal:</div><div class='col-xs-5 lowPad' style='text-align: right'><select style='width: 100%' id='autoJobSelfGather'><option value='0'>Nothing</option>";
		var values = ['Food', 'Wood', 'Metal', 'Science'];
		for (var x = 0; x < values.length; x++){
			tooltipText += "<option" + ((settingGroup.portalGather && settingGroup.portalGather == values[x].toLowerCase()) ? " selected='selected'" : "") + " value='" + values[x].toLowerCase() + "'>" + values[x] + "</option>";
		}
		tooltipText += "</select></div></td></tr>";
		tooltipText += "</tbody></table>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='saveAutoJobsConfig()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function(){
			verticalCenterTooltip(true);
		};
	}
	if (what == "Archaeology Automator" && !isItIn){
		tooltipText = game.challenges.Archaeology.automatorTooltip();
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn-lg btn btn-info' onclick='game.challenges.Archaeology.saveAutomator()'>Apply</div><div class='btn btn-lg btn-danger' onclick='cancelTooltip()'>Cancel</div><div class='btn btn-lg btn-" + ((game.challenges.Archaeology.pauseAuto) ? 'primary' : 'warning') + "' onclick='game.challenges.Archaeology.pauseAuto = !game.challenges.Archaeology.pauseAuto; this.className = \"btn btn-lg btn-\" + ((game.challenges.Archaeology.pauseAuto) ? \"primary\" : \"warning\"); this.innerHTML = ((game.challenges.Archaeology.pauseAuto) ? \"Unpause Automator\" : \"Pause Automator\");'>" + ((game.challenges.Archaeology.pauseAuto) ? "Unpause" : "Pause") + " Automator</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function(){
			verticalCenterTooltip(true);
		};
	}
	if (what == "AutoJobs"){
		tooltipText = "<p>Your continued mastery of this world has enabled you to set rules for automatic job allocation. Click the cog icon on the right side of this button to tell your Human Resourceimps what you want and when you want it, then click the left side of the button to tell them to start or stop.</p>";
		costText = "";
	}
	if (what == "AutoGold"){
		var heName = heliumOrRadon();
		var voidHeName = (game.global.universe == 2) ? "Voidon" : "Voidlium";
		tooltipText = '<p>Thanks to your brilliant Scientists, you can designate Golden Upgrades to be purchased automatically! Toggle between: </p><p><b>AutoGold Off</b> when you\'re not feeling particularly trusting.</p><p><b>AutoGold ' + heName + ' (' + game.goldenUpgrades.Helium.purchasedAt.length + '/' + Math.round(game.goldenUpgrades.Helium.currentBonus * 100) + '%)</b> when you\'re looking to boost your Perk game. 4/5 Trimps agree that this will increase your overall ' + heliumOrRadon() + ' earned, though none of the 5 really understood the question.</p><p><b>AutoGold Battle (' + game.goldenUpgrades.Battle.purchasedAt.length + '/' + Math.round(game.goldenUpgrades.Battle.currentBonus * 100) + '%)</b> if your Trimps have a tendency to slack off when you turn your back.</p>';
		tooltipText += '<p><b>AutoGold Void (' + game.goldenUpgrades.Void.purchasedAt.length + '/' + Math.round(game.goldenUpgrades.Void.currentBonus * 100) + '%)</b> which comes in 2 different flavors';
		if (getTotalPortals() == 0) tooltipText += ", but you can't find Void Maps until you've found the Portal Device at least once, so you can't use them.</p>";
		else tooltipText += ':<br/><b>' + voidHeName + '</b> - Will entrust your Scientists with purchasing as many Golden Voids as possible (to reach 72%) before switching to Golden ' + heName + ', or...<br/><b>Voidtle</b> - Where your Scientists will again attempt to buy as many Golden Voids as possible (to reach 72%), but will instead switch to Golden Battle afterwards.</p>';
		if (game.global.canGuString) tooltipText += "<p><b>Custom AutoGold</b> - For the advanced Trimp commander/archaeologist who wants even more control. <b>Ctrl Click to customize your string</b></p>"
		tooltipText += '<p>Please allow 4 seconds for Trimp retraining after clicking this button before any Golden Upgrades are automatically purchased, and don\'t forget to frequently thank your scientists! Seriously, they get moody.</p>';
		costText = "";
	}
	if (what == "Unliving"){
		var stacks = game.challenges.Life.stacks;
		var mult = game.challenges.Life.getHealthMult(true);
		if (stacks > 130) tooltipText = "Your Trimps are looking quite dead, which is very healthy in this dimension. You're doing a great job!";
		else if (stacks > 75) tooltipText = "Your Trimps are starting to look more lively and slow down, but at least they're still fairly pale.";
		else if (stacks > 30) tooltipText = "The Bad Guys in this dimension seem to be way more dead than your Trimps!";
		else tooltipText = "Your Trimps look perfectly normal and healthy now, which is not what you want in this dimension.";
		tooltipText += " <b>Trimp attack and health increased by " + mult + ".</b>";
		costText = "";
	}
	if (what == "AutoGolden Unlocked"){
		tooltipText = "<p>Your Trimps have extracted and processed many Golden Upgrades by now, and though you're still nervous to leave things completely to them, you figure they can probably handle doing this on their own as well. You find the nearest Trimp and ask if he could handle buying Golden Upgrades on his own, as long as you told him which ones to buy. You can tell by the puddle of drool rapidly gaining mass at his feet that this is going to take either magic or a lot of hard work.</p><p>You can't find any magic anywhere, so you decide to found Trimp University, a school dedicated to teaching Trimps how to extract the might of Golden Upgrades without any assistance. Weeks go by while you and your Trimps work tirelessly to set up the University, choosing only the finest building materials and hiring only the most renowned Foremen to draw the plans. Just as you're finishing up, a Scientist stops by, sees what you're doing, and offers to just handle the Golden Upgrades instead. Probably should have just asked one of them first.</p><p><b>You have unlocked AutoGolden!</b></p>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Close</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";

	}
	if (what == "Poisoned"){
		tooltipText = "This enemy is harmed by the Empowerment of Poison, and is taking " + prettify(game.empowerments.Poison.getDamage()) + " extra damage per turn.";
		costText = "";
	}
	if (what == "Chilled"){
		tooltipText = "This enemy has been chilled by the Empowerment of Ice, is taking " + prettify(game.empowerments.Ice.getDamageModifier() * 100) + "% more damage, and is dealing " + prettify((1 - game.empowerments.Ice.getCombatModifier()) * 100) + "% less damage with each normal attack." + game.empowerments.Ice.overkillDesc();
		costText = "";
	}
	if (what == "Breezy"){
		var heliumText = (!game.global.mapsActive)? "increasing all Helium gained by " + prettify(game.empowerments.Wind.getCombatModifier(true) * 100) + "% and all other" : "increasing all non-Helium ";
		tooltipText = "There is a rather large amount of Wind swelling around this enemy, " + heliumText + " resources by " + prettify(game.empowerments.Wind.getCombatModifier() * 100) + "%.";
		costText = "";
	}
	if (what == "Perk Preset"){
		if (textString == "Save"){
			what = "Save Perk Preset";
			tooltipText = "Click to save your current perk loadout to the selected preset";
		}
		else if (textString == "Rename"){
			what = "Rename Perk Preset";
			tooltipText = "Click to set a name for your currently selected perk preset";
		}
		else if (textString == "Load"){
			what = "Load Perk Preset";
			tooltipText = "Click to load your currently selected perk preset.";
			if (!game.global.respecActive) tooltipText += " <p class='red'>You must have your Respec active to load a preset!</p>";
		}
		else if (textString == "Import"){
			what = "Import Perk Preset";
			tooltipText = "Click to import a perk setup from a text string";
		}
		else if (textString == "Export"){
			what = "Export Perk Setup";
			tooltipText = "Click to export a copy of your current perk setup to share with friends, or to save and import later!"
		}
		else if (textString > 0 && textString <= 3){
			var presetGroup = (portalUniverse == 2) ? game.global.perkPresetU2 : game.global.perkPresetU1;
			var preset = presetGroup["perkPreset" + textString];
			if (typeof preset === 'undefined') return;
			what = (preset.Name) ? "Preset: " + preset.Name : "Preset " + textString;
			if (isObjectEmpty(preset)){
				tooltipText = "<span class='red'>This Preset slot is empty!</span> Select this slot and then click 'Save' to save your current Perk configuration to this slot. You'll be able to load this configuration back whenever you want, as long as you have your Respec active.";
			}
			else{
				tooltipText = "<p style='font-weight: bold'>This Preset holds:</p>";
				var count = 0;
				for (var item in preset){
					if (item == "Name") continue;
					tooltipText += (count > 0) ? ", " : "";
					tooltipText += '<b>' + item.replace('_', '&nbsp;') + ":</b>&nbsp;" + preset[item];
					count++;
				}
			}
		}
	}
	if (what == "Rename Preset"){
		what == "Rename Preset " + selectedPreset;
		var presetGroup = (portalUniverse == 2) ? game.global.perkPresetU2 : game.global.perkPresetU1;
		tooltipText = "Type a name below for your Perk Preset! This name will show up on the Preset bar and make it easy to identify which Preset is which."
		if (textString) tooltipText += " <b>Max of 1,000 for most perks</b>";
		var preset = presetGroup["perkPreset" + selectedPreset];
		var oldName = (preset && preset.Name) ? preset.Name : "";
		tooltipText += "<br/><br/><input id='renamePresetBox' maxlength='25' style='width: 50%' value='" + oldName + "' />";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='renamePerkPreset()'>Apply</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function() {
			var box = document.getElementById("renamePresetBox");
			// Chrome chokes on setSelectionRange on a number box; fall back to select()
			try { box.setSelectionRange(0, box.value.length); }
			catch (e) { box.select(); }
			box.focus();
		};
		noExtraCheck = true;

	}
	if (what == "UnlockedChallenge2"){
		what = "Unlocked Challenge<sup>2</sup>";
		tooltipText = "You hear some strange noises behind you and turn around to see three excited scientists. They inform you that they've figured out a way to modify The Portal to take you to a new type of challenging dimension, a system they proudly call 'Challenge<sup>2</sup>'. You will be able to activate and check out their new technology by clicking the 'Challenge<sup>2</sup>' button next time you go to use The Portal.";
		game.global.lockTooltip = true;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Scientists</div></div>";
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "UnlockedChallenge3"){
		what = "Unlocked Challenge<sup>3</sup>";
		tooltipText = "You hear some strange noises behind you and turn around to see nine excited scientists. They inform you that they've figured out a way to modify The Portal to take you to a new type of challenging dimension, a system they proudly call 'Challenge<sup>3</sup>'. It seems as if the difference between Challenge<sup>2</sup> and Challenge<sup>3</sup> allows them to combine multiplicatively into your Challenge<sup><span class='icomoon icon-infinity'></span></sup> bonus.";
		game.global.lockTooltip = true;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Scientists</div></div>";
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Eggs"){
		tooltipText = '<span class="eggMessage">It seems as if some sort of animal has placed a bunch of brightly colored eggs in the world. If you happen to see one, you can click on it to send a Trimp to pick it up! According to your scientists, they have a rare chance to contain some neat stuff, but they will not last forever...</span>';
		game.global.lockTooltip = true;
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>I'll keep an eye out.</div></div>";
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Portal"){
		tooltipText = "The portal device you found shines " + ((game.global.universe == 1) ? "green" : "blue") + " in the lab. Such a familiar shade... (Hotkey: T)";
		costText = "";
	}
	if (what == "Repeat Map"){
		tooltipText = "Allow the Trimps to find their way back to square 1 once they finish without your help. They grow up so fast. <br/><br/>If you are <b>not</b> repeating, your current group of Trimps will not be abandoned after the map ends. (Hotkey: R)";
		costText = "";
	}
	if (what == "Challenge2"){
		var sup = (portalUniverse == 1 || game.global.highestRadonLevelCleared < 49) ? "2" : "3";
		what = "Challenge<sup>" + sup + "</sup>";
		tooltipText = "";
		var rewardEach = squaredConfig.rewardEach;
		var rewardGrowth = squaredConfig.rewardGrowth;
		var uniArray = countChallengeSquaredReward(false, false, true);
		if (game.talents.mesmer.purchased){
			rewardEach *= 3;
			rewardGrowth *= 3;
		}
		if (portalUniverse == 2 && game.global.highestRadonLevelCleared < 49){
			tooltipText = "<p><b style='color: #003b99'>Reach Zone 50 in Universe 2 to unlock Challenge<sup>3</sup>, which combine multiplicatively with your Challenge<sup>2</sup>. Just imagine the possibilities!</b></p>"
		}
		else{
			if (!textString)
				tooltipText = "<p>Click to toggle a challenge mode for your challenges!</p>";
			tooltipText += "<p>In Challenge<sup>" + sup + "</sup> mode, you can re-run some challenges in order to earn a permanent attack, health, and " + heliumOrRadon() + " bonus for your Trimps. MOST Challenge<sup>" + sup + "</sup>s will grant <b>" + rewardEach + "% " + ((sup == 2) ? "attack and health and " + prettify(rewardEach / 10) + "% increased " + heliumOrRadon() : "Challenge<sup>" + sup + "</sup> bonus") + " for every " + squaredConfig.rewardFreq + " Zones reached. Every " + squaredConfig.thresh + " Zones, " + ((sup == 2) ? "the attack and health bonus will increase by an additional " + rewardGrowth + "%, and the " + heliumOrRadon() + " bonus will increase by " + prettify(rewardGrowth / 10) + "%" : "this bonus will increase by an additional " + rewardGrowth + "%") + "</b>. This bonus is additive with all available Challenge<sup>" + sup + "</sup>s, and your highest Zone reached for each challenge is saved and used.</p><p><b>No Challenge<sup>" + sup + "</sup>s end at any specific Zone</b>, they can only be completed by using your portal or abandoning through the 'View Perks' menu. However, <b>no " + heliumOrRadon() + " can drop, and no bonus " + heliumOrRadon() + " will be earned during or after the run</b>. Void Maps will still drop heirlooms, and all other currency can still be earned.</p>";
		}
		if (game.global.highestRadonLevelCleared >= 49){		
			tooltipText += "<p><b>Challenge<sup>2</sup> stacks multiplicatively with Challenge<sup>3</sup>, creating one big, beautiful Challenge<sup><span class='icomoon icon-infinity'></span></sup> modifier</b>. You have a " + prettify(uniArray[0]) + "% bonus from Challenge<sup>2</sup> in Universe 1, and a " + prettify(uniArray[1]) + "% bonus from Challenge<sup>3</sup> in Universe 2. This brings your total Challenge<sup><span class='icomoon icon-infinity'></span></sup> bonus to <b>" + prettify(game.global.totalSquaredReward) + "</b>, granting " + prettify(game.global.totalSquaredReward) + "% extra attack and health, and " + prettify(game.global.totalSquaredReward / 10) + "% extra " + heliumOrRadon() + ".";
		}
		else
			tooltipText += "<p>You are currently gaining " + prettify(game.global.totalSquaredReward) + "% extra attack and health, and are gaining " + prettify(game.global.totalSquaredReward / 10) + "% extra " + heliumOrRadon() + " thanks to your Challenge<sup>" + sup + "</sup> bonus.</p>";
		if (game.talents.headstart.purchased) tooltipText += "<p><b>Note that your Headstart mastery will be disabled during Challenge<sup>" + sup + "</sup> runs.</b></p>";
		if (portalUniverse == 1 && uniArray[0] >= 35000){
			var color = (uniArray[0] >= 50000) ? " style='color: red;'" : "";
			tooltipText += "<p><b" + color + ">Note that Challenge<sup>2</sup> Bonus is capped at " + prettify(60000) + "%.</b></p>"
		}
		costText = "";
	}
	if (what == "Geneticistassist Settings"){
		if (isItIn == null){
			geneMenuOpen = true;
			elem = document.getElementById('tooltipDiv2');
			tip2 = true;
			var steps = game.global.GeneticistassistSteps;
			tooltipText = "<div id='GATargetError'></div><div>Customize the target thresholds for your Geneticistassist! Use a number between 0.5 and 5000 seconds for all 3 boxes. Each box corresponds to a Geneticistassist toggle threshold.</div><div style='width: 100%'><input class='GACustomInput' id='target1' value='" + steps[1] + "'/><input class='GACustomInput' id='target2' value='" + steps[2] + "'/><input class='GACustomInput' id='target3' value='" + steps[3] + "'/><hr class='noBotMarg'/><div class='maxCenter'>" + getSettingHtml(game.options.menu.gaFire, 'gaFire') + getSettingHtml(game.options.menu.geneSend, 'geneSend') + "</div><hr class='noTopMarg'/><div id='GADisableCheck'>" + buildNiceCheckbox('disableOnUnlockCheck', null, game.options.menu.GeneticistassistTarget.disableOnUnlock) + "&nbsp;Start disabled when unlocked each run</div></div>";
			costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='customizeGATargets();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>"
			elem.style.left = "33.75%";
			elem.style.top = "25%";
		}
	}
	if (what == "Configure Maps"){
		if (isItIn == null){
			geneMenuOpen = true;
			elem = document.getElementById('tooltipDiv2');
			tip2 = true;
			var steps = game.global.GeneticistassistSteps;
			tooltipText = "<div id='GATargetError'></div><div>Customize your settings for running maps!</div>";
			tooltipText += "<hr class='noBotMarg'/><div class='maxCenter'>"
			var settingCount = 0;
			if (game.global.totalPortals >= 1) {
				tooltipText += getSettingHtml(game.options.menu.mapLoot, 'mapLoot', null, "CM");
				settingCount++;
			}
			if (game.global.totalPortals >= 5){
				tooltipText += getSettingHtml(game.options.menu.repeatVoids, 'repeatVoids', null, "CM");
				settingCount++;
			}
			if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
			tooltipText += '<div class="optionContainer"><div class="noselect settingsBtn ' + ((game.global.repeatMap) ? "settingBtn1" : "settingBtn0") + '" id="repeatBtn2" onmouseover="tooltip(\'Repeat Map\', null, event)" onmouseout="tooltip(\'hide\')" onclick="repeatClicked()">' + ((game.global.repeatMap) ? "Repeat On" : "Repeat Off") + '</div></div>';
			settingCount++;
			if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
			tooltipText += getSettingHtml(game.options.menu.repeatUntil, 'repeatUntil', null, "CM");
			settingCount++;
			if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
			tooltipText += getSettingHtml(game.options.menu.exitTo, 'exitTo', null, "CM")
			settingCount++;
			if (game.options.menu.mapsOnSpire.lockUnless() && game.global.universe == 1){
				if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
				tooltipText +=  getSettingHtml(game.options.menu.mapsOnSpire, 'mapsOnSpire', null, "CM");
				settingCount++;
			}
			if (game.global.canMapAtZone){
				if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
				tooltipText +=  getSettingHtml(game.options.menu.mapAtZone, 'mapAtZone', null, "CM");
				settingCount++;
			}
			if (game.global.highestLevelCleared >= 124){
				if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
				tooltipText +=  getSettingHtml(game.options.menu.climbBw, 'climbBw', null, "CM");
				settingCount++;
			}
			if (settingCount % 2 == 0) tooltipText += "<br/><br/>";
			tooltipText += getSettingHtml(game.options.menu.extraMapBtns, 'extraMapBtns', null, "CM")
			settingCount++;
			tooltipText += "</div>";
			costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();'>Close</div></div>"
			elem.style.left = "33.75%";
			elem.style.top = "25%";
		}
	}
	if (what == "Set Map At Zone"){
		var maxSettings = game.options.menu.mapAtZone.getMaxSettings();
		var mazHelp = "Welcome to Map at Zone (also referred to as MaZ)! This is a powerful automation tool that allows you to set when maps should be automatically run, and allows for a high amount of customization. Here's a quick overview of what everything does:<ul><li><span style='padding-left: 0.3%' class='mazDelete'><span class='icomoon icon-cross'></span></span> - Remove this MaZ line completely</li><li><b>Active</b> - A toggle to temporarily disable/enable the entire MaZ line.</li><li><b>Start Zone</b> - The first Zone that this MaZ line should run. Must be between 10 and 1000.</li><li><b>End Zone</b> - Only matters if you're planning on having this MaZ line repeat. If so, the line will stop repeating at this Zone. Must be between 10 and 1000.</li><li><b>Exit At Cell</b> - The cell number between 1 and 100 where this MaZ line should trigger. 1 is the first cell of the Zone, 100 is the final cell. This line will trigger before starting combat against that cell.</li><li><b>Priority</b> - If there are two or more MaZ lines set to trigger at the same cell on the same Zone, the line with the lowest priority will run first. This also determines sort order of lines in the UI.</li><li><b>Run Map</b> - Uncheck this box if you want Map at Zone to just put you into the Map Chamber without running a map. This will stall your run at a specified point until manual intervention.</li><li><b>Use Preset</b> - Select one of your Advanced Maps presets here, to determine what type of map should be created by this MaZ line. You can also choose to run Void Maps or some specific Unique Maps from this dropdown depending on game progress.</li><li><b>Map Repeat</b> - This will toggle your Map Repeat setting On, Off, or leave it as is every time this MaZ line triggers. Set to Repeat On if you want the map to run more than once.</li>";
		mazHelp += "<li><b>Set Repeat Until</b> - This changes your 'Repeat to' setting to the selected choice, allowing you to customize how many times the map should be repeated. If 'Run Bionic' is selected as your Preset, you can select the option 'Climb BW to Level' in this dropdown which will automatically climb Bionic Wonderlands until the set level of map has been cleared of items, then will exit the map.</li><li><b>Exit To</b> - Ensure you're Exiting to World if you want the game to continue progressing after the maps have been completed, or set Exit to Maps if you want the game to wait for manual intervention after completing its map.</li><li><b>Zone Repeat</b> - Set how often this preset should repeat between the Start Zone and End Zone. Preset can be repeated every Zone, or set to a custom number depending on need. Note that when using Zone Repeat with 'Climb BW to Level' that your 'Climb To' setting will be increased by the amount of Zones in between Start Zone and the Zone where this line actually triggers. For example, starting a MaZ line at Z140 to climb BW to Z165 with repeat every 30 Zones will run through BW 165 on Z140, then at Z170 will run through BW 195.</li></ul>"
		tooltipText = "<div id='mazContainer' style='display: block'><div id='mazError'></div><div class='row mazRow titles'><div class='mazCheckbox' style='width: 6%'>Active?</div><div class='mazWorld'>Start<br/>Zone</div><div class='mazThrough'>End<br/>Zone</div><div class='mazCell'>Exit At<br/>Cell</div><div class='mazPrio'>Priority</div><div class='mazCheckbox'>Run Map?</div><div class='mazPreset'>Use<br/>Preset</div><div class='mazRepeat'>Map<br/>Repeat</div><div class='mazRepeatUntil'>Set<br/>Repeat Until</div><div class='mazExit'>Exit To</div><div class='mazTimes'>Zone<br/>Repeat</div></div>";
		var current = game.options.menu.mapAtZone.getSetZone();
		for (var x = 0; x < maxSettings; x++){
			var vals = {
				world: -1,
				cell: 1,
				check: true,
				preset: 0,
				repeat: 0,
				until: 0,
				exit: 0,
				bwWorld: 125,
				times: -1,
				on: true,
				through: 999,
				rx: 10,
				prio: (x + 1),
				tx: 10
			}
			var style = "";
			if (current.length - 1 >= x){
				vals.world = current[x].world;
				vals.check = current[x].check;
				vals.preset = current[x].preset;
				vals.repeat = current[x].repeat;
				vals.until = current[x].until;
				vals.exit = current[x].exit;
				vals.bwWorld = current[x].bwWorld;
				vals.times = (current[x].times) ? current[x].times : -1;
				vals.cell = (current[x].cell) ? current[x].cell : 1;
				vals.on = (current[x].on === false) ? false : true;
				vals.through = (current[x].through) ? current[x].through : 999;
				vals.rx = (current[x].rx) ? current[x].rx : 10;
				vals.tx = (current[x].tx) ? current[x].tx : 10;
			}
			else style = " style='display: none' ";
			var presetDropdown = "<option value='0'" + ((vals.preset == 0) ? " selected='selected'" : "") + ">" + getPresetDescription(1) + "</option><option value='1'" + ((vals.preset == 1) ? " selected='selected'" : "") + ">" + getPresetDescription(2) + "</option><option value='2'" + ((vals.preset == 2) ? " selected='selected'" : "") + ">" + getPresetDescription(3) + "</option><option value='6'" + ((vals.preset == 6) ? " selected='selected'" : "") + ">" + getPresetDescription(4) + "</option><option value='7'" + ((vals.preset == 7) ? " selected='selected'" : "") + ">" + getPresetDescription(5) + "</option><option value='3'" + ((vals.preset == 3) ? " selected='selected'" : "") + ">Run Bionic</option><option value='4'" + ((vals.preset == 4) ? " selected='selected'" : "") + ">Run Void</option>";
			if (game.global.universe == 2 && game.global.highestRadonLevelCleared >= 49) presetDropdown += "<option value='8'" + ((vals.preset == 8) ? " selected='selected'" : "") + ">Melting Point</option>";
			if (game.global.universe == 2 && game.global.highestRadonLevelCleared >= 69) presetDropdown += "<option value='5'" + ((vals.preset == 5) ? " selected='selected'" : "") + ">Black Bog</option>";
			if (game.global.universe == 2 && game.global.highestRadonLevelCleared >= 174) presetDropdown += "<option value='9'" + ((vals.preset == 9) ? " selected='selected'" : "") + ">Frozen Castle</option>";
			var repeatDropdown = "<option value='0'" + ((vals.repeat == 0) ? " selected='selected'" : "") + ">No Change</option><option value='1'" + ((vals.repeat == 1) ? " selected='selected'" : "") + ">On</option><option value='2'" + ((vals.repeat == 2) ? " selected='selected'" : "") + ">Off</option>";
			var repeatUntilDropdown = "<option value='0'" + ((vals.until == 0) ? " selected='selected'" : "") + ">Don't Change</option><option value='1'" + ((vals.until == 1) ? " selected='selected'" : "") + ">Repeat Forever</option><option value='2'" + ((vals.until == 2) ? " selected='selected'" : "") + ">Repeat to 10</option><option value='3'" + ((vals.until == 3) ? " selected='selected'" : "") + ">Repeat for Items</option><option value='4'" + ((vals.until == 4) ? " selected='selected'" : "") + ">Repeat for Any</option><option class='mazBwClimbOption' value='5'" + ((vals.until == 5) ? " selected='selected'" : "") + ">Climb BW to Level</option><option value='6'" + ((vals.until == 6) ? " selected='selected'" : "") + ">Repeat 25 Times</option><option value='7'" + ((vals.until == 7) ? " selected='selected'" : "") + ">Repeat 50 Times</option><option value='8'" + ((vals.until == 8) ? " selected='selected'" : "") + ">Repeat 100 Times</option><option value='9'" + ((vals.until == 9) ? " selected='selected'" : "") + ">Repeat X Times</option>"	
			var exitDropdown = "<option value='0'" + ((vals.exit == 0) ? " selected='selected'" : "") + ">No Change</option><option value='1'" + ((vals.exit == 1) ? " selected='selected'" : "") + ">Maps</option><option value='2'" + ((vals.exit == 2) ? " selected='selected'" : "") + ">World</option>";
			var timesDropdown = "<option value='-1'" + ((vals.times == -1) ? " selected='selected'" : "") + ">Just This Zone</option><option value='1'" + ((vals.times == 1) ? " selected='selected'" : "") + ">Every Zone</option><option value='2'" + ((vals.times == 2) ? " selected='selected'" : "") + ">Every Other Zone</option><option value='3'" + ((vals.times == 3) ? " selected='selected'" : "") + ">Every 3 Zones</option><option value='5'" + ((vals.times == 5) ? " selected='selected'" : "") + ">Every 5 Zones</option><option value='10'" + ((vals.times == 10) ? " selected='selected'" : "") + ">Every 10 Zones</option><option value='30'" + ((vals.times == 30) ? " selected='selected'" : "") + ">Every 30 Zones</option><option value='-2'" + ((vals.times == -2) ? " selected='selected'" : "") + ">Every X Zones</option>";
			var className = (vals.preset == 3) ? "mazBwMainOn" : "mazBwMainOff";
			className += (vals.preset == 3 && vals.until == 5) ? " mazBwZoneOn" : " mazBwZoneOff"
			className += (vals.until == 9) ? " mazRxOn" : " mazRxOff";
			className += (vals.times == -2) ? " mazTxOn" : " mazTxOff";
			tooltipText += "<div id='mazRow" + x + "' class='row mazRow " + className + "'" + style + ">";
			tooltipText += "<div class='mazDelete' onclick='game.options.menu.mapAtZone.removeRow(" + x + ")'><span class='icomoon icon-cross'></span></div>";
			tooltipText += "<div class='mazCheckbox' style='text-align: center;'>" + buildNiceCheckbox("mazEnableSetting" + x, null, vals.on) + "</div>";
			tooltipText += "<div class='mazWorld'><input value='" + vals.world + "' type='number' id='mazWorld" + x + "'/></div>";
			tooltipText += "<div class='mazThrough'><input value='" + vals.through + "' type='number' id='mazThrough" + x + "'/></div>";
			tooltipText += "<div class='mazCell'><input value='" + vals.cell + "' type='number' id='mazCell" + x + "'/></div>";
			tooltipText += "<div class='mazPrio'><input value='" + vals.prio + "' type='number' id='mazPrio" + x + "'/></div>";
			tooltipText += "<div class='mazCheckbox' style='text-align: center;'>" + buildNiceCheckbox("mazCheckbox" + x, null, vals.check) + "</div>";
			tooltipText += "<div class='mazPreset' onchange='updateMazPreset(" + x + ")'><select value='" + vals.preset + "' id='mazPreset" + x + "'>" + presetDropdown + "</select></div>"
			tooltipText += "<div class='mazRepeat'><select value='" + vals.repeat + "' id='mazRepeat" + x + "'>" + repeatDropdown + "</select></div>";
			tooltipText += "<div class='mazRepeatUntil' onchange='updateMazPreset(" + x + ")'><select value='" + vals.until + "' id='mazRepeatUntil" + x + "'>" + repeatUntilDropdown + "</select></div>";
			tooltipText += "<div class='mazRx'><div style='text-align: center;'>X&nbsp;Times</div><input value='" + vals.rx + "' type='number' id='mazRx" + x + "'/></div>";
			tooltipText += "<div class='mazBwWorld'><div style='text-align: center; margin-left: -0.5vw;'>Climb&nbsp;To</div><input value='" + vals.bwWorld + "' type='number' id='mazBwWorld" + x + "'/></div>";
			tooltipText += "<div class='mazExit'><select value='" + vals.exit + "' id='mazExit" + x + "'>" + exitDropdown + "</select></div>";
			tooltipText += "<div class='mazTimes select' onchange='updateMazPreset(" + x + ")'><select value='" + vals.times + "' id='mazTimes" + x + "'>" + timesDropdown + "</select></div>";
			tooltipText += "<div class='mazTx'><div style='text-align: center;'>X&nbsp;Zones</div><input value='" + vals.tx + "' type='number' id='mazTx" + x + "'/></div>";
			tooltipText += "</div>"
		}
		tooltipText += "<div id='mazAddRowBtn' style='display: " + ((current.length < maxSettings) ? "inline-block" : "none") + "' class='btn btn-success btn-md' onclick='game.options.menu.mapAtZone.addRow()'>+ Add Row</div>"
		var currentPreset = ((game.global.universe == 1 && game.options.menu.mapAtZone.U1Mode == 'a') || (game.global.universe == 2 && game.options.menu.mapAtZone.U2Mode == 'a')) ? "a" : "b";
		tooltipText += "<div id='mazSwapPresetBtn' style='display: " + ((game.talents.maz.purchased) ? "inline-block" : "none") + "' class='btn btn-" + ((currentPreset == "a") ? "info" : "danger") + " btn-md' onclick='game.options.menu.mapAtZone.swapPreset()'>Swap to Preset " + ((currentPreset == "a") ? "B" : "A") + "</div>";
		tooltipText += "</div><div style='display: none' id='mazHelpContainer'>" + mazHelp + "</div>";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='game.options.menu.mapAtZone.save()'>Save and Close</span><span class='btn btn-danger btn-md' onclick='cancelTooltip(true)'>Cancel</span><span class='btn btn-primary btn-md' id='confirmTooltipBtn' onclick='game.options.menu.mapAtZone.save(true)'>Save</span><span class='btn btn-info btn-md' onclick='game.options.menu.mapAtZone.toggleHelp()'>Help</span></div>"
		game.global.lockTooltip = true;
		elem.style.top = "25%";
		elem.style.left = "10%";
		swapClass('tooltipExtra', 'tooltipExtraGigantic', elem);
	}
	if (what == "Change Heirloom Icon"){
		var heirloom = getSelectedHeirloom();
		var icons = [];
		tooltipText = "<div style='width: 100%; height: 100%; background-color: black; text-align: center;'>";
		if (heirloom.type == "Shield"){
			icons = ["*shield3", "*shield", "*shield2",  "*heart3", "*star2", "*road2", "*fast-forward", "*trophy3", "*eraser"];
		}
		if (heirloom.type == "Staff"){
			icons = ["grain", "apple", "tree-deciduous", "*cubes", "*diamond", "*lab-flask", "*key", "*hour-glass", "*flag", "*feather", "*edit"];
		}
		if (heirloom.type == "Core"){
			icons = ["adjust", "*compass", "*cog", "*battery", "*adjust", "*cloud", "*yingyang"]
		}
		for (var x = 0; x < icons.length; x++){
			tooltipText += "<div class='heirloomChangeIcon heirloomRare" + heirloom.rarity + "' onclick='saveHeirloomIcon(\"" + icons[x] + "\")'>" + convertIconNameToSpan(icons[x]) + "</div>";
		}
		tooltipText += "</div>"
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='cancelTooltip(true)'>Close</span></div>"
	}
	if (what == "Change Portal Color"){
		var tiers = 6;
		tooltipText = "<div style='width: 100%; height: 100%; background-color: black; text-align: center;'>";
		
		for (var x = 1; x < tiers + 1; x++){
			var selected = (game.global.portalColor == x || (game.global.portalColor == 0 && x == 6)) ? " selected" : "";
			tooltipText += "<div class='pointer portalPreview portalMk" + x + selected + "' onclick='savePortalColor(" + x + ")'>" + x + "</div>";
		}
		tooltipText += "</div>"
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		costText = "<div class='maxCenter'><span class='btn btn-success btn-md' id='confirmTooltipBtn' onclick='cancelTooltip(true)'>Close</span></div>"
	}
	if (what == "Message Config"){
		tooltipText = "<div id='messageConfigMessage'>Here you can finely tune your message settings, to see only what you want from each category. Mouse over the name of a filter for more info.</div>";
		var msgs = game.global.messages;
		var toCheck = ["Loot", "Unlocks", "Combat"];
		tooltipText += "<div class='row'>";
		for (var x = 0; x < toCheck.length; x++){
			var name = toCheck[x];
			tooltipText += "<div class='col-xs-4'><span class='messageConfigTitle'>" + toCheck[x] + "</span><br/>";
			for (var item in msgs[name]){
				if (item == "essence" && game.global.highestLevelCleared < 179) continue;
				if (item == "magma" && game.global.highestLevelCleared < 229) continue;
				if (item == "cache" && game.global.highestLevelCleared < 59) continue;
				if (item == "token" && game.global.highestLevelCleared < 235) continue;
				if (item == "exp" && game.global.highestRadonLevelCleared < 49) continue;
				if (item == 'enabled') continue;
				var realName = item;
				if (item == "helium" && game.global.universe == 2) realName = "radon";
				if (item == "voidMaps"){
					if (game.global.totalPortals < 5) continue;
					realName = "Void Maps";
				}
				tooltipText += "<span class='messageConfigContainer'><span class='messageCheckboxHolder'>" + buildNiceCheckbox(name + item, 'messageConfigCheckbox', (msgs[name][item])) + "</span><span onmouseover='messageConfigHover(\"" + name + item + "\", event)' onmouseout='tooltip(\"hide\")' class='messageNameHolder'> - " + realName.charAt(0).toUpperCase() + realName.substr(1) + "</span></span><br/>";
			}
			tooltipText += "</div>";
		}
		tooltipText += "</div>";
		ondisplay = function () {verticalCenterTooltip();};
		game.global.lockTooltip = true;
		elem.style.top = "25%";
		elem.style.left = "25%";
		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip();configMessages();'>Confirm</div> <div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>"
	}
	if (what == "Hotkeys"){
		tooltipText = "<table id='keybindsTable' class='table table-striped'><tbody>";
		tooltipText += "<tr><td class='keybindsTitle' colspan='4'>General</td></tr>";
		tooltipText += "<tr><td>K/k</td><td>Show Hot(K)eys menu</td><td>";
		if (game.global.totalPortals > 0 || game.global.portalActive) tooltipText += "T/t</td><td>Open Por(T)al Window"
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>F5</td><td>Reload the game to the last saved point</td><td>";
		if (game.stats.totalHeirlooms.valueTotal > 0) tooltipText += "L/l</td><td>Open Heir(L)ooms Window";
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>F11</td><td>Toggle Fullscreen</td><td>";
		if (game.stats.totalHeirlooms.valueTotal > 0) tooltipText += "C/c</td><td>Show Heirloom (C)hances on Heirlooms Window"
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>Space</td><td>Pause (if enabled in settings)</td><td>";
		if (game.permaBoneBonuses.boosts.owned > 0) tooltipText += "O/o</td><td>W(O)rship Bone Shrine"
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>F/f</td><td>(F)ight</td><td>";
		if (!game.portal.Equality.radLocked) tooltipText += "E/e</td><td>(E)quality"
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>A/a</td><td>Toggle (A)utoFight</td><td>";
		if (game.global.highestRadonLevelCleared >= 74) tooltipText += "I/i</td><td>Sp(I)re Assault"
		else tooltipText += "</td><td>"
		tooltipText += "</td></tr>";
		tooltipText += "<tr><td>Left/Right</td><td>Usable on windows with <span class='icomoon icon-arrow-left'></span> and <span class='icomoon icon-arrow-right'></span> icons</td><td></td><td></td></tr>";
		tooltipText += "<tr><td>V</td><td>Open AD(V)ISOR</td><td></td><td></td></tr>";
		tooltipText += "<tr><td>Esc</td><td>Close popups/menus. Open Settings if nothing else is open</td><td></td><td></td></tr>";
		if (game.global.highestLevelCleared >= 5){
			tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Maps</td></tr>";
			tooltipText += "<tr><td>M/m</td><td>Toggle (M)aps</td><td>R/r</td><td>Toggle Map (R)epeat</td></tr>";
			tooltipText += "<tr><td>Up</td><td>Increase Map level</td><td>Down</td><td>Decrease Map level</td></tr>";
			tooltipText += "<tr><td>C/c</td><td>(C)ontinue/Run Map</td><td>";
			if (game.global.canMapAtZone) tooltipText += "Z/z</td><td>Map at (Z)one"
			else tooltipText += "</td><td>"
			tooltipText += "</td></tr>";
		}
		if (game.global.highestLevelCleared >= 60){
			tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Formations</td></tr>";
			tooltipText += "<tr><td>X/x/1/Num1</td><td>No Formation</td><td>H/h/2/Num2</td><td>(H)eap</td></tr>";
			if (game.global.highestLevelCleared >= 70 || game.upgrades.Dominance.done > 0){
				tooltipText += "<tr><td>D/d/3/Num3</td><td>(D)ominance</td><td>";
				if (game.global.highestLevelCleared >= 80 || game.upgrades.Barrier.done > 0) tooltipText += "B/b/4/Num4</td><td>(B)arrier"
				else tooltipText += "</td><td>"
				tooltipText += "</td></tr>";
			}
			if (game.global.highestLevelCleared >= 179){
				tooltipText += "<tr><td>S/s/5/Num5</td><td>(S)cryer</td><td>";
				if (game.global.highestLevelCleared >= 239) tooltipText += "W/w/6/Num6</td><td>(W)ind"
				else tooltipText += "</td><td>"
				tooltipText += "</td></tr>";
			}
		}
		if (game.global.spiresCompleted > 0){
			tooltipText += "<tr><td class='keybindsTitle' colspan='4'>Personal Spire</td></tr>";
			tooltipText += "<tr><td>P/p</td><td>Open S(P)ire</td><td>0/Num0</td><td>Sell a trap/tower</td></tr>";
			tooltipText += "<tr><td>1-7/Num1-Num7</td><td colspan='3'>Buy a Trap/Tower</td></tr>";
		}
		tooltipText += "</tbody></table>";
		ondisplay = function () {verticalCenterTooltip();};
		game.global.lockTooltip = true;
		elem.style.top = "25%";
		elem.style.left = "17.5%";
		swapClass('tooltipExtra', 'tooltipExtraSuperLg', elem);
		costText = "<div class='maxCenter'><div class='btn btn-danger' onclick='cancelTooltip()'>Close</div></div>"
	}
	if (isItIn == "goldenUpgrades"){
		var upgrade = game.goldenUpgrades[what];
		var timesPurchased = upgrade.purchasedAt.length
		var s = (timesPurchased == 1) ? "" : "s";
		var three = (game.global.totalPortals >= 5 || (game.global.universe == 2 && game.global.totalRadPortals == 0)) ? "three" : "two";
		tooltipText += " <b>You can only choose one of these " + three + " Golden Upgrades. Choose wisely...</b><br/><br/> Each time Golden Upgrades are unlocked, they will increase in strength. You are currently gaining " + Math.round(upgrade.currentBonus * 100) + "% from purchasing this upgrade " + timesPurchased + " time" + s + " since your last portal.";
		if (what == "Void" && (parseFloat((game.goldenUpgrades.Void.currentBonus + game.goldenUpgrades.Void.nextAmt()).toFixed(2)) > 0.72)) tooltipText += "<br/><br/><b class='red'>This upgrade would put you over 72% increased Void Map chance, which would destabilize the universe. You don't want to destabilize the universe, do you?</b>";
		else if (what == "Void") tooltipText += "<br/><br/><b class='green'>Note: The absolute maximum value for Golden Void is +72%. Golden Void will no longer be able to be purchased if it would increase your bonus above 72%. Plan carefully!</b>";
		if (what == "Helium" && game.global.runningChallengeSquared) tooltipText += "<br/><br/><b class='red'>You can't earn helium while running a Challenge<sup>2</sup>!</b>";
		costText = "Free";
		if (getAvailableGoldenUpgrades() > 1) costText += " (" + getAvailableGoldenUpgrades() + " remaining)";
		var numeral = (usingScreenReader) ? prettify(game.global.goldenUpgrades + 1) : romanNumeral(game.global.goldenUpgrades + 1);
		if (game.global.universe == 2 && what == "Helium") what = "Radon";
		what = "Golden " + what + " (Tier " + numeral + ")";
	}
	if (isItIn == "talents"){
		var talent = game.talents[what];
		tooltipText = talent.description;
		var nextTalCost = getNextTalentCost();
		var thisTierTalents = countPurchasedTalents(talent.tier);
		if (ctrlPressed){
			var highestAffordable = getHighestPurchaseableRow();
			var highestIdeal = getHighestIdealRow();
			var isAffordable = (highestAffordable >= talent.tier);
			var isIdeal = (highestIdeal >= talent.tier);
			if (thisTierTalents == 6) {
				costText = "<span class='green'>You have already purchased this tier!</span>";
			}
			else if (isIdeal) {
				costText = "<span class='green'>You must buy this entire tier to be able to spend all of your Dark Essence.</span>"
			}
			else if (isAffordable) {
				costText = "<span class='green'>You can afford to purchase this entire tier!</span> <span class='red'>However, purchasing this entire tier right now may limit which other Masteries you can reach.</span>"
			}
			else {
				costText = "<span class='red'>You cannot afford to purchase this entire tier.</span>"
			}
		}
		else{
			if (talent.purchased)
				costText = "<span style='color: green'>Purchased</span>";
			else{
				var requiresText = false;
				if (typeof talent.requires !== 'undefined'){
					var requires;
					if (Array.isArray(talent.requires)) requires = talent.requires;
					else requires = [talent.requires];
					var needed = [];
					for (var x = 0; x < requires.length; x++){
						if (!game.talents[requires[x]].purchased){ 
							needed.push(game.talents[requires[x]].name);
						}
					}
					if (needed.length) requiresText = formatListCommasAndStuff(needed);
				}
				if (getAllowedTalentTiers()[talent.tier - 1] < 1 && thisTierTalents < 6){
					costText = "<span style='color: red'>Locked";
					var lastTierTalents = countPurchasedTalents(talent.tier - 1);
					if (lastTierTalents <= 1) costText += " (Buy " + ((lastTierTalents == 0) ? "2 Masteries" : "1 more Mastery") + " from Tier " + (talent.tier - 1) + " to unlock Tier " + talent.tier;
					else costText += " (Buy 1 more Mastery from Tier " + (talent.tier - 1) + " to unlock the next from Tier " + talent.tier;
					if (requiresText) costText += ". This Mastery also requires " + requiresText;
					costText += ")</span>"
				}
				else if (requiresText)
					costText = "<span style='color: red'>Requires " + requiresText + "</span>";
				else if (game.global.essence < nextTalCost && prettify(game.global.essence) != prettify(nextTalCost))
					costText = "<span style='color: red'>" + prettify(nextTalCost) + " Dark Essence (Use Scrying Formation to earn more)</span>";
				else {
					costText = prettify(nextTalCost) + " Dark Essence";
					if (canPurchaseRow(talent.tier)) {
						costText += "<br/><b style='color: black; font-size: 0.8vw;'>You can afford to purchase this whole row! Hold Ctrl when clicking to buy this entire row and any uncompleted rows before it.</b>";
					}

				}
			}
		}
		what = talent.name;
		noExtraCheck = true;
	}
	if (what == "Mastery"){
		tooltipText = "<p>Click to view your masteries.</p><p>You currently have " + prettify(game.global.essence) + "</b> Dark Essence.</p>"
	}
	if (what == "The Improbability"){		
		tooltipText = "<span class='planetBreakMessage'>That shouldn't have happened. There should have been a Blimp there. Something is growing unstable.</span>";
		if (!game.global.autoUpgradesAvailable) tooltipText += "<br/><br/><span class='planetBreakMessage'><b>Your Trimps seem to understand that they'll need to help out more, and you realize how to permanently use them to automate upgrades!<b></span><br/>";
		costText = "<span class='planetBreakDescription'><span class='bad'>Trimp breed speed reduced by a factor of 10. 20% of enemy damage can now penetrate your block.</span><span class='good'> You have unlocked a new upgrade to learn a Formation. Helium harvested per Zone is increased by a factor of 5. Equipment cost is dramatically cheaper. Creating modified maps is now cheaper, and your scientists have found new ways to improve maps! You have access to the 'Trimp' challenge!<span></span>";
		if (game.global.challengeActive == "Corrupted") costText += "<br/><br/><span class='corruptedBadGuyName'>Looks like the Corruption is starting early...</span>";
		costText += "<hr/><div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>I'll be fine</div><div class='btn btn-danger' onclick='cancelTooltip(); message(\"Sorry\", \"Notices\")'>I'm Scared</div></div>"
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Corruption"){
		if (game.global.challengeActive == "Corrupted"){
			tooltipText = "<span class='planetBreakMessage'>Though you've seen the Corruption grow since the planet broke, you can now see a giant spire pumping out tons of the purple goo. Things seem to be absorbing it at a higher rate now.</span><br/>";
			costText += "<span class='planetBreakDescription'><span class='bad'>Improbabilities and Void Maps are now more difficult.</span> <span class='good'>Improbabilities and Void Maps now drop 2x helium.</span></span>";
		}
		else {
			tooltipText = (game.talents.headstart.purchased) ? "Off in the distance, you can see a giant spire grow larger as you approach it." : "You can now see a giant spire only about 20 Zones ahead of you.";
			tooltipText = "<span class='planetBreakMessage'>" + tooltipText + " Menacing plumes of some sort of goopy gas boil out of the spire and appear to be tainting the land even further. It looks to you like the Zones are permanently damaged, poor planet. You know that if you want to reach the spire, you'll have to deal with the goo.</span><br/>";
			costText = "<span class='planetBreakDescription'><span class='bad'>From now on as you press further through Zones, more and more corrupted cells of higher and higher difficulty will begin to spawn. Improbabilities and Void Maps are now more difficult.</span> <span class='good'>Improbabilities and Void Maps now drop 2x helium. Each corrupted cell will drop 15% of that Zone's helium reward.</span></span> ";
		}
		costText += "<hr/><div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Bring it on</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "A Whole New World"){
		tooltipText = "<p>Fluffy has reached Evolution 8 Level 10! He levitates above the ground, then realizes he seems a bit like a showoff so he floats back down. He strikes a good balance between power and humility by just having his eyes glow a little bit; you have to admit it's a good look on him.</p><p>Anyways, Fluffy walks over to your Portal Device and gives it a good smack. He uses some nifty telepathic powers to inform you that you can now use your Portal Device to travel to a different Universe, one that he himself handpicked for its usefulness.</p><p>He continues to inform you that the Magma on this planet is beginning to harden, blocking later Spires behind impenetrable walls of Obsidian. If we want to have any hope of reaching them, we'll need a tremendous amount of energy from this new Universe!</p><p><b>You can now travel back and forth between Universe 1 - \"The Helium Universe\", and Universe 2 - \"The Radon Universe\". See the top left of your Portal for more information.</b></p>";
		costText += "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Bring it on</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Change Universe"){
		var nextUniverse, newResource, oldResource, oldPet, newPet;
		if (portalUniverse == 1){
			nextUniverse = "2";
			newResource = "Radon";
			oldResource = "Helium";
			oldPet = "Fluffy";
			newPet = "Scruffy";
		}
		else {
			nextUniverse = "1";
			newResource = "Helium";
			oldResource = "Radon";
			oldPet = "Scruffy";
			newPet = "Fluffy";
		}
		tooltipText = "Click this button to have your next Portal bring you to Universe " + nextUniverse + " - The " + newResource + " Universe. " + oldResource + " Perks and " + oldPet + " can't come with you, but " + oldPet + "'s good pal " + newPet + " will be waiting for you.";
		if (game.global.totalSquaredReward < 15000 && portalUniverse == 1) tooltipText += "<br/><br/><span style='color: red'>" + oldPet + " suggests having at least 15,000% Challenge<sup>2</sup> reward bonus before heading to Universe 2, but he trusts you to make your own decisions!</span>";
		if (portalUniverse == 1 && game.global.totalRadonEarned == 0) tooltipText += "<br/><br/><b>You will earn Radon instead of Helium in Universe 2. It's an entirely new Universe to explore!</b>"
	}
	if (what == "The Spire"){	
		tooltipText = "<span class='planetBreakMessage'>The Spire looms menacingly above you, and you take in a deep breath of corruption. You take a look back at your Trimps to help gather some courage, and you push the door open. You slowly walk inside and are greeted by an incredibly loud, deep, human voice.<br/><br/><b>Do you know what you face? If you are defeated ten times in this place, you shall be removed from this space. If you succeed, then you shall see the light of knowledge that you seek.</b><span>";
		tooltipText += "<br/><hr/><span class='planetBreakDescription'><span class='bad'>This Zone is considerably more difficult than the previous and next Zones. If 10 groups of Trimps die in combat while in the spire, the world will return to normal.</span> <span class='good'>Each cell gives more and more helium. Every 10th cell gives a larger reward, and increases all loot gained until your next portal by 2% (including helium).</span>";
		if (game.options.menu.mapsOnSpire.enabled) tooltipText += "<br/><hr/>You were moved to Maps to protect your limited chances at the spire. You can disable this in settings!";
		costText = "<div class='maxCenter'><div class='btn btn-info' onclick='startSpire(true)'>The Universe Awaits</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "The Magma"){
		tooltipText = "<p>You stumble across a large locked chest, unlike anything you've ever seen. The lock looks rusty, you smack it with a rock, and it falls right off. Immediately the ground shakes and cracks beneath your feet, intense heat hits your face, and Magma boils up from the core.</p><p>Where one minute ago there was dirt, grass, and noxious fog, there are now rivers of molten rock (and noxious fog). You'd really like to try and repair the planet somehow, so you decide to keep pushing on. It's been working out well so far, there was some useful stuff in that chest!</p><hr/>";
		tooltipText += "<span class='planetBreakDescription'><span class='bad'>The heat is tough on your Trimps, causing each Zone to reduce their attack and health by 20% more than the last. 10% of your Nurseries will permanently close after each Zone to avoid Magma flows, and Corruption has seeped into both Void and regular Maps, further increasing their difficulty. </span><span class='good'> However, the chest contained plans and materials for the <b>Dimensional Generator</b> building, <b>" + prettify(textString) + " Helium</b>, and <b>100 copies of Coordination</b>! In addition, all Zones are now worth <b>3x Helium</b>!<span></span>";
		costText += "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>K</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Exit Spire"){
		tooltipText = "This will exit the spire, and you will be unable to re-enter until your next portal. Are you sure?";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); endSpire()'>Exit Spire</div><div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Confirm Respec Masteries"){
		if (!textString)
			tooltipText = "This will return all Dark Essence that was spent on Masteries at the cost of 20 bones. Are you sure?";
		else 
			tooltipText = "This will return all Dark Essence that was spent on Masteries, and will use " + ((game.global.freeTalentRespecs > 1) ? "one of " : "") + "your remaining " + game.global.freeTalentRespecs + " free Mastery Respec" + needAnS(game.global.freeTalentRespecs) + ".";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); respecTalents(true)'>Respec</div><div class='btn btn-danger' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Respec Masteries"){
		tooltipText = "<p>Click to Respec, refunding all Dark Essence that was spent on Masteries.<p>";
		if (game.global.freeTalentRespecs > 0) tooltipText += "<p>Your first 3 Respecs are free, and you still have " + game.global.freeTalentRespecs + " left! When there are no more left, each respec will cost 20 Bones."
		costText = (game.global.freeTalentRespecs > 0) ? "Free!" : ((game.global.b >= 20) ? "<span class='green'>" : "<span class='red'>") + "20 Bones</span>";
	}
	if (what == "The Geneticistassist"){
		tooltipText = "Greetings, friend! I'm your new robotic pal <b>The Geneticistassist</b> and I am here to assist you with your Geneticists. I will hang out in your Jobs tab, and will appear every run after Geneticists are unlocked. You can customize me in Settings under 'General'!";
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Thanks, Geneticistassist!</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "MagnetoShriek"){
		var shriekValue = ((1 - game.mapUnlocks.roboTrimp.getShriekValue()) * 100).toFixed(1);
		tooltipText = "Your pet RoboTrimp seems to be gifted at distorting the magnetic field around certain Bad Guys, especially Improbabilities. You can activate this ability once every 5 Zones in order to tell your RoboTrimp to reduce the attack damage of the next Improbability by " + shriekValue + "%. This must be reactivated each time it comes off cooldown.";
		tooltipText += "<span id='roboTrimpTooltipActive' style='font-weight: bold'><br/><br/>";
		tooltipText += (game.global.useShriek) ? "MagnetoShriek is currently active and will fire on the next Improbability." : "MagnetoShriek is NOT active and will not fire.";
		tooltipText += "</span>";
		costText = "";
		//elem.style.top = "55%";
	}
	if (what == "Reset"){
		tooltipText = "Are you sure you want to reset? This will really actually reset your game. You won't get anything cool. It will be gone. <b style='color: red'>This is not the soft-reset you're looking for. This will delete your save.</b>";
		costText="<div class='maxCenter'><div class='btn btn-danger' onclick='resetGame(false, true);unlockTooltip();tooltip(\"hide\")'>Delete Save</div> <div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Fight"){
		tooltipText = "Send your poor Trimps to certain doom in the battlefield. You'll get cool stuff though, they'll understand. (Hotkey: F)";
		var currentSend = game.resources.trimps.getCurrentSend();
		costText = (currentSend > 1) ? "s" : "";
		costText = prettify(currentSend) + " Trimp" + costText;
	}
	if (what == "AutoFight"){
		tooltipText = "Allow the Trimps to start fighting on their own whenever their town gets overcrowded (Hotkey: A)";
		costText = "";
	}
	if (what == "New Achievements"){
		tooltipText = "The universe has taken an interest in your achievements, and has begun tracking them. You already have some completed thanks to your previous adventures, would you like to see them?";
		costText = "<div class='maxCenter'><div class='btn btn-success' onclick='toggleAchievementWindow(); cancelTooltip()'>Check Achievements</div> <div class='btn btn-danger' onclick='cancelTooltip()'>No, That Sounds Dumb</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Upgrade Generator"){
		tooltipText = getGeneratorUpgradeHtml();
		costText = "<b style='color: red'>These upgrades persist through portal and cannot be refunded. Choose wisely! " + getMagmiteDecayAmt() + "% of your unspent Magmite will decay on portal.</b><br/><br/><div class='maxCenter'><span class='btn btn-info' onclick='cancelTooltip()'>Close</span></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function(){
			updateGeneratorUpgradeHtml();
			verticalCenterTooltip();
		};
		titleText = "<div id='generatorUpgradeTitle'>Upgrade Generator</div><div id='magmiteOwned'></div>";
	}
	if (what == "Queue"){
		tooltipText = "This is a building in your queue, you'll need to click \"Build\" to build it. Clicking an item in the queue will cancel it for a full refund.";
		costText = "";
	}
	if (what == "Toxic" && isItIn != "dailyStack"){
		tooltipText = "This Bad Guy is toxic. You will obtain " + (game.challenges.Toxicity.lootMult * game.challenges.Toxicity.stacks).toFixed(1) + "% more resources! Oh, also, this Bad Guy has 5x attack, 2x health, your Trimps will lose 5% health each time they attack, and the toxic air is causing your Trimps to breed " + (100 - (Math.pow(game.challenges.Toxicity.stackMult, game.challenges.Toxicity.stacks) * 100)).toFixed(2) + "% slower. These stacks will reset after clearing the Zone.";
		costText = "";
	}
	if (what == "Momentum"){
		var stacks = game.challenges.Lead.stacks;
		tooltipText = "This Bad Guy has " + prettify(stacks * 4) + "% more damage and health, pierces an additional " + (stacks * 0.1).toFixed(1) + "% block, and each attack that does not kill it will cause your Trimps to lose " + (stacks * 0.03).toFixed(2) + "% of their health.";
		costText = "";
	}
	if (what == "Custom"){
		customUp = (textString) ? 2 : 1;
		tooltipText = "Type a number below to purchase a specific amount. You can also use shorthand such as 2e5 and 200k to select that large number, or fractions such as 1/2 and 50% to select that fraction of your available workspaces."
		if (textString) tooltipText += " <b>Max of 1,000 for most perks</b>";
		tooltipText += "<br/><br/><input id='customNumberBox' style='width: 50%' value='" + ((!isNumberBad(game.global.lastCustomExact)) ? prettify(game.global.lastCustomExact) : game.global.lastCustomExact) + "' />";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='numTab(5, " + textString + ")'>Apply</div><div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function() {
			var box = document.getElementById("customNumberBox");
			// Chrome chokes on setSelectionRange on a number box; fall back to select()
			try { box.setSelectionRange(0, box.value.length); }
			catch (e) { box.select(); }
			box.focus();
		};
		noExtraCheck = true;
	}
	if (what == "Max"){
		var forPortal = (textString) ? true : false;
		tooltipText = "No reason to spend everything in one place! Here you can set the ratio of your resources to spend when using the 'Max' button. Setting this to 0.5 will spend no more than half of your resources per click, etc."
		costText = "<ul id='buyMaxUl'><li onclick='setMax(1, " + forPortal + ")'>Max</li><li onclick='setMax(0.5, " + forPortal + ")'>0.5</li><li onclick='setMax(0.33, " + forPortal + ")'>0.33</li><li onclick='setMax(0.25, " + forPortal + ")'>0.25</li><li onclick='setMax(0.1, " + forPortal + ")'>0.1</li></ul>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Export"){
		var saveText = save(true);
		if (textString){
			tooltipText = textString + "<br/><br/><textarea id='exportArea' spellcheck='false' style='width: 100%' rows='5'>" + saveText + "</textarea>";
			what = "Thanks!";
		}
		else
		tooltipText = "This is your save string. There are many like it but this one is yours. Save this save somewhere safe so you can save time next time. <br/><br/><textarea spellcheck='false' id='exportArea' style='width: 100%' rows='5'>" + saveText + "</textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
		if (document.queryCommandSupported('copy')){
			costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
		}
		var saveName = 'Trimps Save P' + game.global.totalPortals;
		if (game.global.universe == 2 || game.global.totalRadPortals > 0){
			saveName += " " + game.global.totalRadPortals + " U" + game.global.universe;
		}
		saveName += " Z" + game.global.world;
		costText += "<a id='downloadLink' target='_blank' download='" + saveName + ".txt', href=";
		if (Blob !== null) {
			var blob = new Blob([saveText], {type: 'text/plain'});
			var uri = URL.createObjectURL(blob);
			costText += uri;
		} else {
			costText += 'data:text/plain,' + encodeURIComponent(saveText);
		}
		costText += " ><div class='btn btn-danger' id='downloadBtn'>Download as File</div></a>";
		costText += "</div>";
		ondisplay = tooltips.handleCopyButton();
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Lost Time"){
		cancelTooltip();
		tooltipText = offlineProgress.getHelpText();
		elem = document.getElementById('tooltipDiv2');
		tip2 = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info btn-lg' onclick='cancelTooltip()'>Neat</div>";
	}
	if (what == "Export Perks"){
		tooltipText = "It may not look like much, but all of your perks are in here! You can share this string with friends, or save it to your computer to import later!<br/><br/><textarea spellcheck='false' id='exportArea' style='width: 100%' rows='5'>" + exportPerks() + "</textarea>";
		costText = "<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip()'>Got it</div>";
		if (document.queryCommandSupported('copy')){
			costText += "<div id='clipBoardBtn' class='btn btn-success'>Copy to Clipboard</div>";
		}
		costText += "</div>";
		ondisplay = tooltips.handleCopyButton();
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "Import"){
		tooltipText = "Import your save string! It'll be fun, I promise.<br/><br/><textarea spellcheck='false' id='importBox' style='width: 100%' rows='5'></textarea>";
		costText="<div class='maxCenter'><div id='confirmTooltipBtn' class='btn btn-info' onclick='cancelTooltip(); load(true);'>Import</div>"
		if (playFabId != -1) costText += "<div class='btn btn-primary' onclick='loadFromPlayFab()'>Import From PlayFab</div>";
		costText += "<div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function () {
			document.getElementById('importBox').focus();
		}
	}
	if (what == "Import Perks"){
		tooltipText = "Import your perks from a text string!<br/><br/><textarea spellcheck='false' id='perkImportBox' style='width: 100%' rows='5'></textarea>";
		costText = "<p class='red'></p>";
		costText += "<div id='confirmTooltipBtn' class='btn btn-info' onclick='this.previousSibling.innerText = importPerks()'>Import</div>";
		costText += "<div class='btn btn-info' onclick='cancelTooltip()'>Cancel</div></div>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
		ondisplay = function () {
			document.getElementById('perkImportBox').focus();
		};
	}
	if (what == "AutoPrestige"){
		tooltipText = '<p>Your scientists have come a long way since you first crashed here, and can now purchase prestige upgrades automatically for you with hardly any catastrophic mistakes. They understand the word "No" and the following three commands: </p><p><b>AutoPrestige All</b> will always purchase the cheapest prestige available first.</p><p><b>Weapons Only</b> as you may be able to guess, will only purchase Weapon prestiges.</p><p><b>Weapons First</b> will only purchase Weapon prestiges unless the cheapest Armor prestige is less than 5% of the cost of the cheapest Weapon. If there are no Weapon prestiges available, the cheapest Armor prestige will be purchased only if its cost is 5% or less of your total resources.</p>';
	}
	if (what == "AutoUpgrade"){
		tooltipText = "Your scientists can finally handle some upgrades on their own! Toggling this on will cause most upgrades to be purchased automatically. Does not include equipment prestiges or upgrades that would trigger a confirmation popup.";
	}
	if (what == "Recycle All"){
		tooltipText = "Recycle all maps below the selected level.";
	}
	if (what == "PlayFab Login"){
		if (typeof nw !== 'undefined') return;
		var tipHtml = getPlayFabLoginHTML();
		tooltipText = tipHtml[0];
		costText = tipHtml[1];
		game.global.lockTooltip = true;
		elem.style.top = "15%";
		elem.style.left = "25%";
		swapClass('tooltipExtra', 'tooltipExtraLg', elem);
		noExtraCheck = true;
	}
	if (what == "PlayFab Conflict"){
		tooltipText = "It looks like your save stored at PlayFab is further along than the save on your computer.<br/><b>Your save on PlayFab has earned " + prettify(textString) + " total Helium, defeated Zone " + attachFunction + ", and cleared " + prettify(numCheck) + " total Zones. The save on your computer only has " + prettify(game.global.totalHeliumEarned) + " total Helium, has defeated Zone " + game.global.highestLevelCleared + ", and cleared " + prettify(game.stats.zonesCleared.value + game.stats.zonesCleared.valueTotal) + " total Zones.</b><br/>Would you like to Download your save from PlayFab, Overwrite your online save with this one, or Cancel and do nothing?";
		costText = "<span class='btn btn-primary' onclick='playFabFinishLogin(true)'>Download From PlayFab</span><span class='btn btn-warning' onclick='playFabFinishLogin(false)'>Overwrite PlayFab Save</span><span class='btn btn-danger' onclick='cancelPlayFab();'>Cancel</span>";
		game.global.lockTooltip = true;
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (what == "DominationDominating"){
		what = "Domination: Dominating";
		noExtraCheck = true;
		tooltipText = "This Bad Guy is Dominating! It has 2.5x attack, 7.5x health, and heals for 5% of its max health after each attack. However, it will also drop 3x Helium!"
		costText = "";
	}
	if (what == "DominationWeak"){
		what = "Domination: Weak";
		noExtraCheck = true;
		tooltipText = "This Bad Guy is having its power siphoned by an even worse Bad Guy! It deals 90% less damage and has 90% less health."
		costText = "";
	}
	if (what == "Fire Trimps"){
		if (!game.global.firing)
		tooltipText = "Activate firing mode, turning the job buttons red, and forcing them to fire trimps rather than hire them. The newly unemployed Trimps will start breeding instead of working, but you will not receive a refund on resources.";
		else
		tooltipText = "Disable firing mode";
		costText = "";
	}
	if (what == "Maps"){
		if (!game.global.preMapsActive)
		tooltipText = "Travel to the Map Chamber. Maps are filled with goodies, and for each max level map you clear you will gain a 20% stacking damage bonus for that Zone (stacks up to 10 times). (Hotkey: M)";
		else
		tooltipText = "Go back to the World Map. (Hotkey: M)";
		costText = "";
	}

	if (what == 'Error') {
		game.global.lockTooltip = true;
		var returnObj = tooltips.showError(textString);
		tooltipText = returnObj.tooltip;
		costText = returnObj.costText;
		ondisplay = tooltips.handleCopyButton();
		elem.style.left = "33.75%";
		elem.style.top = "25%";
	}
	if (isItIn == "jobs"){
		var buyAmt = game.global.buyAmt;
		if (buyAmt == "Max") buyAmt = calculateMaxAfford(game.jobs[what], false, false, true);
		if (game.global.firing && what != "Amalgamator"){
			var firstChar = what.charAt(0);
			var aAn = (firstChar == "A" || firstChar == "E" || firstChar == "I" || firstChar == "O" || firstChar == "U") ? " an " : " a ";
			tooltipText = "Fire " + aAn + " " + what + ". Refunds no resources, but frees up some workspace for your Trimps.";
			costText = "";
		}
		else{
			var workspaces = game.workspaces;
			var ignoreWorkspaces = (game.jobs[what].allowAutoFire && game.options.menu.fireForJobs.enabled);
			if (workspaces < buyAmt && !ignoreWorkspaces) buyAmt = workspaces;
			costText = getTooltipJobText(what, buyAmt);
		}
		if (what == "Amalgamator") {
			noExtraCheck = true;
			costText = "";
		}
		else if (buyAmt > 1) what += " X " + prettify(buyAmt);
	}
	if (isItIn == "buildings"){
		if (what != "Hub") costText = canAffordBuilding(what, false, true);
		if (game.global.buyAmt != 1) {
			if (game.buildings[what].percent || what == "Antenna"){
				tooltipText += " <b>You can only purchase 1 " + what + " at a time.</b>";
				what += " X 1";
			}
			else {
				what += " X " + prettify((game.global.buyAmt == "Max") ? calculateMaxAfford(game.buildings[what], true) : game.global.buyAmt);
			}
		}
	}
	if (what == "Scale Equality Scaling"){
		var state = game.portal.Equality.scalingActive ? "On" : "Off";
		if (textString) tooltipText = '<div style="font-size: 1.7vh"><div class="maxCenter"><div style="width: 50%; margin-left: 25%" role="button" class="noselect pointer portalThing thing perkColorOff changingOff equalityColor' + state + '" id="equalityScaling2" onclick="toggleEqualityScale()"><span class="thingName">Scale Equality</span><br><span class="thingOwned"><span id="equalityScalingState2">' + state + '</span></span></div></div><br/>';
		else tooltipText = "";
		tooltipText += getEqualitySliders();
		if (textString) tooltipText += "</div>";
		game.global.lockTooltip = true;
		elem.style.left = "4.5%";
		elem.style.top = "1%";
		swapClass('tooltipExtra', 'tooltipExtraEquality', elem);
		costText = "<div class='maxCenter'><div class='btn btn-info' id='confirmTooltipBtn' onclick='cancelTooltip()'>Done</div></div>";
		ondisplay = function(){
			verticalCenterTooltip();
		}
	}
	if (what == "Equality Scaling"){
		var activeLevels = game.portal.Equality.getActiveLevels();
		tooltipText = "<p>You can enable or disable Equality Scaling at any time.</p><p>With Equality Scaling On, each Portal starts with 0 levels of Equality active. If a group of Trimps dies after attacking <b>" + game.portal.Equality.scalingSetting + "</b> or fewer time" + needAnS(game.portal.Equality.scalingSetting) + ", one level of Equality will activate, up to your purchased level of Equality.";
		tooltipText += "</p><p><b>You currently have " + activeLevels + " stack" + needAnS(activeLevels) + " of Equality active.</b></p>";
		if (!textString) tooltipText += "<p><b>Ctrl Click this button to customize your Equality settings.</b></p>"
		else tooltipText += "<p>(Hotkey: E)</p>"
	}
	else if (isItIn == "portal"){
		var resAppend = (game.global.kongBonusMode) ? " Bonus Point" : " " + heliumOrRadon(true, true);
		var perkItem = game.portal[what];
		var price = getPortalUpgradePrice(what);
		if (!perkItem.max || perkItem.max > getPerkLevel(what, true) + perkItem.levelTemp) costText = prettify(price) + resAppend + needAnS(price);
		else costText = "";
		tooltipText += "<br/><br/><b>You have spent " + prettify(getSpentPerkResource(what, true) + perkItem.heliumSpentTemp) + " " + heliumOrRadon(false, true) + " on this Perk.</b>";
		if (game.global.buyAmt == "Max") what += " X " + getPerkBuyCount(what);
		else if (game.global.buyAmt > 1) what += " X " + game.global.buyAmt;
		what = what.replace("_", " ");
	}
	if (isItIn == "equipment"){
		costText = canAffordBuilding(what, false, true, true);
		var buyAmt = ((game.global.buyAmt == "Max") ? calculateMaxAfford(game.equipment[what], false, true) : game.global.buyAmt);
		var equip = game.equipment[what];
		var resPerStat = getEquipResPerStat(what, buyAmt);
		if (what == "Shield"){
			var blockPerShield = equip.blockCalculated + (equip.blockCalculated * game.jobs.Trainer.owned * (game.jobs.Trainer.modifier / 100));
			if (equip.blockNow) tooltipText += " (" + prettify(blockPerShield) + " after Trainers)";
			tooltipText += "<br/><br/>" + prettify(resPerStat) + " wood spent per point of " + ((equip.blockNow) ? "Block" : "Health") + ".";
		}
		else{
			tooltipText += "<br/><br/>" + prettify(resPerStat) + " metal spent per point of " + ((equip.attack) ? "Attack" : "Health") + ".";
			if (game.options.menu.equipHighlight.enabled > 0 && !game.equipment.Mace.locked){
				tooltipText += " The most efficient Attack and Health equipment";
				if (game.options.menu.equipHighlight.enabled == 1 && equip.prestige >= 2) tooltipText += " of your highest Tier"
				tooltipText += " have blue backgrounds.";
				if (equip.prestige >= 2) tooltipText += " (Search Settings for Highlight Equipment to change behavior)";
			}
		}
		if (game.global.buyAmt != 1) {
			what += " X " + buyAmt;
		}		
	}
	if (isItIn == "upgrades"){
		var mouseOverElem = (lastMousePos[0] && lastMousePos[1]) ? document.elementFromPoint(lastMousePos[0], lastMousePos[1]) : null;
		if (mouseOverElem && mouseOverElem.id == "upgradesHere"){
			cancelTooltip();
			return;
		}
		if (typeof tooltipText.split('@')[1] !== 'undefined'){
			var prestigeCost = "Your next " + game.upgrades[what].prestiges + " will grant " + getNextPrestigeValue(what) + ".";
			tooltipText = tooltipText.replace('@', prestigeCost);
		}
		if (typeof tooltipText.split('$')[1] !== 'undefined'){
			var upgradeTextSplit = tooltipText.split('$');
			var color = game.upgrades[what].specialFilter();
			color = color ? "green" : "red";
			tooltipText = upgradeTextSplit[0] + "<span style='color: " + color + "; font-weight: bold;'>" + upgradeTextSplit[1]  + "</span>";
		}
		if (typeof tooltipText.split('?')[1] !== 'undefined' && what != 'Dominance'){
			var percentNum = (game.global.frugalDone) ? '60' : '50';
			tooltipText = tooltipText.replace('?', percentNum);
		}
		if (what == "Coordination"){
			var coordReplace = (getPerkLevel("Coordinated")) ? (25 * Math.pow(game.portal.Coordinated.modifier, getPerkLevel("Coordinated"))).toFixed(3) : 25;
			tooltipText = tooltipText.replace('<coord>', coordReplace);
			if (!canAffordCoordinationTrimps()){
				var currentSend = game.resources.trimps.getCurrentSend();
				if (game.global.challengeActive == "Trappapalooza") currentSend *= 0.25;
				else currentSend *= 3;
				var trimpCount = (game.global.challengeActive == "Trappapalooza") ? (game.resources.trimps.owned - game.resources.trimps.employed) : game.resources.trimps.realMax();
				var amtToGo = Math.floor((currentSend) - trimpCount);
				var s = (amtToGo == 1) ? "" : "s";
				if (game.global.challengeActive == "Trappapalooza") tooltipText += " <b>You need " + prettify(currentSend) + " unemployeed Trimps available.";
				else tooltipText += " <b>You need enough room for " + prettify(currentSend) + " max Trimps.";
				tooltipText += " You are short " + prettify(Math.floor(amtToGo)) + " Trimp" + s + ".</b>";
			}
		}
		if (typeof game.upgrades[what].name !== 'undefined') what = game.upgrades[what].name;
	}
	if (isItIn == "maps"){
		tooltipText = "This is a map. Click it to see its properties or to run it. Maps can be run as many times as you want.";
		costText = "";
	}
	if (what == 'confirm'){
		if (!renameBtn) renameBtn = "Confirm";
		what = numCheck;
		tooltipText = textString;
		if (attachFunction == null) attachFunction = "";
		if (!noHide) attachFunction = attachFunction + "; cancelTooltip()";
		attachFunction = (attachFunction) ? ' onclick="' + attachFunction + '"' : "";
		if (what != 'Spire Assault') costText = ' <div class="maxCenter" id="confirmTipCost"><div id="confirmTooltipBtn" class="btn btn-info"' + attachFunction + '>' + renameBtn + '</div>';
		if (!hideCancel) costText += '<div class="btn btn-danger" onclick="cancelTooltip()">Cancel</div>';
		costText += '</div>';
		game.global.lockTooltip = true;
		if (numCheck == "Alchemy" || numCheck == "Spire Assault"){
			elem.style.top = "0%";
			elem.style.left = "5%";
			swapClass('tooltipExtra', 'tooltipExtraBiggest', elem);
		}
		else{
			if (renameBtn == 'Fire') {
				elem.style.top = '50%';
			}
			else elem.style.top = "25%";
			elem.style.left = "33.75%";
			
			
		}
	}
	if (isItIn == 'customText') {
		costText = (attachFunction) ? attachFunction : "";
		tooltipText = textString;
		noExtraCheck = true;
		if (event == "lock"){
			if (what == "Spire Settings"){
				swapClass('tooltipExtra', 'tooltipExtraLg', elem);
				elem.style.left = "25%";
			}
			else{
				elem.style.left = "33.75%";
			}
			elem.style.top = "25%";
			game.global.lockTooltip = true;
			if (!attachFunction) costText = '<div class="btn btn-danger" onclick="cancelTooltip()">Close</div>';
			event = 'update';
		}
		if (numCheck == "center"){
			ondisplay = function(){
				verticalCenterTooltip();
			}
		}
	}

	if (!noExtraCheck){
		var tipSplit = tooltipText.split('$');
		if (typeof tipSplit[1] !== 'undefined'){
			if (tipSplit[1] == 'incby'){
				var increase = toTip.increase.by;
				if (toTip.increase.what == "trimps.max" && game.global.challengeActive == "Downsize") increase = 1;
				if (getPerkLevel("Carpentry") && toTip.increase.what == "trimps.max") increase *= Math.pow(1.1, getPerkLevel("Carpentry"));
				if (getPerkLevel("Carpentry_II") && toTip.increase.what == "trimps.max") increase *= (1 + (game.portal.Carpentry_II.modifier * getPerkLevel("Carpentry_II")));
				increase *= alchObj.getPotionEffect("Elixir of Crafting");
				tooltipText = tipSplit[0] + prettify(increase) + tipSplit[2];
				tooltipText = tooltipText.replace('{s}', needAnS(increase));
			}
			else if (isItIn == "jobs" && toTip.increase != "custom"){
				var newValue = toTip[tipSplit[1]];
				if (getPerkLevel("Motivation") > 0) newValue *= (1 + (getPerkLevel("Motivation") * 0.05));
				if (getPerkLevel("Motivation_II") > 0) newValue *= (1 + (getPerkLevel("Motivation_II") * game.portal.Motivation_II.modifier));
				if (game.permaBoneBonuses.multitasking.owned > 0 && (game.resources.trimps.owned >= game.resources.trimps.realMax())) newValue *= (1 + game.permaBoneBonuses.multitasking.mult());
				if (game.global.challengeActive == "Alchemy") newValue *= alchObj.getPotionEffect("Potion of Finding");
				newValue *= alchObj.getPotionEffect("Elixir of Finding");
				if (game.global.pandCompletions) newValue *= game.challenges.Pandemonium.getTrimpMult();
				if (!game.portal.Observation.radLocked && game.global.universe == 2 && game.portal.Observation.trinkets > 0) newValue *= game.portal.Observation.getMult();
				if (Fluffy.isRewardActive('gatherer')) newValue *= 2;
				tooltipText = tipSplit[0] + prettify(newValue) + tipSplit[2];
			}
			else
			tooltipText = tipSplit[0] + prettify(toTip[tipSplit[1]]) + tipSplit[2];
		}
		if (isItIn == "buildings" && what.split(' ')[0] == "Warpstation" && game.global.lastWarp) {
			tooltipText += "<b> You had " + game.global.lastWarp + " Warpstations when you purchased your last Gigastation (" + game.upgrades.Gigastation.done + ").</b>";
		}
		if (typeof tooltipText.split('~') !== 'undefined') {
			var percentIncrease = game.upgrades.Gymystic.done;
			var text = ".";
			if (percentIncrease > 0){
				percentIncrease += 4;
				text = " and increases the base block of all Gyms by " + percentIncrease + "% (compounding).";
			}
			tooltipText = tooltipText.replace('~', text);
		}
	}
	titleText = (titleText) ? titleText : what;
	lastTooltipTitle = titleText;
	var tipNum = (tip2) ? "2" : "";
	// if (usingScreenReader){
	// 	if (event == "screenRead") {
	// 		document.getElementById("tipTitle" + tipNum).innerHTML = "";
	// 		document.getElementById("tipText" + tipNum).innerHTML = "";
	// 		document.getElementById("tipCost" + tipNum).innerHTML = "";
	// 		var readText = "<p>" + titleText + ": ";
	// 		if (costText) readText += "Costs " + costText;
	// 		readText += "</p><p>" + tooltipText + "</p>";
	// 		document.getElementById('screenReaderTooltip').innerHTML = readText;
	// 		game.global.lockTooltip = false;
	// 		return;
	// 	}
	// 	else{
	// 		if (game.global.lockTooltip){
	// 			document.getElementById('screenReaderTooltip').innerHTML = "Confirmation Popup is active. Press S to view the popup."
	// 		}
	// 		else{
	// 			document.getElementById('screenReaderTooltip').innerHTML = "";
	// 		}
	// 		game.global.lockTooltip = false;
	// 	}
	// }
	document.getElementById("tipTitle" + tipNum).innerHTML = titleText;
	document.getElementById("tipText" + tipNum).innerHTML = tooltipText;
	document.getElementById("tipCost" + tipNum).innerHTML = costText;
	elem.style.display = "block";
	if (ondisplay !== null)
		ondisplay();
	if (event != "update") positionTooltip(elem, event, renameBtn);
}
function checkAlert(what, isItIn){
	if (document.getElementById(what + "Alert") === null) return;
		if (typeof game[isItIn] !== 'undefined') game[isItIn][what].alert = false;
		else return;
		document.getElementById(what + "Alert").innerHTML = "";
		if (document.getElementById(isItIn + "Alert") !== null)	document.getElementById(isItIn + "Alert").innerHTML = "";
}
function needAnS(number){
	//this will save so many lines if I don't forget about it
	return (number == 1) ? "" : "s";
}