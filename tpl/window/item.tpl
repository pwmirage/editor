<script id="tpl-item-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

{assign edit = true}
<div id="item_info" class="item_info flex-rows {if $edit}edit{/if}" data-onload="const inputs = this.querySelectorAll('.input'); if ({@$edit}) \{ for (const input of inputs) \{ input.setAttribute('contenteditable', 'true'); input.textContent = input.value; }; setTimeout(() => align_dom(inputs, 25), 1); } else \{ for (const input of inputs) input.classList.remove('input'); }">

	{if $item.type == Item.typeid('Weapon')}
		{* ======== WEAPONS ========= *}
		<span class="flex-columns" style=""><span class="input text noalign" style="{if $edit}flex:1{/if}" data-link="{serialize $item} => 'name'"></span>&nbsp;&nbsp;#{@$item.id}&nbsp;</span>
		<span style="">Weapon - {@db.weapon_major_types[$item.major_type]?.name || "(unknown)"} - {@db.weapon_minor_types[$item.minor_type]?.name || "(unknown)"}</span>
		{if $edit || $item.character_combo_id}
			<span style="">Requisite Class <span class="input number" data-link="{serialize $item} => 'character_combo_id'"></span></span>
		{/if}
		<span style="">Lv. <span class="input number width-5c" data-link="{serialize $item} => 'level'"></span></span>
		<span style="">Attack Rate(atks/sec) {@(db.weapon_minor_types[$item.minor_type]?.attack_speed)?.toFixed(2) || "(unknown)"}</span>
		<span style="">Range <span class="input number width-5c" data-link="{serialize $item} => 'attack_range'"></span></span>
		{if $edit || $item.damage_high}
			<span style="">Physical Attack&nbsp;
				<span class="input number width-5c" data-link="{serialize $item} => 'damage_low'"></span>
				&nbsp;-&nbsp;
				<span class="input number width-5c noalign" data-link="{serialize $item} => 'damage_low'"></span>
			</span>
		{/if}

		{if $edit || $item.magic_damage_high}
			<span style="">Magic Attack&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
				<span class="input number width-5c" data-link="{serialize $item} => 'magic_damage_low'"></span>
				&nbsp;-&nbsp;
				<span class="input number width-5c noalign" data-link="{serialize $item} => 'magic_damage_low'"></span>
			</span>
		{/if}

		<span style="">Durability(drop)&nbsp;
			<span class="input number width-5c" data-link="{serialize $item} => 'durability_drop_min'"></span>
			&nbsp;-&nbsp;
			<span class="input number width-5c noalign" data-link="{serialize $item} => 'durability_drop_max'"></span>
		</span>
		{if $edit}
			<span style="">Durability(craft)&nbsp;
				<span class="input number width-5c" data-link="{serialize $item} => 'durability_min'"></span>
				&nbsp;-&nbsp;
				<span class="input number width-5c noalign" data-link="{serialize $item} => 'durability_max'"></span>
			</span>
		{/if}
		{if $edit || $item.require_level}<span style="">Requisite Lv. <span class="input number width-5c" data-link="{serialize $item} => 'require_level'"></span></span>{/if}
		{if $edit || $item.require_strength}<span style="">Requisite Strength <span class="input number width-5c" data-link="{serialize $item} => 'require_strength'"></span></span>{/if}
		{if $edit || $item.require_dexterity}<span style="">Requisite Dexterity <span class="input number width-5c" data-link="{serialize $item} => 'require_dexterity'"></span></span>{/if}
		{if $edit || $item.require_magic}<span style="">Requisite Magic <span class="input number width-5c" style="margin-left: 15px;" data-link="{serialize $item} => 'require_magic'"></span></span>{/if}
		{if $edit || $item.require_vitality}<span style="">Requisite Vitality <span class="input number width-5c" style="margin-left: 15px;" data-link="{serialize $item} => 'require_vitality'"></span></span>{/if}

		{if $edit}
			<div class="flex-columns" style="margin-top: 5px;">
				<span>Probabilities</span>
				<span style="flex: 1; margin-right: 0;"></span>
				{for i = 0; i < 4; i++}
					<span style="width: 42px;">{@$i}:</span>
				{/for}
			</div>
		{/if}

		<div id="sockets-drop" class="flex-columns">
			<span>Sockets(drop):</span>
			{if $edit}
				<span style="flex: 1; margin-right: 0;"></span>
				<div class="probs" style="">
					{for i = 0; i < 3; i++}
						<span class="input number is_float width-4c noalign" data-link="{serialize $item} => 'drop_socket_prob', {@$i}"></span>
					{/for}
					<span style="visibility: hidden;" class="input number is_float width-4c noalign" data-link="{serialize $item} => 'drop_socket_prob', 0"></span>
				</div>
			{else}
				{assign min = $item.drop_socket_prob?.findIndex((p) => p > 0)}
				{assign max = null}
				{for i = $item.drop_socket_prob?.length - 1; i >= 0; i--}
					{if $item.drop_socket_prob[i] > 0}
						{assign max = $i}
						{break}
					{/if}
				{/for}

				{assign min = $min >= 0 ? $min : 0}
				{assign max = $max >= 0 ? $max : 0}

				<span style="margin-left: -4px;">{@$min}{if $max != $min} - {@$max}{/if}</span>
			{/if}
		</div>

		<div id="sockets-craft" class="flex-columns">
			<span>Sockets(craft):</span>
			{if $edit}
				<span style="flex: 1; margin-right: 0;"></span>
				<div class="probs" style="">
					{for i = 0; i < 3; i++}
						<span class="input number is_float width-4c noalign" data-link="{serialize $item} => 'make_socket_prob', {@$i}"></span>
					{/for}
					<span style="visibility: hidden;" class="input number is_float width-4c noalign" data-link="{serialize $item} => 'make_socket_prob', 0"></span>
				</div>
			{else}
				{assign min = $item.make_socket_prob?.findIndex((p) => p > 0)}
				{assign max = null}
				{for i = $item.make_socket_prob?.length - 1; i >= 0; i--}
					{if $item.make_socket_prob[i] > 0}
						{assign max = $i}
						{break}
					{/if}
				{/for}

				{assign min = $min >= 0 ? $min : 0}
				{assign max = $max >= 0 ? $max : 0}

				<span style="margin-left: -4px;">{@$min}{if $max != $min} - {@$max}{/if}</span>
			{/if}
		</div>

		<div id="addon-num" class="flex-columns">
			<span>Addon num:</span>
			{if $edit}
				<span style="flex: 1; margin-right: 0;"></span>
				<div class="probs" style="">
					{for i = 0; i < 4; i++}
						<span class="input number is_float width-4c noalign" data-link="{serialize $item} => 'addon_num_prob', {@$i}"></span>
					{/for}
				</div>
			{else}
				{assign min = $item.addon_num_prob?.findIndex((p) => p > 0)}
				{assign max = null}
				{for i = $item.addon_num_prob?.length - 1; i >= 0; i--}
					{if $item.addon_num_prob[i] > 0}
						{assign max = $i}
						{break}
					{/if}
				{/for}

				{assign min = $min >= 0 ? $min : 0}
				{assign max = $max >= 0 ? $max : 0}

				<span style="margin-left: -4px;">{@$min}{if $max != $min} - {@$max}{/if}</span>
			{/if}
		</div>

		<hr style="width: 100%;">

		<div id="addons" class="flex-rows" style="margin-top: 3px;">
			{if $item.addon_num_prob?.length}
				<span>Addons:</span>

				{for addon of (($item.addons?.length ? $item.addons : $item.rands) || [])}
					<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>
				{/for}
			{/if}
		</div>

		<hr style="width: 100%;">

		<div id="unique-addons" class="flex-rows" style="margin-top: 3px;">
			{if $edit || $item.probability_unique}
				<span>Probability to have an unique addon <span class="input number is_float width-4c" data-link="{serialize $item} => 'probability_unique'"></span></span>
				{for addon of $item.uniques}
					{if !$addon.prob || !$addon.id}{continue}{/if}
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
			{assign min = $item.drop_socket_prob?.findIndex((p) => p > 0)}
			{assign max = null}
			{for i = $item.drop_socket_prob?.length - 1; i >= 0; i--}
				{if $item.drop_socket_prob[i] > 0}
					{assign max = $i}
					{break}
				{/if}
			{/for}

			{assign min = $min >= 0 ? $min : 0}
			{assign max = $max >= 0 ? $max : 0}

			<span>{@$min}</span>
			{if $max != $min}
				<span> - {@$max}</span>
			{/if}
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
	left: 0;
	width: 100%;
	height: 8px;
	background-image: linear-gradient(to bottom, rgba(255,0,0,0), rgba(0,0,0,1));
}

.probs {
	display: flex;
	flex-direction: row;
	margin-right: -4px;
	align-items: baseline;
}

.probs > span {
	font-weight: bold;
}

.probs > span.input {
	display: inline-block;
	margin-right: 4px !important;
}

.addon {
	color: #8080ff;
	font-weight: bold;
}

.width-5c,
.input.width-5c {
	width: 38px;
}

.width-4c,
.input.width-4c {
	width: 30px;
}

.item_info:not(.edit) .input {
}

.item_info.edit .input {
	margin: 2px 0;
	white-space: nowrap;
}

.item_info.edit span:not(.input) {
	display: flex;
	align-items: baseline;
	white-space: pre-wrap;
}

.flex-columns {
	align-items: baseline;
}
</style>
@@}

</script>
