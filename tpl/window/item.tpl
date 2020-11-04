<script id="tpl-item-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

<div class="window">
<div class="content">
{* dummy *}
</div>
</div>

<div id="item_info" class="item_info {if $edit}edit{/if}" data-onload="">
	{if !$edit}
		{assign data_preview = 'data-preview'}
	{else}
		{assign data_preview = ''}
	{/if}

	{if $item.type == Item.typeid('Weapon')}
		{* ======== WEAPONS ========= *}
		<span class="flex-columns" style=""><span {@$data_preview} data-input class="noalign" style="{if $edit}flex:1{/if}" data-link="{serialize $item} => 'name'"></span>&nbsp;&nbsp;#{@$item.id}&nbsp;</span>
			<span {@$data_preview} data-select="Item.types" class="noalign" style="width: 175px;" data-link="{serialize $item} => 'type'" data-title="Change item type of \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
		<span style="">
			<span {@$data_preview} data-select="db.weapon_major_types" class="noalign" data-link="{serialize $item} => 'major_type'" data-title="Change weapon type of \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
			&nbsp;-&nbsp;
			<span {@$data_preview} data-select="db.weapon_minor_types" class="noalign" data-link="{serialize $item} => 'minor_type'" data-title="Change weapon subtype of \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
		</span>
		{if $edit || $item.character_combo_id}
			<span style="">Requisite Class <span {@$data_preview} data-input class="input-number" data-link="{serialize $item} => 'character_combo_id'"></span></span>
		{/if}

		<div class="section flex-rows">
			{if $edit}<span class="section-header">Base stats</span>{/if}
			<span style="">Lv. <span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'level'"></span></span>
			<span style="">Attack Rate(atks/sec) {@(db.weapon_minor_types[$item.minor_type]?.attack_speed)?.toFixed(2) || "(unknown)"}</span>
			<span style="">Range <span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'attack_range'"></span></span>
			{if $edit || $item.damage_high}
				<span style="">Physical Attack&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'damage_low'"></span>
					&nbsp;-&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'damage_low'"></span>
				</span>
			{/if}

			{if $edit || $item.magic_damage_high}
				<span style="">Magic Attack&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'magic_damage_low'"></span>
					&nbsp;-&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'magic_damage_low'"></span>
				</span>
			{/if}

			<span style="">Durability{if $edit}(drop){/if}&nbsp;
				<span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'durability_drop_min'"></span>
				&nbsp;-&nbsp;
				<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'durability_drop_max'"></span>
			</span>
			{if $edit}
				<span style="">Durability(craft)&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'durability_min'"></span>
					&nbsp;-&nbsp;
					<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'durability_max'"></span>
				</span>
			{/if}
		</div>

		<div id="prereqs" class="section flex-all" style="flex-wrap: wrap;">
			{if $edit}<span class="section-header" style="width: 140px;">Prerequisites</span>{/if}
			{if $edit || $item.require_level}<span style="">{if $edit}&nbsp;{else}Requisite {/if}Lv. {if $edit}<span class="fill"></span>{/if}<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'require_level'"></span></span>{/if}
			{if $edit || $item.require_vitality}<span style="">{if !$edit}Requisite {/if}Vitality {if $edit}<span class="fill"></span>{/if}<span {@$data_preview} data-input class="input-number width-5c noalign" style="" data-link="{serialize $item} => 'require_vitality'"></span></span>{/if}
			{if $edit || $item.require_magic}<span style="">{if !$edit}Requisite {/if}Magic {if $edit}<span class="fill"></span>{/if}<span {@$data_preview} data-input class="input-number width-5c noalign" style="" data-link="{serialize $item} => 'require_magic'"></span></span>{/if}
			{if $edit || $item.require_strength}<span style="">{if !$edit}Requisite {/if}Strength {if $edit}<span class="fill"></span>{/if}<span {@$data_preview} data-input class="input-number width-5c noalign" style="" data-link="{serialize $item} => 'require_strength'"></span></span>{/if}
			{if $edit || $item.require_dexterity}<span style="margin-right: 10px;">{if !$edit}Requisite {/if}Dexterity {if $edit}<span class="fill"></span>{/if}<span {@$data_preview} data-input class="input-number width-5c noalign" data-link="{serialize $item} => 'require_dexterity'"></span></span>{/if}
		</div>

		<div class="section flex-rows">
			<span class="section-header">Addons</span>
			{if $edit}
				<div class="flex-columns" style="margin-top: 5px;">
					<span>%</span>
					<span style="flex: 1; margin-right: 0;"></span>
					{for i = 0; i < 4; i++}
						<span style="width: 42px;">{@$i}:</span>
					{/for}
				</div>
			{/if}

			<div id="sockets-drop" class="flex-columns">
				<span style="line-height: 14px; margin-top: 3px; align-self: flex-start;">Sockets (drop):</span>
				{if $edit}
					<span style="flex: 1; margin-right: 0;"></span>
					<div class="probs" style="">
						{for i = 0; i < 3; i++}
							<span data-input class="input-number is_float width-4c noalign" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'drop_socket_prob', {@$i}"></span>
						{/for}
						<span style="align-self: end; visibility: hidden;" class="input input-number is_float width-4c noalign"></span>
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
				<span style="line-height: 14px; margin-top: 3px; align-self: flex-start;">Sockets (craft):</span>
				{if $edit}
					<span style="flex: 1; margin-right: 0;"></span>
					<div class="probs" style="">
						{for i = 0; i < 3; i++}
							<span data-input class="input-number is_float width-4c noalign" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'make_socket_prob', {@$i}"></span>
						{/for}
						<span style="align-self: end; visibility: hidden;" class="input input-number is_float width-4c noalign"></span>
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
				<span style="line-height: 14px; margin-top: 3px; align-self: flex-start;">Addon num:</span>
				{if $edit}
					<span style="flex: 1; margin-right: 0;"></span>
					<div class="probs" style="">
						{for i = 0; i < 4; i++}
							<span data-input class="input-number is_float width-4c noalign" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'addon_num_prob', {@$i}"></span>
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
		</div>

		<div class="section flex-rows">
			<span class="flex-columns section-header" style="width: 100%;">
				{if $edit}
					<span style="flex: 1;">Addons{if $edit} (drop){/if}</span>
					<span style="width: 36px;">%</span>
				{/if}
			</span>

			<div id="addons" class="flex-rows" style="{if $edit}margin-top: 3px;{/if}">
				{if $edit}
					{assign idx = 0}
					{for idx = 0; idx < $item.addons.length; idx++}
						<div class="flex-columns">
							<span data-select="db.equipment_addons" class="noalign" style="flex: 1;" data-link="{serialize $item} => 'addons', {@$idx}, 'id'" data-title="Choose addon for \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
							<span data-input class="input-number is_float width-4c noalign" style="font-weight: bold; margin-left: 4px;" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'addons', {@$idx}, 'prob'"></span>
						</div>
					{/for}

					<div class="flex-columns" style="margin-top: 3px;">
						<span style="flex: 1;"></span>
						<a class="button no-break" onclick="{serialize $win}.recycle_addons('drop');">(recycle) <i class="fa fa-recycle"></i></a>
						<a class="button no-break" onclick="{serialize $win}.add_addon('drop');">(add) <i class="fa fa-plus"></i></a>
					</div>
				{else if $item.addon_num_prob?.length}
					{assign arr = ($item.addons?.length ? $item.addons : $item.rands) || []}
					{assign idx = 0}
					{for addon of $arr}
						{if !$addon.prob || !$addon.id}{continue}{/if}
						{if $idx >= 6}
							<span style="font-weight: bold;">... and {@$arr.length - $idx} more</span>
							{break}
						{/if}
						<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>
						{$idx++}
					{/for}
				{/if}
			</div>
		</div>

		{if $edit}
			<div class="section flex-rows">
				<span class="flex-columns section-header" style="width: 100%;">
					<span style="flex: 1;">Addons (craft)</span>
					<span style="width: 36px;">%</span>
				</span>

				<div id="rands" class="flex-rows" style="margin-top: 3px;">
						{assign idx = 0}
						{for idx = 0; idx < $item.rands.length; idx++}
							<div class="flex-columns">
								<span data-select="db.equipment_addons" class="noalign" style="flex: 1;" data-link="{serialize $item} => 'rands', {@$idx}, 'id'" data-title="Choose addon for \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
								<span data-input class="input-number is_float width-4c noalign" style="font-weight: bold; margin-left: 4px;" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'rands', {@$idx}, 'prob'"></span>
							</div>
						{/for}

						<div class="flex-columns" style="margin-top: 3px;">
							<span style="flex: 1;"></span>
							<a class="button no-break" onclick="{serialize $win}.recycle_addons('craft');">(recycle) <i class="fa fa-recycle"></i></a>
							<a class="button no-break" onclick="{serialize $win}.add_addon('drop');">(add) <i class="fa fa-plus"></i></a>
						</div>
				</div>
			</div>
		{/if}

		{if $edit || $item.probability_unique}
			<div class="section flex-rows">
				<span class="flex-columns section-header" style="width: 100%;">
					<span style="flex: 1;">Unique addon</span>
					{if $edit}
						<span style="width: 36px;">%</span>
					{/if}
				</span>
				<div id="unique-addons" class="flex-rows" style="{if $edit}margin-top: 3px;{/if}">
					<span>
						Probability to have a unique addon&nbsp;
						<span data-input class="input-number is_float width-4c noalign" style="font-weight: bold;" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'probability_unique'"></span>
					</span>
					{if $edit}
						<div id="uniques" class="flex-rows" style="margin-top: 3px;">
								{assign idx = 0}
								{for idx = 0; idx < $item.uniques.length; idx++}
									<div class="flex-columns">
										<span data-select="db.equipment_addons" class="noalign" style="flex: 1;" data-link="{serialize $item} => 'uniques', {@$idx}, 'id'" data-title="Choose addon for \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
										<span data-input class="input-number is_float width-4c noalign" style="font-weight: bold; margin-left: 4px;" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'uniques', {@$idx}, 'prob'"></span>
									</div>
								{/for}

								<div class="flex-columns" style="margin-top: 3px;">
									<span style="flex: 1;"></span>
									<a class="button no-break" onclick="{serialize $win}.recycle_addons('uniques');">(recycle) <i class="fa fa-recycle"></i></a>
									<a class="button no-break" onclick="{serialize $win}.add_addon('uniques');">(add) <i class="fa fa-plus"></i></a>
								</div>
						</div>
					{else}
						{assign idx = 0}
						{for addon of $item.uniques}
							{if !$addon.prob || !$addon.id}{continue}{/if}
							{if $idx >= 6}
								<span style="font-weight: bold;">... and {@$item.uniques.length - $idx} more</span>
								{break}
							{/if}
							<span><span class="addon">{@db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>
							{$idx++}

						{/for}
					{/if}
				</div>
			</div>
		{/if}

		<div class="section flex-rows">
			<span class="flex-columns section-header"></span>

			<span style="margin-top: 3px;">Price&nbsp;
				{if $edit}
					<span data-input class="input-number width-5c" style="margin-left: 30px;" data-link="{serialize $item} => 'price'"></span>
				{else}
					<span>{@('' + $item.price).replace(/(\d)(?=(\d{3\})+\$)/g, '\$1,')}</span>
				{/if}
			</span>

			{if $edit}
				<span style="">Buy Price&nbsp;
					<span data-input class="input-number width-5c" data-link="{serialize $item} => 'shop_price'"></span>
				</span>

				<span style="margin-top: 5px;">Repair Fee&nbsp;
					<span data-input class="input-number width-5c" style="margin-left: -5px;" data-link="{serialize $item} => 'repairfee'"></span>
				</span>
			{/if}

			{if $edit}
				<div id="decompose" class="flex-columns" style="align-items: center; margin-top: 3px;">
					<span style="white-space: nowrap;">Decompose to </span>
					{assign decomp = db.items[$item.element_id || 0]}
					<span class="item" ondblclick="{serialize $win}.select_decomp();" tabindex="0"><img{ } src="{if $item.element_id}{@Item.get_icon($decomp?.icon || 0)}{else}{@ROOT_URL + 'img/itemslot.png'}{/if}"></span>

					x&nbsp;<span {@$data_preview} data-input class="input-number width-3c" style="" data-link="{serialize $item} => 'element_num'"></span>
				</div>
				<div class="flex-columns" style="margin-top: 3px;">
					<span style="">Decomp. time&nbsp;
						<span data-input class="input-number width-3c" style="" data-link="{serialize $item} => 'decompose_time'"></span>
						&nbsp;s
					</span>
					<span style="flex: 1;"></span>
					<span style="">Price&nbsp;
						<span data-input class="input-number width-5c" style="" data-link="{serialize $item} => 'decompose_price'"></span>
					</span>
				</div>
			{/if}
		</div>

		<div class="section flex-rows">
			{if $edit}
				<span class="section-header">Description</span>
				<div class="pw-editable-color-text" data-editable-color-text data-link="{serialize $item} => 'desc'"></div>
			{else}
				<div id="desc" style="display: inline-block; white-space: pre-wrap;">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>
			{/if}
		</div>



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
	max-height: 700px;
	//overflow: hidden;
	position: relative;
	writing-mode: vertical-lr;
	display: flex;
	align-content: flex-start;
	flex-wrap: wrap;
	margin-right: -4px;
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

#item_info > * {
	writing-mode: horizontal-tb;
	margin-right: 4px;
}

