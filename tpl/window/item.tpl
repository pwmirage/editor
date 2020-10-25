<script id="tpl-item-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div id="item_info" class="flex-rows">

	{if $item.type == Item.typeid('Weapon')}
		{* ======== WEAPONS ========= *}
		<span style="">{@$item.name} #{@$item.id}</span>
		<span style="">Weapon - {@db.weapon_major_types[$item.major_type]?.name || "(unknown)"} - {@db.weapon_minor_types[$item.minor_type]?.name || "(unknown)"}</span>
		{if $item.character_combo_id != 255}<span style="">Requisite Class {@$item.character_combo_id}</span>{/if}
		<span style="">Lv. {@$item.level}</span>
		<span style="">Attack Rate(atks/sec) {@(db.weapon_minor_types[$item.minor_type]?.attack_speed)?.toFixed(2) || "(unknown)"}</span>
		<span style="">Range {@$item.attack_range}</span>
		{if $item.damage_low}<span style="">Physical Attack {@$item.damage_low}-{@$item.damage_high}</span>{/if}
		{if $item.magic_damage_low}<span style="">Magic Attack {@$item.magic_damage_low}-{@$item.magic_damage_high}</span>{/if}
		<span style="">Durability(drop) {@$item.durability_drop_min}-{@$item.durability_drop_max}</span>
		<span style="">Durability(craft) {@$item.durability_min}-{@$item.durability_max}</span>
		{if $item.require_level}<span style="">Require Lv. {@$item.require_level}</span>{/if}
		{if $item.require_strength}<span style="">Require Strength {@$item.require_strength}</span>{/if}
		{if $item.requite_dexterity}<span style="">Require Dexterity {@$item.require_dexterity}</span>{/if}
		{if $item.requite_magic}<span style="">Require Magic {@$item.require_magic}</span>{/if}
		{if $item.require_vitality}<span style="">Require Vitality {@$item.require_vitality}</span>{/if}

		<div id="sockets-drop" class="flex-columns">
			<span>Sockets(drop):</span>
			<span style="flex: 1;"></span>
			<div class="probs">
				{for i = 2; i >= 0; i--}
					{assign prob = $item.drop_socket_prob[i] || 0}
					<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
				{/for}
			</div>
		</div>

		<hr style="width: 100%;">

		<div id="sockets-craft" class="flex-columns">
			<span>Sockets(craft):</span>
			<span style="flex: 1;"></span>
			<div class="probs">
				{for i = 2; i >= 0; i--}
					{assign prob = $item.make_socket_prob[i] || 0}
					<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
				{/for}
			</div>
		</div>

		<hr style="width: 100%;">

		<div id="addons" class="flex-rows" style="margin-top: 3px;">
			{if $item.addon_num_prob?.length}
				{assign i = 0}
				<div class="flex-columns">
					<span>Addons:</span>
					<span style="flex: 1;"></span>
					<div class="probs">
						{assign probs_s = $item.addon_num_prob.sort()}
						{for i = 3; i >= 0; i--}
							{assign prob = $item.addon_num_prob[$i] || 0}
							<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
						{/for}
					</div>
				</div>

				{for addon of (($item.addons?.length ? $item.addons : $item.rands) || [])}
					<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>

				{/for}
			{/if}
		</div>

		<hr style="width: 100%;">

		<div id="unique-addons" class="flex-rows" style="margin-top: 3px;">
			{if $item.probability_unique}
				<span>Probability to have an unique addon <b>{@$sanitize_f($item.probability_unique * 100)}%</b></span>
				{for addon of $item.uniques}
					{if !$addon.prob}{continue}{/if}
					<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>

				{/for}
			{/if}
		</div>

		<span style="margin-top: 3px;">Price {@('' + $item.price).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
		<span style="">Buy Price {@('' + $item.shop_price).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>

		<span style="margin-top: 5px;">Repair Fee {@('' + $item.repairfee).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
		<span style="">Mirages per refine {@$item.mirages_to_refine || '(none)'}</span>

		{if $item.element_id && $item.element_num}
			<div class="flex-columns">
				<span style="">Decompose to </span>
				<span style="flex: 1;"></span>
				<span style="">{@db.items[$item.element_id || 0]?.name || '(unknown)'} #{@$item.element_id} x{@$item.element_num}</span>
			</div>
			<div class="flex-columns">
				<span style="">Decompose time {@$item.decompose_time || 0}s</span>
				<span style="flex: 1;"></span>
				<span style="">Price {@('' + ($item.decompose_price || 0)).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
			</div>
		{/if}

		<div id="desc" style="">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>



	{else if $item.type == Item.typeid('Armor')}
		{* ======== ARMORS ========= *}
		<span style="">{@$item.name} #{@$item.id}</span>
		<span style="">Armor - {@db.armor_major_types[$item.major_type]?.name || "(unknown)"} - {@db.armor_minor_types[$item.minor_type]?.name || "(unknown)"}</span>
		{if $item.character_combo_id != 255}<span style="">Requisite Class {@$item.character_combo_id}</span>{/if}
		<span style="">Lv. {@$item.level}</span>
		{if $item.defence_high}<span style="">Phys. Res.: {@$item.defence_low} - {@$item.defence_high}</span>{/if}
		{if $item.magic_def?.find(e => e?.high > 0)}
			{assign el_names = [ 'Metal', 'Wood', 'Water', 'Fire', 'Earth' ]}
			{assign i = 0}
			{for el of $item.magic_def}
				<span style="">{@$el_names[$i]} Resistance {@$el.low} - {@$el.high}</span>
				{$i++}
			{/for}
		{/if}
		{if $item.hp_enhance_high}<span style="">HP +{@$item.hp_enhance_low} - {@$item.hp_enhance_high}</span>{/if}
		{if $item.mp_enhance_high}<span style="">MP +{@$item.mp_enhance_low} - {@$item.hp_enhance_low}</span>{/if}
		<span style="">Durability(drop) {@$item.durability_drop_min}-{@$item.durability_drop_max}</span>
		<span style="">Durability(craft) {@$item.durability_min}-{@$item.durability_max}</span>
		{if $item.require_level}<span style="">Requisite Lv. {@$item.require_level}</span>{/if}
		{if $item.require_strength}<span style="">Requisite Strength {@$item.require_strength}</span>{/if}
		{if $item.requite_dexterity}<span style="">Requisite Dexterity {@$item.require_dexterity}</span>{/if}
		{if $item.requite_magic}<span style="">Requisite Magic {@$item.require_magic}</span>{/if}
		{if $item.require_vitality}<span style="">Requisite Vitality {@$item.require_vitality}</span>{/if}

		<div id="sockets-drop" class="flex-columns">
			<span>Sockets(drop):</span>
			<span style="flex: 1;"></span>
			<div class="probs">
				{for i = 4; i >= 0; i--}
					{assign prob = $item.drop_socket_prob[i] || 0}
					<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
				{/for}
			</div>
		</div>

		<hr style="width: 100%;">

		<div id="sockets-craft" class="flex-columns">
			<span>Sockets(craft):</span>
			<span style="flex: 1;"></span>
			<div class="probs">
				{for i = 4; i >= 0; i--}
					{assign prob = $item.make_socket_prob[i] || 0}
					<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
				{/for}
			</div>
		</div>

		<hr style="width: 100%;">

		<div id="addons" class="flex-rows" style="margin-top: 3px;">
			{if $item.addon_num_prob?.length}
				{assign i = 0}
				<div class="flex-columns">
					<span>Addons:</span>
					<span style="flex: 1;"></span>
					<div class="probs">
						{assign probs_s = $item.addon_num_prob.sort()}
						{for i = 3; i >= 0; i--}
							{assign prob = $item.addon_num_prob[$i] || 0}
							<span style="color: #{@calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * $prob - 0.4, -1) / 2.5 + 1)}">{@$i}: {@$sanitize_f($prob * 100)}%</span>
						{/for}
					</div>
				</div>

				{for addon of (($item.addons?.length ? $item.addons : $item.rands) || [])}
					<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>

				{/for}
			{/if}
		</div>

		<hr style="width: 100%;">

		<div id="unique-addons" class="flex-rows" style="margin-top: 3px;">
			{if $item.probability_unique}
				<span>Probability to have an unique addon <b>{@$sanitize_f($item.probability_unique * 100)}%</b></span>
				{for addon of $item.uniques}
					{if !$addon.prob}{continue}{/if}
					<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>

				{/for}
			{/if}
		</div>

		<span style="margin-top: 3px;">Price {@('' + $item.price).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
		<span style="">Buy Price {@('' + $item.shop_price).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>

		<span style="margin-top: 5px;">Repair Fee {@('' + $item.repairfee).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
		<span style="">Mirages per refine {@$item.mirages_to_refine || '(none)'}</span>

		{if $item.element_id && $item.element_num}
			<div class="flex-columns">
				<span style="">Decompose to </span>
				<span style="flex: 1;"></span>
				<span style="">{@db.items[$item.element_id || 0]?.name || '(unknown)'} #{@$item.element_id} x{@$item.element_num}</span>
			</div>
			<div class="flex-columns">
				<span style="">Decompose time {@$item.decompose_time || 0}s</span>
				<span style="flex: 1;"></span>
				<span style="">Price {@('' + ($item.decompose_price || 0)).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
			</div>
		{/if}

		<div id="desc" style="">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>
	{else}
		<span style="">{@$item.name} #{@$item.id}</span>
		<span style="">{@Item.types[$item.type].name}</span>
	{/if}
</div>

{@@
<style>
#item_info {
	background-color: rgba(0, 0, 0, 0.9);
	border-radius: 3px;
	padding: 5px;
	max-width: 310px;
	max-height: 700px;
	overflow: hidden;
	position: relative;
}

#item_info:after {
	content: ' ';
	position: absolute;
	bottom: 0;
	width: 100%;
	height: 8px;
	background-image: linear-gradient(to bottom, rgba(255,0,0,0), rgba(0,0,0,1));
}

.probs {
	display: flex;
	flex-direction: column;
	width: auto;
}

.probs > span {
	font-weight: bold;
	text-align: right;
}

.addon {
	color: #8080ff;
	font-weight: bold;
}
</style>
@@}

</script>
