var generator = {
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
		var enemyEffects = this.getEffects();
		var numEquippable = autoBattle.getMaxItems();
		var numEquipped = 0;
		console.log(enemyEffects)
		this.organize();

	}
}