<script id="tpl-item-info" type="text/x-dot-template">
<div id="item_info">
	<div>
	{if $item.type == Item.typeid('Weapon')}
		<span style="">{@$item.name} #{@$item.id}</span>
		<span style="">Weapon</span>
		<span style="">Lv. {@$item.level}</span>
		<span style="">Attack Rate(atks/sec)?</span>
		<span style="">Range {@$item.attack_range}</span>
		<span style="">Physical Attack {@$item.damage_low}-{@$item.damage_high}</span>
		<span style="">Magic Attack {@$item.magic_damage_low}-{@$item.magic_damage_high}</span>
		<span style="">Durability(drop) {@$item.durability_drop_min}-{@$item.durability_drop_max}</span>
		<span style="">Durability(craft) {@$item.durability_min}-{@$item.durability_max}</span>
		<span style="">Require Lv. {@$item.require_level}</span>
		<span style="">Require Strength {@$item.require_strength}</span>
		<span style="">Require Dexterity {@$item.require_dexterity}</span>
		<span style="">Require Magic {@$item.require_magic}</span>
		<span style="">Require Vitality {@$item.require_vitality}</span>
	{else}
		<span style="">{@$item.name}</span>
		<span style="">{@Item.types[$item.type].name}</span>
	{/if}
	</div>
</div>

TEMPLATE_END
<style>
#item_info {
	background-color: rgba(0, 0, 0, 0.9);
	border-radius: 3px;
	padding: 5px;
}

#item_info span {
	display: block;
}
</style>

</script>
