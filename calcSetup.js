var generator = {
	effects: [],
	// left off at Fearsome Piercer
	AttackTimeDown:{
		Menacing_Mask:{},
		Putrid_Pouch:{isPoisoned: true},
		Labcoat:{CanPoison: true},
		Mood_Bracelet:{NotBleeding:true},
		Shock_and_Awl:{NotShocked:true},
		Spiked_Gloves:{},
		Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
		Eelimp_in_a_Bottle:{isShock:true},
		Sundering_Scythe:{},
		Sacrificial_Shank:{}
	},
	AttackTimeUp:{
		Menacing_Mask:{},
		Wired_Wristguards:{isShocked:true},
		Bloodstained_Gloves:{},
	},
	AttackUp:{
		Sword:{},
		Rusty_Dagger:{CanBleed:true},
		Shock_and_Awl:{},
		Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
		Sword_and_Board:{},
		Bloodstained_Gloves:{},
		Unlucky_Coin:{},
		Eelimp_in_a_Bottle:{GetsShocked:true},
		Big_Cleaver:{isBleeding:true},
		Metal_Suit:{ItemCanBleed:true},
		Sundering_Scythe:{},
		Monkimp_Paw:{},
		Grounded_Crown:{},
	},
	HPUp:{
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
	},
	BloodLetting:{
		Rusty_Dagger:{},
		Big_Cleaver:{},
	},
	BleedDamage:{
		Rusty_Dagger:{},
		Raincoat:{CanBleed: true},
		Big_Cleaver:{},
	},
	BleedChance:{
		Rusty_Dagger:{},
		Bad_Medkit:{},
		Bloodstained_Gloves:{},
		Big_Cleaver:{},
	},
	Poisoning:{
		Fists_of_Goo:{},
		Tame_Snimp:{},
		Very_Large_Slime:{},
	},
	PoisonDamage:{
		Fists_of_Goo:{},
		Labcoat:{CanPoison: true},
		Tame_Snimp:{},
		Bilious_Boots:{},
		The_Globulator:{},
		Plague_Bringer:{},
		Very_Large_Slime:{},
	},
	PoisonChance:{
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
	ShockDamage:{
		Battery_Stick:{},
		Shock_and_Awl:{},
		Aegis:{HighHP:true},
		Eelimp_in_a_Bottle:{},
		Grounded_Crown:{},
	},
	ShockChance:{
		Battery_Stick:{},
		Shock_and_Awl:{},
		Wired_Wristguards:{},
		Aegis:{HighHP:true},
		Eelimp_in_a_Bottle:{},
	},
	DefenseUp:{
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
	},
	Lifesteal:{
		Raincoat:{CanBleed: true},
		Bad_Medkit:{isBleeding: true},
		Recycler:{},
		Shock_and_Awl:{isShocked: true},
		Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
		Aegis:{LowHP:true},
		Unlucky_Coin:{NotPoisoned:true, NotBleeding:true},
		Sundering_Scythe:{},
		Sacrificial_Shank:{},
	},
	PoisonStacks:{
		Chemistry_Set:{},
		Bilious_Boots:{},
		Nozzled_Goggles:{},
		Very_Large_Slime:{},
	},
	PoisonTime:{
		Putrid_Pouch:{}
	},
	BleedTime:{
		Bad_Medkit:{}
	},
	PoisonResist:{
		Comfy_Boots:{},
		Wired_Wristguards:{},
		Sword_and_Board:{},
		Bilious_Boots:{},
		Nozzled_Goggles:{},
		Sacrificial_Shank:{}
	},
	BleedResists:{
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
	DustUp:{
		Lifegiving_Gem:{}
	},
	PoisonHeal:{
		Hungering_Mold:{},
		The_Globulator:{OnPoisonStack: true},
		Plague_Bringer:{},
	},
	PoisonTick:{
		Hungering_Mold:{},
		Plague_Bringer:{},
	},
	AttackDown:{
		Tame_Snimp:{isPoisoned:true},
	},
	DamageDown:{
		Lich_Wraps:{poisoned:true,shocked:true,bleeding:true},
	},
	ShockTime:{
		Aegis:{HighHP:true},
	},
	AttackDown:{
		Bloodstained_Gloves:{},
	},
	AlwaysShocked:{
		Nozzled_Goggles:{}
	},
	ReapplyBleed:{
		Sundering_Scythe:{},
	},
	IncreaseStrongestEffectChance:{
		Sacrificial_Shank:{}
	},
	YouLoseHP:{
		Grounded_Crown:{isPoisoned:true, isBleeding:true},
	},
	getEffects: function (){
		effects = autoBattle.profile.split(', ')
	}

}