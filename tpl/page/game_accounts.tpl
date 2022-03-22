<div class="section" style="margin-top: 30px;">
	<div class="info">Character lists are updated every hour. If you just created a new character it might not show up here yet.</div>

	<div id="accounts" style="display: flex; flex-direction: column; row-gap: 10px; margin-top: 20px;">
		{for acc of $page.accounts}
			<div class="account customSection">
				<div style="display: flex;">
					<div>
						<div class="header">{@$acc.name}</div>
						<div>Characters:</div>
					</div>
					<div style="flex: 1"></div>
					<div style="display: flex; flex-direction: column; row-gap: 5px;">
						<a class="button" style="display: none;" href="javascript:void(0);" onclick="{serialize $page}.show_details({@$acc.accountID});">Show details</a>
						<a class="button" style="" href="javascript:void(0);" onclick="{serialize $page}.change_pass({@$acc.id});">Change password</a>
					</div>
				</div>
				<div class="details">
					<div class="roles cooltable">
						{for role of $acc.roles}
							<div class="role" onclick="{serialize $page}.open_character({@$role.id});">
								<img class="class-icon" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
								<span class="name">{@$role.name}</span>
								<span class="class">{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. {@$role.level}</span>
								<span style="flex: 1;"></span>
								<span class="buttons"><i class="fa fa-ellipsis-h" style="font-size: 20px;"></i></span>
							</div>
						{/for}
						{if $acc.roles.length == 0}
							<div style="color: gray;">(None)</div>
						{/if}
					</div>
				</div>
			</div>
		{/for}
	</div>

	<div style="display: flex; margin-top: 15px;">
		<div style="flex: 1"></div>
		<a class="button buttonPrimary" style="" href="javascript:void(0);" onclick="{serialize $page}.register_acc();">Register new game account</a>
	</div>


	<div id="register_acc_dialogue" style="display: none;">
		<div>Username must be 4-32 characters long.</div>
		<div>Password must be 6-32 characters long</div>

		<div style="display: flex; align-items: baseline; margin-top: 25px;">
			<div style="width: 65px;">Name:</div>
			<input type="text" name="name" style="flex: 1;" autocomplete="off">
		</div>

		<div style="display: flex; align-items: baseline; margin-top: 10px;">
			<div style="width: 65px;">Pass:</div>
			<input type="password" name="pass" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
		</div>

		<div style="display: flex; align-items: flex-end; margin-top: 5px;">
			<div style="width: 65px; line-height: 15px;">Confirm pass:</div>
			<input type="password" name="pass2" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
		</div>
	</div>

	<div id="change_pass_dialogue" style="display: none;">
		{if $account}
			<div>Password must be 6-32 characters long</div>

			<div style="display: flex; align-items: baseline; margin-top: 10px;">
				<div style="width: 65px;">Name:</div>
				<input type="text" name="name" class="disabled" value="{@$account.name}" style="flex: 1;" autocomplete="off" readonly>
			</div>

			<div style="display: flex; align-items: baseline; margin-top: 10px;">
				<div style="width: 65px;">Pass:</div>
				<input type="password" name="pass" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
			</div>

			<div style="display: flex; align-items: flex-end; margin-top: 5px;">
				<div style="width: 65px; line-height: 15px;">Confirm pass:</div>
				<input type="password" name="pass2" style="flex: 1;" autocomplete="off" onfocus="this.readOnly = true; setTimeout(() => this.removeAttribute('readonly'), 1);">
			</div>
		{/if}
	</div>

	<div id="character_dialogue" style="display: none;">
		{if $account}
			<div style="display: flex; flex-direction: column;">
				<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
					<img style="width: 32px; height: 32px;" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
					<span style="width: 100px; font-weight: bold; font-size: 16px;">{@$role.name}</span>
					<span>
						<div>{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. <b>{@$role.level}</b></div>
						<div>In Faction: <b>{@$role.faction_name || '(None)'}</b></div>
					</span>
				</div>
				<div class="cooltable">
					<span style="margin-top: 16px; display: flex;">
						<span>Name:</span>
						<b>{@$role.name}</b>
						<span style="flex: 1;"></span>
						<a class="button" style="display: flex; flex-direction: column;" href="javascript:void(0);" onclick="{serialize $page}.change_name({@$role.id});">
							<span>Rename</span>
							<span style="font-size: 12px; margin-top: -3px;">(for {@$page.name_change_price} Vote points)</span>
						</a>
					</span>
					<span style="display: flex;">
						<span>Gender:</span>
						<b>{@$role.gender ? "Female" : "Male"}</b>
						<span style="flex: 1;"></span>
						<a class="button" style="display: flex; flex-direction: column;" href="javascript:void(0);" onclick="{serialize $page}.change_gender({@$role.id});">
							<span>Change to <b>{@!$role.gender ? "Female" : "Male"}</b></span>
							<span style="font-size: 12px; margin-top: -3px;">(for {@$page.gender_change_price} Vote points)</span>
						</a>
					</span>
				</div>
			</div>
		{/if}
		<style>
{@@
cooltable {
	display: flex;
	flex-direction: column;
	margin-left: 10px;
	margin-top: 10px;
}

.cooltable > * {
	display: flex;
	align-items: center;
	column-gap: 10px;
	padding: 4px;
	border-bottom: 1px solid rgba(224, 224, 224, 1);
}

.cooltable > *:nth-child(odd) {
	background-color: #f6f6f6;
}

.cooltable > *:last-child {
	border-bottom: none;
}

.cooltable > *:hover {
	background-color: #e8e8e8;
}
@@}
		</style>
	</div>

	<div id="change_gender" style="display: none;">
		{if $account}
			<div style="margin-bottom: 8px; display: flex; gap: 3px;">
				<span>You're about to change gender from</span>
				<b>{@$role.gender ? "Female" : "Male"}</b>
				<span>to</span>
				<b>{@!$role.gender ? "Female" : "Male"}</b>
				<span>on:</span>
			</div>
			<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
				<img style="width: 32px; height: 32px;" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
				<span style="width: 100px; font-weight: bold; font-size: 16px;">{@$role.name}</span>
				<span>
					<div>{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. <b>{@$role.level}</b></div>
					<div>In Faction: <b>{@$role.faction_name || '(None)'}</b></div>
				</span>
			</div>
			<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
				<span>This will cost you</span>
				<span class="price" style="font-weight: bold;">{@$page.gender_change_price}</span>
				<span>Vote Points</span>
			</div>

			<div style="margin-top: 2px;">You currently have <b>{@$page.vote_points}</b> Vote Points</div>
			<div style="margin-top: 2px;">You will have <b class="remaining">{@$page.vote_points - $page.gender_change_price}</b> Vote Points remaining after this purchase.</div>

			{if $page.vote_points < $page.gender_change_price}
				<div class="wrning" style="margin-top: 8px;"><span style="color: red; font-weight: bold;">You don't have enough points.</span></div>
			{/if}
		{/if}
	</div>

	<div id="change_name" style="display: none;">
		{if $account}
			<div style="margin-bottom: 8px; display: flex; gap: 3px;">
				<span>You're about to rename:</span>
			</div>
			<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
				<img style="width: 32px; height: 32px;" src="{@ROOT_URL + 'img/class/' + $role.class + '.png'}">
				<span style="width: 100px; font-weight: bold; font-size: 16px;">{@$role.name}</span>
				<span>
					<div>{@GameUtil.classes[$role.class]?.name || 'Unknown Class'} Lv. <b>{@$role.level}</b></div>
					<div>In Faction: <b>{@$role.faction_name || '(None)'}</b></div>
				</span>
			</div>
			<div style="margin-top: 8px; display: flex; column-gap: 5px; align-items: center;">
				<span>This will cost you</span>
				<span class="price" style="font-weight: bold;">{@$page.name_change_price}</span>
				<span>Vote Points</span>
			</div>

			<div style="margin-top: 2px;">You currently have <b>{@$page.vote_points}</b> Vote Points</div>
			<div style="margin-top: 2px;">You will have <b class="remaining">{@$page.vote_points - $page.name_change_price}</b> Vote Points remaining after this purchase.</div>

			{assign enableinput = true}
			{if $page.vote_points < $page.name_change_price}
				<div class="wrning" style="margin-top: 8px;"><span style="color: red; font-weight: bold;">You don't have enough points.</span></div>
				{$enableinput = false};
			{else if $errmsg}
				<div class="wrning" style="margin-top: 8px;"><span style="color: red; font-weight: bold;">{@$errmsg}</span></div>
			{/if}

			<div style="display: flex; align-items: baseline; margin-top: 10px;">
				<div style="width: 65px;">Name:</div>
		<input type="text" name="name" value="{@$prevname}" class="{if !$enableinput}disabled{/if}" style="flex: 1;" autocomplete="off" if {if !$enableinput}readonly{/if}>
			</div>
		{/if}
	</div>
</div>

{@@
<style>
.account {
	padding: 20px;
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

.cooltable {
	display: flex;
	flex-direction: column;
	margin-left: 10px;
	margin-top: 10px;
}

.cooltable > * {
	display: flex;
	align-items: center;
	column-gap: 10px;
	padding: 4px;
	border-bottom: 1px solid rgba(224, 224, 224, 1);
}

.cooltable > *:nth-child(odd) {
	background-color: #f6f6f6;
}

.cooltable > *:last-child {
	border-bottom: none;
}

.cooltable > *:hover {
	background-color: #e8e8e8;
}

.role {
	cursor: pointer;
}

.role .name {
	width: 140px;
}

.role .class {
	width: 160px;
}

.role .faction {
	width: 160px;
}

.role .buttons {
	padding-right: 10px;
	display: flex;
	gap: 5px;
}

@media only screen and (max-width: 800px) {
	.role .buttons {
		display: none;
	}
}

.role .class-icon {
	width: 36px;
	height: 36px;
	object-fit: contain;
}

.customSection {
	border: 1px solid rgba(236, 241, 247, 1);
	background-color: rgba(255, 255, 255, 1);
	padding: 20px;
}
</style>
@@}
