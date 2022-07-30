var generator = {
	numEquippable: 0,
	enemyEffects: [],
	equipped:[],
	numEquipped: 0,
	itemEffects:{
		attackSpeed:{
			Menacing_Mask:{},
			Putrid_Pouch:{isPoisoned: true},
			Labcoat:{CanPoison: true},
			Mood_Bracelet:{NotBleeding:true},
			Shock_and_Awl:{NotShocked:true},
			Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
			Eelimp_in_a_Bottle:{isShock:true},
			Sundering_Scythe:{},
			Sacrificial_Shank:{},
			The_Doomspring:{},
			Wrath_Crafted_Hatchet:{},
		},
		enemySpeed:{
			Menacing_Mask:{},
			Wired_Wristguards:{isShocked:true},
			Bloodstained_Gloves:{},
		},
		attack:{
			Sword:{},
			Rusty_Dagger:{CanBleed:true},
			Shock_and_Awl:{},
			Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
			Sword_and_Board:{},
			Bloodstained_Gloves:{},
			Unlucky_Coin:{},
			Spiked_Gloves:{},
			Eelimp_in_a_Bottle:{GetsShocked:true},
			Big_Cleaver:{isBleeding:true},
			Metal_Suit:{ItemCanBleed:true},
			Sundering_Scythe:{},
			Monkimp_Paw:{},
			Grounded_Crown:{},
			Fearsome_Piercer:{},
			Bag_of_Nails:{},
			Blessed_Protector:{},
			Snimp__Fanged_Blade:{},
			Wrath_Crafted_Hatchet:{},
			Omni_Enhancer:{},
		},
		health:{
			Armor:{},
			Raincoat:{CanBleed: true},
			Labcoat:{CanPoison: true},
			Shining_Armor:{},
			Sword_and_Board:{},
			Bilious_Boots:{},
			Big_Cleaver:{},
			The_Globulator:{isPoisoned:true},
			Metal_Suit:{},
			Nozzled_Goggles:{},
			Sundering_Scythe:{},
			Grounded_Crown:{},
			Bag_of_Nails:{},
			Blessed_Protector:{},
			The_Doomspring:{},
			Wrath_Crafted_Hatchet:{},
			Basket_of_Souls:{},
			Goo_Golem:{},
		},
		BloodLetting:{
			Rusty_Dagger:{},
			Big_Cleaver:{},
			Bag_of_Nails:{},
		},
		bleedMod:{
			Rusty_Dagger:{},
			Raincoat:{CanBleed: true},
			Big_Cleaver:{},
			Fearsome_Piercer:{},
			Bag_of_Nails:{},
			Snimp__Fanged_Blade:{isPoisoned:true},
			Basket_of_Souls:{},
			Omni_Enhancer:{},
		},
		bleedChance:{
			Rusty_Dagger:{},
			Bad_Medkit:{},
			Bloodstained_Gloves:{},
			Big_Cleaver:{},
			Fearsome_Piercer:{},
		},
		Poisoning:{
			Fists_of_Goo:{},
			Tame_Snimp:{},
			Very_Large_Slime:{},
		},
		poisonMod:{
			Fists_of_Goo:{},
			Labcoat:{CanPoison: true},
			Tame_Snimp:{},
			Bilious_Boots:{},
			The_Globulator:{},
			Plague_Bringer:{},
			Very_Large_Slime:{},
			Snimp__Fanged_Blade:{isBleeding:true},
			Goo_Golem:{},
			Omni_Enhancer:{},
		},
		poisonChance:{
			Fists_of_Goo:{},
			Putrid_Pouch:{},
			Chemistry_Set:{},
			Tame_Snimp:{},
			Very_Large_Slime:{},
		},
		Shocking:{
			Battery_Stick:{},
			Shock_and_Awl:{}
		},
		shockMod:{
			Battery_Stick:{},
			Shock_and_Awl:{},
			Aegis:{HighHP:true},
			Eelimp_in_a_Bottle:{},
			Grounded_Crown:{},
			Omni_Enhancer:{},
		},
		shockChance:{
			Battery_Stick:{},
			Shock_and_Awl:{},
			Wired_Wristguards:{},
			Aegis:{HighHP:true},
			Eelimp_in_a_Bottle:{},
			Basket_of_Souls:{},
		},
		defense:{
			Pants:{},
			Raincoat:{CanBleed: true},
			Putrid_Pouch:{isPoisoned: true},
			Chemistry_Set:{isPoisoned: true},
			Comfy_Boots:{},
			Mood_Bracelet:{NotBleeding:true},
			Shining_Armor:{},
			Wired_Wristguards:{},
			Aegis:{},
			Sword_and_Board:{},
			The_Globulator:{isPoisoned:true},
			Metal_Suit:{},
			Very_Large_Slime:{},
			Grounded_Crown:{},
			Blessed_Protector:{},
			Wrath_Crafted_Hatchet:{},
			Basket_of_Souls:{},
		},
		lifesteal:{
			Raincoat:{CanBleed: true},
			Bad_Medkit:{isBleeding: true},
			Recycler:{},
			Shock_and_Awl:{isShocked: true},
			Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
			Aegis:{LowHP:true},
			Unlucky_Coin:{NotPoisoned:true, NotBleeding:true},
			Sundering_Scythe:{},
			Sacrificial_Shank:{},
			Fearsome_Piercer:{},
			Blessed_Protector:{},
			Basket_of_Souls:{},
		},
		poisonStack:{
			Chemistry_Set:{},
			Bilious_Boots:{},
			Nozzled_Goggles:{},
			Very_Large_Slime:{},
			Snimp__Fanged_Blade:{},
			Goo_Golem:{},
			Omni_Enhancer:{},
		},
		PoisonResist:{
			Comfy_Boots:{},
			Wired_Wristguards:{},
			Sword_and_Board:{},
			Bilious_Boots:{},
			Nozzled_Goggles:{},
			Sacrificial_Shank:{}
		},
		BleedResist:{
			Comfy_Boots:{},
			Wired_Wristguards:{},
			Sword_and_Board:{},
			Bilious_Boots:{},
			Metal_Suit:{},
			Sacrificial_Shank:{}
		},
		ShockResist:{
			Comfy_Boots:{},
			Wired_Wristguards:{},
			Sword_and_Board:{},
			Bilious_Boots:{},
			Eelimp_in_a_Bottle:{},
			Sacrificial_Shank:{}
		},
		dustIncrease:{
			Lifegiving_Gem:{}
		},
		healAmt:{
			Hungering_Mold:{},
			The_Globulator:{OnPoisonStack: true},
			Plague_Bringer:{},
		},
		tickMult:{
			Hungering_Mold:{},
			Plague_Bringer:{},
			Omni_Enhancer:{},
		},
		damageTakenMult:{
			Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
			Bag_of_Nails:{isBleeding:true},
			Blessed_Protector:{HPLow:true},
		},
	},

	getEffects: function (){
		return autoBattle.profile.split(', ')
	},
	comparator: function(a,b){
		if(autoBattle.items[a[0]].owned && autoBattle.items[b[0]].owned){
			try{
				if(autoBattle.items[a[0]][a[1]]() > autoBattle.items[b[0]][b[1]]()){
					return 1
				}
				return -1
			} catch (e){
				if(autoBattle.items[a[0]][a[1]] === undefined && autoBattle.items[b[0]][b[1]] !== undefined)
				return 1
				if(autoBattle.items[a[0]][a[1]] !== undefined && autoBattle.items[b[0]][b[1]] === undefined)
				return -1
				return 0;
			}
		}
		else if (autoBattle.items[a[0]].owned){
			return 1
		}
		else if(autoBattle.items[b[0]].owned){
			return -1
		}
		return 0
	},
	organize: function(){
		for(effect in this.itemEffects){
			var sorted = [];
			for (item in this.itemEffects[effect]){
				sorted.push([item, effect, this.itemEffects[effect][item]]);
			}
			sorted.sort(this.comparator).reverse();
			this.itemEffects[effect] = {};
			for(item in sorted){
				this.itemEffects[effect][sorted[item][0]] = (sorted[item][2])
			}
		}
	},
	generate: function(){
		enemyEffects = this.getEffects();
		this.numEquippable = autoBattle.getMaxItems();
		this.organize();
		for(item in autoBattle.items){
			autoBattle.items[item].equipped = false
		}
		autoBattle.resetCombat()
		// check if we're doing a farm or push build
		// only equip lifegiving gem on farm
		if(autoBattle.enemyLevel != autoBattle.maxEnemyLevel && autoBattle.items.Lifegiving_Gem.owned){
			autoBattle.equip("Lifegiving_Gem");
			this.equipped.push("Lifegiving_Gem");
			this.numEquipped++
		}
		if(this.bleedViable()){}

		autoBattle.popup();
	},
	bleedViable: function(){
		// Priority 1: Make a bleed build
		// Consider valid if bleed chance > 50%
		var chance = this.getEffectChance("bleed")
		if(chance - autoBattle.enemy.bleedResist > 50){
			this.equipBleedChance(100)
			// successfully got a 100% bleed build
			return true;
		}
		// Try adding another effect to double Rusty Dagger's chance of applying bleed
		// Prioritize Poison
		else if(chance - autoBattle.enemy.bleedResist > 50 - autoBattle.items.Rusty_Dagger.bleedChance() && this.getEffectChance("poison") - autoBattle.enemy.poisonResist > 50){
			this.equipPoisonChance(50)
			this.equipBleedChance(100)
			// Could not get a good bleed/poison build
			if(this.numEquipped == this.numEquippable && !autoBattle.items.Rusty_Dagger.equipped){
				this.unequip("bleedChance")
				this.unequip("poisonChance")
				return false
			}
			return true
		}
		// Try adding shock to increase Rusty Dagger's bleed chance
		else if(chance - autoBattle.enemy.bleedResist > 50 - autoBattle.items.Rusty_Dagger.bleedChance() && this.getEffectChance("shock") - autoBattle.enemy.ShockResist > 50){
			this.equipShockChance(50)
			this.equipBleedChance(100)
			if(this.numEquipped == this.numEquippable && !autoBattle.items.Rusty_Dagger.equipped){
				this.unequip("bleedChance")
				this.unequip("poisonChance")
				return false
			}
			return true

		}
		else
			return false
	},
	getEffectChance: function(type){
		var chance = 0;
		if(type == "bleed"){
			for(item in this.itemEffects.bleedChance){
				var count = autoBattle.getMaxItems() - this.numEquipped
				if(autoBattle.items[item].owned){
					chance += autoBattle.items[item].bleedChance()
					count--
				}
				if (!count){
					break
				}
			}
			return chance
		}
		if(type == "poison"){
			for(item in this.itemEffects.poisonChance){
				var count = autoBattle.getMaxItems() - this.numEquipped
				if(autoBattle.items[item].owned){
					chance += autoBattle.items[item].poisonChance()
					count--
				}
				if (!count){
					break
				}
			}
			return chance
		}	
		if(type == "shock"){
			for(item in this.itemEffects.shockChance){
				var count = autoBattle.getMaxItems() - this.numEquipped
				if(autoBattle.items[item].owned){
					chance += autoBattle.items[item].shockChance()
					count--
				}
				if (!count){
					break
				}
			}
			return chance
		}	
	},
	equipBleedChance: function(percent){
		if(autoBattle.items.Bag_of_Nails.owned){
			autoBattle.equip("Bag_of_Nails")
			this.equipped.push("Bag_of_Nails")
		}
		else if(autoBattle.items.Big_Cleaver.owned){
			autoBattle.equip("Big_Cleaver")
			this.equipped.push("Big_Cleaver")
		}
		else{
			autoBattle.equip("Rusty_Dagger")
			this.equipped.push("Rusty_Dagger")
		}
		this.numEquipped++
		for(item in this.itemEffects.bleedChance){
			if(autoBattle.items[item].owned && !autoBattle.items[item].equipped){
				autoBattle.equip(item)
				this.equipped.push(item)
				this.numEquipped++
			}
			if(this.numEquipped == this.numEquippable){
				return
			}
			if(autoBattle.trimp.bleedChance - autoBattle.enemy.bleedResist >= percent){
				return
			}
		}
	},
	equipPoisonChance: function(percent){
		if(autoBattle.items.Very_Large_Slime.owned){
			autoBattle.equip("Very_Large_Slime")
		}
		else if(autoBattle.items.Tame_Snimp.owned){
			autoBattle.equip("Tame_Snimp")
		}
		else{
			autoBattle.equip("Fists_of_Goo")
		}
		this.numEquipped++
		for(item in this.itemEffects.poisonChance){
			if(autoBattle.items[item].owned && !autoBattle.items[item].equipped){
				autoBattle.equip(item)
				this.equipped.push(item)
				this.numEquipped++
			}
			if(this.numEquipped == this.numEquippable){
				return
			}
			if(autoBattle.trimp.poisonChance - autoBattle.enemy.poisonResist >= percent){
				return
			}
		}
	},
	equipShockChance: function (percent){
		if(autoBattle.items.Shock_and_Awl.owned){
			autoBattle.equip("Shock_and_Awl")
		}
		else{
			autoBattle.equip("Battery_stick")
		}
		this.numEquipped++
		for(item in this.itemEffects.shockChance){
			if(autoBattle.items[item].owned && !autoBattle.items[item].equipped){
				autoBattle.equip(item)
				this.equipped.push(item)
				this.numEquipped++
			}
			if(this.numEquipped == this.numEquippable){
				return
			}
			if(autoBattle.trimp.shockChance - autoBattle.enemy.ShockResist >= percent){
				return
			}
		}		
	},
	unequip: function(type){
		console.log(this.equipped)
		while(this.itemEffects[type][this.equipped[this.equipped.length - 1]]){
			autoBattle.equip(this.equipped.pop())
			this.numEquipped--
		}
	}

}