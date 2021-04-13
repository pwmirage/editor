<script id="tpl-item-info" type="text/x-dot-template">
{assign sanitize_f = (f) => Math.round(f * Math.pow(10, 5)) / Math.pow(10, 5)}

{* this can be used as an edit window, or as a plain tooltip div *}
<div class="window resizable" style="{if !$edit}display: none;{else}width: 365px;{/if}">
<div class="header">
	<span>
		Item: {@$item.name || ""} {@DB.serialize_id($item.id || 0)}
	</span>
	<div class="menu">
		<i class="details fa fa-ellipsis-v"></i>
	</div>
	<div class="menu">
		<i class="minimize fa" aria-hidden="true"></i>
		<i class="maximize fa" aria-hidden="true"></i>
		<i class="close fa fa-close" aria-hidden="true"></i>
	</div>
</div>
<div class="content" style="overflow: hidden; padding-right: 28px;">
<div id="item_info" class="item_info {if $edit}edit{/if}">
	{if !$edit}
		{assign data_preview = 'data-preview'}
	{else}
		{assign data_preview = ''}
	{/if}

	<div class="flex-columns" style="align-items: end;">
		{if $edit}
			<span class="item icon" ondblclick="{serialize $win}.select_icon();" oncontextmenu="{serialize $win}.icon_onclick(event, this); return false;" style="cursor: pointer;"><img{ } src="{@Item.get_icon($item.icon || 0)}"></span>
		{/if}
		<div style="flex: 1;">
			<span class="flex-columns" style="{if !$edit}font-size: 13px; margin-bottom: 3px;{/if}"><span {@$data_preview} data-input class="noalign" style="{if $edit}flex:1{/if}" data-link="{serialize $item} => 'name'"></span>&nbsp;&nbsp;#{@$item.id}&nbsp;</span>
			<span style="margin-top: -4px;">{@Item.types[$item.type]?.name || "Invalid item"}</span>
		</div>
	</div>

	{if $item.type == Item.typeid('Weapon')}
		{* ======== WEAPONS ========= *}
		<span style="">
			<span {@$data_preview} data-select="{serialize $db}.weapon_major_types" class="noalign" data-link="{serialize $item} => 'major_type'" data-title="Change weapon type of \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
			&nbsp;-&nbsp;
			<span {@$data_preview} data-select="{serialize $db}.weapon_minor_types" class="noalign" data-link="{serialize $item} => 'minor_type'" data-title="Change weapon subtype of \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
		</span>
		{if $edit || $item.character_combo_id}
			<span style="">Requisite Class <span {@$data_preview} data-input class="input-number" data-link="{serialize $item} => 'character_combo_id'"></span></span>
		{/if}

		<div class="section flex-rows">
			{if $edit}<span class="section-header">Base stats</span>{/if}
			<span style="">Lv. <span {@$data_preview} data-input class="input-number width-5c" data-link="{serialize $item} => 'level'"></span></span>
			<span style="">Attack Rate(atks/sec) {@($db.weapon_minor_types[$item.minor_type]?.attack_speed)?.toFixed(2) || "(unknown)"}</span>
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

		<div id="prereqs" class="section {if $edit}flex-all{/if}" style="width: 282px; flex-wrap: wrap;">
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
				<span style="line-height: 14px; {if $edit}margin-top: 3px; align-self: flex-start;{/if}">Sockets (drop):</span>
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
				<span style="line-height: 14px; {if $edit}margin-top: 3px; align-self: flex-start;{/if}">Sockets (craft):</span>
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
				<span style="line-height: 14px; {if $edit}margin-top: 3px; align-self: flex-start;{/if}">Addon num:</span>
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

		<div class="section flex-rows" style="{if $edit}overflow: auto;{/if}">
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
							<span data-select="{serialize $db}.equipment_addons" class="noalign" style="flex: 1;" data-link="{serialize $item} => 'addons', {@$idx}, 'id'" data-title="Choose addon for \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
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
						<span><span class="addon">{@$db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>
						{$idx++}
					{/for}
				{/if}
			</div>
		</div>

		{if $edit}
			<div class="section flex-rows" style="{if $edit}overflow: auto;{/if}">
				<span class="flex-columns section-header" style="width: 100%;">
					<span style="flex: 1;">Addons (craft)</span>
					<span style="width: 36px;">%</span>
				</span>

				<div id="rands" class="flex-rows" style="margin-top: 3px;">
						{assign idx = 0}
						{for idx = 0; idx < $item.rands.length; idx++}
							<div class="flex-columns">
								<span data-select="{serialize $db}.equipment_addons" class="noalign" style="flex: 1;" data-link="{serialize $item} => 'rands', {@$idx}, 'id'" data-title="Choose addon for \"{@$item.name || '(unnamed)'}\" #{@$item.id}"></span>
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
				{if $edit}
					<span class="flex-columns section-header" style="width: 100%;">
						<span style="flex: 1;">Unique addon</span>
						{if $edit}
							<span style="width: 36px;">%</span>
						{/if}
					</span>
				{/if}
				<div id="unique-addons" class="flex-rows" style="{if $edit}margin-top: 3px;{/if}">
					<span>
						Probability to have a unique addon&nbsp;
						{if $edit}
							<span {@$data_preview} data-input class="input-number is_float width-4c noalign" style="font-weight: bold;" oninput="this.style.color = '#' + calculate_middle_color('FF3300', '00FF00', Math.pow(-10 * parseFloat(this.textContent) - 0.4, -1) / 2.5 + 1)" data-link="{serialize $item} => 'probability_unique'"></span>
						{else}
							{assign prob = $item.probability_unique}
							{@ $prob < 0.05 ? $sanitize_f($prob * 100) : Math.round($prob * 1000) / 10}%
						{/if}
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
							<span><span class="addon">{@$db.equipment_addons[$addon.id]?.name || "(unknown #" + $addon.id + ")"}</span> ({@ $addon.prob < 0.05 ? $sanitize_f($addon.prob * 100) : Math.round($addon.prob * 1000) / 10}%)</span>
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
					{assign decomp = $db.items[$item.element_id || 0]}
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

		{if $edit || $item.desc?.replace(/\^[0-9a-fA-F]{6\}/g, '')?.replace(/[\n\s]/,'')}
			<div class="section flex-rows" style="{if $edit}min-height: 80px;{/if}">
				{if $edit}
					<span class="section-header">Description</span>
					<div class="pw-editable-color-text" data-editable-color-text data-link="{serialize $item} => 'desc'"></div>
				{else}
					<div id="desc" style="display: inline-block; white-space: pre-wrap;">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>
				{/if}
			</div>
		{/if}



	{else if $item.type == Item.typeid('Quest')}
		{* ======== QUEST ITEM ========= *}
		{if $edit}
			<span style="">Max stack: <span {@$data_preview} data-input class="input-number" data-link="{serialize $item} => 'pile_num_max'"></span></span>
		{/if}

		{if $edit || $item.desc?.replace(/\^[0-9a-fA-F]{6\}/g, '')?.replace(/[\n\s]/,'')}
			<div class="section flex-rows" style="{if $edit}min-height: 80px;{/if}">
				{if $edit}
					<span class="section-header">Description</span>
					<div class="pw-editable-color-text" data-editable-color-text data-link="{serialize $item} => 'desc'"></div>
				{else}
					<div id="desc" style="display: inline-block; white-space: pre-wrap;">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>
				{/if}
			</div>
		{/if}



	{else}
		{if $edit || $item.desc?.replace(/\^[0-9a-fA-F]{6\}/g, '')?.replace(/[\n\s]/,'')}
			<div class="section flex-rows" style="{if $edit}min-height: 80px;{/if}">
				{if $edit}
					<span class="section-header">Description</span>
					<div class="pw-editable-color-text" data-editable-color-text data-link="{serialize $item} => 'desc'"></div>
				{else}
					<div id="desc" style="display: inline-block; white-space: pre-wrap;">{@$item.desc?.replace(/\^([0-9a-fA-F]{6\})/g, '<span style="color: #\$1">') || ''}</div>
				{/if}
			</div>
		{/if}



	{/if}
</div>
</div>
</div>

{@@
<style>
#item_info {
	border-radius: 3px;
	padding: 5px;
	position: relative;
	writing-mode: vertical-lr;
	display: flex;
	align-content: flex-start;
	flex-wrap: wrap;
	margin-right: -4px;
	text-align: left;
}

#item_info:not(.edit) {
	background-color: rgba(0, 0, 0, 0.9);
}

#item_info.edit {
	overflow-x: auto;
	width: 100%;
	overflow-y: hidden;
}

#item_info > * {
	writing-mode: horizontal-tb;
	margin-right: 4px;
}

.item_info .section {
	width: 282px;
}

.item_info.edit .section {
	background-color: rgb(251 241 241);
	border: 1px solid #e0b0b0;
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
}

.item:focus {
	box-shadow: 0px 0px 4px 1px rgba(0,0,0,0.75);
	border: 1px solid var(--header-color);
	margin: -1px;
	outline: none;
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

#desc {
	margin-top: 16px;
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
