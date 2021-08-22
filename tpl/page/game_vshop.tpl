<script id="tpl-game-vshop" type="text/x-dot-template">
<div class="section" style="margin-top: 0;">
<div style="display: flex;">
<div>
	<div style="display: flex; flex-direction: column;">
		<div style="padding: 0 20px; margin-top: 10px;">
			{if $page.accounts.length}
				<div id="account-balance" style="margin-bottom: 8px;">You have <b>{@$page.vote_points}</b> Vote Points</div>
			{/if}
			<div style="margin-bottom: 10px; font-size: 20px;">Target Character:</div>
			<div style="display: flex; column-gap: 10px; align-items: baseline;">
				<span>Search:</span>
				<input type="text" id="rolesearch" oninput="{serialize $page}.onrolesearch_input(event, this)" style="flex: 1; margin-bottom: 4px;" autocomplete="off" tabindex="1"></input>
			</div>
		</div>

		<div id="accounts" style="width: 396px;">
			{for acc of $page.accounts}
				{assign roles = $page.role_search_val ? $acc.roles.filter(r => r.name.toLowerCase().includes($page.role_search_val)) : $acc.roles}
				{if $page.role_search_val && $roles.length == 0}
					{continue}
				{/if}

				<div class="account">
					<div style="display: flex;">
						<div>
							<div class="header">{@$acc.name}</div>
						</div>
					</div>
					<div class="details">
						<div class="roles">
							{for role of $roles}
								<div class="role {if $page.selected_role_id == $role.id}selected{/if}" onclick="{serialize $page}.select_role(this, {@$role.id})">
									<img class="class-icon" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
									<span class="name">{@$role.name}</span>
									<span class="class">{@GameUtil.classes[$role.class]?.shortname || 'Unknown Class'} Lv. {@$role.level}</span>
								</div>
							{/for}
							{if $acc.roles.length == 0}
								<div style="color: gray;">(None)</div>
							{/if}
						</div>
					</div>
				</div>
			{/for}
			{if $page.accounts.length == 0}
				<div>Please register a game account first</div>
			{/if}
		</div>
	</div>
</div>
<div style="flex:1;">
	<div id="chooser" class="chooser">
		<div class="categories">
			{for t in $page.tabs}
				<div onclick="{serialize $page}.select_tab('{@$t}')" class="{if $page.cur_tab == $t}selected{/if}">{@$t}</div>
			{/for}
		</div>
	</div>

	<div class="customSection" style="background: #f4f4f4; border: 1px solid #dadce0; border-top: none;">
		<div style="display: flex; column-gap: 10px; align-items: baseline; margin-bottom: 10px;">
			<span>Search:</span>
			<input type="text" id="search" oninput="{serialize $page}.onsearch_input(event, this)" style="flex: 1; margin-bottom: 4px;" autocomplete="off" tabindex="1"></input>
		</div>

		<div id="page" class="page">
			{assign t = $page.tabs[$page.cur_tab]}
			{for r of $t}
				<div class="item-entry" onclick="{serialize $page}.buy_item({@$r.id}, {@$r.cost});">
					<span class="num">{@$r.cost} x <b>VP</b> = </span>
					<span class="item" data-id="{@$r.id}"><img{ } src="{@Item.get_icon($r.icon)}"></span>
					<span class="name">{@$r.name}</span>
				</div>
			{/for}

		</div>
	</div>
</div>
</div>

<div id="buy_dialogue" style="display: none;">
	{if $item && $role}
		<div style="margin-bottom: 8px;">You're about to buy:</div>
		<div style="margin-bottom: 8px; display: flex; column-gap: 5px; align-items: center;">
			<input type="number" name="amount" value="1" style="width: 60px;" autocomplete="off">
			<span>x</span>
			<span class="item" data-id="{@$item.id}"><img{ } src="{@Item.get_icon($item.icon)}"></span>
			<span style="font-weight: bold;">{@$item.name}</span>
			<div style="flex: 1;"></div>
			<span>for</span>
			<span class="price" style="font-weight: bold;">{@$item.cost}</span>
			<span>Vote Points</span>
		</div>
		<div style="margin-top: 12px;">It will be mailed to:</div>
		<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
			<img style="width: 32px; height: 32px;" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
			<span style="width: 100px; font-weight: bold; font-size: 16px;">{@$role.name}</span>
			<span>
				<div>{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. <b>{@$role.level}</b></div>
				<div>In Faction: <b>{@$role.faction_name || '(None)'}</b></div>
			</span>
		</div>

		<div style="margin-top: 8px;">You currently have <b>{@$page.vote_points}</b> Vote Points</div>
		<div style="margin-top: 2px;">You will have <b class="remaining">{@($page.vote_points - $item.cost)}</b> Vote Points remaining after this purchase.</div>

		{if $item.req_level}
			<div style="margin-top: 8px; {if $item.req_level > $role.level} color: red; font-weight: bold;{/if}">This item can be only bought for Lv. {@$item.req_level}+ characters.</div>
		{/if}


		<div class="wrning" style="margin-top: 8px;">The item will be character bound.</div>
	{/if}
</div>
</div>

{@@
<style>
.chooser {
	padding-top: 0;
	padding-bottom: 0;
	border-bottom: 1px solid #dadce0;
}

.categories {
	display: flex;
	column-gap: 10px;
}

.categories > * {
	padding: 10px 18px;
	border: 1px solid #dadce0;
	margin-bottom: -1px;
	background: #eaeaea;
	cursor: pointer;
}

.categories > *:hover {
	border: 1px solid #aaaca0;
	background: #dadada;
}

.categories > .selected {
	background: #f4f4f4;
	border-bottom: none;
}

.item {
	display: inline-block;
	width: 32px;
	height: 32px;
}

.page {
	display: flex;
	flex-wrap: wrap;
	column-gap: 10px;
	row-gap: 8px;
}

.item-entry {
	display: flex;
	column-gap: 10px;
	align-items: center;
	background: white;
	box-shadow: 0px 0px 2px 0px rgb(0 0 0 / 10%);
	padding: 8px 10px;
	min-width: 285px;
	max-width: 285px;
	flex: 1;
	cursor: pointer;
}

.item-entry:hover {
	background: #eaeaea;
}

.item-entry > .num {
	white-space: pre;
	display: block;
	width: 65px;
	margin-right: -5px;
}

.item-entry > .name {
	flex: 1;
	font-weight: bold;
	margin-left: -5px;
	line-height: 16px;
 }

.account {
	padding: 5px 20px;
	display: flex;
	flex-direction: column;
}

.account > .details {
	display: flex;
	flex-direction: column;
}

.account .header {
	font-size: 18px;
}

.account > .details > .roles {
	display: flex;
	flex-direction: column;
	margin-left: 10px;
	margin-top: 10px;
}

.role {
	display: flex;
	align-items: center;
	column-gap: 10px;
	padding: 4px;
	border: 1px solid transparent;
	border-bottom: 1px solid rgba(224, 224, 224, 1);
	user-select: none;
	cursor: pointer;
}

.role:nth-child(odd) {
	background-color: #f6f6f6;
}

.role:last-child {
	border-bottom: none;
}

.role:hover {
	background-color: #e8e8e8;
}

.role.selected {
	background-color: #f6e0e0;
	border: 1px dashed #000;
	outline: none;
}

.role .name {
	width: 110px;
}

.role .class {
	width: 110px;
}

.role .class-icon {
	width: 22px;
	height: 22px;
}

.customSection {
	border: 1px solid rgba(236, 241, 247, 1);
	background-color: rgba(255, 255, 255, 1);
	padding: 20px;
}
</style>
@@}
</script>