.item_info.edit .section {
	width: 282px;
	background-color: rgba(255, 255, 255, 0.1);
	padding: 6px;
	padding-left: 14px;
	padding-right: 14px;
	margin-top: 4px;
}

.item_info.edit .section-header {
	margin-left: -6px;
	font-weight: bold;
	align-self: end;
}

.item_info #prereqs {
	display: flex;
	flex-direction: column;
}

.item_info.edit #prereqs {
	flex-direction: row;
}

.item_info #prereqs > * {
	margin-right: 10px;
}

.item_info.edit #prereqs > *:not(.section-header) {
	text-align: right;
	justify-content: flex-end;
}

.fill {
	display: inline-block;
	margin: auto;
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

.item {
	position: relative;
	width: 32px;
	height: 32px;
	padding-right: 1px;
}

.item:focus {
	box-shadow: 0px 0px 10px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin: -1px;
	outline: none;
	padding-right: 0;
}

.item:focus:after {
	content: ' ';
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	background-color: var(--header-color);
	opacity: 0.4;
}

.item > img {
	user-select: none;
}

#desc > span {
	display: inline-block;
}

.width-5c,
.input.width-5c {
	width: 38px;
}

.width-4c,
.input.width-4c {
	width: 30px;
}

.width-3c,
.input.width-3c {
	width: 22px;
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
